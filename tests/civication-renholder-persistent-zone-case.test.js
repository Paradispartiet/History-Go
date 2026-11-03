#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const workWorld = require(path.join(root, 'js/Civication/core/civicationWorkWorld.js'));

const objectId = 'renholder_fellesareal_kvalitetslogg_001';
const files = [
  'data/Civication/mailFamilies/naeringsliv/job/renholder_job.json',
  'data/Civication/mailFamilies/naeringsliv/followup/renholder_followup.json'
];
const mails = new Map(files.flatMap(file =>
  read(file).families.flatMap(family => family.mails || [])
).map(mail => [mail.id, mail]));
const sequence = [
  'job_renholder_week1_room_looked_clean',
  'job_renholder_week1_twelve_minutes_twenty_needed',
  'job_renholder_week1_wrong_chemical_surface',
  'renholder_followup_003',
  'job_renholder_week1_invisible_work'
];
for (const id of sequence) {
  const scene = mails.get(id);
  assert.ok(scene, id + ' må finnes i eksisterende scener');
  assert.deepEqual(scene.work_context.object_ids, [objectId]);
  assert.equal(scene.role_scope, 'renholder');
  assert.ok(scene.effects.work_object_ops.some(op => op.op === 'upsert'
    && op.work_object.work_object_id === objectId));
  assert.ok(scene.choices.length >= 3);
  for (const choice of scene.choices) {
    const ops = choice.effects.work_object_ops;
    assert.ok(ops.some(op => op.op === 'transition' && op.work_object_id === objectId));
    assert.ok(ops.some(op => op.op === 'add_flag' && op.work_object_id === objectId));
    assert.equal(Object.hasOwn(choice.effects, 'health_outcome'), false,
      'kan ikke finne på helseskade fra metodevalget');
  }
}

function makeState(initial = {}) {
  let current = JSON.parse(JSON.stringify(initial));
  function merge(a, b) {
    const out = { ...a };
    for (const [key, value] of Object.entries(b || {})) {
      out[key] = value && typeof value === 'object' && !Array.isArray(value)
        ? merge(out[key] || {}, value) : value;
    }
    return out;
  }
  return {
    getState() { return JSON.parse(JSON.stringify(current)); },
    setState(patch) { current = merge(current, patch); return this.getState(); }
  };
}

function enact(adapter, sceneId, choiceId, index) {
  const scene = mails.get(sceneId);
  const choice = scene.choices.find(item => item.id === choiceId);
  assert.ok(choice, sceneId + '/' + choiceId);
  const at = '2026-11-' + String(3 + index).padStart(2, '0') + 'T10:00:00Z';
  const context = { scene_id: sceneId, choice_id: choiceId, at };
  adapter.applyOperations(scene.effects.work_object_ops, context);
  adapter.applyOperations(choice.effects.work_object_ops, context);
  return adapter.getWorkObject(objectId);
}

const goodStore = makeState();
const good = workWorld.createAdapter(goodStore);
let prevEvents = 0;
for (const [index, id] of sequence.entries()) {
  const choice = id === 'renholder_followup_003' ? 'C' : 'A';
  const object = enact(good, id, choice, index);
  assert.equal(object.work_object_id, objectId);
  assert.equal(object.role_scope, 'renholder');
  assert.ok(object.history.length > prevEvents, 'valget må etterlate konkret historikk');
  prevEvents = object.history.length;
}
const goodResult = good.getWorkObject(objectId);
assert.equal(goodResult.status, 'awaiting_review', 'sammendrag sendt er ikke ledergodkjennelse');
assert.ok(goodResult.flags.includes('time_deviation_reported'));
assert.ok(goodResult.flags.includes('touchpoints_issue_escalated'));
assert.ok(goodResult.flags.includes('professional_week_summary_submitted'));
assert.equal(goodResult.closed_at, null, 'kan ikke lukke arbeid uten bekreftet kontroll');
const persisted = JSON.parse(JSON.stringify(goodStore.getState()));
const restored = workWorld.createAdapter(makeState(persisted));
assert.deepEqual(restored.getWorkObject(objectId), goodResult, 'faktisk arbeid må overleve lagring');
const eventsBeforeReplay = goodResult.history.length;
enact(restored, sequence[0], 'A', 0);
assert.equal(restored.getWorkObject(objectId).history.length, eventsBeforeReplay,
  'samme allerede registrerte valg skal være idempotent');

const other = workWorld.createAdapter(makeState());
for (const [index, id] of sequence.entries()) enact(other, id, 'B', index);
const otherResult = other.getWorkObject(objectId);
assert.equal(otherResult.status, 'needs_review');
assert.ok(otherResult.flags.includes('touchpoints_not_verified'));
assert.ok(otherResult.flags.includes('time_pressure_hygiene_gap'));
assert.ok(otherResult.flags.includes('chemical_surface_risk_requires_check'));
assert.equal(otherResult.flags.includes('time_deviation_reported'), false);
assert.notDeepEqual(goodResult.flags, otherResult.flags,
  'ulike valg må gi forskjellige, vedvarende spor i samme sak');
assert.ok(otherResult.history.every(event => !/sick|illness|diagnos/i.test(event.note || '')),
  'risiko er ikke deterministisk sykdom');

// A later mail may arrive before the first catalog item. Upsert is safe and
// must not silently fabricate earlier actions or require a new game engine.
const outOfOrder = workWorld.createAdapter(makeState());
const lateObject = enact(outOfOrder, 'job_renholder_week1_wrong_chemical_surface', 'C', 0);
assert.equal(lateObject.status, 'deviation_reported');
assert.equal(lateObject.flags.includes('touchpoints_priority_recorded'), false);
assert.equal(outOfOrder.listWorkObjectsForRole('renholder').length, 1);

console.log('Civication Renholder: five played mail decisions share one persisted, branching work object');
