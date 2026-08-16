import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import {
  resolvePageTemplate,
  routeTemplateFromUrl,
  toObservedPageInstance,
  toObservedPageTemplate,
} from "./page-template.js";

test("routeTemplateFromUrl replaces numeric and uuid segments", () => {
  assert.equal(
    routeTemplateFromUrl("https://app.example/customers/101?x=1"),
    "/customers/{id}",
  );
  assert.equal(
    routeTemplateFromUrl(
      "/customers/550e8400-e29b-41d4-a716-446655440000",
    ),
    "/customers/{id}",
  );
  assert.equal(routeTemplateFromUrl("/login"), "/login");
});

test("resolvePageTemplate reuses same pattern for an app", () => {
  const applicationId = Ids.application();
  const discoverySessionId = Ids.discoverySession();
  const first = toObservedPageTemplate({
    urlOrPath: "/customers/101",
    applicationId,
    discoverySessionId,
  });
  const again = resolvePageTemplate([first], applicationId, "/customers/202");
  assert.equal(again.kind, "existing");
  if (again.kind === "existing") {
    assert.equal(again.template.id, first.id);
    assert.equal(again.template.pattern, "/customers/{id}");
  }

  const otherApp = resolvePageTemplate([first], Ids.application(), "/customers/1");
  assert.equal(otherApp.kind, "new");
});

test("page instance links to template", () => {
  const applicationId = Ids.application();
  const discoverySessionId = Ids.discoverySession();
  const template = toObservedPageTemplate({
    urlOrPath: "/customers/1",
    applicationId,
    discoverySessionId,
  });
  const instance = toObservedPageInstance({
    url: "https://app.example/customers/1",
    applicationId,
    discoverySessionId,
    pageTemplateId: template.id,
  });
  assert.equal(instance.pageTemplateId, template.id);
  assert.equal(instance.url, "https://app.example/customers/1");
});