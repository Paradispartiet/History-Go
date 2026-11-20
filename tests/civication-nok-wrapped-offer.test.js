'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const config = read('data/Civication/economy/nok-budget-prototype-2026.json');
(async () => {
const dom = new JSDOM('<body></body>', { url: 'https://example.test', runScripts: 'outside-only' });
const w = dom.window;
await new Promise(resolve => setTimeout(resolve, 0)); // Keep the offer boundary explicit, not auto-rebuild.
w.fetch = async path => ({ ok: true, json: async () => read(path) });
for (const path of ['core/civicationState.js', 'core/civicationJobs.js', 'systems/civicationJobEligibilityRuntime.js', 'merits-and-jobs.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
w.BADGES = [read('data/badges/naeringsliv.json')];
w.applyBadgeCareerContractOverlay(w.BADGES, read('data/Civication/badgeCareerContracts/naeringsliv.json'));
w.CivicationJobEligibilityRuntime.registerKnowledgeRequirements(read('data/Civication/jobKnowledgeRequirements.json'));
w.HGBrands = { all: read('data/brands/brands_master.json') };
w.BRANDS_BY_PLACE = read('data/brands/brands_by_place.json');
for (const path of ['systems/civicationCareerRealityGuard.js', 'systems/civicationBrandAccess.js', 'systems/civicationBrandEmployerBridge.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
const state = w.CivicationState;
state.updateWallet({ balance: 125.25, nok_v1: { active: true, version: 1, config } });
w.localStorage.setItem('merits_by_category', '{"naeringsliv":{"points":5}}');
w.localStorage.setItem('quiz_progress', '{"naeringsliv":{"completed":["actual-qualification-boundary"]}}');
assert.equal(w.CivicationJobs.ensureNokStarterOffer().reason, 'no_unlocked_brand_employer', 'real employer gate remains mandatory');
assert.equal(w.CivicationJobs.getOffers().length, 0);
w.localStorage.setItem('visited_places', '{"tronsmo_bokhandel":true}'); // Explicit visited-place boundary.
const alias = JSON.parse(JSON.stringify(config)); alias.job.roleTitle = 'Butikkmedarbeider';
state.updateWallet({ balance: 125.25, nok_v1: { active: true, version: 1, config: alias } });
assert.equal(w.CivicationJobs.ensureNokStarterOffer().reason, 'invalid_nok_offer', 'canonical badge wrapper rejects the old salary alias');
state.updateWallet({ balance: 125.25, nok_v1: { active: true, version: 1, config } });
assert.equal(w.CivicationJobs.ensureNokStarterOffer().reason, 'duplicate');
const result = { offer: w.CivicationJobs.getLatestPendingOffer() };
assert.ok(result.offer, 'profile update creates the offer automatically');
assert.equal(result.offer.title, w.BADGES[0].tiers[0].career_offer.title);
assert.equal(result.offer.brand_id, 'tronsmo_bokhandel');
assert.equal(w.CivicationJobs.acceptOffer(result.offer.offer_key).ok, true);
assert.equal(state.getActivePosition().nok_salary_contract.jobId, config.job.id);
assert.equal(state.getActivePosition().brand_id, 'tronsmo_bokhandel');
assert.equal(state.getWallet().balance, 125.25);
console.log('PASS: canonical career materializer, life/knowledge/employer guards and NOK salary identity compose without inventing employer or pay');
dom.window.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
