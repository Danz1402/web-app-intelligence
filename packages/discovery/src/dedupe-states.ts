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
): KnownStateSignature | undefined {
  const normalizedPath = normalizePathname(signature.pathname);

  return known.find((k) => {
    const kNormalized = normalizePathname(k.signature.pathname);

    // Same exact pathname → not an instance-route duplicate (variants must be new states)
    if (k.signature.pathname === signature.pathname) return false;

    // Different pathnames that generalize to the same template, e.g. /items/1 vs /items/2
    if (kNormalized !== normalizedPath) return false;

    if (k.signature.title !== signature.title) return false;
    if (k.signature.dialogFingerprint !== signature.dialogFingerprint) return false;
    if (k.signature.urlHash !== signature.urlHash) return false;
    // Instance routes: ignore textFingerprint (different row content is OK to collapse for now)
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