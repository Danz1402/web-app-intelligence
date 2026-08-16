import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { BrowserSession } from "./browser-session.js";

test("saveStorageState then start loads cookies", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wai-auth-"));
  const statePath = path.join(dir, "storage.json");

  const first = new BrowserSession({ headless: true, storageStatePath: statePath });
  try {
    await first.start();
    await first.open("https://example.com");
    await first.getPage().context().addCookies([
      {
        name: "wai_session",
        value: "abc123",
        url: "https://example.com",
      },
    ]);
    await first.saveStorageState();
  } finally {
    await first.close();
  }

  const raw = JSON.parse(await fs.readFile(statePath, "utf8")) as {
    cookies: Array<{ name: string; value: string }>;
  };
  assert.ok(raw.cookies.some((c) => c.name === "wai_session" && c.value === "abc123"));

  const second = new BrowserSession({ headless: true, storageStatePath: statePath });
  try {
    await second.start();
    await second.open("https://example.com");
    const cookies = await second.getPage().context().cookies("https://example.com");
    assert.ok(cookies.some((c) => c.name === "wai_session" && c.value === "abc123"));
  } finally {
    await second.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});