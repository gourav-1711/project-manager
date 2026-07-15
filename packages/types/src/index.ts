/**
 * Shared domain types for the Dev Project Organizer.
 *
 * These describe the *domain* shape used across the app and future phases
 * (todos, errors, timeline, skills). They are intentionally separate from the
 * raw SQLite row types in `@workspace/db` so that consumers can depend on the
 * domain shape without pulling the database package.
 */

/** A registered dev project. */
export interface Project {
  /** uuid v4, stored as TEXT in SQLite. */
  id: string;
  name: string;
  /** Absolute filesystem path to the project root. */
  path: string;
  /** Optional free-form description. May be null in the DB. */
  description: string | null;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
  /** ISO-8601 timestamp, null until the project is first opened. */
  lastOpenedAt: string | null;
}

/** Fields a caller supplies when creating a project. */
export interface CreateProjectInput {
  name: string;
  path: string;
  description?: string | null;
}

/** Partial updatable fields for a project. */
export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

/** The set of launchable tools. Fixed list in v1; extensible later. */
export type ToolId =
  | "explorer"
  | "terminal"
  | "vscode"
  | "cursor"
  | "claude";

// ---------------------------------------------------------------------------
// Todos (per-project)
// ---------------------------------------------------------------------------

export interface Todo {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  projectId: string;
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  done?: boolean;
}

// ---------------------------------------------------------------------------
// Errors (per-project)
// ---------------------------------------------------------------------------

export type ErrorSeverity = "low" | "medium" | "high";
export type ErrorStatus = "open" | "fixed";

export interface ProjectError {
  id: string;
  projectId: string;
  description: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  createdAt: string;
  fixedAt: string | null;
}

export interface CreateErrorInput {
  projectId: string;
  description: string;
  severity?: ErrorSeverity;
}

// ---------------------------------------------------------------------------
// Skills (per-project)
// ---------------------------------------------------------------------------

/**
 * A curated, installable AI-agent skill. The catalog is a static JSON file in
 * the repo; only `id`/`npxCommand` are meaningful to the installer — the rest
 * is display metadata.
 */
export interface Skill {
  /** Stable identifier, e.g. "create-agent-skill". */
  id: string;
  name: string;
  description: string;
  /** The argument passed to `npx`, e.g. "create-agent-skill@latest". */
  npxCommand: string;
}

/** A skill that has been added to a specific project. */
export interface ProjectSkill {
  projectId: string;
  skillId: string;
  /** ISO-8601 timestamp. */
  addedAt: string;
}

export interface InstallSkillInput {
  /** The full `npx` argument, e.g. "create-agent-skill@latest". */
  command: string;
  /** Absolute project path — the command's working directory. */
  cwd: string;
}

// ---------------------------------------------------------------------------
// Timeline (per-project)
// ---------------------------------------------------------------------------

export type TimelineStatus = "planned" | "in_progress" | "done";

export interface TimelineItem {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: TimelineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimelineItemInput {
  projectId: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status?: TimelineStatus;
}

export interface UpdateTimelineItemInput {
  title?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
  status?: TimelineStatus;
}

// ---------------------------------------------------------------------------
// Shared Items (mobile share)
// ---------------------------------------------------------------------------

/** An item received from a phone via the local share server. */
export interface SharedItem {
  id: string;
  /** "text" or "image" */
  itemType: string;
  /** Text content or absolute path to saved image file */
  content: string;
  /** ISO-8601 timestamp */
  receivedAt: string;
}
