import type {
    Application,
    Artifact,
    DiscoverySession,
    Environment,
    State,
    Element,
    Action,
    Transition,
    ApiEndpoint,
    NetworkRequest,
  } from "@wai/shared";
  import type { Db } from "../db.js";
  
  export async function insertApplication(
    db: Db,
    app: Application,
  ): Promise<void> {
    await db.query(
      `INSERT INTO applications (id, name, base_url, created_at)
       VALUES ($1, $2, $3, $4)`,
      [app.id, app.name, app.baseUrl, app.createdAt],
    );
  }
  
  export async function insertEnvironment(
    db: Db,
    env: Environment,
  ): Promise<void> {
    await db.query(
      `INSERT INTO environments (id, application_id, name, base_url)
       VALUES ($1, $2, $3, $4)`,
      [env.id, env.applicationId, env.name, env.baseUrl],
    );
  }
  
  export async function insertDiscoverySession(
    db: Db,
    session: DiscoverySession,
  ): Promise<void> {
    await db.query(
      `INSERT INTO discovery_sessions (
         id, application_id, environment_id, status, started_at, ended_at,
         role_profile_id, browser, start_url, error_message
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        session.id,
        session.applicationId,
        session.environmentId,
        session.status,
        session.startedAt,
        session.endedAt ?? null,
        session.roleProfileId ?? null,
        session.browser,
        session.startUrl,
        session.errorMessage ?? null,
      ],
    );
  }
  
  export async function updateDiscoverySession(
    db: Db,
    session: DiscoverySession,
  ): Promise<void> {
    await db.query(
      `UPDATE discovery_sessions
       SET status = $2,
           started_at = $3,
           ended_at = $4,
           error_message = $5
       WHERE id = $1`,
      [
        session.id,
        session.status,
        session.startedAt,
        session.endedAt ?? null,
        session.errorMessage ?? null,
      ],
    );
  }
  
  export async function insertState(db: Db, state: State): Promise<void> {
    await db.query(
      `INSERT INTO states (
         id, discovery_session_id, page_instance_id, url, pathname, title,
         fingerprint, snapshot, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)`,
      [
        state.id,
        state.discoverySessionId,
        state.pageInstanceId ?? null,
        state.url,
        state.pathname,
        state.title,
        state.fingerprint ?? null,
        JSON.stringify(state.snapshot),
        JSON.stringify(state.provenance),
      ],
    );
  }
  
  export async function insertArtifact(
    db: Db,
    artifact: Artifact,
  ): Promise<void> {
    await db.query(
      `INSERT INTO artifacts (
         id, discovery_session_id, kind, path, created_at, evidence_status
       ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        artifact.id,
        artifact.discoverySessionId,
        artifact.kind,
        artifact.path,
        artifact.createdAt,
        artifact.evidenceStatus,
      ],
    );
  }

  export async function insertElement(db: Db, element: Element): Promise<void> {
    await db.query(
      `INSERT INTO elements (
         id, state_id, role, name, tag, fingerprint, locator_candidates, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)`,
      [
        element.id,
        element.stateId,
        element.role ?? null,
        element.name ?? null,
        element.tag ?? null,
        element.fingerprint ?? null,
        JSON.stringify(element.locatorCandidates),
        JSON.stringify(element.provenance),
      ],
    );
  }
  export async function insertElements(
    db: Db,
    elements: Element[],
  ): Promise<void> {
    for (const element of elements) {
      await insertElement(db, element);
    }
  }
  export async function insertAction(db: Db, action: Action): Promise<void> {
    await db.query(
      `INSERT INTO actions (id, element_id, state_id, type, payload, provenance)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`,
      [
        action.id,
        action.elementId ?? null,
        action.stateId,
        action.type,
        action.payload ? JSON.stringify(action.payload) : null,
        JSON.stringify(action.provenance),
      ],
    );
  }
  
  export async function updateAction(db: Db, action: Action): Promise<void> {
    await db.query(
      `UPDATE actions
       SET element_id = $2,
           type = $3,
           payload = $4::jsonb,
           provenance = $5::jsonb
       WHERE id = $1`,
      [
        action.id,
        action.elementId ?? null,
        action.type,
        action.payload ? JSON.stringify(action.payload) : null,
        JSON.stringify(action.provenance),
      ],
    );
  }

  export async function insertTransition(
    db: Db,
    transition: Transition,
  ): Promise<void> {
    await db.query(
      `INSERT INTO transitions (
         id, from_state_id, action_id, to_state_id, provenance
       ) VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [
        transition.id,
        transition.fromStateId,
        transition.actionId,
        transition.toStateId ?? null,
        JSON.stringify(transition.provenance),
      ],
    );
  }

  export async function insertNetworkRequest(
    db: Db,
    req: NetworkRequest,
  ): Promise<void> {
    await db.query(
      `INSERT INTO network_requests (
         id, discovery_session_id, action_id, method, url, status_code, provenance
       ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [
        req.id,
        req.discoverySessionId,
        req.actionId ?? null,
        req.method,
        req.url,
        req.statusCode ?? null,
        JSON.stringify(req.provenance),
      ],
    );
  }
  
  export async function upsertApiEndpoint(
    db: Db,
    endpoint: ApiEndpoint,
  ): Promise<void> {
    await db.query(
      `INSERT INTO api_endpoints (
         id, application_id, method, normalized_url, provenance
       ) VALUES ($1,$2,$3,$4,$5::jsonb)
       ON CONFLICT (application_id, method, normalized_url)
       DO UPDATE SET provenance = EXCLUDED.provenance`,
      [
        endpoint.id,
        endpoint.applicationId,
        endpoint.method,
        endpoint.normalizedUrl,
        JSON.stringify(endpoint.provenance),
      ],
    );
  }