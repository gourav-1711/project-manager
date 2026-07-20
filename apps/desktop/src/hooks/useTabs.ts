import { useCallback, useEffect, useState } from "react";
import type { Tab, Project } from "@workspace/types";
import { MAX_TABS } from "@workspace/types";

const STORAGE_KEY = "app-tabs";

/* ── Build a tab for a project ── */

function projectTab(project: Project): Tab {
  return {
    id: `project-${project.id}`,
    type: "project",
    projectId: project.id,
    label: project.name,
    subtitle: project.path,
  };
}

const HOME_TAB: Tab = {
  id: "home",
  type: "home",
  label: "Home",
};

/* ── Persistence ── */

function load(): Tab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Tab[] = JSON.parse(raw);
      // Ensure home tab exists
      if (!parsed.some((t) => t.id === "home")) {
        parsed.unshift({ ...HOME_TAB });
      }
      return parsed;
    }
  } catch {
    // corrupted
  }
  return [{ ...HOME_TAB }];
}

function save(tabs: Tab[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}

/* ── Hook ── */

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>(load);
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    // Restore last active tab from sessionStorage (so it survives refreshes)
    try {
      return sessionStorage.getItem("app-active-tab-id") ?? "home";
    } catch {
      return "home";
    }
  });

  // Persist tabs on every change
  useEffect(() => {
    save(tabs);
  }, [tabs]);

  // Persist active tab
  useEffect(() => {
    sessionStorage.setItem("app-active-tab-id", activeTabId);
  }, [activeTabId]);

  /** Get the currently active tab object. */
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? HOME_TAB;

  /** Open a project tab (or switch to it if already open). */
  const openProject = useCallback((project: Project) => {
    const tabId = `project-${project.id}`;

    setTabs((prev) => {
      const existing = prev.find((t) => t.id === tabId);
      if (existing) {
        // Already open — just switch to it
        setActiveTabId(tabId);
        return prev;
      }

      const newTab = projectTab(project);

      // Insert after home tab (index 1)
      const next = [...prev];
      next.splice(1, 0, newTab);

      // Enforce max tabs
      if (next.length > MAX_TABS) {
        // Evict the least-recently-used non-home, non-active tab
        const activeId = activeTabId;
        const evictIndex = next.findIndex(
          (t) => t.id !== "home" && t.id !== activeId,
        );
        if (evictIndex > 0) next.splice(evictIndex, 1);
      }

      setActiveTabId(tabId);
      return next;
    });
  }, [activeTabId]);

  /** Open the home tab. */
  const openHome = useCallback(() => {
    setActiveTabId("home");
  }, []);

  /** Switch to a tab by ID. */
  const setActive = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  /** Close a tab. If it's the active tab, fall back to another. */
  const closeTab = useCallback(
    (id: string) => {
      // Never close the home tab
      if (id === "home") return;

      setTabs((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index < 0) return prev;

        const next = prev.filter((t) => t.id !== id);

        // If we closed the active tab, activate the nearest neighbor
        if (activeTabId === id) {
          const newIndex = Math.min(index, next.length - 1);
          setActiveTabId(next[newIndex]?.id ?? "home");
        }

        return next;
      });
    },
    [activeTabId],
  );

  /** Close all non-home tabs. */
  const closeOtherTabs = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id === "home" || t.id === id);
        if (!next.find((t) => t.id === activeTabId)) {
          setActiveTabId(id);
        }
        return next;
      });
    },
    [activeTabId],
  );

  /** Close all tabs except home. */
  const closeAllTabs = useCallback(() => {
    setTabs([{ ...HOME_TAB }]);
    setActiveTabId("home");
  }, []);

  return {
    tabs,
    activeTab,
    activeTabId,
    openProject,
    openHome,
    setActive,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
  };
}
