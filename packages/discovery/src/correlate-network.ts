import type { ObservedNetworkRequest } from "@wai/browser";
import type { BrowserSession } from "@wai/browser";
import type { ActionId, StateId } from "@wai/shared";

export type CorrelatedNetworkRequest = ObservedNetworkRequest & {
  stateId: StateId;
  actionId?: ActionId;
};

export type CorrelateNetworkDuringActionInput = {
  session: BrowserSession;
  stateId: StateId;
  actionId?: ActionId;
  action: () => Promise<void>;
  /** Keep xhr/fetch/document by default; drop images/css/fonts. Default true */
  filterAssets?: boolean;
};

const ASSET_TYPES = new Set([
  "image",
  "stylesheet",
  "font",
  "media",
  "manifest",
  "other",
]);

export function isLikelyApiOrNavigation(req: ObservedNetworkRequest): boolean {
  const t = (req.resourceType ?? "").toLowerCase();
  if (ASSET_TYPES.has(t)) return false;
  return (
    t === "xhr" ||
    t === "fetch" ||
    t === "document" ||
    t === "script" || // keep scripts for now; you can drop later
    t === ""
  );
}

export function correlateNetworkRequests(
  requests: ObservedNetworkRequest[],
  stateId: StateId,
  actionId?: ActionId,
  filterAssets = true,
): CorrelatedNetworkRequest[] {
  const filtered = filterAssets
    ? requests.filter(isLikelyApiOrNavigation)
    : requests;

  return filtered.map((r) => ({
    ...r,
    stateId,
    actionId,
  }));
}

/**
 * Capture network only while `action` runs, then tag with state/action ids.
 */
export async function correlateNetworkDuringAction(
  input: CorrelateNetworkDuringActionInput,
): Promise<CorrelatedNetworkRequest[]> {
    input.session.startNetworkCapture();
    try {
      await input.action();
    } catch (err) {
      input.session.stopNetworkCapture();
      throw err;
    }
    const raw = input.session.stopNetworkCapture();
    return correlateNetworkRequests(
      raw,
      input.stateId,
      input.actionId,
      input.filterAssets ?? true,
    );
}