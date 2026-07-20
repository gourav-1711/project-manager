import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ShimmerButton } from "@workspace/ui";
import { FolderOpen, Minus, Maximize, Minimize2, X } from "lucide-react";
import type { Project } from "@workspace/types";

interface WindowToolbarProps {
  projectCount: number;
  selectedProject: Project | null;
  onAddProject: () => void;
}

/* ── Window controls (minimize / maximize / close) ── */

function WindowControls() {
  const [maximized, setMaximized] = useState(false);
  const win = getCurrentWindow();

  useEffect(() => {
    win.isMaximized().then(setMaximized);
    const unlisten = win.onResized(() => {
      win.isMaximized().then(setMaximized);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="window-controls">
      <button
        className="win-btn win-btn-min"
        onClick={() => win.minimize()}
        aria-label="Minimize"
      >
        <Minus className="win-btn-icon" />
      </button>
      <button
        className="win-btn win-btn-max"
        onClick={async () => {
          await win.toggleMaximize();
          setMaximized((m) => !m);
        }}
        aria-label={maximized ? "Restore" : "Maximize"}
      >
        {maximized ? (
          <Minimize2 className="win-btn-icon" />
        ) : (
          <Maximize className="win-btn-icon" />
        )}
      </button>
      <button
        className="win-btn win-btn-close"
        onClick={() => win.close()}
        aria-label="Close"
      >
        <X className="win-btn-icon" />
      </button>
    </div>
  );
}

/* ── Main toolbar ── */

export function WindowToolbar({
  projectCount,
  selectedProject,
  onAddProject,
}: WindowToolbarProps) {
  return (
    <header className="window-toolbar">
      {/* Drag region: covers the full toolbar; interactive children opt out */}
      <div className="window-toolbar__drag-layer" data-tauri-drag-region />

      {/* Action layer: sits above drag region, interactive elements here */}
      <div className="window-toolbar__action-layer">
        {/* Left section — window controls + project info */}
        <div className="flex items-center gap-0 min-w-0 flex-1">
          <WindowControls />

          <div className="w-px h-5 bg-border/40 mx-3 shrink-0" />

          <motion.div
            className="flex items-center gap-3 min-w-0"
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
                  {projectCount} project
                  {projectCount !== 1 ? "s" : ""} registered
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right section — actions */}
        <motion.div
          className="flex items-center gap-2 shrink-0"
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
      </div>

      {/* Progressive blur fade at bottom edge (Sigma-style) */}
      <div className="progressive-blur" style={{ bottom: 0, height: 8, width: '100%' }}>
        <div
          className="progressive-blur__layer"
          style={{
            '--pb-amount': '4px',
            '--pb-start': '0%',
            '--pb-end': '100%',
          } as React.CSSProperties}
        />
      </div>
    </header>
  );
}
