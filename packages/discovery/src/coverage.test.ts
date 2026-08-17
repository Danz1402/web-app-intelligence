import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import type { ExplorationTask } from "./exploration-types.js";
import { coverageFromTasks } from "./coverage.js";

function task(status: ExplorationTask["status"]): ExplorationTask {
  return {
    id: Ids.action(),
    sourceStateId: Ids.state(),
    actionType: "click",
    locatorCandidates: [],
    priority: 0,
    depth: 0,
    risk: "low",
    attempts: 1,
    status,
  };
}

test("coverageFromTasks splits explored/blocked/failed/unknown", () => {
  const report = coverageFromTasks(
    [
      task("COMPLETE"),
      task("COMPLETE"),
      task("BLOCKED"),
      task("FAILED"),
      task("PENDING"),
    ],
    { pageTemplates: 3, formsDiscovered: 1, workflowCandidates: 2, workflowsVerified: 1 },
  );
  assert.equal(report.exploredActions, 2);
  assert.equal(report.blockedActions, 1);
  assert.equal(report.failedActions, 1);
  assert.equal(report.unknownActions, 1);
  assert.equal(report.actionsTotal, 5);
  assert.equal(report.actionCoverage, 0.4);
  assert.equal(report.pageTemplates, 3);
  assert.equal(report.workflowsVerified, 1);
});

test("empty tasks → zero coverage, not NaN", () => {
  const report = coverageFromTasks([]);
  assert.equal(report.actionCoverage, 0);
  assert.equal(report.actionsTotal, 0);
});