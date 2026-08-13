#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const index = readJson('data/badges/index.json');
const badges = index.files.map((rel) => readJson(rel));
const catalog = readJson('data/Civication/lifePositionCatalog.json');

assert.strictEqual(badges.length, 17, 'canonical Badge-register skal fortsatt ha 17 Badges');
assert.strictEqual(catalog.schema, 'civication_life_position_catalog_v1');
assert.ok(Array.isArray(catalog.principles) && catalog.principles.length >= 5,
  'livsposisjonskatalogen skal forklare selvvalg, jobbskille og autoritetsgrenser');
assert.ok(catalog.principles.some((text) => /aldri.*automatisk/i.test(text)),
  'Badge-poeng skal aldri auto-tildele identitet');
assert.ok(catalog.principles.some((text) => /ikke.*lønn/i.test(text)),
  'livsposisjon skal ikke gi lønn i seg selv');

const badgeIds = badges.map((badge) => badge.id);
const profileIds = catalog.badges.map((profile) => profile.badge_id);
assert.deepStrictEqual(new Set(profileIds), new Set(badgeIds),
  'alle og bare canonicale Badges skal ha en livsprofil');
assert.strictEqual(new Set(profileIds).size, 17, 'hver Badge skal ha nøyaktig én livsprofil');

for (const profile of catalog.badges) {
  const badge = badges.find((entry) => entry.id === profile.badge_id);
  assert.ok(badge, `ukjent badge_id i livsprofil: ${profile.badge_id}`);
  assert.ok(profile.shape, `${profile.badge_id}: shape mangler`);
  assert.ok(profile.career_assessment, `${profile.badge_id}: career_assessment mangler`);
  assert.ok(Array.isArray(profile.job_next_moves) && profile.job_next_moves.length,
    `${profile.badge_id}: job_next_moves mangler`);
  assert.ok(Array.isArray(profile.positions), `${profile.badge_id}: positions må være array`);

  if (profile.badge_id === 'subkultur') {
    assert.strictEqual(profile.positions_from_badge_tiers, true,
      'Subkultur skal fortsatt bruke sine 11 canonicale tier-livsposisjoner');
    assert.strictEqual(profile.positions.length, 0,
      'Subkultur-katalogen skal ikke duplisere tier-livsposisjonene');
    continue;
  }

  assert.ok(profile.positions.length >= 4,
    `${profile.badge_id}: minst fire alternative livsposisjoner kreves`);
  const maxThreshold = Math.max(...badge.tiers.map((tier) => Number(tier.threshold)));
  const ids = new Set();
  const labels = new Set();

  for (const position of profile.positions) {
    assert.ok(position.id && /^[a-z0-9_]+$/.test(position.id),
      `${profile.badge_id}: livsposisjon trenger streng canonical id`);
    assert.ok(position.label, `${profile.badge_id}/${position.id}: label mangler`);
    assert.ok(!ids.has(position.id), `${profile.badge_id}: duplikat id ${position.id}`);
    assert.ok(!labels.has(position.label), `${profile.badge_id}: duplikat label ${position.label}`);
    ids.add(position.id);
    labels.add(position.label);

    assert.ok(Number.isFinite(Number(position.threshold)) && Number(position.threshold) > 0,
      `${profile.badge_id}/${position.id}: ugyldig threshold`);
    assert.ok(Number(position.threshold) <= maxThreshold,
      `${profile.badge_id}/${position.id}: threshold ligger over Badge-stigen`);
    assert.ok(position.kind, `${profile.badge_id}/${position.id}: kind mangler`);
    assert.ok(String(position.description || '').length >= 25,
      `${profile.badge_id}/${position.id}: beskrivelse er for tynn`);
    assert.ok(Array.isArray(position.hooks) && position.hooks.length >= 3,
      `${profile.badge_id}/${position.id}: minst tre narrative hooks kreves`);
    assert.ok(!position.career_offer && !position.career_unlock,
      `${profile.badge_id}/${position.id}: livsposisjon må ikke være skjult jobbtilbud`);
  }
}

// Runtime skal slå sammen katalogposisjoner og tier-posisjoner uten å endre arbeidsstatus.
const merits = {};
for (const badge of badges) {
  merits[badge.id] = { points: Math.max(...badge.tiers.map((tier) => Number(tier.threshold))) };
}
const storage = new Map([['merits_by_category', JSON.stringify(merits)]]);
let activeJob = null;
const sandbox = {
  console,
  Date,
  Event: function Event(type) { this.type = type; },
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  window: {
    BADGES: badges,
    CIVI_LIFE_POSITION_CATALOG: catalog,
    CivicationState: { getActivePosition: () => activeJob },
    dispatchEvent: () => {}
  },
  module: { exports: {} }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationLifePositionRuntime.js'), 'utf8'), sandbox,
  { filename: 'civicationLifePositionRuntime.js' });

const api = sandbox.window.CivicationLifePositions;
assert.ok(api.getUnlockedPositions('historie').some((position) => position.label === 'Arkivrotte'));
assert.ok(api.getUnlockedPositions('film_tv').some((position) => position.label === 'Festivalgjenger'));
assert.ok(api.getUnlockedPositions('psykologi').some((position) => position.label === 'Selvgransker'));
assert.ok(api.getUnlockedPositions('subkultur').some((position) => position.label === 'Gangster'),
  'Subkultur-tierposisjoner skal fortsatt være med');

let result = api.activate('historie', 'Arkivrotte');
assert.strictEqual(result.ok, true);
assert.strictEqual(api.getLifeContext().employment.status, 'unemployed');
assert.strictEqual(api.getLifeContext().primary_life_position.description.length > 25, true,
  'aktiv livsposisjon skal bære beskrivelse inn i livskonteksten');
assert.ok(api.getLifeContext().primary_life_position.hooks.length >= 3,
  'aktiv livsposisjon skal bære narrative hooks');

activeJob = { career_id: 'historie', title: 'Arkivar' };
assert.strictEqual(api.getLifeContext().employment.status, 'employed');
assert.strictEqual(api.getLifeContext().primary_life_position.label, 'Arkivrotte',
  'jobb skal ikke slette valgt livsposisjon');

// Lavere poeng skal faktisk låse høyere livsvalg.
storage.set('merits_by_category', JSON.stringify({ litteratur: { points: 10 } }));
assert.ok(api.getUnlockedPositions('litteratur').some((position) => position.label === 'Bokorm'));
assert.ok(api.getUnlockedPositions('litteratur').some((position) => position.label === 'Biblioteksvanker'));
assert.ok(!api.getUnlockedPositions('litteratur').some((position) => position.label === 'Skrivebordspoet'));
assert.strictEqual(api.activate('litteratur', 'Skrivebordspoet').ok, false,
  'låst livsposisjon skal ikke kunne aktiveres direkte');

console.log(`civication all-badges life positions ok: ${catalog.badges.length} badge profiles audited`);
