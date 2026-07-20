import { useRef, useCallback, useEffect, useState } from "react";
import type { Tab } from "@workspace/types";
import { X, Plus, Home } from "lucide-react";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseOtherTabs: (id: string) => void;
  onCloseAllTabs: () => void;
  onAddTab?: () => void;
}

/* ── Individual Tab ── */

function TabItem({
  tab,
  isActive,
  onSelect,
  onClose,
  onCloseOtherTabs,
  onCloseAllTabs,
}: {
  tab: Tab;
  isActive: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onCloseOtherTabs: (id: string) => void;
  onCloseAllTabs: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 && tab.id !== "home") {
        e.preventDefault();
        onClose(tab.id);
      }
    },
    [tab.id, onClose],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    if (!showMenu) return;
    const handler = () => setShowMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showMenu]);

  return (
    <div className="relative flex-shrink-0">
      <button
        className={`tab-item ${isActive ? "tab-item--active" : ""}`}
        data-active={isActive ? "true" : "false"}
        onClick={() => onSelect(tab.id)}
        onMouseDown={handleMiddleClick}
        onContextMenu={handleContextMenu}
        title={tab.subtitle || tab.label}
        aria-label={tab.label}
      >
        <span className="tab-item__icon">
          {tab.type === "home" ? (
            <Home className="size-3.5" />
          ) : (
            <span className="tab-item__dot" />
          )}
        </span>
        <span className="tab-item__label">{tab.label}</span>
        {tab.id !== "home" && (
          <span
            className="tab-item__close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            role="button"
            aria-label={`Close ${tab.label}`}
          >
            <X className="size-3" />
          </span>
        )}
      </button>

      {/* Context menu */}
      {showMenu && tab.id !== "home" && (
        <div
          className="tab-context-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="tab-context-menu__item"
            onClick={() => {
              onClose(tab.id);
              setShowMenu(false);
            }}
          >
            Close
          </button>
          <button
            className="tab-context-menu__item"
            onClick={() => {
              onCloseOtherTabs(tab.id);
              setShowMenu(false);
            }}
          >
            Close Others
          </button>
          <button
            className="tab-context-menu__item"
            onClick={() => {
              onCloseAllTabs();
              setShowMenu(false);
            }}
          >
            Close All
          </button>
        </div>
      )}
    </div>
  );
}

/* ── TabBar ── */

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onAddTab,
}: TabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: 0, right: 0 });

  const updateScrollFade = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const left = el.scrollLeft;
    const right = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setScrollState({
      left: Math.min(left, 40),
      right: Math.min(right, 40),
    });
  }, []);

  useEffect(() => {
    updateScrollFade();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollFade);
    window.addEventListener("resize", updateScrollFade);
    return () => {
      el.removeEventListener("scroll", updateScrollFade);
      window.removeEventListener("resize", updateScrollFade);
    };
  }, [updateScrollFade, tabs.length]);

  // Scroll selected tab into view
  useEffect(() => {
    const el = containerRef.current?.querySelector(
      '.tab-item[data-active="true"]',
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [activeTabId]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  }, []);

  return (
    <div className="tab-bar-container">
      <div
        ref={containerRef}
        className="tab-bar-scroll"
        style={
          {
            "--scroll-fade-left": `${scrollState.left}px`,
            "--scroll-fade-right": `${scrollState.right}px`,
          } as React.CSSProperties
        }
        onWheel={handleWheel}
      >
        <div className="tab-bar-track">
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onSelect={onSelectTab}
              onClose={onCloseTab}
              onCloseOtherTabs={onCloseOtherTabs}
              onCloseAllTabs={onCloseAllTabs}
            />
          ))}
        </div>
      </div>
      {onAddTab && (
        <button
          className="tab-bar-add-btn"
          onClick={onAddTab}
          aria-label="New tab"
        >
          <Plus className="size-4" />
        </button>
      )}
    </div>
  );
}
