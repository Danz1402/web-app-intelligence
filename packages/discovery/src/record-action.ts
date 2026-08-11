import {
    EvidenceStatus,
    Ids,
    type Action,
    type ElementId,
    type DiscoverySessionId,
    type StateId,
    type Provenance,
  } from "@wai/shared";
  
  export type CreateActionInput = {
    stateId: StateId;
    discoverySessionId: DiscoverySessionId;
    type: "click" | "type" | "select" | string;
    elementId?: ElementId;
    payload?: Record<string, unknown>;
    at?: string;
  };
  
  export function createIntendedAction(input: CreateActionInput): Action {
    const now = input.at ?? new Date().toISOString();
    const provenance: Provenance = {
      discoverySessionId: input.discoverySessionId,
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: now,
      lastSeenAt: now,
    };
  
    return {
      id: Ids.action(),
      elementId: input.elementId,
      stateId: input.stateId,
      type: input.type,
      payload: input.payload,
      provenance,
    };
  }
  
  export function markActionFailed(action: Action, errorMessage: string): Action {
    const now = new Date().toISOString();
    return {
      ...action,
      payload: {
        ...(action.payload ?? {}),
        errorMessage,
      },
      provenance: {
        ...action.provenance,
        evidenceStatus: EvidenceStatus.FAILED,
        lastSeenAt: now,
      },
    };
  }