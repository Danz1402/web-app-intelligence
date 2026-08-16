import type { BrowserSession, LocatorCandidate } from "@wai/browser";
import { restoreState } from "./restore-state.js";

export type ReplayStep = {
  actionType: "click" | "type" | "select" | string;
  locatorCandidates: LocatorCandidate[];
  payload?: Record<string, unknown>;
};

export type ReplayStepResult = {
  index: number;
  ok: boolean;
  errorMessage?: string;
};

export type ReplayWorkflowInput = {
  session: BrowserSession;
  startUrl: string;
  steps: ReplayStep[];
};

export type ReplayWorkflowResult = {
  restored: boolean;
  steps: ReplayStepResult[];
  ok: boolean;
};

export async function replayWorkflow(
  input: ReplayWorkflowInput,
): Promise<ReplayWorkflowResult> {
  const restored = await restoreState(input.session, { url: input.startUrl });
  if (!restored.ok) {
    return { restored: false, steps: [], ok: false };
  }

  const steps: ReplayStepResult[] = [];
  for (let i = 0; i < input.steps.length; i++) {
    const step = input.steps[i]!;
    try {
      await runReplayStep(input.session, step);
      steps.push({ index: i, ok: true });
    } catch (err) {
      steps.push({
        index: i,
        ok: false,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      return { restored: true, steps, ok: false };
    }
  }
  return { restored: true, steps, ok: true };
}

async function runReplayStep(
  session: BrowserSession,
  step: ReplayStep,
): Promise<void> {
  const candidates = step.locatorCandidates;
  if (step.actionType === "type") {
    await session.type(candidates, String(step.payload?.value ?? "test"));
    return;
  }
  if (step.actionType === "select") {
    await session.select(candidates, String(step.payload?.value ?? ""));
    return;
  }
  await session.click(candidates);
}