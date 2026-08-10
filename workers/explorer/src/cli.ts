import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { discover } from "./discover.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../");
dotenv.config({ path: path.join(repoRoot, ".env") });

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: discover <url>");
    process.exit(1);
  }

  // basic URL check
  // eslint-disable-next-line no-new
  new URL(url);

  const result = await discover(url, repoRoot);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});