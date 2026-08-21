import type { DetectedElement } from "./element-types.js";
import { generalizeBehavior } from "./generalize-behavior.js";
import { pickExplorationRepresentatives } from "./repeated-components.js";
import { generalizeHref } from "./repeated-components.js";
import { groupRepeatedComponents } from "./repeated-components.js";


export type GuardrailResult = {
  detected: DetectedElement[];
  skippedRepeated: number;
  skippedBehavior: number;
};

export function selectElementsToExplore(input: {
  detected: DetectedElement[];
  exploredBehaviorKeys?: Set<string>;
  minRepeatCount?: number;
  maxInstanceSamples?: number; // add this
}): GuardrailResult {
  const maxInstanceSamples = input.maxInstanceSamples ?? 3;
  const reps = pickExplorationRepresentatives(input.detected, {
    minCount: input.minRepeatCount ?? 3,
    representativesPerGroup: 1,
  });

  const groups = groupRepeatedComponents(input.detected, {
    minCount: input.minRepeatCount ?? 3,
    representativesPerGroup: maxInstanceSamples,
  });

  const extra: DetectedElement[] = [];
  for (const g of groups) {
    const hrefPattern = generalizeHref(g.members[0]?.href);
    if (!hrefPattern.includes("{id}")) continue;
    for (const el of g.representatives) {
      if (!reps.includes(el) && !extra.includes(el)) extra.push(el);
    }
  }

  const candidates = [...reps, ...extra];
  const skippedRepeated = input.detected.length - candidates.length;

  const explored = input.exploredBehaviorKeys ?? new Set<string>();
  const kept: DetectedElement[] = [];
  let skippedBehavior = 0;
  for (const el of candidates) {  // <-- was reps
    const key = generalizeBehavior(el).key;
    if (explored.has(key)) {
      skippedBehavior += 1;
      continue;
    }
    kept.push(el);
  }
  return { detected: kept, skippedRepeated, skippedBehavior };
}