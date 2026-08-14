#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = readJson('data/badges/film_tv.json');
const overlay = readJson('data/Civication/badgeCareerContracts/film_tv.json');
const evidence = readJson('data/Civication/filmTvCareerLifeEvidence.json');
const patchByTitle = new Map((overlay.tiers || []).map((row) => [row.label, row.career_offer]));
const jobs = [
  ['Produksjonsassistent',1,'produksjonsassistent'],
  ['Manusmedarbeider',1,'manusmedarbeider'],
  ['Programleder',2,'programleder'],
  ['Kurator (film/TV)',2,'kurator_film_tv'],
  ['Regissør',3,'regissor'],
  ['Serieskaper',3,'serieskaper']
];

assert.strictEqual(evidence.version, 2);
assert.strictEqual(overlay.badge_id, 'film_tv');
assert.strictEqual(overlay.evidence_ref, 'data/Civication/filmTvCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(Object.keys(evidence.canonical_decision.work_worlds), jobs.map(([, ,scope]) => scope));

for (const [title, salaryTier, scope] of jobs) {
  const tier = badge.tiers.find((candidate) => candidate.label === title);
  const contract = patchByTitle.get(title);
  assert.ok(tier, `${title}: tier missing`);
  assert.strictEqual(tier.career_offer?.title, title);
  assert.strictEqual(contract?.title, title);
  assert.strictEqual(contract?.policy, 'direct');
  assert.strictEqual(contract?.salary_tier, salaryTier);
  assert.strictEqual(contract?.role_scope, scope);

  const model = readJson(`data/Civication/roleModels/film_tv/${scope}.json`);
  assert.strictEqual(model.version, 2, `${scope}: role model must be v2`);
  assert.strictEqual(model.category, 'film_tv');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.source?.badge_file, 'data/badges/film_tv.json');
  assert.strictEqual(model.source?.evidence, 'data/Civication/filmTvCareerLifeEvidence.json');
  assert.ok((model.competence_axes || []).length >= 6, `${scope}: competence depth`);
  assert.ok((model.ideal_type_problems || []).length >= 5, `${scope}: problem depth`);
  assert.ok((model.authority_boundaries?.cannot || []).length >= 4, `${scope}: authority depth`);

  const grammar = readJson(`data/Civication/workGrammars/film_tv/${scope}.json`);
  assert.strictEqual(grammar.version, 2, `${scope}: FWG must be v2`);
  assert.strictEqual(grammar.category, 'film_tv');
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, [title]);
  assert.ok((grammar.task_families || []).length >= 5, `${scope}: task families`);
  assert.ok((grammar.work_loops || []).length >= 2, `${scope}: work loops`);
  assert.ok((grammar.practice_stories || []).length >= 5, `${scope}: practice stories`);
  assert.ok((grammar.quality_axes || []).length >= 6, `${scope}: quality axes`);
  assert.ok((grammar.authority_boundary?.may_not || []).length >= 4, `${scope}: may_not`);
}

assert.strictEqual(badge.tiers.filter((tier) => tier.life_position?.employment_independent === true).length, 9);
assert.strictEqual(badge.tiers.filter((tier) => tier.career_offer).length, 6);
assert.strictEqual(overlay.tiers.length, 6);
console.log('civication Film/TV career architecture ok: 9 life/status tiers / 6 formal jobs / 6 v2 work worlds via Civication overlay');
