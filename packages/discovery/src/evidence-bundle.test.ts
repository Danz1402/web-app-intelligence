import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids } from "@wai/shared";
import {
  attachArtifactsToProvenance,
  buildEvidenceBundle,
} from "./evidence-bundle.js";

test("buildEvidenceBundle collects claim ids", () => {
  const candidateWorkflowId = Ids.candidateWorkflow();
  const discoverySessionId = Ids.discoverySession();
  const actionId = Ids.action();
  const stateId = Ids.state();
  const artifactId = Ids.artifact();

  const bundle = buildEvidenceBundle({
    candidateWorkflowId,
    discoverySessionId,
    actionIds: [actionId],
    stateIds: [stateId],
    artifactIds: [artifactId],
  });

  assert.equal(bundle.candidateWorkflowId, candidateWorkflowId);
  assert.deepEqual(bundle.actionIds, [actionId]);
  assert.deepEqual(bundle.stateIds, [stateId]);
  assert.deepEqual(bundle.artifactIds, [artifactId]);
  assert.deepEqual(bundle.networkRequestIds, []);
});

test("attachArtifactsToProvenance merges screenshot ids", () => {
  const now = new Date().toISOString();
  const a1 = Ids.artifact();
  const a2 = Ids.artifact();
  const wf = {
    provenance: {
      discoverySessionId: Ids.discoverySession(),
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: now,
      lastSeenAt: now,
      artifactIds: [a1],
    },
  };
  const out = attachArtifactsToProvenance(wf, [a2, a1]);
  assert.equal(out.provenance.artifactIds?.length, 2);
  assert.ok(out.provenance.artifactIds?.includes(a1));
  assert.ok(out.provenance.artifactIds?.includes(a2));
});