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

test("detectForms captures select options", async () => {
  const session = new BrowserSession({ headless: false });
  try {
    await session.start();
    await session.open("about:blank");
    await session.getPage().setContent(`
      <form name="demo">
        <label for="country">Country</label>
        <select id="country" name="country" required>
          <option value="">--</option>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </select>
        <input type="radio" id="a" name="plan" value="basic" />
        <label for="a">Basic</label>
        <input type="radio" id="b" name="plan" value="pro" />
        <label for="b">Pro</label>
      </form>
    `);
    const forms = await detectForms(session.getPage());
    assert.equal(forms.length, 1);
    const country = forms[0].fields.find((f) => f.name === "country");
    assert.ok(country?.options?.some((o) => o.value === "us"));
    const plan = forms[0].fields.find((f) => f.name === "plan");
    assert.equal(plan?.options?.length, 2);
  } finally {
    await session.close();
  }
});