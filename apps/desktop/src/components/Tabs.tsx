import { cn } from "@workspace/ui";

/**
 * Minimal accessible tabs. No external radix dep — just buttons + aria roles.
 * Panels are rendered by the parent, controlled by `active`.
 */
export function Tabs({
  active,
  onChange,
  tabs,
}: {
  active: string;
  onChange: (id: string) => void;
  tabs: { id: string; label: string }[];
}) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="glass-subtle flex gap-1 rounded-xl p-1.5 border-0"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
              selected
                ? "bg-background/60 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/20",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
