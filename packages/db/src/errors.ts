import type {
  CreateErrorInput,
  ErrorSeverity,
  ErrorStatus,
  ProjectError,
} from "@workspace/types";
import { getConnection } from "./client";

interface ErrorRow {
  id: string;
  project_id: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  fixed_at: string | null;
}

function toDomain(row: ErrorRow): ProjectError {
  return {
    id: row.id,
    projectId: row.project_id,
    description: row.description,
    severity: row.severity as ErrorSeverity,
    status: row.status as ErrorStatus,
    createdAt: row.created_at,
    fixedAt: row.fixed_at,
  };
}

function uuid(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

/** All errors for a project; open first (by severity) then fixed. */
export async function getErrors(projectId: string): Promise<ProjectError[]> {
  const db = await getConnection();
  const rows = await db.select<ErrorRow[]>(
    "SELECT id, project_id, description, severity, status, created_at, fixed_at " +
      "FROM errors WHERE project_id = $1 " +
      "ORDER BY (status = 'fixed'), " +
      "CASE severity WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, " +
      "created_at DESC",
    [projectId],
  );
  return rows.map(toDomain);
}

export async function createError(
  input: CreateErrorInput,
): Promise<ProjectError> {
  const db = await getConnection();
  const row: ErrorRow = {
    id: uuid(),
    project_id: input.projectId,
    description: input.description,
    severity: input.severity ?? "medium",
    status: "open",
    created_at: now(),
    fixed_at: null,
  };
  await db.execute(
    "INSERT INTO errors (id, project_id, description, severity, status, created_at, fixed_at) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      row.id,
      row.project_id,
      row.description,
      row.severity,
      row.status,
      row.created_at,
      row.fixed_at,
    ],
  );
  return toDomain(row);
}

/** Mark an error as fixed (idempotent). Returns the updated row. */
export async function markErrorFixed(id: string): Promise<ProjectError | null> {
  const db = await getConnection();
  const existing = await db.select<ErrorRow[]>(
    "SELECT id, project_id, description, severity, status, created_at, fixed_at FROM errors WHERE id = $1",
    [id],
  );
  if (existing.length === 0) return null;
  const fixedAt = now();
  await db.execute(
    "UPDATE errors SET status = 'fixed', fixed_at = $1 WHERE id = $2",
    [fixedAt, id],
  );
  return { ...toDomain(existing[0]!), status: "fixed", fixedAt };
}

export async function deleteError(id: string): Promise<void> {
  const db = await getConnection();
  await db.execute("DELETE FROM errors WHERE id = $1", [id]);
}
