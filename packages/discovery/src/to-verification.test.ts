import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids, type CandidateWorkflow } from "@wai/shared";
import {
  applyVerificationToWorkflow,
  toVerificationResult,
} from "./to-verification.js";

function workflow(): CandidateWorkflow {
  const now = new Date().toISOString();
  const discoverySessionId = Ids.discoverySession();
  return {
    id: Ids.candidateWorkflow(),
    applicationId: Ids.application(),
    name: "CREATE_CUSTOMER",
    actionIds: [Ids.action()],
    provenance: {
      discoverySessionId,
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: now,
      lastSeenAt: now,
    },
  };
}

test("passed verify → VERIFIED result and workflow upgrade", () => {
  const wf = workflow();
  const result = toVerificationResult({
    candidateWorkflowId: wf.id,
    discoverySessionId: wf.provenance.discoverySessionId,
    verify: {
      passed: true,
      actualUrl: "https://example.com/done",
      actualPathname: "/done",
      actualTitle: "Done",
      failures: [],
    },
  });
  assert.equal(result.passed, true);
  assert.equal(result.evidenceStatus, EvidenceStatus.VERIFIED);
  const upgraded = applyVerificationToWorkflow(wf, result);
  assert.equal(upgraded.provenance.evidenceStatus, EvidenceStatus.VERIFIED);
});

test("failed verify does not upgrade workflow", () => {
  const wf = workflow();
  const result = toVerificationResult({
    candidateWorkflowId: wf.id,
    discoverySessionId: wf.provenance.discoverySessionId,
    verify: {
      passed: false,
      actualUrl: "https://example.com/",
      actualPathname: "/",
      actualTitle: "Example",
      failures: ["pathname expected /done"],
    },
  });
  assert.equal(result.evidenceStatus, EvidenceStatus.FAILED);
  const same = applyVerificationToWorkflow(wf, result);
  assert.equal(same.provenance.evidenceStatus, EvidenceStatus.OBSERVED);
});