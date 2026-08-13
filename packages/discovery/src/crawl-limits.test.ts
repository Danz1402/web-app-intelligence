import assert from "node:assert/strict";
import test from "node:test";
import {
  canEnqueueAtDepth,
  canStartAction,
  createCrawlBudget,
  defaultCrawlLimits,
  isUrlAllowed,
  recordActionStarted,
} from "./crawl-limits.js";

test("blocks depth beyond maxDepth", () => {
  const limits = defaultCrawlLimits({ maxDepth: 2 });
  assert.equal(canEnqueueAtDepth(2, limits).ok, true);
  assert.equal(canEnqueueAtDepth(3, limits).ok, false);
});

test("blocks when maxActions reached", () => {
  const limits = defaultCrawlLimits({ maxActions: 2 });
  const budget = createCrawlBudget();
  recordActionStarted(budget);
  recordActionStarted(budget);
  assert.equal(canStartAction(budget, limits).ok, false);
});

test("allowedDomains enforces same-site-ish hosts", () => {
  const limits = defaultCrawlLimits({ allowedDomains: ["example.com"] });
  assert.equal(isUrlAllowed("https://example.com/a", limits).ok, true);
  assert.equal(isUrlAllowed("https://www.example.com/a", limits).ok, true);
  assert.equal(isUrlAllowed("https://evil.com/", limits).ok, false);
});