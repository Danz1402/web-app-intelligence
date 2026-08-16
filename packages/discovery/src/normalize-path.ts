const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** /customers/101 → /customers/{id} */
export function normalizePathname(pathname: string): string {
  const parts = pathname.split("/").map((segment) => {
    if (!segment) return segment;
    if (/^\d+$/.test(segment)) return "{id}";
    if (UUID.test(segment)) return "{id}";
    return segment;
  });
  return parts.join("/") || "/";
}