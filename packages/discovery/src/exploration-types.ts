import type { ElementId, StateId } from "@wai/shared";
import type { LocatorCandidate } from "./locator-candidates.js";

export type ExplorationTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETE"
  | "FAILED"
  | "BLOCKED"
  | "SKIPPED";

export type ExplorationTask = {
  id: string;
  sourceStateId: StateId;
  elementId?: ElementId;
  actionType: "click" | "type" | "select" | string;
  locatorCandidates: LocatorCandidate[];
  priority: number;
  depth: number;
  risk: "low" | "unknown" | "high";
  attempts: number;
  status: ExplorationTaskStatus;
  payload?: Record<string, unknown>;
};