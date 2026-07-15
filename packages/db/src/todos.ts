import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@workspace/types";
import { getConnection } from "./client";

interface TodoRow {
  id: string;
  project_id: string;
  title: string;
  done: number;
  created_at: string;
  updated_at: string;
}

function toDomain(row: TodoRow): Todo {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    done: row.done !== 0,
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

/** All todos for a project, most recently created first. */
export async function getTodos(projectId: string): Promise<Todo[]> {
  const db = await getConnection();
  const rows = await db.select<TodoRow[]>(
    "SELECT id, project_id, title, done, created_at, updated_at " +
      "FROM todos WHERE project_id = $1 ORDER BY created_at DESC",
    [projectId],
  );
  return rows.map(toDomain);
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const db = await getConnection();
  const row: TodoRow = {
    id: uuid(),
    project_id: input.projectId,
    title: input.title,
    done: 0,
    created_at: now(),
    updated_at: now(),
  };
  await db.execute(
    "INSERT INTO todos (id, project_id, title, done, created_at, updated_at) " +
      "VALUES ($1, $2, $3, $4, $5, $6)",
    [row.id, row.project_id, row.title, row.done, row.created_at, row.updated_at],
  );
  return toDomain(row);
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<Todo | null> {
  const db = await getConnection();
  const rows = await db.select<TodoRow[]>(
    "SELECT id, project_id, title, done, created_at, updated_at FROM todos WHERE id = $1",
    [id],
  );
  if (rows.length === 0) return null;
  const current = toDomain(rows[0]!);
  const next: Todo = {
    ...current,
    title: input.title ?? current.title,
    done: input.done ?? current.done,
    updatedAt: now(),
  };
  await db.execute(
    "UPDATE todos SET title = $1, done = $2, updated_at = $3 WHERE id = $4",
    [next.title, next.done ? 1 : 0, next.updatedAt, id],
  );
  return next;
}

export async function deleteTodo(id: string): Promise<void> {
  const db = await getConnection();
  await db.execute("DELETE FROM todos WHERE id = $1", [id]);
}
