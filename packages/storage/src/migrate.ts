import fs from "node:fs/promises";
import path from "node:path";
import type { Db } from "./db.js";

export async function migrate(db: Db, migrationsDir: string): Promise<string[]> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied: string[] = [];

  for (const file of files) {
    const id = file.replace(/\.sql$/, "");
    const existing = await db.query(
      "SELECT 1 FROM schema_migrations WHERE id = $1",
      [id],
    );
    if (existing.rowCount && existing.rowCount > 0) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (id) VALUES ($1)",
        [id],
      );
      await client.query("COMMIT");
      applied.push(id);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  return applied;
}