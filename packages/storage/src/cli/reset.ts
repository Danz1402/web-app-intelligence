import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPool, getDatabaseUrl } from "../db.js";
import { migrate } from "../migrate.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../");

dotenv.config({ path: path.join(repoRoot, ".env") });

async function main(): Promise<void> {
  const pool = createPool(getDatabaseUrl());
  try {
    await pool.query(`
      DROP TABLE IF EXISTS actions CASCADE;
      DROP TABLE IF EXISTS elements CASCADE;
      DROP TABLE IF EXISTS artifacts CASCADE;
      DROP TABLE IF EXISTS states CASCADE;
      DROP TABLE IF EXISTS page_instances CASCADE;
      DROP TABLE IF EXISTS discovery_sessions CASCADE;
      DROP TABLE IF EXISTS environments CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
    `);
    console.log("Dropped Gate 1 tables.");

    const migrationsDir = path.join(repoRoot, "database/migrations");
    const applied = await migrate(pool, migrationsDir);
    console.log("Re-applied:", applied.join(", "));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});