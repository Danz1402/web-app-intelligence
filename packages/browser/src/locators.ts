import type { Page, Locator } from "playwright";

export type LocatorCandidate = {
  strategy: string;
  confidence: number;
  role?: string;
  name?: string;
  value?: string;
};

/** Resolve the first usable Playwright locator from ranked candidates. */
export function resolveLocator(
  page: Page,
  candidates: LocatorCandidate[],
): Locator {
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);

  for (const c of sorted) {
    switch (c.strategy) {
      case "role":
        if (c.role && c.name) {
          return page.getByRole(c.role as Parameters<Page["getByRole"]>[0], {
            name: c.name,
            exact: true,
          });
        }
        break;
      case "testId":
        if (c.value) return page.getByTestId(c.value);
        break;
      case "id":
        if (c.value) return page.locator(`#${cssIdent(c.value)}`);
        break;
      case "label":
        if (c.name) return page.getByLabel(c.name, { exact: true });
        break;
      case "css":
        if (c.value) return page.locator(c.value);
        break;
      default:
        break;
    }
  }

  throw new Error("No usable locator candidate");
}

function cssIdent(id: string): string {
    return id.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
  }