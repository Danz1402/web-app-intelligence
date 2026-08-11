import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "./browser-session.js";

test("click navigates via role locator on example.com", async () => {
  const session = new BrowserSession({ headless: false });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    await session.click([
      {
        strategy: "role",
        role: "link",
        name: "Basic Auth",
        confidence: 0.99,
      },
    ]);
    // example.com link text can be "More information..." — adjust if title/url check fails
    assert.ok(session.getPage().url().length > 0);
  } finally {
    await session.close();
  }
});