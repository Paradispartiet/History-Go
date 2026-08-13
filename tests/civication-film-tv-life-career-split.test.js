#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = readJson('data/badges/film_tv.json');
const evidence = readJson('data/Civication/filmTvCareerLifeEvidence.json');
const policy = readJson('data/Civication/badgeCareerAuditPolicy.json');
const shellSource = fs.readFileSync(path.join(ROOT, 'js/Civication/CivicationShellBoot.js'), 'utf8');
const matrixSource = fs.readFileSync(path.join(ROOT, 'scripts/civication-badge-career-matrix.mjs'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');

assert.strictEqual(badge.id, 'film_tv');
assert.strictEqual(badge.tiers.length, 15, 'Film/TV beholder hele den morsomme 15-trinnsstigen');
assert.strictEqual(badge.career_life_evidence, 'data/Civication/filmTvCareerLifeEvidence.json');

const lifeOnly = [
  'Seer',
  'Filminteressert',
  'Filmfantast',
  'Kjenner',
  'Connaisseur',
  'Prisvinner',
  'Internasjonalt gjennomslag',
  'Film- og TV-stjerne',
  'Ikon'
];
const formalJobs = [
  ['Produksjonsassistent', 1],
  ['Manusmedarbeider', 1],
  ['Programleder', 2],
  ['Kurator (film/TV)', 2],
  ['Regissør', 3],
  ['Serieskaper', 3]
];

assert.deepStrictEqual(evidence.canonical_decision.life_only_tiers, lifeOnly);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, formalJobs.map(([title]) => title));
assert.ok(Array.isArray(evidence.sources) && evidence.sources.length >= 3, 'Film/TV-splittet skal ha eksplisitt kildegrunnlag');

for (const label of lifeOnly) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical tier mangler`);
  assert.ok(tier.life_position, `${label}: skal materialiseres som life_position`);
  assert.strictEqual(tier.life_position.employment_independent, true, `${label}: status skal være uavhengig av ansettelse`);
  assert.strictEqual(tier.career_offer, undefined, `${label}: må ikke ha career_offer`);
  assert.strictEqual(tier.career_unlock, undefined, `${label}: må ikke skjule en automatisk jobb`);
}

for (const [label, salaryTier] of formalJobs) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical jobb-tier mangler`);
  assert.strictEqual(tier.life_position, undefined, `${label}: faktisk jobb skal ikke maskeres som livsposisjon`);
  assert.strictEqual(tier.career_offer?.title, label);
  assert.strictEqual(tier.career_offer?.policy, 'direct');
  assert.strictEqual(tier.career_offer?.salary_tier, salaryTier, `${label}: eksplisitt jobb-lønnsbånd mangler`);
}

const policyByTitle = new Map((policy.badges.film_tv || []).map((row) => [row[0], row]));
for (const label of lifeOnly) {
  const row = policyByTitle.get(label);
  assert.ok(row, `${label}: audit policy mangler`);
  assert.strictEqual(row[2], 'not_job', `${label}: policy skal eksplisitt si not_job`);
}
for (const [label] of formalJobs) {
  const row = policyByTitle.get(label);
  assert.ok(row, `${label}: audit policy mangler`);
  assert.strictEqual(row[2], 'direct', `${label}: faktisk jobb skal være direkte jobbtilbud`);
  assert.strictEqual(row[3], 'keep', `${label}: faktisk jobb skal beholdes`);
}

assert.ok(matrixSource.includes('pureLifePosition'), 'Career Matrix må skille ren life_position fra jobb');
assert.ok(matrixSource.includes('salaryApplicable'), 'Career Matrix må gjøre lønn N/A for rene livsposisjoner');
assert.ok(matrixSource.includes("'career_salary_band'"), 'Career Matrix må auditere eksplisitt salary_tier');
assert.ok(shellSource.includes('civicationCareerRealityGuard.js'), 'shell må laste career reality guard');
assert.ok(shellSource.indexOf('ensureCivicationCareerRealityGuardLoaded()') < shellSource.indexOf('CivicationEconomyEngine.tickWeekly()'),
  'career reality guard må installeres før økonomitick');

let activePosition = { career_id: 'film_tv', title: 'Produksjonsassistent', threshold: 60 };
const pushed = [];
const sandbox = {
  console,
  module: { exports: {} },
  exports: {},
  window: {
    BADGES: [badge],
    CivicationJobs: {
      pushOffer(offer) {
        pushed.push(offer);
        return { ok: true, offer };
      }
    },
    CivicationState: {
      getActivePosition() { return activePosition; }
    },
    calculateWeeklySalary(career, zeroBasedTierIndex) {
      const key = String(Number(zeroBasedTierIndex) + 1);
      return Number(career?.economy?.salary_by_tier?.[key] || 0);
    }
  }
};
sandbox.globalThis = sandbox.window;
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(guardSource, sandbox, { filename: 'civicationCareerRealityGuard.js' });

const guard = sandbox.window.CivicationCareerRealityGuard;
assert.ok(guard, 'career reality guard skal eksponeres');
assert.strictEqual(guard.isPureLifeTier(badge.tiers.find((tier) => tier.label === 'Ikon')), true);
assert.strictEqual(guard.isPureLifeTier(badge.tiers.find((tier) => tier.label === 'Regissør')), false);

for (const label of lifeOnly) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({
    career_id: 'film_tv',
    career_name: 'Film & TV',
    title: label,
    threshold: tier.threshold,
    points_at_offer: 999
  });
  assert.strictEqual(result.ok, false, `${label}: ren status må stoppes før original pushOffer`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0, 'ingen ren Film/TV-status skal nå jobb-lageret');

let result = sandbox.window.CivicationJobs.pushOffer({
  career_id: 'film_tv',
  career_name: 'Film & TV',
  title: 'Produksjonsassistent',
  threshold: 60,
  points_at_offer: 650
});
assert.strictEqual(result.ok, true, 'Produksjonsassistent skal fortsatt kunne bli et reelt jobbtilbud');
assert.strictEqual(pushed.length, 1);

const career = {
  career_id: 'film_tv',
  economy: { salary_by_tier: { '1': 5, '2': 9, '3': 18 } }
};

assert.strictEqual(
  sandbox.window.calculateWeeklySalary(career, 14),
  5,
  'Produksjonsassistent skal beholde lønnsbånd 1 selv om Badge-tier senere er Ikon'
);

activePosition = { career_id: 'film_tv', title: 'Programleder', threshold: 115 };
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 14), 9,
  'Programleder skal følge eksplisitt lønnsbånd 2, ikke nåværende Badge-tier');

activePosition = { career_id: 'film_tv', title: 'Regissør', threshold: 190 };
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 14), 18,
  'Regissør skal følge eksplisitt lønnsbånd 3');

activePosition = null;
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 2), 18,
  'uten aktiv jobb skal salary guard bevare eksisterende beregningssemantikk');

console.log('civication film/tv life-career split ok: 9 life-only tiers / 6 formal jobs / accepted-job salary bands locked');
