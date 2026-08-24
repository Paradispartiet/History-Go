#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const rel = value => path.join(ROOT, value);
const read = value => JSON.parse(fs.readFileSync(rel(value), 'utf8'));
const world = read('data/Civication/roleWorlds/media/media_redaksjon.json');
const index = read('data/Civication/roleWorlds/index.json');
const bank = read('data/Civication/roleWorldThemeBank.json');
const plan = read('data/Civication/mailPlans/media/media_redaksjon_plan.json');
const model = read('data/Civication/roleModels/media/journalist.json');
const matrix = read('data/Civication/careerGameplayMatrix.json');

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'media');
assert.equal(world.role_scope, 'media_redaksjon');
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.theme_ids, bank.reference_profiles['media/media_redaksjon']);
assert.deepEqual(index.fourth_structural_pilot, {
  category: 'media',
  role_scope: 'media_redaksjon',
  status: 'role_world_complete',
  focus: 'kilder, publikum, profesjonskultur, feedback, rework og redaktørmyndighet'
});

const coverage = new Map();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const key = `${beat.day}/${beat.phase}`;
  assert.ok(!coverage.has(key), `duplicate ${key}`);
  coverage.set(key, beat);
  assert.ok(beat.summary.length >= 70, `${key} summary is too thin`);
  assert.ok(!summaries.has(beat.summary), `${key} repeats another beat`);
  summaries.add(beat.summary);
}
assert.equal(coverage.size, 56);
for (let day = 1; day <= 14; day += 1) {
  for (const phase of ['morning', 'lunch', 'afternoon', 'evening']) assert.ok(coverage.has(`${day}/${phase}`));
}

const idFields = new Set(['id', 'mail_id', 'scene_id', 'scenario_id', 'story_id', 'thread_id', 'event_id', 'key', 'role_id', 'set_id', 'quiz_id']);
function collectIds(value, out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, out);
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  for (const [key, item] of Object.entries(value)) {
    if (idFields.has(key) && (typeof item === 'string' || typeof item === 'number')) out.add(String(item));
    collectIds(item, out);
  }
  return out;
}

const idCache = new Map();
const provenanceUses = new Set();
function verifyRef(reference) {
  const marker = reference.indexOf('#');
  assert.ok(marker > 0, `invalid materialization ref ${reference}`);
  const file = reference.slice(0, marker);
  const id = reference.slice(marker + 1);
  assert.ok(fs.existsSync(rel(file)), `missing materialization source ${file}`);
  let ids = idCache.get(file);
  if (!ids) {
    ids = collectIds(read(file));
    idCache.set(file, ids);
  }
  assert.ok(ids.has(id), `missing ${id} in ${file}`);
  provenanceUses.add(reference);
}
for (const beat of world.season.coverage) beat.materialization_refs.forEach(verifyRef);
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyRef);
assert.ok(provenanceUses.size >= 35, 'journalism world requires broad authored provenance');

assert.ok(world.recurring_people_archetypes.length >= 8);
for (const id of ['vaktsjef_lina', 'deskredaktor_jonas', 'reporterkollega_amina', 'kilde_ellen', 'motkilde_arvid', 'leser_sara', 'venn_mari', 'familie_olav']) {
  assert.ok(world.recurring_people_archetypes.some(person => person.id === id), `missing recurring person ${id}`);
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, thread.id);
  assert.ok(new Set(thread.beat_refs.map(ref => Number(ref.split('/')[0]))).size >= 3, `${thread.id} must span days`);
  for (const beatRef of thread.beat_refs) assert.ok(coverage.has(beatRef), `${thread.id} missing ${beatRef}`);
}
const phaseOrder = new Map([['morning', 0], ['lunch', 1], ['afternoon', 2], ['evening', 3]]);
const beatNumber = ref => {
  const [day, phase] = ref.split('/');
  return Number(day) * 10 + phaseOrder.get(phase);
};
assert.ok(world.delayed_consequences.length >= 7);
for (const consequence of world.delayed_consequences) assert.ok(beatNumber(consequence.return_ref) > beatNumber(consequence.setup_ref), consequence.id);
assert.equal(world.materialization.no_new_runtime, true);

assert.equal(model.role_id, 'media_journalist');
assert.equal(model.role_scope, 'media_redaksjon');
assert.ok(model.related_people.length >= 8);
assert.ok(model.related_places.some(place => place.id === 'vg_huset'));
assert.ok(model.required_knowledge.place_connections.some(place => place.place_id === 'vg_huset'));
for (const family of [
  'role_world_realism_newsroom_case',
  'role_world_realism_source_protection_handoff',
  'role_world_realism_newsroom_history_go',
  'role_world_realism_newsroom_situated_response',
  'role_world_realism_newsroom_rework',
  'role_world_realism_newsroom_publication',
  'role_world_realism_newsroom_closure'
]) assert.ok(model.mail_integration.recommended_mail_families.includes(family), `missing model family ${family}`);

assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.slice(8).map(step => step.type), ['job', 'people', 'knowledge', 'followup', 'consequence', 'event', 'consequence', 'followup']);
assert.ok(plan.sequence.slice(8).every(step => step.fallback_types.length === 0));

const catalogPaths = {
  job: 'data/Civication/mailFamilies/media/job/media_redaksjon_job.json',
  people: 'data/Civication/mailFamilies/media/people/media_redaksjon_people.json',
  knowledge: 'data/Civication/mailFamilies/media/knowledge/media_redaksjon_knowledge.json',
  followup: 'data/Civication/mailFamilies/media/followup/media_redaksjon_followup.json',
  consequence: 'data/Civication/mailFamilies/media/consequence/media_redaksjon_consequence.json',
  event: 'data/Civication/mailFamilies/media/event/media_redaksjon_event.json'
};
const mails = new Map();
for (const [type, file] of Object.entries(catalogPaths)) {
  const catalog = read(file);
  assert.equal(catalog.mail_type, type);
  for (const mail of catalog.families.flatMap(family => family.mails || [])) {
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, 'media_redaksjon');
    if (mail.id.startsWith('media_redaksjon_realism_')) mails.set(mail.id, mail);
  }
}
assert.equal(mails.size, 9, 'pilot materializes nine authored journalism scenes');

const open = mails.get('media_redaksjon_realism_case_open_001');
assert.ok(open.effects.work_object_ops.some(op => op.op === 'create' && op.work_object.work_object_id === 'media_redaksjon_publication_case_001'));
const handoff = mails.get('media_redaksjon_realism_source_handoff_001');
assert.equal(handoff.work_context.handoff_to_actor_id, 'deskredaktor_jonas');
assert.ok(handoff.authority_context.authority_rules.some(rule => rule.action_id === 'promise_anonymity_personally' && rule.authority === 'forbidden'));
assert.deepEqual(handoff.choices[0].effects.social_standing_ops.map(op => op.audience_id), ['professional:deskredaktor_jonas', 'manager:vaktsjef_lina', 'source:kilde_ellen']);
assert.deepEqual(handoff.choices[1].effects.social_standing_ops.map(op => op.audience_id), ['source:kilde_ellen', 'professional:deskredaktor_jonas', 'manager:vaktsjef_lina']);

const editorResponse = mails.get('media_redaksjon_realism_editor_trust_response_001');
const sourceResponse = mails.get('media_redaksjon_realism_source_trust_response_001');
assert.deepEqual(editorResponse.social_standing_context.requirements, [
  { audience_id: 'professional:deskredaktor_jonas', min: 2 },
  { audience_id: 'manager:vaktsjef_lina', min: 1 },
  { audience_id: 'source:kilde_ellen', max: -1 }
]);
assert.deepEqual(sourceResponse.social_standing_context.requirements, [
  { audience_id: 'source:kilde_ellen', min: 2 },
  { audience_id: 'professional:deskredaktor_jonas', max: -2 },
  { audience_id: 'manager:vaktsjef_lina', max: -1 }
]);

const knowledge = mails.get('media_redaksjon_realism_knowledge_vg_001');
assert.equal(knowledge.interaction_mode, 'task');
assert.equal(knowledge.task_payload.place_id, 'vg_huset');
assert.ok(knowledge.task_contract.evidence_refs.includes('data/quiz/media/vg_huset_sets.json'));
const rework = mails.get('media_redaksjon_realism_rework_draft_001');
assert.equal(rework.work_context.rework_of_scene_id, 'media_redaksjon_realism_case_open_001');
assert.deepEqual(rework.choices[2].affordance.history_go.task_mail_ids, ['media_redaksjon_realism_knowledge_vg_001']);
const publish = mails.get('media_redaksjon_realism_publish_001');
assert.ok(publish.authority_context.authority_rules.some(rule => rule.action_id === 'publish_article' && rule.authority === 'approval_required'));
assert.ok(publish.authority_context.authority_rules.some(rule => rule.action_id === 'change_approved_premise_unilaterally' && rule.authority === 'forbidden'));
const correction = mails.get('media_redaksjon_realism_audience_correction_001');
assert.equal(correction.work_context.rework_of_scene_id, 'media_redaksjon_realism_publish_001');
assert.ok(correction.choices[0].effects.social_standing_ops.some(op => op.audience_id === 'public:fjordby_lesere' && op.delta > 0));
const closure = mails.get('media_redaksjon_realism_case_close_001');
assert.ok(closure.choices[0].effects.work_object_ops.some(op => op.op === 'transition' && op.to_status === 'completed'));

const career = matrix.worlds.find(row => row.key === 'media/media_redaksjon');
assert.ok(career);
assert.equal(career.status, 'playable');
assert.deepEqual(career.audit.missing_components, []);

execFileSync(process.execPath, ['tests/civication-media-redaksjon-rollout-playability.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-role-world-contract.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });

console.log('civication-media-redaksjon-role-world-realism-pilot.test.js: PASS');
