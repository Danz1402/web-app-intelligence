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
  type Element,
  type Action
} from "@wai/shared";
import { createPool, getDatabaseUrl } from "./db.js";
import {
  insertApplication,
  insertArtifact,
  insertDiscoverySession,
  insertEnvironment,
  insertState,
  updateDiscoverySession,
  insertElement,
  insertAction,
  updateAction,
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
  const elementId = Ids.element();
  const actionId = Ids.action();

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

    const element: Element = {
        id: elementId,
        stateId, // must be the state you just inserted
        role: "link",
        name: "More information",
        tag: "a",
        fingerprint: undefined,
        locatorCandidates: [],
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      };
      await insertElement(db, element);

      const elCheck = await db.query(`SELECT id FROM elements WHERE id = $1`, [
        elementId,
      ]);
      assert.equal(elCheck.rowCount, 1, "element must exist before insertAction");

      const action: Action = {
        id: actionId,
        elementId: elementId,
        stateId: stateId,
        type: "click",
        payload: { source: "persist-test" },
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      };
      await insertAction(db, action);
      
      action.provenance = {
        ...action.provenance,
        evidenceStatus: EvidenceStatus.FAILED,
        lastSeenAt: new Date().toISOString(),
      };
      action.payload = { ...action.payload, errorMessage: "boom" };
      await updateAction(db, action);

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
      `SELECT s.title, a.kind, ds.status, e.name AS element_name, e.tag AS element_tag
       FROM states s
       JOIN artifacts a ON a.discovery_session_id = s.discovery_session_id
       JOIN discovery_sessions ds ON ds.id = s.discovery_session_id
       JOIN elements e ON e.state_id = s.id
       WHERE s.id = $1`,
      [stateId],
    );

    const actionRow = await db.query(
        `SELECT type, provenance->>'evidenceStatus' AS evidence_status, payload->>'errorMessage' AS error_message
         FROM actions WHERE id = $1`,
        [actionId],
      );

    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].title, "The Internet");
    assert.equal(result.rows[0].kind, "screenshot");
    assert.equal(result.rows[0].status, "completed");
    assert.equal(result.rows[0].element_name, "More information");
    assert.equal(result.rows[0].element_tag, "a");
    assert.equal(actionRow.rowCount, 1);
assert.equal(actionRow.rows[0].type, "click");
assert.equal(actionRow.rows[0].evidence_status, "FAILED");
assert.equal(actionRow.rows[0].error_message, "boom");
  } finally {
    await db.query(`DELETE FROM applications WHERE id = $1`, [appId]);
    await db.end();
  }
});