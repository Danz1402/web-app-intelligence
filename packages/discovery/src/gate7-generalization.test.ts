import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import type { DetectedElement } from "./element-types.js";
import {
  findNearState,
  resolveStateIdentity,
  type KnownStateSignature,
} from "./dedupe-states.js";
import { selectElementsToExplore } from "./exploration-guardrails.js";
import { generalizeBehavior, uniqueBehaviors } from "./generalize-behavior.js";
import { resolvePageTemplate, routeTemplateFromUrl } from "./page-template.js";
import { toObservedPageTemplate } from "./page-template.js";
import type { StateSignature } from "./state-signature.js";

function link(name: string, href: string): DetectedElement {
  return {
    kind: "link",
    tag: "a",
    role: "link",
    name,
    href,
    disabled: false,
    visible: true,
  };
}

function sig(
  partial: Partial<StateSignature> & Pick<StateSignature, "pathname">,
): StateSignature {
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

test("Gate 7: templates, components, behaviors, and bounded enqueue", () => {
  const applicationId = Ids.application();
  const discoverySessionId = Ids.discoverySession();

  assert.equal(routeTemplateFromUrl("/customers/101"), "/customers/{id}");
  assert.equal(routeTemplateFromUrl("/customers/202"), "/customers/{id}");

  const template = toObservedPageTemplate({
    urlOrPath: "/customers/101",
    applicationId,
    discoverySessionId,
  });
  const again = resolvePageTemplate([template], applicationId, "/customers/202");
  assert.equal(again.kind, "existing");

  const a = sig({ pathname: "/customers/1", signatureHash: "h1", textFingerprint: "aaa" });
  const b = sig({ pathname: "/customers/2", signatureHash: "h2", textFingerprint: "bbb" });
  const known: KnownStateSignature[] = [{ id: Ids.state(), signature: a }];
  assert.ok(findNearState(known, b));
  assert.equal(resolveStateIdentity(known, b).kind, "near");

  const rows = [
    link("View 1", "https://app.example/customers/1"),
    link("View 2", "https://app.example/customers/2"),
    link("View 3", "https://app.example/customers/3"),
    link("Edit Customer 101", "https://app.example/customers/101/edit"),
    link("Edit Customer 102", "https://app.example/customers/102/edit"),
    link("Edit Customer 103", "https://app.example/customers/103/edit"),
    link("Login", "https://app.example/login"),
  ];

  const behaviors = uniqueBehaviors(rows);
  assert.ok(behaviors.length <= 3);
  assert.equal(
    generalizeBehavior(rows[3]!).key,
    generalizeBehavior(rows[4]!).key,
  );

  const guarded = selectElementsToExplore({ detected: rows, minRepeatCount: 3 });
  assert.ok(guarded.detected.length < rows.length);
  assert.ok(guarded.skippedRepeated >= 4);
  assert.ok(guarded.detected.some((el) => el.name === "Login"));

  const afterFirstView = selectElementsToExplore({
    detected: rows,
    minRepeatCount: 3,
    exploredBehaviorKeys: new Set([generalizeBehavior(rows[0]!).key]),
  });
  assert.ok(!afterFirstView.detected.some((el) => el.name?.startsWith("View")));
});