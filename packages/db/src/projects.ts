import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "@workspace/types";
import { getConnection } from "./client";

/**
 * Database row shape for `projects`. snake_case as stored in SQLite.
 * Decoupled from the domain `Project` in @workspace/types so the storage
 * layout can change without rippling through the app.
 */
interface ProjectRow {
  id: string;
  name: string;
  path: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}

/** Map a snake_case DB row to the camelCase domain type. */
function toDomain(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastOpenedAt: row.last_opened_at,
  };
}

/** Generate a uuid v4 without external deps (crypto.randomUUID is available in Tauri webview). */
function uuid(): string {
  return crypto.randomUUID();
}

/** Current time as ISO-8601. */
function now(): string {
  return new Date().toISOString();
}

/** Return all projects, most recently opened first (nulls last). */
export async function getProjects(): Promise<Project[]> {
  const db = await getConnection();
  const rows = await db.select<ProjectRow[]>(
    "SELECT id, name, path, description, created_at, updated_at, last_opened_at " +
      "FROM projects " +
      "ORDER BY (last_opened_at IS NULL), last_opened_at DESC, created_at DESC",
  );
  return rows.map(toDomain);
}

/** Return a single project by id, or null if it does not exist. */
export async function getProject(id: string): Promise<Project | null> {
  const db = await getConnection();
  const rows = await db.select<ProjectRow[]>(
    "SELECT id, name, path, description, created_at, updated_at, last_opened_at " +
      "FROM projects WHERE id = $1",
    [id],
  );
  return rows.length > 0 ? toDomain(rows[0]!) : null;
}

/** Insert a new project and return the created row. */
export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const db = await getConnection();
  const project: ProjectRow = {
    id: uuid(),
    name: input.name,
    path: input.path,
    description: input.description ?? null,
    created_at: now(),
    updated_at: now(),
    last_opened_at: null,
  };
  await db.execute(
    "INSERT INTO projects (id, name, path, description, created_at, updated_at, last_opened_at) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      project.id,
      project.name,
      project.path,
      project.description,
      project.created_at,
      project.updated_at,
      project.last_opened_at,
    ],
  );
  return toDomain(project);
}

/** Patch a project's editable fields. Returns the updated row, or null if not found. */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project | null> {
  const db = await getConnection();
  const existing = await getProject(id);
  if (!existing) return null;

  const next: Project = {
    ...existing,
    name: input.name ?? existing.name,
    description:
      input.description === undefined ? existing.description : input.description,
    updatedAt: now(),
  };

  await db.execute(
    "UPDATE projects SET name = $1, description = $2, updated_at = $3 WHERE id = $4",
    [next.name, next.description, next.updatedAt, id],
  );
  return next;
}

/** Remove a project from the registry. Does NOT touch files on disk. */
export async function deleteProject(id: string): Promise<void> {
  const db = await getConnection();
  await db.execute("DELETE FROM projects WHERE id = $1", [id]);
}

/** Record that a project was just opened (used by quick launch). */
export async function touchLastOpened(id: string): Promise<void> {
  const db = await getConnection();
  await db.execute("UPDATE projects SET last_opened_at = $1 WHERE id = $2", [
    now(),
    id,
  ]);
}
