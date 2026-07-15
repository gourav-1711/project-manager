import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { SharedItem } from "@workspace/types";

type ServerStatus = "stopped" | "starting" | "running" | "error";

interface ShareState {
  status: ServerStatus;
  url: string | null;
  error: string | null;
  items: SharedItem[];
}

/**
 * Hook for managing the mobile share HTTP server.
 *
 * - Start/stop the axum server via Tauri commands
 * - Listen for `new-shared-item` events from the Rust backend
 * - Expose received items as a reactive list
 */
export function useSharedItems() {
  const [state, setState] = useState<ShareState>({
    status: "stopped",
    url: null,
    error: null,
    items: [],
  });
  const unlistenRef = useRef<(() => void) | null>(null);

  // Subscribe to Tauri events on mount
  useEffect(() => {
    let cancelled = false;

    listen<SharedItem>("new-shared-item", (event) => {
      if (cancelled) return;
      // The Rust struct uses #[serde(rename_all = "camelCase")], so
      // event.payload directly matches the TS SharedItem interface.
      setState((prev) => ({
        ...prev,
        items: [event.payload, ...prev.items],
      }));
    }).then((unlisten) => {
      if (cancelled) {
        unlisten();
      } else {
        unlistenRef.current = unlisten;
      }
    });

    return () => {
      cancelled = true;
      unlistenRef.current?.();
    };
  }, []);

  const start = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "starting", error: null }));
    try {
      const url = await invoke<string>("start_share_server");
      setState((prev) => ({ ...prev, status: "running", url }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: String(err),
      }));
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await invoke("stop_share_server");
    } catch {
      // Ignore stop errors — server may already be gone
    }
    setState({ status: "stopped", url: null, error: null, items: [] });
  }, []);

  const clearItems = useCallback(() => {
    setState((prev) => ({ ...prev, items: [] }));
  }, []);

  return {
    ...state,
    start,
    stop,
    clearItems,
  };
}
