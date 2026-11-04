#!/usr/bin/env node
'use strict';
// Real existing intro mail decisions: no parallel story engine and no invented
// authorization or later supervisor approval.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const WorkWorld = require(path.join(root, 'js/Civication/core/civicationWorkWorld.js'));
const objectId = 'film_tv_pa_intro_coordination_case_001';
const files = [
  'data/Civication/mailFamilies/film_tv/job/produksjonsassistent_job.json',
  'data/Civication/mailFamilies/film_tv/people/produksjonsassistent_people.json',
  'data/Civication/mailFamilies/film_tv/conflict/produksjonsassistent_conflict.json',
  'data/Civication/mailFamilies/film_tv/event/produksjonsassistent_event.json'
];
const scenes = files.flatMap(file => read(file).families.flatMap(f => f.mails || []));
const byId = new Map(scenes.map(scene => [scene.id, scene]));
const ids = [
  'film_tv_pa_job_to_call_sheet',
  'film_tv_pa_people_line_hasteonske',
  'film_tv_pa_conflict_sperret_sideinngang',
  'film_tv_pa_event_scene_rekkefolge_endret'
];
const plan = read('data/Civication/mailPlans/film_tv/produksjonsassistent_plan.json');
assert.deepEqual(plan.sequence.slice(0, 4).map(step => step.allowed_families[0]),
  ['produksjonsassistent_call_sheet','produksjonsassistent_settfolk',
   'produksjonsassistent_lokasjonskonflikt','produksjonsassistent_avvikshendelse'],
  'four existing operational steps remain reachable in canonical mail plan');
assert.equal(plan.sequence[4].allowed_families[0], 'role_world_rollout_pa_shoot_day_case',
  'later shoot day keeps its distinct professional case');
for (const id of ids) {
  const scene = byId.get(id);
  assert.ok(scene, id + ' must be an existing canonical intro mail');
  assert.equal(scene.role_scope, 'produksjonsassistent');
  assert.deepEqual(scene.work_context?.object_ids, [objectId]);
  assert.equal(scene.work_context?.institution_id, 'film_tv_produksjonsenhet_001');
  assert.ok(scene.effects?.work_object_ops?.some(op =>
    op.op === 'upsert' && op.work_object?.work_object_id === objectId));
  for (const choice of scene.choices) {
    const ops = choice.effects?.work_object_ops || [];
    assert.ok(ops.some(op => op.op === 'transition' && op.work_object_id === objectId),
      id + '/' + choice.id + ' changes same work object');
    assert.ok(ops.some(op => op.op === 'add_flag' && op.work_object_id === objectId),
      id + '/' + choice.id + ' leaves a durable, distinct trace');
    assert.ok(!ops.some(op => op.op === 'close' || op.to_status === 'approved' ||
      op.to_status === 'granted' || op.to_status === 'closed'),
      id + '/' + choice.id + ' cannot grant authority or assume the case is closed');
  }
}

function store(initial = {}) {
  let value = JSON.parse(JSON.stringify(initial));
  function merge(a,b) {
    const next = {...a};
    for (const [k,v] of Object.entries(b || {})) next[k] =
      v && typeof v === 'object' && !Array.isArray(v) ? merge(next[k] || {},v) : v;
    return next;
  }
  return {
    getState() { return JSON.parse(JSON.stringify(value)); },
    setState(patch) { value=merge(value,patch); return this.getState(); }
  };
}
function play(adapter, sceneId, choiceId, index) {
  const scene=byId.get(sceneId);
  const choice=scene.choices.find(c => c.id === choiceId);
  assert.ok(choice, sceneId + '/' + choiceId);
  const ctx={scene_id:sceneId,choice_id:choiceId,
    at:'2026-11-'+String(3+index).padStart(2,'0')+'T09:00:00Z'};
  adapter.applyOperations(scene.effects.work_object_ops,ctx);
  adapter.applyOperations(choice.effects.work_object_ops,ctx);
  return adapter.getWorkObject(objectId);
}
function run(path) {
  const state=store();
  const adapter=WorkWorld.createAdapter(state);
  const histories=[];
  path.forEach((choice,i)=>{
    const obj=play(adapter,ids[i],choice,i);
    assert.equal(obj.work_object_id,objectId);
    assert.equal(obj.role_scope,'produksjonsassistent');
    assert.ok(obj.history.length > (histories.at(-1) || 0),'every decision adds observed work history');
    histories.push(obj.history.length);
  });
  return {state,adapter,obj:adapter.getWorkObject(objectId)};
}
const careful=run(['A','A','A','A']);
assert.equal(careful.obj.status,'awaiting_confirmation',
  'PA records explicit receipt requests, not assumed confirmations');
for(const flag of [
  'call_version_approval_requested','alternate_access_approval_requested',
  'crew_waiting_for_safety_clearance','decision_broadcast_receipts_requested'
]) assert.ok(careful.obj.flags.includes(flag),flag);
assert.ok(!careful.obj.flags.some(x=>/approved|authorized|safety_cleared/.test(x)),
  'an assistant cannot produce approval or safety clearance');
assert.equal(careful.obj.closed_at,null);
const stored=careful.state.getState();
const restored=WorkWorld.createAdapter(store(stored));
assert.deepEqual(restored.getWorkObject(objectId),careful.obj,'reload preserves exact case');
const before=restored.getWorkObject(objectId).history.length;
play(restored,ids[0],'A',0);
assert.equal(restored.getWorkObject(objectId).history.length,before,
  'replaying a logged user choice is idempotent');
const rushed=run(['B','B','B','B']);
assert.equal(rushed.obj.status,'needs_reconciliation');
for(const flag of [
  'unapproved_call_version_sent','access_change_not_authorized',
  'unauthorized_entry_attempt_reported','untracked_verbal_delivery'
]) assert.ok(rushed.obj.flags.includes(flag),flag);
assert.notDeepEqual(careful.obj.flags,rushed.obj.flags);
assert.equal(rushed.obj.closed_at,null);
assert.ok(rushed.obj.history.some(x=>x.note?.includes('ikke godkjent')),
  'unapproved access is described as risk, never magically authorized');
// A later inbox item may be delivered before the first one; a repeated upsert
// must not fabricate previous choices or create duplicate parallel cases.
const late=WorkWorld.createAdapter(store());
play(late,ids[2],'A',2);
assert.ok(!late.getWorkObject(objectId).flags.includes('call_version_approval_requested'));
assert.equal(late.listWorkObjectsForRole('produksjonsassistent').length,1);
// Existing advanced rollout is a new recorded shoot-day case, never overwritten.
const advanced=byId.get('film_tv_pa_realism_shoot_day_case_open_001');
assert.ok(advanced.effects.work_object_ops.some(op=>op.work_object?.work_object_id ===
  'film_tv_pa_shoot_day_case_001'));
assert.notEqual(advanced.effects.work_object_ops[0].work_object.work_object_id,objectId);
console.log('Produksjonsassistent: four intro decisions persist one case with real divergent traces, no false approval');
