export { captureSnapshot } from "./capture-snapshot.js";
export { toObservedState } from "./attach-provenance.js";
export type { AttachProvenanceInput } from "./attach-provenance.js";

export type { PageSnapshot, SnapshotDialog, SnapshotViewport } from "./snapshot-types.js";
export {
    DiscoverySessionController,
    type CreateDiscoverySessionInput,
  } from "./discovery-session.js";

  export { detectElements } from "./detect-elements.js";
export type { DetectedElement, DetectedElementKind } from "./element-types.js";

export {
    filterMeaningfulElements,
  } from "./filter-elements.js";
  export type { FilterElementsOptions } from "./filter-elements.js";
  export { detectMeaningfulElements } from "./detect-elements.js"; // if you added it there
  export { toObservedElements } from "./to-elements.js";

  export {
    buildLocatorCandidates,
    type LocatorCandidate,
  } from "./locator-candidates.js";

  export { buildElementFingerprint } from "./element-fingerprint.js";

  export {
    createIntendedAction,
    markActionFailed,
    type CreateActionInput,
  } from "./record-action.js";

  export { buildStateSignature, type StateSignature } from "./state-signature.js";
export { compareStateSignatures, type StateDiff } from "./compare-states.js";

export {
    classifyTransition,
    detectTransitionFromSnapshots,
    detectTransitionAfterAction,
    type TransitionCategory,
    type DetectedTransition,
  } from "./detect-transition.js";

  export {
    toObservedTransition,
    type ToTransitionInput,
    type TransitionRecord,
  } from "./to-transition.js";

  export {
    resolveActionOutcome,
    outcomeChangedState,
    type ActionOutcome,
    type ResolveActionOutcomeInput,
  } from "./resolve-action-outcome.js";