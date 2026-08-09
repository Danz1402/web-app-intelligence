/**
 * Record IDs for persisted discovery entities.
 * - Format: UUID string (crypto.randomUUID / RFC 4122)
 * - Logical fingerprints (element sameness across crawls) are NOT these IDs
 * - Do not reuse record IDs across entity types
 */

type Brand<T, B extends string> = T & { readonly __brand: B };

export type ApplicationId = Brand<string, "ApplicationId">;
export type EnvironmentId = Brand<string, "EnvironmentId">;
export type DiscoverySessionId = Brand<string, "DiscoverySessionId">;
export type PageTemplateId = Brand<string, "PageTemplateId">;
export type PageInstanceId = Brand<string, "PageInstanceId">;
export type StateId = Brand<string, "StateId">;
export type ElementId = Brand<string, "ElementId">;
export type ActionId = Brand<string, "ActionId">;
export type TransitionId = Brand<string, "TransitionId">;
export type FormId = Brand<string, "FormId">;
export type FieldId = Brand<string, "FieldId">;
export type ValidationRuleId = Brand<string, "ValidationRuleId">;
export type NetworkRequestId = Brand<string, "NetworkRequestId">;
export type ApiEndpointId = Brand<string, "ApiEndpointId">;
export type ErrorId = Brand<string, "ErrorId">;
export type ArtifactId = Brand<string, "ArtifactId">;
export type RoleProfileId = Brand<string, "RoleProfileId">;
export type CandidateWorkflowId = Brand<string, "CandidateWorkflowId">;
export type VerificationResultId = Brand<string, "VerificationResultId">;

function createId<T extends string>(): T {
  return crypto.randomUUID() as T;
}

export const Ids = {
  application: (): ApplicationId => createId(),
  environment: (): EnvironmentId => createId(),
  discoverySession: (): DiscoverySessionId => createId(),
  pageTemplate: (): PageTemplateId => createId(),
  pageInstance: (): PageInstanceId => createId(),
  state: (): StateId => createId(),
  element: (): ElementId => createId(),
  action: (): ActionId => createId(),
  transition: (): TransitionId => createId(),
  form: (): FormId => createId(),
  field: (): FieldId => createId(),
  validationRule: (): ValidationRuleId => createId(),
  networkRequest: (): NetworkRequestId => createId(),
  apiEndpoint: (): ApiEndpointId => createId(),
  error: (): ErrorId => createId(),
  artifact: (): ArtifactId => createId(),
  roleProfile: (): RoleProfileId => createId(),
  candidateWorkflow: (): CandidateWorkflowId => createId(),
  verificationResult: (): VerificationResultId => createId(),
} as const;

/** Narrow a raw string (e.g. from DB) into a branded ID. No format validation beyond non-empty. */
export function asId<T extends string>(value: string): T {
  if (!value) {
    throw new Error("ID must be a non-empty string");
  }
  return value as T;
}