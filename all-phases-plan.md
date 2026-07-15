# Dev Project Organizer — Full Phase Plan & Prompts

Phase 1 is the only phase ready to run as-is (see `phase1-prompt.md`). Phases 2-7 below are fully scoped — every decision is made — but each has a short "finalize before running" step because they depend on exact details from the phase before them (table names, function signatures Claude Code actually generated, etc.). Pasting them in blind risks the agent guessing at an interface that already exists differently. Finalizing takes 2 minutes once the prior phase is done: open `/packages/db`, confirm table/column names match what's written below, adjust if not.

---

## Phase 2: Todos + Error List

### Scope
Per-project todos and per-project error/bug tracking. Two separate tables, not merged — they answer different questions ("what do I need to do" vs "what's currently broken").

### Before running: confirm
- Exact `projects` table column names from Phase 1 (should be `id`, `name`, `path`, `description`, `created_at`, `updated_at`, `last_opened_at` — confirm `id` type, likely TEXT/uuid)
- Confirm the query function naming pattern used in `/packages/db` for projects (e.g. `getProjects()`, `createProject()`) so todos/errors follow the same convention

### Prompt

```
Continue building the Dev Project Organizer (Turborepo + Tauri + React + shadcn,
SQLite via tauri-plugin-sql). Phase 1 (project registry + quick launch) is done.

Add two new features, both scoped per-project:

1. TODOS
Data model in /packages/db, table `todos`:
- id (uuid), project_id (FK -> projects.id), title (string), done (boolean,
  default false), created_at, updated_at

Functionality:
- Within a project's detail view, list todos for that project
- Add a todo (just a title, keep it fast to add — single input + enter to submit)
- Toggle done/not done
- Delete a todo
- Simple filter: show all / active / done

2. ERROR LIST
Data model in /packages/db, table `errors`:
- id (uuid), project_id (FK -> projects.id), description (string),
  severity (enum: low/medium/high, default medium), status (enum: open/fixed,
  default open), created_at, fixed_at (nullable)

Functionality:
- Within the same project detail view (separate tab/section from todos, not merged),
  list errors for that project
- Add an error: description + severity
- Mark as fixed (sets status + fixed_at timestamp)
- Filter: show all / open / fixed
- Sort/highlight by severity in the open list

UI: follow the existing shadcn patterns established in Phase 1. Add a project
detail view/page (if one doesn't exist yet) reachable by clicking a project
card — this becomes the home for todos, errors, and future features (timeline,
skills) as tabs or sections.

Data layer: all queries go in /packages/db following the same pattern as the
existing projects queries. Do not inline SQL in components.

Confirm the existing projects table schema before writing foreign keys —
state what you found before proceeding.
```

---

## Phase 3: Mobile Share Feature

### Scope
Local HTTP server (Rust) + QR code + a minimal mobile web page for sending text/images from phone to laptop over the same wifi. No cloud, no auth (same-wifi trust model, stated clearly in UI).

### Before running: confirm
- Whether you want received items to optionally save into a specific project (e.g. attach an image to a project) or just land in a general inbox — recommend general inbox for v1, decide before running
- Confirm Tauri 2.x plugin choice for local IP detection (Rust crate `local-ip-address` is the default assumption)

### Prompt

```
Continue building the Dev Project Organizer (Turborepo + Tauri + React + shadcn,
SQLite via tauri-plugin-sql).

Add a mobile-to-laptop share feature:

BACKEND (Rust, inside Tauri):
- Start a lightweight local HTTP server (use `axum` or `tiny_http`) bound to the
  laptop's LAN IP, on app startup or on-demand when the user opens the "Share"
  panel (your choice, explain tradeoff)
- Get the LAN IP via a Rust crate (e.g. local-ip-address)
- Routes:
  - GET /  → serves a single static mobile-friendly HTML page (text input +
    send button, file/image picker + upload button)
  - POST /send → accepts JSON {type: "text", content: string} or multipart
    file upload for images, stores into a local `shared_items` table
    (id, type, content_or_path, received_at)
  - GET /messages → (used by desktop app, not the phone) returns recent
    shared_items as JSON

FRONTEND (desktop app):
- A "Share" panel/page showing:
  - A QR code encoding http://<lan-ip>:<port> (use a small JS QR lib)
  - A live-updating list of received items (poll /messages every few seconds
    OR use a Tauri event emitted from the Rust server on new item — prefer
    the event approach to avoid polling, given our RAM/performance discipline)
  - Received images render as thumbnails, text items render as plain text
    with a copy-to-clipboard button

MOBILE PAGE (the static HTML served at GET /):
- Minimal, mobile-friendly (no framework needed — plain HTML/CSS/JS is fine,
  this is intentionally simple)
- Text input + Send button
- File picker (accept images) + Upload button
- Clear visual confirmation on successful send

SECURITY/SCOPE — must include:
- A visible note in the Share panel UI: "Anyone on your wifi with this QR code
  or link can send you items. Same-network only, nothing leaves your machine."
- No auth, no persistence requirement beyond the local SQLite table — this is
  intentionally simple for v1

Confirm with me before choosing axum vs tiny_http if you have a strong reason
to prefer one — otherwise pick the lighter-weight option given our RAM goals
and proceed.
```

---

## Phase 4: System Tray / Background Mode

### Scope
Close-to-tray instead of quit, app stays resident in background, reopen from tray icon.

### Before running: confirm
- Nothing schema-related — this phase is mostly Tauri config + a small amount of Rust, low dependency on earlier phases. Safe to run any time after Phase 1.

### Prompt

```
Continue building the Dev Project Organizer (Tauri + React).

Add system tray / background mode:

- App minimizes to system tray on window close (does not quit) — use Tauri's
  tray icon API
- Tray icon has a context menu: "Open" (restores window), "Quit" (actually
  exits)
- Clicking the tray icon (left-click on Windows/Linux, click on Mac) restores
  the window
- App should genuinely idle at low RAM when minimized to tray — audit any
  existing intervals/polling from prior phases (especially the Share feature's
  /messages handling) and confirm nothing is running on a tight loop while
  backgrounded. Report what you found.
- Add a setting (simple toggle, can live in a minimal settings view) for
  "Launch on system startup" using Tauri's autostart plugin

Keep this phase small and focused — it's primarily Tauri configuration, not
new app logic.
```

---

## Phase 5: Skills Section

### Scope
Curated list of AI agent skills installable via `npx` into a project's `.agents/skills/` folder, one click from the project detail view.

### Before running: confirm
- You'll need to supply the actual curated list (name, npx command, short description) for the skills you currently use — Claude Code can't know which ones you have, you provide this as data
- Confirm where this list lives: hardcoded JSON in the repo for v1 (recommended) vs. fetched from a URL (defer this — adds a network dependency for no real benefit yet)

### Prompt

```
Continue building the Dev Project Organizer (Tauri + React + shadcn,
SQLite via tauri-plugin-sql).

Add a Skills section:

Data: a static JSON file in the repo (e.g. /packages/db/skills.json or similar)
containing a curated list of skills:
[{ id, name, description, npx_command }]
I will provide the actual list of skills — for now scaffold with 2-3
placeholder entries so the feature is testable.

UI: within a project's detail view, a "Skills" tab showing:
- Browseable list of available skills (from the static JSON) with name +
  description
- An "Add to project" button per skill
- A list of skills already added to this specific project (track this in a
  new `project_skills` table: project_id, skill_id, added_at — so the UI can
  show install status per project)

Backend (Rust, Tauri command):
- On "Add to project" click, run `npx <command>` with cwd set to the
  project's path (use the same Command-spawning pattern as Quick Launch in
  Phase 1 — reuse that logic, don't duplicate it)
- Surface success/failure clearly in the UI (npx install can fail — network,
  bad command, etc. — don't let this hang silently)
- Mark `project_skills` row as added only on confirmed success

Confirm the Quick Launch process-spawning function from Phase 1 before writing
new spawn logic — reuse it if the interface fits, extend it minimally if not.
```

---

## Phase 6: Timeline / Planning

### Scope
The one genuinely UI-heavy phase. Per-project timeline with planned tasks/milestones, basic date-range view.

### Before running: confirm
- Decide: simple list-with-dates view, or actual visual Gantt-style bars? Recommend starting with list-with-dates (sorted, grouped by week/month) — defer visual Gantt rendering, it's real UI effort for a feature you'll validate the need for first by using the simple version
- Confirm `todos` table isn't being conflated with this — timeline items are planning/scheduling, todos are quick capture, keep separate

### Prompt

```
Continue building the Dev Project Organizer (Tauri + React + shadcn,
SQLite via tauri-plugin-sql).

Add a Timeline/Planning feature, per project:

Data model, table `timeline_items`:
- id (uuid), project_id (FK), title (string), description (optional string),
  start_date (date), end_date (date, nullable — null means single-day item),
  status (enum: planned/in_progress/done, default planned), created_at,
  updated_at

UI: within a project's detail view, a "Timeline" tab:
- v1: a simple chronological list view, grouped by week or month, showing each
  item's title, date range, and status. NOT a visual Gantt chart yet — keep
  this list-based for now, we'll evaluate adding a visual bar view later based
  on actual use.
- Add/edit/delete timeline items via a form (title, description, start date,
  end date, status)
- Status can be updated inline (e.g. a small dropdown or click-to-cycle)
- Sort: chronological by start_date

Keep this clearly separate from the todos feature — todos are quick informal
capture, timeline items are planned/dated work. Don't let the UI or data model
blur these together.
```

---

## Phase 7: Landing Page

### Scope
Separate Next.js marketing site in `/apps/landing`, not part of the desktop app bundle.

### Before running: confirm
- Do this LAST, once the app has real screenshots/features to show — a landing page for a half-built app is wasted effort and you'll rewrite the copy anyway
- Decide hosting (Vercel is the obvious fit given Next.js + your past experience with it)

### Prompt

```
Add /apps/landing to the Turborepo — a Next.js marketing site for the Dev
Project Organizer desktop app.

This is a SEPARATE app from /apps/desktop — no shared runtime logic, but can
import shared UI components from /packages/ui if useful for visual consistency
(buttons, etc.) — don't force this if it doesn't fit Next.js cleanly.

Sections:
- Hero: app name, one-line value prop ("Stop losing time jumping between
  projects, terminals, and IDEs"), download/CTA button
- Feature highlights: project registry + quick launch, todos + error tracking,
  mobile share, skills manager, timeline — short description + (placeholder
  for now) screenshot per feature
- Simple footer: GitHub link (open source), contact/feedback link

Keep it a single-page site for v1 — no blog, no docs section yet. Use
Tailwind + shadcn for consistency with the desktop app's visual language.
Deploy target: Vercel (just confirm the build works with `next build`,
actual deployment is a manual step I'll do).

I will provide real screenshots and final copy once the app itself is further
along — use clearly marked placeholders for now.
```

---

## Sequencing reminder

1. Phase 1 — Turborepo scaffold, project registry, quick launch *(ready now)*
2. Phase 2 — Todos + error list
3. Phase 3 — Mobile share
4. Phase 4 — System tray / background mode
5. Phase 5 — Skills section
6. Phase 6 — Timeline
7. Phase 7 — Landing page (last, once there's something to show)

Don't run Phase N+1's prompt until Phase N is actually working end-to-end in your dev build — each "before running" checklist exists because skipping it means Claude Code guesses at an interface instead of matching what you actually have.
