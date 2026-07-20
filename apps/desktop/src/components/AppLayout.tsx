import { type ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NavSidebar } from "@/components/NavSidebar";
import { WindowToolbar } from "@/components/WindowToolbar";
import type { Project, BackgroundConfig } from "@workspace/types";
import {
  getPatternDataUrl,
  generateNoiseDataUrl,
} from "@/lib/overlay-patterns";

interface AppLayoutProps {
  projects: Project[];
  loading: boolean;
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onAddProject: () => void;
  onSettings: () => void;
  onHome: () => void;
  children: ReactNode;
  /** Optional background config — renders a full-viewport backdrop when enabled. */
  background?: BackgroundConfig | null;
}

/* ── Background layer component ── */

function BackgroundLayer({ config }: { config: BackgroundConfig }) {
  const cssVars = useMemo(
    () =>
      ({
        "--bg-blur": `${config.blur}px`,
        "--bg-saturate": config.saturation,
        "--bg-contrast": config.contrast,
        "--bg-opacity": config.opacity,
        "--bg-blend-mode": config.blendMode,
        "--bg-tint":
          config.blendMode !== "normal"
            ? "rgba(0, 0, 0, 0.15)"
            : "transparent",
      }) as React.CSSProperties,
    [config],
  );

  const patternUrl = config.overlayPattern === "noise"
    ? generateNoiseDataUrl(config.overlayOpacity)
    : getPatternDataUrl(config.overlayPattern, config.overlayScale);

  const showPattern = config.overlayPattern !== "none";
  const isNoise = config.overlayPattern === "noise";

  return (
    <div className="app-background" style={cssVars}>
      {config.type === "video" ? (
        <video
          src={config.src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      ) : (
        <img src={config.src} alt="Background" draggable={false} />
      )}
      <div className="app-background-overlay" />
      {showPattern && (
        <div
          className={`app-bg-pattern ${isNoise ? "app-bg-pattern--noise" : ""}`}
          style={{
            backgroundImage: patternUrl || undefined,
            backgroundSize: isNoise
              ? `${Math.max(50, Math.round(256 * config.overlayScale))}px`
              : undefined,
            opacity: isNoise ? 1 : config.overlayOpacity,
          }}
        />
      )}
    </div>
  );
}

/* ── Main layout ── */

export function AppLayout({
  projects,
  selectedProject,
  onAddProject,
  onSettings,
  onHome,
  children,
  background,
}: AppLayoutProps) {
  const showBg =
    background?.enabled &&
    background.type !== "none" &&
    background.src.length > 0;

  return (
    <div className="app-shell">
      {/* ── Background layer ── */}
      {showBg && <BackgroundLayer config={background!} />}

      <NavSidebar
        isHomeActive={!selectedProject}
        onHome={onHome}
        onSettings={onSettings}
      />
      <WindowToolbar
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
