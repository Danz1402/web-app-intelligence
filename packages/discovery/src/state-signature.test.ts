import assert from "node:assert/strict";
import test from "node:test";
import { buildStateSignature } from "./state-signature.js";
import { compareStateSignatures } from "./compare-states.js";
import type { PageSnapshot } from "./snapshot-types.js";

function snap(partial: Partial<PageSnapshot>): PageSnapshot {
  return {
    url: "https://example.com/",
    pathname: "/",
    search: "",
    hash: "",
    title: "Example",
    viewport: { width: 1280, height: 720 },
    visibleTextSample: ["Hello"],
    dialogs: [],
    capturedAt: "2026-08-11T12:00:00.000Z",
    ...partial,
  };
}

test("same snapshot → same signatureHash", () => {
  const a = buildStateSignature(snap({}));
  const b = buildStateSignature(snap({}));
  assert.equal(a.signatureHash, b.signatureHash);
});

test("URL change → changed", () => {
  const before = buildStateSignature(snap({}));
  const after = buildStateSignature(
    snap({ url: "https://example.com/x", pathname: "/x" }),
  );
  const diff = compareStateSignatures(before, after);
  assert.equal(diff.changed, true);
  assert.equal(diff.urlChanged, true);
});

test("dialog open without URL change → changed", () => {
  const before = buildStateSignature(snap({}));
  const after = buildStateSignature(
    snap({ dialogs: [{ role: "dialog", name: "Confirm" }] }),
  );
  const diff = compareStateSignatures(before, after);
  assert.equal(diff.changed, true);
  assert.equal(diff.urlChanged, false);
  assert.equal(diff.dialogsChanged, true);
});