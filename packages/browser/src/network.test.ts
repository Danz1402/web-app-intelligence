import assert from "node:assert/strict";
import test from "node:test";
import { BrowserSession } from "./browser-session.js";

test("network capture records requests for example.com", async () => {
  const session = new BrowserSession({ headless: true });
  try {
    await session.start();
    session.startNetworkCapture();
    await session.open("https://the-internet.herokuapp.com");
    const log = session.stopNetworkCapture();
    

    assert.ok(log.length >= 1);
    assert.ok(log.some((r) => r.method === "GET" && /the-internet.herokuapp\.com/.test(r.url)));
  } finally {
    await session.close();
  }
});