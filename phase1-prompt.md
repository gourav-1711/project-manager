# Project: Dev Project Organizer — Phase 1

## Context

I'm building a desktop app to solve my own daily friction as a freelance developer: I jump between multiple client projects and constantly lose time navigating file explorer, opening CMD in the right folder, launching the right IDE, and starting the right AI agent CLI for each one. This app is a lightweight launcher + organizer for that workflow.

This is a **monorepo (Turborepo)** that will eventually contain a desktop app and a separate marketing landing page, sharing some packages. We are building **Phase 1 only** right now: the monorepo scaffold, the project registry, and quick-launch functionality. Do not build todos, error lists, timeline, skills section, mobile share, or the landing page yet — those are later phases.

## Tech stack (fixed, do not substitute)

- **Monorepo**: Turborepo, pnpm workspaces
- **Desktop app**: Tauri 2.x, React (TypeScript), Vite
- **UI components**: shadcn/ui + Tailwind CSS
- **Local database**: SQLite via `tauri-plugin-sql`
- **Backend logic**: Rust (Tauri commands) for file system access and process spawning

## Monorepo structure to scaffold

```
/apps
  /desktop              → Tauri app
/packages
  /db                    → SQLite schema + query helpers, shared TS types for DB rows
  /ui                     → shared shadcn-based components
  /types                  → shared TypeScript types (Project, etc.)
  /config                 → shared eslint/tsconfig
```

Only scaffold `/apps/desktop` fully in this phase. Create the `/packages` directories with minimal working setups (proper package.json, tsconfig, exports) but only populate them with what Phase 1 actually needs — don't pre-build empty abstractions for features that don't exist yet.

## Phase 1 features to build

### 1. Project Registry

A local registry of the user's dev projects.

**Data model** (in `/packages/db`):
- `projects` table: `id` (uuid), `name` (string), `path` (string, absolute filesystem path), `description` (string, optional), `created_at`, `updated_at`, `last_opened_at` (nullable)

**Functionality:**
- Add a project: user picks a folder via native OS folder picker (Tauri dialog plugin), name auto-fills from folder name but is editable, optional description field
- List all projects: card or list view, show name, path, last opened time
- Remove a project from the registry (does NOT delete files from disk — just removes the registry entry, confirm this with a dialog before removing)
- Edit a project's name/description
- Persist everything in SQLite via `tauri-plugin-sql`, survive app restarts

### 2. Quick Launch

For each registered project, let the user launch tools scoped to that project's path with one click.

**Tools to support in v1:**
- Open in file explorer (OS-native: Explorer on Windows, Finder on Mac, configurable file manager on Linux)
- Open a terminal/CMD at the project path (Windows Terminal/cmd on Windows, Terminal.app on Mac, user's default terminal on Linux)
- Open in VS Code (`code <path>`)
- Open in Cursor (`cursor <path>`)
- Launch Claude Code in a terminal at the project path (`claude` command, run inside a terminal opened at that path — does not need to be a special integration, just spawn a terminal with the command queued/typed)

**Implementation notes:**
- Use Tauri's Rust `Command` API to spawn these as detached child processes — the app must NOT wait on or hold a handle that blocks the UI, and closing the organizer app must NOT kill the launched process
- Handle the fact that exact commands differ by OS (Windows/Mac/Linux) — write this with per-OS branches in Rust, not assumptions
- If a tool isn't installed/found (e.g. `code` not in PATH), fail gracefully with a clear error message in the UI, don't crash
- Make the set of launchable tools per project configurable later (not now) — for now a fixed list of buttons per project card is fine, but write the launch logic as a generic "run this command in this directory" function rather than hardcoding each tool separately, so adding tools later is just adding a config entry, not new code paths

### 3. UI requirements

- Use shadcn/ui components (Card, Button, Dialog, Input, etc.) — keep the design clean and minimal, this is a utility tool, not a marketing surface
- Main view: list/grid of project cards, each showing name, path, last opened, and a row of quick-launch buttons
- Empty state when no projects are registered yet, with a clear "Add Project" call to action
- "Add Project" opens a dialog with the native folder picker

## Non-functional requirements (important)

- **RAM/performance discipline**: no polling loops, no unnecessary re-renders. This app needs to be able to run lightly in the background later (system tray mode comes in a future phase) — don't write anything now that would make that harder, e.g. avoid global intervals, avoid loading all project data eagerly if it's not needed for the visible view
- **Data layer separation**: all SQLite queries should live in `/packages/db`, not inline in React components. The desktop app should call typed functions from this package, not raw SQL scattered through the UI. This matters because the DB layer needs to stay clean for future phases (todos, errors, timeline, skills will all extend this schema)
- Write Rust command functions with clear error handling (`Result<T, String>` or a proper error enum) — surface errors to the frontend in a usable way, don't let Rust panics crash the app

## What I want from you

1. Scaffold the full Turborepo structure described above
2. Set up the Tauri + React + shadcn app in `/apps/desktop`
3. Implement the `/packages/db` schema and query functions for the `projects` table
4. Build the Project Registry UI (add/list/edit/remove projects)
5. Implement Quick Launch for the 5 tools listed, with proper per-OS handling in Rust
6. Confirm the dev loop works end-to-end: `pnpm dev` (or equivalent) launches the Tauri app in dev mode with hot reload

Ask me before making assumptions on: exact terminal command syntax per OS if you're unsure, and how to detect "tool not installed" cleanly. Otherwise, proceed and explain key decisions briefly as you go (not a full essay per step — short rationale is enough).

Do not implement todos, error tracking, timeline, skills section, mobile-to-desktop sharing, or the landing page in this phase. Flag clearly in your output if you think something from a later phase is unavoidably needed now (e.g. a shared type that later features will also use) rather than silently building ahead of scope.
