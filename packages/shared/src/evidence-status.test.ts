import assert from "node:assert/strict";
import test from "node:test";
import { EVIDENCE_STATUSES, EvidenceStatus } from "./evidence-status.js";

test("EvidenceStatus has five values", () => {
  assert.equal(EVIDENCE_STATUSES.length, 5);
  assert.equal(EvidenceStatus.OBSERVED, "OBSERVED");
});