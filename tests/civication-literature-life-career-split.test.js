#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = readJson('data/badges/litteratur.json');
const evidence = readJson('data/Civication/literatureCareerLifeEvidence.json');
const careersRaw = readJson('data/Civication/hg_careers.json');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');

const lifePositions = [
  'Leser', 'Aktiv leser', 'Litteraturinteressert', 'Skribent', 'Essayist',
  'Anmelder', 'Litteraturkritiker', 'Forfatter', 'Etablert forfatter', 'Poet',
  'Dramatiker', 'Prisvinnende forfatter', 'Bestselgerforfatter',
  'Kanonisert forfatter', 'Skald'
];
const formalJobs = [
  ['Redaksjonsmedarbeider', 1, 'redaksjonsmedarbeider', 'litteratur_redaksjonsmedarbeider'],
  ['Redaktør (bok)', 3, 'redaktor_bok', 'litteratur_redaktor_bok']
];
const professionalPractices = [
  'Skribent', 'Essayist', 'Anmelder', 'Litteraturkritiker', 'Forfatter', 'Poet', 'Dramatiker'
];

assert.strictEqual(badge.id, 'litteratur');
assert.strictEqual(badge.tiers.length, 17, 'Litteratur skal beholde hele 17-trinnsstigen');
assert.deepStrictEqual(evidence.canonical_decision.life_position_tiers, lifePositions);
assert.deepStrictEqual(evidence.canonical_decision.formal_employer_job_tiers, formalJobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.editorial_review_left_open, [], 'Litteratur skal ikke ha åpen editorial review-gjeld');
assert.deepStrictEqual(evidence.canonical_decision.professional_practice_life_positions, professionalPractices);

for (const label of lifePositions) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical tier mangler`);
  assert.ok(tier.life_position, `${label}: skal være life_position`);
  assert.strictEqual(tier.life_position.employment_independent, true, `${label}: må være uavhengig av ansettelse`);
  assert.strictEqual(tier.career_offer, undefined, `${label}: må ikke opprette arbeidsgiverjobb`);
  assert.strictEqual(tier.career_unlock, undefined, `${label}: må ikke skjule automatisk jobb`);
}

for (const label of professionalPractices) {
  const bindings = evidence.livelihood_bindings.by_life_position[label];
  assert.ok(Array.isArray(bindings) && bindings.length > 0, `${label}: skal ha eksplisitte eksisterende levevei-koblinger`);
}
assert.match(evidence.livelihood_bindings.principle, /oppretter aldri inntekt automatisk/i);

for (const [label, salaryTier, roleScope, roleId] of formalJobs) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: jobb-tier mangler`);
  assert.strictEqual(tier.life_position, undefined, `${label}: formell jobb skal ikke maskeres som livsposisjon`);
  assert.strictEqual(tier.career_offer?.title, label);
  assert.strictEqual(tier.career_offer?.policy, 'direct');
  assert.strictEqual(tier.career_offer?.salary_tier, salaryTier, `${label}: eksplisitt eksisterende lønnsbånd mangler`);

  const slug = label === 'Redaktør (bok)' ? 'redaktor_bok' : 'redaksjonsmedarbeider';
  const model = readJson(`data/Civication/roleModels/litteratur/${slug}.json`);
  const grammar = readJson(`data/Civication/workGrammars/litteratur/${slug}.json`);
  assert.strictEqual(model.category, 'litteratur');
  assert.strictEqual(model.role_scope, roleScope);
  assert.strictEqual(model.role_id, roleId);
  assert.strictEqual(grammar.category, 'litteratur');
  assert.strictEqual(grammar.role_scope, roleScope);
  assert.strictEqual(grammar.role_id, roleId);
  assert.deepStrictEqual(grammar.badge_binding.badge_titles, [label]);
}

const careers = Array.isArray(careersRaw) ? careersRaw : careersRaw.careers;
const literatureCareer = careers.find((entry) => entry.career_id === 'litteratur');
assert.ok(literatureCareer, 'Litteratur-karrierens eksisterende økonomiregler mangler');
assert.strictEqual(literatureCareer.economy.salary_by_tier['1'], 4);
assert.strictEqual(literatureCareer.economy.salary_by_tier['3'], 14);

let activePosition = { career_id: 'litteratur', title: 'Redaksjonsmedarbeider', threshold: 115 };
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

for (const label of lifePositions) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({
    career_id: 'litteratur',
    career_name: badge.name,
    title: label,
    threshold: tier.threshold,
    points_at_offer: 1000
  });
  assert.strictEqual(result.ok, false, `${label}: life_position må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0, 'ingen Litteratur-livsposisjon skal nå jobb-lageret');

for (const [label] of formalJobs) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({
    career_id: 'litteratur', career_name: badge.name, title: label,
    threshold: tier.threshold, points_at_offer: 1000
  });
  assert.strictEqual(result.ok, true, `${label}: skal kunne bli faktisk jobbtilbud`);
}
assert.strictEqual(pushed.length, 2);

assert.strictEqual(
  sandbox.window.calculateWeeklySalary(literatureCareer, 16),
  4,
  'Redaksjonsmedarbeider skal beholde lønnsbånd 1 selv om Badge-tier senere er Skald'
);
activePosition = { career_id: 'litteratur', title: 'Redaktør (bok)', threshold: 150 };
assert.strictEqual(
  sandbox.window.calculateWeeklySalary(literatureCareer, 16),
  14,
  'Redaktør (bok) skal bruke eksplisitt lønnsbånd 3, ikke nåværende Badge-tier'
);

console.log('civication literature life-career split ok: 15 life positions / 2 employer jobs / livelihood and salary contracts locked');
