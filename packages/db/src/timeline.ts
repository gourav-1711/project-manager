import type {
  CreateTimelineItemInput,
  TimelineItem,
  UpdateTimelineItemInput,
} from "@workspace/types";
import { getConnection } from "./client";

interface TimelineItemRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function toDomain(row: TimelineItemRow): TimelineItem {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as TimelineItem["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function uuid(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

/** All timeline items for a project, sorted by start_date ascending. */
export async function getTimelineItems(
  projectId: string,
): Promise<TimelineItem[]> {
  const db = await getConnection();
  const rows = await db.select<TimelineItemRow[]>(
    "SELECT id, project_id, title, description, start_date, end_date, status, created_at, updated_at " +
      "FROM timeline_items WHERE project_id = $1 ORDER BY start_date ASC, created_at ASC",
    [projectId],
  );
  return rows.map(toDomain);
}

export async function createTimelineItem(
  input: CreateTimelineItemInput,
): Promise<TimelineItem> {
  const db = await getConnection();
  const row: TimelineItemRow = {
    id: uuid(),
    project_id: input.projectId,
    title: input.title,
    description: input.description ?? null,
    start_date: input.startDate,
    end_date: input.endDate ?? null,
    status: input.status ?? "planned",
    created_at: now(),
    updated_at: now(),
  };
  await db.execute(
    "INSERT INTO timeline_items (id, project_id, title, description, start_date, end_date, status, created_at, updated_at) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      row.id,
      row.project_id,
      row.title,
      row.description,
      row.start_date,
      row.end_date,
      row.status,
      row.created_at,
      row.updated_at,
    ],
  );
  return toDomain(row);
}

export async function updateTimelineItem(
  id: string,
  input: UpdateTimelineItemInput,
): Promise<TimelineItem | null> {
  const db = await getConnection();
  const rows = await db.select<TimelineItemRow[]>(
    "SELECT id, project_id, title, description, start_date, end_date, status, created_at, updated_at " +
      "FROM timeline_items WHERE id = $1",
    [id],
  );
  if (rows.length === 0) return null;

  const current = toDomain(rows[0]!);
  const next: TimelineItem = {
    ...current,
    title: input.title ?? current.title,
    description: input.description === undefined ? current.description : input.description,
    startDate: input.startDate ?? current.startDate,
    endDate: input.endDate === undefined ? current.endDate : input.endDate,
    status: input.status ?? current.status,
    updatedAt: now(),
  };

  await db.execute(
    "UPDATE timeline_items SET title = $1, description = $2, start_date = $3, end_date = $4, status = $5, updated_at = $6 WHERE id = $7",
    [
      next.title,
      next.description,
      next.startDate,
      next.endDate,
      next.status,
      next.updatedAt,
      id,
    ],
  );
  return next;
}

export async function deleteTimelineItem(id: string): Promise<void> {
  const db = await getConnection();
  await db.execute("DELETE FROM timeline_items WHERE id = $1", [id]);
}
