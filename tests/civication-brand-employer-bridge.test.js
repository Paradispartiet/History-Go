#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
}

function setupBrowserMocks() {
  global.window = global;
  global.localStorage = makeStorage();
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.showToast = () => {};

  let activePosition = null;
  global.CivicationState = {
    getActivePosition() { return activePosition; },
    setActivePosition(next) { activePosition = next; return next; },
    appendJobHistoryEnded() {},
    setState() {},
    ensureOnboardingState() {},
    setOnboardingState() {}
  };

  global.CivicationObligationEngine = { activateJob() {} };
  global.CivicationCalendar = { startShiftForJob() {} };
  global.HG_CiviEngine = { getInbox() { return []; }, setInbox() {} };

  global.HGBrands = {
    ready: true,
    getCatalog() {
      return [
        {
          id: 'narvesen',
          name: 'Narvesen',
          brand_type: 'retail_brand',
          sector: 'kiosk',
          state: 'catalog',
          status: 'active',
          verification: 'verified',
          tags: ['brand', 'retail']
        },
        {
          id: 'freia',
          name: 'Freia',
          brand_type: 'historic_company',
          sector: 'food_and_drink',
          state: 'catalog',
          status: 'active',
          tags: ['brand', 'landmark']
        },
        {
          id: 'blue_master',
          name: 'Blue Master',
          brand_type: 'legacy_brand',
          sector: 'advertising',
          state: 'catalog',
          status: 'dead',
          tags: ['brand', 'signage']
        }
      ];
    }
  };
}

async function main() {
  setupBrowserMocks();

  loadScript('js/Civication/core/civicationJobs.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationBrandEmployerBridge.js');

  assert(global.CivicationBrandEmployerBridge, 'Bridge should be exposed');

  const inspect = global.CivicationBrandEmployerBridge.inspect();
  assert.strictEqual(inspect.jobs_patched, true, 'CivicationJobs should be patched');
  assert(inspect.brand_count >= 2, 'Existing HGBrands catalog should be visible');
  assert(inspect.sample_employer, 'Sample employer should resolve');

  const pushed = global.CivicationJobs.pushOffer({
    career_id: 'naeringsliv',
    career_name: 'Næringsliv & industri',
    title: 'Ekspeditør / butikkmedarbeider',
    threshold: 1,
    points_at_offer: 1
  });

  assert.strictEqual(pushed.ok, true, 'Offer should be created');
  assert.strictEqual(pushed.offer.brand_id, 'narvesen', 'Ekspeditor offer should receive existing brand employer');
  assert.strictEqual(pushed.offer.brand_name, 'Narvesen');
  assert.strictEqual(pushed.offer.sector, 'kiosk');
  assert(pushed.offer.employer_context, 'Offer should include employer_context');
  assert.strictEqual(pushed.offer.employer_context.source, 'HGBrands');

  const stored = global.CivicationJobs.getOffers()[0];
  assert.strictEqual(stored.brand_id, 'narvesen', 'Stored offer should preserve brand_id');

  const accepted = global.CivicationJobs.acceptOffer(stored.offer_key);
  assert.strictEqual(accepted.ok, true, 'Offer should be accepted');

  const active = global.CivicationState.getActivePosition();
  assert(active, 'Active position should exist');
  assert.strictEqual(active.brand_id, 'narvesen', 'Active position should preserve employer brand_id');
  assert.strictEqual(active.brand_name, 'Narvesen');
  assert.strictEqual(active.employer_context.source, 'HGBrands');

  console.log('PASS: Civication brand employer bridge test completed.');
  console.log(`brand_id=${active.brand_id}`);
  console.log(`brand_name=${active.brand_name}`);
}

main().catch(error => {
  console.error('FAIL: Civication brand employer bridge test failed.');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
