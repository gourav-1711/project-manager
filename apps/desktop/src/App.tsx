import { useState } from "react";
import { Toaster, ThemeProvider } from "@workspace/ui";
import { useProjects } from "@/hooks/useProjects";
import { useBackground } from "@/hooks/useBackground";
import { useTabs } from "@/hooks/useTabs";
import { useSplitView } from "@/hooks/useSplitView";
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
  const {
    config: backgroundConfig,
    pickFile: pickBackgroundFile,
    reset: resetBackground,
    update: updateBackground,
  } = useBackground();
  const {
    tabs,
    activeTab,
    activeTabId,
    openProject,
    openHome,
    setActive,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
  } = useTabs();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedProject =
    activeTab.type === "project"
      ? projects.find((p) => p.id === activeTab.projectId) ?? null
      : null;

  const {
    isSplit: splitActive,
    direction: splitDirection,
    position: splitPosition,
    toggleSplit,
    setSplitPosition,
  } = useSplitView(activeTabId);

  return (
    <AppLayout
      selectedProject={selectedProject}
      background={backgroundConfig}
      onAddProject={() => setAddOpen(true)}
      onSettings={() => setSettingsOpen(true)}
      onHome={() => openHome()}
      tabs={tabs}
      activeTabId={activeTabId}
      onSelectTab={setActive}
      onCloseTab={closeTab}
      onCloseOtherTabs={closeOtherTabs}
      onCloseAllTabs={closeAllTabs}
      splitActive={splitActive}
      splitDirection={splitDirection}
      splitPosition={splitPosition}
      onSplitPositionChange={setSplitPosition}
      onToggleSplit={toggleSplit}
      splitSecondary={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 p-4">
          {projects.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-48 text-sm text-muted-foreground">
              No projects yet. Add one to get started.
            </div>
          ) : (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onEdit={setEditing}
                onDelete={setDeleting}
                onOpen={openProject}
              />
            ))
          )}
        </div>
      }
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
      ) : selectedProject ? (
        <ProjectDetail project={selectedProject} onBack={() => openHome()} />
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
              onOpen={openProject}
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
        backgroundConfig={backgroundConfig}
        onPickBackgroundFile={pickBackgroundFile}
        onUpdateBackground={updateBackground}
        onResetBackground={resetBackground}
      />

      <Toaster />
    </AppLayout>
  );
}

export default App;

