#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/media.json');
const evidence = readJson('data/Civication/mediaCareerLifeEvidence.json');
const labels = ['Leser','Følger','Kommentator (felt)','Bidragsyter','Frilansjournalist','Journalist','Reporter','Redaksjonsmedarbeider','Redaktør','Sjefredaktør','Nyhetsleder','Medieprofil','Mediestjerne','Offentlig dagsordensetter','Offentlighetsmakt'];
const life = ['Leser','Følger','Kommentator (felt)','Bidragsyter','Frilansjournalist','Medieprofil','Mediestjerne','Offentlig dagsordensetter','Offentlighetsmakt'];
const jobs = [['Journalist',1,'direct',[]],['Reporter',1,'direct',[]],['Redaksjonsmedarbeider',1,'direct',[]],['Redaktør',2,'appointment_required',['employer_appointment']],['Sjefredaktør',3,'appointment_required',['employer_appointment']],['Nyhetsleder',2,'appointment_required',['employer_appointment']]];
assert.strictEqual(badge.id, 'media');
assert.deepStrictEqual(badge.tiers.map((tier) => tier.label), labels);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/mediaCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, life);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.editorial_review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_media_bands_pc_per_week, {'1':6,'2':9,'3':13});
for (const label of life) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.ok(tier?.life_position, `${label}: life_position mangler`);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
}
assert.strictEqual(badge.tiers.find((tier) => tier.label === 'Frilansjournalist').life_position.kind, 'freelance_professional_practice');
assert.ok(evidence.salary_mapping.not_salary_jobs.includes('Frilansjournalist'));
for (const [title, salaryTier, policy, qualificationIds] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier?.career_offer?.title, title);
  assert.strictEqual(tier?.career_offer?.salary_tier, salaryTier);
  assert.strictEqual(tier?.career_offer?.policy, policy);
  assert.deepStrictEqual(tier?.career_offer?.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier?.life_position, undefined);
}
for (const title of ['Journalist','Reporter','Redaksjonsmedarbeider']) assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'media', title}), 'media_redaksjon');
for (const title of ['Redaktør','Sjefredaktør','Nyhetsleder']) assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'media', title}), 'media_redaksjonell_ledelse');
for (const [file,title,scope] of [['journalist.json','Journalist','media_redaksjon'],['reporter.json','Reporter','media_redaksjon'],['redaksjonsmedarbeider.json','Redaksjonsmedarbeider','media_redaksjon'],['redaktor.json','Redaktør','media_redaksjonell_ledelse'],['sjefredaktor.json','Sjefredaktør','media_redaksjonell_ledelse'],['nyhetsleder.json','Nyhetsleder','media_redaksjonell_ledelse']]) {
  const model = readJson(`data/Civication/roleModels/media/${file}`);
  assert.strictEqual(model.title, title);
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.source?.badge_file, 'data/badges/media.json');
  assert.strictEqual(model.source?.evidence, 'data/Civication/mediaCareerLifeEvidence.json');
  assert.ok((model.competence_axes || []).length >= 3);
  assert.ok((model.ideal_type_problems || []).length >= 2);
}
for (const [file,scope,titles,minStories] of [['media_redaksjon.json','media_redaksjon',['Journalist','Reporter','Redaksjonsmedarbeider'],4],['media_redaksjonell_ledelse.json','media_redaksjonell_ledelse',['Redaktør','Sjefredaktør','Nyhetsleder'],3]]) {
  const grammar = readJson(`data/Civication/workGrammars/media/${file}`);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding?.badge_titles, titles);
  assert.ok((grammar.practice_stories || []).length >= minStories);
  assert.ok((grammar.quality_axes || []).length >= 4);
}
console.log('civication media life-career split ok: 9 life/practice positions / 6 formal jobs / 2 work worlds');
