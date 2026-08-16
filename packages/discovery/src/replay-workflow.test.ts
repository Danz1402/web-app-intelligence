import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { replayWorkflow } from "./replay-workflow.js";

test("replayWorkflow restores and clicks a stored locator", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");

    const result = await replayWorkflow({
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
    });

    assert.equal(result.restored, true);
    assert.equal(result.ok, true);
    assert.equal(result.steps.length, 1);
    assert.equal(result.steps[0]?.ok, true);
    assert.match(session.getPage().url(), /iana\.org|the-internet.herokuapp\.com/);
  } finally {
    await session.close();
  }
});

test("replayWorkflow stops on missing locator", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const result = await replayWorkflow({
      session,
      startUrl: "https://the-internet.herokuapp.com",
      steps: [
        {
          actionType: "click",
          locatorCandidates: [
            {
              strategy: "role",
              role: "button",
              name: "This does not exist",
              confidence: 0.99,
            },
          ],
        },
      ],
    });
    assert.equal(result.ok, false);
    assert.equal(result.steps[0]?.ok, false);
  } finally {
    await session.close();
  }
});