import { motion, AnimatePresence } from "motion/react";
import type { Project } from "@workspace/types";
import {
  FolderOpen,
  Settings,
  Plus,
  LayoutGrid,
  FolderKanban,
} from "lucide-react";

interface SidebarProps {
  projects: Project[];
  selectedId: string | null;
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onSettings: () => void;
  onHome: () => void;
  loading: boolean;
}

export function Sidebar({
  projects,
  selectedId,
  onSelectProject,
  onAddProject,
  onSettings,
  onHome,
  loading,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
        </div>
        <span className="sidebar-brand">Dev Organizer</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item w-full text-left ${!selectedId ? "active" : ""}`}
          onClick={onHome}
        >
          <span className="sidebar-item-icon">
            <LayoutGrid className="size-4" />
          </span>
          <span className="sidebar-item-label">All Projects</span>
        </button>

        {/* Project list */}
        <div className="sidebar-section-label">Projects</div>

        {loading ? (
          <div className="flex flex-col gap-1 px-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-muted/30"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <FolderKanban className="mx-auto mb-2 size-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground/50">No projects yet</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {projects.map((project, i) => (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`sidebar-item w-full text-left ${
                  selectedId === project.id ? "active" : ""
                }`}
                onClick={() => onSelectProject(project)}
              >
                <span className="sidebar-item-icon">
                  <FolderOpen className="size-4" />
                </span>
                <span className="sidebar-item-label" title={project.name}>
                  {project.name}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="sidebar-item w-full text-left"
          onClick={onAddProject}
        >
          <span className="sidebar-item-icon">
            <Plus className="size-4" />
          </span>
          <span className="sidebar-item-label">Add Project</span>
        </button>
        <button
          className="sidebar-item w-full text-left"
          onClick={onSettings}
        >
          <span className="sidebar-item-icon">
            <Settings className="size-4" />
          </span>
          <span className="sidebar-item-label">Settings</span>
        </button>
      </div>
    </aside>
  );
}
