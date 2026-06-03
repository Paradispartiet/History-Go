#!/usr/bin/env node
// tests/civication-job-offer-eligibility-ui.test.js
//
// UI/feedback tests for showing dual-gate eligibility on Civication job offers.
//
// PR 989 puts offer.eligibility on job offers via CivicationJobs.pushOffer, and PR 991
// made knowledge_gate real against existing History Go quiz progress. This surface only
// DISPLAYS that data: getOfferEligibilityViewModel(offer) + buildOfferEligibilityHtml(offer).
// It adds no rules, no job matching, and no outcome logic.
//
// These checks pin that:
//   - old offers without eligibility render nothing (and never "undefined"),
//   - knowledge gate passed/missing/unknown show a short line,
//   - soft missing knowledge is an explanation, never a hard blocker,
//   - learning gate ready_for_next_step/strong/building show a short line,
//   - blockers render safely,
//   - not_configured / not_required produce no noise,
//   - the accept/decline wiring and reentry-lock banner are left untouched.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

// CivicationUI.js is loaded as a classic global script. Provide the minimal window/document
// shims it touches at load time, then read the helpers off the window.CivicationUI export.
global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.window.setTimeout = (fn) => { if (typeof fn === 'function') fn(); };
global.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };

const uiSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/ui/CivicationUI.js'), 'utf8');
vm.runInThisContext(uiSource, { filename: 'js/Civication/ui/CivicationUI.js' });

const getViewModel = global.CivicationUI.getOfferEligibilityViewModel;
const buildHtml = global.CivicationUI.buildOfferEligibilityHtml;

assert.strictEqual(typeof getViewModel, 'function', 'getOfferEligibilityViewModel is exported');
assert.strictEqual(typeof buildHtml, 'function', 'buildOfferEligibilityHtml is exported');

function findItem(vm, kind) {
  return vm.items.find((i) => i.kind === kind) || null;
}

function run() {
  // 0. Defensive inputs never crash.
  for (const bad of [undefined, null, 0, '', 'x', 42, [], {}, { eligibility: null }, { eligibility: 'x' }, { eligibility: {} }]) {
    const vmodel = getViewModel(bad);
    assert.strictEqual(vmodel.hasEligibility, false, 'defensive input => no eligibility: ' + JSON.stringify(bad));
    assert.deepStrictEqual(vmodel.items, [], 'defensive input => empty items');
    assert.deepStrictEqual(vmodel.blockers, [], 'defensive input => empty blockers');
    assert.strictEqual(buildHtml(bad), '', 'defensive input => empty html');
  }

  // 1. Old offer without eligibility: renders nothing, no "undefined".
  const oldOffer = { offer_key: 'naeringsliv:2', career_name: 'Næringsliv', title: 'Mellomleder', threshold: 2 };
  const oldVm = getViewModel(oldOffer);
  assert.strictEqual(oldVm.hasEligibility, false, 'old offer has no eligibility line');
  const oldHtml = buildHtml(oldOffer);
  assert.strictEqual(oldHtml, '', 'old offer renders no eligibility html');
  assert(!oldHtml.includes('undefined'), 'old offer never renders undefined');

  // 2. knowledge_gate passed: shows "Kunnskap" with a positive line.
  const passedVm = getViewModel({ eligibility: { knowledge_gate: 'passed', learning_gate: 'not_required', reasons: [], blockers: [] } });
  assert.strictEqual(passedVm.hasEligibility, true, 'passed knowledge => has eligibility');
  const knowItem = findItem(passedVm, 'knowledge');
  assert(knowItem, 'passed knowledge produces a knowledge item');
  assert.strictEqual(knowItem.label, 'Kunnskap', 'knowledge label is Kunnskap');
  assert.strictEqual(knowItem.status, 'passed', 'knowledge status is passed');
  assert(/quiz|progresjon/i.test(knowItem.text), 'passed knowledge shows a positive quiz/progress line');
  assert.deepStrictEqual(passedVm.blockers, [], 'passed knowledge has no blockers');
  const passedHtml = buildHtml({ eligibility: { knowledge_gate: 'passed' } });
  assert(passedHtml.includes('Kunnskap'), 'passed knowledge html shows Kunnskap');
  assert(passedHtml.includes('civi-offer-eligibility'), 'html uses the eligibility class');
  assert(!passedHtml.includes('undefined'), 'passed html never renders undefined');

  // 3. knowledge_gate missing (soft): explains it can be strengthened, NOT a blocker.
  const missingVm = getViewModel({ eligibility: { knowledge_gate: 'missing', learning_gate: 'not_required', reasons: [], blockers: [] } });
  const missingItem = findItem(missingVm, 'knowledge');
  assert(missingItem, 'missing knowledge produces a knowledge item');
  assert.strictEqual(missingItem.status, 'missing', 'knowledge status is missing');
  assert(/styrke/i.test(missingItem.text), 'missing knowledge says it can be strengthened');
  assert.deepStrictEqual(missingVm.blockers, [], 'soft missing knowledge is never a hard blocker');
  const missingHtml = buildHtml({ eligibility: { knowledge_gate: 'missing' } });
  assert(!missingHtml.includes('Blokkert'), 'soft missing knowledge does not render a blocker row');

  // 4. learning_gate ready_for_next_step: shows "Erfaring" + skills-can-be-used line.
  const readyVm = getViewModel({ eligibility: { knowledge_gate: 'not_required', learning_gate: 'ready_for_next_step', reasons: [], blockers: [] } });
  const readyItem = findItem(readyVm, 'learning');
  assert(readyItem, 'ready_for_next_step produces a learning item');
  assert.strictEqual(readyItem.label, 'Erfaring', 'learning label is Erfaring');
  assert.strictEqual(readyItem.status, 'ready_for_next_step', 'learning status is ready_for_next_step');
  assert(/ferdighet/i.test(readyItem.text), 'ready_for_next_step says skills can be used further');
  // A short concrete reason replaces the generic text.
  const reasonVm = getViewModel({ eligibility: { learning_gate: 'ready_for_next_step', reasons: ['Du har mestret en rolle og kan ta steget videre.'] } });
  assert.strictEqual(findItem(reasonVm, 'learning').text, 'Du har mestret en rolle og kan ta steget videre.', 'short reason overrides generic learning text');

  // 5. learning_gate strong: shows strong experience / mastered roles.
  const strongItem = findItem(getViewModel({ eligibility: { learning_gate: 'strong' } }), 'learning');
  assert(strongItem, 'strong produces a learning item');
  assert.strictEqual(strongItem.status, 'strong', 'learning status is strong');
  assert(/sterkt|mestre/i.test(strongItem.text), 'strong shows strong/mastered-roles experience');
  // building also shows.
  assert(findItem(getViewModel({ eligibility: { learning_gate: 'building' } }), 'learning'), 'building produces a learning item');

  // 6. Blockers render a short, safe line and never crash on junk entries.
  const blockedVm = getViewModel({ eligibility: { knowledge_gate: 'not_configured', learning_gate: 'not_required', reasons: [], blockers: ['Kategorien er midlertidig låst etter at du fikk sparken.', '', undefined, null] } });
  assert.strictEqual(blockedVm.hasEligibility, true, 'a blocker alone still has eligibility');
  assert.strictEqual(blockedVm.blockers.length, 1, 'empty/undefined blockers are filtered out');
  const blockedHtml = buildHtml({ eligibility: { blockers: ['Kategorien er midlertidig låst etter at du fikk sparken.'] } });
  assert(blockedHtml.includes('Blokkert'), 'blocker row shows a Blokkert label');
  assert(blockedHtml.includes('midlertidig låst'), 'blocker text is shown');
  assert(!blockedHtml.includes('undefined'), 'blocker html never renders undefined');

  // 7. not_configured / not_required produce no noise.
  const quietVm = getViewModel({ eligibility: { knowledge_gate: 'not_configured', learning_gate: 'not_required', reasons: [], blockers: [] } });
  assert.strictEqual(quietVm.hasEligibility, false, 'not_configured + not_required => nothing to show');
  assert.strictEqual(buildHtml({ eligibility: { knowledge_gate: 'not_configured', learning_gate: 'not_required' } }), '', 'quiet statuses render empty html');
  // Unknown/garbage statuses are also silent rather than noisy.
  const garbageVm = getViewModel({ eligibility: { knowledge_gate: 'totally_made_up', learning_gate: 'also_fake' } });
  assert.strictEqual(garbageVm.hasEligibility, false, 'unknown statuses are dropped, not rendered');

  // Combined offer: both gates + blocker render together, in order, with no undefined.
  const combinedHtml = buildHtml({
    eligibility: {
      knowledge_gate: 'passed',
      learning_gate: 'strong',
      reasons: [],
      blockers: ['Kategorien «media» er midlertidig låst.']
    }
  });
  assert(combinedHtml.includes('Kunnskap') && combinedHtml.includes('Erfaring') && combinedHtml.includes('Blokkert'), 'combined offer shows knowledge, learning and blocker');
  assert(!combinedHtml.includes('undefined'), 'combined html never renders undefined');

  // 8. Accept/decline offer flow is untouched by this UI surface.
  assert(uiSource.includes('CivicationJobs?.acceptOffer?.'), 'acceptOffer wiring is still present');
  assert(uiSource.includes('CivicationJobs?.declineOffer?.'), 'declineOffer wiring is still present');
  assert(!combinedHtml.includes('civiOfferAccept') && !combinedHtml.includes('civiOfferDecline'), 'eligibility html does not touch accept/decline buttons');

  // 9. The PR 990 fired reentry-lock banner lives in CivicationDayPhaseUI and is untouched.
  const dayPhaseSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/ui/CivicationDayPhaseUI.js'), 'utf8');
  assert(dayPhaseSource.includes('civi-reentry-lock-banner'), 'reentry-lock banner is still in the day-phase UI');
  assert(!uiSource.includes('civi-reentry-lock-banner'), 'offer eligibility does not duplicate the reentry-lock banner');

  console.log('PASS: Civication job offer eligibility UI tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
