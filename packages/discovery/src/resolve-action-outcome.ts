import {
    EvidenceStatus,
    type Action,
    type DiscoverySessionId,
    type StateId,
    type Transition,
  } from "@wai/shared";
  import type { DetectedTransition } from "./detect-transition.js";
  import { markActionFailed } from "./record-action.js";
  import { toObservedTransition } from "./to-transition.js";
  
  export type ActionOutcome =
    | {
        kind: "failed";
        action: Action;
        transition?: undefined;
      }
    | {
        kind: "noop";
        action: Action;
        transition: Transition;
        category: "NO_OBSERVED_EFFECT";
      }
    | {
        kind: "transitioned";
        action: Action;
        transition: Transition;
        category: DetectedTransition["category"];
        /** Caller should persist this as the new State before/with the transition */
        needsToState: true;
      };
  
  export type ResolveActionOutcomeInput = {
    action: Action;
    discoverySessionId: DiscoverySessionId;
    fromStateId: StateId;
    /** Set when the browser action threw */
    error?: unknown;
    /** Set when the action ran; from detectTransitionAfterAction / detectTransitionFromSnapshots */
    detected?: DetectedTransition;
    /** Id of the after-state once you’ve created it (required when changed) */
    toStateId?: StateId;
  };
  
  /**
   * Decide evidence for an attempted action + optional transition detection.
   */
  export function resolveActionOutcome(
    input: ResolveActionOutcomeInput,
  ): ActionOutcome {
    if (input.error !== undefined) {
      const message =
        input.error instanceof Error ? input.error.message : String(input.error);
      return {
        kind: "failed",
        action: markActionFailed(input.action, message),
      };
    }
  
    if (!input.detected) {
      return {
        kind: "failed",
        action: markActionFailed(input.action, "Missing transition detection"),
      };
    }
  
    const { detected } = input;
  
    if (!detected.diff.changed || detected.category === "NO_OBSERVED_EFFECT") {
      return {
        kind: "noop",
        action: input.action, // stays OBSERVED
        category: "NO_OBSERVED_EFFECT",
        transition: toObservedTransition({
          fromStateId: input.fromStateId,
          actionId: input.action.id,
          discoverySessionId: input.discoverySessionId,
          category: "NO_OBSERVED_EFFECT",
          // no toStateId
        }),
      };
    }
  
    if (!input.toStateId) {
      return {
        kind: "failed",
        action: markActionFailed(
          input.action,
          "State changed but toStateId was not provided",
        ),
      };
    }
  
    return {
      kind: "transitioned",
      action: input.action,
      needsToState: true,
      category: detected.category,
      transition: toObservedTransition({
        fromStateId: input.fromStateId,
        actionId: input.action.id,
        toStateId: input.toStateId,
        discoverySessionId: input.discoverySessionId,
        category: detected.category,
      }),
    };
  }
  
  /** Convenience: did this outcome count as a real state change? */
  export function outcomeChangedState(outcome: ActionOutcome): boolean {
    return outcome.kind === "transitioned";
  }