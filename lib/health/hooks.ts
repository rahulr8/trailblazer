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
  const isSyncingRef = useRef(false);

  // Shared sync runner. `silent` = no UI feedback (for background auto-sync).
  const runSync = useCallback(async (userId: string, silent: boolean): Promise<number> => {
    if (isSyncingRef.current) return 0;
    isSyncingRef.current = true;

    if (!silent) {
      setState((prev) => ({ ...prev, isSyncing: true, error: null }));
    }

    try {
      const result = await syncHealthWorkouts(userId);
      console.log("[Health] Sync complete:", result);
      return result.syncedCount;
    } catch (error) {
      console.error("[Health] Sync failed:", error);

      if (isHealthKitAuthError(error)) {
        console.log("[Health] Authorization lost, disconnecting...");
        try {
          await clearHealthConnection(userId);
          Alert.alert(
            "Apple Health Disconnected",
            "HealthKit authorization was revoked. Please reconnect to continue syncing workouts.",
          );
        } catch (disconnectError) {
          console.error("[Health] Failed to disconnect after auth error:", disconnectError);
        }
      } else if (!silent) {
        const errorMsg = error instanceof Error ? error.message : "Failed to sync";
        setState((prev) => ({ ...prev, error: errorMsg }));
        Alert.alert("Sync Failed", errorMsg);
      }

      return 0;
    } finally {
      isSyncingRef.current = false;
      if (!silent) {
        setState((prev) => ({ ...prev, isSyncing: false }));
      }
    }
  }, []);

  // Check HealthKit availability (iOS only)
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

  // Fetch health connection status from Supabase + subscribe to changes
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
            setState((prev) => ({ ...prev, isConnected: false, lastSyncAt: null }));
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

  // Silent background sync when hook mounts with an existing connection
  useEffect(() => {
    if (!uid || !state.isConnected || state.isLoading || hasAutoSynced.current) {
      return;
    }

    hasAutoSynced.current = true;
    console.log("[Health] Background auto-sync on mount...");
    runSync(uid, true);
  }, [uid, state.isConnected, state.isLoading, runSync]);

  // Reset auto-sync guard when disconnected
  useEffect(() => {
    if (!state.isConnected) {
      hasAutoSynced.current = false;
    }
  }, [state.isConnected]);

  const connect = useCallback(async () => {
    if (!uid) {
      setState((prev) => ({ ...prev, error: "Must be logged in" }));
      Alert.alert("Connection Failed", "Must be logged in");
      return;
    }

    if (Platform.OS !== "ios") {
      setState((prev) => ({ ...prev, error: "Apple Health is only available on iOS" }));
      Alert.alert("Connection Failed", "Apple Health is only available on iOS");
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

      console.log("[Health] Connection saved, starting sync...");
      hasAutoSynced.current = true;
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        lastSyncAt: null,
      }));

      await runSync(uid, false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to connect";
      console.error("[Health] Connect error:", error);
      setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
      Alert.alert("Apple Health Connection Failed", errorMsg);
    }
  }, [uid, runSync]);

  const disconnect = useCallback(async () => {
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
    if (!uid || !state.isConnected) return 0;
    if (Platform.OS !== "ios") {
      setState((prev) => ({ ...prev, error: "Apple Health is only available on iOS" }));
      return 0;
    }
    return runSync(uid, false);
  }, [uid, state.isConnected, runSync]);

  return {
    ...state,
    isAvailable,
    connect,
    disconnect,
    sync,
  };
}
