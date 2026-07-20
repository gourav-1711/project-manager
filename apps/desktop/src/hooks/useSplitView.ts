import { useCallback, useSyncExternalStore } from "react";
import type { SplitConfig } from "@workspace/types";
import { DEFAULT_SPLIT_CONFIG } from "@workspace/types";

const STORAGE_KEY = "app-split-config";

/* ── Persistence helpers ── */

function loadAll(): Record<string, SplitConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted
  }
  return {};
}

function saveAll(map: Record<string, SplitConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/* ── External store (subscribable, for useSyncExternalStore) ── */

let store = loadAll();
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Record<string, SplitConfig> {
  return store;
}

function emit() {
  for (const cb of listeners) cb();
}

/* ── Mutations ── */

function get(tabId: string): SplitConfig {
  return store[tabId] ?? { ...DEFAULT_SPLIT_CONFIG };
}

function patch(tabId: string, next: SplitConfig) {
  store = { ...store, [tabId]: next };
  saveAll(store);
  emit();
}

/* ── Hook ── */

export function useSplitView(tabId: string) {
  const allConfigs = useSyncExternalStore(subscribe, getSnapshot);
  const config: SplitConfig = allConfigs[tabId] ?? { ...DEFAULT_SPLIT_CONFIG };

  const toggleSplit = useCallback(() => {
    const cur = get(tabId);
    const next: SplitConfig = {
      ...cur,
      active: !cur.active,
      position: cur.active ? cur.position : 50,
    };
    patch(tabId, next);
  }, [tabId]);

  const setSplitPosition = useCallback(
    (pct: number) => {
      const cur = get(tabId);
      const clamped = Math.max(20, Math.min(80, pct));
      patch(tabId, { ...cur, position: clamped });
    },
    [tabId],
  );

  const setSecondaryType = useCallback(
    (content: "home" | "project") => {
      const cur = get(tabId);
      patch(tabId, { ...cur, secondaryContent: content });
    },
    [tabId],
  );

  const setSecondaryProject = useCallback(
    (projectId: string) => {
      const cur = get(tabId);
      patch(tabId, {
        ...cur,
        secondaryContent: "project",
        secondaryProjectId: projectId,
      });
    },
    [tabId],
  );

  const closeSplit = useCallback(() => {
    const cur = get(tabId);
    patch(tabId, { ...cur, active: false });
  }, [tabId]);

  return {
    isSplit: config.active,
    direction: config.direction,
    position: config.position,
    secondaryContent: config.secondaryContent,
    secondaryProjectId: config.secondaryProjectId,
    toggleSplit,
    setSplitPosition,
    setSecondaryType,
    setSecondaryProject,
    closeSplit,
  };
}
