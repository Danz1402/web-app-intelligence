import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { restoreState } from "./restore-state.js";

test("restoreState returns to example.com after navigation", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    await session.click([
      { strategy: "role", role: "link", name: "A/B Testing", confidence: 0.99 },
    ]);
    assert.notEqual(new URL(session.getPage().url()).pathname, "/");

    const result = await restoreState(session, {
      url: "https://the-internet.herokuapp.com",
    });
    assert.equal(result.ok, true);
    assert.match(session.getPage().url(), /the-internet.herokuapp\.com\/?$/);
  } finally {
    await session.close();
  }
});

test("restoreState already_there when on target", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const result = await restoreState(session, {
      url: "https://the-internet.herokuapp.com",
    });
    assert.equal(result.ok, true);
    assert.equal(result.method, "already_there");
  } finally {
    await session.close();
  }
});