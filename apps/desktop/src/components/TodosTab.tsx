import { useState } from "react";
import { toast } from "sonner";
import { Button, SmoothInput } from "@workspace/ui";
import { useTodos } from "@/hooks/useTodos";
import { Trash2, Check, RotateCcw } from "lucide-react";
import { cn } from "@workspace/ui";
import type { Todo } from "@workspace/types";

type Filter = "all" | "active" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "done", label: "Done" },
];

export function TodosTab({ projectId }: { projectId: string }) {
  const { todos, loading, add, setDone, remove } = useTodos(projectId);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    try {
      await add(t);
      setTitle("");
    } catch (err) {
      toast.error("Couldn't add todo", { description: String(err) });
    } finally {
      setBusy(false);
    }
  }

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done,
  );
  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.done).length,
    done: todos.filter((t) => t.done).length,
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={submit}
        className="flex gap-2"
        aria-label="Add todo"
      >
        <SmoothInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          disabled={busy}
          aria-label="Todo title"
          wrapperClassName="max-w-full p-3"
        />
        <Button type="submit" disabled={busy || !title.trim()}>
          Add
        </Button>
      </form>

      <div className="flex items-center gap-1 text-xs">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              filter === f.id
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50",
            )}
          >
            {f.label} ({counts[f.id]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading todos…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          {todos.length === 0 ? "No todos yet — add one above." : "Nothing here."}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {visible.map((todo) => (
            <TodoRow key={todo.id} todo={todo} onToggle={setDone} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TodoRow({
  todo,
  onToggle,
  onRemove,
}: {
  todo: Todo;
  onToggle: (id: string, done: boolean) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  return (
    <li className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5">
      <input
        type="checkbox"
        className="size-4 accent-foreground"
        checked={todo.done}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={`Mark "${todo.title}" ${todo.done ? "active" : "done"}`}
      />
      <span
        className={cn(
          "flex-1 text-sm",
          todo.done && "text-muted-foreground line-through",
        )}
      >
        {todo.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        title={todo.done ? "Mark active" : "Mark done"}
        onClick={() => onToggle(todo.id, !todo.done)}
      >
        {todo.done ? (
          <RotateCcw className="size-4" />
        ) : (
          <Check className="size-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-destructive hover:text-destructive"
        title="Delete todo"
        onClick={() => onRemove(todo.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
