import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids } from "@wai/shared";
import { toObservedElements } from "./to-elements.js";

test("toObservedElements attaches OBSERVED provenance", () => {
  const stateId = Ids.state();
  const sessionId = Ids.discoverySession();
  const elements = toObservedElements({
    detected: [
      {
        kind: "link",
        tag: "a",
        name: "More information",
        href: "https://iana.org",
        disabled: false,
        visible: true,
      },
    ],
    stateId,
    discoverySessionId: sessionId,
    observedAt: "2026-08-10T12:00:00.000Z",
  });

  assert.equal(elements.length, 1);
  assert.equal(elements[0]?.stateId, stateId);
  assert.equal(elements[0]?.provenance.evidenceStatus, EvidenceStatus.OBSERVED);
  assert.equal(typeof elements[0]?.fingerprint, "string");
assert.ok((elements[0]?.fingerprint?.length ?? 0) > 0);
  const locators = elements[0]?.locatorCandidates ?? [];
    assert.ok(locators.length > 0);
    assert.ok(
    locators.some(
        (c) => c.strategy === "role" || c.strategy === "css",
    ),
    );
});