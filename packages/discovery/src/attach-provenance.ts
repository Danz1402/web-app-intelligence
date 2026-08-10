import {
    EvidenceStatus,
    type ArtifactId,
    type DiscoverySessionId,
    type Provenance,
    type State,
    type StateId,
    Ids,
  } from "@wai/shared";
  import type { PageSnapshot } from "./snapshot-types.js";
  
  export type AttachProvenanceInput = {
    snapshot: PageSnapshot;
    discoverySessionId: DiscoverySessionId;
    artifactIds?: ArtifactId[];
    /** Optional override; default: new State id */
    stateId?: StateId;
    pageInstanceId?: State["pageInstanceId"];
  };
  
  /**
   * Turn a PageSnapshot into a contract State with OBSERVED provenance.
   */
  export function toObservedState(input: AttachProvenanceInput): State {
    const now = input.snapshot.capturedAt;
    const provenance: Provenance = {
      discoverySessionId: input.discoverySessionId,
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: now,
      lastSeenAt: now,
      artifactIds: input.artifactIds,
    };
  
    return {
      id: input.stateId ?? Ids.state(),
      discoverySessionId: input.discoverySessionId,
      pageInstanceId: input.pageInstanceId,
      url: input.snapshot.url,
      pathname: input.snapshot.pathname,
      title: input.snapshot.title,
      fingerprint: undefined, // Phase 5
      snapshot: {
        ...input.snapshot,
      },
      provenance,
    };
  }