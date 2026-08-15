import type { Db } from "@wai/storage";
import {
  insertField,
  insertForm,
  insertValidationRule,
} from "@wai/storage";
import type { Field, Form, ValidationRule } from "@wai/shared";

export async function persistFormsBundle(input: {
  db: Db;
  forms: Form[];
  fields: Field[];
  rules: ValidationRule[];
}): Promise<void> {
  for (const form of input.forms) await insertForm(input.db, form);
  for (const field of input.fields) await insertField(input.db, field);
  for (const rule of input.rules) await insertValidationRule(input.db, rule);
}