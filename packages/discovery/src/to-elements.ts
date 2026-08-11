import {
    EvidenceStatus,
    Ids,
    type DiscoverySessionId,
    type Element,
    type StateId,
  } from "@wai/shared";
  import type { DetectedElement } from "./element-types.js";

  import { buildLocatorCandidates } from "./locator-candidates.js";
  import { buildElementFingerprint } from "./element-fingerprint.js";

  
  export function toObservedElements(input: {
    detected: DetectedElement[];
    stateId: StateId;
    discoverySessionId: DiscoverySessionId;
    observedAt?: string;
  }): Element[] {
    const now = input.observedAt ?? new Date().toISOString();
  
    return input.detected.map((d) => ({
      id: Ids.element(),
      stateId: input.stateId,
      role: d.role,
      name: d.name,
      tag: d.tag,
      fingerprint: buildElementFingerprint(d), // 4.5
      locatorCandidates: buildLocatorCandidates(d), // 4.4
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    }));
  }