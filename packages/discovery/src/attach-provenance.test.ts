import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids } from "@wai/shared";
import { toObservedState } from "./attach-provenance.js";
import type { PageSnapshot } from "./snapshot-types.js";

test("toObservedState attaches OBSERVED provenance", () => {
  const sessionId = Ids.discoverySession();
  const snapshot: PageSnapshot = {
    url: "https://the-internet.herokuapp.com/",
    pathname: "/",
    search: "",
    hash: "",
    title: "Example",
    viewport: { width: 1280, height: 720 },
    visibleTextSample: ["Example Domain"],
    dialogs: [],
    capturedAt: "2026-08-10T12:00:00.000Z",
  };

  const state = toObservedState({
    snapshot,
    discoverySessionId: sessionId,
  });

  assert.equal(state.discoverySessionId, sessionId);
  assert.equal(state.provenance.discoverySessionId, sessionId);
  assert.equal(state.provenance.evidenceStatus, EvidenceStatus.OBSERVED);
  assert.equal(state.provenance.firstSeenAt, snapshot.capturedAt);
  assert.equal(state.url, snapshot.url);
  assert.equal(state.title, snapshot.title);
  assert.equal((state.snapshot as PageSnapshot).pathname, "/");
});