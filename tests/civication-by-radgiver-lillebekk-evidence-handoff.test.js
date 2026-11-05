#!/usr/bin/env node
'use strict';
// A factual handoff, never a synthetic backstory or automatic political approval.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const WorkWorld = require(path.join(root,'js/Civication/core/civicationWorkWorld.js'));
const earlyId='by_radgiver_lillebekk_early_analysis_case_001';
const formalId='by_radgiver_lillebekk_plan_case_001';
const files=[
 'data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json',
 'data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json',
 'data/Civication/mailFamilies/by/conflict/by_radgiver_plan_conflict.json',
 'data/Civication/mailFamilies/by/followup/by_radgiver_plan_followup.json'
];
const mails=new Map(files.flatMap(file=>read(file).families.flatMap(f=>f.mails||[])).map(m=>[m.id,m]));
const open=mails.get('by_radgiver_realism_case_open_001');
const carry=open.effects.work_object_ops[1];
assert.equal(open.effects.work_object_ops[0].op,'create');
assert.deepEqual({op:carry.op,source:carry.from_work_object_id,target:carry.work_object_id},
 {op:'carry_forward_flags',source:earlyId,target:formalId});
assert.ok(carry.flag_mappings.length>=12&&carry.flag_mappings.length<=16);
assert.equal(new Set(carry.flag_mappings.map(m=>m.target_flag)).size,carry.flag_mappings.length);
assert.ok(carry.flag_mappings.every(m=>m.source_flag&&m.target_flag&&
 m.source_flag!==m.target_flag),'source flags must have distinct formal provenance names');

function makeState(initial={}) {
 let value=JSON.parse(JSON.stringify(initial));
 function merge(a,b) {
  const out={...a};
  for (const [key,v] of Object.entries(b||{}))
    out[key]=v&&typeof v==='object'&&!Array.isArray(v)?merge(out[key]||{},v):v;
  return out;
 }
 return {getState(){return JSON.parse(JSON.stringify(value))},
   setState(patch){value=merge(value,patch);return this.getState();}};
}
function enact(adapter,sceneId,choiceId,index){
 const scene=mails.get(sceneId);
 const choice=scene.choices.find(c=>c.id===choiceId);
 assert.ok(choice,sceneId+'/'+choiceId);
 const context={scene_id:sceneId,choice_id:choiceId,at:
   '2026-11-'+String(index+5).padStart(2,'0')+'T10:00:00Z'};
 adapter.applyOperations(scene.effects?.work_object_ops||[],context);
 adapter.applyOperations(choice.effects?.work_object_ops||[],context);
}
const early=[
 'by_areal_job_plankart_001',
 'by_radgiver_job_areal_001',
 'by_areal_people_utbygger_001',
 'by_areal_conflict_gront_001',
 'by_areal_followup_001',
 'by_areal_followup_004',
 'by_areal_followup_005',
 'by_areal_followup_006',
 'by_areal_followup_008'
];
function play(letters) {
 const state=makeState({unrelated:{keep:true}});
 const adapter=WorkWorld.createAdapter(state);
 for(const [i,id] of early.entries())enact(adapter,id,letters[i],i);
 const before=adapter.getWorkObject(earlyId);
 enact(adapter,open.id,'A',early.length);
 return {state,adapter,source:before,target:adapter.getWorkObject(formalId)};
}
const careful=play(Array(early.length).fill('A'));
const risky=play(Array(early.length).fill('B'));
for(const [result,expected] of [
 [careful,['early_map_conflict_documented','early_green_corridor_requirement_proposed',
   'early_participation_evaluated','early_stormwater_condition_proposed',
   'early_school_route_condition_proposed','early_material_risks_visible']],
 [risky,['early_map_conflict_not_verified','early_green_corridor_unsecured',
   'early_participation_record_missing','early_stormwater_unsecured',
   'early_school_route_timing_unverified','early_material_risks_hidden']]
]) {
 for(const flag of expected)assert.ok(result.target.flags.includes(flag),
   flag+' transferred from actual player record');
 assert.equal(result.target.status,'in_progress');
 assert.equal(result.target.closed_at,null);
 assert.equal(result.target.outcome,null);
 assert.ok(result.target.history.some(h=>h.op==='note'&&
   h.note?.includes(earlyId)),'formal case must record provenance of evidence');
 assert.equal(result.target.institution_id,result.source.institution_id);
 assert.equal(result.target.role_scope,result.source.role_scope);
}
assert.ok(!careful.target.flags.includes('early_map_conflict_not_verified'));
assert.ok(!risky.target.flags.includes('early_map_conflict_documented'));
assert.notDeepEqual(careful.target.flags,risky.target.flags,
 'formal planning case must actually differ based on earlier real player decisions');
assert.ok(careful.adapter.getWorkObject(earlyId).flags.includes('map_conflict_written_for_review'),
 'transferring evidence does not erase underlying early work');
const persisted=WorkWorld.createAdapter(makeState(careful.state.getState()));
assert.deepEqual(persisted.getWorkObject(formalId),careful.target,
 'source-grounded formal flags and provenance survive save/reload');
const n=persisted.getWorkObject(formalId).history.length;
persisted.applyOperations([carry],{scene_id:open.id,choice_id:'A',at:'2026-11-14T10:00:00Z'});
assert.equal(persisted.getWorkObject(formalId).history.length,n,'carry-forward is idempotent');
assert.deepEqual(careful.state.getState().unrelated,{keep:true});

// Joining in the middle must not invent previous player actions or evidence.
const noEarly=WorkWorld.createAdapter(makeState());
enact(noEarly,open.id,'A',0);
const orphan=noEarly.getWorkObject(formalId);
assert.ok(orphan,'formal case must remain playable without prior early scenes');
assert.ok(!orphan.flags.some(flag=>flag.startsWith('early_')),
 'no synthetic prior choices are permitted when the earlier work case is absent');
assert.equal(orphan.history.some(e=>e.id.endsWith(':handoff')),false);

const approvalId='by_radgiver_lillebekk_approval_001';
assert.equal(noEarly.getWorkObject(approvalId),null,
 'evidence does not constitute formal managerial approval');
const authority=require(path.join(root,'js/Civication/core/civicationInstitutionAuthority.js'));
const formalEvent=read('data/Civication/mailFamilies/by/event/by_radgiver_plan_event.json')
 .families.flatMap(f=>f.mails||[]).find(m=>m.id==='by_radgiver_realism_formal_send_001');
const execution=formalEvent.choices.find(c=>c.authority_action.intent==='execute');
for(const adapter of [careful.adapter,risky.adapter,noEarly]){
 const decision=authority.evaluate(formalEvent.authority_context,execution.authority_action,
 {role_scope:'by_radgiver_plan',work_world:adapter});
 assert.equal(decision.allowed,false,'early paperwork cannot grant managerial sign-off');
 assert.equal(decision.reason,'approval_required');
}
const registryPath='data/Civication/compiledSceneRegistryV1.json';
const registry=read(registryPath);
const compiled=registry.entries.find(e=>e.id===open.id);
assert.ok(compiled,'formal intro present in compiled registry');
for(const projection of [compiled.scene,compiled.compatibility_projection]){
 const operations=projection.effects.work_object_ops;
 const op=operations.find(x=>x.op==='carry_forward_flags');
 assert.ok(op,'handoff must survive canonical compilation + compatibility projection');
 assert.deepEqual(op.flag_mappings,carry.flag_mappings);
}
console.log('Lillebekk: early evidence enters formal case, diverges by 9 real decisions, reloads, never grants approval');
