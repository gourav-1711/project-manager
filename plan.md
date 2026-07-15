# Dev Project Organizer — Phase Plan

## Overview

A desktop app for managing multiple dev projects: register projects, launch tools (terminal, editor, AI agent), track todos/errors, share to mobile, manage AI skills, plan work timelines, and a marketing landing page.

**Monorepo:** Turborepo + pnpm workspaces
**Desktop:** Tauri 2.x + React 19 + TypeScript + shadcn/ui + Tailwind CSS v4
**Database:** SQLite via `tauri-plugin-sql`
**Landing:** Next.js 15 (separate app, not bundled with desktop)

---

## Phase 1 ✅ — Project Registry + Quick Launch

**Status: COMPLETE** — All features implemented and working.

### Features
- Scaffold Turborepo with 4 packages (`db`, `ui`, `types`, `config`)
- Tauri 2.x desktop app in `/apps/desktop`
- SQLite database with `projects` table (id, name, path, description, created_at, updated_at, last_opened_at)
- CRUD operations for projects via `@workspace/db`
- Native folder picker on "Add Project" (Tauri dialog plugin)
- Project cards showing name, path, last opened time, quick-launch buttons
- Quick Launch: Open in Files, Terminal, VS Code, Cursor, Claude Code
- Per-OS command handling in Rust (Windows/Mac/Linux)
- Detached process spawning (child survives app close)
- `command_exists` check before launching tools
- Empty state when no projects registered
- Edit/Delete project dialogs
- Optimistic local updates in `useProjects` hook
- No polling loops (RAM discipline)

### Key Files
- `apps/desktop/src/App.tsx` — Main list view
- `apps/desktop/src/components/ProjectCard.tsx` — Card + QuickLaunch
- `apps/desktop/src/components/ProjectDialog.tsx` — Add/Edit dialogs
- `apps/desktop/src/components/DeleteConfirm.tsx` — Remove confirm
- `apps/desktop/src/components/EmptyState.tsx` — Empty state
- `apps/desktop/src/hooks/useProjects.ts` — Project state hook
- `apps/desktop/src/lib/launch.ts` — Tool meta + per-OS command builders
- `apps/desktop/src-tauri/src/lib.rs` — Rust commands (launch_tool, write_text_file)
- `packages/db/src/projects.ts` — DB query functions

---

## Phase 2 ✅ — Todos + Error List

**Status: COMPLETE** — All features implemented and working.

### Features
- `todos` table: id, project_id (FK), title, done, created_at, updated_at
- `errors` table: id, project_id (FK), description, severity (low/medium/high), status (open/fixed), created_at, fixed_at
- Todolist: add (single input + enter), toggle done/not done, delete, filter (all/active/done)
- Error list: add (description + severity picker), mark as fixed (sets fixed_at), delete, filter (all/open/fixed)
- Both features scoped per-project in the ProjectDetail view
- Tabs component for switching between Todos and Errors
- Data layer in `@workspace/db` — no inline SQL in components

### Key Files
- `apps/desktop/src/components/ProjectDetail.tsx` — Detail view with tabs
- `apps/desktop/src/components/Tabs.tsx` — Accessible tab component
- `apps/desktop/src/components/TodosTab.tsx` — Todo list UI
- `apps/desktop/src/components/ErrorsTab.tsx` — Error list UI
- `apps/desktop/src/hooks/useTodos.ts` — Todo state hook
- `apps/desktop/src/hooks/useErrors.ts` — Error state hook
- `packages/db/src/todos.ts` — Todo DB query functions
- `packages/db/src/errors.ts` — Error DB query functions

---

## Phase 3 ⬜ — Mobile Share Feature

**Status: PARTIAL** — ShareDialog with QR code + JSON export exists.
**Missing:** Rust HTTP server, mobile web page, shared_items table, Tauri events, live-updating receive list.

### What's Built
- `ShareDialog.tsx` — QR code from project path (qrcode lib), JSON export (write_text_file Rust command), copy path button

### Remaining Work
- [ ] Add Rust HTTP server (axum or tiny_http) bound to LAN IP
- [ ] LAN IP detection via Rust crate (local-ip-address)
- [ ] `shared_items` table migration: id, type, content_or_path, received_at
- [ ] GET / → serve mobile-friendly HTML page (text input + send, file picker + upload)
- [ ] POST /send → accept JSON text or multipart file upload, store in shared_items
- [ ] GET /messages → return recent shared_items as JSON (used by desktop)
- [ ] Tauri event from Rust server on new item (avoid polling)
- [ ] Live-updating received items list in UI (text + image thumbnails)
- [ ] Mobile page: plain HTML/CSS/JS, text input + file picker, send confirmation
- [ ] Security notice in UI: "Anyone on your wifi with this QR code or link can send you items"

### Key Decisions
- Server starts on-demand when user opens Share panel (vs. on app startup)
- Use axum (async, more capable) or tiny_http (lighter weight)
- QR code encodes `http://<lan-ip>:<port>`
- No auth, same-wifi trust model

---

## Phase 4 ⬜ — System Tray / Background Mode

**Status: PARTIAL** — Close-to-tray, tray icon with menu, tray click toggle work.
**Missing:** "Launch on system startup" setting with Tauri autostart plugin.

### What's Built
- `WindowEvent::CloseRequested` → hide window + prevent_close ✅
- Tray icon with "Show Window" / "Quit" context menu ✅
- Left-click tray icon toggles window visibility ✅

### Remaining Work
- [ ] Add `tauri-plugin-autostart` to Cargo.toml
- [ ] Add Rust command to check/set autostart
- [ ] Add settings view (minimal) with autostart toggle
- [ ] Audit existing intervals/polling for RAM discipline when backgrounded

---

## Phase 5 ⬜ — Skills Section

**Status: PARTIAL** — DB schema, Rust command, TypeScript types exist.
**Missing:** Skills catalog JSON, UI tab, frontend hook, register install_skill command.

### What's Built
- `project_skills` table: project_id, skill_id, added_at (PK composite) ✅
- TypeScript types: Skill, ProjectSkill, InstallSkillInput ✅
- Rust `install_skill` command with 120s timeout, piped output capture, kill-on-timeout ✅

### Remaining Work
- [ ] Register `install_skill` in invoke_handler (currently only launch_tool + write_text_file)
- [ ] Create skills catalog JSON (hardcoded in repo, e.g. `packages/db/skills.json`)
- [ ] Add placeholder skills entries (2-3)
- [ ] Skills tab in ProjectDetail UI
- [ ] useSkills hook
- [ ] Browseable skills list with Add to Project button per skill
- [ ] Per-project install status tracking
- [ ] Surface npx install success/failure in UI

---

## Phase 6 ❌ — Timeline / Planning

**Status: NOT STARTED** — Nothing implemented yet.

### Work Required
- [ ] `timeline_items` table: id, project_id (FK), title, description (optional), start_date, end_date (nullable), status (planned/in_progress/done), created_at, updated_at
- [ ] DB query functions in `@workspace/db`
- [ ] useTimeline hook
- [ ] Timeline tab in ProjectDetail UI
- [ ] Chronological list view grouped by week/month
- [ ] Add/edit/delete timeline items form (title, description, start/end dates, status)
- [ ] Inline status updates
- [ ] Keep separate from todos (todos = quick capture, timeline = planned work)

---

## Phase 7 ❌ — Landing Page

**Status: NOT STARTED** — Next.js app scaffold exists but is just create-next-app defaults.

### Work Required
- [ ] Replace default page.tsx with marketing content
- [ ] Hero: app name, value prop, download CTA
- [ ] Feature highlights section with screenshots (placeholders)
- [ ] Simple footer: GitHub link, contact link
- [ ] Tailwind + consistent visual language
- [ ] Verify `next build` works for Vercel deploy

---

## Architecture Notes

### Monorepo Structure
```
/ (root)
  turbo.json
  pnpm-workspace.yaml
  package.json
  apps/
    desktop/        → Tauri 2.x + React app
      src/          → React frontend
        components/ → UI components
        hooks/      → State hooks
        lib/        → Utilities (launch.ts)
      src-tauri/    → Rust backend
        src/
          lib.rs    → Tauri commands + plugins + tray
          main.rs   → Entry point
    landing/        → Next.js marketing site
  packages/
    db/             → SQLite queries + exports
    ui/             → Shared shadcn components
    types/          → Shared TypeScript domain types
    config/         → Shared tsconfig
```

### Data Layer Pattern
- All SQL queries in `packages/db/`, never inline in components
- Functions return typed domain objects (camcelCase)
- Internal DB rows are snake_case, mapped via `toDomain()` functions
- Hooks (useProjects, useTodos, useErrors) wrap DB calls with optimistic local state

### Rust Backend Pattern
- Generic `spawn_detached()` function for tool launching
- Per-OS command building in frontend `launch.ts`, not Rust
- `command_exists()` check before spawning
- Detached processes survive app close
- Error handling via `LaunchResult { success, error }` pattern

### RAM/Performance Discipline
- No polling loops
- Data loaded once on mount, updated optimistically
- No global intervals
- Background-friendly (tray mode ready)
