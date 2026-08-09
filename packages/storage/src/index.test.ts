import assert from "node:assert/strict";
import test from "node:test";
import { getContractVersion } from "./index.js";

test("getContractVersion returns contract v0", () => {
  assert.equal(getContractVersion(), "0");
});