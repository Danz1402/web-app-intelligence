import {
    EvidenceStatus,
    Ids,
    type CandidateWorkflow,
    type CandidateWorkflowId,
    type DiscoverySessionId,
    type VerificationResult,
  } from "@wai/shared";
  import type { VerifyWorkflowResult } from "./verify-workflow.js";
import { EvidenceBundle } from "./evidence-bundle.js";
  
  export function toVerificationResult(input: {
    candidateWorkflowId: CandidateWorkflowId;
    discoverySessionId: DiscoverySessionId;
    verify: VerifyWorkflowResult;
    checkedAt?: string;
        evidence?: EvidenceBundle;
      }): VerificationResult {
    const checkedAt = input.checkedAt ?? new Date().toISOString();
    return {
      id: Ids.verificationResult(),
      candidateWorkflowId: input.candidateWorkflowId,
      discoverySessionId: input.discoverySessionId,
      passed: input.verify.passed,
      evidenceStatus: input.verify.passed
        ? EvidenceStatus.VERIFIED
        : EvidenceStatus.FAILED,
      checkedAt,
      details: {
        actualUrl: input.verify.actualUrl,
        actualPathname: input.verify.actualPathname,
        actualTitle: input.verify.actualTitle,
        failures: input.verify.failures,
        evidence: input.evidence,
      },
      
    };
  }
  
  /** Upgrade workflow provenance only when verification passed. */
  export function applyVerificationToWorkflow(
    workflow: CandidateWorkflow,
    result: VerificationResult,
  ): CandidateWorkflow {
    if (!result.passed) return workflow;
    return {
      ...workflow,
      provenance: {
        ...workflow.provenance,
        evidenceStatus: EvidenceStatus.VERIFIED,
        lastSeenAt: result.checkedAt,
      },
    };
  }