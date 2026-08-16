import type { Action, ActionId, StateId, Transition } from "@wai/shared";

export type InferredWorkflow = {
  name: string;
  actionIds: ActionId[];
  fromStateId: StateId;
  toStateId: StateId;
};

export type InferWorkflowsInput = {
  transitions: Transition[];
  actions: Action[];
  /** Inclusive. Default 2. */
  minActions?: number;
  /** Inclusive. Default 6. */
  maxActions?: number;
};

function slugName(actions: Action[]): string {
  const labels = actions.map((a) => {
    const raw =
      (typeof a.payload?.name === "string" && a.payload.name) ||
      (typeof a.payload?.behaviorKey === "string" && a.payload.behaviorKey) ||
      a.type;
    return String(raw)
      .replace(/\{id\}/gi, "")
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_|_$/g, "")
      .toUpperCase();
  });
  const last = labels[labels.length - 1];
  if (last && /CREATE|SUBMIT|SAVE|LOGIN/.test(last)) return last;
  return labels.filter(Boolean).join("_") || "WORKFLOW";
}








export function inferWorkflows(input: InferWorkflowsInput): InferredWorkflow[] {
  const minActions = input.minActions ?? 2;
  const maxActions = input.maxActions ?? 6;
  const actionById = new Map(input.actions.map((a) => [a.id, a]));

  const outgoing = new Map<string, Transition[]>();
  for (const t of input.transitions) {
    if (!t.toStateId) continue;
    const list = outgoing.get(t.fromStateId) ?? [];
    list.push(t);
    outgoing.set(t.fromStateId, list);
  }

  const found: InferredWorkflow[] = [];

  function walk(
    fromStateId: StateId,
    path: Transition[],
  ): void {
    if (path.length >= minActions && path.length <= maxActions) {
      const last = path[path.length - 1]!;
      const actions = path
        .map((t) => actionById.get(t.actionId))
        .filter((a): a is Action => Boolean(a));
      if (actions.length === path.length && last.toStateId) {
        found.push({
          name: slugName(actions),
          actionIds: actions.map((a) => a.id),
          fromStateId: path[0]!.fromStateId,
          toStateId: last.toStateId,
        });
      }
    }
    if (path.length >= maxActions) return;

    const here = path.length === 0 ? fromStateId : path[path.length - 1]!.toStateId;
    if (!here) return;
    for (const next of outgoing.get(here) ?? []) {
      if (path.some((t) => t.id === next.id)) continue;
      walk(fromStateId, [...path, next]);
    }
  }

  for (const start of outgoing.keys()) {
    walk(start as StateId, []);
  }

  const seen = new Set<string>();
  return found.filter((w) => {
    const key = `${w.name}|${w.actionIds.join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}