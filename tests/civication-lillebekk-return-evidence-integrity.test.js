#!/usr/bin/env node
'use strict';
// A formally approved handoff must not rewrite earlier deferred work into evidence.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const nodePath=require('node:path');
const root=nodePath.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(nodePath.join(root,p),'utf8'));
const job=read('data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json');
const consequence=read('data/Civication/mailFamilies/by/consequence/by_radgiver_plan_consequence.json');
const find=(catalog,id)=>catalog.families.flatMap(f=>f.mails||[]).find(m=>m.id===id);
const opened=find(job,'by_radgiver_realism_case_open_001');
const returned=find(consequence,'by_radgiver_realism_return_to_case_001');
assert.ok(opened && returned);
const deferred=opened.choices.find(c=>c.id==='B');
const deferredOps=deferred.effects.work_object_ops;
const Work=require(nodePath.join(root,'js/Civication/core/civicationWorkWorld.js'));
function stateStore(){
 let state={};
 return {getState(){return JSON.parse(JSON.stringify(state));},
   setState(patch){state={...state,...patch};return this.getState();}};
}
const adapter=Work.createAdapter(stateStore());
const context=(id,choice,day)=>({scene_id:id,choice_id:choice,at:`2026-11-${day}T10:00:00Z`});
adapter.applyOperations(opened.effects.work_object_ops,context(opened.id,'B','06'));
adapter.applyOperations(deferred.effects.work_object_ops,context(opened.id,'B','06'));
const before=adapter.getWorkObject('by_radgiver_lillebekk_plan_case_001');
assert.ok(before.flags.includes('sen_rework_risiko'));
assert.ok(before.flags.includes('skolevei_ikke_dokumentert'));
assert.ok(deferredOps.some(op=>op.op==='add_flag' && op.flag==='sen_rework_risiko'),
  'The player can defer factual grounding in an actual playable route');
const body=[returned.summary,...returned.situation].join(' ');
assert.match(body,/Saksloggen/);
assert.match(body,/åpne avvik/);
assert.doesNotMatch(body,/Skolevei og grøntdrag er nå dokumentert/);
assert.doesNotMatch(body,/alle.*(avklart|dokumentert)/i);
const choiceC=returned.choices.find(c=>c.id==='C');
assert.match(choiceC.label,/åpne avvik/);
assert.match(choiceC.reply,/hvilke avklaringer som mangler/);
assert.equal(choiceC.authority_action.action_id,'skriv_faglig_anbefaling');
assert.equal(choiceC.authority_action.intent,'recommend');
const ops=choiceC.effects.work_object_ops;
assert.ok(ops.some(op=>op.op==='transition' && op.to_status==='awaiting_submission'));
assert.ok(!ops.some(op=>op.op==='remove_flag' && op.flag==='skolevei_ikke_dokumentert'),
 'A better-written recommendation cannot erase unverified school-route facts');
assert.ok(!ops.some(op=>op.op==='close'),
 'Writing the recommendation must not close the plan case or create a political decision');
assert.ok(!ops.some(op=>op.op==='create' && op.work_object?.kind==='approval'),
 'The advisor cannot create a manager approval through this choice');
assert.equal(returned.work_context.rework_of_object_transition,
 'by_radgiver_lillebekk_ready_after_approval');

 // Test only the work-object operations here: actual delivery eligibility and
 // manager approval are covered by the existing approval-branching suite.
adapter.applyOperations(ops,context(returned.id,'C','07'));
const after=adapter.getWorkObject('by_radgiver_lillebekk_plan_case_001');
assert.ok(after.flags.includes('skolevei_ikke_dokumentert'),
 'A later recommendation cannot fabricate missing school-route documentation');
assert.ok(after.flags.includes('sen_rework_risiko'),
 'An earlier deferment remains on record unless explicitly resolved');
assert.equal(adapter.getWorkObject('by_radgiver_lillebekk_approval_001'),null,
 'Recommendation operations do not invent a manager approval');

console.log('Lillebekk return: open/deferred evidence, role authority, and work-case status preserved');
