import type { DetectedElement } from "./element-types.js";

export type LocatorCandidate = {
  strategy: string;
  confidence: number;
  role?: string;
  name?: string;
  value?: string;
  attribute?: string;
};

/**
 * Ranked locator candidates (master context §14).
 * Higher confidence first.
 */
export function buildLocatorCandidates(
  el: DetectedElement,
): LocatorCandidate[] {
  const candidates: LocatorCandidate[] = [];

  const role = el.role ?? kindToRole(el.kind);
  if (role && el.name) {
    candidates.push({
      strategy: "role",
      role,
      name: el.name,
      confidence: 0.99,
    });
  }

  if (el.testId) {
    candidates.push({
      strategy: "testId",
      value: el.testId,
      confidence: 0.98,
    });
  }

  if (el.domId) {
    candidates.push({
      strategy: "id",
      value: el.domId,
      confidence: 0.95,
    });
  }

  // label-ish: we already folded label text into `name` during detection
  if (!el.role && el.name && (el.kind === "input" || el.kind === "textarea" || el.kind === "select")) {
    candidates.push({
      strategy: "label",
      name: el.name,
      confidence: 0.9,
    });
  }

  if (el.kind === "link" && el.href) {
    candidates.push({
      strategy: "css",
      value: `a[href="${cssEscape(el.href)}"]`,
      confidence: 0.7,
    });
  }

  if (el.tag) {
    candidates.push({
      strategy: "css",
      value: el.tag,
      confidence: 0.4,
    });
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

function kindToRole(kind: DetectedElement["kind"]): string | undefined {
  switch (kind) {
    case "button":
      return "button";
    case "link":
      return "link";
    case "checkbox":
      return "checkbox";
    case "radio":
      return "radio";
    case "tab":
      return "tab";
    case "menuitem":
      return "menuitem";
    case "input":
    case "textarea":
      return "textbox";
    case "select":
      return "combobox";
    default:
      return undefined;
  }
}

function cssEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}