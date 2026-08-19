'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/by/saksbehandler_plan_bygg.json');
const grammar = readJson('data/Civication/workGrammars/by/by_saksbehandler.json');
const plan = readJson('data/Civication/mailPlans/by/by_saksbehandler_plan.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'by/by_saksbehandler');

assert.equal(model.category, 'by');
assert.equal(model.role_id, 'by_saksbehandler_plan_bygg');
assert.equal(grammar.category, 'by');
assert.equal(grammar.role_scope, 'by_saksbehandler');
assert.equal(plan.category, 'by');
assert.equal(plan.role_scope, 'by_saksbehandler');

const peopleIds = new Set((model.related_people || []).map((person) => person.id));
for (const id of ['anne_planseksjon', 'maria_medvirkning', 'juridisk_rådgiver_erik']) {
  assert.ok(peopleIds.has(id), `Missing By Saksbehandler project actor: ${id}`);
}
const placeIds = new Set((model.related_places || []).map((place) => place.id));
for (const id of ['oslo_byggesak_sentrum', 'saksinntak_og_dokumentasjonsbord', 'regel_og_skjonnsvurdering', 'nabomerknads_og_vedtaksgrunnlag']) {
  assert.ok(placeIds.has(id), `Missing By Saksbehandler work surface: ${id}`);
}
for (const place of model.related_places) assert.ok(place.name && place.function, `${place.id} must have name and function`);
assert.ok(model.authority_boundary?.may?.length >= 3);
assert.ok(model.authority_boundary?.may_not?.length >= 3);
assert.ok((model.competence_axes || []).includes('lovlighet'));
assert.ok((model.competence_axes || []).includes('sporbarhet'));

for (const type of ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence']) {
  const rel = `data/Civication/mailFamilies/by/${type}/by_saksbehandler_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.category, 'by');
  assert.equal(catalog.role_scope, 'by_saksbehandler');
  assert.equal(catalog.mail_type, type);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} must contain authored By Saksbehandler mail`);
  for (const mail of mails) {
    assert.equal(mail.role_scope, 'by_saksbehandler');
    assert.equal(mail.mail_type, type);
    assert.ok(mail.subject && mail.summary && mail.purpose && mail.stakes, `${mail.id} must carry narrative context`);
    assert.ok((mail.choices || []).length >= 2, `${mail.id} must offer a real decision`);
  }
}

assert.ok(world, 'Career Gameplay Matrix must contain by/by_saksbehandler');
assert.equal(world.audit?.components?.entry?.level, 'complete');
assert.equal(world.audit?.components?.people?.level, 'complete');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.components?.mail?.level, 'complete');
assert.equal(world.audit?.components?.authority?.level, 'complete');
assert.equal(world.audit?.components?.consequences?.level, 'complete');
assert.equal(world.audit?.components?.economy?.level, 'complete');
assert.equal(world.audit?.salary?.linked_titles, 2, 'By Saksbehandler retains two canonical Badge-linked titles');
assert.equal(world.audit?.salary?.exact_titles, 2, 'By Saksbehandler retains exact salary coverage for all linked titles');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 14, 'By Saksbehandler must become the fourteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 8, 'By Saksbehandler must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 19, 'By Saksbehandler must add one runtime-gate pass');

console.log('✓ By Saksbehandler systematic rollout is playable');
