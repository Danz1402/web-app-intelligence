import assert from "node:assert/strict";
import test from "node:test";
import { buildElementFingerprint } from "./element-fingerprint.js";

test("same logical element → same fingerprint", () => {
  const a = buildElementFingerprint({
    kind: "link",
    tag: "a",
    role: "link",
    name: "Typos",
    href: "https://the-internet.herokuapp.com/typos?x=1",
    disabled: false,
    visible: true,
  });
  const b = buildElementFingerprint({
    kind: "link",
    tag: "a",
    role: "link",
    name: "Typos",
    href: "https://the-internet.herokuapp.com/typos?x=2",
    disabled: false,
    visible: true,
  });
  assert.equal(a, b);
  assert.equal(a.length, 16);
});

test("different name → different fingerprint", () => {
  const a = buildElementFingerprint({
    kind: "button",
    tag: "button",
    name: "Save",
    disabled: false,
    visible: true,
  });
  const b = buildElementFingerprint({
    kind: "button",
    tag: "button",
    name: "Cancel",
    disabled: false,
    visible: true,
  });
  assert.notEqual(a, b);
});