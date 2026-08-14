import assert from "node:assert/strict";
import test from "node:test";
import { REDACTED, redactBody, redactHeaders } from "./redact.js";

test("redactHeaders masks auth and cookies", () => {
  const out = redactHeaders({
    Authorization: "Bearer secret",
    Cookie: "session=abc",
    "Content-Type": "application/json",
  });
  assert.equal(out?.Authorization, REDACTED);
  assert.equal(out?.Cookie, REDACTED);
  assert.equal(out?.["Content-Type"], "application/json");
});

test("redactBody masks password/token keys", () => {
  const out = redactBody({
    username: "ada",
    password: "hunter2",
    nested: { api_key: "k", ok: 1 },
  });
  assert.equal(out?.username, "ada");
  assert.equal(out?.password, REDACTED);
  assert.deepEqual(out?.nested, { api_key: REDACTED, ok: 1 });
});