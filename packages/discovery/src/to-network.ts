import {
    EvidenceStatus,
    Ids,
    type ApplicationId,
    type ApiEndpoint,
    type DiscoverySessionId,
    type NetworkRequest,
  } from "@wai/shared";
  import type { CorrelatedNetworkRequest } from "./correlate-network.js";
  import { normalizeApiUrl } from "./normalize-api-url.js";
  
  export function toObservedNetworkRequest(input: {
    correlated: CorrelatedNetworkRequest;
    discoverySessionId: DiscoverySessionId;
    observedAt?: string;
  }): NetworkRequest {
    const now = input.observedAt ?? input.correlated.startedAt;
    return {
      id: Ids.networkRequest(),
      discoverySessionId: input.discoverySessionId,
      actionId: input.correlated.actionId,
      method: input.correlated.method,
      url: input.correlated.url,
      statusCode: input.correlated.statusCode,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: input.correlated.finishedAt ?? now,
      },
    };
  }
  
  export function toObservedApiEndpoint(input: {
    method: string;
    url: string;
    applicationId: ApplicationId;
    discoverySessionId: DiscoverySessionId;
    observedAt?: string;
  }): ApiEndpoint {
    const now = input.observedAt ?? new Date().toISOString();
    return {
      id: Ids.apiEndpoint(),
      applicationId: input.applicationId,
      method: input.method.toUpperCase(),
      normalizedUrl: normalizeApiUrl(input.url),
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  }