import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Textarea, Label } from "@workspace/ui";
import { cn } from "@workspace/ui";
import { useTimeline } from "@/hooks/useTimeline";
import {
  Plus,
  Trash2,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import type {
  TimelineItem,
  TimelineStatus,
} from "@workspace/types";

const STATUS_OPTIONS: { id: TimelineStatus; label: string }[] = [
  { id: "planned", label: "Planned" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const STATUS_STYLE: Record<TimelineStatus, string> = {
  planned:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export function TimelineTab({ projectId }: { projectId: string }) {
  const { items, loading, add, setStatus, remove } = useTimeline(projectId);
  const [showForm, setShowForm] = useState(false);

  // Group items by month
  const grouped = groupByMonth(items);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Plan your project milestones and phases.
        </p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5" />
          Add Milestone
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <AddMilestoneForm
          onAdd={add}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Timeline list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading timeline…</p>
      ) : items.length === 0 ? (
        <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          No timeline yet — add your first milestone above.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([monthLabel, monthItems]) => (
            <div key={monthLabel}>
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {monthLabel}
                </h3>
                <div className="flex-1 border-t" />
              </div>
              <div className="flex flex-col gap-1.5">
                {monthItems.map((item) => (
                  <TimelineRow
                    key={item.id}
                    item={item}
                    onStatusChange={setStatus}
                    onRemove={remove}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add form ──

function AddMilestoneForm({
  onAdd,
  onClose,
}: {
  onAdd: (input: {
    title: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    status?: TimelineStatus;
  }) => Promise<TimelineItem>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<TimelineStatus>("planned");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || null,
        startDate,
        endDate: endDate || null,
        status,
      });
      setTitle("");
      setDescription("");
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate("");
      setStatus("planned");
      toast.success("Milestone added");
      onClose();
    } catch (err) {
      toast.error("Failed to add milestone", { description: String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="tl-title">Title</Label>
        <Input
          id="tl-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. MVP Launch"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tl-desc">Description (optional)</Label>
        <Textarea
          id="tl-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this milestone?"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="tl-start">Start date</Label>
          <Input
            id="tl-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tl-end">End date (optional)</Label>
          <Input
            id="tl-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatus(opt.id)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                status === opt.id
                  ? STATUS_STYLE[opt.id]
                  : "text-muted-foreground hover:bg-secondary/50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={busy}>
          {busy ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}

// ── Timeline row ──

function TimelineRow({
  item,
  onStatusChange,
  onRemove,
}: {
  item: TimelineItem;
  onStatusChange: (id: string, status: TimelineStatus) => Promise<TimelineItem | null>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const dateRange = item.endDate
    ? `${formatDate(item.startDate)} – ${formatDate(item.endDate)}`
    : formatDate(item.startDate);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-md border bg-card px-3 py-2.5 transition-colors",
        item.status === "done" && "opacity-60",
      )}
    >
      {/* Status indicator dot */}
      <div className="mt-1.5 flex shrink-0 flex-col items-center gap-1">
        <div
          className={cn(
            "size-2.5 rounded-full ring-2 ring-background",
            item.status === "planned" && "bg-blue-500",
            item.status === "in_progress" && "bg-amber-500",
            item.status === "done" && "bg-green-500",
          )}
        />
        {/* Vertical connector line for visual timeline feel */}
        <div className="w-px flex-1 bg-border/50" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              item.status === "done" && "line-through text-muted-foreground",
            )}
          >
            {item.title}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              STATUS_STYLE[item.status],
            )}
          >
            {STATUS_OPTIONS.find((o) => o.id === item.status)?.label}
          </span>
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
          {dateRange}
        </p>
      </div>

      {/* Inline status change + delete */}
      <div className="flex shrink-0 items-center gap-1 pt-0.5">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="Change status"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <ChevronDown className="size-3.5" />
          </Button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 flex flex-col rounded-md border bg-popover p-1 shadow-md">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onStatusChange(item.id, opt.id);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "whitespace-nowrap rounded px-2.5 py-1 text-left text-xs transition-colors hover:bg-accent",
                      item.status === opt.id && "font-medium",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          title="Delete timeline item"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ──

function groupByMonth(
  items: TimelineItem[],
): Record<string, TimelineItem[]> {
  const groups: Record<string, TimelineItem[]> = {};
  for (const item of items) {
    const label = formatMonth(item.startDate);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

function formatMonth(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
