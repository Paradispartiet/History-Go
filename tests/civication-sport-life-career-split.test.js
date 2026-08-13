#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = readJson('data/badges/sport.json');
const evidence = readJson('data/Civication/sportCareerLifeEvidence.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const meritsSource = fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');

const pureLife = [
  'Mosjonist','Aktiv utøver','Konkurranseutøver','Klubbspiller','Eliteseriespiller',
  'Landslagsutøver','Kaptein','Olympisk Mester','Idrettsstjerne','Idrettslegende'
];
const formalJobs = [
  ['Trener', 1, 'qualification_required', ['sport_specific_coaching_qualification_or_employment']],
  ['Hovedtrener', 2, 'qualification_required', ['sport_specific_coaching_qualification_or_employment']],
  ['Sportssjef', 3, 'appointment_required', ['employer_appointment']]
];

assert.strictEqual(badge.id, 'sport');
assert.strictEqual(badge.tiers.length, 14);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/sportCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_status_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.professional_practice_with_separate_contract_job, ['Profesjonell utøver']);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, formalJobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.editorial_review_left_open, []);
assert.ok(Array.isArray(evidence.sources) && evidence.sources.length >= 7);
assert.strictEqual(evidence.livelihood_boundaries.automatic_income_from_badge, false);

for (const label of pureLife) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical Sport-tier mangler`);
  assert.ok(tier.life_position, `${label}: skal være life_position`);
  assert.strictEqual(tier.life_position.employment_independent, true, `${label}: livsstatus skal være uavhengig av jobb`);
  assert.strictEqual(tier.career_offer, undefined, `${label}: ren status må ikke ha career_offer`);
  assert.strictEqual(tier.career_unlock, undefined, `${label}: ren status må ikke ha career_unlock`);
}

const professional = badge.tiers.find((tier) => tier.label === 'Profesjonell utøver');
assert.ok(professional?.life_position, 'Profesjonell utøver skal beholdes som profesjonell livspraksis');
assert.strictEqual(professional.life_position.kind, 'professional_practice');
assert.strictEqual(professional.life_position.employment_independent, true);
assert.strictEqual(professional.career_unlock?.title, 'Profesjonell utøver');
assert.strictEqual(professional.career_unlock?.policy, 'appointment_required');
assert.deepStrictEqual(professional.career_unlock?.qualification_ids, ['employer_appointment']);
assert.strictEqual(professional.career_unlock?.salary_tier, 2);

for (const [label, salaryTier, policy, qualificationIds] of formalJobs) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: jobb-tier mangler`);
  assert.strictEqual(tier.life_position, undefined, `${label}: ren jobb-tier skal ikke maskeres som life_position`);
  assert.strictEqual(tier.career_offer?.title, label);
  assert.strictEqual(tier.career_offer?.policy, policy);
  assert.deepStrictEqual(tier.career_offer?.qualification_ids, qualificationIds);
  assert.strictEqual(tier.career_offer?.salary_tier, salaryTier);
}

const mapping = mappings.careers?.sport;
assert.ok(mapping, 'Sport career mapping mangler');
assert.strictEqual(mapping.title_to_role_scope?.['Profesjonell utøver'], 'sport_utover');
assert.strictEqual(mapping.title_to_role_scope?.Trener, 'sport_trener');
assert.strictEqual(mapping.title_to_role_scope?.Hovedtrener, 'sport_trener');
assert.strictEqual(mapping.title_to_role_scope?.Sportssjef, 'sport_sportsledelse');

const modelExpectations = [
  ['profesjonell_utover.json', 'Profesjonell utøver', 'sport_utover'],
  ['trener.json', 'Trener', 'sport_trener'],
  ['hovedtrener.json', 'Hovedtrener', 'sport_trener'],
  ['sportssjef.json', 'Sportssjef', 'sport_sportsledelse']
];
for (const [file, title, scope] of modelExpectations) {
  const model = readJson(`data/Civication/roleModels/sport/${file}`);
  assert.strictEqual(model.version, 2, `${title}: rollemodell skal være oppgradert fra generisk v1`);
  assert.strictEqual(model.title, title);
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.source?.badge_file, 'data/badges/sport.json');
  assert.strictEqual(model.source?.evidence_ref, 'data/Civication/sportCareerLifeEvidence.json');
  assert.ok((model.competence_axes || []).length >= 3, `${title}: kompetanseakser mangler`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 3, `${title}: mandatgrenser mangler`);
}

for (const [file, scope, titles] of [
  ['sport_utover.json', 'sport_utover', ['Profesjonell utøver']],
  ['sport_trener.json', 'sport_trener', ['Trener','Hovedtrener']],
  ['sport_sportsledelse.json', 'sport_sportsledelse', ['Sportssjef']]
]) {
  const grammar = readJson(`data/Civication/workGrammars/sport/${file}`);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: minst fem praksisfortellinger kreves`);
  assert.ok((grammar.quality_axes || []).length >= 5, `${scope}: kvalitetsakser mangler`);
}

const pushed = [];
let activePosition = null;
let qualifications = new Set();
const sandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  fetch: async () => ({ json: async () => ({}) }),
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener: () => {} },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  Event: function Event(type) { this.type = type; },
  showToast: () => {},
  pulseBadge: () => {},
  catIdFromDisplay: (value) => value,
  deriveTierFromPoints: () => ({ tierIndex: 0 }),
  module: { exports: {} },
  exports: {},
  window: {
    BADGES: [badge],
    HG_CAREERS: [{ career_id: 'sport', economy: { salary_by_tier: { '1': 5, '2': 9, '3': 25 } } }],
    CivicationJobs: {
      pushOffer(offer) { pushed.push(offer); return { ok: true, offer }; },
      canReceiveNewOffers: () => true,
      getOffers: () => []
    },
    CivicationQualifications: {
      hasAll(ids) { return ids.every((id) => qualifications.has(id)); }
    },
    CivicationState: {
      getActivePosition() { return activePosition; }
    },
    calculateWeeklySalary(career, zeroBasedTierIndex) {
      const key = String(Number(zeroBasedTierIndex) + 1);
      return Number(career?.economy?.salary_by_tier?.[key] || 0);
    },
    dispatchEvent: () => {}
  }
};
sandbox.window.window = sandbox.window;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(meritsSource, sandbox, { filename: 'merits-and-jobs.js' });
vm.runInContext(guardSource, sandbox, { filename: 'civicationCareerRealityGuard.js' });

for (const label of ['Landslagsutøver','Kaptein','Olympisk Mester','Idrettsstjerne','Idrettslegende']) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  const result = sandbox.window.CivicationJobs.pushOffer({ career_id:'sport', title:label, threshold:tier.threshold, points_at_offer:999 });
  assert.strictEqual(result.ok, false, `${label}: ren status må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason, 'life_position_not_job');
}
assert.strictEqual(pushed.length, 0, 'ingen Sport-status skal nå jobb-lageret');

let result = sandbox.window.CivicationJobs.pushOffer({ career_id:'sport', title:'Profesjonell utøver', threshold:60, points_at_offer:60 });
assert.strictEqual(result.ok, false, 'Profesjonell utøver skal kreve faktisk arbeidsgivergrunnlag');
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({ career_id:'sport', title:'Profesjonell utøver', threshold:60, points_at_offer:60 });
assert.strictEqual(result.ok, true);
assert.strictEqual(pushed.at(-1).title, 'Profesjonell utøver');
assert.strictEqual(pushed.at(-1).life_position_label, 'Profesjonell utøver');

qualifications = new Set();
result = sandbox.window.CivicationJobs.pushOffer({ career_id:'sport', title:'Trener', threshold:150, points_at_offer:150 });
assert.strictEqual(result.ok, false, 'Trener skal være fail-closed uten trenerkvalifikasjon/ansettelse');
assert.strictEqual(result.reason, 'career_qualification_required');
qualifications = new Set(['sport_specific_coaching_qualification_or_employment']);
result = sandbox.window.CivicationJobs.pushOffer({ career_id:'sport', title:'Trener', threshold:150, points_at_offer:150 });
assert.strictEqual(result.ok, true);

const career = { career_id:'sport', economy:{ salary_by_tier:{ '1':5, '2':9, '3':25 } } };
activePosition = { career_id:'sport', title:'Profesjonell utøver', threshold:60 };
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 13), 9, 'profesjonell utøver skal holde band 2 ved senere Badge-status');
activePosition = { career_id:'sport', title:'Trener', threshold:150 };
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 13), 5, 'Trener skal følge band 1');
activePosition = { career_id:'sport', title:'Hovedtrener', threshold:190 };
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 13), 9, 'Hovedtrener skal følge band 2');
activePosition = { career_id:'sport', title:'Sportssjef', threshold:240 };
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 13), 25, 'Sportssjef skal følge band 3');

console.log('civication sport life-career split ok: 10 pure statuses / 1 professional practice+contract / 3 formal jobs');
