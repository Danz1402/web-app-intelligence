import {
    EvidenceStatus,
    Ids,
    type ApplicationId,
    type DiscoverySessionId,
    type RoleProfile,
  } from "@wai/shared";
  
  export function toObservedRoleProfile(input: {
    name: string;
    applicationId: ApplicationId;
    discoverySessionId: DiscoverySessionId;
    observedAt?: string;
  }): RoleProfile {
    const now = input.observedAt ?? new Date().toISOString();
    return {
      id: Ids.roleProfile(),
      applicationId: input.applicationId,
      name: input.name,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  }
  
  /** Local-only: which saved browser state to load for this role. Never persist path. */
  export type RoleAuthBinding = {
    roleProfile: RoleProfile;
    storageStatePath?: string;
  };