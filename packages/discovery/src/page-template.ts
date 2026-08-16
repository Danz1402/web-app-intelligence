import {
    EvidenceStatus,
    Ids,
    type ApplicationId,
    type DiscoverySessionId,
    type PageInstance,
    type PageTemplate,
  } from "@wai/shared";
  import { normalizePathname } from "./normalize-path.js";
  
  export function routeTemplateFromUrl(urlOrPath: string): string {
    let pathname: string;
    try {
      pathname = new URL(urlOrPath).pathname;
    } catch {
      pathname = urlOrPath.split("?")[0] ?? urlOrPath;
    }
    return normalizePathname(pathname);
  }
  
  export function toObservedPageTemplate(input: {
    urlOrPath: string;
    applicationId: ApplicationId;
    discoverySessionId: DiscoverySessionId;
    observedAt?: string;
  }): PageTemplate {
    const now = input.observedAt ?? new Date().toISOString();
    return {
      id: Ids.pageTemplate(),
      applicationId: input.applicationId,
      pattern: routeTemplateFromUrl(input.urlOrPath),
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  }
  
  export function toObservedPageInstance(input: {
    url: string;
    applicationId: ApplicationId;
    discoverySessionId: DiscoverySessionId;
    pageTemplateId?: PageTemplate["id"];
    observedAt?: string;
  }): PageInstance {
    const now = input.observedAt ?? new Date().toISOString();
    return {
      id: Ids.pageInstance(),
      pageTemplateId: input.pageTemplateId,
      applicationId: input.applicationId,
      url: input.url,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
  }
  
  /** Same app + same pattern → reuse template. */
  export function resolvePageTemplate(
    known: PageTemplate[],
    applicationId: ApplicationId,
    urlOrPath: string,
  ): { kind: "existing"; template: PageTemplate } | { kind: "new"; pattern: string } {
    const pattern = routeTemplateFromUrl(urlOrPath);
    const existing = known.find(
      (t) => t.applicationId === applicationId && t.pattern === pattern,
    );
    if (existing) return { kind: "existing", template: existing };
    return { kind: "new", pattern };
  }