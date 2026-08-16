import type { DetectedElement } from "./element-types.js";
import { generalizeHref, generalizeName } from "./repeated-components.js";

export type GeneralizedBehavior = {
  /** e.g. "click:edit customer {id}" */
  key: string;
  actionType: string;
  namePattern?: string;
  hrefPattern?: string;
  params: Record<string, string>;
};

const DIGITS = /\d+/g;

function extractIds(text?: string): string[] {
  if (!text) return [];
  return [...text.matchAll(DIGITS)].map((m) => m[0]!);
}

function idsFromHref(href?: string): string[] {
  if (!href) return [];
  try {
    return extractIds(new URL(href).pathname);
  } catch {
    return extractIds(href.split("?")[0]);
  }
}

export function generalizeBehavior(
  el: DetectedElement,
  actionType = "click",
): GeneralizedBehavior {
  const namePattern = generalizeName(el.name);
  const hrefPattern = generalizeHref(el.href) || undefined;
  const fromName = extractIds(el.name);
  const fromHref = idsFromHref(el.href);
  const ids = fromHref.length > 0 ? fromHref : fromName;

  const params: Record<string, string> = {};
  ids.forEach((id, i) => {
    params[i === 0 ? "id" : `id${i + 1}`] = id;
  });

  const key = [actionType, namePattern ?? el.kind, hrefPattern ?? ""]
    .filter((p) => p.length > 0)
    .join(":");

  return { key, actionType, namePattern, hrefPattern, params };
}

/** Collapse many instance elements into unique behaviors. */
export function uniqueBehaviors(
  elements: DetectedElement[],
  actionType = "click",
): GeneralizedBehavior[] {
  const seen = new Map<string, GeneralizedBehavior>();
  for (const el of elements) {
    const b = generalizeBehavior(el, actionType);
    if (!seen.has(b.key)) seen.set(b.key, b);
  }
  return [...seen.values()];
}