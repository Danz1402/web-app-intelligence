import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import type { ObservedNetworkRequest } from "@wai/browser";
import { correlateNetworkRequests } from "./correlate-network.js";

test("correlateNetworkRequests tags action/state and drops assets", () => {
  const stateId = Ids.state();
  const actionId = Ids.action();
  const requests: ObservedNetworkRequest[] = [
    {
      url: "https://example.com/api/customers",
      method: "POST",
      resourceType: "fetch",
      statusCode: 201,
      startedAt: "2026-08-13T12:00:00.000Z",
    },
    {
      url: "https://example.com/logo.png",
      method: "GET",
      resourceType: "image",
      statusCode: 200,
      startedAt: "2026-08-13T12:00:00.000Z",
    },
  ];

  const out = correlateNetworkRequests(requests, stateId, actionId);
  assert.equal(out.length, 1);
  assert.equal(out[0]?.url, "https://example.com/api/customers");
  assert.equal(out[0]?.stateId, stateId);
  assert.equal(out[0]?.actionId, actionId);
});

import { BrowserSession } from "@wai/browser";
import { correlateNetworkDuringAction } from "./correlate-network.js";

test("correlateNetworkDuringAction captures click window", async () => {
  const session = new BrowserSession({ headless: true });
  const stateId = Ids.state();
  const actionId = Ids.action();
  try {
    await session.start();
    await session.open("https://example.com");
    const correlated = await correlateNetworkDuringAction({
      session,
      stateId,
      actionId,
      action: async () => {
        await session.click([
          { strategy: "css", value: "a", confidence: 0.4 },
        ]);
      },
    });

    assert.ok(correlated.every((r) => r.stateId === stateId));
    assert.ok(correlated.every((r) => r.actionId === actionId));
    assert.ok(correlated.some((r) => r.method === "GET"));
  } finally {
    await session.close();
  }
});