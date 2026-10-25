#!/usr/bin/env node
// tests/civication-task-gate-inline.test.js
//
// Pinner at task-gate-saker faktisk kan spilles fra NextAction:
//   1. En task_gate rendrer "Gjør oppgave"-knappen (ingen svaralternativer ennå).
//   2. Klikk på knappen utvider oppgavearket INLINE i NextAction-modalen
//      (den gamle stien åpnet en modal som ikke fantes i noen HTML → død knapp).
//   3. Arket viser forventet leveranse og gate-mailens leveransevalg som
//      vanlige data-civi-next-action-answer-knapper.
//   4. Klikk på et leveransevalg går gjennom CivicationMailEngine.answerMail
//      (som fullfører tasken via engine.answer → completeByMail i ekte runtime).

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const repoRoot = path.resolve(__dirname, '..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
const win = dom.window;
const ctx = dom.getInternalVMContext();

const gateEvent = {
  id: 'by_radgiver_plan_main_delivery_2026-07-03',
  subject: 'Hovedleveranse: saken må gjøres om til et faktisk beslutningsgrunnlag',
  mail_type: 'task_gate',
  status: 'delivered',
  task_payload: { gate_id: 'main_delivery', expected_output: 'Beslutningsgrunnlag med anbefaling og risiko' },
  work_minutes: 90,
  task_domain: 'work_case',
  choices: [
    { id: 'A', label: 'Lever strukturert og ærlig' },
    { id: 'B', label: 'Lever raskt og minimalt' }
  ]
};

let action = {
  source: 'day_phase',
  id: gateEvent.id,
  subject: gateEvent.subject,
  body: 'Nå må du produsere noe som andre kan styre etter.',
  situation: [], summary: '',
  phase: 'afternoon', phaseLabel: 'Ettermiddag',
  mail_type: 'task_gate', slot: 'task_gate', status: 'delivered',
  choices: gateEvent.choices,
  isTaskGate: true, taskId: 'task-1'
};

const answerCalls = [];
let firstAnswerRejected = true;
let generatedMailReply = { ok: false, reason: 'not_found' };
win.CivicationNextActionSelector = { getCurrent: () => action };
win.CivicationMailEngine = {
  getInbox: () => [{ status: 'pending', event: gateEvent }],
  answerMail(mailId, choiceId) {
    answerCalls.push({ mailId, choiceId });
    if (mailId === 'generated-workday-decision') return Promise.resolve(generatedMailReply);
    if (firstAnswerRejected) {
      firstAnswerRejected = false;
      return Promise.resolve({ ok: false, reason: 'task_requires_contract' });
    }
    return Promise.resolve({ ok: true });
  }
};
win.CivicationTaskEngine = {
  getTaskByMailId: (mailId) => (mailId === gateEvent.id
    ? { id: 'task-1', status: 'open', durationMinutes: 90, task_payload: gateEvent.task_payload }
    : null)
};
win.CivicationState = { getActivePosition: () => ({ career_id: 'by', title: 'Arealplanlegger' }) };

const vm = require('vm');
vm.runInContext(
  fs.readFileSync(path.join(repoRoot, 'js/Civication/ui/CivicationNextActionUI.js'), 'utf8'),
  ctx,
  { filename: 'CivicationNextActionUI.js' }
);

(async () => {
  const ui = win.CivicationNextActionUI;
  assert(ui, 'CivicationNextActionUI global mangler');
  assert.strictEqual(ui.open(), true, 'NextAction åpner for task gate');

  const bodyEl = win.document.getElementById('civiNextActionModalBody');
  assert(bodyEl, 'modal-body finnes');

  // 1) CTA vises, ingen svaralternativer ennå.
  let html = bodyEl.innerHTML;
  assert(html.includes('data-civi-next-action-task'), 'task gate rendrer Gjør oppgave-knapp');
  assert(!html.includes('data-civi-next-action-answer'), 'ingen svarknapper før oppgavearket er åpnet');

  // 2) Klikk på Gjør oppgave → inline oppgaveark.
  const taskBtn = bodyEl.querySelector('[data-civi-next-action-task]');
  assert(taskBtn, 'Gjør oppgave-knappen finnes i DOM');
  taskBtn.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));

  html = bodyEl.innerHTML;
  assert(html.includes('civi-next-action-task-sheet'), 'oppgavearket rendres inline etter klikk');
  assert(html.includes('Beslutningsgrunnlag med anbefaling og risiko'), 'arket viser forventet leveranse');
  assert(html.includes('Lever strukturert og ærlig'), 'arket viser leveransevalg A');
  assert(html.includes('Lever raskt og minimalt'), 'arket viser leveransevalg B');
  assert(html.includes('data-civi-next-action-answer'), 'leveransevalgene er svarbare knapper');

  // 3) Klikk på et leveransevalg → answerMail kalles med gate-mailen og valget.
  const deliverBtn = bodyEl.querySelector('[data-civi-next-action-answer][data-choice-id="A"]');
  assert(deliverBtn, 'leveranseknapp A finnes');
  deliverBtn.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 50));

  assert.strictEqual(answerCalls.length, 1, 'ett svar registrert');
  assert.strictEqual(answerCalls[0].mailId, gateEvent.id, 'svaret gjelder gate-mailen');
  assert.strictEqual(answerCalls[0].choiceId, 'A', 'valgt leveranse sendes som choice');
  // The first attempt was rejected by the mail engine. A cache of identical
  // markup must not leave the task's only real answer buttons disabled forever.
  const retryBtn = bodyEl.querySelector('[data-civi-next-action-answer][data-choice-id="A"]');
  assert(retryBtn, 'same actionable task remains visible after rejection');
  assert.strictEqual(retryBtn.disabled, false, 'failed mail submission unlocks a genuine retry');
  retryBtn.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 50));
  assert.strictEqual(answerCalls.length, 2, 'second real submission reaches mail engine');
  assert.strictEqual(answerCalls[1].choiceId, 'A', 'retry keeps original choice');

  // A daily_generated fallback occupies the task_gate program slot, but has
  // no TaskEngine task or task payload. Its actual A/B decision must be
  // playable and recorded even if the inbox projection returns not_found.
  const generatedEvent = {
    id: 'generated-workday-decision', source_type: 'daily_generated',
    mail_type: 'phase', choices: [
      { id: 'A', label: 'Ta saken ryddig nå' },
      { id: 'B', label: 'La saken vente til hovedarbeidet er gjort' }
    ]
  };
  const generatedRow = { status: 'delivered', slot: 'task_gate', phase: 'workday', event: generatedEvent };
  win.CivicationDailyMailBuilder = {
    inspect: () => ({ runtime: { items: [generatedRow] } }),
    markHandled: async (id, choiceId) => {
      assert.strictEqual(id, generatedEvent.id);
      assert.ok(generatedEvent.choices.some(c => c.id === choiceId), 'must be an actual authored choice');
      generatedRow.status = 'answered';
      generatedRow.choice_id = choiceId;
      action = null;
      return { items: [generatedRow] };
    }
  };
  const generatedAction = {
    source: 'day_phase', id: generatedEvent.id, subject: 'Arbeidsdag: neste avklaring',
    phase: 'workday', mail_type: 'phase', slot: 'task_gate',
    status: 'delivered', taskId: '', isTaskGate: true, choices: generatedEvent.choices
  };
  action = generatedAction;
  ui.render();
  assert(!bodyEl.innerHTML.includes('data-civi-next-action-task'),
    'generated decision is not falsely presented as a real task gate');
  const generatedChoice = bodyEl.querySelector('[data-civi-next-action-answer][data-choice-id="B"]');
  assert(generatedChoice, 'real fallback decision shows its choices');
  generatedChoice.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.strictEqual(generatedRow.status, 'answered', 'generated decision is completed in the canonical runtime');
  assert.strictEqual(generatedRow.choice_id, 'B', 'the actual selected choice is preserved');
  assert.strictEqual(answerCalls.at(-1).mailId, generatedEvent.id,
    'the mail engine receives the choice before the fallback');
  // The legacy task-contract middleware may reject a generated phase choice
  // merely because it lives in the task_gate schedule slot. This row has no
  // actual task id, payload or TaskEngine task. It still needs a real choice.
  generatedMailReply = { ok: false, reason: 'task_requires_contract' };
  generatedRow.status = 'delivered';
  generatedRow.choice_id = null;
  action = generatedAction;
  ui.render();
  const contractMisclassification = bodyEl.querySelector('[data-civi-next-action-answer][data-choice-id="A"]');
  assert(contractMisclassification, 'generated phase decision remains playable');
  contractMisclassification.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.strictEqual(generatedRow.status, 'answered', 'non-task decision rejected as task is recorded');
  assert.strictEqual(generatedRow.choice_id, 'A', 'contract mismatch preserves the player choice');

  // A real browser run may report success without persisting the generated
  // choice in the day runtime. Reconcile that drift, not just not_found.
  generatedMailReply = { ok: true, dailyRuntimeAnswered: true };
  generatedRow.status = 'delivered';
  generatedRow.choice_id = null;
  action = generatedAction;
  ui.render();
  const successfulButUnpersisted = bodyEl.querySelector('[data-civi-next-action-answer][data-choice-id="A"]');
  assert(successfulButUnpersisted, 'generated choice stays playable on a stale success');
  successfulButUnpersisted.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.strictEqual(generatedRow.status, 'answered', 'successful reply must also persist its canonical row');
  assert.strictEqual(generatedRow.choice_id, 'A', 'successful reply preserves the exact player choice');

  // A rejected answer for a reason other than a missing inbox projection
  // must not be silently converted to a completed day decision.
  generatedMailReply = { ok: false, reason: 'validation_failed' };
  generatedRow.status = 'delivered';
  generatedRow.choice_id = null;
  action = generatedAction;
  ui.render();
  const invalidReply = bodyEl.querySelector('[data-civi-next-action-answer][data-choice-id="B"]');
  assert(invalidReply, 'failed generated decision remains answerable');
  invalidReply.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.strictEqual(generatedRow.status, 'delivered', 'real answer validation failure must remain blocked');

  console.log('civication-task-gate-inline.test.js passed');
  win.close();
})().catch((e) => { console.error(e); process.exit(1); });
