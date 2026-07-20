# Sigma-Inspired Redesign Plan — Dev Project Organizer

> Based on research of [Sigma File Manager](https://github.com/aleksey-hoffman/sigma-file-manager) (v1.17.0)
> Date: July 20, 2026

---

## Table of Contents

1. [Design System Overhaul](#1-design-system-overhaul)
2. [Layout Architecture](#2-layout-architecture)
3. [Tab System](#3-tab-system)
4. [Split View](#4-split-view)
5. [Infusion (Backgrounds) Enhancement](#5-infusion-backgrounds-enhancement)
6. [Implementation Phases](#6-implementation-phases)
7. [File Changes Summary](#7-file-changes-summary)

---

## 1. Design System Overhaul

### Current State
The app has a basic glassmorphism design with CSS custom properties. The design works but lacks the refinement and consistency of Sigma.

### Target: Sigma-Level Design System

#### Color Tokens
Sigma uses HSL color variables with a `--background-2` and `--background-3` layering system for depth. We should adopt a similar approach:

```css
/* New tokens to add to :root / .dark */
:root {
  /* Background depth layers */
  --background-2: 220 13% 93%;   /* One level deeper than background */
  --background-3: 220 14% 98%;   /* Two levels deeper */

  /* Window toolbar (header) */
  --window-toolbar: 220 14% 96%;

  /* Icon color */
  --icon: 220 9% 38%;

  /* Glass effects */
  --backdrop-filter-blur: 32px;
}
```

#### New Design Tokens

| Token | Purpose | Example Value |
|-------|---------|---------------|
| `--background-2` | Slightly darker/lighter bg for active tabs, hover states | `225 10% 16%` (dark) |
| `--background-3` | Main content background | `225 12% 13%` (dark) |
| `--icon` | Icon stroke color | `0 0% 62%` (dark) |
| `--radius-full` | Pill/round shapes | `9999px` |
| `--font-mono` | Monospace font stack | system monospace stack |
| `--shadow-md` | Medium shadow | layered |
| `--shadow-lg` | Large shadow | layered |

#### CSS Radius System
Adopt Sigma's radius scale:
```css
--radius: 0.5rem;      /* base = 8px */
--radius-full: 9999px;  /* pills */
--radius-xl: calc(var(--radius) + 4px); /* 12px */
--radius-lg: var(--radius);             /* 8px */
--radius-md: calc(var(--radius) - 2px); /* 6px */
--radius-sm: calc(var(--radius) - 4px); /* 4px */
--radius-xs: min(calc(var(--radius) / 2.5), 6px); /* 3px */
```

#### Progressive Blur
Sigma has a `ProgressiveBlur` component that creates layered blur masks at edges. Implement this as a CSS utility:

```css
.progressive-blur {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}

.progressive-blur__layer {
  position: absolute;
  -webkit-backdrop-filter: blur(var(--blur-amount, 0));
  backdrop-filter: blur(var(--blur-amount, 0));
  inset: 0;
  -webkit-mask-image: linear-gradient(
    var(--blur-direction, to bottom),
    black var(--blur-start, 0%),
    transparent var(--blur-end, 100%)
  );
  mask-image: linear-gradient(...);
}
```

---

## 2. Layout Architecture

### Current Layout
```
.app-shell (grid)
├── sidebar (grid-area: sidebar)
├── app-header (grid-area: header)
└── content-area (grid-area: content)
```

### Target Layout (Sigma-Inspired)
```
.app-shell (flex row, full height)
├── NavSidebar (fixed 42px + margin, rounded)
├── .app-main (flex column)
│   ├── WindowToolbar (48px, custom title bar)
│   │   ├── WindowActions (min/max/close)
│   │   ├── TabBar (teleported here, scrollable)
│   │   ├── Spacer
│   │   └── ToolbarActions (search, settings buttons)
│   └── .app-content (flex 1)
│       └── RouterView / Content
└── InfusionWrapper (fixed background, z-index: 0)
```

### Key Changes

1. **Switch from CSS Grid to Flexbox** for the main layout — more flexible for resizable panels
2. **Collapse sidebar** from current 260px to a slim 42px icon sidebar (Sigma style)
3. **Move header to a toolbar** — 48px tall, integrates tabs + window controls + actions
4. **Add progressive blur** to the toolbar for edge fading

### Sidebar Redesign
From a text-based sidebar (260px) to an icon-based nav sidebar (42px):
- Logo at top
- Nav items as icon buttons with tooltips
- Spacer
- Bottom actions (settings, add project)

---

## 3. Tab System

### Current State
No tab system exists. Projects are viewed one at a time via selection.

### Target: Sigma-Inspired Tab System

Each "tab" represents an open project or view. Tabs appear in the toolbar.

#### Data Model

```typescript
interface Tab {
  id: string;
  /** The view type: 'home', 'project', 'settings', etc. */
  type: 'home' | 'project';
  /** For project tabs: the project ID */
  projectId?: string;
  /** Display label */
  label: string;
  /** Path or sub-label */
  subtitle?: string;
  /** When the tab was last accessed */
  lastAccessedAt: number;
}

interface TabGroup {
  /** Array of tab IDs in this group. Split view = 2 tabs per group. */
  tabs: Tab[];
}
```

#### Tab Store
```typescript
interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;
  
  // Actions
  openTab(type: 'home' | 'project', projectId?: string): void;
  closeTab(tabId: string): void;
  closeOtherTabs(tabId: string): void;
  closeAllTabs(): void;
  reorderTabs(fromIndex: number, toIndex: number): void;
  setActiveTab(tabId: string): void;
}
```

#### TabBar Component
- Horizontal scrollable container with `scrollbar-width: none`
- Scroll fade effect (gradient mask at edges)
- Each tab shows: icon + label + close button (X)
- Active tab has accent styling
- Middle-click to close
- Drag to reorder (using HTML5 drag API or pointer events)
- "+" button at end to add tab
- Context menu: Close, Close Others, Close All
- Tooltip on hover showing full path/subtitle

#### Tab Component
```tsx
interface TabProps {
  tab: Tab;
  isActive: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}
```

#### Tab Persistence
- Store open tabs in localStorage
- Restore tabs on app launch
- Limit to last 20 tabs

---

## 4. Split View

### Current State
No split view exists. Only one project view at a time.

### Target: Sigma-Inspired Split View

Split view allows viewing two projects side by side with a resizable divider.

#### How It Works
- When split view is enabled, the content area splits into two panels
- Each panel shows a different project tab
- A draggable handle between them lets users resize panels
- Min panel size: 20%
- Default: 50/50 split

#### Split View Modes
- **Standard**: Two independent panels, each with its own project
- **Linked** (Sigma feature): Selecting/viewing an item in one panel syncs the other

#### Data Model
```typescript
type SplitViewMode = 'standard' | 'linked';

interface SplitViewState {
  enabled: boolean;
  mode: SplitViewMode;
  /** Active panel index (0 or 1) */
  activePaneIndex: number;
  /** Second tab for split view */
  secondaryTabId: string | null;
}
```

#### Resizable Panel Component
Since we lack a resizable panel library like Reka UI, build a lightweight implementation:

```tsx
interface ResizablePanelGroupProps {
  direction: 'horizontal' | 'vertical';
  children: ReactNode;
}

interface ResizablePanelProps {
  defaultSize: number; // percentage
  minSize?: number;
  children: ReactNode;
}

interface ResizableHandleProps {
  onDragging?: (progress: number) => void;
}
```

Implementation approach:
- Use CSS flexbox with `flex-basis` for panel sizing
- A `<div>` handle between panels with `cursor: col-resize`
- Pointer events for drag: track mouse X, calculate new flex ratios
- Snap-to-50% on double-click

#### Split View UI
- Toggle button in toolbar: `<LayoutPanelLeft />` icon
- When active, content area shows: `[Project A | Resizable Handle | Project B]`
- Each panel maintains its own state (scrolling position, selected items)
- Active panel gets a subtle border highlight

---

## 5. Infusion (Backgrounds) Enhancement

### Current State
We already have a basic background system implemented. Sigma's "Infusion" system is more sophisticated.

### Sigma Features to Add

| Feature | Current | Sigma | Add? |
|---------|---------|-------|------|
| Image/video | ✅ | ✅ | — |
| Blur | ✅ | ✅ | — |
| Opacity | ✅ | ✅ | — |
| Saturation/Contrast | ✅ | ✅ (mediaBrightness, mediaContrast) | — |
| Blend mode | ✅ | ✅ (mixBlendMode) | — |
| **Noise overlay** | ❌ | ✅ | ✅ |
| **Per-page backgrounds** | ❌ | ✅ (sameSettingsForAllPages toggle) | ✅ |
| **Video pause when idle** | ❌ | ✅ | ✅ |
| **Background media library** | ❌ | ✅ | Optional |

### Noise Overlay
Add a noise texture overlay generated via Canvas API:
- Generates a random grayscale noise data URL
- Applied as `background-image` with `mix-blend-mode: overlay`
- Configurable intensity (0–1) and scale
- Adds a subtle film-grain texture

### Per-Page Backgrounds
Allow different backgrounds for different views:
- Home page, project detail, settings
- Toggle: "Same background for all pages" (default: true)
- When disabled, each page can have its own config

### Video Pause When Idle
- Detect user idle state (no mouse/keyboard activity for 5 minutes)
- Pause background video to save resources
- Resume on activity

---

## 6. Implementation Phases

### Phase 1: Design System Refresh (Days 1-2)

1. **Update CSS custom properties** in `globals.css`
   - Add `--background-2`, `--background-3`, `--icon`
   - Add radius scale
   - Add progressive blur utility
   - Refine existing glassmorphism tokens

2. **Update types** in `@workspace/types`
   - Add `Tab`, `TabGroup`, `SplitViewState` types
   - Add `BackgroundNoiseConfig` to `BackgroundConfig`

3. **Add new CSS classes** for the refined design

**Files:**
- `packages/types/src/index.ts`
- `apps/desktop/src/styles/globals.css`

### Phase 2: Layout Restructure (Days 3-4)

1. **Create NavSidebar component** (compact 42px icon sidebar)
   - Reduce from 260px text sidebar to icon-based
   - Tooltips on hover
   - Logo at top, home button, settings at bottom

2. **Redesign AppHeader into WindowToolbar**
   - 48px height
   - Window controls + TabBar + action buttons
   - Progressive blur edge effects
   - Custom window drag region

3. **Update AppLayout**
   - Switch from CSS Grid to flexbox
   - Integrate NavSidebar + WindowToolbar + content

**Files:**
- `apps/desktop/src/components/NavSidebar.tsx` (NEW)
- `apps/desktop/src/components/WindowToolbar.tsx` (NEW)
- `apps/desktop/src/components/AppLayout.tsx` (REWRITE)
- `apps/desktop/src/components/AppHeader.tsx` (REMOVE or repurpose)
- `apps/desktop/src/components/Sidebar.tsx` (REMOVE or slim down)

### Phase 3: Tab System (Days 5-7)

1. **Create tab store hook** `useTabs.ts`
   - Manage tab list, active tab, CRUD operations
   - Persist to localStorage
   - Restore on launch

2. **Create TabBar component**
   - Horizontal scroll with fade edges
   - Tab rendering with close buttons
   - Active state styling
   - Middle-click to close
   - "+" add tab button

3. **Create Tab component**
   - Label, icon, close button
   - Tooltip with full path
   - Context menu (Close, Close Others, Close All)

4. **Tab-to-content wiring**
   - `AppContent` renders based on active tab
   - Tab switch animates content transition

**Files:**
- `apps/desktop/src/hooks/useTabs.ts` (NEW)
- `apps/desktop/src/components/TabBar.tsx` (NEW)
- `apps/desktop/src/components/Tab.tsx` (NEW)
- `apps/desktop/src/App.tsx` (UPDATE)
- `apps/desktop/src/styles/globals.css` (UPDATE - tab styles)

### Phase 4: Split View (Days 8-10)

1. **Create Resizable components**
   - `ResizablePanelGroup` — flex container
   - `ResizablePanel` — flex child with size tracking
   - `ResizableHandle` — draggable divider

2. **Create split view store** (integrate into useTabs)
   - Toggle split on/off
   - Track active pane
   - Second pane tab selection

3. **Update content area**
   - When split view active: render two panels side by side
   - Each panel shows its own project/tab content
   - Active panel highlight

4. **Add toolbar toggle button**
   - Icon: `LayoutPanelLeft` or custom split view icon
   - Dropdown to select split mode (standard/linked)

**Files:**
- `apps/desktop/src/components/ResizablePanelGroup.tsx` (NEW)
- `apps/desktop/src/components/ResizablePanel.tsx` (NEW)
- `apps/desktop/src/components/ResizableHandle.tsx` (NEW)
- `apps/desktop/src/hooks/useSplitView.ts` (NEW)
- `apps/desktop/src/App.tsx` (UPDATE)
- `apps/desktop/src/components/AppLayout.tsx` (UPDATE)

### Phase 5: Infusion Enhancement (Day 11)

1. **Add noise overlay** to background component
   - Canvas-generated noise texture
   - Configurable intensity/scale in settings

2. **Add per-page backgrounds**
   - Store background config per route/page
   - Toggle for "same for all pages"

3. **Add video idle pause**
   - Detect idle via pointer/keyboard events
   - Pause/resume video element

**Files:**
- `apps/desktop/src/components/BackgroundLayer.tsx` (UPDATE)
- `apps/desktop/src/components/BackgroundSettings.tsx` (UPDATE)
- `apps/desktop/src/hooks/useBackground.ts` (UPDATE)
- `packages/types/src/index.ts` (UPDATE - add noise config)

### Phase 6: Polish & Testing (Day 12)

1. **Animation refinements**
   - Tab open/close animations
   - Split view toggle animation
   - Panel resize smoothness

2. **Responsive behavior**
   - Split view collapses on small screens
   - Tab bar adaptive sizing

3. **Edge cases**
   - What happens when last tab is closed? → Show home
   - Tab limit (max 20) → Warn user
   - Split view with only one project → Disable split button

---

## 7. File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `apps/desktop/src/components/NavSidebar.tsx` | Compact icon sidebar |
| `apps/desktop/src/components/WindowToolbar.tsx` | Custom title bar + actions |
| `apps/desktop/src/hooks/useTabs.ts` | Tab state management + persistence |
| `apps/desktop/src/components/TabBar.tsx` | Scrollable tab bar |
| `apps/desktop/src/components/Tab.tsx` | Individual tab component |
| `apps/desktop/src/components/ResizablePanelGroup.tsx` | Split view container |
| `apps/desktop/src/components/ResizablePanel.tsx` | Split view panel |
| `apps/desktop/src/components/ResizableHandle.tsx` | Draggable divider |
| `apps/desktop/src/hooks/useSplitView.ts` | Split view state |

### Modified Files
| File | Changes |
|------|---------|
| `packages/types/src/index.ts` | Add Tab, TabGroup, SplitViewState, noise config types |
| `apps/desktop/src/styles/globals.css` | New design tokens, progressive blur, tab styles, resizable styles |
| `apps/desktop/src/App.tsx` | Integrate tabs, split view, new layout |
| `apps/desktop/src/components/AppLayout.tsx` | Rewrite layout structure |
| `apps/desktop/src/components/BackgroundLayer.tsx` | Add noise, per-page, idle pause |
| `apps/desktop/src/components/BackgroundSettings.tsx` | Add noise controls, per-page toggle |
| `apps/desktop/src/hooks/useBackground.ts` | Add noise config, per-page storage |

### Deprecated Files
| File | Replacement |
|------|-------------|
| `apps/desktop/src/components/AppHeader.tsx` | WindowToolbar.tsx |
| `apps/desktop/src/components/Sidebar.tsx` | NavSidebar.tsx |

---

## Appendix: Key Sigma Design Patterns to Port

### 1. Horizontal Scroll Fade
```css
.horizontal-scroll-fade {
  --left-fade: 0;
  --right-fade: 0;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black var(--left-fade),
    black calc(100% - var(--right-fade)),
    transparent 100%
  );
  mask-image: linear-gradient(...);
}
```

### 2. Tab Active Indicator
```css
.tab[is-active="true"]::after {        /* Subtle glow line at bottom */
  background-color: hsl(var(--primary) / 40%);
  box-shadow: 0 0 8px hsl(var(--primary) / 90%);
}
```

### 3. Window Drag Handling
```typescript
// On pointerdown on toolbar (excluding tab-bar area):
// - Track drag distance
// - If > threshold, call appWindow.startDragging()
// - Suppress click after drag
```

### 4. Toolbar Color = Background-2
Sigma uses `--background-2` for the window toolbar, creating a subtle depth separation from the main content area which uses `--background-3`.

---

## Next Steps

1. Review this plan and confirm priorities
2. Begin Phase 1: Design System Refresh
3. Proceed through phases sequentially (each builds on the previous)
