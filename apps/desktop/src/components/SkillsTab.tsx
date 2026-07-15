import { useSkills } from "@/hooks/useSkills";
import { Button } from "@workspace/ui";
import { cn } from "@workspace/ui";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Skill } from "@workspace/types";
import { useState } from "react";

type CatalogFilter = "all" | "available" | "installed";

const FILTERS: { id: CatalogFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "installed", label: "Installed" },
];

export function SkillsTab({ projectId }: { projectId: string }) {
  const {
    catalog,
    loading,
    installState,
    isInstalled,
    install,
    uninstall,
  } = useSkills(projectId);

  const [filter, setFilter] = useState<CatalogFilter>("all");

  const visible = catalog.filter((skill) => {
    if (filter === "all") return true;
    if (filter === "available") return !isInstalled(skill.id);
    if (filter === "installed") return isInstalled(skill.id);
    return true;
  });

  const counts = {
    all: catalog.length,
    available: catalog.filter((s) => !isInstalled(s.id)).length,
    installed: catalog.filter((s) => isInstalled(s.id)).length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          AI agent skills you can add to this project via{" "}
          <code className="rounded bg-muted px-1 text-xs">npx</code>.
        </p>
      </div>

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
        <p className="text-sm text-muted-foreground">Loading skills…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          {catalog.length === 0
            ? "No skills in the catalog."
            : "Nothing here."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              installed={isInstalled(skill.id)}
              installState={installState[skill.id] ?? "idle"}
              onInstall={install}
              onUninstall={uninstall}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({
  skill,
  installed,
  installState,
  onInstall,
  onUninstall,
}: {
  skill: Skill;
  installed: boolean;
  installState: "idle" | "installing" | "success" | "error";
  onInstall: (skill: Skill) => Promise<void>;
  onUninstall: (skillId: string) => Promise<void>;
}) {
  const isBusy = installState === "installing";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors",
        installed && "border-primary/30",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{skill.name}</span>
          {installed && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Installed
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {skill.description}
        </p>
        <code className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          npx {skill.npxCommand}
        </code>
      </div>

      <div className="flex shrink-0 items-center gap-1 pt-1">
        {installed ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="Remove from project"
            onClick={() => onUninstall(skill.id)}
            disabled={isBusy}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => onInstall(skill)}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                Add
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
