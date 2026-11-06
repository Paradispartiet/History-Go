#!/usr/bin/env node
'use strict';
// A planning adviser may recommend an amendment but not approve a plan.
// Verify playable first-week scenes, persistent evidence and alternate paths.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const workWorld = require(path.join(root,'js/Civication/core/civicationWorkWorld.js'));
const objectId='by_radgiver_lillebekk_early_analysis_case_001';
const sources=[
 'data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json',
 'data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json',
 'data/Civication/mailFamilies/by/conflict/by_radgiver_plan_conflict.json'
];
const scenes = new Map(sources.flatMap(f=>read(f).families.flatMap(fam=>fam.mails||[])).map(m=>[m.id,m]));
const ids=['by_areal_job_plankart_001','by_radgiver_job_areal_001',
 'by_areal_people_utbygger_001','by_areal_conflict_gront_001'];
const plan=read('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
for (const [idx, family] of [[0,'plankart_og_bestemmelser'],[3,'arealbruk_og_prioritering'],
 [4,'aktorer_og_press'],[5,'grontdrag_skolevei_stoy']]) {
 assert.ok(plan.sequence[idx].allowed_families.includes(family),
   'case scene family remains reachable at planned step '+(idx+1));
}
for(const sceneId of ids) {
 const scene=scenes.get(sceneId);
 assert.ok(scene,sceneId+' is existing playable mail');
 assert.equal(scene.role_scope,'by_radgiver_plan');
 assert.deepEqual(scene.work_context.object_ids,[objectId]);
 assert.equal(scene.work_context.institution_id,'oslo_kommune_planavdeling_001');
 assert.ok(scene.effects.work_object_ops.some(op=>op.op==='upsert' &&
   op.work_object.work_object_id===objectId));
 assert.ok(scene.choices.length>=2);
 for(const choice of scene.choices) {
   const ops=choice.effects.work_object_ops;
   assert.ok(ops.some(op=>op.op==='transition'&&op.work_object_id===objectId),
     sceneId+'/'+choice.id+' persists decision');
   assert.ok(ops.some(op=>op.op==='add_flag'&&op.work_object_id===objectId),
     sceneId+'/'+choice.id+' persists evidence');
   assert.ok(!ops.some(op=>op.op==='close'||['approved','granted','closed'].includes(op.to_status)),
     'no planning decision may fabricate formal approval');
 }
}
const developer=scenes.get('by_areal_people_utbygger_001');
assert.match(developer.choices.find(c=>c.id==='B').reply,/ikke-bindende/);
assert.match(developer.choices.find(c=>c.id==='B').feedback,/ikke brukes som kommunalt forhåndstilsagn/);
const corridor=scenes.get('by_areal_conflict_gront_001');
assert.match(corridor.choices.find(c=>c.id==='A').reply,/anbefaling/);
assert.match(corridor.choices.find(c=>c.id==='A').feedback,/ikke vedtatt/);
assert.match(corridor.choices.find(c=>c.id==='B').feedback,/uavklart/);

function state(initial={}) {
 let current=JSON.parse(JSON.stringify(initial));
 const merge=(a,b)=>Object.entries(b||{}).reduce((out,[k,v])=>{
   out[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(out[k]||{},v):v;return out;
 },{...a});
 return {getState(){return JSON.parse(JSON.stringify(current))},
   setState(patch){current=merge(current,patch);return this.getState();}};
}
function play(adapter,sceneId,choiceId,index) {
 const scene=scenes.get(sceneId);const choice=scene.choices.find(c=>c.id===choiceId);
 assert.ok(choice);
 const ctx={scene_id:sceneId,choice_id:choiceId,
   at:'2026-11-'+String(4+index).padStart(2,'0')+'T08:00:00Z'};
 adapter.applyOperations(scene.effects.work_object_ops,ctx);
 adapter.applyOperations(choice.effects.work_object_ops,ctx);
 return adapter.getWorkObject(objectId);
}
function run(choices) {
 const st=state({unrelated:{untouched:true}});const adapter=workWorld.createAdapter(st);
 let prev=0;
 ids.forEach((sceneId,i)=>{
   const obj=play(adapter,sceneId,choices[i],i);
   assert.equal(obj.work_object_id,objectId);
   assert.equal(obj.role_scope,'by_radgiver_plan');
   assert.ok(obj.history.length>prev,'each played scene must add history');
   prev=obj.history.length;
 });
 return {st,adapter,obj:adapter.getWorkObject(objectId)};
}
const documented=run(['A','A','A','A']);
assert.equal(documented.obj.status,'awaiting_review',
 'last action is proposal awaiting professional/legal review');
for(const flag of [
 'map_conflict_written_for_review','green_passage_recommendation_logged',
 'developer_formal_request_pending','green_corridor_draft_requirement_proposed'
])assert.ok(documented.obj.flags.includes(flag),flag);
assert.equal(documented.obj.closed_at,null);
assert.equal(documented.obj.outcome,null);
const reloaded=workWorld.createAdapter(state(documented.st.getState()));
assert.deepEqual(reloaded.getWorkObject(objectId),documented.obj);
const before=reloaded.getWorkObject(objectId).history.length;
play(reloaded,ids[0],'A',0);
assert.equal(reloaded.getWorkObject(objectId).history.length,before,
 'replaying an already-recorded choice is idempotent');
const unverified=run(['B','B','B','B']);
assert.equal(unverified.obj.status,'needs_review');
for(const flag of [
 'map_conflict_not_verified','area_compromise_unverified',
 'developer_informal_signal_to_correct','green_corridor_maintenance_only_unverified'
])assert.ok(unverified.obj.flags.includes(flag),flag);
assert.notDeepEqual(documented.obj.flags,unverified.obj.flags);
assert.deepEqual(unverified.st.getState().unrelated,{untouched:true});
assert.equal(unverified.obj.closed_at,null);
const late=workWorld.createAdapter(state());
play(late,ids[3],'A',3);
assert.ok(!late.getWorkObject(objectId).flags.includes('map_conflict_written_for_review'),
 'out-of-order delivery must not invent prior actions');
assert.equal(late.listWorkObjectsForRole('by_radgiver_plan').length,1);
// Formal approval belongs to a separate later, permission-gated work object.
const pilot=read('data/Civication/mailFamilies/by/event/by_radgiver_plan_event.json');
const formal=pilot.families.flatMap(f=>f.mails||[]).find(m=>m.id==='by_radgiver_realism_formal_send_001');
assert.ok(formal);
assert.deepEqual(formal.work_context.object_ids,['by_radgiver_lillebekk_plan_case_001']);
assert.notEqual(objectId,formal.work_context.object_ids[0]);
assert.ok(formal.choices.some(c=>c.authority_action?.intent==='execute'));
console.log('By-rådgiver Lillebekk: 4 playable early scenes, 8 persistent choice paths, no unauthorized plan approval');
