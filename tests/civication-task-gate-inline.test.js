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

const action = {
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
win.CivicationNextActionSelector = { getCurrent: () => action };
win.CivicationMailEngine = {
  getInbox: () => [{ status: 'pending', event: gateEvent }],
  answerMail(mailId, choiceId) { answerCalls.push({ mailId, choiceId }); return Promise.resolve({ ok: true }); }
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

  console.log('civication-task-gate-inline.test.js passed');
  win.close();
})().catch((e) => { console.error(e); process.exit(1); });
