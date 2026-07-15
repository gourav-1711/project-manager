import { motion } from "motion/react";
import { ShimmerButton } from "@workspace/ui";
import { FolderOpen } from "lucide-react";
import type { Project } from "@workspace/types";

interface AppHeaderProps {
  projectCount: number;
  selectedProject: Project | null;
  onAddProject: () => void;
}

export function AppHeader({
  projectCount,
  selectedProject,
  onAddProject,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {selectedProject ? (
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight">
              {selectedProject.name}
            </h1>
            <p className="text-[11px] text-muted-foreground/60 truncate max-w-[300px]">
              {selectedProject.path}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight">
              Projects
            </h1>
            <p className="text-[11px] text-muted-foreground/60">
              {projectCount} project{projectCount !== 1 ? "s" : ""} registered
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ShimmerButton
          shimmerColor="rgba(255,255,255,0.25)"
          background="hsl(var(--primary))"
          borderRadius="10px"
          shimmerSize="0.08em"
          className="h-8 gap-1.5 px-3 text-xs font-medium"
          onClick={onAddProject}
        >
          <FolderOpen className="size-3.5" />
          <span className="hidden sm:inline">Add Project</span>
        </ShimmerButton>
      </motion.div>
    </header>
  );
}
