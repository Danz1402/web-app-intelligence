import type {
    ActionId,
    ApiEndpointId,
    ApplicationId,
    ArtifactId,
    CandidateWorkflowId,
    DiscoverySessionId,
    ElementId,
    EnvironmentId,
    ErrorId,
    FieldId,
    FormId,
    NetworkRequestId,
    PageInstanceId,
    PageTemplateId,
    RoleProfileId,
    StateId,
    TransitionId,
    ValidationRuleId,
    VerificationResultId,
  } from "./ids.js";
  import type { EvidenceStatus } from "./evidence-status.js";
  import type { Provenance } from "./provenance.js";
  
  export type DiscoverySessionStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed";
  
  export type ArtifactKind = "screenshot" | "trace" | "dom_snapshot" | "other";
  
  export interface Application {
    id: ApplicationId;
    name: string;
    baseUrl: string;
    createdAt: string;
  }
  
  export interface Environment {
    id: EnvironmentId;
    applicationId: ApplicationId;
    name: string; // e.g. "staging" | "production"
    baseUrl: string;
  }
  
  export interface DiscoverySession {
    id: DiscoverySessionId;
    applicationId: ApplicationId;
    environmentId: EnvironmentId;
    status: DiscoverySessionStatus;
    startedAt: string;
    endedAt?: string;
    roleProfileId?: RoleProfileId;
    browser: "chromium";
    startUrl: string;
    errorMessage?: string;
  }
  
  export interface PageTemplate {
    id: PageTemplateId;
    applicationId: ApplicationId;
    pattern: string; // e.g. "/customers/:id"
    provenance: Provenance;
  }
  
  export interface PageInstance {
    id: PageInstanceId;
    pageTemplateId?: PageTemplateId;
    applicationId: ApplicationId;
    url: string;
    provenance: Provenance;
  }
  
  /** Structured app state — not raw HTML as the primary representation. */
  export interface State {
    id: StateId;
    discoverySessionId: DiscoverySessionId;
    pageInstanceId?: PageInstanceId;
    url: string;
    pathname: string;
    title: string;
    fingerprint?: string;
    /** Compact structured summary; extend in Phase 3. */
    snapshot: Record<string, unknown>;
    provenance: Provenance;
  }
  
  export interface Element {
    id: ElementId;
    stateId: StateId;
    role?: string;
    name?: string;
    tag?: string;
    fingerprint?: string;
    locatorCandidates: Array<Record<string, unknown>>;
    provenance: Provenance;
  }
  
  export interface Action {
    id: ActionId;
    elementId?: ElementId;
    stateId: StateId;
    type: string; // e.g. "click" | "type" | "select"
    payload?: Record<string, unknown>;
    provenance: Provenance;
  }
  
  export interface Transition {
    id: TransitionId;
    fromStateId: StateId;
    actionId: ActionId;
    toStateId?: StateId;
    provenance: Provenance;
  }
  
  export interface Form {
    id: FormId;
    stateId: StateId;
    name?: string;
    provenance: Provenance;
  }
  
  export interface Field {
    id: FieldId;
    formId: FormId;
    name?: string;
    label?: string;
    fieldType?: string;
    required?: boolean;
    provenance: Provenance;
  }
  
  export interface ValidationRule {
    id: ValidationRuleId;
    fieldId?: FieldId;
    formId?: FormId;
    ruleType: string;
    message?: string;
    provenance: Provenance;
  }
  
  export interface NetworkRequest {
    id: NetworkRequestId;
    discoverySessionId: DiscoverySessionId;
    actionId?: ActionId;
    method: string;
    url: string;
    statusCode?: number;
    provenance: Provenance;
  }
  
  export interface ApiEndpoint {
    id: ApiEndpointId;
    applicationId: ApplicationId;
    method: string;
    normalizedUrl: string; // e.g. "/api/customers/{id}"
    provenance: Provenance;
  }
  
  export interface DiscoveryError {
    id: ErrorId;
    discoverySessionId: DiscoverySessionId;
    stateId?: StateId;
    actionId?: ActionId;
    message: string;
    stack?: string;
    provenance: Provenance;
  }
  
  export interface Artifact {
    id: ArtifactId;
    discoverySessionId: DiscoverySessionId;
    kind: ArtifactKind;
    path: string;
    createdAt: string;
    evidenceStatus: EvidenceStatus;
  }
  
  export interface RoleProfile {
    id: RoleProfileId;
    applicationId: ApplicationId;
    name: string;
    provenance: Provenance;
  }
  
  export interface CandidateWorkflow {
    id: CandidateWorkflowId;
    applicationId: ApplicationId;
    name: string;
    actionIds: ActionId[];
    provenance: Provenance;
  }
  
  export interface VerificationResult {
    id: VerificationResultId;
    candidateWorkflowId: CandidateWorkflowId;
    discoverySessionId: DiscoverySessionId;
    passed: boolean;
    evidenceStatus: EvidenceStatus;
    checkedAt: string;
    details?: Record<string, unknown>;
  }