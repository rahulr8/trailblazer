import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { isHealthKitAvailableAsync, initHealthKit } from "./config";
import { syncHealthWorkouts } from "./sync";

function isHealthKitAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Authorization not determined") ||
    message.includes("authorization denied") ||
    message.includes("Code=5")
  );
}

async function clearHealthConnection(uid: string): Promise<void> {
  const { error } = await supabase
    .from("health_connections")
    .delete()
    .eq("user_id", uid);
  if (error) throw error;
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
  isAutoSync: boolean;
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
  const [isAutoSync, setIsAutoSync] = useState(false);
  const hasAutoSynced = useRef(false);

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

  // Fetch health connection status from Supabase
  useEffect(() => {
    if (!uid) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    async function fetchConnection() {
      const { data, error } = await supabase
        .from("health_connections")
        .select()
        .eq("user_id", uid!)
        .maybeSingle();

      if (error) {
        console.error("[Health] Failed to fetch connection:", error);
        setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnected: !!data?.is_authorized,
        lastSyncAt: data?.last_sync_at ? new Date(data.last_sync_at) : null,
      }));
    }

    fetchConnection();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`health_connections:${uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "health_connections",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setState((prev) => ({
              ...prev,
              isConnected: false,
              lastSyncAt: null,
            }));
          } else {
            const row = payload.new as Record<string, unknown>;
            setState((prev) => ({
              ...prev,
              isConnected: !!row.is_authorized,
              lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at as string) : null,
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid]);

  // Auto-sync when app opens and already connected
  useEffect(() => {
    if (!uid || !state.isConnected || state.isLoading || hasAutoSynced.current) {
      return;
    }

    hasAutoSynced.current = true;
    setIsAutoSync(true);
    setState((prev) => ({ ...prev, isSyncing: true }));

    console.log("[Health] App opened with active connection, starting auto-sync...");
    syncHealthWorkouts(uid)
      .then((result) => {
        console.log("[Health] Auto-sync complete:", result);
        setState((prev) => ({ ...prev, isSyncing: false }));
        setIsAutoSync(false);
      })
      .catch(async (error) => {
        console.error("[Health] Auto-sync failed:", error);
        setState((prev) => ({ ...prev, isSyncing: false }));
        setIsAutoSync(false);

        if (isHealthKitAuthError(error)) {
          console.log("[Health] Authorization lost, disconnecting...");
          try {
            await clearHealthConnection(uid);
            Alert.alert(
              "Apple Health Disconnected",
              "HealthKit authorization was revoked. Please reconnect to continue syncing workouts.",
            );
          } catch (disconnectError) {
            console.error("[Health] Failed to disconnect after auth error:", disconnectError);
          }
        }
      });
  }, [uid, state.isConnected, state.isLoading]);

  useEffect(() => {
    if (!state.isConnected) {
      hasAutoSynced.current = false;
    }
  }, [state.isConnected]);

  const connect = useCallback(async () => {
    console.log("[Health] connect() called, uid:", uid);

    if (!uid) {
      const errorMsg = "Must be logged in";
      setState((prev) => ({ ...prev, error: errorMsg }));
      Alert.alert("Connection Failed", errorMsg);
      return;
    }

    if (Platform.OS !== "ios") {
      const errorMsg = "Apple Health is only available on iOS";
      setState((prev) => ({ ...prev, error: errorMsg }));
      Alert.alert("Connection Failed", errorMsg);
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await initHealthKit();

      const { error: upsertError } = await supabase.from("health_connections").upsert(
        {
          user_id: uid,
          is_authorized: true,
          connected_at: new Date().toISOString(),
          last_sync_at: null,
        },
        { onConflict: "user_id" },
      );
      if (upsertError) throw upsertError;

      console.log("[Health] Connection saved successfully");
      setState((prev) => ({ ...prev, isConnected: true, lastSyncAt: null }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to connect";
      console.error("[Health] Connect error:", error);
      setState((prev) => ({ ...prev, error: errorMsg }));
      Alert.alert("Apple Health Connection Failed", errorMsg);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [uid]);

  const disconnect = useCallback(async () => {
    console.log("[Health] disconnect() called, uid:", uid);

    if (!uid) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await clearHealthConnection(uid);
      console.log("[Health] Disconnected successfully");
      setState((prev) => ({ ...prev, isConnected: false, lastSyncAt: null }));
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

    if (!uid || !state.isConnected) return 0;

    if (Platform.OS !== "ios") {
      setState((prev) => ({ ...prev, error: "Apple Health is only available on iOS" }));
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
        try {
          await clearHealthConnection(uid);
          Alert.alert(
            "Apple Health Disconnected",
            "HealthKit authorization was revoked. Please reconnect to continue syncing workouts.",
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
    isAutoSync,
    connect,
    disconnect,
    sync,
  };
}
