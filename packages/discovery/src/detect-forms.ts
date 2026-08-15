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
          const pattern = el.getAttribute("pattern") ?? undefined;
const minLength = el.getAttribute("minlength");
const maxLength = el.getAttribute("maxlength");
const min = el.getAttribute("min") ?? undefined;
const max = el.getAttribute("max") ?? undefined;

          const field: DetectedField = {
            name: el.getAttribute("name") ?? undefined,
            label: labelEl?.textContent?.trim() || undefined,
            fieldType: el.getAttribute("type") ?? el.tagName.toLowerCase(),
            required: el.hasAttribute("required"),
            placeholder: el.getAttribute("placeholder") ?? undefined,
            tag: el.tagName.toLowerCase(),
            pattern: pattern,
            minLength: minLength != null ? Number(minLength) : undefined,
            maxLength: maxLength != null ? Number(maxLength) : undefined,
            min: min,
            max: max,
          };

          if (el.tagName.toLowerCase() === "select") {
            const select = el as HTMLSelectElement;
            field.options = Array.from(select.options).map((opt) => ({
              value: opt.value,
              label: opt.textContent?.trim() ?? opt.value,
              disabled: opt.disabled || undefined,
            }));
          }

          if (el.getAttribute("type") === "radio" && el.getAttribute("name")) {
            const groupName = el.getAttribute("name")!;
            if (fields.some((f) => f.name === groupName && f.fieldType === "radio")) {
              continue; // already recorded this group
            }
            const radios = Array.from(
              formEl.querySelectorAll(`input[type="radio"][name="${CSS.escape(groupName)}"]`),
            ) as HTMLInputElement[];
            field.options = radios.map((r) => ({
              value: r.value,
              label:
                (r.id &&
                  document
                    .querySelector(`label[for="${CSS.escape(r.id)}"]`)
                    ?.textContent?.trim()) ||
                r.value,
            }));
            field.fieldType = "radio";
          }

          // after options block, still inside input loop:
          const controls = el.getAttribute("aria-controls");
          if (controls) {
            field.controlsFieldNames = controls
              .split(/\s+/)
              .map((cid) => {
                const target = document.getElementById(cid);
                if (!target) return undefined;
                if (target.matches("input,select,textarea")) {
                  return target.getAttribute("name") ?? cid;
                }
                const inner = target.querySelector("input,select,textarea");
                return inner?.getAttribute("name") ?? cid;
              })
              .filter((x): x is string => Boolean(x));
          }

        fields.push(field);
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