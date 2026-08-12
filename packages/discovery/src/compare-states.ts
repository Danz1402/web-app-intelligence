import type { StateSignature } from "./state-signature.js";

export type StateDiff = {
  changed: boolean;
  urlChanged: boolean;
  titleChanged: boolean;
  dialogsChanged: boolean;
  textChanged: boolean;
  /** True when signatureHash differs for any reason */
  signatureChanged: boolean;
};

export function compareStateSignatures(
  before: StateSignature,
  after: StateSignature,
): StateDiff {
  const urlChanged =
    before.url !== after.url ||
    before.pathname !== after.pathname ||
    before.search !== after.search ||
    before.urlHash !== after.urlHash;

  const titleChanged = before.title !== after.title;
  const dialogsChanged = before.dialogFingerprint !== after.dialogFingerprint;
  const textChanged = before.textFingerprint !== after.textFingerprint;
  const signatureChanged = before.signatureHash !== after.signatureHash;

  return {
    changed: signatureChanged,
    urlChanged,
    titleChanged,
    dialogsChanged,
    textChanged,
    signatureChanged,
  };
}