import { useState } from "react";
import { toast } from "sonner";
import { Button, SmoothInput } from "@workspace/ui";
import { cn } from "@workspace/ui";
import { useErrors } from "@/hooks/useErrors";
import { Check, Trash2 } from "lucide-react";
import type { ErrorSeverity, ProjectError } from "@workspace/types";

type Filter = "all" | "open" | "fixed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "fixed", label: "Fixed" },
];

const SEVERITIES: ErrorSeverity[] = ["low", "medium", "high"];

const SEVERITY_STYLE: Record<ErrorSeverity, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export function ErrorsTab({ projectId }: { projectId: string }) {
  const { errors, loading, add, fix, remove } = useErrors(projectId);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<ErrorSeverity>("medium");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("open");

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const d = description.trim();
    if (!d) return;
    setBusy(true);
    try {
      await add(d, severity);
      setDescription("");
      setSeverity("medium");
    } catch (err) {
      toast.error("Couldn't add error", { description: String(err) });
    } finally {
      setBusy(false);
    }
  }

  const visible = errors.filter((e) =>
    filter === "all" ? true : filter === "open" ? e.status === "open" : e.status === "fixed",
  );
  const counts = {
    all: errors.length,
    open: errors.filter((e) => e.status === "open").length,
    fixed: errors.filter((e) => e.status === "fixed").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={submit}
        className="flex flex-wrap items-end gap-2"
        aria-label="Add error"
      >
        <SmoothInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's broken?"
          disabled={busy}
          aria-label="Error description"
          wrapperClassName="max-w-full flex-1 p-3"
        />
        <div className="flex gap-1">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                severity === s
                  ? SEVERITY_STYLE[s]
                  : "text-muted-foreground hover:bg-secondary/50",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={busy || !description.trim()}>
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
        <p className="text-sm text-muted-foreground">Loading errors…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          {errors.length === 0
            ? "No errors logged — add one above."
            : "Nothing here."}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {visible.map((err) => (
            <ErrorRow
              key={err.id}
              error={err}
              onFix={fix}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ErrorRow({
  error,
  onFix,
  onRemove,
}: {
  error: ProjectError;
  onFix: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  return (
    <li className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5">
      <span
        className={cn(
          "rounded px-1.5 text-xs font-medium",
          SEVERITY_STYLE[error.severity],
        )}
      >
        {error.severity}
      </span>
      <span
        className={cn(
          "flex-1 text-sm",
          error.status === "fixed" && "text-muted-foreground line-through",
        )}
      >
        {error.description}
      </span>
      {error.status === "open" && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-green-600 hover:text-green-700"
          title="Mark as fixed"
          onClick={() => onFix(error.id)}
        >
          <Check className="size-4" />
        </Button>
      )}
      {error.status === "fixed" && (
        <span className="text-xs text-muted-foreground">
          {error.fixedAt
            ? new Date(error.fixedAt).toLocaleDateString()
            : "Fixed"}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-destructive hover:text-destructive"
        title="Delete error"
        onClick={() => onRemove(error.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
