import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import dotenv from "dotenv";
import { BrowserSession } from "@wai/browser";
import {
  Ids,
  type Application,
  type DiscoverySession,
  type Environment,
  type State,
  EvidenceStatus,
  type ValidationRule,
} from "@wai/shared";
import {
  createPool,
  getDatabaseUrl,
  insertApplication,
  insertDiscoverySession,
  insertEnvironment,
  updateDiscoverySession,
  insertState,
} from "@wai/storage";
import { detectForms } from "./detect-forms.js";
import { toObservedForms } from "./to-forms.js";
import { persistFormsBundle } from "./persist-forms.js";
import { validationRulesFromField } from "./detect-validation.js";
import { planSafeFormFill } from "./safe-form-values.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../");
dotenv.config({ path: path.join(repoRoot, ".env") });

test("persistFormsBundle persists forms", async () => {
  const db = createPool(getDatabaseUrl());
  const appId = Ids.application();
  const discoverySessionId = Ids.discoverySession();
  const browserSession = new BrowserSession({ headless: true });
  const stateId = Ids.state();
  const envId = Ids.environment();
  const artifactId = Ids.artifact();

  try {

  const app: Application = {
    id: appId,
    name: `test-app-${appId}`,
    baseUrl: "https://the-internet.herokuapp.com",
    createdAt: new Date().toISOString(),
  };
  const env: Environment = {
    id: envId,
    applicationId: appId,
    name: "test",
    baseUrl: "https://the-internet.herokuapp.com/login",
  };
  const session: DiscoverySession = {
    id: discoverySessionId,
    applicationId: appId,
    environmentId: envId,
    status: "pending",
    startedAt: new Date().toISOString(),
    browser: "chromium",
    startUrl: "https://the-internet.herokuapp.com/login",
  };
  

  await insertApplication(db, app);
  await insertEnvironment(db, env);
  await insertDiscoverySession(db, session);

  session.status = "running";
  await updateDiscoverySession(db, session);

  const state: State = {
    id: stateId,
    discoverySessionId: discoverySessionId,
    url: "https://the-internet.herokuapp.com/login",
    pathname: "/login",
    title: "The Internet",
    snapshot: { title: "The Internet" },
    provenance: {
      discoverySessionId: discoverySessionId,
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      artifactIds: [artifactId],
    },
  };
  await insertState(db, state);


    await browserSession.start();
    await browserSession.open("https://the-internet.herokuapp.com/login");

    const page = browserSession.getPage();

    const detected = await detectForms(page);
    assert.ok(detected.length >= 1);
    assert.ok(detected[0].fields.length >= 2); // username + password

    const { forms, fields } = toObservedForms({
    detected,
    stateId,
    discoverySessionId,
    });

    const rules: ValidationRule[] = [];
for (let fi = 0; fi < detected.length; fi++) {
  const form = forms[fi]!;
  const df = detected[fi]!;
  const formFields = fields.filter((f) => f.formId === form.id);
  for (let i = 0; i < formFields.length; i++) {
    rules.push(
      ...validationRulesFromField(
        { field: df.fields[i]!, fieldId: formFields[i]!.id, formId: form.id },
        discoverySessionId,
      ),
    );
  }
}

    await persistFormsBundle({ db, forms, fields, rules });

    const f = await db.query(`SELECT COUNT(*)::int AS n FROM forms WHERE state_id = $1`, [stateId]);
    const fld = await db.query(`SELECT COUNT(*)::int AS n FROM fields WHERE form_id = ANY($1::text[])`, [forms.map(x => x.id)]);
    assert.ok(f.rows[0].n >= 1);
    assert.ok(fld.rows[0].n >= 2);
    // password should be blocked by safe-form plan (optional assert)
    const plan = planSafeFormFill(detected[0].fields);
    assert.ok(plan.some((p) => p.skipped && p.field.fieldType === "password"));

  
  } finally {
    await browserSession.close();
    await db.query(`DELETE FROM applications WHERE id = $1`, [appId]);
await db.end();
  }
});