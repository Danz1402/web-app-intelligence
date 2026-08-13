export type CrawlLimits = {
    maxDepth: number;
    maxActions: number;
    maxStates: number;
    /** Wall-clock budget in ms */
    maxRuntimeMs: number;
    /** Hostnames allowed (e.g. ["example.com"]). Empty = allow any. */
    allowedDomains: string[];
    blockedUrlPatterns?: string[]; // simple substring matches for v0
  };
  
  export type CrawlBudget = {
    actionsStarted: number;
    statesSeen: number;
    startedAtMs: number;
  };
  
  export function createCrawlBudget(): CrawlBudget {
    return {
      actionsStarted: 0,
      statesSeen: 0,
      startedAtMs: Date.now(),
    };
  }
  
  export function defaultCrawlLimits(partial?: Partial<CrawlLimits>): CrawlLimits {
    return {
      maxDepth: 3,
      maxActions: 50,
      maxStates: 30,
      maxRuntimeMs: 5 * 60_000,
      allowedDomains: [],
      blockedUrlPatterns: [],
      ...partial,
    };
  }
  
  export type LimitDecision =
    | { ok: true }
    | { ok: false; reason: string };
  
  export function canEnqueueAtDepth(
    depth: number,
    limits: CrawlLimits,
  ): LimitDecision {
    if (depth > limits.maxDepth) {
      return { ok: false, reason: `maxDepth ${limits.maxDepth} exceeded` };
    }
    return { ok: true };
  }
  
  export function canStartAction(
    budget: CrawlBudget,
    limits: CrawlLimits,
  ): LimitDecision {
    if (budget.actionsStarted >= limits.maxActions) {
      return { ok: false, reason: `maxActions ${limits.maxActions} reached` };
    }
    if (Date.now() - budget.startedAtMs >= limits.maxRuntimeMs) {
      return { ok: false, reason: `maxRuntimeMs ${limits.maxRuntimeMs} exceeded` };
    }
    return { ok: true };
  }
  
  export function canRecordState(
    budget: CrawlBudget,
    limits: CrawlLimits,
  ): LimitDecision {
    if (budget.statesSeen >= limits.maxStates) {
      return { ok: false, reason: `maxStates ${limits.maxStates} reached` };
    }
    return { ok: true };
  }
  
  export function isUrlAllowed(url: string, limits: CrawlLimits): LimitDecision {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { ok: false, reason: "invalid URL" };
    }
  
    if (limits.allowedDomains.length > 0) {
      const host = parsed.hostname.toLowerCase();
      const allowed = limits.allowedDomains.some(
        (d) => host === d.toLowerCase() || host.endsWith(`.${d.toLowerCase()}`),
      );
      if (!allowed) {
        return { ok: false, reason: `domain not allowed: ${host}` };
      }
    }
  
    for (const pattern of limits.blockedUrlPatterns ?? []) {
      if (pattern && url.includes(pattern)) {
        return { ok: false, reason: `URL blocked by pattern: ${pattern}` };
      }
    }
  
    return { ok: true };
  }
  
  export function recordActionStarted(budget: CrawlBudget): void {
    budget.actionsStarted += 1;
  }
  
  export function recordStateSeen(budget: CrawlBudget): void {
    budget.statesSeen += 1;
  }

  export function shouldStopCrawl(
    budget: CrawlBudget,
    limits: CrawlLimits,
    pendingCount: number,
  ): LimitDecision {
    const action = canStartAction(budget, limits);
    if (!action.ok && pendingCount === 0) return action;
    if (!action.ok) return action;
  
    if (Date.now() - budget.startedAtMs >= limits.maxRuntimeMs) {
      return { ok: false, reason: `maxRuntimeMs ${limits.maxRuntimeMs} exceeded` };
    }
    return { ok: true };
  }