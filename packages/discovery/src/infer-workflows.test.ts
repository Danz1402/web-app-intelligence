import assert from "node:assert/strict";
import test from "node:test";
import {
  EvidenceStatus,
  Ids,
  type Action,
  type Transition,
} from "@wai/shared";
import { inferWorkflows } from "./infer-workflows.js";
import { selectUsefulWorkflows } from "./useful-workflows.js";
import { toObservedCandidateWorkflow } from "./to-workflow.js";

function prov(sessionId = Ids.discoverySession()) {
  const now = new Date().toISOString();
  return {
    discoverySessionId: sessionId,
    evidenceStatus: EvidenceStatus.OBSERVED,
    firstSeenAt: now,
    lastSeenAt: now,
  };
}

function action(type: string, name: string): Action {
  return {
    id: Ids.action(),
    stateId: Ids.state(),
    type,
    payload: { name },
    provenance: prov(),
  };
}

function transition(
  fromStateId: Action["stateId"],
  actionId: Action["id"],
  toStateId: Action["stateId"],
): Transition {
  return {
    id: Ids.transition(),
    fromStateId,
    actionId,
    toStateId,
    provenance: prov(),
  };
}

test("inferWorkflows finds Create → Submit chain", () => {
  const list = Ids.state();
  const form = Ids.state();
  const detail = Ids.state();
  const create = action("click", "Create");
  const submit = action("click", "Submit");
  create.stateId = list;
  submit.stateId = form;

  const workflows = inferWorkflows({
    transitions: [
      transition(list, create.id, form),
      transition(form, submit.id, detail),
    ],
    actions: [create, submit],
  });

  assert.ok(workflows.length >= 1);
  const hit = workflows.find((w) => w.actionIds.length === 2);
  assert.ok(hit);
  assert.deepEqual(hit?.actionIds, [create.id, submit.id]);
  assert.equal(hit?.fromStateId, list);
  assert.equal(hit?.toStateId, detail);
  assert.match(hit?.name ?? "", /SUBMIT|CREATE/);
});

test("ignores transitions with no toStateId", () => {
  const a = action("click", "Noop");
  const workflows = inferWorkflows({
    transitions: [
      {
        id: Ids.transition(),
        fromStateId: Ids.state(),
        actionId: a.id,
        provenance: prov(),
      },
    ],
    actions: [a],
  });
  assert.equal(workflows.length, 0);
});

test("Gate 9: keeps Create→Submit, drops raw click chains", () => {
  const list = Ids.state();
  const form = Ids.state();
  const detail = Ids.state();
  const other = Ids.state();
  const create = action("click", "Create");
  const submit = action("click", "Submit");
  const random = action("click", "More information");
  create.stateId = list;
  submit.stateId = form;
  random.stateId = list;
  const inferred = inferWorkflows({
    transitions: [
      transition(list, create.id, form),
      transition(form, submit.id, detail),
      transition(list, random.id, other),
    ],
    actions: [create, submit, random],
    minActions: 1,
  });
  const useful = selectUsefulWorkflows(inferred);
  assert.ok(useful.some((w) => w.actionIds.length === 2));
  assert.ok(
    useful.every((w) => w.actionIds.includes(create.id) || w.name !== "MORE_INFORMATION"),
  );
  assert.ok(!useful.some((w) => w.actionIds.length === 1));
  
  const hit = useful.find((w) => w.actionIds.includes(submit.id));
  assert.ok(hit);
  assert.match(hit!.name, /SUBMIT|CREATE/);
  const contract = toObservedCandidateWorkflow({
    inferred: hit!,
    applicationId: Ids.application(),
    discoverySessionId: Ids.discoverySession(),
  });
  assert.equal(contract.actionIds.length, 2);
  assert.equal(contract.name, hit!.name);
});