#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));

function makeStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, String(value)]));
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) {
      return { ok: false, status: 400, async json() { return null; } };
    }
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

function resetRuntime(seedStorage = {}) {
  global.window = global;
  global.localStorage = makeStorage(seedStorage);
  global.fetch = makeFetch(repoRoot);
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.CustomEvent = class CustomEvent extends Event {
    constructor(type, init = {}) { super(type); this.detail = init.detail; }
  };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.location = { href: 'http://localhost/Civication.html' };
  global.HG_CAREERS = [];
  global.BRANDS_MASTER = [];
  global.BRANDS = [];
  global.HGBrands = {
    all: [{ id: 'narvesen', name: 'Narvesen', sector: 'kiosk_retail', brand_type: 'retail' }]
  };
  global.BRANDS_BY_PLACE = { place_x: ['narvesen'] };
  global.CivicationCalendar = { getPhase() { return 'morning'; } };
  global.getNextDayCarryover = () => ({ visibilityBias: 0, processBias: 0 });
  global.applyMorningCarryoverEffects = () => {};
  global.getMorningModeFromCarryover = () => 'balanced';
  global.applyMorningModeToEvent = (event) => event;
  global.setNextDayCarryover = () => {};
  global.appendDayChoiceLog = () => {};
  global.applyPhaseChoiceEffects = () => {};
  global.maybeCreateContactFromChoice = () => {};
  global.HG_CapitalMaintenance = { maintain: () => null };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationJobs.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/tiersCivi.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/mailPlanBridge.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationBrandAccess.js');
  loadScript('js/Civication/systems/civicationBlockedJobMessages.js');
  loadScript('js/Civication/systems/civicationBrandEmployerBridge.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/merits-and-jobs.js');

  global.HG_CiviEngine = new global.CivicationEventEngine();

  // Career-contract overlays are deliberately fail-closed. This fixture must
  // therefore use the canonical required Badge files instead of a synthetic
  // two-tier Næringsliv stub that cannot satisfy the overlay contract.
  global.BADGES = [
    readJson('data/badges/naeringsliv.json'),
    readJson('data/badges/natur.json')
  ];
}

function setupMerits() {
  localStorage.setItem('merits_by_category', JSON.stringify({ naeringsliv: { points: 5 } }));
}

async function scenarioBlockedWithoutEmployer() {
  resetRuntime({
    visited_places: JSON.stringify({}),
    hg_unlocks_v1: JSON.stringify({}),
    quiz_progress: JSON.stringify({})
  });
  setupMerits();
  global.CivicationState.setInbox([]);
  global.CivicationState.setActivePosition(null);

  const result = await global.rebuildJobOffersFromCurrentMerits();
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'no_unlocked_brand_employer');
  assert.strictEqual(global.CivicationJobs.getOffers().length, 0);

  const inbox = global.CivicationState.getInbox();
  assert.strictEqual(inbox.length, 1);
  assert.strictEqual(inbox[0].status, 'pending');
  assert.ok(Number.isFinite(inbox[0].createdAt));
  const event = inbox[0].event || {};
  assert.strictEqual(event.source_type, 'blocked_job');
  assert.strictEqual(event.mail_class, 'opportunity_blocked');
  assert.strictEqual(event.career_id, 'naeringsliv');
  assert.strictEqual(event.role_scope, 'ekspeditor');
  assert.strictEqual(event.reason, 'no_unlocked_brand_employer');
}

async function scenarioUnlockedEmployer() {
  localStorage.setItem('visited_places', JSON.stringify(['place_x']));
  localStorage.setItem('hg_unlocks_v1', JSON.stringify({ place_x: true }));
  localStorage.setItem('quiz_progress', JSON.stringify({ place_x: { completed: true } }));
  setupMerits();
  global.CivicationState.setInbox([]);
  global.CivicationState.setActivePosition(null);

  const result = await global.rebuildJobOffersFromCurrentMerits();
  assert.strictEqual(result.ok, true);

  const offers = global.CivicationJobs.getOffers();
  assert.ok(offers[0]);
  assert.strictEqual(offers[0].title, 'Ekspeditør / butikkmedarbeider');
  assert.strictEqual(offers[0].brand_id, 'narvesen');
  assert.strictEqual(offers[0].brand_name, 'Narvesen');
  assert.strictEqual(offers[0].employer_context.source, 'HGBrands');

  const blockedPending = global.CivicationState.getInbox().filter(
    (item) => item?.status === 'pending' && item?.event?.source_type === 'blocked_job'
  );
  assert.strictEqual(blockedPending.length, 0);

  const accepted = global.CivicationJobs.acceptOffer(offers[0].offer_key);
  assert.strictEqual(accepted.ok, true);
  const active = global.CivicationState.getActivePosition();
  assert.strictEqual(active.brand_id, 'narvesen');
  assert.strictEqual(active.brand_name, 'Narvesen');
  assert.strictEqual(active.employer_context.source, 'HGBrands');

  const inspect = global.CivicationMailRuntime.inspect();
  assert.strictEqual(inspect.role_scope, 'ekspeditor');
  assert.strictEqual(inspect.plan_path, 'data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json');

  const expectedFamilies = [
    'data/Civication/mailFamilies/naeringsliv/job/ekspeditor_job.json',
    'data/Civication/mailFamilies/naeringsliv/people/ekspeditor_people.json',
    'data/Civication/mailFamilies/naeringsliv/conflict/ekspeditor_conflict.json',
    'data/Civication/mailFamilies/naeringsliv/story/ekspeditor_story.json',
    'data/Civication/mailFamilies/naeringsliv/event/ekspeditor_event.json'
  ];
  expectedFamilies.forEach((family) => assert.ok(inspect.family_paths.includes(family), `Missing ${family}`));

  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert.ok(Array.isArray(candidates) && candidates.length > 0);
  assert.ok(candidates.some((mail) => mail && (
    String(mail.role_scope || '') === 'ekspeditor' || String(mail.id || '').includes('ekspeditor')
  )));
}

function verifyLoadOrder() {
  const { LEGACY_SCRIPTS } = require(path.join(repoRoot, 'js/Civication/civicationLegacyLoader.js'));
  const scripts = [
    'js/Civication/core/civicationJobs.js',
    'js/brands/brands_loader.js',
    'js/Civication/systems/civicationCareerRoleResolver.js',
    'js/Civication/systems/civicationBrandAccess.js',
    'js/Civication/systems/civicationBlockedJobMessages.js',
    'js/Civication/systems/civicationBrandEmployerBridge.js',
    'js/Civication/merits-and-jobs.js'
  ];
  const indexes = scripts.map((src) => LEGACY_SCRIPTS.indexOf(src));
  indexes.forEach((index, i) => assert.ok(index !== -1, `Missing script: ${scripts[i]}`));
  for (let i = 1; i < indexes.length; i += 1) {
    assert.ok(indexes[i - 1] < indexes[i], `${scripts[i - 1]} should load before ${scripts[i]}`);
  }

  const boot = fs.readFileSync(path.join(repoRoot, 'js/Civication/CivicationShellBoot.js'), 'utf8');
  assert.ok(/document\.scripts|querySelector\(\s*`?script\[src/.test(boot));
  assert.ok(/if\s*\(\s*existing\s*\)/.test(boot));
}

(async function run() {
  verifyLoadOrder();
  await scenarioBlockedWithoutEmployer();
  await scenarioUnlockedEmployer();
  console.log('civication ekspeditor brand flow ok with canonical Næringsliv career overlay');
})();
