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
      className="flex gap-1 border-b"
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
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
