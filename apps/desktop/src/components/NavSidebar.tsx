import { LayoutGrid, Settings } from "lucide-react";

interface NavSidebarProps {
  /** True when no project is selected (i.e. on the home view). */
  isHomeActive: boolean;
  onHome: () => void;
  onSettings: () => void;
}

export function NavSidebar({
  isHomeActive,
  onHome,
  onSettings,
}: NavSidebarProps) {
  return (
    <aside className="nav-sidebar">
      {/* Logo */}
      <div className="nav-sidebar-header" data-tauri-drag-region>
        <div className="nav-sidebar-header-logo">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
        </div>
      </div>

      {/* Nav items */}
      <div className="nav-sidebar-items">
        <button
          className="nav-sidebar-btn"
          data-active={isHomeActive ? "true" : "false"}
          onClick={onHome}
          title="All Projects"
          aria-label="All Projects"
        >
          <LayoutGrid className="nav-sidebar-btn-icon" />
        </button>
      </div>

      {/* Spacer */}
      <div className="nav-sidebar-spacer" />

      {/* Footer */}
      <div className="nav-sidebar-footer">
        <button
          className="nav-sidebar-btn"
          onClick={onSettings}
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="nav-sidebar-btn-icon" />
        </button>
      </div>
    </aside>
  );
}
