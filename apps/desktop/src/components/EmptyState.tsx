import { Button } from "@workspace/ui";
import { FolderOpen } from "lucide-react";

/** Shown when the registry is empty — clear call to action. */
export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
      <FolderOpen className="size-10 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium">No projects yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add a project folder to launch its file manager, terminal, editor,
          and AI agent from one place.
        </p>
      </div>
      <Button onClick={onAdd}>
        <FolderOpen className="size-4" />
        Add your first project
      </Button>
    </div>
  );
}
