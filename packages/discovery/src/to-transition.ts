import {
    EvidenceStatus,
    Ids,
    type ActionId,
    type DiscoverySessionId,
    type StateId,
    type Transition,
  } from "@wai/shared";
  import type { TransitionCategory } from "./detect-transition.js";
  
  export type ToTransitionInput = {
    fromStateId: StateId;
    actionId: ActionId;
    discoverySessionId: DiscoverySessionId;
    /** Omit or undefined when NO_OBSERVED_EFFECT */
    toStateId?: StateId;
    category: TransitionCategory;
    at?: string;
  };
  

  export function toObservedTransition(input: ToTransitionInput): Transition {
    const now = input.at ?? new Date().toISOString();
    return {
      id: Ids.transition(),
      fromStateId: input.fromStateId,
      actionId: input.actionId,
      toStateId: input.toStateId,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  }
  
  /** Helper for callers who also want category alongside the Transition. */
  export type TransitionRecord = {
    transition: Transition;
    category: TransitionCategory;
  };