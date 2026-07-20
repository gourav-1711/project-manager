import { useRef, useCallback, useState, useEffect, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import type { SplitDirection } from "@workspace/types";

interface SplitViewProps {
  direction: SplitDirection;
  /** Position of the divider as a percentage (20–80). */
  position: number;
  /** Called when the user finishes dragging the divider. */
  onPositionChange: (pct: number) => void;
  /** Primary (left/top) panel content. */
  children: ReactNode;
  /** Secondary (right/bottom) panel content. */
  secondary: ReactNode;
}

export function SplitView({
  direction,
  position,
  onPositionChange,
  children,
  secondary,
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const isHorizontal = direction === "horizontal";

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      setDragging(true);
    },
    [],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = isHorizontal
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100;
      // We update position in real-time via CSS variable on the container
      const clamped = Math.max(20, Math.min(80, pct));
      containerRef.current.style.setProperty(
        "--split-pos",
        `${clamped}%`,
      );
    },
    [isHorizontal],
  );

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = isHorizontal
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100;
      const clamped = Math.max(20, Math.min(80, pct));
      onPositionChange(clamped);
    },
    [isHorizontal, onPositionChange],
  );

  useEffect(() => {
    if (!dragging) return;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`split-view split-view--${direction} ${
        dragging ? "split-view--dragging" : ""
      }`}
      style={{ "--split-pos": `${position}%` } as React.CSSProperties}
    >
      <div className="split-view__panel split-view__panel--primary">
        {children}
      </div>

      <div
        className={`split-view__divider ${dragging ? "split-view__divider--active" : ""}`}
        onMouseDown={onMouseDown}
      >
        <div className="split-view__divider-handle">
          <GripVertical className="size-3" />
        </div>
      </div>

      <div className="split-view__panel split-view__panel--secondary">
        {secondary}
      </div>
    </div>
  );
}
