import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { runExplorationLoop } from "./explore-loop.js";

test("runExplorationLoop explores example.com with tight limits", async () => {
  const session = new BrowserSession({ headless: false });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const summary = await runExplorationLoop({
      session,
      startUrl: "https://the-internet.herokuapp.com",
      limits: {
        maxDepth: 1,
        maxActions: 3,
        maxStates: 5,
        maxRuntimeMs: 60_000,
        allowedDomains: ["the-internet.herokuapp.com"],
      },
    });

    assert.ok(summary.actionsAttempted >= 1);
    assert.ok(summary.statesSeen >= 1);
    assert.ok(summary.stopReason.length > 0);
  } finally {
    await session.close();
  }
});