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