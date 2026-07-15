import type { SharedItem } from "@workspace/types";
import { getConnection } from "./client";

interface SharedItemRow {
  id: string;
  item_type: string;
  content: string;
  received_at: string;
}

function toDomain(row: SharedItemRow): SharedItem {
  return {
    id: row.id,
    itemType: row.item_type,
    content: row.content,
    receivedAt: row.received_at,
  };
}

/** Return all shared items, most recent first. */
export async function getSharedItems(): Promise<SharedItem[]> {
  const db = await getConnection();
  const rows = await db.select<SharedItemRow[]>(
    "SELECT id, item_type, content, received_at FROM shared_items ORDER BY received_at DESC",
  );
  return rows.map(toDomain);
}

/** Store a received shared item. */
export async function insertSharedItem(item: SharedItem): Promise<void> {
  const db = await getConnection();
  await db.execute(
    "INSERT INTO shared_items (id, item_type, content, received_at) VALUES ($1, $2, $3, $4)",
    [item.id, item.itemType, item.content, item.receivedAt],
  );
}

/** Delete all shared items. */
export async function clearSharedItems(): Promise<void> {
  const db = await getConnection();
  await db.execute("DELETE FROM shared_items", []);
}
