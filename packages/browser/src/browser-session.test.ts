import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "./browser-session.js";
import fs from "node:fs/promises";
import path from "node:path";

test("BrowserSession start and close", async () => {
  const session = new BrowserSession({ headless: true });
  await session.start();
  assert.equal(session.getEngine(), "chromium");
  assert.ok(session.getPage());
  await session.close();
});

test("BrowserSession open URL", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com", {
      waitUntil: "domcontentloaded",
    });
    const page = session.getPage();
    assert.match(page.url(), /the-internet.herokuapp\.com/);
    const title = await page.title();
    assert.ok(title.length > 0);
  } finally {
    await session.close();
  }
});


test("BrowserSession screenshot writes file", async () => {
  const outPath = path.resolve("artifacts/screenshots/test-example.png");
  const session = new BrowserSession({
    headless: true,
    screenshotsDir: "artifacts/screenshots",
  });
  try {
    await session.start();
    await session.open("https://the-internet.herokuapp.com");
    const saved = await session.screenshot({ path: outPath });
    assert.equal(saved, outPath);
    const stat = await fs.stat(outPath);
    assert.ok(stat.size > 0);
  } finally {
    await session.close();
    await fs.unlink(outPath).catch(() => undefined);
  }
});

test("BrowserSession trace start and stop", async () => {
  const repoRoot = process.cwd().endsWith("browser")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();
  const outPath = path.join(repoRoot, "artifacts/traces/test-example.zip");

  const session = new BrowserSession({
    headless: true,
    tracesDir: path.join(repoRoot, "artifacts/traces"),
  });
  try {
    await session.start();
    await session.startTrace();
    await session.open("https://the-internet.herokuapp.com");
    const saved = await session.stopTrace({ path: outPath });
    assert.equal(saved, outPath);
    const stat = await fs.stat(outPath);
    assert.ok(stat.size > 0);
  } finally {
    await session.close();
    await fs.unlink(outPath).catch(() => undefined);
  }
});