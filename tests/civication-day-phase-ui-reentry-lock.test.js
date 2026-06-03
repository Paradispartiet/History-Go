#!/usr/bin/env node
// tests/civication-day-phase-ui-reentry-lock.test.js
//
// DOM-light tests for the Civication day-phase fired-category reentry lock banner.
// These checks pin that the UI reads active career_reentry_locks directly from the
// eligibility runtime/state and explains the FIRED reentry rule to the player.
//
// A locked-category offer can be refused in CivicationJobs.pushOffer before it is ever
// stored, so the UI must read lock state itself rather than rely on a blocked offer
// existing. Cleared locks are never shown. The reentry-lock rules from PR 989 are not
// changed here; this is a UI/feedback-only surface.

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

// Renders the day-phase panel. `state` becomes the Civication state, `options.runtime`
// toggles whether the eligibility runtime is present, and `outcomeVm` lets us assert that
// the career outcome banner is untouched.
function renderWithLocks(state, options = {}) {
  const { runtime = true, outcomeVm = null } = options;
  const { documentRef } = installDom();

  global.window = global;
  global.document = documentRef;
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };

  global.CivicationState = {
    getState() { return state || {}; },
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
  global.CivicationJobLearningRuntime = { getJobLearningViewModel() { return null; } };
  global.CivicationPsyche = { getAutonomy() { return 55; } };
  global.CivicationInboxTopActionUI = { renderSections() {} };

  // Load the real eligibility runtime so getReentryLocks is exercised end-to-end. boot()
  // is a no-op here (no event engine / jobs to patch). When `runtime` is false we drop it
  // to assert the UI degrades gracefully without the runtime.
  delete global.CivicationJobEligibilityRuntime;
  loadScript('js/Civication/systems/civicationJobEligibilityRuntime.js');
  if (!runtime) delete global.CivicationJobEligibilityRuntime;

  delete global.CivicationDayPhaseUI;
  loadScript('js/Civication/ui/CivicationDayPhaseUI.js');
  assert.strictEqual(global.CivicationDayPhaseUI.render(), true, 'day phase UI renders');
  return documentRef.getElementById('civiDayPhasePanel').innerHTML;
}

function lockedNaeringsliv(overrides) {
  return {
    status: 'locked',
    reason: 'fired',
    fired_category: 'naeringsliv',
    fired_role_id: 'naer_fagarbeider',
    fired_role_title: null,
    clear_condition: 'worked_other_category',
    ...overrides
  };
}

function run() {
  // 1. No runtime / no state: renders without crashing and shows no lock banner.
  const noRuntimeHtml = renderWithLocks({}, { runtime: false });
  assert(!noRuntimeHtml.includes('civi-reentry-lock-banner'), 'no runtime => no lock banner');
  assert(!noRuntimeHtml.includes('undefined'), 'no runtime never renders undefined');

  const emptyStateHtml = renderWithLocks(undefined, { runtime: true });
  assert(!emptyStateHtml.includes('civi-reentry-lock-banner'), 'empty state => no lock banner');

  // 2. No locks: the slice is present but empty.
  const noLocksHtml = renderWithLocks({ career_reentry_locks: {} });
  assert(!noLocksHtml.includes('civi-reentry-lock-banner'), 'empty locks map => no lock banner');

  // 3. Cleared lock: never shown.
  const clearedHtml = renderWithLocks({
    career_reentry_locks: {
      naeringsliv: lockedNaeringsliv({ status: 'cleared', cleared_by_category: 'media' })
    }
  });
  assert(!clearedHtml.includes('civi-reentry-lock-banner'), 'cleared lock => no lock banner');
  assert(!clearedHtml.includes('Næringsliv'), 'cleared lock does not surface the category');

  // 4. Locked naeringsliv: shows the title, the category label, and explains the rule.
  const lockedHtml = renderWithLocks({
    career_reentry_locks: { naeringsliv: lockedNaeringsliv() }
  });
  assert(lockedHtml.includes('civi-reentry-lock-banner'), 'locked category renders the banner');
  assert(lockedHtml.includes('Midlertidig låst kategori'), 'banner shows the locked-category title');
  assert(lockedHtml.includes('Næringsliv'), 'banner shows the human category label');
  assert(lockedHtml.includes('en annen kategori'), 'banner explains the player must work in another category');
  assert(lockedHtml.includes('arbeidsrunde'), 'banner explains one work round reopens the category');
  assert(lockedHtml.includes('data-reentry-lock-category="naeringsliv"'), 'banner tags the category');
  assert(!lockedHtml.includes('undefined'), 'locked banner never renders undefined');

  // 5. Locked with fired_role_title: shows the role the player was fired from.
  const roleHtml = renderWithLocks({
    career_reentry_locks: {
      naeringsliv: lockedNaeringsliv({ fired_role_title: 'Fagarbeider' })
    }
  });
  assert(roleHtml.includes('Du fikk sparken som Fagarbeider'), 'banner names the fired role title');
  assert(roleHtml.includes('Næringsliv åpnes igjen'), 'role variant still explains how the category reopens');

  // 6. Multiple locks: all active locks shown, no undefined, cleared ones still hidden.
  const multiHtml = renderWithLocks({
    career_reentry_locks: {
      naeringsliv: lockedNaeringsliv(),
      media: lockedNaeringsliv({ fired_category: 'media', fired_role_id: 'med_journalist', fired_role_title: 'Journalist' }),
      vitenskap: lockedNaeringsliv({ fired_category: 'vitenskap', status: 'cleared' })
    }
  });
  assert(multiHtml.includes('Næringsliv'), 'multiple locks show naeringsliv');
  assert(multiHtml.includes('Media'), 'multiple locks show media');
  assert(multiHtml.includes('Du fikk sparken som Journalist'), 'multiple locks show the media fired role');
  assert(!multiHtml.includes('Vitenskap'), 'a cleared lock among many is still hidden');
  assert(!multiHtml.includes('undefined'), 'multiple locks never render undefined');

  // Unknown category keys are humanized gently rather than dropped or hardcoded.
  const unknownHtml = renderWithLocks({
    career_reentry_locks: {
      kultur_sektor: lockedNaeringsliv({ fired_category: 'kultur_sektor', fired_role_id: 'kul_x', fired_role_title: null })
    }
  });
  assert(unknownHtml.includes('Kultur sektor'), 'unknown category key is humanized');

  // 7. Career outcome banner is unaffected by the reentry-lock banner.
  const withOutcomeHtml = renderWithLocks(
    { career_reentry_locks: { naeringsliv: lockedNaeringsliv() } },
    { outcomeVm: { hasAnything: true, indicators: [{ kind: 'fired', label: 'Arbeidsforhold avsluttet', text: 'Du mistet jobben.' }] } }
  );
  assert(withOutcomeHtml.includes('class="civi-outcome-banner"'), 'career outcome banner still renders');
  assert(withOutcomeHtml.includes('data-outcome-kind="fired"'), 'career outcome indicator is unchanged');
  assert(withOutcomeHtml.includes('Arbeidsforhold avsluttet'), 'career outcome text remains visible');
  assert(withOutcomeHtml.includes('civi-reentry-lock-banner'), 'reentry-lock banner renders alongside the outcome banner');

  console.log('PASS: Civication day-phase UI reentry-lock banner tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
