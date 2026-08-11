export type DetectedElementKind =
  | "button"
  | "link"
  | "input"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "tab"
  | "menuitem"
  | "other";

export type DetectedElement = {
  kind: DetectedElementKind;
  tag: string;
  role?: string;
  name?: string;
  domId?: string;
  testId?: string;
  inputType?: string;
  href?: string;
  disabled: boolean;
  visible: boolean;
};