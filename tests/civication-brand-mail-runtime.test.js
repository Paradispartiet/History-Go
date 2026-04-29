#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
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

global.window = global;
global.localStorage = makeStorage();
global.fetch = makeFetch(repoRoot);
global.Event = class Event { constructor(type) { this.type = type; } };
global.CustomEvent = class CustomEvent extends Event { constructor(type, init = {}) { super(type); this.detail = init.detail; } };
global.document = { readyState: 'complete', addEventListener() {} };
global.addEventListener = () => {};
global.dispatchEvent = () => {};
global.location = { href: 'http://localhost/Civication.html' };
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
loadScript('js/Civication/core/civicationEventEngine.js');
loadScript('js/Civication/systems/day/dayPatches.js');
loadScript('js/Civication/mailPlanBridge.js');
loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
loadScript('js/Civication/systems/civicationMailRuntime.js');

global.HG_CiviEngine = new global.CivicationEventEngine();

function setActiveBrand(brandId, brandName) {
  global.CivicationState.setState({
    consumed: {},
    mail_runtime_v1: {
      version: 1,
      role_plan_id: null,
      role_scope: null,
      career_id: null,
      brand_id: null,
      step_index: 0,
      consumed_ids: [],
      history: [],
      updated_at: null
    }
  });

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    career_name: 'Næringsliv & industri',
    title: 'Ekspeditør / butikkmedarbeider',
    role_key: 'ekspeditor',
    role_id: 'naer_ekspeditor',
    ...(brandId ? {
      brand_id: brandId,
      brand_name: brandName,
      employer_context: {
        source: 'HGBrands',
        brand_id: brandId,
        brand_name: brandName,
        career_id: 'naeringsliv',
        role_scope: 'ekspeditor'
      }
    } : {})
  });
}

async function getCandidateIds() {
  const candidates = await global.CivicationMailRuntime.debugCandidates();
  return candidates.map(mail => mail.id);
}

async function testGenericOnlyWithoutBrand() {
  setActiveBrand(null, null);
  const inspect = global.CivicationMailRuntime.inspect();
  assert.strictEqual(inspect.role_scope, 'ekspeditor');
  assert.strictEqual(inspect.brand_id, '');
  assert(!inspect.family_paths.some(p => p.includes('/brand/')), 'Generic active position must not include brand mail path');

  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.length > 0, 'Generic ekspeditor candidates should still load');
  assert(candidates.every(mail => !mail.brand_id), 'Generic candidates should not receive brand_id without active brand');
}

async function testNorliBrandMails() {
  setActiveBrand('norli', 'Norli');
  const inspect = global.CivicationMailRuntime.inspect();
  assert.strictEqual(inspect.role_scope, 'ekspeditor');
  assert.strictEqual(inspect.brand_id, 'norli');
  assert(inspect.family_paths.includes('data/Civication/mailFamilies/naeringsliv/brand/ekspeditor_norli.json'));

  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.some(mail => mail.brand_id === 'norli'), 'Norli candidates should be included for Norli active position');
  assert(candidates.every(mail => mail.brand_id !== 'narvesen'), 'Narvesen mail must not leak into Norli active position');
}

async function testNarvesenBrandMails() {
  setActiveBrand('narvesen', 'Narvesen');
  const inspect = global.CivicationMailRuntime.inspect();
  assert.strictEqual(inspect.role_scope, 'ekspeditor');
  assert.strictEqual(inspect.brand_id, 'narvesen');
  assert(inspect.family_paths.includes('data/Civication/mailFamilies/naeringsliv/brand/ekspeditor_narvesen.json'));

  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.some(mail => mail.brand_id === 'narvesen'), 'Narvesen candidates should be included for Narvesen active position');
  assert(candidates.every(mail => mail.brand_id !== 'norli'), 'Norli mail must not leak into Narvesen active position');
}

async function run() {
  await testGenericOnlyWithoutBrand();
  await testNorliBrandMails();
  await testNarvesenBrandMails();

  const narvesenIds = await getCandidateIds();
  assert(narvesenIds.some(id => id.startsWith('ekspeditor_narvesen_')));

  console.log('PASS: Civication brand-specific mail runtime test completed.');
}

run().catch(error => {
  console.error('FAIL: Civication brand-specific mail runtime test failed.');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
