import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPool, getDatabaseUrl } from "@wai/storage";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

let pool: ReturnType<typeof createPool> | undefined;
export function db() {
  pool ??= createPool(getDatabaseUrl());
  return pool;
}