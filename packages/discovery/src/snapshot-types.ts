export type SnapshotViewport = {
    width: number;
    height: number;
  };
  
  export type SnapshotDialog = {
    role: string;
    name?: string;
  };
  
  /** Structured page/state capture — not raw HTML. */
  export type PageSnapshot = {
    url: string;
    pathname: string;
    search: string;
    hash: string;
    title: string;
    viewport: SnapshotViewport;
    /** Short visible text samples for grounding (not full page text). */
    visibleTextSample: string[];
    /** Landmark / dialog-ish roles seen (lightweight). */
    dialogs: SnapshotDialog[];
    capturedAt: string; // ISO-8601
  };