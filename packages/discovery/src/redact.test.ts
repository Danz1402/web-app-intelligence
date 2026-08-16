import assert from "node:assert/strict";
import test from "node:test";
import { REDACTED, redactBody, redactHeaders, looksLikeSecret, redactString, redactTextSamples } from "./redact.js";

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

test("redactString masks jwt, ssn, bearer", () => {
  assert.equal(
    redactString("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaa.bbb"),
    REDACTED,
  );
  assert.equal(redactString("SSN 123-45-6789"), `SSN ${REDACTED}`);
  assert.equal(redactString("Bearer supersecret"), `Bearer ${REDACTED}`);
  assert.equal(redactString("More information"), "More information");
});
test("redactBody also masks secret-shaped values", () => {
  const out = redactBody({
    note: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaa.bbb",
  });
  assert.equal(out?.note, REDACTED);
});
test("redactTextSamples leaves normal copy", () => {
  assert.deepEqual(redactTextSamples(["Hello world"]), ["Hello world"]);
});