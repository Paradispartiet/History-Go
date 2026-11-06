#!/usr/bin/env node
'use strict';
// Lillebekk: downstream followups must preserve the same evidence-led planning
// work case while never granting a municipal adviser formal decision authority.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const factory = require(path.join(root,'js/Civication/core/civicationWorkWorld.js'));
const objectId = 'by_radgiver_lillebekk_early_analysis_case_001';
const files = [
 'data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json',
 'data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json',
 'data/Civication/mailFamilies/by/conflict/by_radgiver_plan_conflict.json',
 'data/Civication/mailFamilies/by/followup/by_radgiver_plan_followup.json'
];
const byId = new Map(files.flatMap(file =>
 read(file).families.flatMap(f => f.mails || [])
).map(m=>[m.id,m]));
const first = [
 'by_areal_job_plankart_001',
 'by_radgiver_job_areal_001',
 'by_areal_people_utbygger_001',
 'by_areal_conflict_gront_001'
];
const followup = Array.from({length:8},(_,i) =>
 'by_areal_followup_'+String(i+1).padStart(3,'0')
);
const plan=read('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
assert.equal(plan.sequence[6].type,'followup');
assert.ok(plan.sequence[6].allowed_families.includes('oppfolging_lillebekk'),
 'next canonical followup still routes to the eight existing scenes');
const family=read(files[3]).families.find(x=>x.id==='oppfolging_lillebekk');
assert.deepEqual(family.mails.map(m=>m.id),followup,
 'all eight ordinary day-to-day followups are covered, not a cherry-picked new engine');
let choiceCount=0;
for (const id of [...first,...followup]) {
 const mail=byId.get(id);
 assert.ok(mail,id);
 assert.equal(mail.role_scope,'by_radgiver_plan');
 assert.deepEqual(mail.work_context.object_ids,[objectId],id);
 assert.equal(mail.work_context.institution_id,'oslo_kommune_planavdeling_001');
 const op=mail.effects?.work_object_ops?.find(x=>x.op==='upsert');
 assert.ok(op,id+' upserts shared case');
 assert.equal(op.work_object.work_object_id,objectId);
 assert.equal(op.work_object.role_scope,'by_radgiver_plan');
 for(const choice of mail.choices){
  const ops=choice.effects?.work_object_ops;
  assert.ok(ops?.some(x=>x.op==='transition' && x.work_object_id===objectId));
  assert.ok(ops?.some(x=>x.op==='add_flag' && x.work_object_id===objectId));
  assert.ok(!ops.some(x=>x.op==='close'||['approved','granted','closed'].includes(x.to_status)),
    id+'/'+choice.id+' cannot fabricate plan adoption or managerial approval');
  choiceCount++;
 }
}
assert.equal(choiceCount,24,'four first scenes 8 choices + eight followups 16 choices');
assert.match(byId.get('by_areal_followup_004').choices[0].reply,/foreslår/);
assert.match(byId.get('by_areal_followup_005').choices[0].reply,/planjuridisk vurdering/);
assert.match(byId.get('by_areal_followup_006').choices[1].reply,/ikke-bindende/);

function store(initial={}) {
 let current=JSON.parse(JSON.stringify(initial));
 function merge(a,b) {
   const out={...a};
   for(const [key,value] of Object.entries(b||{})){
     out[key]=value&&typeof value==='object'&&!Array.isArray(value)
       ? merge(out[key]||{},value):value;
   }
   return out;
 }
 return {getState(){return JSON.parse(JSON.stringify(current))},
   setState(patch){current=merge(current,patch);return this.getState();}};
}
function play(adapter,id,choiceId,i) {
 const scene=byId.get(id),choice=scene.choices.find(x=>x.id===choiceId);
 assert.ok(choice,id+'/'+choiceId);
 const context={scene_id:id,choice_id:choiceId,at:'2026-11-'+String(i+5).padStart(2,'0')+'T10:00:00Z'};
 adapter.applyOperations(scene.effects.work_object_ops,context);
 adapter.applyOperations(choice.effects.work_object_ops,context);
 return adapter.getWorkObject(objectId);
}
function run(ids,letters){
 const state=store({unrelated:{kept:true}}),adapter=factory.createAdapter(state);
 let historyCount=0;
 ids.forEach((id,i)=>{
  const obj=play(adapter,id,letters[i],i);
  assert.ok(obj.history.length>historyCount,'every delivered choice has a durable trace');
  assert.equal(obj.closed_at,null,'unapproved planning cases must stay open');
  historyCount=obj.history.length;
 });
 return {state,adapter,object:adapter.getWorkObject(objectId)};
}
const professional=run([...first,...followup],Array(12).fill('A'));
const accelerated=run([...first,...followup],Array(12).fill('B'));
assert.equal(professional.object.role_scope,'by_radgiver_plan');
assert.equal(professional.object.institution_id,'oslo_kommune_planavdeling_001');
assert.equal(professional.object.status,'awaiting_review');
assert.equal(accelerated.object.status,'needs_review');
assert.deepEqual(professional.state.getState().unrelated,{kept:true});
assert.notDeepEqual(professional.object.flags,accelerated.object.flags);
for(const flag of ['map_conflict_written_for_review','green_corridor_draft_requirement_proposed',
 'participation_comments_evaluated','sun_study_requested','stormwater_condition_proposed',
 'school_route_pre_occupancy_condition_proposed','developer_signal_written_clarification_requested',
 'school_route_explicit_assessment_proposed','material_risks_stated_for_politics']) {
 assert.ok(professional.object.flags.includes(flag),'first choices and later review retained: '+flag);
}
for(const flag of ['map_conflict_not_verified','developer_informal_signal_to_correct',
 'participation_record_missing','sun_estimate_not_verified','stormwater_unsecured_in_plan',
 'school_route_timing_unverified','developer_signal_unrecorded',
 'school_route_deferred_unsecured','material_risks_not_explicit']) {
 assert.ok(accelerated.object.flags.includes(flag),'risky workflow persists: '+flag);
}
assert.equal(professional.object.outcome,null,'a staff recommendation is not a political outcome');
const reload=factory.createAdapter(store(professional.state.getState()));
assert.deepEqual(reload.getWorkObject(objectId),professional.object,'all twelve decisions survive save/reload');
const before=reload.getWorkObject(objectId).history.length;
play(reload,followup[2],'A',6);
assert.equal(reload.getWorkObject(objectId).history.length,before,
 'repeat deliveries are idempotent');
const late=factory.createAdapter(store());
play(late,followup[3],'B',0);
assert.equal(late.listWorkObjectsForRole('by_radgiver_plan').length,1);
assert.ok(!late.getWorkObject(objectId).flags.includes('map_conflict_written_for_review'),
 'out-of-order followup cannot manufacture earlier player decisions');
assert.ok(late.getWorkObject(objectId).flags.includes('stormwater_unsecured_in_plan'));
// Existing later formal administrative approval has its own role-gated case;
// this content patch must not change its identity or authority boundary.
const formal=read('data/Civication/mailFamilies/by/event/by_radgiver_plan_event.json')
 .families.flatMap(f=>f.mails||[]).find(m=>m.id==='by_radgiver_realism_formal_send_001');
assert.deepEqual(formal.work_context.object_ids,['by_radgiver_lillebekk_plan_case_001']);
assert.ok(formal.choices.some(c=>c.authority_action?.intent==='execute'));
console.log('Lillebekk followups: 12 scenes, 24 tracked choices, 8 new feedback points, persistent divergence and no invented approval');
