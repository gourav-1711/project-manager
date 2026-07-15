import { useCallback, useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "@workspace/db";
import type { Todo } from "@workspace/types";
import { toast } from "sonner";

/** Central hook for a project's todo list. Loads on mount, no polling. */
export function useTodos(projectId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setTodos(await getTodos(id));
    } catch (err) {
      setError(String(err));
      toast.error("Failed to load todos", { description: String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) reload(projectId);
    else {
      setTodos([]);
      setError(null);
    }
  }, [projectId, reload]);

  const add = useCallback(
    async (title: string) => {
      if (!projectId) throw new Error("No project selected");
      const created = await createTodo({ projectId, title });
      setTodos((prev) => [created, ...prev]);
      return created;
    },
    [projectId],
  );

  const setDone = useCallback(async (id: string, done: boolean) => {
    const updated = await updateTodo(id, { done });
    if (updated) {
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { todos, loading, error, add, setDone, remove, reload };
}
