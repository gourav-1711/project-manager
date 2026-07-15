import { useCallback, useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  touchLastOpened,
} from "@workspace/db";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@workspace/types";

import { toast } from "sonner";

/**
 * Central hook for reading/writing the project registry. Loads once on mount
 * (no polling — fits the background/RAM discipline) and exposes optimistic
 * local updates so the UI stays snappy without refetching.
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProjects();
      setProjects(list);
    } catch (err) {
      setError(String(err));
      toast.error("Failed to load projects", { description: String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(async (input: CreateProjectInput) => {
    const created = await createProject(input);
    setProjects((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(
    async (id: string, input: UpdateProjectInput) => {
      const updated = await updateProject(id, input);
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const markOpened = useCallback(async (id: string) => {
    try {
      await touchLastOpened(id);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, lastOpenedAt: new Date().toISOString() } : p,
        ),
      );
    } catch (err) {
      // Non-critical — just log
      console.warn("Failed to update lastOpenedAt", err);
    }
  }, []);

  return { projects, loading, error, reload, add, update, remove, markOpened };
}
