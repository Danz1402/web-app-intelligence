import type { StateId } from "@wai/shared";
import type { StateSignature } from "./state-signature.js";
import { normalizePathname } from "./normalize-path.js";

export type KnownStateSignature = {
  id: StateId;
  signature: StateSignature;
};

/**
 * Exact match on signatureHash (current explore-loop behavior).
 */
export function findExactState(
  known: KnownStateSignature[],
  signature: StateSignature,
): KnownStateSignature | undefined {
  return known.find((k) => k.signature.signatureHash === signature.signatureHash);
}

/**
 * Near-identical: same normalized route + title + dialogs,
 * ignoring raw URL instance ids and (optionally) textFingerprint.
 */
export function findNearState(
  known: KnownStateSignature[],
  signature: StateSignature,
  opts: { ignoreTextFingerprint?: boolean } = { ignoreTextFingerprint: true },
): KnownStateSignature | undefined {
  const routeKey = normalizePathname(
    `https://dummy.local${signature.pathname}${signature.search}`,
  );
  // normalizeApiUrl expects full URL or path — adjust if your helper only takes pathnames:
  // prefer: normalize pathname segments only
  const normalizedPath = normalizePathname(signature.pathname);

  return known.find((k) => {
    if (normalizePathname(k.signature.pathname) !== normalizedPath) return false;
    if (k.signature.title !== signature.title) return false;
    if (k.signature.dialogFingerprint !== signature.dialogFingerprint) return false;
    if (k.signature.urlHash !== signature.urlHash) return false;
    if (!opts.ignoreTextFingerprint) {
      if (k.signature.textFingerprint !== signature.textFingerprint) return false;
    }
    return true;
  });
}


/**
 * Prefer exact, then near. Returns existing id when duplicate.
 */
export function resolveStateIdentity(
  known: KnownStateSignature[],
  signature: StateSignature,
): { kind: "new" } | { kind: "exact" | "near"; existing: KnownStateSignature } {
  const exact = findExactState(known, signature);
  if (exact) return { kind: "exact", existing: exact };
  const near = findNearState(known, signature);
  if (near) return { kind: "near", existing: near };
  return { kind: "new" };
}