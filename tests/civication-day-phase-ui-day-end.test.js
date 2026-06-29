#!/usr/bin/env node
// tests/civication-day-phase-ui-day-end.test.js
//
// DOM-light tests for the day_end rollover. dayProgressionController.advancePhaseIfReady()
// already allows rolling into a new day at day_end with no open items (canResetAtDayEnd),
// even though inspect().canAdvance is false there (there is no "next phase" to advance
// into). The UI button must stay enabled for that exact case, and the computed
// getDayEndSummary() must actually be rendered instead of a bare "0 open actions" stub.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

class FakeElement {
  constructor(tagName, documentRef) {
    this.tagName = tagName;
    this.documentRef = documentRef;
    this.children = [];
    this.parentElement = null;
    this.className = '';
    this._id = '';
    this._innerHTML = '';
  }

  set id(value) { this._id = String(value || ''); }
  get id() { return this._id; }

  set innerHTML(value) { this._innerHTML = String(value || ''); }
  get innerHTML() { return this._innerHTML; }

  get firstElementChild() { return this.children[0] || null; }

  get previousElementSibling() {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this);
    return index > 0 ? this.parentElement.children[index - 1] : null;
  }

  get nextElementSibling() {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this);
    return index >= 0 && index < this.parentElement.children.length - 1
      ? this.parentElement.children[index + 1]
      : null;
  }

  insertBefore(child, anchor) {
    if (child.parentElement) {
      const oldIndex = child.parentElement.children.indexOf(child);
      if (oldIndex >= 0) child.parentElement.children.splice(oldIndex, 1);
    }
    child.parentElement = this;
    const anchorIndex = anchor ? this.children.indexOf(anchor) : -1;
    if (anchorIndex >= 0) this.children.splice(anchorIndex, 0, child);
    else this.children.push(child);
    return child;
  }

  querySelector() { return null; }
}

function findById(element, id) {
  if (!element) return null;
  if (element.id === id) return element;
  for (const child of element.children) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

function installDom() {
  const documentRef = {};
  const panels = new FakeElement('div', documentRef);
  panels.className = 'civi-panels';
  const controls = new FakeElement('div', documentRef);
  controls.id = 'civiLifeHomeControls';
  panels.insertBefore(controls, null);

  Object.assign(documentRef, {
    readyState: 'complete',
    addEventListener() {},
    createElement(tagName) { return new FakeElement(tagName, documentRef); },
    querySelector(selector) { return selector === '.civi-panels' ? panels : null; },
    getElementById(id) {
      if (id === 'civiLifeHomeControls') return controls;
      return findById(panels, id);
    }
  });

  return documentRef;
}

function renderAtDayEnd(inspectionOverrides, summary) {
  const documentRef = installDom();

  global.window = global;
  global.document = documentRef;
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };

  global.CivicationState = {
    getState() { return {}; },
    getActivePosition() { return { career_id: 'naeringsliv', role_id: 'testrolle' }; }
  };
  global.CivicationDayProgression = {
    inspect() {
      return {
        phase: 'day_end',
        phaseLabel: 'Dagslutt / Natt',
        nextPhase: null,
        canAdvance: false,
        reason: 'at_last_phase',
        dayIndex: 4,
        openItemsInPhase: 0,
        queuedItemsInPhase: 0,
        deliveredItemsInPhase: 0,
        openItemSubjects: [],
        ...inspectionOverrides
      };
    },
    getDayEndSummary() { return summary; }
  };
  global.CivicationCalendar = { getPhaseLabel(phase) { return phase; } };
  global.CivicationCareerOutcomeRuntime = { getOutcomeViewModel() { return null; } };
  global.CivicationJobLearningRuntime = { getJobLearningViewModel() { return null; } };
  global.CivicationPsyche = { getAutonomy() { return 55; } };
  global.CivicationInboxTopActionUI = { renderSections() {} };

  delete global.CivicationDayPhaseUI;
  loadScript('js/Civication/ui/CivicationDayPhaseUI.js');
  assert.strictEqual(global.CivicationDayPhaseUI.render(), true, 'day phase UI renders');
  return documentRef.getElementById('civiDayPhasePanel').innerHTML;
}

function run() {
  // 1. day_end with no open items: advance button must be present and ENABLED, even
  // though canAdvance is false (mirrors controller's canResetAtDayEnd path), and the
  // computed day-end summary (score, people met, tasks, carryover) must be rendered.
  const summary = {
    title: 'Dagen er over',
    dayIndex: 4,
    completedPhases: 6,
    totalPhases: 8,
    handledItems: 9,
    peopleMet: 3,
    tasksCompleted: 2,
    importantChoices: ['Sa nei til presset frist', 'Valgte presisjon over tempo'],
    score: 71,
    roleDevelopment: 'Rolleutvikling: Du har styrket jurid, planlegging.',
    carryover: 'Ingen åpne required saker følger med til i morgen.'
  };

  const html = renderAtDayEnd({}, summary);
  assert.match(html, /data-civi-day-phase-advance(?!\s+disabled)[^>]*>/, 'advance button is not disabled at day_end with no open items');
  assert(html.includes('Start ny dag'), 'button text invites starting a new day, not a dead-end label');
  assert(html.includes('Score'), 'rendered summary includes the computed score');
  assert(html.includes('71'), 'rendered summary includes the actual score value');
  assert(html.includes('Møtt'), 'rendered summary includes people met');
  assert(html.includes('Sa nei til presset frist'), 'rendered summary includes important choices');
  assert(html.includes('Rolleutvikling'), 'rendered summary includes role development text');
  assert(html.includes('Ingen åpne required saker'), 'rendered summary includes carryover text');

  // 2. day_end with open items still pending: no advance button at all (blocked, same as
  // any other phase with open items), and no day-complete summary yet.
  const blockedHtml = renderAtDayEnd({ openItemsInPhase: 2, openItemSubjects: ['Uleste meldinger'] }, summary);
  assert(!blockedHtml.includes('data-civi-day-phase-advance'), 'advance button is withheld while day_end has open items');
  assert(!blockedHtml.includes('civi-day-complete'), 'no day-complete summary while items are still open');

  console.log('PASS: Civication day-phase UI day_end rollover tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
