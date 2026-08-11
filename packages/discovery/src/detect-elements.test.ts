import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { detectElements } from "./detect-elements.js";

test("detectElements finds the link on example.com", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com/");
    const elements = await detectElements(session.getPage());
    

    assert.ok(elements.length >= 1);
    assert.ok(elements.some((e) => e.kind === "link"));
  } finally {
    await session.close();
  }
});