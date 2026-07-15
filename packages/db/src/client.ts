import Database from "@tauri-apps/plugin-sql";

/**
 * The SQLite database connection, loaded lazily and cached for the app's
 * lifetime. The actual file + migrations are configured on the Rust side
 * (`src-tauri/src/lib.rs`) and preloaded via `tauri.conf.json`, so by the time
 * the frontend calls `getConnection()` the schema already exists.
 */
let connectionPromise: Promise<Database> | null = null;

/**
 * Returns the shared SQLite connection. The connection name `db` must match
 * the key registered via the `preload` list in `tauri.conf.json`.
 */
export function getConnection(): Promise<Database> {
  if (!connectionPromise) {
    connectionPromise = Database.load("sqlite:dev-organizer.db");
  }
  return connectionPromise;
}
