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
    Form,
    Field,
    ValidationRule,
    RoleProfile,
    CandidateWorkflow,
    VerificationResult,
    PageTemplate,
    PageInstance,
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

  export async function insertForm(db: Db, form: Form): Promise<void> {
    await db.query(
      `INSERT INTO forms (id, state_id, name, provenance)
       VALUES ($1,$2,$3,$4::jsonb)`,
      [form.id, form.stateId, form.name ?? null, JSON.stringify(form.provenance)],
    );
  }
  
  export async function insertField(db: Db, field: Field): Promise<void> {
    await db.query(
      `INSERT INTO fields (id, form_id, name, label, field_type, required, provenance)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [
        field.id,
        field.formId,
        field.name ?? null,
        field.label ?? null,
        field.fieldType ?? null,
        field.required ?? null,
        JSON.stringify(field.provenance),
      ],
    );
  }
  
  export async function insertValidationRule(
    db: Db,
    rule: ValidationRule,
  ): Promise<void> {
    await db.query(
      `INSERT INTO validation_rules (id, field_id, form_id, rule_type, message, provenance)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [
        rule.id,
        rule.fieldId ?? null,
        rule.formId ?? null,
        rule.ruleType,
        rule.message ?? null,
        JSON.stringify(rule.provenance),
      ],
    );
  }

  export async function insertRoleProfile(
    db: Db,
    profile: RoleProfile,
  ): Promise<void> {
    await db.query(
      `INSERT INTO role_profiles (id, application_id, name, provenance)
       VALUES ($1,$2,$3,$4::jsonb)`,
      [
        profile.id,
        profile.applicationId,
        profile.name,
        JSON.stringify(profile.provenance),
      ],
    );
  }

  export async function insertCandidateWorkflow(
    db: Db,
    workflow: CandidateWorkflow,
    evidence: Record<string, unknown> = {},
  ): Promise<void> {
    await db.query(
      `INSERT INTO candidate_workflows (
         id, application_id, name, action_ids, evidence, provenance
       ) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb)`,
      [
        workflow.id,
        workflow.applicationId,
        workflow.name,
        JSON.stringify(workflow.actionIds),
        JSON.stringify(evidence),
        JSON.stringify(workflow.provenance),
      ],
    );
  }

  export async function insertVerificationResult(
    db: Db,
    result: VerificationResult,
  ): Promise<void> {
    await db.query(
      `INSERT INTO verification_results (
         id, candidate_workflow_id, discovery_session_id, passed,
         evidence_status, checked_at, details
       ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [
        result.id,
        result.candidateWorkflowId,
        result.discoverySessionId,
        result.passed,
        result.evidenceStatus,
        result.checkedAt,
        JSON.stringify(result.details ?? {}),
      ],
    );
  }
  
  export async function updateCandidateWorkflowProvenance(
    db: Db,
    workflow: CandidateWorkflow,
  ): Promise<void> {
    await db.query(
      `UPDATE candidate_workflows SET provenance = $2::jsonb WHERE id = $1`,
      [workflow.id, JSON.stringify(workflow.provenance)],
    );
  }

  export async function insertPageTemplate(db: Db, t: PageTemplate): Promise<void> {
    await db.query(
      `INSERT INTO page_templates (id, application_id, pattern, provenance)
       VALUES ($1,$2,$3,$4::jsonb)
       ON CONFLICT (application_id, pattern) DO NOTHING`,
      [t.id, t.applicationId, t.pattern, JSON.stringify(t.provenance)],
    );
  }
  
  export async function insertPageInstance(db: Db, p: PageInstance): Promise<void> {
    await db.query(
      `INSERT INTO page_instances (id, page_template_id, application_id, url, provenance)
       VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [p.id, p.pageTemplateId ?? null, p.applicationId, p.url, JSON.stringify(p.provenance)],
    );
  }