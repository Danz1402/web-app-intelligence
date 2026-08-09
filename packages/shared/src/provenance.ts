import type { DiscoverySessionId, ArtifactId } from "./ids.js";
import type { EvidenceStatus } from "./evidence-status.js";

/**
 * Attribution for important discovered facts.
 *
 * Rule (Phase 0.4):
 * - Every important discovery fact MUST be traceable to a DiscoverySession
 *   and MUST have timestamps (firstSeenAt / lastSeenAt via this type, or
 *   an equivalent explicit timestamp on the entity).
 * - Prefer attaching `provenance: Provenance` on discovery entities.
 *
 * Session-attributed (must use Provenance, or explicit session + time):
 *   PageTemplate, PageInstance, State, Element, Action, Transition,
 *   Form, Field, ValidationRule, NetworkRequest, ApiEndpoint,
 *   DiscoveryError, RoleProfile, CandidateWorkflow,
 *   Artifact, VerificationResult
 *
 * Not session-attributed (registry / container — OK without Provenance):
 *   Application, Environment, DiscoverySession
 *
 * DiscoverySession is the session itself (startedAt / endedAt).
 * Artifact uses discoverySessionId + createdAt + evidenceStatus.
 * VerificationResult uses discoverySessionId + checkedAt + evidenceStatus.
 */

export interface Provenance {
  discoverySessionId: DiscoverySessionId;
  evidenceStatus: EvidenceStatus;
  firstSeenAt: string; // ISO-8601
  lastSeenAt: string; // ISO-8601
  artifactIds?: ArtifactId[];
}