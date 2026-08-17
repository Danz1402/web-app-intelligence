import type { Db } from "../db.js";

export type SessionRow = {
  id: string;
  application_id: string;
  status: string;
  start_url: string;
  started_at: string;
  app_name: string;
};

export type ArtifactRow = {
    id: string;
    kind: string;
    path: string;
    created_at: string;
    evidence_status: string;
  };

  export type SessionActionCoverageRow = {
    exploredActions: number;
    failedActions: number;
    unknownActions: number;
    blockedActions: number;
    skippedActions: number;
    pendingActions: number;
    formsDiscovered: number;
    workflowCandidates: number;
    workflowsVerified: number;
    pageTemplates: number;
  };

export async function listDiscoverySessions(db: Db): Promise<SessionRow[]> {
  const r = await db.query(
    `SELECT ds.id, ds.application_id, ds.status, ds.start_url, ds.started_at,
            a.name AS app_name
     FROM discovery_sessions ds
     JOIN applications a ON a.id = ds.application_id
     ORDER BY ds.started_at DESC
     LIMIT 50`,
  );
  return r.rows;
}

export async function listStatesForSession(db: Db, sessionId: string) {
  const r = await db.query(
    `SELECT id, url, pathname, title, provenance FROM states
     WHERE discovery_session_id = $1
     ORDER BY (provenance->>'firstSeenAt')`,
    [sessionId],
  );
  return r.rows as Array<{ id: string; url: string; pathname: string; title: string }>;
}

export async function listElementsForState(db: Db, stateId: string) {
  const r = await db.query(
    `SELECT id, role, name, tag FROM elements WHERE state_id = $1 LIMIT 100`,
    [stateId],
  );
  return r.rows as Array<{ id: string; role: string | null; name: string | null; tag: string | null }>;
}

export async function listWorkflowsForApplication(db: Db, applicationId: string) {
  const r = await db.query(
    `SELECT id, name, provenance->>'evidenceStatus' AS evidence_status
     FROM candidate_workflows WHERE application_id = $1`,
    [applicationId],
  );
  return r.rows as Array<{ id: string; name: string; evidence_status: string | null }>;
}

export async function listArtifactsForSession(db: Db, sessionId: string) {
    const r = await db.query(
      `SELECT id, kind, path, created_at, evidence_status
       FROM artifacts
       WHERE discovery_session_id = $1
       ORDER BY created_at`,
      [sessionId],
    );
    return r.rows as ArtifactRow[];
  }
  export async function getArtifactById(db: Db, id: string) {
    const r = await db.query(
      `SELECT id, kind, path, evidence_status, discovery_session_id
       FROM artifacts WHERE id = $1`,
      [id],
    );
    return (r.rows[0] as ArtifactRow & { discovery_session_id: string } | undefined);
  }


  export async function sessionActionCoverage(
    db: Db,
    sessionId: string,
  ): Promise<SessionActionCoverageRow> {
    const actions = await db.query(
      `SELECT a.provenance->>'evidenceStatus' AS status
       FROM actions a
       JOIN states s ON s.id = a.state_id
       WHERE s.discovery_session_id = $1`,
      [sessionId],
    );
    let exploredActions = 0;
    let failedActions = 0;
    for (const row of actions.rows as Array<{ status: string | null }>) {
      if (row.status === "FAILED") failedActions += 1;
      else exploredActions += 1;
    }
    const unknown = await db.query(
      `SELECT COUNT(*)::int AS n
       FROM elements e
       JOIN states s ON s.id = e.state_id
       WHERE s.discovery_session_id = $1
         AND NOT EXISTS (SELECT 1 FROM actions a WHERE a.element_id = e.id)`,
      [sessionId],
    );
    const forms = await db.query(
      `SELECT COUNT(*)::int AS n
       FROM forms f
       JOIN states s ON s.id = f.state_id
       WHERE s.discovery_session_id = $1`,
      [sessionId],
    );
    const app = await db.query(
      `SELECT application_id FROM discovery_sessions WHERE id = $1`,
      [sessionId],
    );
    const applicationId = app.rows[0]?.application_id as string | undefined;
    let workflowCandidates = 0;
    let workflowsVerified = 0;
    if (applicationId) {
      const wf = await db.query(
        `SELECT
           COUNT(*)::int AS n,
           COUNT(*) FILTER (WHERE provenance->>'evidenceStatus' = 'VERIFIED')::int AS v
         FROM candidate_workflows WHERE application_id = $1`,
        [applicationId],
      );
      workflowCandidates = wf.rows[0]?.n ?? 0;
      workflowsVerified = wf.rows[0]?.v ?? 0;
    }
    return {
      exploredActions,
      failedActions,
      unknownActions: unknown.rows[0]?.n ?? 0,
      blockedActions: 0,
      skippedActions: 0,
      pendingActions: unknown.rows[0]?.n ?? 0,
      formsDiscovered: forms.rows[0]?.n ?? 0,
      workflowCandidates,
      workflowsVerified,
      pageTemplates: 0,
    };
  }