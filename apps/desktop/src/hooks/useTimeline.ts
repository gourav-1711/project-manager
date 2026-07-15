import { useCallback, useEffect, useState } from "react";
import {
  getTimelineItems,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
} from "@workspace/db";
import type {
  CreateTimelineItemInput,
  TimelineItem,
  TimelineStatus,
  UpdateTimelineItemInput,
} from "@workspace/types";
import { toast } from "sonner";

/** Central hook for a project's timeline. Loads on mount, no polling. */
export function useTimeline(projectId: string | null) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getTimelineItems(id));
    } catch (err) {
      setError(String(err));
      toast.error("Failed to load timeline", { description: String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) reload(projectId);
    else {
      setItems([]);
      setError(null);
    }
  }, [projectId, reload]);

  const add = useCallback(
    async (input: Omit<CreateTimelineItemInput, "projectId">) => {
      if (!projectId) throw new Error("No project selected");
      const created = await createTimelineItem({ ...input, projectId });
      setItems((prev) => {
        const idx = prev.findIndex(
          (t) => t.startDate > created.startDate,
        );
        if (idx === -1) return [...prev, created];
        return [...prev.slice(0, idx), created, ...prev.slice(idx)];
      });
      return created;
    },
    [projectId],
  );

  const update = useCallback(
    async (id: string, input: UpdateTimelineItemInput) => {
      const updated = await updateTimelineItem(id, input);
      if (updated) {
        setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
      return updated;
    },
    [],
  );

  const setStatus = useCallback(
    async (id: string, status: TimelineStatus) => {
      return update(id, { status });
    },
    [update],
  );

  const remove = useCallback(async (id: string) => {
    await deleteTimelineItem(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { items, loading, error, add, update, setStatus, remove, reload };
}
