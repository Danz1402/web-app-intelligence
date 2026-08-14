import assert from "node:assert/strict";
import test from "node:test";

import { BrowserSession } from "@wai/browser";
import { detectForms } from "./detect-forms.js";

test("detectForms detects forms", async () => {
  const session = new BrowserSession({ headless: true });
  
try {
  await session.start();

    await session.open("https://the-internet.herokuapp.com/login");
const forms = await detectForms(session.getPage());
assert.ok(forms.length >= 1);
assert.ok(forms[0].fields.some((f) => f.fieldType === "text" || f.fieldType === "password"));

} finally {
  await session.close();
}
});