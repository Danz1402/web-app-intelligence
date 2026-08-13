import { randomUUID } from "node:crypto";
import type { Element } from "@wai/shared";
import type { LocatorCandidate } from "./locator-candidates.js";
import type { ExplorationTask, ExplorationTaskStatus } from "./exploration-types.js";
import { scoreExplorationTask } from "./exploration-priority.js";
import { CrawlLimits, canEnqueueAtDepth, defaultCrawlLimits } from "./crawl-limits.js";


export type EnqueueFromElementsInput = {
    sourceStateId: ExplorationTask["sourceStateId"];
    elements: Element[];
    depth?: number;
    /** Default action type for buttons/links. Default: "click" */
    defaultActionType?: string;
    exploredFingerprints?: Set<string>;
    limits?: CrawlLimits;
  };

export class ExplorationQueue {
  private tasks = new Map<string, ExplorationTask>();

  enqueue(partial: Omit<ExplorationTask, "id" | "attempts" | "status"> & Partial<Pick<ExplorationTask, "id" | "attempts" | "status">>): ExplorationTask {
    const task: ExplorationTask = {
      id: partial.id ?? randomUUID(),
      sourceStateId: partial.sourceStateId,
      elementId: partial.elementId,
      actionType: partial.actionType,
      locatorCandidates: partial.locatorCandidates,
      priority: partial.priority ?? 0,
      depth: partial.depth ?? 0,
      risk: partial.risk ?? "unknown",
      attempts: partial.attempts ?? 0,
      status: partial.status ?? "PENDING",
      payload: partial.payload,
    };
    this.tasks.set(task.id, task);
    return { ...task };
  }

  /** Create click (or type/select) tasks from elements, with priority scores. */
enqueueFromElements(input: EnqueueFromElementsInput): ExplorationTask[] {
    const depth = input.depth ?? 0;
    const created: ExplorationTask[] = [];
  
    for (const el of input.elements) {
      const locators = (el.locatorCandidates ?? []) as LocatorCandidate[];
      if (locators.length === 0) continue;
  
      const actionType =
        inferActionType(el.tag, el.role) ??
        input.defaultActionType ??
        "click";
  
      const draft = {
        sourceStateId: input.sourceStateId,
        elementId: el.id,
        actionType,
        locatorCandidates: locators,
        depth,
        risk: "low" as const,
        payload: { fingerprint: el.fingerprint },
      };
  
      const priority = scoreExplorationTask(draft, {
        exploredFingerprints: input.exploredFingerprints,
      });

      const depthOk = canEnqueueAtDepth(depth, input.limits ?? defaultCrawlLimits());
if (!depthOk.ok) continue;
  
      created.push(
        this.enqueue({
          ...draft,
          priority,
        }),
      );
    }
  
    return created;
  }

  /** Next PENDING task (FIFO for 6.1; priority comes in 6.2). */
  dequeue(): ExplorationTask | undefined {
    const pending = [...this.tasks.values()].filter((t) => t.status === "PENDING");
    if (pending.length === 0) return undefined;
  
    pending.sort((a, b) => b.priority - a.priority);
    const next = pending[0]!;
    next.status = "RUNNING";
    next.attempts += 1;
    return { ...next };
  }

  updateStatus(id: string, status: ExplorationTaskStatus): ExplorationTask {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Unknown exploration task: ${id}`);
    task.status = status;
    return { ...task };
  }

  peekPending(): ExplorationTask[] {
    return [...this.tasks.values()]
      .filter((t) => t.status === "PENDING")
      .map((t) => ({ ...t }));
  }

  size(): number {
    return this.tasks.size;
  }

  get(id: string): ExplorationTask | undefined {
    const t = this.tasks.get(id);
    return t ? { ...t } : undefined;
  }
}

function inferActionType(tag?: string, role?: string): string | undefined {
  const t = (tag ?? "").toLowerCase();
  const r = (role ?? "").toLowerCase();
  if (t === "select" || r === "combobox" || r === "listbox") return "select";
  if (t === "textarea" || t === "input" || r === "textbox") return "type";
  if (t === "a" || t === "button" || r === "button" || r === "link") return "click";
  return undefined;
}