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
const evidence = readJson('data/Civication/psychologyAcademicCareerEvidence.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const manifest = readJson('data/Civication/lifestory/manifest.json');

const ROLES = [
  { title: 'Forsker (psykologi)', threshold: 300, scope: 'forsker_psykologi', roleId: 'psykologi_forsker_psykologi' },
  { title: 'Professor (psykologi)', threshold: 380, scope: 'professor_psykologi', roleId: 'psykologi_professor_psykologi' }
];
const QUAL = 'academic_qualification_and_employment';

for (const expected of ROLES) {
  const tier = badge.tiers.find((item) => item.label === expected.title);
  assert.ok(tier, `mangler canonical tier ${expected.title}`);
  assert.strictEqual(tier.threshold, expected.threshold, `${expected.title}: canonical threshold`);
  assert.strictEqual(tier.career_offer?.policy, 'qualification_required', `${expected.title}: akademisk gate beholdes`);
  assert.deepStrictEqual(tier.career_offer?.qualification_ids, [QUAL], `${expected.title}: canonical qualification gate beholdes`);

  assert.strictEqual(Resolver.resolveCareerRoleScope({ career_id: 'psykologi', title: expected.title }), expected.scope,
    `${expected.title}: resolver scope`);
  assert.strictEqual(Resolver.resolveCareerRoleId({ career_id: 'psykologi', title: expected.title }), expected.roleId,
    `${expected.title}: resolver role id`);

  const model = readJson(`data/Civication/roleModels/psykologi/${expected.scope}.json`);
  assert.strictEqual(model.source.tier_label, expected.title);
  assert.strictEqual(model.source.tier_threshold, expected.threshold, `${expected.title}: roleModel threshold må være canonical`);
  assert.strictEqual(model.role_scope, expected.scope);
  assert.strictEqual(model.role_id, expected.roleId);
  assert.strictEqual(model.source.evidence_file, 'data/Civication/psychologyAcademicCareerEvidence.json');
  const modelBoundary = JSON.stringify(model.scope_boundary || {}).toLowerCase();
  assert.ok(modelBoundary.includes('psykologautorisasjon'), `${expected.title}: akademisk rolle må avgrenses fra psykologautorisasjon`);
  assert.ok(modelBoundary.includes('diagnostisere') || modelBoundary.includes('behandle'), `${expected.title}: akademisk rolle må avgrenses fra klinisk myndighet`);

  const grammar = readJson(`data/Civication/workGrammars/psykologi/${expected.scope}.json`);
  assert.strictEqual(grammar.role_scope, expected.scope);
  assert.strictEqual(grammar.role_id, expected.roleId);
  assert.strictEqual(grammar.badge_binding.tier_threshold, expected.threshold);
  assert.ok(Array.isArray(grammar.practice_stories) && grammar.practice_stories.length >= 4,
    `${expected.title}: FWG må ha minst fire praksisfortellinger`);
  const grammarBoundary = JSON.stringify(grammar.authority_boundary || {}).toLowerCase();
  assert.ok(grammarBoundary.includes('psykologautorisasjon'), `${expected.title}: FWG må avgrense klinisk autorisasjon`);

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
  for (const [personId, navn] of [['venn', 'Jonas'], ['familie', 'Søsteren din']]) {
    const person = raw.role.personer.find((item) => item.id === personId);
    assert.strictEqual(person?.navn, navn, `${expected.title}: shared cast ${personId}`);
    assert.strictEqual(typeof raw.role.startState.relasjoner[personId], 'number', `${expected.title}: startrelasjon ${personId}`);
  }
}

const psychMapping = mappings.careers.psykologi;
assert.strictEqual(psychMapping.implementation_status, 'complete_canonical_ladder_implemented');
assert.deepStrictEqual(psychMapping.future_split_candidates, [], 'Psykologi skal ikke ha gjenværende role-scope debt');
for (const expected of ROLES) {
  assert.strictEqual(psychMapping.title_to_role_scope[expected.title], expected.scope,
    `${expected.title}: Badge mapping skal peke på canonical scope`);
  const mapped = psychMapping.roles[expected.scope];
  assert.strictEqual(mapped.implementation_status, 'implemented');
  assert.strictEqual(mapped.lifestory_role, expected.scope);
  assert.strictEqual(mapped.evidence, 'data/Civication/psychologyAcademicCareerEvidence.json');
}
assert.strictEqual(Object.keys(psychMapping.title_to_role_scope).length, badge.tiers.length,
  'alle 13 canonical Psychology-titler skal ha eksplisitt role_scope');
for (const tier of badge.tiers) {
  assert.ok(psychMapping.title_to_role_scope[tier.label], `mangler role_scope for ${tier.label}`);
}

assert.match(evidence.canonical_roles['Forsker (psykologi)'].qualification_boundary, /konkrete? stillingen|konkret/i,
  'Forsker-evidens må bevare stillingsspesifikke kvalifikasjonskrav');
const professorEvidence = evidence.canonical_roles['Professor (psykologi)'].qualification_boundary.toLowerCase();
assert.ok(professorEvidence.includes('doktorgrad'), 'Professor-evidens må dokumentere doktorgrad/tilsvarende');
assert.ok(professorEvidence.includes('utdanningsfaglig'), 'Professor-evidens må dokumentere utdanningsfaglig kompetanse');
assert.ok(professorEvidence.includes('kompetansevurdering'), 'Professor-evidens må dokumentere institusjonell kompetansevurdering');

// Academic qualification/employment is a real runtime gate. Knowledge points alone do not create either role.
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
  assert.strictEqual(result.ok, false, `${expected.title}: uten kvalifikasjon/ansettelse skal tilbudet blokkeres`);
  assert.strictEqual(result.reason, 'career_qualification_required');
}
assert.strictEqual(originalPushes.length, 0, 'akademiske roller må ikke nå original pushOffer uten kvalifikasjon');

sandbox.window.CivicationQualifications = { hasAll: (ids) => ids.length === 1 && ids[0] === QUAL };
for (const expected of ROLES) {
  assert.strictEqual(jobs.pushOffer({ career_id: 'psykologi', title: expected.title, threshold: expected.threshold }).ok, true,
    `${expected.title}: eksplisitt canonical akademisk kvalifikasjon/ansettelse åpner tilbudet`);
}

// The common runtime gate is intentionally coarse. Evidence and work packages must still keep professor and researcher distinct.
assert.notStrictEqual(Resolver.resolveCareerRoleScope({ career_id: 'psykologi', title: ROLES[0].title }),
  Resolver.resolveCareerRoleScope({ career_id: 'psykologi', title: ROLES[1].title }));
for (const forbiddenScope of ['psykolog', 'spesialistpsykolog', 'fagansvarlig', 'klinikkleder']) {
  for (const expected of ROLES) {
    assert.notStrictEqual(Resolver.resolveCareerRoleScope({ career_id: 'psykologi', title: expected.title }), forbiddenScope,
      `${expected.title}: akademisk rolle må ikke arve ${forbiddenScope}`);
  }
}

console.log('civication psychology academic career ladder ok: 2 gated roles -> 2 distinct scopes; all 13 Psychology titles mapped');
