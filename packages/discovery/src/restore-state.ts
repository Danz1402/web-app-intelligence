import type { Page } from "playwright";
import type { BrowserSession } from "@wai/browser";
import { captureSnapshot } from "./capture-snapshot.js";
import { buildStateSignature } from "./state-signature.js";
import { compareStateSignatures } from "./compare-states.js";

export type RestoreTarget = {
  /** Absolute URL to return to */
  url: string;
  /** Optional signature hash from when the state was first seen */
  signatureHash?: string;
};

export type RestoreResult = {
  ok: boolean;
  method: "already_there" | "close_dialog" | "go_back" | "goto_url" | "failed";
  message?: string;
};

/**
 * Best-effort restore toward a known URL/state. Not perfect SPA restoration.
 */
export async function restoreState(
  session: BrowserSession,
  target: RestoreTarget,
): Promise<RestoreResult> {
  const page = session.getPage();

  // 1. Already on target URL?
  if (samePageUrl(page.url(), target.url)) {
    await dismissDialogsBestEffort(page);
    return { ok: true, method: "already_there" };
  }

  // 2. Try close dialogs then re-check
  await dismissDialogsBestEffort(page);
  if (samePageUrl(page.url(), target.url)) {
    return { ok: true, method: "close_dialog" };
  }

  // 3. Browser back once if that might help
  try {
    await session.goBack();
    await dismissDialogsBestEffort(page);
    if (samePageUrl(page.url(), target.url)) {
      return { ok: true, method: "go_back" };
    }
  } catch {
    // ignore — fall through to goto
  }

  // 4. Hard navigate to known URL
  try {
    await session.open(target.url);
    await dismissDialogsBestEffort(page);
    if (samePageUrl(page.url(), target.url)) {
      return { ok: true, method: "goto_url" };
    }
    return {
      ok: false,
      method: "failed",
      message: `After goto, URL was ${page.url()}`,
    };
  } catch (err) {
    return {
      ok: false,
      method: "failed",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Optional: check signature after restore (soft signal). */
export async function restoreMatchesSignature(
  page: Page,
  expectedSignatureHash?: string,
): Promise<boolean> {
  if (!expectedSignatureHash) return true;
  const snap = await captureSnapshot(page);
  const sig = buildStateSignature(snap);
  return sig.signatureHash === expectedSignatureHash;
}

function samePageUrl(current: string, target: string): boolean {
  try {
    const a = new URL(current);
    const b = new URL(target);
    return (
      a.origin === b.origin &&
      a.pathname === b.pathname &&
      a.search === b.search
    );
  } catch {
    return current === target;
  }
}

async function dismissDialogsBestEffort(page: Page): Promise<void> {
  // Escape often closes modals
  await page.keyboard.press("Escape").catch(() => undefined);
  // Common close buttons
  const close = page.getByRole("button", { name: /close|dismiss|cancel/i });
  if ((await close.count().catch(() => 0)) > 0) {
    await close.first().click({ timeout: 1000 }).catch(() => undefined);
  }
}