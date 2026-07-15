# Project Rules & Conventions

## Code Style

### TypeScript

- **100% TypeScript** — No plain `.js` files in source code. Config files (ESLint, PostCSS) use `.mjs` by framework convention.
- **Strict mode** enabled in all `tsconfig.json` files
- **camelCase** for all TypeScript/React identifiers (variables, functions, props, interfaces)
- **snake_case** for SQLite column names (converted to camelCase via `toDomain()` functions)

### Rust

- **snake_case** for all Rust identifiers (per Rust convention)
- `#[serde(rename_all = "camelCase")]` on structs serialized to the frontend
- Use `tauri::async_runtime::spawn_blocking` for CPU-heavy or blocking operations

### File & Folder Naming

| Pattern | Example | When |
|---|---|---|
| `PascalCase.tsx` | `ProjectCard.tsx` | React components |
| `PascalCase.tsx` | `ShareDialog.tsx` | Dialogs and complex components |
| `camelCase.ts` | `useProjects.ts` | Hooks and utilities |
| `camelCase.ts` | `launch.ts` | Library modules |
| `snake_case.rs` | `share_server.rs` | Rust modules |

## Architecture Rules

### Data Layer (`packages/db/`)

1. **Every table has a corresponding `.ts` file** with CRUD functions
2. **Rows are mapped** from snake_case DB rows to camelCase domain types via private `toDomain()` functions
3. **No SQL in components** — all queries go through `packages/db/`
4. **Migrations** are defined in the Rust backend (`src-tauri/src/lib.rs`) as versioned `Migration` structs
5. The database connection is **lazy-loaded and cached** for the app's lifetime

### Hooks (`apps/desktop/src/hooks/`)

1. **Load on mount, no polling** — data is fetched once and updated optimistically
2. **State pattern**: `[data, loading, error]` — error state is available even if not always displayed
3. **Mutations return the created/updated item** for optimistic local state updates
4. **No DB imports in hooks** — use `@workspace/db` functions
5. **Event-driven for real-time** — mobile share uses Tauri events, not polling

### Components (`apps/desktop/src/components/`)

1. **Thin rendering layer** — complex logic lives in hooks
2. **Dialog pattern**: controlled by `open`/`onOpenChange` props, manage their own form state
3. **Filter pattern**: tabs/buttons at top, list below, counts in filter labels
4. **Empty state**: always shown when filtered list is empty, with contextual message
5. **Error display**: `toast.error()` from sonner for transient errors

### Landing Page (`apps/landing/`)

1. **No external dependencies for icons** — all icons are inline SVG components
2. **Theme**: CSS custom properties with `:root` (light) / `html.dark` (dark) toggling
3. **Animations**: CSS-only (`IntersectionObserver` for scroll reveals, CSS keyframes for backgrounds)
4. **All client components** mark `"use client"` at the top

## Database Migrations

Migrations are **immutable** once shipped — never modify an existing migration. Add a new version instead.

Current schema versions:
- **v1**: `projects` table
- **v2**: `todos` table (FK → projects)
- **v3**: `errors` table (FK → projects)
- **v4**: `project_skills` table (FK → projects)
- **v5**: `shared_items` table
- **v6**: `timeline_items` table (FK → projects)

## Error Handling

1. **Hook `reload` functions** catch errors with `toast.error()` + set `error` state
2. **Mutation functions** (`add`, `remove`, `update`) let errors bubble to the component, which catches and shows `toast.error()`
3. **Non-critical operations** (like `markOpened`) use `console.warn()` — no user-facing error
4. **A global `ErrorBoundary`** wraps the entire app for unhandled render errors
5. **Rust commands** return structured `{ success, error }` results — never panic to the frontend

## Commit Conventions

Use descriptive commit messages in the format:

```
scope: brief description

Longer explanation if needed.
```

Scopes: `desktop`, `landing`, `db`, `types`, `ui`, `ci`, `docs`, `meta`

## Build & CI

- **Package manager**: pnpm 11.5.0 (frozen lockfile in CI)
- **Monorepo tool**: Turborepo 2
- **CI**: GitHub Actions on `windows-latest` for Windows MSI/NSIS installers
- **Privacy**: The app is fully local — no telemetry, no cloud dependencies, no data leaves the machine (except the share server which is LAN-only)
