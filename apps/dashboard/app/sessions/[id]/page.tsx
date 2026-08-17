import {
    listDiscoverySessions,
    listElementsForState,
    listStatesForSession,
    listWorkflowsForApplication,
  } from "@wai/storage";
  import { db } from "../../../lib/db";
  
  export const dynamic = "force-dynamic";
  import { listArtifactsForSession } from "@wai/storage";
  import { sessionActionCoverage } from "@wai/storage";
import { buildCoverageReport } from "@wai/discovery";

  
  export default async function SessionPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    const sessions = await listDiscoverySessions(db());
    const session = sessions.find((s) => s.id === id);
    if (!session) return <p>Session not found</p>;
  
    const states = await listStatesForSession(db(), id);
    const artifacts = await listArtifactsForSession(db(), id);
    const workflows = await listWorkflowsForApplication(db(), session.application_id);
    const raw = await sessionActionCoverage(db(), id);
  const coverage = buildCoverageReport(raw);
    const firstElements =
      states[0] ? await listElementsForState(db(), states[0].id) : [];
  
    return (
      <main>
        <p>{session.app_name} · {session.status}</p>
        <p>{session.start_url}</p>
        <h2>States ({states.length})</h2>
        <ul>
          {states.map((st) => (
            <li key={st.id}>
              {st.title} — {st.pathname}
            </li>
          ))}
        </ul>
        <h2>Elements (first state)</h2>
        <ul>
          {firstElements.map((el) => (
            <li key={el.id}>{el.tag} {el.role} {el.name}</li>
          ))}
        </ul>
        <h2>Workflows</h2>
        <ul>
          {workflows.map((w) => (
            <li key={w.id}>{w.name} ({w.evidence_status})</li>
          ))}
        </ul>
        <h2>Evidence</h2>
      <ul>
        {artifacts.map((a) => (
          <li key={a.id}>
            <p>
              {a.kind} · {a.evidence_status} · {a.path}
            </p>
            {a.kind === "screenshot" ? (
              <img
                src={`/api/artifacts/${a.id}`}
                alt={a.path}
                style={{ maxWidth: 480 }}
              />
            ) : (
              <a href={`/api/artifacts/${a.id}`}>Download {a.kind}</a>
            )}
          </li>
        ))}
      </ul>
      <h2>Coverage</h2>
      <ul>
        <li>Explored actions: {coverage.exploredActions}</li>
        <li>Failed actions: {coverage.failedActions}</li>
        <li>Blocked actions: {coverage.blockedActions}</li>
        <li>Unknown (no action yet): {coverage.unknownActions}</li>
        <li>Action coverage: {(coverage.actionCoverage * 100).toFixed(0)}%</li>
        <li>Forms: {coverage.formsDiscovered}</li>
        <li>Workflows: {coverage.workflowCandidates} ({coverage.workflowsVerified} verified)</li>
      </ul>
      </main>
    );
  }
