import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import dotenv from "dotenv";
import { BrowserSession } from "@wai/browser";
import {
  Ids,
  type Application,
  type DiscoverySession,
  type Environment,
} from "@wai/shared";
import {
  createPool,
  getDatabaseUrl,
  insertApplication,
  insertDiscoverySession,
  insertEnvironment,
} from "@wai/storage";
import { runExplorationLoop } from "./explore-loop.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../");
dotenv.config({ path: path.join(repoRoot, ".env") });

test("runExplorationLoop explores herokuapp and persists network", async () => {
  const db = createPool(getDatabaseUrl());
  const appId = Ids.application();
  const envId = Ids.environment();
  const discoverySessionId = Ids.discoverySession();
  const browserSession = new BrowserSession({ headless: true });

  try {
    const app: Application = {
      id: appId,
      name: `explore-test-${appId}`,
      baseUrl: "https://the-internet.herokuapp.com",
      createdAt: new Date().toISOString(),
    };
    const env: Environment = {
      id: envId,
      applicationId: appId,
      name: "test",
      baseUrl: "https://the-internet.herokuapp.com",
    };
    const ds: DiscoverySession = {
      id: discoverySessionId,
      applicationId: appId,
      environmentId: envId,
      status: "running",
      startedAt: new Date().toISOString(),
      browser: "chromium",
      startUrl: "https://the-internet.herokuapp.com",
    };

    await insertApplication(db, app);
    await insertEnvironment(db, env);
    await insertDiscoverySession(db, ds);

    await browserSession.start();
    await browserSession.open("https://the-internet.herokuapp.com");

    const summary = await runExplorationLoop({
      session: browserSession,
      startUrl: "https://the-internet.herokuapp.com",
      discoverySessionId,
      db,
      applicationId: appId,
      limits: {
        maxDepth: 2,
        maxActions: 3,
        maxStates: 5,
        maxRuntimeMs: 60_000,
        allowedDomains: ["the-internet.herokuapp.com"],
      },
    });

    assert.ok(summary.actionsAttempted >= 1);
    assert.ok(summary.networkEffects >= 1);

    const nr = await db.query(
      `SELECT COUNT(*)::int AS n FROM network_requests WHERE discovery_session_id = $1`,
      [discoverySessionId],
    );
    const ae = await db.query(
      `SELECT COUNT(*)::int AS n FROM api_endpoints WHERE application_id = $1`,
      [appId],
    );
    assert.ok(nr.rows[0].n >= 1);
    assert.ok(ae.rows[0].n >= 1);
  } finally {
    await browserSession.close();
    await db.query(`DELETE FROM applications WHERE id = $1`, [appId]);
    await db.end();
  }
});