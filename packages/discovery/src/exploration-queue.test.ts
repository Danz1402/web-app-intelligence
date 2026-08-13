import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids, type Element } from "@wai/shared";
import { ExplorationQueue } from "./exploration-queue.js";

test("enqueueFromElements then dequeue FIFO", () => {
  const stateId = Ids.state();
  const sessionId = Ids.discoverySession();
  const elements: Element[] = [
    {
      id: Ids.element(),
      stateId,
      tag: "a",
      role: "link",
      name: "A",
      locatorCandidates: [{ strategy: "role", role: "link", name: "A", confidence: 0.99 }],
      provenance: {
        discoverySessionId: sessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: "2026-08-11T00:00:00.000Z",
        lastSeenAt: "2026-08-11T00:00:00.000Z",
      },
    },
    {
      id: Ids.element(),
      stateId,
      tag: "a",
      role: "link",
      name: "B",
      locatorCandidates: [{ strategy: "role", role: "link", name: "B", confidence: 0.99 }],
      provenance: {
        discoverySessionId: sessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: "2026-08-11T00:00:00.000Z",
        lastSeenAt: "2026-08-11T00:00:00.000Z",
      },
    },
  ];

  const q = new ExplorationQueue();
  q.enqueueFromElements({ sourceStateId: stateId, elements });
  assert.equal(q.peekPending().length, 2);

  const first = q.dequeue();
  assert.equal(first?.status, "RUNNING");
  assert.equal(first?.attempts, 1);
  assert.equal(first?.locatorCandidates[0]?.name, "A");
  

  q.updateStatus(first!.id, "COMPLETE");
  assert.equal(q.get(first!.id)?.status, "COMPLETE");

  const second = q.dequeue();
  assert.equal(second?.locatorCandidates[0]?.name, "B");
});

test("skips elements with no locators", () => {
  const q = new ExplorationQueue();
  q.enqueueFromElements({
    sourceStateId: Ids.state(),
    elements: [
      {
        id: Ids.element(),
        stateId: Ids.state(),
        tag: "div",
        locatorCandidates: [],
        provenance: {
          discoverySessionId: Ids.discoverySession(),
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: "2026-08-11T00:00:00.000Z",
          lastSeenAt: "2026-08-11T00:00:00.000Z",
        },
      },
    ],
  });
  assert.equal(q.size(), 0);
});