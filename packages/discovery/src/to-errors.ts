import type { ObservedRuntimeError } from "@wai/browser";
import {
  EvidenceStatus,
  Ids,
  type ActionId,
  type DiscoveryError,
  type DiscoverySessionId,
  type StateId,
} from "@wai/shared";

export function toObservedDiscoveryErrors(input: {
  observed: ObservedRuntimeError[];
  discoverySessionId: DiscoverySessionId;
  stateId?: StateId;
  actionId?: ActionId;
}): DiscoveryError[] {
  return input.observed.map((e) => {
    const now = e.observedAt;
    return {
      id: Ids.error(),
      discoverySessionId: input.discoverySessionId,
      stateId: input.stateId,
      actionId: input.actionId,
      message: e.message,
      stack: e.stack,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  });
}