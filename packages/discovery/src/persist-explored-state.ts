import type { BrowserSession } from "@wai/browser";
import type { Db } from "@wai/storage";
import {
  insertState,
} from "@wai/storage";
import type { ApplicationId, DiscoverySessionId, PageTemplate, State, ValidationRule } from "@wai/shared";
import { detectForms } from "./detect-forms.js";
import { validationRulesFromField } from "./detect-validation.js";
import { persistFormsBundle } from "./persist-forms.js";
import { toObservedForms } from "./to-forms.js";

import {
    routeTemplateFromUrl,
    toObservedPageTemplate,
    toObservedPageInstance,
    resolvePageTemplate,
  } from "./page-template.js";
import { insertPageInstance, insertPageTemplate } from "../../storage/dist/repos/gate1.js";

export async function persistExploredState(input: {
  db: Db;
  session: BrowserSession;
  state: State;
  discoverySessionId: DiscoverySessionId;
  knownTemplates: PageTemplate[];
  applicationId: ApplicationId;
}): Promise<void> {


    const pattern = routeTemplateFromUrl(input.state.url);
  if (pattern.includes("{id}")) {
    const resolved = resolvePageTemplate(
      input.knownTemplates,
      input.applicationId,
      input.state.url,
    );
    let template: PageTemplate;
    if (resolved.kind === "new") {
      template = toObservedPageTemplate({
        urlOrPath: input.state.url,
        applicationId: input.applicationId,
        discoverySessionId: input.discoverySessionId,
      });
      await insertPageTemplate(input.db, template);
      input.knownTemplates.push(template);
    } else {
      template = resolved.template;
    }
    const instance = toObservedPageInstance({
      url: input.state.url,
      applicationId: input.applicationId,
      discoverySessionId: input.discoverySessionId,
      pageTemplateId: template.id,
    });
    await insertPageInstance(input.db, instance);
    // attach before insertState so FK is set
    input.state.pageInstanceId = instance.id;
  }



  await insertState(input.db, input.state);


  const detectedForms = await detectForms(input.session.getPage());
  if (detectedForms.length === 0) return;

  const { forms, fields } = toObservedForms({
    detected: detectedForms,
    stateId: input.state.id,
    discoverySessionId: input.discoverySessionId,
  });

  const rules: ValidationRule[] = [];
  for (let fi = 0; fi < detectedForms.length; fi++) {
    const form = forms[fi]!;
    const df = detectedForms[fi]!;
    const formFields = fields.filter((f) => f.formId === form.id);
    for (let i = 0; i < formFields.length; i++) {
      rules.push(
        ...validationRulesFromField(
          { field: df.fields[i]!, fieldId: formFields[i]!.id, formId: form.id },
          input.discoverySessionId,
        ),
      );
    }
  }

  await persistFormsBundle({ db: input.db, forms, fields, rules });
}