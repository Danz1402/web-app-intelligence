const SENSITIVE_HEADER = /^(authorization|cookie|set-cookie|x-api-key|x-auth-token|proxy-authorization)$/i;

const SENSITIVE_KEY =
  /pass(word)?|token|secret|api[_-]?key|authorization|cookie|credit.?card|ssn|cvv/i;

export const REDACTED = "[REDACTED]";

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
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redactBody(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}