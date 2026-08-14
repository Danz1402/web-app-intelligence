import assert from "node:assert/strict";
import test from "node:test";
import { normalizeApiUrl } from "./normalize-api-url.js";

test("normalizeApiUrl replaces numeric and uuid segments", () => {
  assert.equal(
    normalizeApiUrl("https://app.example/api/customers/123?x=1"),
    "/api/customers/{id}",
  );
  assert.equal(
    normalizeApiUrl(
      "https://app.example/api/customers/550e8400-e29b-41d4-a716-446655440000",
    ),
    "/api/customers/{id}",
  );
});