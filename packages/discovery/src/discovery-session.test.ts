import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import { DiscoverySessionController } from "./discovery-session.js";
import { toObservedRoleProfile } from "./to-role-profile.js";

test("DiscoverySession create → start → complete", () => {
  const controller = new DiscoverySessionController();
  const created = controller.create({
    applicationId: Ids.application(),
    environmentId: Ids.environment(),
    startUrl: "https://the-internet.herokuapp.com",
  });

  assert.equal(created.status, "pending");
  assert.equal(created.browser, "chromium");

  const running = controller.start();
  assert.equal(running.status, "running");

  const done = controller.complete();
  assert.equal(done.status, "completed");
  assert.ok(done.endedAt);
});

test("DiscoverySession fail from running", () => {
  const controller = new DiscoverySessionController();
  controller.create({
    applicationId: Ids.application(),
    environmentId: Ids.environment(),
    startUrl: "https://the-internet.herokuapp.com",
  });
  controller.start();
  const failed = controller.fail("boom");
  assert.equal(failed.status, "failed");
  assert.equal(failed.errorMessage, "boom");
  assert.ok(failed.endedAt);
});

test("cannot complete from pending", () => {
  const controller = new DiscoverySessionController();
  controller.create({
    applicationId: Ids.application(),
    environmentId: Ids.environment(),
    startUrl: "https://example.com",
  });
  assert.throws(() => controller.complete());
});

test("toObservedRoleProfile sets name and app", () => {
  const p = toObservedRoleProfile({
    name: "Admin",
    applicationId: Ids.application(),
    discoverySessionId: Ids.discoverySession(),
  });
  assert.equal(p.name, "Admin");
});