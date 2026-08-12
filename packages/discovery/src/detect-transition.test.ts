import assert from "node:assert/strict";
import test from "node:test";
import { detectTransitionFromSnapshots, detectTransitionAfterAction } from "./detect-transition.js";
import type { PageSnapshot } from "./snapshot-types.js";

import { BrowserSession } from "@wai/browser";

function snap(partial: Partial<PageSnapshot>): PageSnapshot {
  return {
    url: "https://example.com/",
    pathname: "/",
    search: "",
    hash: "",
    title: "Example",
    viewport: { width: 800, height: 600 },
    visibleTextSample: ["Hello"],
    dialogs: [],
    capturedAt: "2026-08-11T12:00:00.000Z",
    ...partial,
  };
}

test("navigation when URL changes", () => {
  const result = detectTransitionFromSnapshots(
    snap({}),
    snap({ url: "https://example.com/x", pathname: "/x", title: "X" }),
  );
  assert.equal(result.category, "NAVIGATION");
  assert.equal(result.diff.changed, true);
});

test("no effect when identical", () => {
  const s = snap({});
  const result = detectTransitionFromSnapshots(s, { ...s });
  assert.equal(result.category, "NO_OBSERVED_EFFECT");
});

test("dialog open without URL change", () => {
  const result = detectTransitionFromSnapshots(
    snap({}),
    snap({ dialogs: [{ role: "dialog", name: "Confirm" }] }),
  );
  assert.equal(result.category, "DIALOG_OPEN");
  assert.equal(result.diff.urlChanged, false);
});


test("click on example.com produces NAVIGATION", async () => {
  const session = new BrowserSession({ headless: false });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const result = await detectTransitionAfterAction(session.getPage(), async () => {
      await session.click([
        {
          strategy: "role",
          role: "link",
          name: "A/B Testing",
          confidence: 0.99,
        },
      ]);
    });
    // If accessible name differs, use css: { strategy: "css", value: "a", confidence: 0.4 }
    assert.equal(result.diff.changed, true);
    assert.equal(result.category, "NAVIGATION");
  } finally {
    await session.close();
  }
});