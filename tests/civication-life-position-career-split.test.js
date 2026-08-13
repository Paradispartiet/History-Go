#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const subkultur = readJson('data/badges/subkultur.json');
const evidence = readJson('data/Civication/subcultureCareerEvidence.json');

const lifeLabels = [
  'Observør', 'Deltaker', 'Hakkekylling', 'Gatesmart', 'Crew', 'Gangster',
  'Dandy', 'Kultfigur', 'Trendsetter', 'Undergrunnsikon', 'Legend'
];
const careerTitles = [
  'Kulturhusvert', 'Arrangementscrew', 'Produksjonsassistent', 'Kulturmedarbeider',
  'Arrangementsplanlegger', 'Kulturkonsulent', 'Booking- og innholdskoordinator',
  'Produsent', 'Prosjektleder (kulturarrangement)', 'Produksjonsleder',
  'Daglig leder (kulturarena)'
];

assert.deepStrictEqual(subkultur.tiers.map((tier) => tier.label), lifeLabels,
  'Subkultur skal beholde den morsomme canonicale livsposisjonsstigen');
assert.deepStrictEqual(subkultur.tiers.map((tier) => tier.career_unlock?.title), careerTitles,
  'hver Subkultur-livsposisjon skal ha en separat, saklig career_unlock');

for (let i = 0; i < subkultur.tiers.length; i += 1) {
  const tier = subkultur.tiers[i];
  assert.ok(tier.life_position, `${tier.label}: life_position mangler`);
  assert.strictEqual(tier.life_position.employment_independent, true,
    `${tier.label}: livsposisjonen skal være uavhengig av formell jobb`);
  assert.strictEqual(evidence.tier_to_career[tier.label], tier.career_unlock.title,
    `${tier.label}: evidensregisteret må samsvare med canonical career_unlock`);
}
assert.strictEqual(subkultur.tiers.find((tier) => tier.label === 'Undergrunnsikon').career_unlock.policy, 'appointment_required');
assert.strictEqual(subkultur.tiers.find((tier) => tier.label === 'Legend').career_unlock.policy, 'appointment_required');
assert.deepStrictEqual(
  subkultur.tiers.find((tier) => tier.label === 'Undergrunnsikon').career_unlock.qualification_ids,
  ['employer_appointment']
);

const policy = readJson('data/Civication/badgeCareerAuditPolicy.json');
const subPolicy = new Map((policy.badges.subkultur || []).map((row) => [row[0], row]));
for (const label of lifeLabels) {
  assert.strictEqual(subPolicy.get(label)?.[2], 'not_job', `${label}: audit skal fortsatt si at livsposisjonen selv ikke er jobb`);
  assert.strictEqual(subPolicy.get(label)?.[3], 'replace', `${label}: jobbsporet må erstattes, ikke Badge-labelen`);
}

const roleManifest = readJson('data/Civication/roleModels/manifest.json');
const subRoleModels = (roleManifest.files || [])
  .filter((rel) => rel.includes('/roleModels/subkultur/'))
  .map((rel) => readJson(rel));
const roleModelTitles = new Set(subRoleModels.map((model) => model.title));
for (const title of careerTitles) {
  assert.ok(roleModelTitles.has(title), `Subkultur-jobben mangler roleModel: ${title}`);
}

const fwgDir = path.join(ROOT, 'data/Civication/workGrammars/subkultur');
const fwgFiles = fs.readdirSync(fwgDir).filter((name) => name.endsWith('.json'));
assert.strictEqual(fwgFiles.length, 5, 'Subkultur skal bruke fem arbeidsverdener, ikke elleve kopierte jobbpakker');
const scopes = new Set(fwgFiles.map((name) => readJson(path.join('data/Civication/workGrammars/subkultur', name)).role_scope));
for (const scope of [
  'subkultur_arrangementsdrift',
  'subkultur_program_og_koordinering',
  'subkultur_produksjon_og_prosjekt',
  'subkultur_produksjonsledelse',
  'subkultur_kulturarena_ledelse'
]) assert.ok(scopes.has(scope), `mangler Subkultur-FWG ${scope}`);

// Jobbtilbud: Badge/livsposisjon skal aldri bli aktiv stillingstittel.
const originalPushes = [];
const meritSandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  fetch: async () => ({ json: async () => ({}) }),
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  Event: function Event(type) { this.type = type; },
  showToast: () => {}, pulseBadge: () => {}, catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  window: {
    BADGES: [subkultur],
    CivicationJobs: {
      pushOffer: (offer) => { originalPushes.push(offer); return { ok: true, offer }; },
      canReceiveNewOffers: () => true,
      getOffers: () => []
    },
    dispatchEvent: () => {}
  }
};
meritSandbox.window.window = meritSandbox.window;
vm.createContext(meritSandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8'), meritSandbox,
  { filename: 'merits-and-jobs.js' });

let result = meritSandbox.window.CivicationJobs.pushOffer({
  career_id: 'subkultur', title: 'Gangster', threshold: 60, points_at_offer: 60
});
assert.strictEqual(result.ok, true, 'Gangster-milepælen skal kunne åpne en direkte jobbmulighet');
assert.strictEqual(originalPushes.at(-1).title, 'Kulturkonsulent', 'aktiv jobb må være den saklige jobbtittelen');
assert.strictEqual(originalPushes.at(-1).badge_tier_label, 'Gangster');
assert.strictEqual(originalPushes.at(-1).life_position_label, 'Gangster');

result = meritSandbox.window.CivicationJobs.pushOffer({
  career_id: 'subkultur', title: 'Undergrunnsikon', threshold: 190, points_at_offer: 190
});
assert.strictEqual(result.ok, false, 'Undergrunnsikon skal ikke automatisk gjøre spilleren til Produksjonsleder');
assert.strictEqual(result.reason, 'career_qualification_required');
assert.ok(!originalPushes.some((offer) => offer.title === 'Produksjonsleder'));

meritSandbox.window.CivicationQualifications = {
  hasAll(ids) { return ids.length === 1 && ids[0] === 'employer_appointment'; }
};
result = meritSandbox.window.CivicationJobs.pushOffer({
  career_id: 'subkultur', title: 'Undergrunnsikon', threshold: 190, points_at_offer: 190
});
assert.strictEqual(result.ok, true);
assert.strictEqual(originalPushes.at(-1).title, 'Produksjonsleder');

// Livsposisjon: kan være aktiv mens spilleren fortsatt er formelt arbeidsledig.
const lifeStorage = new Map([
  ['merits_by_category', JSON.stringify({ subkultur: { points: 100 } })]
]);
let activeJob = null;
const lifeSandbox = {
  console,
  Date,
  Event: function Event(type) { this.type = type; },
  localStorage: {
    getItem: (key) => lifeStorage.has(key) ? lifeStorage.get(key) : null,
    setItem: (key, value) => lifeStorage.set(key, String(value))
  },
  window: {
    BADGES: [subkultur],
    CivicationState: { getActivePosition: () => activeJob },
    dispatchEvent: () => {}
  },
  module: { exports: {} }
};
lifeSandbox.window.window = lifeSandbox.window;
vm.createContext(lifeSandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationLifePositionRuntime.js'), 'utf8'), lifeSandbox,
  { filename: 'civicationLifePositionRuntime.js' });

const lifeApi = lifeSandbox.window.CivicationLifePositions;
assert.ok(lifeApi.getUnlockedPositions('subkultur').some((position) => position.label === 'Gangster'),
  'Gangster skal være en låst opp livsposisjon ved 100 poeng');
result = lifeApi.activate('subkultur', 'Gangster');
assert.strictEqual(result.ok, true);
assert.strictEqual(lifeApi.getLifeContext().employment.status, 'unemployed');
assert.strictEqual(lifeApi.getLifeContext().primary_life_position.label, 'Gangster');

activeJob = { career_id: 'subkultur', title: 'Kulturkonsulent' };
assert.strictEqual(lifeApi.getLifeContext().employment.status, 'employed');
assert.strictEqual(lifeApi.getLifeContext().primary_life_position.label, 'Gangster',
  'livsposisjonen skal overleve når spilleren får jobb');

// Resolveren skal se den reelle jobben, ikke livsposisjonen.
const resolverSandbox = { window: {}, globalThis: {} };
resolverSandbox.window.window = resolverSandbox.window;
vm.createContext(resolverSandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRoleResolver.js'), 'utf8'), resolverSandbox,
  { filename: 'civicationCareerRoleResolver.js' });
const resolver = resolverSandbox.window.CivicationCareerRoleResolver;
assert.strictEqual(resolver.resolveCareerRoleScope({ career_id: 'subkultur', title: 'Kulturkonsulent' }),
  'subkultur_program_og_koordinering');
assert.strictEqual(resolver.resolveCareerRoleScope({ career_id: 'subkultur', title: 'Produksjonsleder' }),
  'subkultur_produksjonsledelse');
assert.strictEqual(resolver.resolveCareerRoleScope({ career_id: 'subkultur', title: 'Daglig leder (kulturarena)' }),
  'subkultur_kulturarena_ledelse');

const matrixOutput = execFileSync(process.execPath,
  [path.join(ROOT, 'scripts/civication-badge-career-matrix.mjs'), '--check'],
  { cwd: ROOT, encoding: 'utf8' });
const splitMatch = matrixOutput.match(/(\d+) life-position splits resolved/);
assert.ok(splitMatch, 'Badge Career Matrix skal rapportere antall løste life-position-splitter');
assert.ok(Number(splitMatch[1]) >= 11,
  'Badge Career Matrix skal fortsatt rapportere minst de 11 Subkultur-splittene som løst når andre badges også ryddes');

console.log('civication life-position/career split ok: Subkultur keeps 11 life positions and unlocks 11 separate jobs');
