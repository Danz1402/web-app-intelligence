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

  export { ExplorationQueue, type EnqueueFromElementsInput } from "./exploration-queue.js";
export type { ExplorationTask, ExplorationTaskStatus } from "./exploration-types.js";

export { scoreExplorationTask, type PriorityContext } from "./exploration-priority.js";

export {
    defaultCrawlLimits,
    createCrawlBudget,
    canEnqueueAtDepth,
    canStartAction,
    canRecordState,
    isUrlAllowed,
    recordActionStarted,
    recordStateSeen,
    type CrawlLimits,
    type CrawlBudget,
    type LimitDecision,
  } from "./crawl-limits.js";

  export {
    restoreState,
    restoreMatchesSignature,
    type RestoreTarget,
    type RestoreResult,
  } from "./restore-state.js";

  export {
  runExplorationLoop,
  type ExploreLoopInput,
  type ExploreLoopSummary,
} from "./explore-loop.js";

export {
  correlateNetworkRequests,
  correlateNetworkDuringAction,
  isLikelyApiOrNavigation,
  type CorrelatedNetworkRequest,
  type CorrelateNetworkDuringActionInput,
} from "./correlate-network.js";

// packages/discovery/src/index.ts
export { redactHeaders, redactBody, REDACTED } from "./redact.js";

export { persistCorrelatedNetwork } from "./persist-network.js";

export { detectForms } from "./detect-forms.js";

export {
  isBlockedField,
  syntheticValueFor,
  planSafeFormFill,
} from "./safe-form-values.js";
export type { PlannedFieldValue } from "./safe-form-values.js";

export { validationRulesFromField } from "./detect-validation.js";

export { persistFormsBundle } from "./persist-forms.js";

export { toObservedForms } from "./to-forms.js";
export { normalizePathname } from "./normalize-path.js";
export { selectElementsToExplore } from "./exploration-guardrails.js";
export type { GuardrailResult } from "./exploration-guardrails.js";

export { decideExploreAction } from "./safety-engine.js";

export { looksLikeSecret, redactString, redactTextSamples } from "./redact.js";