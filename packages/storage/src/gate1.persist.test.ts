import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import dotenv from "dotenv";
import {
  EvidenceStatus,
  Ids,
  type Application,
  type Artifact,
  type DiscoverySession,
  type Environment,
  type State,
} from "@wai/shared";
import { createPool, getDatabaseUrl } from "./db.js";
import {
  insertApplication,
  insertArtifact,
  insertDiscoverySession,
  insertEnvironment,
  insertState,
  updateDiscoverySession,
} from "./repos/gate1.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../");
dotenv.config({ path: path.join(repoRoot, ".env") });

test("persist application → session → state → artifact", async () => {
  const db = createPool(getDatabaseUrl());
  const appId = Ids.application();
  const envId = Ids.environment();
  const sessionId = Ids.discoverySession();
  const stateId = Ids.state();
  const artifactId = Ids.artifact();

  try {
    const app: Application = {
      id: appId,
      name: `test-app-${appId}`,
      baseUrl: "https://the-internet.herokuapp.com",
      createdAt: new Date().toISOString(),
    };
    const env: Environment = {
      id: envId,
      applicationId: appId,
      name: "test",
      baseUrl: "https://the-internet.herokuapp.com",
    };
    const session: DiscoverySession = {
      id: sessionId,
      applicationId: appId,
      environmentId: envId,
      status: "pending",
      startedAt: new Date().toISOString(),
      browser: "chromium",
      startUrl: "https://the-internet.herokuapp.com",
    };

    await insertApplication(db, app);
    await insertEnvironment(db, env);
    await insertDiscoverySession(db, session);

    session.status = "running";
    await updateDiscoverySession(db, session);

    const state: State = {
      id: stateId,
      discoverySessionId: sessionId,
      url: "https://the-internet.herokuapp.com/",
      pathname: "/",
      title: "The Internet",
      snapshot: { title: "The Internet" },
      provenance: {
        discoverySessionId: sessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        artifactIds: [artifactId],
      },
    };
    await insertState(db, state);

    const artifact: Artifact = {
      id: artifactId,
      discoverySessionId: sessionId,
      kind: "screenshot",
      path: "artifacts/screenshots/test.png",
      createdAt: new Date().toISOString(),
      evidenceStatus: EvidenceStatus.OBSERVED,
    };
    await insertArtifact(db, artifact);

    session.status = "completed";
    session.endedAt = new Date().toISOString();
    await updateDiscoverySession(db, session);

    const result = await db.query(
      `SELECT s.title, a.kind, ds.status
       FROM states s
       JOIN artifacts a ON a.discovery_session_id = s.discovery_session_id
       JOIN discovery_sessions ds ON ds.id = s.discovery_session_id
       WHERE s.id = $1`,
      [stateId],
    );

    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].title, "The Internet");
    assert.equal(result.rows[0].kind, "screenshot");
    assert.equal(result.rows[0].status, "completed");
  } finally {
    await db.query(`DELETE FROM applications WHERE id = $1`, [appId]);
    await db.end();
  }
});