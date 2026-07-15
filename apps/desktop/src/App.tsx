import { useState } from "react";
import { Toaster, ThemeProvider } from "@workspace/ui";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@workspace/types";
import { AppLayout } from "@/components/AppLayout";
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

  return (
    <AppLayout
      projects={projects}
      loading={loading}
      selectedProject={selected}
      onSelectProject={setSelected}
      onAddProject={() => setAddOpen(true)}
      onSettings={() => setSettingsOpen(true)}
      onHome={() => setSelected(null)}
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl bg-muted/20"
            />
          ))}
        </div>
      ) : selected ? (
        <ProjectDetail project={selected} onBack={() => setSelected(null)} />
      ) : projects.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
    </AppLayout>
  );
}

export default App;

