export type ActionRisk =
  | "READ_ONLY"
  | "LOW_RISK"
  | "MUTATING"
  | "EXTERNAL_SIDE_EFFECT"
  | "DESTRUCTIVE"
  | "FINANCIAL"
  | "UNKNOWN";

export type SafetyDecision =
  | { allowed: true; risk: ActionRisk }
  | { allowed: false; risk: ActionRisk; reason: string };

const FINANCIAL =
  /pay|payment|checkout|purchase|buy now|billing|invoice|wire|transfer funds|donate/i;
const DESTRUCTIVE =
  /delete|remove|destroy|drop|terminate|deactivate account|close account|wipe|erase/i;
const EXTERNAL =
  /send email|send invite|share|publish|tweet|notify|broadcast/i;
const MUTATING =
  /save|create|submit|update|edit|add |insert|upload|confirm/i;

export function classifyActionRisk(input: {
  actionType?: string;
  name?: string;
  href?: string;
  behaviorKey?: string;
}): ActionRisk {
  const hay = [input.name, input.href, input.behaviorKey, input.actionType]
    .filter(Boolean)
    .join(" ");

  if (FINANCIAL.test(hay)) return "FINANCIAL";
  if (DESTRUCTIVE.test(hay)) return "DESTRUCTIVE";
  if (EXTERNAL.test(hay)) return "EXTERNAL_SIDE_EFFECT";
  if (MUTATING.test(hay)) return "MUTATING";
  if ((input.actionType ?? "click") === "click") return "LOW_RISK";
  return "UNKNOWN";
}

const BLOCKED_RISKS = new Set<ActionRisk>([
  "DESTRUCTIVE",
  "FINANCIAL",
  "EXTERNAL_SIDE_EFFECT",
]);

/** v0: never auto-run blocked risks. MUTATING is allowed (test data). */
export function allowAutoExplore(risk: ActionRisk): SafetyDecision {
  if (BLOCKED_RISKS.has(risk)) {
    return {
      allowed: false,
      risk,
      reason: `blocked risk ${risk}`,
    };
  }
  return { allowed: true, risk };
}

export function decideExploreAction(input: {
  actionType?: string;
  name?: string;
  href?: string;
  behaviorKey?: string;
}): SafetyDecision {
  return allowAutoExplore(classifyActionRisk(input));
}