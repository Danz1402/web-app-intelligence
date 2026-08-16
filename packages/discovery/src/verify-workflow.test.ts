import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { replayAndVerify } from "./verify-workflow.js";

test("replayAndVerify passes when URL matches after click", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const { replay, verify } = await replayAndVerify({
      session,
      startUrl: "https://the-internet.herokuapp.com",
      steps: [
        {
          actionType: "click",
          locatorCandidates: [
            {
              strategy: "role",
              role: "link",
              name: "A/B Testing",
              confidence: 0.99,
            },
          ],
        },
      ],
      expected: { urlIncludes: "/abtest" },
    });
    assert.equal(replay.ok, true);
    assert.equal(verify.passed, true);
  } finally {
    await session.close();
  }
});

test("verifyWorkflowOutcome fails on wrong pathname", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://example.com");
    const { verifyWorkflowOutcome } = await import("./verify-workflow.js");
    const verify = await verifyWorkflowOutcome(session, { pathname: "/not-this" });
    assert.equal(verify.passed, false);
    assert.ok(verify.failures.length >= 1);
  } finally {
    await session.close();
  }
});