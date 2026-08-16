import type { BrowserSession } from "@wai/browser";
import { captureSnapshot } from "./capture-snapshot.js";

export type ExpectedWorkflowOutcome = {
  /** Substring or full URL */
  urlIncludes?: string;
  pathname?: string;
  titleIncludes?: string;
};

export type VerifyWorkflowResult = {
  passed: boolean;
  actualUrl: string;
  actualPathname: string;
  actualTitle: string;
  failures: string[];
};

export async function verifyWorkflowOutcome(
  session: BrowserSession,
  expected: ExpectedWorkflowOutcome,
): Promise<VerifyWorkflowResult> {
  const snap = await captureSnapshot(session.getPage());
  const failures: string[] = [];

  if (expected.urlIncludes && !snap.url.includes(expected.urlIncludes)) {
    failures.push(`url did not include "${expected.urlIncludes}" (was ${snap.url})`);
  }
  if (expected.pathname && snap.pathname !== expected.pathname) {
    failures.push(`pathname expected ${expected.pathname}, was ${snap.pathname}`);
  }
  if (expected.titleIncludes && !snap.title.includes(expected.titleIncludes)) {
    failures.push(`title did not include "${expected.titleIncludes}" (was ${snap.title})`);
  }

  return {
    passed: failures.length === 0,
    actualUrl: snap.url,
    actualPathname: snap.pathname,
    actualTitle: snap.title,
    failures,
  };
}

import { replayWorkflow, type ReplayWorkflowInput } from "./replay-workflow.js";

export async function replayAndVerify(input: ReplayWorkflowInput & {
  expected: ExpectedWorkflowOutcome;
}): Promise<{ replay: Awaited<ReturnType<typeof replayWorkflow>>; verify: VerifyWorkflowResult }> {
  const replay = await replayWorkflow(input);
  if (!replay.ok) {
    return {
      replay,
      verify: {
        passed: false,
        actualUrl: input.session.getPage().url(),
        actualPathname: "",
        actualTitle: "",
        failures: ["replay did not complete"],
      },
    };
  }
  const verify = await verifyWorkflowOutcome(input.session, input.expected);
  return { replay, verify };
}