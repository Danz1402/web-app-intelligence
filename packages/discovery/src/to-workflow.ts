import {
    EvidenceStatus,
    Ids,
    type ApplicationId,
    type CandidateWorkflow,
    type DiscoverySessionId,
  } from "@wai/shared";
  import type { InferredWorkflow } from "./infer-workflows.js";
  
  export function toObservedCandidateWorkflow(input: {
    inferred: Pick<InferredWorkflow, "name" | "actionIds">;
    applicationId: ApplicationId;
    discoverySessionId: DiscoverySessionId;
    observedAt?: string;
  }): CandidateWorkflow {
    const now = input.observedAt ?? new Date().toISOString();
    return {
      id: Ids.candidateWorkflow(),
      applicationId: input.applicationId,
      name: input.inferred.name,
      actionIds: input.inferred.actionIds,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  }