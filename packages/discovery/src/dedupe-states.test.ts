import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import {
  findExactState,
  findNearState,
  resolveStateIdentity,
  type KnownStateSignature,
} from "./dedupe-states.js";
import type { StateSignature } from "./state-signature.js";

function sig(partial: Partial<StateSignature> & Pick<StateSignature, "pathname">): StateSignature {
  return {
    url: `https://app.example${partial.pathname}`,
    search: "",
    urlHash: "",
    title: "Customer",
    dialogFingerprint: "",
    textFingerprint: "aaa",
    signatureHash: "hash-a",
    ...partial,
  };
}

test("exact match on same signatureHash", () => {
  const a = sig({ pathname: "/customers/1", signatureHash: "same" });
  const known: KnownStateSignature[] = [{ id: Ids.state(), signature: a }];
  const hit = findExactState(known, sig({ pathname: "/customers/99", signatureHash: "same" }));
  assert.equal(hit?.id, known[0].id);
});

test("near match treats /customers/1 and /customers/2 as same template path", () => {
  const a = sig({
    pathname: "/customers/1",
    textFingerprint: "aaa",
    signatureHash: "hash-1",
  });
  const b = sig({
    pathname: "/customers/2",
    textFingerprint: "bbb",
    signatureHash: "hash-2",
  });
  const stateId = Ids.state();
  const hit = findNearState([{ id: stateId, signature: a }], b);
  assert.ok(hit);
  assert.equal(hit?.id, stateId);
});

test("different title is not near", () => {
  const a = sig({ pathname: "/customers/1", title: "Customer" });
  const b = sig({ pathname: "/customers/2", title: "Order" });
  const hit = findNearState([{ id: Ids.state(), signature: a }], b);
  assert.equal(hit, undefined);
});

test("resolveStateIdentity prefers exact then near then new", () => {
  const existing = sig({ pathname: "/customers/1", signatureHash: "exact" });
  const known: KnownStateSignature[] = [{ id: Ids.state(), signature: existing }];

  const exact = resolveStateIdentity(known, sig({ pathname: "/other", signatureHash: "exact" }));
  assert.equal(exact.kind, "exact");

  const near = resolveStateIdentity(
    known,
    sig({ pathname: "/customers/2", signatureHash: "different" }),
  );
  assert.equal(near.kind, "near");

  const fresh = resolveStateIdentity(
    known,
    sig({ pathname: "/orders/1", title: "Order", signatureHash: "new" }),
  );
  assert.equal(fresh.kind, "new");
});