import type { ExplorationTask } from "./exploration-types.js";

export type PriorityContext = {
  /** Fingerprints (or element ids) already explored in this session */
  exploredFingerprints?: Set<string>;
  /** Prefer shallower depths. Default true */
  preferShallow?: boolean;
};

/**
 * Higher score = dequeue sooner.
 * Illustrative v0 scoring from master context §21.
 */
export function scoreExplorationTask(
  task: Pick<
    ExplorationTask,
    "actionType" | "depth" | "risk" | "locatorCandidates" | "payload"
  >,
  ctx: PriorityContext = {},
): number {
  let score = 100;

  // Unexplored element: high
  const fingerprint =
    typeof task.payload?.fingerprint === "string"
      ? task.payload.fingerprint
      : undefined;
  if (fingerprint && ctx.exploredFingerprints?.has(fingerprint)) {
    score -= 80; // already explored behavior: very low
  } else {
    score += 40; // unexplored: high
  }

  // Stronger locators → slightly higher confidence to try
  const best = Math.max(
    0,
    ...task.locatorCandidates.map((c) => c.confidence ?? 0),
  );
  score += Math.round(best * 10);

  // Prefer click discovery early; forms later is fine
  if (task.actionType === "click") score += 15;
  if (task.actionType === "type" || task.actionType === "select") score += 5;

  // Shallower first
  if (ctx.preferShallow !== false) {
    score -= task.depth * 20;
  }

  // Risk
  if (task.risk === "high") score -= 1000; // effectively last / blocked later
  if (task.risk === "unknown") score -= 10;

  return score;
}