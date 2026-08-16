import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { BrowserSession } from "@wai/browser";
import { Ids } from "@wai/shared";
import { DiscoverySessionController } from "./discovery-session.js";
import { decideExploreAction } from "./safety-engine.js";
import {
  toObservedRoleProfile,
  type RoleAuthBinding,
} from "./to-role-profile.js";

async function writeRoleState(dir: string, cookieValue: string): Promise<string> {
  const statePath = path.join(dir, `${cookieValue}.json`);
  const session = new BrowserSession({ headless: true, storageStatePath: statePath });
  try {
    await session.start();
    await session.open("https://example.com");
    await session.getPage().context().addCookies([
      {
        name: "wai_role",
        value: cookieValue,
        url: "https://example.com",
      },
    ]);
    await session.saveStorageState();
  } finally {
    await session.close();
  }
  return statePath;
}

test("Gate 8: role-scoped storageState + session tag + safety block", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wai-gate8-"));
  const applicationId = Ids.application();
  const environmentId = Ids.environment();
  const discoverySessionId = Ids.discoverySession();

  try {
    const employeePath = await writeRoleState(dir, "employee");
    const adminPath = await writeRoleState(dir, "admin");

    const employee: RoleAuthBinding = {
      roleProfile: toObservedRoleProfile({
        name: "Employee",
        applicationId,
        discoverySessionId,
      }),
      storageStatePath: employeePath,
    };
    const admin: RoleAuthBinding = {
      roleProfile: toObservedRoleProfile({
        name: "Admin",
        applicationId,
        discoverySessionId,
      }),
      storageStatePath: adminPath,
    };
    assert.notEqual(employee.roleProfile.id, admin.roleProfile.id);
    assert.notEqual(employee.storageStatePath, admin.storageStatePath);

    const controller = new DiscoverySessionController();
    const session = controller.create({
      applicationId,
      environmentId,
      startUrl: "https://example.com",
      roleProfileId: employee.roleProfile.id,
    });
    assert.equal(session.roleProfileId, employee.roleProfile.id);

    const browser = new BrowserSession({
      headless: true,
      storageStatePath: employee.storageStatePath,
    });
    try {
      await browser.start();
      await browser.open("https://example.com");
      const cookies = await browser.getPage().context().cookies("https://example.com");
      assert.ok(cookies.some((c) => c.name === "wai_role" && c.value === "employee"));
      assert.ok(!cookies.some((c) => c.value === "admin"));
    } finally {
      await browser.close();
    }

    const del = decideExploreAction({ name: "Delete account" });
    assert.equal(del.allowed, false);
    const view = decideExploreAction({ name: "View customer", actionType: "click" });
    assert.equal(view.allowed, true);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});