import { createHash } from "node:crypto";
import type { DetectedElement } from "./element-types.js";

/**
 * Stable-ish logical identity for an element within a page/app.
 * Not a record ID. Do not use absolute position.
 */
export function buildElementFingerprint(el: DetectedElement): string {
  const parts = [
    el.tag ?? "",
    el.role ?? "",
    el.kind,
    el.name ?? "",
    el.testId ?? "",
    el.domId ?? "",
    el.inputType ?? "",
    normalizeHref(el.href),
  ].map((p) => p.trim().toLowerCase());

  const material = parts.join("|");
  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

function normalizeHref(href?: string): string {
  if (!href) return "";
  try {
    const u = new URL(href);
    // drop volatile query/hash for identity; keep path
    return `${u.origin}${u.pathname}`;
  } catch {
    return href.split("?")[0]?.split("#")[0] ?? href;
  }
}