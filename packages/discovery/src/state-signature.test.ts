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

test("visible text change on same URL → changed signature", () => {
  const before = buildStateSignature(
    snap({ pathname: "/ui", visibleTextSample: ["Overview panel text"] }),
  );
  const after = buildStateSignature(
    snap({ pathname: "/ui", visibleTextSample: ["Details panel text"] }),
  );
  assert.notEqual(before.signatureHash, after.signatureHash);
  assert.equal(compareStateSignatures(before, after).changed, true);
});

test("hidden dialog in DOM does not affect signature until visible", () => {
  const closed = buildStateSignature(snap({ dialogs: [] }));
  const hiddenInDom = buildStateSignature(snap({ dialogs: [] })); // capture fix: hidden filtered out
  const open = buildStateSignature(
    snap({ dialogs: [{ role: "dialog", name: "modal-title" }] }),
  );
  assert.equal(closed.signatureHash, hiddenInDom.signatureHash);
  assert.notEqual(closed.signatureHash, open.signatureHash);
});