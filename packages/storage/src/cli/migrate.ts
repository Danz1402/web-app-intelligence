import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPool, getDatabaseUrl } from "../db.js";
import { migrate } from "../migrate.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// dist/cli -> repo root
const repoRoot = path.resolve(here, "../../../../");

dotenv.config({ path: path.join(repoRoot, ".env") });

async function main(): Promise<void> {
  const migrationsDir = path.join(repoRoot, "database/migrations");
  const pool = createPool(getDatabaseUrl());
  try {
    const applied = await migrate(pool, migrationsDir);
    if (applied.length === 0) {
      console.log("No new migrations.");
    } else {
      console.log("Applied:", applied.join(", "));
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});