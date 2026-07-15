import { useState } from "react";
import { Toaster, Button, ShimmerButton, ThemeProvider } from "@workspace/ui";
import { FolderOpen, Settings } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@workspace/types";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { AddProjectDialog, EditProjectDialog } from "@/components/ProjectDialog";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { EmptyState } from "@/components/EmptyState";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { projects, loading, add, update, remove } = useProjects();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (selected) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl p-6">
        <ProjectDetail project={selected} onBack={() => setSelected(null)} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Dev Project Organizer
          </h1>
          <p className="text-sm text-muted-foreground">
            Jump into any project's tools in one click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            title="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4" />
          </Button>
          <ShimmerButton
            shimmerColor="rgba(255,255,255,0.3)"
            background="hsl(var(--primary))"
            borderRadius="8px"
            shimmerSize="0.1em"
            className="h-9 px-4 text-xs font-medium"
            onClick={() => setAddOpen(true)}
          >
            <FolderOpen className="mr-1.5 size-4" />
            Add Project
          </ShimmerButton>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-muted/50"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onEdit={setEditing}
              onDelete={setDeleting}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      <AddProjectDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={add}
      />
      {editing && (
        <EditProjectDialog
          project={editing}
          open
          onOpenChange={(o) => !o && setEditing(null)}
          onSave={update}
        />
      )}
      {deleting && (
        <DeleteConfirm
          project={deleting}
          open
          onOpenChange={(o) => !o && setDeleting(null)}
          onDelete={remove}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <Toaster />
    </div>
  );
}

export default App;
