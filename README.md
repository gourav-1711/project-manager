# Dev Project Organizer

A lightweight desktop app for managing dev projects. Stop losing time jumping between projects, terminals, and IDEs — bring your project tools into one place.

Built with **Tauri 2** (Rust + React + TypeScript) as a **Turborepo** monorepo.

## Features

| Feature | Description |
|---|---|
| **Project Registry** | Register any local project with name, path, and description |
| **Quick Launch** | Open any project in VS Code, terminal, file manager, Cursor, or Claude with one click |
| **Todos** | Per-project todo lists — quick capture with add/complete/delete |
| **Error Tracking** | Structured error log with severity levels (low/medium/high) and fix tracking |
| **Mobile Share** | Spin up a local HTTP server, scan the QR code with your phone, send text or images over Wi-Fi. No cloud, no setup |
| **Skills Manager** | Browse and install AI agent skills into any project via `npx` — one-click from a curated catalog |
| **Timeline Planning** | Plan project milestones and phases with a dated timeline view, month grouping, and inline status tracking |
| **System Tray** | Minimizes to tray on close, background idle at low RAM, autostart on login |
| **Custom Title Bar** | Chromeless window with custom minimize/maximize/close controls and glass header |
| **Dark/Light Theme** | Landing page and desktop app support both themes with system preference detection |

## Architecture

```
project-manager/
├── apps/
│   ├── desktop/          # Tauri 2 desktop app (React + Vite + shadcn/ui)
│   │   └── src-tauri/    # Rust backend (axum, SQLite, tray, tool launcher, installer)
│   └── landing/          # Next.js 16 marketing site (Tailwind v4)
├── packages/
│   ├── db/               # SQLite query layer (tauri-plugin-sql)
│   ├── types/            # Shared TypeScript domain types (Project, Todo, Skill, etc.)
│   ├── ui/               # Shared shadcn/ui components + animated components
│   └── config/           # Shared TypeScript tsconfig
├── .agents/skills/       # Installed AI agent skills (third-party)
├── .github/workflows/   # CI build & release pipelines
├── turbo.json            # Turborepo build orchestration
├── pnpm-workspace.yaml   # pnpm workspace config
└── all-phases-plan.md    # Development roadmap
```

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 (Rust) |
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| CSS framework | Tailwind CSS 4 |
| UI library | shadcn/ui (Radix primitives) + Aceternity UI + Magic UI |
| Animations | motion (Framer Motion v12) |
| Database | SQLite via `tauri-plugin-sql` with 7 migrations (v0–v6) |
| Mobile share server | axum (async Rust HTTP) with QR code |
| Monorepo | Turborepo + pnpm 11.5 |
| Landing page | Next.js 16 |
| Icons | lucide-react + inline SVGs |
| Installer | NSIS + MSI (Windows), GitHub Actions CI |
| Crash diagnostics | Rust panic hook → `%TEMP%/dev-project-organizer/crash.log` |

## UI Design

The desktop app features a **glassmorphism design system** with:

- **Custom chromeless window** — native title bar replaced with a glass header containing minimize, maximize/restore, and close buttons
- **Sidebar layout** — collapsible sidebar with project list, brand logo, and quick actions
- **Glass effects** — `backdrop-filter: blur(24px)` with saturate, subtle borders, and layered transparency
- **Animated transitions** — staggered list animations, hover scales, tab transitions via `motion/react`
- **Responsive grid** — adaptive project card grid (1–3 columns depending on viewport)
- **Smooth inputs** — `SmoothInput` component with animated carets and spring physics
- **Dark/light mode** — CSS variables-driven theming with `next-themes`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11.5.0 (`npm install -g pnpm@11.5.0`)
- [Rust](https://rustup.rs/) stable toolchain
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) (platform-specific: Windows SDK, WebView2, etc.)

### Development

```bash
# Install dependencies
pnpm install

# Run the desktop app in dev mode (hot reload)
cd apps/desktop
pnpm tauri dev

# Run the landing page in dev mode
cd apps/landing
pnpm dev
```

> **Note:** With `decorations: false` in the Tauri config, the native title bar is hidden. The custom window controls (minimize/maximize/close) are rendered in the app header. The `data-tauri-drag-region` attribute is applied to the title area for window dragging.

### Build

```bash
# Build the desktop app for production
cd apps/desktop
pnpm tauri build

# Build the landing page
cd apps/landing
pnpm build
```

The desktop build produces installers in `apps/desktop/src-tauri/target/release/bundle/`.

## CI/CD

Two GitHub Actions workflows are configured:

### Build (`build.yml`)
Triggers on pushes to `main` and pull requests. Builds the Windows Tauri app:
- Sets up pnpm 11.5.0, Node.js 22, and Rust stable
- Uses **sccache** for Rust compilation caching across CI runs
- Installs dependencies with `pnpm install --frozen-lockfile`
- Builds the Tauri app (MSI + NSIS installers + portable `.exe`)
- Uploads artifacts with 30-day retention

To trigger manually: go to **Actions** → **Build Windows App** → **Run workflow**.

### Release (`release.yml`)
Triggers on version tags (`v*`). Builds the app and publishes installers to **GitHub Releases** with auto-generated release notes.

## Project Structure

### Frontend (`apps/desktop/src`)

```
src/
├── App.tsx                    # Root component with state management
├── main.tsx                   # React entry point
├── index.css                  # Global imports
├── styles/globals.css         # Glassmorphism design system CSS
├── components/
│   ├── AppLayout.tsx          # CSS Grid shell (sidebar | header | content)
│   ├── AppHeader.tsx          # Glass header + window controls
│   ├── Sidebar.tsx            # Project list sidebar
│   ├── ProjectCard.tsx        # Project card with quick-launch
│   ├── ProjectDetail.tsx      # Per-project tabbed view
│   ├── ProjectDialog.tsx      # Add/Edit project dialogs
│   ├── DeleteConfirm.tsx      # Confirm removal dialog
│   ├── Tabs.tsx               # Accessible tab bar (no external deps)
│   ├── EmptyState.tsx         # Empty registry call-to-action
│   ├── ErrorBoundary.tsx      # Class component error boundary
│   ├── TodosTab.tsx           # Per-project todo list
│   ├── ErrorsTab.tsx          # Per-project error log
│   ├── SkillsTab.tsx          # Skill catalog & installer
│   ├── TimelineTab.tsx        # Milestone timeline
│   ├── ShareDialog.tsx        # Mobile share + QR code
│   └── SettingsDialog.tsx     # Autostart & tray info
├── hooks/
│   ├── useProjects.ts         # Project CRUD
│   ├── useTodos.ts            # Todo CRUD
│   ├── useErrors.ts           # Error log CRUD
│   ├── useSkills.ts           # Skill install lifecycle
│   ├── useTimeline.ts         # Timeline CRUD
│   └── useSharedItems.ts      # Mobile share server state
└── lib/
    └── launch.ts              # Tool launcher (VS Code, terminal, etc.)
```

### Rust Backend (`apps/desktop/src-tauri`)

```
src/
├── main.rs                # Entry point, windows_subsystem = "windows"
├── lib.rs                 # Tauri commands, migrations, tray, crash log
└── share_server.rs        # Axum HTTP server for mobile file sharing
```

The Rust backend exposes 5 Tauri commands:
- `launch_tool` — spawns external tools (detached from app lifecycle)
- `write_text_file` — JSON export helper
- `install_skill` — runs `npx` to install agent skills (with 120s timeout)
- `start_share_server` / `stop_share_server` — manages mobile share HTTP server

## Database

SQLite via `tauri-plugin-sql` with 6 migrations:

| Version | Table | Description |
|---------|-------|-------------|
| 0 | — | Enables `PRAGMA foreign_keys = ON` |
| 1 | `projects` | Project registry with name, path, timestamps |
| 2 | `todos` | Per-project todo items with done state |
| 3 | `errors` | Per-project error log with severity/status |
| 4 | `project_skills` | Many-to-many project ↔ skill mappings |
| 5 | `shared_items` | Received mobile share items |
| 6 | `timeline_items` | Milestones with dates and status |

All child tables use `ON DELETE CASCADE` with automatic cleanup via both SQLite foreign keys and manual deletes in the application layer.

## Development Conventions

- **100% TypeScript** — no plain JS in source code (config files like ESLint/PostCSS are `.mjs` by framework convention)
- **Snake_case in SQL** → **camelCase in TypeScript** via `toDomain()` mapping functions in each DB module
- **Hooks** own their data lifecycle: load on mount, optimistic local updates, no polling
- **Components** are thin presentation — logic lives in hooks, rendering in components
- **Error handling** — hooks catch load errors with `sonner` toasts, mutations wrapped in try/catch
- **Ponytail principle** — dead code is removed, YAGNI enforced, standard library preferred over new dependencies

## License

MIT — see the [LICENSE](LICENSE) file.
