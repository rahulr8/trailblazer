import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HealthConnection } from "@/lib/db/types";
import { isHealthKitAvailableAsync, initHealthKit } from "./config";
import { syncHealthWorkouts } from "./sync";

// Detect HealthKit authorization errors
function isHealthKitAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Authorization not determined") ||
    message.includes("authorization denied") ||
    message.includes("Code=5")
  );
}

// Clear health connection from Firestore
async function clearHealthConnection(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    healthConnection: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

interface HealthConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;
}

interface UseHealthConnectionReturn extends HealthConnectionState {
  isAvailable: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<number>;
}

export function useHealthConnection(uid: string | null): UseHealthConnectionReturn {
  const [state, setState] = useState<HealthConnectionState>({
    isConnected: false,
    isLoading: true,
    isSyncing: false,
    lastSyncAt: null,
    error: null,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const hasAutoSynced = useRef(false);

  // Check HealthKit availability on mount (iOS only)
  useEffect(() => {
    if (Platform.OS !== "ios") {
      setIsAvailable(false);
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    isHealthKitAvailableAsync()
      .then(setIsAvailable)
      .catch(() => setIsAvailable(false));
  }, []);

  // Listen to Firestore for connection status
  useEffect(() => {
    if (!uid) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        const data = snapshot.data();
        const connection = data?.healthConnection as HealthConnection | undefined;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: !!connection?.isAuthorized,
          lastSyncAt: connection?.lastSyncAt?.toDate() || null,
        }));
      },
      (error) => {
        console.error("[Health] Connection listener error:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load Apple Health connection status",
        }));
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // Auto-sync when app opens and already connected
  useEffect(() => {
    if (!uid || !state.isConnected || state.isLoading || hasAutoSynced.current) {
      return;
    }

    hasAutoSynced.current = true;
    setState((prev) => ({ ...prev, isSyncing: true }));

    console.log("[Health] App opened with active connection, starting auto-sync...");
    syncHealthWorkouts(uid)
      .then((result) => {
        console.log("[Health] Auto-sync complete:", result);
        setState((prev) => ({ ...prev, isSyncing: false }));
      })
      .catch(async (error) => {
        console.error("[Health] Auto-sync failed:", error);
        setState((prev) => ({ ...prev, isSyncing: false }));

        if (isHealthKitAuthError(error)) {
          console.log("[Health] Authorization lost, disconnecting...");
          try {
            await clearHealthConnection(uid);
            console.log("[Health] Disconnected due to authorization loss");
            Alert.alert(
              "Apple Health Disconnected",
              "HealthKit authorization was revoked. Please reconnect to continue syncing workouts."
            );
          } catch (disconnectError) {
            console.error("[Health] Failed to disconnect after auth error:", disconnectError);
          }
        }
      });
  }, [uid, state.isConnected, state.isLoading]);

  // Reset auto-sync flag when disconnected
  useEffect(() => {
    if (!state.isConnected) {
      hasAutoSynced.current = false;
    }
  }, [state.isConnected]);

  const connect = useCallback(async () => {
    console.log("[Health] connect() called, uid:", uid);

    if (!uid) {
      const errorMsg = "Must be logged in";
      console.log("[Health] Connect failed:", errorMsg);
      setState((prev) => ({ ...prev, error: errorMsg }));
      Alert.alert("Connection Failed", errorMsg);
      return;
    }

    if (Platform.OS !== "ios") {
      const errorMsg = "Apple Health is only available on iOS";
      console.log("[Health] Connect failed:", errorMsg);
      setState((prev) => ({ ...prev, error: errorMsg }));
      Alert.alert("Connection Failed", errorMsg);
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    console.log("[Health] Starting HealthKit initialization...");

    try {
      await initHealthKit();
      console.log("[Health] HealthKit initialized, saving to Firestore...");

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        healthConnection: {
          isAuthorized: true,
          connectedAt: serverTimestamp(),
          lastSyncAt: null,
        },
        updatedAt: serverTimestamp(),
      });

      console.log("[Health] Connection saved to Firestore successfully");
      // Auto-sync effect will handle the initial sync when isConnected becomes true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to connect";
      console.error("[Health] Connect error:", error);
      setState((prev) => ({
        ...prev,
        error: errorMsg,
      }));
      Alert.alert("Apple Health Connection Failed", errorMsg);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [uid]);

  const disconnect = useCallback(async () => {
    console.log("[Health] disconnect() called, uid:", uid);

    if (!uid) {
      console.log("[Health] Disconnect skipped - no uid");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await clearHealthConnection(uid);
      console.log("[Health] Disconnected successfully");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to disconnect";
      console.error("[Health] Disconnect error:", error);
      setState((prev) => ({ ...prev, error: errorMsg }));
      Alert.alert("Disconnect Failed", errorMsg);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [uid]);

  const sync = useCallback(async (): Promise<number> => {
    console.log("[Health] sync() called, uid:", uid, "isConnected:", state.isConnected);

    if (!uid || !state.isConnected) {
      console.log("[Health] Sync skipped - not connected");
      return 0;
    }

    if (Platform.OS !== "ios") {
      const errorMsg = "Apple Health is only available on iOS";
      console.log("[Health] Sync failed:", errorMsg);
      setState((prev) => ({ ...prev, error: errorMsg }));
      return 0;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const result = await syncHealthWorkouts(uid);
      console.log("[Health] Sync completed:", result);
      return result.syncedCount;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to sync";
      console.error("[Health] Sync error:", error);

      if (isHealthKitAuthError(error)) {
        console.log("[Health] Authorization lost during sync, disconnecting...");
        try {
          await clearHealthConnection(uid);
          Alert.alert(
            "Apple Health Disconnected",
            "HealthKit authorization was revoked. Please reconnect to continue syncing workouts."
          );
        } catch (disconnectError) {
          console.error("[Health] Failed to disconnect after auth error:", disconnectError);
        }
      } else {
        setState((prev) => ({ ...prev, error: errorMsg }));
        Alert.alert("Sync Failed", errorMsg);
      }
      return 0;
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [uid, state.isConnected]);

  return {
    ...state,
    isAvailable,
    connect,
    disconnect,
    sync,
  };
}
