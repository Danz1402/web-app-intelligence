import type { Db } from "@wai/storage";
import { insertNetworkRequest, upsertApiEndpoint } from "@wai/storage";
import type { ApplicationId, DiscoverySessionId } from "@wai/shared";
import type { CorrelatedNetworkRequest } from "./correlate-network.js";
import {
  toObservedApiEndpoint,
  toObservedNetworkRequest,
} from "./to-network.js";

export async function persistCorrelatedNetwork(input: {
  db: Db;
  correlated: CorrelatedNetworkRequest[];
  discoverySessionId: DiscoverySessionId;
  applicationId: ApplicationId;
}): Promise<{ networkRequestIds: string[]; apiEndpointIds: string[] }> {
  const networkRequestIds: string[] = [];
  const apiEndpointIds: string[] = [];

  for (const c of input.correlated) {
    const req = toObservedNetworkRequest({
      correlated: c,
      discoverySessionId: input.discoverySessionId,
    });
    await insertNetworkRequest(input.db, req);
    networkRequestIds.push(req.id);

    const endpoint = toObservedApiEndpoint({
      method: c.method,
      url: c.url,
      applicationId: input.applicationId,
      discoverySessionId: input.discoverySessionId,
    });
    await upsertApiEndpoint(input.db, endpoint);
    apiEndpointIds.push(endpoint.id);
  }

  return { networkRequestIds, apiEndpointIds };
}