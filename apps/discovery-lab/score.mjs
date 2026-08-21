import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPool, getDatabaseUrl } from "@wai/storage";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const sessionId = process.argv[2];
if (!sessionId) {
  console.error("Usage: node score.mjs <discoverySessionId>");
  process.exit(1);
}

const truth = JSON.parse(
  fs.readFileSync(path.join(here, "ground-truth.json"), "utf8"),
);

const db = createPool(getDatabaseUrl());

const states = await db.query(
  `SELECT pathname, title FROM states WHERE discovery_session_id = $1`,
  [sessionId],
);

const forms = await db.query(
  `SELECT f.id, s.pathname FROM forms f
   JOIN states s ON s.id = f.state_id
   WHERE s.discovery_session_id = $1`,
  [sessionId],
);
const fields = await db.query(
  `SELECT f.name, s.pathname FROM fields f
   JOIN forms fm ON fm.id = f.form_id
   JOIN states s ON s.id = fm.state_id
   WHERE s.discovery_session_id = $1`,
  [sessionId],
);
const templates = await db.query(
  `SELECT DISTINCT pt.pattern
   FROM page_templates pt
   JOIN page_instances pi ON pi.page_template_id = pt.id
   JOIN states s ON s.page_instance_id = pi.id
   WHERE s.discovery_session_id = $1`,
  [sessionId],
);
const instances = await db.query(
  `SELECT COUNT(*)::int AS n
   FROM page_instances pi
   JOIN states s ON s.page_instance_id = pi.id
   WHERE s.discovery_session_id = $1`,
  [sessionId],
);
console.log(
  "Page templates:",
  templates.rows.map((r) => r.pattern).join(", ") || "(none)",
  `/ expected: ${truth.expectedCounts?.[0]?.pageTemplates ?? 1}`,
);
console.log(
  "Page instances linked to states:",
  instances.rows[0].n,
  `/ expected: ${truth.expectedCounts?.[0]?.pageTemplateInstances ?? 3}`,
);

const foundPathnames = new Set(states.rows.map((r) => r.pathname));
const expectedPathnames = new Set(
  truth.states.map((s) => s.pathname),
);

const missingPathnames = [...expectedPathnames].filter((p) => !foundPathnames.has(p));
const extraPathnames = [...foundPathnames].filter((p) => !expectedPathnames.has(p));

console.log("=== Discovery Lab score ===");
console.log("Session:", sessionId);
console.log("States in DB:", states.rows.length, "/ entries in ground truth:", truth.states.length);
console.log("Unique pathnames in DB:", foundPathnames.size, "/ expected:", truth.expectedCounts?.uniquePathnames ?? expectedPathnames.size);
console.log("Forms in DB:", forms.rows.length, "/ expected:", truth.expectedCounts?.forms ?? truth.forms?.length);
console.log("Fields in DB:", fields.rows.length);

if (missingPathnames.length) {
  console.log("\nMissing pathnames (not in DB):");
  for (const p of missingPathnames.sort()) console.log("  -", p);
}
if (extraPathnames.length) {
  console.log("\nExtra pathnames (in DB only):");
  for (const p of extraPathnames.sort()) console.log("  +", p);
}

await db.end();
process.exit(missingPathnames.length ? 1 : 0);