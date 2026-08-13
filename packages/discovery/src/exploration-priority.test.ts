import assert from "node:assert/strict";
import test from "node:test";
import { scoreExplorationTask } from "./exploration-priority.js";
import { ExplorationQueue } from "./exploration-queue.js";
import { EvidenceStatus, Ids, type Element } from "@wai/shared";

test("unexplored scores higher than explored", () => {
  const base = {
    actionType: "click",
    depth: 0,
    risk: "low" as const,
    locatorCandidates: [{ strategy: "role", role: "link", name: "X", confidence: 0.99 }],
    payload: { fingerprint: "abc" },
  };
  const fresh = scoreExplorationTask(base, { exploredFingerprints: new Set() });
  const seen = scoreExplorationTask(base, {
    exploredFingerprints: new Set(["abc"]),
  });
  assert.ok(fresh > seen);
});

test("dequeue picks higher priority first", () => {
  const q = new ExplorationQueue();
  const stateId = Ids.state();
  const sessionId = Ids.discoverySession();

  const mk = (name: string, fingerprint: string): Element => ({
    id: Ids.element(),
    stateId,
    tag: "a",
    role: "link",
    name,
    fingerprint,
    locatorCandidates: [
      { strategy: "role", role: "link", name, confidence: 0.99 },
    ],
    provenance: {
      discoverySessionId: sessionId,
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: "2026-08-12T00:00:00.000Z",
      lastSeenAt: "2026-08-12T00:00:00.000Z",
    },
  });

  q.enqueueFromElements({
    sourceStateId: stateId,
    elements: [mk("Old", "old"), mk("New", "new")],
    exploredFingerprints: new Set(["old"]),
  });

  const first = q.dequeue();
  assert.equal(first?.payload?.fingerprint, "new");
});