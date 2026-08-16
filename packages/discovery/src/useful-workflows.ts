import type { InferredWorkflow } from "./infer-workflows.js";

const USEFUL_NAME = /CREATE|SUBMIT|SAVE|LOGIN|UPDATE|CHECKOUT|SIGN_?UP/i;

export function isUsefulWorkflow(w: InferredWorkflow): boolean {
  if (w.actionIds.length < 2) return false;
  if (w.fromStateId === w.toStateId) return false;
  if (w.name === "WORKFLOW" || w.name === "CLICK") return false;
  return USEFUL_NAME.test(w.name) || w.actionIds.length >= 3;
}

export function selectUsefulWorkflows(
  workflows: InferredWorkflow[],
): InferredWorkflow[] {
  const useful = workflows.filter(isUsefulWorkflow);
  const seen = new Set<string>();
  return useful.filter((w) => {
    const key = `${w.name}|${w.fromStateId}|${w.toStateId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}