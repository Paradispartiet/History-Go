#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const roleScope = 'historie_arkiv_og_dokumentasjon';
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const workWorldFactory = require(path.join(root, 'js/Civication/core/civicationWorkWorld.js'));

function mail(type, id) {
  const catalog = readJson(`data/Civication/mailFamilies/historie/${type}/${roleScope}_${type}.json`);
  return catalog.families.flatMap(family => family.mails || []).find(row => row.id === id);
}

function makeState(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  const deepMerge = (target, patch) => {
    const out = { ...(target || {}) };
    for (const [key, value] of Object.entries(patch || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMerge(out[key] || {}, value);
      else out[key] = value;
    }
    return out;
  };
  return {
    getState() { return JSON.parse(JSON.stringify(state)); },
    setState(patch) { state = deepMerge(state, patch); return this.getState(); }
  };
}

function applyScene(adapter, scene, choiceId, at) {
  const selected = scene.choices.find(choice => choice.id === choiceId);
  assert.ok(selected, `${scene.id} has choice ${choiceId}`);
  adapter.applyOperations(scene.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  adapter.applyOperations(selected.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
}

const deliveryId = 'historie_arkiv_sak_leveranse_001';
const accessId = 'historie_arkiv_sak_innsyn_001';
const digitalId = 'historie_arkiv_sak_digital_bevaring_001';

const job = mail('job', 'historie_arkiv_job_mottak_001');
const people = mail('people', 'historie_arkiv_people_systemkontekst_001');
const micro = mail('micro', 'historie_arkiv_micro_minimumsmetadata_001');
const conflict = mail('conflict', 'historie_arkiv_conflict_innsyn_001');
const followup = mail('followup', 'historie_arkiv_followup_innsyn_001');
const event = mail('event', 'historie_arkiv_event_formatrisiko_001');
const consequence = mail('consequence', 'historie_arkiv_consequence_migrering_001');

assert.deepEqual(job.work_context.object_ids, [deliveryId]);
assert.deepEqual(people.work_context.object_ids, [deliveryId]);
assert.deepEqual(micro.work_context.object_ids, [deliveryId]);
assert.deepEqual(conflict.work_context.object_ids, [accessId]);
assert.deepEqual(followup.work_context.object_ids, [accessId]);
assert.deepEqual(event.work_context.object_ids, [digitalId]);
assert.deepEqual(consequence.work_context.object_ids, [digitalId]);
assert.equal(job.effects.work_object_ops[0].event_id, people.effects.work_object_ops[0].event_id);
assert.equal(job.effects.work_object_ops[0].event_id, micro.effects.work_object_ops[0].event_id);
assert.equal(conflict.effects.work_object_ops[0].event_id, followup.effects.work_object_ops[0].event_id);
assert.equal(event.effects.work_object_ops[0].event_id, consequence.effects.work_object_ops[0].event_id);
assert.equal(job.effects.work_object_ops[0].work_object.shared, true, 'delivery is reusable shared work-object state');

const state = makeState({ untouched: { sentinel: 1 } });
const adapter = workWorldFactory.createAdapter(state);

applyScene(adapter, job, 'A', '2026-08-23T08:00:00.000Z');
applyScene(adapter, people, 'A', '2026-08-23T09:00:00.000Z');
applyScene(adapter, micro, 'A', '2026-08-23T14:00:00.000Z');
const delivery = adapter.getWorkObject(deliveryId);
assert.equal(delivery.status, 'in_progress');
assert.equal(delivery.phase, 'minimumsmetadata_operativt');
assert.ok(delivery.flags.includes('systemspor_sikret'));
assert.ok(delivery.flags.includes('minimumsmetadata_operativt'));
assert.ok(!delivery.flags.includes('proveniens_uavklart'));
assert.equal(delivery.shared, true);
assert.ok(delivery.history.length >= 8, 'same delivery accumulates multi-scene history');

applyScene(adapter, conflict, 'A', '2026-08-23T10:00:00.000Z');
assert.equal(adapter.getWorkObject(accessId).status, 'awaiting_decision');
applyScene(adapter, followup, 'A', '2026-08-23T16:00:00.000Z');
const access = adapter.getWorkObject(accessId);
assert.equal(access.status, 'closed');
assert.equal(access.phase, 'closed');
assert.equal(access.outcome, 'utleveringspakke_verifisert_mot_autorisert_beslutning');

applyScene(adapter, event, 'A', '2026-08-23T13:00:00.000Z');
applyScene(adapter, consequence, 'A', '2026-08-23T17:00:00.000Z');
const digital = adapter.getWorkObject(digitalId);
assert.equal(digital.status, 'partially_resolved');
assert.equal(digital.phase, 'ett_autentisitetsavvik_ulost');
assert.ok(digital.flags.includes('originalbitstrom_bevart'));
assert.ok(digital.flags.includes('ett_autentisitetsavvik_ulost'));
assert.ok(!digital.flags.includes('to_hashavvik'));
assert.equal(digital.closed_at, null, 'unresolved authenticity stays visibly open');

const world = adapter.getWorldState();
assert.ok(world.active_object_ids.includes(deliveryId));
assert.ok(world.active_object_ids.includes(digitalId));
assert.ok(!world.active_object_ids.includes(accessId));
assert.deepEqual(state.getState().untouched, { sentinel: 1 });

// Replay of the same later scene must not duplicate work history.
const historyCount = digital.history.length;
applyScene(adapter, consequence, 'A', '2026-08-23T17:00:00.000Z');
assert.equal(adapter.getWorkObject(digitalId).history.length, historyCount);

const knowledgeCatalog = readJson(`data/Civication/mailFamilies/historie/knowledge/${roleScope}_knowledge.json`);
const knowledgeMails = knowledgeCatalog.families.flatMap(family => family.mails || []);
const placeTask = knowledgeMails.find(row => row.id === 'historie_arkiv_knowledge_akershus_001');
const personTask = knowledgeMails.find(row => row.id === 'historie_arkiv_knowledge_knut_alvsson_001');
assert.ok(placeTask && personTask);
assert.deepEqual(placeTask.task_payload.return_context.related_person_ids, ['knut_alvsson', 'ole_hoiland', 'reidar_haaland']);
assert.equal(personTask.task_payload.task_kind, 'history_go_person');
assert.equal(personTask.task_payload.target_type, 'person');
assert.equal(personTask.task_payload.person_id, 'knut_alvsson');
assert.equal(personTask.task_payload.completion_mode, 'read_profile');

const knut = readJson('data/people/historie/oslo/akershus_festning/knut_alvsson.json')[0];
const ole = readJson('data/people/historie/oslo/akershus_festning/ole_hoiland.json')[0];
const reidar = readJson('data/people/historie/oslo/akershus_festning/reidar_haaland.json')[0];
assert.equal(knut.id, 'knut_alvsson');
assert.equal(ole.id, 'ole_hoiland');
assert.equal(reidar.id, 'reidar_haaland');
for (const person of [knut, ole, reidar]) {
  assert.equal(person.placeId, 'akershus_festning');
  assert.equal(person.category, 'historie');
}

global.window = global;
global.document = undefined;
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
vm.runInThisContext(fs.readFileSync(path.join(root, 'js/Civication/core/civicationTaskEngine.js'), 'utf8'));
const normalized = global.CivicationTaskEngine.normalizeHistoryGoTaskPayload(personTask.task_payload);
assert.equal(global.CivicationTaskEngine.isHistoryGoTaskPayload(normalized), true);
assert.equal(normalized.person_id, 'knut_alvsson');
assert.equal(normalized.target_id, 'knut_alvsson');

const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
for (const [sceneId, objectId] of [
  [job.id, deliveryId], [people.id, deliveryId], [micro.id, deliveryId],
  [conflict.id, accessId], [followup.id, accessId], [event.id, digitalId], [consequence.id, digitalId]
]) {
  const entry = registry.entries.find(row => row.id === sceneId);
  assert.ok(entry, `${sceneId} compiled`);
  assert.deepEqual(entry.scene.work_context.object_ids, [objectId]);
  assert.ok(entry.scene.effects.work_object_ops.length >= 1);
  assert.ok(entry.compatibility_projection.effects.work_object_ops.length >= 1);
}
const compiledPersonTask = registry.entries.find(row => row.id === personTask.id);
assert.ok(compiledPersonTask);
assert.equal(compiledPersonTask.scene.interaction_mode, 'task');
assert.equal(compiledPersonTask.scene.task_contract.task_id, 'historie_arkiv_history_go_knut_alvsson');
assert.equal(compiledPersonTask.compatibility_projection.task_payload.person_id, 'knut_alvsson');

console.log('✓ History archive persistent cases survive across scenes, close/retain uncertainty correctly, and reuse canonical History Go People');
