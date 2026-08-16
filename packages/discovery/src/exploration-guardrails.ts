import type { DetectedElement } from "./element-types.js";
import { generalizeBehavior } from "./generalize-behavior.js";
import { pickExplorationRepresentatives } from "./repeated-components.js";

export type GuardrailResult = {
  detected: DetectedElement[];
  skippedRepeated: number;
  skippedBehavior: number;
};

export function selectElementsToExplore(input: {
  detected: DetectedElement[];
  exploredBehaviorKeys?: Set<string>;
  minRepeatCount?: number;
}): GuardrailResult {
  const reps = pickExplorationRepresentatives(input.detected, {
    minCount: input.minRepeatCount ?? 3,
    representativesPerGroup: 1,
  });
  const skippedRepeated = input.detected.length - reps.length;

  const explored = input.exploredBehaviorKeys ?? new Set<string>();
  const kept: DetectedElement[] = [];
  let skippedBehavior = 0;
  for (const el of reps) {
    const key = generalizeBehavior(el).key;
    if (explored.has(key)) {
      skippedBehavior += 1;
      continue;
    }
    kept.push(el);
  }
  return { detected: kept, skippedRepeated, skippedBehavior };
}