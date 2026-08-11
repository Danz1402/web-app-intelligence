import type { Page } from "playwright";
import type { DetectedElement, DetectedElementKind } from "./element-types.js";
import { filterMeaningfulElements } from "./filter-elements.js";


function classify(tag: string, role: string | undefined, inputType: string | undefined): DetectedElementKind {
  const t = tag.toLowerCase();
  const r = (role ?? "").toLowerCase();
  const type = (inputType ?? "").toLowerCase();

  if (r === "button" || t === "button") return "button";
  if (r === "link" || t === "a") return "link";
  if (r === "tab") return "tab";
  if (r === "menuitem") return "menuitem";
  if (t === "textarea" || r === "textbox" && t === "textarea") return "textarea";
  if (t === "select" || r === "listbox" || r === "combobox") return "select";
  if (type === "checkbox" || r === "checkbox") return "checkbox";
  if (type === "radio" || r === "radio") return "radio";
  if (t === "input") return "input";
  if (r === "textbox") return "input";
  return "other";
}

export async function detectElements(page: Page): Promise<DetectedElement[]> {
  return page.evaluate(() => {
    const selector = [
      "a[href]",
      "button",
      "input",
      "textarea",
      "select",
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="textbox"]',
      '[role="combobox"]',
      '[role="listbox"]',
    ].join(",");

    const nodes = Array.from(document.querySelectorAll(selector));

    return nodes.map((el) => {
      const html = el as HTMLElement;
      const tag = html.tagName.toLowerCase();
      const role = html.getAttribute("role") ?? undefined;
      const inputType =
        tag === "input" ? (html as HTMLInputElement).type : undefined;
      const name =
        html.getAttribute("aria-label") ||
        (html as HTMLInputElement).labels?.[0]?.textContent?.trim() ||
        html.textContent?.trim()?.slice(0, 120) ||
        undefined;
      const testId =
        html.getAttribute("data-testid") ||
        html.getAttribute("data-test") ||
        undefined;
      const href = tag === "a" ? (html as HTMLAnchorElement).href : undefined;
      const disabled =
        html.hasAttribute("disabled") ||
        html.getAttribute("aria-disabled") === "true";

      const style = window.getComputedStyle(html);
      const rect = html.getBoundingClientRect();
      const visible =
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        rect.width > 0 &&
        rect.height > 0;

      // classify inline in browser context (duplicate small logic)
      const r = (role ?? "").toLowerCase();
      const type = (inputType ?? "").toLowerCase();
      let kind:
        | "button"
        | "link"
        | "input"
        | "textarea"
        | "select"
        | "checkbox"
        | "radio"
        | "tab"
        | "menuitem"
        | "other" = "other";
      if (r === "button" || tag === "button") kind = "button";
      else if (r === "link" || tag === "a") kind = "link";
      else if (r === "tab") kind = "tab";
      else if (r === "menuitem") kind = "menuitem";
      else if (tag === "textarea") kind = "textarea";
      else if (tag === "select" || r === "listbox" || r === "combobox") kind = "select";
      else if (type === "checkbox" || r === "checkbox") kind = "checkbox";
      else if (type === "radio" || r === "radio") kind = "radio";
      else if (tag === "input" || r === "textbox") kind = "input";

      return {
        kind,
        tag,
        role,
        name: name || undefined,
        testId,
        inputType,
        href,
        disabled,
        visible,
        domId: html.id || undefined,
      };
    });
  });
}

export async function detectMeaningfulElements(page: Page): Promise<DetectedElement[]> {
    const raw = await detectElements(page);
    return filterMeaningfulElements(raw);
  }