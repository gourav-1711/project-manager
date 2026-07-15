# Desktop App Redesign Plan — Sidebar + Glassmorphism + Global CSS

## Goals
- Replace the generic centered card layout with a professional sidebar + header desktop app layout
- Apply glassmorphism (backdrop-blur, frosted glass panels) throughout
- Animate everything (entry, navigation, transitions)
- Centralize UI tokens in a global CSS file

## Architecture

```
┌─────────────────────────────────────────────┐
│  Header (app name, search, quick actions)   │
├──────────┬──────────────────────────────────┤
│ Sidebar  │  Content Area                     │
│ ───────  │  ┌────────────────────────────┐  │
│ • Home   │  │                            │  │
│ • Proj 1 │  │  (project cards grid or    │  │
│ • Proj 2 │  │   project detail view)     │  │
│ • Proj 3 │  │                            │  │
│ ───────  │  └────────────────────────────┘  │
│ ⚙ Settings│                                  │
└──────────┴──────────────────────────────────┘
```

## Phase Plan

### Phase 1: Global CSS Foundation
- Create `apps/desktop/src/styles/globals.css` with:
  - CSS custom properties for glass tokens
  - Sidebar/header layout variables
  - Glassmorphism utility classes
  - Scrollbar styling
  - Transition defaults

### Phase 2: Layout Shell
- Create `AppLayout` component in `App.tsx`
- Sidebar component with project list + navigation
- Header component with branding + actions
- Animated content area transitions

### Phase 3: Sidebar
- Glassmorphism sidebar panel
- Project list with animated items
- Active state indicator
- Settings link at bottom
- Collapsible (animated)

### Phase 4: Header
- Glassmorphism header bar
- App logo/branding
- Search bar (optional)
- Add Project button
- Settings icon

### Phase 5: Content Area
- Glass card grid for project list
- Empty state with glass effect
- Animated transitions between views
- Scrollable content panel

### Phase 6: Dialogs & Tabs
- Glassmorphism dialog overlays
- Animated tab system
- Glass cards for todos/errors/timeline/skills

### Phase 7: Polish
- Hover states on all interactive elements
- Entry/exit animations
- Loading skeletons with glass effect
- Reduced motion support
