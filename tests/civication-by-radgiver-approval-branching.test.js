#!/usr/bin/env node
'use strict';
// Two genuine playable Lillebekk routes: the manager's approval is not
// conjured by a previous rework or escalation choice. Planned runtime must
// filter candidates by the actual persisted WorkWorld case.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const Work=require(path.join(ROOT,'js/Civication/core/civicationWorkWorld.js'));
const Rhythm=require(path.join(ROOT,'js/Civication/core/civicationWorkRhythm.js'));
const Authority=require(path.join(ROOT,'js/Civication/core/civicationInstitutionAuthority.js'));
const files={
 job:'data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json',
 event:'data/Civication/mailFamilies/by/event/by_radgiver_plan_event.json',
 followup:'data/Civication/mailFamilies/by/followup/by_radgiver_plan_followup.json',
 consequence:'data/Civication/mailFamilies/by/consequence/by_radgiver_plan_consequence.json'
};
const mails=Object.values(files).flatMap(p=>read(p).families.flatMap(f=>f.mails||[]));
const byId=new Map(mails.map(m=>[m.id,m]));
const ids={
 open:'by_radgiver_realism_case_open_001',
 request:'by_radgiver_realism_approval_request_001',
 grant:'by_radgiver_realism_approval_grant_001',
 notGranted:'by_radgiver_realism_approval_still_missing_001',
 return:'by_radgiver_realism_return_to_case_001',
 send:'by_radgiver_realism_formal_send_001'
};
for(const [key,id] of Object.entries(ids))assert.ok(byId.get(id),key+' scene exists');
const plan=read('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
const stepIndex=plan.sequence.findIndex(step=>step.step===36);
assert.ok(stepIndex>=0);
assert.equal(plan.sequence[stepIndex].allowed_families[0],'role_world_realism_approval_followup');
const caseId='by_radgiver_lillebekk_plan_case_001';
const approvalId='by_radgiver_lillebekk_approval_001';
assert.equal(byId.get(ids.grant).work_context.waiting_for_actor_id,'elin_plansjef');
assert.equal(byId.get(ids.notGranted).work_context.rework_of_scene_id,ids.request);

function store(initial={}){
 let value=JSON.parse(JSON.stringify(initial));
 function merge(a,b){const c={...a};for(const [k,v] of Object.entries(b||{}))c[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(c[k]||{},v):v;return c;}
 return {getState(){return JSON.parse(JSON.stringify(value));},setState(p){value=merge(value,p);return this.getState();}};
}
function play(adapter,id,choiceId,index){
 const scene=byId.get(id);
 const choice=scene?.choices.find(c=>c.id===choiceId);
 assert.ok(choice,id+'/'+choiceId);
 const context={scene_id:id,choice_id:choiceId,at:'2026-11-'+String(3+index).padStart(2,'0')+'T10:00:00Z'};
 adapter.applyOperations(scene.effects?.work_object_ops||[],context);
 adapter.applyOperations(choice.effects?.work_object_ops||[],context);
}
function route(openChoice,requestChoice){
 const s=store();
 const adapter=Work.createAdapter(s);
 play(adapter,ids.open,openChoice,0);
 play(adapter,ids.request,requestChoice,1);
 return {s,adapter};
}
const approved=route('A','A');
const rework=route('B','B');
const escalated=route('A','C');
assert.equal(approved.adapter.getWorkObject(caseId).status,'awaiting_approval');
assert.equal(approved.adapter.getWorkObject(approvalId).status,'pending');
assert.equal(rework.adapter.getWorkObject(approvalId),null);
assert.equal(escalated.adapter.getWorkObject(approvalId),null);
assert.equal(rework.adapter.getWorkObject(caseId).status,'in_progress');
assert.equal(escalated.adapter.getWorkObject(caseId).status,'blocked');
for(const {label,r,grant,alt} of [
 {label:'requested',r:approved,grant:true,alt:true},
 {label:'rework',r:rework,grant:false,alt:true},
 {label:'escalated',r:escalated,grant:false,alt:true}
]){
 assert.equal(Rhythm.evaluateScene(byId.get(ids.grant),r.s.getState()).eligible,grant,label+' grant candidate');
 assert.equal(Rhythm.evaluateScene(byId.get(ids.notGranted),r.s.getState()).eligible,alt,label+' other candidate');
}
// Verify true candidate selection in the actual MailRuntime (not only a
// standalone helper), with the real plan and persistent state.
const active={career_id:'by',role_id:'by_radgiver_plan',title:'Byrådgiver'};
const chosen=[byId.get(ids.grant),byId.get(ids.notGranted)];
const window={
 CivicationWorkRhythm:Rhythm,
 CivicationCareerRoleResolver:{resolveCareerRoleScope:()=> 'by_radgiver_plan'},
 CivicationState:{getState:()=>({}),getActivePosition:()=>active},
 CivicationSceneCatalog:{getRolePlan:async()=>plan,getRoleMails:async()=>chosen},
 addEventListener(){}
};
const document={readyState:'loading',addEventListener(){}};
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'js/Civication/systems/civicationMailRuntime.js'),'utf8'),
 {window,document,console,Date,fetch:()=>{throw Error('Unexpected fetch')}});
async function selected(s){
 const state=s.getState();
 state.mail_runtime_v1={role_plan_id:plan.id,step_index:stepIndex,consumed_ids:[]};
 const rows=await window.CivicationMailRuntime.makeCandidateMailsForActiveRole(active,state);
 return JSON.parse(JSON.stringify(rows.map(x=>x.id)));
}
(async()=>{
 const yes=await selected(approved.s);
 const no=await selected(rework.s);
 const blocked=await selected(escalated.s);
 assert.equal(yes[0],ids.grant,'pending approval prioritizes leader reply');
 assert.deepEqual(no,[ids.notGranted],'rework cannot summon an unrequested approval');
 assert.deepEqual(blocked,[ids.notGranted],'capacity escalation cannot summon an unrequested approval');
 const approvalCheck=byId.get(ids.send);
 const execute=approvalCheck.choices.find(c=>c.id==='A');
 const role='by_radgiver_plan';
 const verify=r=>Authority.evaluate(approvalCheck.authority_context,execute.authority_action,{role_scope:role,work_world:r.adapter});
 assert.equal(verify(rework).allowed,false,'rework alone never authorizes formal send');
 assert.equal(verify(escalated).allowed,false,'escalation alone never authorizes formal send');
 play(rework.adapter,ids.notGranted,'A',2);
 assert.equal(rework.adapter.getWorkObject(approvalId).status,'pending');
 assert.equal(verify(rework).allowed,false,'late approval request still awaits leader decision');
 const restored=Work.createAdapter(store(rework.s.getState()));
 assert.equal(restored.getWorkObject(approvalId).status,'pending','late request survives save/reload');
 play(escalated.adapter,ids.notGranted,'B',2);
 assert.equal(escalated.adapter.getWorkObject(approvalId),null);
 assert.equal(escalated.adapter.getWorkObject(caseId).status,'blocked');
 play(approved.adapter,ids.grant,'A',2);
 assert.equal(approved.adapter.getWorkObject(approvalId).status,'granted');
 assert.equal(verify(approved).allowed,true,'actual recorded leader approval authorizes send');
 assert.equal(approved.adapter.getWorkObject(caseId).closed_at,null,'leader grant is not political vote');
 assert.notDeepEqual(approved.adapter.getWorkObject(caseId).flags,rework.adapter.getWorkObject(caseId).flags);
 console.log('Lillebekk: pending, rework and capacity escalation select truthful distinct followups; only approved path authorizes send');
})().catch(e=>{console.error(e);process.exitCode=1});
