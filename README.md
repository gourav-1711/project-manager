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
| **Dark/Light Theme** | Landing page and desktop app support both themes with system preference detection |

## Architecture

```
project-manager/
├── apps/
│   ├── desktop/          # Tauri 2 desktop app (React + Vite + shadcn/ui)
│   │   └── src-tauri/    # Rust backend (axum server, SQLite, tray, launch)
│   └── landing/          # Next.js 16 marketing site (Tailwind v4)
├── packages/
│   ├── db/               # SQLite query layer (tauri-plugin-sql)
│   ├── types/            # Shared TypeScript domain types
│   ├── ui/               # Shared shadcn/ui components
│   └── config/           # Shared TypeScript config
├── .agents/skills/       # Installed AI agent skills (third-party)
├── turbo.json            # Turborepo build orchestration
└── pnpm-workspace.yaml   # pnpm workspace config
```

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 (Rust) |
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| CSS framework | Tailwind CSS 4 |
| UI library | shadcn/ui (Radix primitives) |
| Database | SQLite via `tauri-plugin-sql` |
| Mobile share server | axum (async Rust HTTP) |
| Monorepo | Turborepo + pnpm 11 |
| Landing page | Next.js 16 |
| Icons | lucide-react + inline SVGs |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 11.5.0 (`npm install -g pnpm@11.5.0`)
- [Rust](https://rustup.rs/) stable toolchain
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) (platform-specific)

### Development

```bash
# Install dependencies
pnpm install

# Run the desktop app in dev mode
cd apps/desktop
pnpm tauri dev

# Run the landing page in dev mode
cd apps/landing
pnpm dev
```

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

A GitHub Actions workflow (`.github/workflows/build.yml`) builds the Windows app automatically on pushes to `main`. The workflow:
- Sets up pnpm, Node.js 22, and Rust stable
- Installs dependencies with `pnpm install --frozen-lockfile`
- Builds the Tauri app (MSI + NSIS installers)
- Uploads artifacts with 30-day retention

To trigger manually: go to **Actions** → **Build Windows App** → **Run workflow**.

## Development Conventions

- **100% TypeScript** — no plain JS in source code (config files like ESLint/PostCSS are `.mjs` by framework convention)
- **Snake_case in SQL** → **camelCase in TypeScript** via `toDomain()` mapping functions
- **Hooks** own their data lifecycle (load on mount, optimistic updates, no polling)
- **Components** are thin — UI logic in hooks, rendering in components
- **Error handling** — hooks catch load errors with toast, component-level try/catch for mutations

## License

MIT — see the [LICENSE](LICENSE) file.
