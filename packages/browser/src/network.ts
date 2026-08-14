export type ObservedResourceType = string;

export type ObservedNetworkRequest = {
  url: string;
  method: string;
  resourceType: ObservedResourceType;
  statusCode?: number;
  startedAt: string; // ISO
  finishedAt?: string;
  /** Safe-ish: no cookies/auth. Empty for v0 bodies. */
  requestHeaders?: Record<string, string>;
};

export type NetworkCapture = {
  start(): void;
  stop(): ObservedNetworkRequest[];
  getRequests(): ObservedNetworkRequest[];
};