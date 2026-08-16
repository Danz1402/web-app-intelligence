import type { Page } from "playwright";
import type { PageSnapshot } from "./snapshot-types.js";
import { redactTextSamples } from "./redact.js";

export async function captureSnapshot(page: Page): Promise<PageSnapshot> {
  const url = page.url();
  const parsed = new URL(url);
  const title = await page.title();
  const viewport = page.viewportSize() ?? { width: 0, height: 0 };
  const capturedAt = new Date().toISOString();

  const pageData = await page.evaluate(() => {
    const sample: string[] = [];
    const walker = document.createTreeWalker(
      document.body ?? document.documentElement,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode() && sample.length < 20) {
      const text = walker.currentNode.textContent?.trim() ?? "";
      if (text.length >= 2 && text.length <= 120) {
        sample.push(text);
      }
    }

    const dialogs = Array.from(
      document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog'),
    ).map((el) => ({
      role: el.getAttribute("role") ?? el.tagName.toLowerCase(),
      name:
        el.getAttribute("aria-label") ??
        el.getAttribute("aria-labelledby") ??
        undefined,
    }));

    return { visibleTextSample: sample, dialogs };
  });

  return {
    url,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    title,
    viewport: { width: viewport.width, height: viewport.height },
    visibleTextSample: redactTextSamples(pageData.visibleTextSample),
    dialogs: pageData.dialogs,
    capturedAt,
  };
}