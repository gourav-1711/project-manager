import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { AppHeader } from "@/components/AppHeader";
import type { Project } from "@workspace/types";

interface AppLayoutProps {
  projects: Project[];
  loading: boolean;
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onSettings: () => void;
  onHome: () => void;
  children: ReactNode;
}

export function AppLayout({
  projects,
  loading,
  selectedProject,
  onSelectProject,
  onAddProject,
  onSettings,
  onHome,
  children,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        selectedId={selectedProject?.id ?? null}
        onSelectProject={onSelectProject}
        onAddProject={onAddProject}
        onSettings={onSettings}
        onHome={onHome}
        loading={loading}
      />
      <AppHeader
        projectCount={projects.length}
        selectedProject={selectedProject}
        onAddProject={onAddProject}
      />
      <main className="content-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProject?.id ?? "home"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
