import { useCallback, useEffect, useState } from "react";
import { getErrors, createError, markErrorFixed, deleteError } from "@workspace/db";
import type { ErrorSeverity, ProjectError } from "@workspace/types";
import { toast } from "sonner";

/** Central hook for a project's error list. Loads on mount, no polling. */
export function useErrors(projectId: string | null) {
  const [errors, setErrors] = useState<ProjectError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setErrors(await getErrors(id));
    } catch (err) {
      setError(String(err));
      toast.error("Failed to load errors", { description: String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) reload(projectId);
    else {
      setErrors([]);
      setError(null);
    }
  }, [projectId, reload]);

  const add = useCallback(
    async (description: string, severity: ErrorSeverity = "medium") => {
      if (!projectId) throw new Error("No project selected");
      const created = await createError({ projectId, description, severity });
      setErrors((prev) => [created, ...prev]);
      return created;
    },
    [projectId],
  );

  const fix = useCallback(async (id: string) => {
    const updated = await markErrorFixed(id);
    if (updated) {
      setErrors((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteError(id);
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { errors, loading, error, add, fix, remove, reload };
}
