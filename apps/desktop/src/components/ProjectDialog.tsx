import { useEffect, useState } from "react";
import { open as openFolder } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  SmoothInput,
} from "@workspace/ui";
import type { Project, CreateProjectInput } from "@workspace/types";

function basename(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

/** Controlled add-project dialog. Opens a native folder picker, auto-fills the name. */
export function AddProjectDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: CreateProjectInput) => Promise<Project>;
}) {
  const [path, setPath] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setPath("");
      setName("");
      setDescription("");
    }
  }, [open]);

  async function pickFolder() {
    const selected = await openFolder({ directory: true, multiple: false });
    if (typeof selected === "string") {
      setPath(selected);
      setName((prev) => prev || basename(selected));
    }
  }

  async function submit() {
    if (!path) {
      toast.error("Pick a project folder first.");
      return;
    }
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    setBusy(true);
    try {
      await onAdd({ name: name.trim(), path, description: description.trim() });
      toast.success(`Added "${name.trim()}"`);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to add project", { description: String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Pick a folder on disk. The name fills in from the folder, but you
            can change it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-path">Folder</Label>
            <div className="flex gap-2">
              <Input
                id="project-path"
                readOnly
                value={path}
                placeholder="No folder selected"
                className="flex-1"
              />
              <Button variant="outline" onClick={pickFolder} type="button">
                Browse…
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Name</Label>
            <SmoothInput
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              wrapperClassName="max-w-full p-3"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-desc">Description (optional)</Label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Adding…" : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Controlled edit-project dialog (name + description only). */
export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSave,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    input: { name?: string; description?: string | null },
  ) => Promise<Project | null>;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description ?? "");
    }
  }, [open, project]);

  async function submit() {
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    setBusy(true);
    try {
      const updated = await onSave(project.id, {
        name: name.trim(),
        description: description.trim(),
      });
      if (updated) {
        toast.success("Project updated");
        onOpenChange(false);
      } else {
        toast.error("Project not found");
      }
    } catch (err) {
      toast.error("Failed to update project", { description: String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            The folder path can't be changed — remove and re-add if it moved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <SmoothInput
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              wrapperClassName="max-w-full p-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-desc">Description (optional)</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
