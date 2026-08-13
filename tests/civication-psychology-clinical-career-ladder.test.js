#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');

const badge = readJson('data/badges/psykologi.json');
const evidence = readJson('data/Civication/psychologyClinicalCareerEvidence.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const manifest = readJson('data/Civication/lifestory/manifest.json');

const ROLES = [
  { title: 'Psykolog', threshold: 115, scope: 'psykolog', roleId: 'psykologi_psykolog', policy: 'authorization_required', quals: ['no_psychologist_authorization_or_license'] },
  { title: 'Spesialistpsykolog', threshold: 150, scope: 'spesialistpsykolog', roleId: 'psykologi_spesialistpsykolog', policy: 'authorization_required', quals: ['no_psychologist_authorization_or_license', 'no_psychologist_specialist_approval'] },
  { title: 'Fagansvarlig', threshold: 190, scope: 'fagansvarlig', roleId: 'psykologi_fagansvarlig', policy: 'appointment_required', quals: ['employer_appointment'] },
  { title: 'Klinikkleder', threshold: 240, scope: 'klinikkleder', roleId: 'psykologi_klinikkleder', policy: 'appointment_required', quals: ['employer_appointment'] }
];

for (const expected of ROLES) {
  const tier = badge.tiers.find((item) => item.label === expected.title);
  assert.ok(tier, `mangler canonical tier ${expected.title}`);
  assert.strictEqual(tier.threshold, expected.threshold, `${expected.title}: canonical threshold`);
  assert.strictEqual(tier.career_offer.policy, expected.policy, `${expected.title}: career gate beholdes`);
  assert.deepStrictEqual(tier.career_offer.qualification_ids, expected.quals, `${expected.title}: qualification ids beholdes`);

  assert.strictEqual(Resolver.resolveCareerRoleScope({ career_id: 'psykologi', title: expected.title }), expected.scope,
    `${expected.title}: resolver scope`);
  assert.strictEqual(Resolver.resolveCareerRoleId({ career_id: 'psykologi', title: expected.title }), expected.roleId,
    `${expected.title}: resolver role id`);

  const model = readJson(`data/Civication/roleModels/psykologi/${expected.scope}.json`);
  assert.strictEqual(model.source.tier_label, expected.title);
  assert.strictEqual(model.source.tier_threshold, expected.threshold, `${expected.title}: roleModel threshold må være canonical`);
  assert.strictEqual(model.role_scope, expected.scope);
  assert.strictEqual(model.role_id, expected.roleId);
  assert.strictEqual(model.source.evidence_file, 'data/Civication/psychologyClinicalCareerEvidence.json');

  const grammar = readJson(`data/Civication/workGrammars/psykologi/${expected.scope}.json`);
  assert.strictEqual(grammar.role_scope, expected.scope);
  assert.strictEqual(grammar.role_id, expected.roleId);
  assert.strictEqual(grammar.badge_binding.tier_threshold, expected.threshold);
  assert.ok(Array.isArray(grammar.practice_stories) && grammar.practice_stories.length >= 4,
    `${expected.title}: FWG må ha minst fire praksisfortellinger`);

  const life = manifest.roles[expected.scope];
  assert.ok(life, `${expected.title}: aktiv Life Story mangler`);
  assert.strictEqual(life.badge_id, 'psykologi');
  assert.deepStrictEqual(life.badge_titles, [expected.title]);
  const raw = {
    role: readJson(life.role),
    phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
    roleThreads: readJson(life.threads),
    roleScenes: readJson(life.scenes),
    lifeThreads: readJson(manifest.life.threads),
    lifeScenes: readJson(manifest.life.scenes)
  };
  const content = Content.buildContent(raw);
  assert.strictEqual(content.role.id, expected.scope);
  assert.ok(raw.roleThreads.threads.length >= 5, `${expected.title}: minst fem arbeidstråder`);
  assert.ok(raw.roleScenes.scenes.length >= 5, `${expected.title}: minst fem spillbare scener`);
  assert.ok(raw.roleScenes.scenes.some((scene) => scene.dag === 2), `${expected.title}: reell dag-2-progresjon`);
}

const psychMapping = mappings.careers.psykologi;
assert.strictEqual(psychMapping.implementation_status, 'complete_canonical_ladder_implemented');
for (const expected of ROLES) {
  assert.strictEqual(psychMapping.title_to_role_scope[expected.title], expected.scope,
    `${expected.title}: Badge mapping skal peke på canonical scope`);
  assert.strictEqual(psychMapping.roles[expected.scope].implementation_status, 'implemented');
}
assert.ok(!(psychMapping.future_split_candidates || []).some((item) =>
  (item.candidate_badge_titles || []).some((title) => ROLES.some((expected) => expected.title === title))),
  'de fire implementerte rollene skal ikke stå igjen som future split debt');

assert.strictEqual(evidence.statutory_faglig_ansvarlig.simulated_by_badge_title, false,
  'Badge-tittelen Fagansvarlig må ikke late som lovens faglig ansvarlig');
assert.match(evidence.canonical_roles.Fagansvarlig.statutory_boundary, /ikke identisk/i);
assert.match(evidence.canonical_roles.Klinikkleder.clinical_boundary, /ikke.*beskyttet psykologtittel/i);

const psychologistBoundary = JSON.stringify(readJson('data/Civication/workGrammars/psykologi/psykolog.json').authority_boundary).toLowerCase();
assert.ok(psychologistBoundary.includes('autorisasjon'));
assert.ok(psychologistBoundary.includes('faglig ansvarlig'));
const specialistBoundary = JSON.stringify(readJson('data/Civication/workGrammars/psykologi/spesialistpsykolog.json').authority_boundary).toLowerCase();
assert.ok(specialistBoundary.includes('spesialisttittel'));
assert.ok(specialistBoundary.includes('faglig ansvarlig'));
const fagBoundary = JSON.stringify(readJson('data/Civication/workGrammars/psykologi/fagansvarlig.json').authority_boundary).toLowerCase();
assert.ok(fagBoundary.includes('lovens faglig ansvarlig'));
assert.ok(fagBoundary.includes('diagnostisere'));
const leaderBoundary = JSON.stringify(readJson('data/Civication/workGrammars/psykologi/klinikkleder.json').authority_boundary).toLowerCase();
assert.ok(leaderBoundary.includes('diagnostisere'));
assert.ok(leaderBoundary.includes('lederstillingen'));

const originalPushes = [];
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
  window: {
    BADGES: [badge],
    CivicationJobs: {
      pushOffer: (offer) => { originalPushes.push(offer); return { ok: true, reason: 'pushed' }; },
      canReceiveNewOffers: () => true,
      getOffers: () => []
    },
    dispatchEvent: () => {}
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8'), sandbox,
  { filename: 'merits-and-jobs.js' });
const jobs = sandbox.window.CivicationJobs;

for (const expected of ROLES) {
  const result = jobs.pushOffer({ career_id: 'psykologi', title: expected.title, threshold: expected.threshold });
  assert.strictEqual(result.ok, false, `${expected.title}: uten qualification evidence skal tilbudet blokkeres`);
  assert.strictEqual(result.reason, 'career_qualification_required');
}
assert.strictEqual(originalPushes.length, 0, 'ingen regulert/utnevnt rolle må nå original pushOffer uten kvalifikasjon');

sandbox.window.CivicationQualifications = { hasAll: (ids) => ids.length === 1 && ids[0] === 'no_psychologist_authorization_or_license' };
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Psykolog', threshold: 115 }).ok, true,
  'Psykolog passerer bare med eksplisitt autorisasjonsbevis');
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Spesialistpsykolog', threshold: 150 }).ok, false,
  'autorisasjon alene er ikke spesialistgodkjenning');
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Klinikkleder', threshold: 240 }).ok, false,
  'psykologautorisasjon er ikke klinikklederutnevnelse');

sandbox.window.CivicationQualifications = { hasAll: (ids) => ids.length === 1 && ids[0] === 'employer_appointment' };
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Fagansvarlig', threshold: 190 }).ok, true,
  'Fagansvarlig passerer med eksplisitt arbeidsgiverutnevnelse');
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Klinikkleder', threshold: 240 }).ok, true,
  'Klinikkleder passerer med eksplisitt arbeidsgiverutnevnelse');
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Psykolog', threshold: 115 }).ok, false,
  'lederutnevnelse er ikke psykologautorisasjon');

sandbox.window.CivicationQualifications = { hasAll: (ids) => ids.includes('no_psychologist_authorization_or_license') && ids.includes('no_psychologist_specialist_approval') };
assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: 'Spesialistpsykolog', threshold: 150 }).ok, true,
  'Spesialistpsykolog krever begge eksplisitte kvalifikasjoner');

console.log('civication psychology clinical career ladder ok: 4 gated roles remain distinct inside complete 13-tier ladder');
