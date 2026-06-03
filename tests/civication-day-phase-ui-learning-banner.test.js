#!/usr/bin/env node
// tests/civication-day-phase-ui-learning-banner.test.js
//
// DOM-light tests for the Civication day-phase learning banner. These checks pin
// that unlocked job learning is rendered inside the existing learning banner, not
// in the career outcome banner and not via new progression state.

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

  querySelector(selector) {
    if (selector === '[data-civi-day-phase-advance]' && this.innerHTML.includes('data-civi-day-phase-advance')) {
      return { disabled: false, onclick: null };
    }
    return null;
  }
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

  return { documentRef, panels };
}

function renderWithLearning(learningVm, outcomeVm = null) {
  let state = {};
  const { documentRef } = installDom();

  global.window = global;
  global.document = documentRef;
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };

  global.CivicationState = {
    getState() { return state; },
    getActivePosition() { return { career_id: 'naeringsliv', role_id: 'testrolle' }; }
  };
  global.CivicationDayProgression = {
    inspect() {
      return {
        phase: 'morning',
        phaseLabel: 'Morgen',
        nextPhase: 'work',
        canAdvance: true,
        reason: 'ready',
        dayIndex: 4,
        openItemsInPhase: 0,
        openItemSubjects: []
      };
    }
  };
  global.CivicationCalendar = { getPhaseLabel(phase) { return phase === 'work' ? 'Arbeid' : phase; } };
  global.CivicationCareerOutcomeRuntime = { getOutcomeViewModel() { return outcomeVm; } };
  global.CivicationJobLearningRuntime = { getJobLearningViewModel() { return learningVm; } };
  global.CivicationPsyche = { getAutonomy() { return 55; } };
  global.CivicationInboxTopActionUI = { renderSections() {} };

  delete global.CivicationDayPhaseUI;
  loadScript('js/Civication/ui/CivicationDayPhaseUI.js');
  assert.strictEqual(global.CivicationDayPhaseUI.render(), true, 'day phase UI renders');
  return documentRef.getElementById('civiDayPhasePanel').innerHTML;
}

function masteredLearningVm(overrides) {
  return {
    hasLearningState: true,
    learningStatus: 'mastered',
    learningLabel: 'Utlært i rollen',
    learningDetail: 'Du har lært det denne rollen kan lære deg.',
    unlockedSkills: [],
    unlockedTeaches: [],
    ...overrides
  };
}

function run() {
  const skillsHtml = renderWithLearning(masteredLearningVm({
    unlockedSkills: ['arbeidsrytme', 'praktisk drift', 'rutineforståelse']
  }));
  assert(skillsHtml.includes('Du tok med deg: arbeidsrytme, praktisk drift, rutineforståelse'), 'skills are shown as what the player took with them');

  const cappedHtml = renderWithLearning(masteredLearningVm({
    unlockedSkills: ['arbeidsrytme', 'praktisk drift', 'rutineforståelse', 'kundedialog', 'prioritering', 'teamarbeid']
  }));
  assert(cappedHtml.includes('Du tok med deg: arbeidsrytme, praktisk drift, rutineforståelse +3 til'), 'skills list is capped at three with remaining count');
  assert(!cappedHtml.includes('kundedialog'), 'fourth skill is not rendered directly in the short banner');

  const teachesHtml = renderWithLearning(masteredLearningVm({
    unlockedSkills: [],
    unlockedTeaches: ['møte folk', 'lese rutiner']
  }));
  assert(teachesHtml.includes('Du lærte: møte folk, lese rutiner'), 'teaches are shown when skills are empty');

  const emptyHtml = renderWithLearning(masteredLearningVm({
    unlockedSkills: [],
    unlockedTeaches: []
  }));
  assert(!emptyHtml.includes('Du tok med deg:'), 'empty skills do not render a take-away line');
  assert(!emptyHtml.includes('Du lærte:'), 'empty teaches do not render a learned line');
  assert(!emptyHtml.includes('undefined'), 'empty unlocked lists never render undefined');

  const outcomeHtml = renderWithLearning(
    masteredLearningVm({ unlockedSkills: ['arbeidsrytme'] }),
    {
      hasAnything: true,
      indicators: [{ kind: 'promoted', label: 'Forfremmelse klar', text: 'Du kan ta mer ansvar.' }]
    }
  );
  assert(outcomeHtml.includes('class="civi-outcome-banner"'), 'career outcome banner still renders');
  assert(outcomeHtml.includes('data-outcome-kind="promoted"'), 'career outcome indicator is unchanged');
  assert(outcomeHtml.includes('Forfremmelse klar'), 'career outcome text remains visible');
  assert(outcomeHtml.includes('class="civi-learning-detail civi-learning-unlocked"'), 'unlocked learning renders in the learning detail line');

  console.log('PASS: Civication day-phase UI learning banner tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
