# Dev Project Organizer — Task Tracker

> Last updated: July 11, 2026

---

## Phase 1 ✅ — Project Registry + Quick Launch

**Status: DONE**

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Scaffold Turborepo + pnpm workspaces | ✅ | `turbo.json`, `pnpm-workspace.yaml`, root `package.json` |
| 1.2 | Create packages (db, ui, types, config) with package.json + tsconfig | ✅ | |
| 1.3 | Set up Tauri 2.x + React + Vite in `/apps/desktop` | ✅ | |
| 1.4 | Install and configure shadcn/ui + Tailwind CSS v4 | ✅ | |
| 1.5 | Create SQLite migration for `projects` table in Rust | ✅ | Migration v1 |
| 1.6 | Implement DB query functions in `packages/db/src/projects.ts` | ✅ | getProjects, createProject, updateProject, deleteProject, touchLastOpened |
| 1.7 | Create `useProjects` hook with optimistic updates | ✅ | |
| 1.8 | Build AddProjectDialog with native folder picker | ✅ | Auto-fills name from folder basename |
| 1.9 | Build EditProjectDialog | ✅ | Name + description |
| 1.10 | Build DeleteConfirm dialog | ✅ | Registry only, no files deleted |
| 1.11 | Build EmptyState component | ✅ | |
| 1.12 | Build ProjectCard with quick-launch buttons + last opened | ✅ | |
| 1.13 | Build ProjectDetail view (navigation from card click) | ✅ | |
| 1.14 | Implement Quick Launch: Explorer, Terminal, VS Code, Cursor, Claude | ✅ | Per-OS in `launch.ts` + generic Rust `launch_tool` |
| 1.15 | Implement detached process spawning in Rust | ✅ | Windows: DETACHED_PROCESS, Unix: process_group(0) |
| 1.16 | Wire main App.tsx with list/detail navigation | ✅ | |

---

## Phase 2 ✅ — Todos + Error List

**Status: DONE**

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Create SQLite migration for `todos` table | ✅ | Migration v2 |
| 2.2 | Create SQLite migration for `errors` table | ✅ | Migration v3 |
| 2.3 | Implement Todo DB functions | ✅ | getTodos, createTodo, updateTodo, deleteTodo |
| 2.4 | Implement Error DB functions | ✅ | getErrors, createError, markErrorFixed, deleteError |
| 2.5 | Add Todo + Error types to `@workspace/types` | ✅ | |
| 2.6 | Create Tabs component | ✅ | Accessible, no radix dep |
| 2.7 | Build TodosTab UI (add, checkbox toggle, delete, filter) | ✅ | |
| 2.8 | Build ErrorsTab UI (add with severity picker, mark fixed, delete, filter) | ✅ | |
| 2.9 | Create useTodos hook | ✅ | |
| 2.10 | Create useErrors hook | ✅ | |
| 2.11 | Integrate into ProjectDetail with tab switching | ✅ | |

---

## Phase 3 ✅ — Mobile Share Feature

**Status: DONE** — Full mobile-to-laptop share feature implemented.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | ShareDialog with QR code (project path) | ✅ | `qrcode` library |
| 3.2 | JSON export functionality | ✅ | `write_text_file` Rust command |
| 3.3 | Add Rust HTTP server (axum) + deps | ✅ | axum, tokio, local-ip-address in Cargo.toml |
| 3.4 | LAN IP detection in Rust | ✅ | `local-ip-address` crate in `share_server.rs` |
| 3.5 | Create shared_items table migration | ✅ | Migration v5 in `lib.rs` |
| 3.6 | GET / → mobile HTML page | ✅ | Embedded in `share_server.rs` as const |
| 3.7 | POST /send-text + POST /send-file | ✅ | Text via Form, files via Multipart → saved to temp dir |
| 3.8 | GET /messages (via Tauri command) | ✅ | `get_shared_items` reads from server's in-memory store |
| 3.9 | Tauri event on new item | ✅ | `emit("new-shared-item")` from server handlers |
| 3.10 | Live-updating items list in ShareDialog | ✅ | `useSharedItems` hook listens for events |
| 3.11 | Mobile web page (HTML/CSS/JS) | ✅ | Embedded in Rust, dark theme, text + file upload |
| 3.12 | Security notice in UI | ✅ | Amber warning in ShareDialog |
| 3.13 | Server lifecycle: start/stop | ✅ | On-demand via Share panel, graceful shutdown via oneshot |

### Key Files Created/Modified
- `apps/desktop/src-tauri/src/share_server.rs` — axum server, routes, mobile page
- `apps/desktop/src-tauri/src/lib.rs` — migrations, commands, state management
- `apps/desktop/src/hooks/useSharedItems.ts` — server lifecycle + event listener
- `apps/desktop/src/components/ShareDialog.tsx` — QR codes, received items, security notice
- `packages/types/src/index.ts` — SharedItem type
- `packages/db/src/shared_items.ts` — DB functions

---

## Phase 4 ✅ — System Tray / Background Mode

**Status: DONE** — Close-to-tray, tray menu, autostart setting, background mode audit.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Close-to-tray on window close | ✅ | `WindowEvent::CloseRequested` → hide + prevent_close |
| 4.2 | Tray icon with Show/Quit context menu | ✅ | `TrayIconBuilder` with menu items |
| 4.3 | Left-click tray toggles window | ✅ | Show/hide via `TrayIconEvent::Click` |
| 4.4 | Add tauri-plugin-autostart | ✅ | Cargo.toml + lib.rs registration |
| 4.5 | Autostart check/set (via plugin JS bindings) | ✅ | `isEnabled`/`enable`/`disable` from `@tauri-apps/plugin-autostart` |
| 4.6 | Settings view with autostart toggle | ✅ | `SettingsDialog.tsx` with accessible switch (role="switch", aria-checked) |
| 4.7 | Audit polling/intervals for background mode | ✅ | No polling loops exist. `useSharedItems` uses Tauri events (not polling). Share server only runs on-demand. Settings button accessible via gear icon in header. |

### Key Files Created/Modified
- `apps/desktop/src/components/SettingsDialog.tsx` — Settings dialog with autostart toggle + tray info
- `apps/desktop/src/App.tsx` — Added gear icon button + SettingsDialog wiring

---

## Phase 5 ✅ — Skills Section

**Status: DONE** — Full skills catalog, install through UI, per-project tracking.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Create project_skills table migration | ✅ | Migration v4 in `lib.rs` |
| 5.2 | Add Skill + ProjectSkill types | ✅ | In `@workspace/types` |
| 5.3 | Implement Rust install_skill command | ✅ | 120s timeout, output capture, kill on timeout |
| 5.4 | Register install_skill in invoke_handler | ✅ | Done during Phase 3 |
| 5.5 | Create skills catalog JSON | ✅ | `packages/db/skills.json` with 8 real skills |
| 5.6 | Add skills entries | ✅ | ponytail, shadcn, design-taste, agent-browser, prisma, cloudflare, seo, security |
| 5.7 | Build useSkills hook | ✅ | Loads catalog, tracks installed, calls install via invoke |
| 5.8 | Build Skills tab in ProjectDetail UI | ✅ | `SkillsTab.tsx` component |
| 5.9 | Browseable skills list with Add button | ✅ | Filter by all/available/installed |
| 5.10 | Per-project install status tracking | ✅ | Via `project_skills` table + `addProjectSkill`/`removeProjectSkill` |
| 5.11 | Surface npx install success/failure in UI | ✅ | Toast + inline state indicator per skill |

### Key Files Created/Modified
- `packages/db/skills.json` — Static skills catalog
- `packages/db/src/skills.ts` — DB functions + catalog loader
- `apps/desktop/src/hooks/useSkills.ts` — Skills state + install orchestration
- `apps/desktop/src/components/SkillsTab.tsx` — Browse, filter, install/remove skills
- `apps/desktop/src/components/ProjectDetail.tsx` — Added Skills tab

---

## Phase 6 ✅ — Timeline / Planning

**Status: DONE** — Full per-project timeline with add/edit/delete, month grouping, inline status.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Create timeline_items table migration | ✅ | Migration v6 in `lib.rs` |
| 6.2 | Add TimelineItem + related types | ✅ | In `@workspace/types` |
| 6.3 | Implement Timeline DB functions | ✅ | `getTimelineItems`, `createTimelineItem`, `updateTimelineItem`, `deleteTimelineItem` |
| 6.4 | Build useTimeline hook | ✅ | Sorted insertion by date, status updates, CRUD |
| 6.5 | Build Timeline tab in ProjectDetail UI | ✅ | `TimelineTab.tsx` component |
| 6.6 | Chronological list grouped by month | ✅ | Grouped by month with visual timeline connectors |
| 6.7 | Add/edit/delete timeline items form | ✅ | Title, description, start/end dates, status picker |
| 6.8 | Inline status updates | ✅ | Dropdown per item for planned → in_progress → done |

### Key Files Created/Modified
- `packages/db/src/timeline.ts` — DB query functions
- `packages/types/src/index.ts` — TimelineItem types
- `apps/desktop/src/hooks/useTimeline.ts` — Timeline state hook
- `apps/desktop/src/components/TimelineTab.tsx` — Full UI: add form, month-grouped list, status, delete
- `apps/desktop/src-tauri/src/lib.rs` — Migration v6 added

---

## Phase 7 ❌ — Landing Page

**Status: NOT STARTED — Next.js scaffold exists but content is default**

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Replace default Next.js page with marketing hero | ❌ | |
| 7.2 | Add feature highlights section | ❌ | Placeholder screenshots OK |
| 7.3 | Add footer (GitHub, contact) | ❌ | |
| 7.4 | Configure metadata (title, description) | ❌ | |
| 7.5 | Verify `next build` works | ❌ | |

---

## Package Summary

| Package | Path | Purpose | Status |
|---------|------|---------|--------|
| `@workspace/db` | `packages/db/` | SQLite query functions, re-exports | ✅ |
| `@workspace/ui` | `packages/ui/` | shadcn/ui components (button, card, dialog, etc.) | ✅ |
| `@workspace/types` | `packages/types/` | Shared domain types (Project, Todo, Error, Skill) | ✅ |
| `@workspace/config` | `packages/config/` | tsconfig.base.json | ✅ |

## Migration History

| Version | Description | Status |
|---------|-------------|--------|
| v1 | create_projects_table | ✅ |
| v2 | create_todos_table | ✅ |
| v3 | create_errors_table | ✅ |
| v4 | create_project_skills_table | ✅ |
| v5 | create_shared_items_table | ✅ |

## Rust Commands

| Command | Purpose | Registered in invoke_handler | Status |
|---------|---------|------------------------------|--------|
| `launch_tool` | Spawn external tool detached | ✅ Yes | ✅ |
| `write_text_file` | Write JSON string to file | ✅ Yes | ✅ |
| `install_skill` | Run `npx` install with timeout | ✅ Yes | ✅ |
| `start_share_server` | Start axum HTTP server for mobile share | ✅ Yes | ✅ |
| `stop_share_server` | Stop share server via oneshot channel | ✅ Yes | ✅ |
| `get_shared_items` | Return received items from server memory | ✅ Yes | ✅ |
