import type { DetectedElement } from "./element-types.js";

export type FilterElementsOptions = {
  /** Keep disabled elements for observation. Default: false */
  includeDisabled?: boolean;
  /** Keep invisible elements. Default: false */
  includeHidden?: boolean;
};

const IGNORED_INPUT_TYPES = new Set([
  "hidden",
  "submit", // often duplicated by a visible button; keep simple for v0 — include submit if you prefer
]);

/**
 * Keep meaningful interactive candidates for exploration.
 */
export function filterMeaningfulElements(
  elements: DetectedElement[],
  options: FilterElementsOptions = {},
): DetectedElement[] {
  const includeDisabled = options.includeDisabled ?? false;
  const includeHidden = options.includeHidden ?? false;

  return elements.filter((el) => {
    if (!includeHidden && !el.visible) return false;
    if (!includeDisabled && el.disabled) return false;

    // decorative / non-interactive roles sometimes slip in
    const role = (el.role ?? "").toLowerCase();
    if (role === "presentation" || role === "none") return false;

    // ignore purely hidden inputs
    if (el.kind === "input" && el.inputType === "hidden") return false;

    // drop nameless "other" — usually not meaningful yet
    if (el.kind === "other" && !el.name && !el.testId) return false;

    // empty links with no name/href usefulness
    if (el.kind === "link" && !el.name && !el.href) return false;

    return true;
  });
}