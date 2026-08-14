/**
 * Normalize path for ApiEndpoint identity.
 * /api/customers/123 → /api/customers/{id}
 * UUID segments → {id}
 * Query string dropped for endpoint identity.
 */
export function normalizeApiUrl(rawUrl: string): string {
    let pathname: string;
    try {
      const u = new URL(rawUrl);
      pathname = u.pathname;
    } catch {
      pathname = rawUrl.split("?")[0] ?? rawUrl;
    }
  
    const parts = pathname.split("/").map((segment) => {
      if (!segment) return segment;
      if (/^\d+$/.test(segment)) return "{id}";
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          segment,
        )
      ) {
        return "{id}";
      }
      return segment;
    });
  
    return parts.join("/") || "/";
  }