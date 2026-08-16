import { DISCOVERY_CONTRACT_VERSION } from "@wai/shared";

export { createPool, getDatabaseUrl, type Db } from "./db.js";
export { migrate } from "./migrate.js";

export {
  insertApplication,
  insertEnvironment,
  insertDiscoverySession,
  updateDiscoverySession,
  insertState,
  insertArtifact,
  insertElement,
  insertElements,
  insertAction,
  updateAction,
  insertTransition,
  insertNetworkRequest,
upsertApiEndpoint,
insertField,
insertForm,
insertValidationRule,
insertRoleProfile,
insertCandidateWorkflow,
insertVerificationResult,
updateCandidateWorkflowProvenance,
} from "./repos/gate1.js";


export function getContractVersion(): string {
  return DISCOVERY_CONTRACT_VERSION;
}
export type { CandidateWorkflow } from "@wai/shared";
