import { createHash } from "node:crypto";
import type { PageSnapshot } from "./snapshot-types.js";
export type StateSignature = {
    url: string;
    pathname: string;
    search: string;
    urlHash: string; // location.hash
    title: string;
    dialogFingerprint: string;
    textFingerprint: string;
    signatureHash: string;
  };
  
  export function buildStateSignature(snapshot: PageSnapshot): StateSignature {
    const dialogFingerprint = snapshot.dialogs
      .map((d) => `${d.role}:${d.name ?? ""}`)
      .sort()
      .join("|");
  
    const textFingerprint = createHash("sha256")
      .update(snapshot.visibleTextSample.join("\n"))
      .digest("hex")
      .slice(0, 16);
  
    const base = {
      url: snapshot.url,
      pathname: snapshot.pathname,
      search: snapshot.search,
      urlHash: snapshot.hash,
      title: snapshot.title,
      dialogFingerprint,
      textFingerprint,
    };
  
    const signatureHash = createHash("sha256")
      .update(
        [
          base.url,
          base.pathname,
          base.search,
          base.urlHash,
          base.title,
          base.dialogFingerprint,
          base.textFingerprint,
        ].join("||"),
      )
      .digest("hex")
      .slice(0, 16);
  
    return { ...base, signatureHash };
  }