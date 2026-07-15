# AI Agent Skills System

The Dev Project Organizer includes a **Skills Manager** that lets you browse and install AI agent skills into any project with one click. Skills are reusable, self-contained instructions that extend what an AI coding agent can do.

## Overview

Skills live in the `.agents/skills/` directory of a project. Each skill is a folder containing a `SKILL.md` file (the instructions) plus optional references, scripts, and configurations.

The app maintains a **curated catalog** of skills in `packages/db/skills.json`. From the desktop app's Skills tab, you can browse the catalog, install skills into a project, or remove them.

## How It Works

1. **Browse** — The Skills tab shows the full catalog with name, description, and npx command
2. **Install** — Click "Add" to run `npx <command>` in the project directory via the Rust backend
3. **Track** — Installed skills are recorded in the `project_skills` SQLite table per project
4. **Use** — Once installed, the skill's `SKILL.md` is available for AI agents in that project

## Current Catalog

| Skill | Description |
|---|---|
| **Ponytail** | Forces minimal, stdlib-first solutions. YAGNI enforcement. |
| **shadcn/ui** | Build UI components — manage, search, compose design systems. |
| **Design Taste** | Anti-slop frontend design — ships interfaces that don't look templated. |
| **Agent Browser** | Browser automation CLI — navigate, fill forms, click, scrape. |
| **Prisma Client API** | Prisma ORM queries, filters, CRUD operations reference. |
| **Cloudflare** | Workers, Pages, KV, D1, R2, Durable Objects, WAF, and more. |
| **SEO Optimizer** | Meta tags, structured data, sitemaps, OG cards, ranking. |
| **Security Best Practices** | Language/framework security reviews (Python, JS/TS, Go). |

## Adding a New Skill

1. Find or create the skill's `npx` command (e.g. `codebuff/skills/my-skill` or `my-skill@latest`)
2. Add an entry to `packages/db/skills.json`:
   ```json
   {
     "id": "my-skill",
     "name": "My Skill",
     "description": "What it does.",
     "npxCommand": "my-skill@latest"
   }
   ```
3. The skill will appear in the Skills tab on next reload

## Technical Details

### Database

```sql
-- Tracks which skills are installed per project
CREATE TABLE project_skills (
  project_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (project_id, skill_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### Backend

The Rust `install_skill` command (in `src-tauri/src/lib.rs`):
- Runs `npx <command>` in the project directory with a 120-second timeout
- Captures stdout/stderr for error reporting
- Kills the process on timeout
- Returns `{ success, error }` to the frontend

### Frontend

The `useSkills` hook (in `apps/desktop/src/hooks/useSkills.ts`):
- Loads the static catalog
- Fetches per-project install state from SQLite
- Manages install state transitions: idle → installing → success/error
- Shows toast notifications for success/failure

## Installed Skills

The project comes with several skills already installed in `.agents/skills/`. These are third-party packages managed via `npx skills add` — not part of the project's own source code.
