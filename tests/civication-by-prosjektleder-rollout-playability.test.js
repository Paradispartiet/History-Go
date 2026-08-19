'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/by/prosjektleder_byutvikling.json');
const grammar = readJson('data/Civication/workGrammars/by/by_prosjektleder.json');
const plan = readJson('data/Civication/mailPlans/by/by_prosjektleder_plan.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'by/by_prosjektleder');

assert.equal(model.category, 'by');
assert.equal(model.role_id, 'by_prosjektleder_byutvikling');
assert.equal(grammar.category, 'by');
assert.equal(grammar.role_scope, 'by_prosjektleder');
assert.equal(plan.category, 'by');
assert.equal(plan.role_scope, 'by_prosjektleder');

const peopleIds = new Set((model.related_people || []).map((person) => person.id));
for (const id of ['kommunalsjef_lena', 'prosjektkoordinator_amin', 'maria_medvirkning', 'okonomi_sigrid']) {
  assert.ok(peopleIds.has(id), `Missing By Prosjektleder project actor: ${id}`);
}
const placeIds = new Set((model.related_places || []).map((place) => place.id));
for (const id of ['oslo_byutvikling_programomrade', 'mandat_og_programbord', 'koordinerings_og_avhengighetsrom', 'risiko_budsjett_og_beslutningslogg']) {
  assert.ok(placeIds.has(id), `Missing By Prosjektleder work surface: ${id}`);
}
for (const place of model.related_places) assert.ok(place.name && place.function, `${place.id} must have name and function`);
assert.ok(model.authority_boundary?.may?.length >= 3);
assert.ok(model.authority_boundary?.may_not?.length >= 3);
assert.ok((model.competence_axes || []).includes('risikostyring'));
assert.ok((model.competence_axes || []).includes('beslutningssporbarhet'));

for (const type of ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence']) {
  const rel = `data/Civication/mailFamilies/by/${type}/by_prosjektleder_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.category, 'by');
  assert.equal(catalog.role_scope, 'by_prosjektleder');
  assert.equal(catalog.mail_type, type);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} must contain authored By Prosjektleder mail`);
  for (const mail of mails) {
    assert.equal(mail.role_scope, 'by_prosjektleder');
    assert.equal(mail.mail_type, type);
    assert.ok(mail.subject && mail.summary && mail.purpose && mail.stakes, `${mail.id} must carry narrative context`);
    assert.ok((mail.choices || []).length >= 2, `${mail.id} must offer a real decision`);
  }
}

assert.ok(world, 'Career Gameplay Matrix must contain by/by_prosjektleder');
assert.equal(world.audit?.components?.entry?.level, 'complete');
assert.equal(world.audit?.components?.people?.level, 'complete');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.components?.mail?.level, 'complete');
assert.equal(world.audit?.components?.authority?.level, 'complete');
assert.equal(world.audit?.components?.consequences?.level, 'complete');
assert.equal(world.audit?.components?.economy?.level, 'complete');
assert.equal(world.audit?.salary?.linked_titles, 4, 'By Prosjektleder retains four canonical Badge-linked titles');
assert.equal(world.audit?.salary?.exact_titles, 4, 'By Prosjektleder retains exact salary coverage for all linked titles');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 13, 'By Prosjektleder must become the thirteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 9, 'By Prosjektleder must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 18, 'By Prosjektleder must add one runtime-gate pass');

console.log('✓ By Prosjektleder systematic rollout is playable');
