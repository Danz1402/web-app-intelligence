import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "./browser-session.js";

test("captures console.error and pageerror", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    await session.getPage().setContent(`
      <script>
        console.error("boom-console");
        throw new Error("boom-page");
      </script>
    `);
    await new Promise((r) => setTimeout(r, 100));
    const errors = session.getRuntimeErrors();
    assert.ok(errors.some((e) => e.kind === "console" && e.message.includes("boom-console")));
    assert.ok(errors.some((e) => e.kind === "pageerror" && e.message.includes("boom-page")));
  } finally {
    await session.close();
  }
});