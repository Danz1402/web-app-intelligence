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
  type Action,
  type Transition,
  type NetworkRequest,
  type ApiEndpoint,
  type Form,
  type Field,
  type ValidationRule,
  RoleProfile,
  CandidateWorkflow,
  VerificationResult,
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
  insertTransition,
  insertNetworkRequest,
  upsertApiEndpoint,
  insertForm,
  insertField,
  insertValidationRule,
  insertRoleProfile,
  insertCandidateWorkflow,
  updateCandidateWorkflowProvenance,
  insertVerificationResult,
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
  const networkRequestId = Ids.networkRequest();
  const apiEndpointId = Ids.apiEndpoint();
  const formId = Ids.form();
  const fieldId = Ids.field();
  const validationRuleId = Ids.validationRule();

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

    const roleProfileId = Ids.roleProfile();
const role: RoleProfile = {
  id: roleProfileId,
  applicationId: appId,
  name: "Employee",
  provenance: {
    discoverySessionId: sessionId,
    evidenceStatus: EvidenceStatus.OBSERVED,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  },
};
await insertRoleProfile(db, role);
// on the session object:
session.roleProfileId = roleProfileId;

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

      const form: Form = {
        id: formId,
        stateId: stateId,
        name: "login",
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      };
      await insertForm(db, form);

      const field: Field = {
        id: fieldId,
        formId: formId,
        name: "email",
        label: "Email",
        fieldType: "email",
        required: true,
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      }
      await insertField(db, field);

      const validationRule: ValidationRule = {
        id: validationRuleId,
        fieldId: fieldId,
        formId: formId,
        ruleType: "required",
        message: "Email is required",
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      };
      await insertValidationRule(db, validationRule);

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

      const networkRequest: NetworkRequest = {
        id: networkRequestId,
        discoverySessionId: sessionId,
        actionId: actionId,
        method: "GET",
        url: "https://the-internet.herokuapp.com/status_codes/200",
        statusCode: 200,
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        }
      };
      await insertNetworkRequest(db, networkRequest);

      const apiEndpoint: ApiEndpoint = {
        id: apiEndpointId,
        applicationId: appId,
        method: "GET",
        normalizedUrl: "/status_codes/{id}",
        provenance: {
          discoverySessionId: sessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      };
      await upsertApiEndpoint(db, apiEndpoint);

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

    const toStateId = Ids.state();
const transitionId = Ids.transition();
const tostate: State = {
    id: toStateId,
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
await insertState(db, tostate);
const transition: Transition = {
  id: transitionId,
  fromStateId: stateId,
  actionId: actionId,
  toStateId: toStateId,
  provenance: {
    discoverySessionId: sessionId,
    evidenceStatus: EvidenceStatus.OBSERVED,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  },
};
await insertTransition(db, transition);

const workflow: CandidateWorkflow = {
  id: Ids.candidateWorkflow(),
  applicationId: appId,
  name: "CREATE_CUSTOMER",
  actionIds: [actionId],
  provenance: {
    discoverySessionId: sessionId,
    evidenceStatus: EvidenceStatus.OBSERVED,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  },
};
await insertCandidateWorkflow(db, workflow, {
  confidence: 1,
  transitionIds: [transitionId],
});

const verification: VerificationResult = {
  id: Ids.verificationResult(),
  candidateWorkflowId: workflow.id,
  discoverySessionId: sessionId,
  passed: true,
  evidenceStatus: EvidenceStatus.VERIFIED,
  checkedAt: new Date().toISOString(),
  details: { actualUrl: "https://example.com/done" },
};
await insertVerificationResult(db, verification);

workflow.provenance = {
  ...workflow.provenance,
  evidenceStatus: EvidenceStatus.VERIFIED,
  lastSeenAt: verification.checkedAt,
};
await updateCandidateWorkflowProvenance(db, workflow);

const vr = await db.query(
  `SELECT passed, evidence_status FROM verification_results WHERE id = $1`,
  [verification.id],
);
assert.equal(vr.rows[0].passed, true);
assert.equal(vr.rows[0].evidence_status, "VERIFIED");

const wfProv = await db.query(
  `SELECT provenance->>'evidenceStatus' AS status FROM candidate_workflows WHERE id = $1`,
  [workflow.id],
);
assert.equal(wfProv.rows[0].status, "VERIFIED");

const wf = await db.query(
  `SELECT name, action_ids FROM candidate_workflows WHERE id = $1`,
  [workflow.id],
);
assert.equal(wf.rows[0].name, "CREATE_CUSTOMER");
assert.ok(wf.rows[0].action_ids.includes(actionId));

const roleRow = await db.query(
  `SELECT name FROM role_profiles WHERE id = $1`,
  [roleProfileId],
);
assert.equal(roleRow.rows[0].name, "Employee");

const dsRole = await db.query(
  `SELECT role_profile_id FROM discovery_sessions WHERE id = $1`,
  [sessionId],
);
assert.equal(dsRole.rows[0].role_profile_id, roleProfileId);

    const formRow = await db.query(
      `SELECT name FROM forms WHERE id = $1`,
      [formId],
    );
    assert.equal(formRow.rowCount, 1);
    assert.equal(formRow.rows[0].name, "login");

    const fieldRow = await db.query(
      `SELECT name, label, field_type, required FROM fields WHERE id = $1`,
      [fieldId],
    );
    assert.equal(fieldRow.rowCount, 1);
    assert.equal(fieldRow.rows[0].name, "email");
    assert.equal(fieldRow.rows[0].label, "Email");
    assert.equal(fieldRow.rows[0].field_type, "email");
    assert.equal(fieldRow.rows[0].required, true);

    const validationRuleRow = await db.query(
      `SELECT rule_type, message FROM validation_rules WHERE id = $1`,
      [validationRuleId],
    );
    assert.equal(validationRuleRow.rowCount, 1);
    assert.equal(validationRuleRow.rows[0].rule_type, "required");
    assert.equal(validationRuleRow.rows[0].message, "Email is required");

    const networkRequestRow = await db.query(
      `SELECT method, url, status_code FROM network_requests WHERE id = $1`,
      [networkRequestId],
    );
    assert.equal(networkRequestRow.rowCount, 1);
    assert.equal(networkRequestRow.rows[0].method, "GET");
    assert.equal(networkRequestRow.rows[0].url, "https://the-internet.herokuapp.com/status_codes/200");
    assert.equal(networkRequestRow.rows[0].status_code, 200);

    const apiEndpointRow = await db.query(
      `SELECT method, normalized_url FROM api_endpoints WHERE id = $1`,
      [apiEndpointId],
    );
    assert.equal(apiEndpointRow.rowCount, 1);
    assert.equal(apiEndpointRow.rows[0].method, "GET");
    assert.equal(apiEndpointRow.rows[0].normalized_url, "/status_codes/{id}");

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

      const tr = await db.query(
        `SELECT from_state_id, action_id, to_state_id FROM transitions WHERE id = $1`,
        [transitionId],
      );
      assert.equal(tr.rowCount, 1);
      assert.equal(tr.rows[0].from_state_id, stateId);
      assert.equal(tr.rows[0].action_id, actionId);
      assert.equal(tr.rows[0].to_state_id, toStateId);

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