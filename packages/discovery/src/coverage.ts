import type { ExplorationTask } from "./exploration-types.js";

export type CoverageCounts = {
  exploredActions: number;
  blockedActions: number;
  failedActions: number;
  skippedActions: number;
  pendingActions: number;
  pageTemplates: number;
  formsDiscovered: number;
  workflowCandidates: number;
  workflowsVerified: number;
};

export type CoverageReport = CoverageCounts & {
  actionsTotal: number;
  /** explored / (explored + pending + blocked + failed + skipped); 0 if none */
  actionCoverage: number;
  unknownActions: number;
};

export function countTasksByStatus(tasks: ExplorationTask[]): Pick<
  CoverageCounts,
  | "exploredActions"
  | "blockedActions"
  | "failedActions"
  | "skippedActions"
  | "pendingActions"
> {
  let exploredActions = 0;
  let blockedActions = 0;
  let failedActions = 0;
  let skippedActions = 0;
  let pendingActions = 0;
  for (const t of tasks) {
    if (t.status === "COMPLETE") exploredActions += 1;
    else if (t.status === "BLOCKED") blockedActions += 1;
    else if (t.status === "FAILED") failedActions += 1;
    else if (t.status === "SKIPPED") skippedActions += 1;
    else pendingActions += 1; // PENDING or RUNNING
  }
  return {
    exploredActions,
    blockedActions,
    failedActions,
    skippedActions,
    pendingActions,
  };
}

export function buildCoverageReport(
  counts: CoverageCounts,
): CoverageReport {
  const unknownActions = counts.pendingActions;
  const actionsTotal =
    counts.exploredActions +
    counts.blockedActions +
    counts.failedActions +
    counts.skippedActions +
    counts.pendingActions;
  const actionCoverage =
    actionsTotal === 0 ? 0 : counts.exploredActions / actionsTotal;
  return {
    ...counts,
    unknownActions,
    actionsTotal,
    actionCoverage,
  };
}

export function coverageFromTasks(
  tasks: ExplorationTask[],
  extras: Partial<
    Pick<
      CoverageCounts,
      "pageTemplates" | "formsDiscovered" | "workflowCandidates" | "workflowsVerified"
    >
  > = {},
): CoverageReport {
  return buildCoverageReport({
    ...countTasksByStatus(tasks),
    pageTemplates: extras.pageTemplates ?? 0,
    formsDiscovered: extras.formsDiscovered ?? 0,
    workflowCandidates: extras.workflowCandidates ?? 0,
    workflowsVerified: extras.workflowsVerified ?? 0,
  });
}