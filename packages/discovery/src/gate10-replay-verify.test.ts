import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { EvidenceStatus, Ids } from "@wai/shared";
import { applyVerificationToWorkflow, toVerificationResult } from "./to-verification.js";
import { buildEvidenceBundle } from "./evidence-bundle.js";
import { toObservedCandidateWorkflow } from "./to-workflow.js";
import { replayAndVerify } from "./verify-workflow.js";

test("Gate 10: replay, verify, bundle, upgrade to VERIFIED", async () => {
  const session = new BrowserSession({ headless: true });
  const discoverySessionId = Ids.discoverySession();
  const actionId = Ids.action();
  const artifactId = Ids.artifact();

  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");

    const workflow = toObservedCandidateWorkflow({
      inferred: { name: "OPEN_AB_TESTING", actionIds: [actionId] },
      applicationId: Ids.application(),
      discoverySessionId,
    });
    assert.equal(workflow.provenance.evidenceStatus, EvidenceStatus.OBSERVED);

    const { replay, verify } = await replayAndVerify({
      session,
      startUrl: "https://the-internet.herokuapp.com",
      steps: [
        {
          actionType: "click",
          locatorCandidates: [
            {
              strategy: "role",
              role: "link",
              name: "A/B Testing",
              confidence: 0.99,
            },
          ],
        },
      ],
      expected: { urlIncludes: "/abtest" },
    });

    assert.equal(replay.ok, true);
    assert.equal(verify.passed, true);

    const bundle = buildEvidenceBundle({
      candidateWorkflowId: workflow.id,
      discoverySessionId,
      actionIds: workflow.actionIds,
      artifactIds: [artifactId],
    });

    const result = toVerificationResult({
      candidateWorkflowId: workflow.id,
      discoverySessionId,
      verify,
      evidence: bundle,
    });
    assert.equal(result.passed, true);
    assert.equal(result.evidenceStatus, EvidenceStatus.VERIFIED);
    assert.equal(
      (result.details?.evidence as { artifactIds?: string[] } | undefined)
        ?.artifactIds?.[0],
      artifactId,
    );

    const verified = applyVerificationToWorkflow(workflow, result);
    assert.equal(verified.provenance.evidenceStatus, EvidenceStatus.VERIFIED);
  } finally {
    await session.close();
  }
});