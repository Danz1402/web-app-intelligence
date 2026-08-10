import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { captureSnapshot } from "./capture-snapshot.js";

test("captureSnapshot returns structured fields for example.com", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const snap = await captureSnapshot(session.getPage());

    assert.match(snap.url, /the-internet.herokuapp\.com/);
    assert.equal(snap.pathname, "/");
    assert.ok(snap.title.length > 0);
    assert.ok(snap.viewport.width > 0);
    assert.ok(Array.isArray(snap.visibleTextSample));
    assert.ok(snap.capturedAt.includes("T"));
  } finally {
    await session.close();
  }
});