#!/usr/bin/env node
// tests/civication-day-phase-ui-day-end.test.js
//
// DOM-light tests for the day-phase panel at day_end. The day-phase panel is now a pure
// status card: it never owns an active answer/advance surface. Answering and progression
// happen only on the NextAction surface (the inbox top action). At day_end the panel must
// still show where the player is (phase, open count) and route to NextAction via a single
// "Gå til neste handling" button — it must NOT render a phase-advance button or an inline
// day-end summary built from getDayEndSummary().

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
  // A computed day-end summary is still provided in globals, to prove the panel does NOT
  // pull it in: the panel is status-only and must not render an inline day-end summary.
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

  // 1. day_end with no open items: the panel is a status card. It shows where the player
  // is and routes to NextAction with a single button — no advance/new-day button, and no
  // inline day-end summary even though getDayEndSummary() is available.
  const html = renderAtDayEnd({}, summary);
  assert(html.includes('data-civi-day-phase-next-action'), 'panel renders the single NextAction routing button');
  assert(html.includes('Gå til neste handling'), 'routing button uses the NextAction label');
  assert(!html.includes('data-civi-day-phase-advance'), 'no phase-advance button on the status card');
  assert(!html.includes('Start ny dag'), 'panel never owns a start-new-day action');
  assert(!html.includes('civi-day-complete'), 'no inline day-end summary on the status card');
  assert(!html.includes('Sa nei til presset frist'), 'panel does not pull in getDayEndSummary content');
  assert(html.includes('Dagslutt / Natt'), 'panel still shows the current phase so the player sees where they are');

  // 2. day_end with open items still pending: still just a status card with the open count
  // and the single routing button; no advance button and no summary appear.
  const blockedHtml = renderAtDayEnd({ openItemsInPhase: 2, openItemSubjects: ['Uleste meldinger'] }, summary);
  assert(blockedHtml.includes('data-civi-day-phase-next-action'), 'routing button is present while items are open');
  assert(!blockedHtml.includes('data-civi-day-phase-advance'), 'no advance button while day_end has open items');
  assert(!blockedHtml.includes('civi-day-complete'), 'no day-complete summary while items are still open');
  assert(blockedHtml.includes('2 åpne saker'), 'panel reports the open-item count as status');

  console.log('PASS: Civication day-phase UI day_end status-card tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
