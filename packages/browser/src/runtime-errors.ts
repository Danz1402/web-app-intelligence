export type ObservedRuntimeErrorKind =
  | "console"
  | "pageerror"
  | "requestfailed";

export type ObservedRuntimeError = {
  kind: ObservedRuntimeErrorKind;
  message: string;
  stack?: string;
  url?: string;
  observedAt: string;
};