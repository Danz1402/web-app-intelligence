import type { Page } from "playwright";
import type { DetectedForm, DetectedField } from "./form-types.js";

export async function detectForms(page: Page): Promise<DetectedForm[]> {
  return page.evaluate(() => {
    const forms: DetectedForm[] = [];

    for (const formEl of Array.from(document.querySelectorAll("form"))) {
      const fields: DetectedField[] = [];

      for (const input of Array.from(
        formEl.querySelectorAll("input, select, textarea"),
      )) {
        const el = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const id = el.id;
        const labelEl =
          (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
          el.closest("label");
        fields.push({
          name: el.getAttribute("name") ?? undefined,
          label: labelEl?.textContent?.trim() || undefined,
          fieldType: el.getAttribute("type") ?? el.tagName.toLowerCase(),
          required: el.hasAttribute("required"),
          placeholder: el.getAttribute("placeholder") ?? undefined,
          tag: el.tagName.toLowerCase(),
        });
      }

      forms.push({
        name:
          formEl.getAttribute("name") ??
          formEl.getAttribute("aria-label") ??
          undefined,
        fields,
        isNativeForm: true,
      });
    }

    return forms;
  });
}