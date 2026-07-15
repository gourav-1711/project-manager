import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui";
import type { Project } from "@workspace/types";

/**
 * Controlled confirm-and-remove dialog. Removing only deletes the registry
 * entry — never files on disk.
 */
export function DeleteConfirm({
  project,
  open,
  onOpenChange,
  onDelete,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onDelete(project.id);
      toast.success(`Removed "${project.name}"`);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to remove project", { description: String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="dialog-glass">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove “{project.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This only removes the entry from your registry. No files on disk
            will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              confirm();
            }}
            disabled={busy}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {busy ? "Removing…" : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
