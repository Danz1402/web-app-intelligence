import type {
    ActionId,
    ArtifactId,
    CandidateWorkflowId,
    DiscoverySessionId,
    ErrorId,
    NetworkRequestId,
    StateId,
    TransitionId,
    VerificationResultId,
  } from "@wai/shared";
  
  export type EvidenceBundle = {
    candidateWorkflowId: CandidateWorkflowId;
    discoverySessionId: DiscoverySessionId;
    verificationResultId?: VerificationResultId;
    actionIds: ActionId[];
    transitionIds: TransitionId[];
    stateIds: StateId[];
    networkRequestIds: NetworkRequestId[];
    errorIds: ErrorId[];
    artifactIds: ArtifactId[];
  };
  
  export function buildEvidenceBundle(input: {
    candidateWorkflowId: CandidateWorkflowId;
    discoverySessionId: DiscoverySessionId;
    verificationResultId?: VerificationResultId;
    actionIds?: ActionId[];
    transitionIds?: TransitionId[];
    stateIds?: StateId[];
    networkRequestIds?: NetworkRequestId[];
    errorIds?: ErrorId[];
    artifactIds?: ArtifactId[];
  }): EvidenceBundle {
    return {
      candidateWorkflowId: input.candidateWorkflowId,
      discoverySessionId: input.discoverySessionId,
      verificationResultId: input.verificationResultId,
      actionIds: input.actionIds ?? [],
      transitionIds: input.transitionIds ?? [],
      stateIds: input.stateIds ?? [],
      networkRequestIds: input.networkRequestIds ?? [],
      errorIds: input.errorIds ?? [],
      artifactIds: input.artifactIds ?? [],
    };
  }
  
  export function attachArtifactsToProvenance<T extends { provenance: { artifactIds?: ArtifactId[] } }>(
    entity: T,
    artifactIds: ArtifactId[],
  ): T {
    const existing = entity.provenance.artifactIds ?? [];
    const merged = [...new Set([...existing, ...artifactIds])];
    return {
      ...entity,
      provenance: {
        ...entity.provenance,
        artifactIds: merged,
      },
    };
  }