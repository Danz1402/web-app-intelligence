const SENSITIVE_HEADER = /^(authorization|cookie|set-cookie|x-api-key|x-auth-token|proxy-authorization)$/i;

const SENSITIVE_KEY =
  /pass(word)?|token|secret|api[_-]?key|authorization|cookie|credit.?card|ssn|cvv/i;

export const REDACTED = "[REDACTED]";

const JWT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const BEARER = /^(Bearer\s+)\S+/i;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/;
const CARD = /\b(?:\d[ -]*?){13,19}\b/;

export function looksLikeSecret(value: string): boolean {
  const v = value.trim();
  if (JWT.test(v) && v.length > 20) return true;
  if (BEARER.test(v)) return true;
  if (SSN.test(v)) return true;
  if (CARD.test(v.replace(/\s/g, "")) && v.replace(/\D/g, "").length >= 13) {
    return true;
  }
  return false;
}

/** Redact secret-shaped substrings; leave ordinary UI text. */
export function redactString(value: string): string {
  let out = value.replace(BEARER, `$1${REDACTED}`);
  out = out.replace(SSN, REDACTED);
  if (looksLikeSecret(out) && JWT.test(out.trim())) return REDACTED;
  if (CARD.test(out) && out.replace(/\D/g, "").length >= 13) {
    out = out.replace(CARD, REDACTED);
  }
  return out;
}

export function redactTextSamples(samples: string[]): string[] {
  return samples.map(redactString);
}

/** Redact known-sensitive header names. Does not mutate input. */
export function redactHeaders(
  headers: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = SENSITIVE_HEADER.test(k) ? REDACTED : v;
  }
  return out;
}

/**
 * Shallow redact of JSON-ish objects / form maps.
 * Strings matching sensitive keys → [REDACTED]; nested plain objects walked one level.
 */
export function redactBody(
  body: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!body) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (SENSITIVE_KEY.test(k)) {
      out[k] = REDACTED;
    } else if (typeof v === "string") {
      out[k] = redactString(v); } 
    else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redactBody(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
    
  }
  return out;
}