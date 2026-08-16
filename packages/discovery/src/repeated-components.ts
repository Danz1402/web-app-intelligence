import { createHash } from "node:crypto";
import type { DetectedElement } from "./element-types.js";
import { normalizePathname } from "./normalize-path.js";

export type RepeatedComponentGroup = {
  structuralFingerprint: string;
  kind: DetectedElement["kind"];
  tag: string;
  role?: string;
  /** Generalized label, e.g. "edit customer {id}" */
  namePattern?: string;
  count: number;
  representatives: DetectedElement[];
  members: DetectedElement[];
};

const INSTANCE_TOKEN = /\d+/g;

export function generalizeName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.replace(INSTANCE_TOKEN, "{id}").trim().toLowerCase();
}

export function generalizeHref(href?: string): string {
  if (!href) return "";
  try {
    const u = new URL(href);
    return `${u.origin}${normalizePathname(u.pathname)}`;
  } catch {
    const path = href.split("?")[0]?.split("#")[0] ?? href;
    return normalizePathname(path);
  }
}

/** Same structure, different instances → same fingerprint. */
export function buildStructuralFingerprint(el: DetectedElement): string {
  const parts = [
    el.tag ?? "",
    el.role ?? "",
    el.kind,
    generalizeName(el.name) ?? "",
    el.inputType ?? "",
    generalizeHref(el.href),
  ].map((p) => p.trim().toLowerCase());
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

export function groupRepeatedComponents(
  elements: DetectedElement[],
  opts: { minCount?: number; representativesPerGroup?: number } = {},
): RepeatedComponentGroup[] {
  const minCount = opts.minCount ?? 3;
  const keep = opts.representativesPerGroup ?? 1;
  const buckets = new Map<string, DetectedElement[]>();

  for (const el of elements) {
    const fp = buildStructuralFingerprint(el);
    const list = buckets.get(fp) ?? [];
    list.push(el);
    buckets.set(fp, list);
  }

  const groups: RepeatedComponentGroup[] = [];
  for (const [structuralFingerprint, members] of buckets) {
    if (members.length < minCount) continue;
    const sample = members[0]!;
    groups.push({
      structuralFingerprint,
      kind: sample.kind,
      tag: sample.tag,
      role: sample.role,
      namePattern: generalizeName(sample.name),
      count: members.length,
      representatives: members.slice(0, keep),
      members,
    });
  }
  return groups;
}

/** Elements to enqueue: unique ones + one (or K) per repeated group. */
export function pickExplorationRepresentatives(
  elements: DetectedElement[],
  opts: { minCount?: number; representativesPerGroup?: number } = {},
): DetectedElement[] {
  const minCount = opts.minCount ?? 3;
  const keep = opts.representativesPerGroup ?? 1;
  const groups = groupRepeatedComponents(elements, { minCount, representativesPerGroup: keep });
  const repeated = new Set(
    groups.flatMap((g) => g.members),
  );
  const unique = elements.filter((el) => !repeated.has(el));
  const reps = groups.flatMap((g) => g.representatives);
  return [...unique, ...reps];
}