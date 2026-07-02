#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function loadScript(relPath) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath }); }

function makeEl(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    style: { display: '' },
    disabled: false,
    onclick: null,
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    contains() { return true; },
    matches() { return false; },
    closest() { return null; },
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }
  };
}

function setupProfileDom() {
  const ids = ['civiInboxBox', 'civiMailSubject', 'civiMailText', 'civiMailFeedback', 'civiChoiceA', 'civiChoiceB', 'civiChoiceC', 'civiChoiceOK'];
  const elements = new Map(ids.map(id => [id, makeEl(id)]));
  global.document = {
    readyState: 'complete',
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById(id) { return elements.get(id) || null; }
  };
  global.Element = function Element() {};
  return elements;
}

function setupGlobals() {
  global.window = global;
  global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.addEventListener = function () {};
  global.dispatchEvent = function () { return true; };
  global.setTimeout = function (fn) { fn(); return 0; };
  global.CivicationState = { getActivePosition() { return null; }, getState() { return {}; }, getInbox() { return []; } };
}

async function flush() { await Promise.resolve(); await Promise.resolve(); }

async function testProfileAsyncSuccess() {
  setupGlobals();
  const elements = setupProfileDom();
  let resolveAnswer;
  global.HG_CiviEngine = {
    getPendingEvent() {
      return { event: { id: 'profile-1', subject: 'Async sak', situation: 'Velg', choices: [{ id: 'A', label: 'Svar A' }] } };
    },
    answer() { return new Promise(resolve => { resolveAnswer = resolve; }); }
  };
  loadScript('js/Civication/ui/CivicationUI.js');
  global.CivicationUI.renderInbox();
  const btnA = elements.get('civiChoiceA');
  const fb = elements.get('civiMailFeedback');
  const ok = elements.get('civiChoiceOK');

  const clickPromise = btnA.onclick();
  assert.strictEqual(fb.style.display, 'none', 'profile feedback must wait for resolved async answer');
  assert.strictEqual(ok.style.display, 'none', 'profile OK button must wait for resolved async answer');
  resolveAnswer({ ok: true, feedback: 'Asynkront lagret' });
  await clickPromise;
  assert(fb.innerHTML.includes('Asynkront lagret'), 'profile feedback should render after async success');
  assert.strictEqual(fb.style.display, '', 'profile feedback should be visible after async success');
  assert.strictEqual(ok.style.display, '', 'profile OK should be visible after async success');
}

async function testProfileOkFalseAndReject() {
  setupGlobals();
  let mode = 'false';
  const elements = setupProfileDom();
  global.HG_CiviEngine = {
    getPendingEvent() { return { event: { id: 'profile-2', subject: 'Feil', situation: 'Velg', choices: [{ id: 'A', label: 'Svar A' }] } }; },
    answer() { return mode === 'false' ? Promise.resolve({ ok: false, reason: 'not_found' }) : Promise.reject(new Error('boom')); }
  };
  global.CivicationUI.renderInbox();
  await elements.get('civiChoiceA').onclick();
  assert(elements.get('civiMailFeedback').textContent.includes('Kunne ikke svare'), 'ok:false should show controlled profile error');
  assert.strictEqual(elements.get('civiChoiceA').disabled, false, 'ok:false should re-enable profile choices');
  mode = 'reject';
  elements.get('civiMailFeedback').textContent = '';
  await elements.get('civiChoiceA').onclick();
  assert(elements.get('civiMailFeedback').textContent.includes('Kunne ikke svare'), 'rejected answer should show controlled profile error');
}

function testNextActionAndInboxContractsStillRender() {
  setupGlobals();
  const elements = new Map();
  global.document = {
    readyState: 'complete',
    addEventListener() {},
    getElementById(id) { if (!elements.has(id)) elements.set(id, makeEl(id)); return elements.get(id); },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  global.CivicationMailEngine = { getInbox() { return [{ id: 'mail-1', status: 'open', event: { id: 'mail-1', subject: 'Aktiv', choices: [{ id: 'A', label: 'A' }] } }]; } };
  global.CivicationDayProgression = { inspect() { return { phase: 'morning', phaseLabel: 'Morgen', canAdvance: false, reason: 'waiting', phaseBundle: { items: [] } }; } };
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationNextActionSelector.js');
  loadScript('js/Civication/ui/CivicationInboxTopActionUI.js');
  loadScript('js/Civication/ui/CivicationNextActionUI.js');
  global.CivicationInboxTopActionUI.renderSections();
  assert(elements.get('civiInbox').innerHTML.includes('data-civi-inbox-answer'), 'active inbox-card answer surface should still render');
  assert(global.CivicationNextActionUI.getCurrent(), 'NextAction should still select the active inbox mail');
}

(async function run() {
  await testProfileAsyncSuccess();
  await testProfileOkFalseAndReject();
  testNextActionAndInboxContractsStillRender();
  console.log('civication-async-answer-surfaces.test.js passed');
})().catch(error => { console.error(error); process.exit(1); });
