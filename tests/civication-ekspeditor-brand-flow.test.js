#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, String(v)]));
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
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function resetRuntime(seedStorage = {}) {
  global.window = global;
  global.localStorage = makeStorage(seedStorage);
  global.fetch = makeFetch(repoRoot);
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.CustomEvent = class CustomEvent extends Event { constructor(type, init = {}) { super(type); this.detail = init.detail; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.location = { href: 'http://localhost/Civication.html' };

  global.HG_CAREERS = [];
  global.BRANDS_MASTER = [];
  global.BRANDS = [];
  global.HGBrands = { all: [{ id: 'narvesen', name: 'Narvesen', sector: 'kiosk_retail', brand_type: 'retail' }] };
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

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  global.BADGES = [{
    id: 'naeringsliv',
    name: 'Næringsliv',
    tiers: [
      { threshold: 0, label: 'Start' },
      { threshold: 1, label: 'Ekspeditør / butikkmedarbeider' }
    ]
  }];
}

function setupMerits() {
  localStorage.setItem('merits_by_category', JSON.stringify({ naeringsliv: { points: 1 } }));
}

async function scenarioA() {
  resetRuntime({ visited_places: JSON.stringify({}), hg_unlocks_v1: JSON.stringify({}), quiz_progress: JSON.stringify({}) });
  setupMerits();
  global.CivicationState.setInbox([]);
  global.CivicationState.setActivePosition(null);

  const result = await global.rebuildJobOffersFromCurrentMerits();
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'no_unlocked_brand_employer');

  const offers = global.CivicationJobs.getOffers();
  assert.strictEqual(offers.length, 0);

  const inbox = global.CivicationState.getInbox();
  assert.strictEqual(inbox.length, 1);
  assert.strictEqual(inbox[0].status, 'pending');
  assert.ok(Number.isFinite(inbox[0].createdAt));
  const ev = inbox[0].event || {};
  assert.strictEqual(ev.source_type, 'blocked_job');
  assert.strictEqual(ev.mail_class, 'opportunity_blocked');
  assert.strictEqual(ev.career_id, 'naeringsliv');
  assert.strictEqual(ev.role_scope, 'ekspeditor');
  assert.strictEqual(ev.reason, 'no_unlocked_brand_employer');
}

async function scenarioBAndC() {
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
  expectedFamilies.forEach((p) => assert(inspect.family_paths.includes(p), `Missing ${p}`));

  const debugCandidates = await global.CivicationMailRuntime.debugCandidates();
  assert.ok(Array.isArray(debugCandidates) && debugCandidates.length > 0);
  const ekspeditorCandidate = debugCandidates.find(
    (m) => m && (String(m.role_scope || '') === 'ekspeditor' || String(m.id || '').includes('ekspeditor'))
  );
  assert.ok(ekspeditorCandidate, 'Expected at least one ekspeditor-consistent candidate');
}

function verifyLoadOrder() {
  const html = fs.readFileSync(path.join(repoRoot, 'Civication.html'), 'utf8');
  const scripts = [
    'js/Civication/core/civicationJobs.js',
    'js/brands/brands_loader.js',
    'js/Civication/systems/civicationCareerRoleResolver.js',
    'js/Civication/systems/civicationBrandAccess.js',
    'js/Civication/systems/civicationBlockedJobMessages.js',
    'js/Civication/systems/civicationBrandEmployerBridge.js',
    'js/Civication/merits-and-jobs.js'
  ];
  const indexes = scripts.map((src) => html.indexOf(src));
  indexes.forEach((idx, i) => assert.ok(idx !== -1, `Missing script: ${scripts[i]}`));
  for (let i = 1; i < indexes.length; i += 1) {
    assert.ok(indexes[i - 1] < indexes[i], `${scripts[i - 1]} should load before ${scripts[i]}`);
  }

  const boot = fs.readFileSync(path.join(repoRoot, 'js/Civication/CivicationBoot.js'), 'utf8');
  assert.ok(boot.includes('const existing = document.querySelector(`script[src="${src}"]`);'));
}

(async function run() {
  verifyLoadOrder();
  await scenarioA();
  await scenarioBAndC();
  console.log('civication ekspeditor brand flow ok');
})();
