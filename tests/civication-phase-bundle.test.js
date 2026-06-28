#!/usr/bin/env node
const fs = require('fs'); const path = require('path'); const vm = require('vm'); const assert = require('assert');
global.window=global; global.Event=function(t){this.type=t}; global.dispatchEvent=function(){}; global.addEventListener=function(){}; global.document={readyState:"complete",addEventListener:function(){}};
let phase='forenoon'; const inbox=[];
const runtime={date:new Date().toISOString().slice(0,10),role_scope:"arealplanlegger",current_index:0,items:[
 {phase:'forenoon',slot:'primary_work_mail',status:'queued',event:{id:'w1',subject:'Plansak',phase_tag:'forenoon'}},
 {phase:'forenoon',slot:'people_ping',status:'queued',event:{id:'w2',subject:'Kollega',phase_tag:'forenoon',mail_type:'people',choices:[{id:'A',label:'Svar'}]}},
 {phase:'forenoon',slot:'context',status:'queued',event:{id:'w0',subject:'Les dette',phase_tag:'forenoon',mail_type:'generated'}},
 {phase:'forenoon',slot:'small_choice',status:'answered',event:{id:'w3',subject:'Valg',phase_tag:'forenoon'}},
 {phase:'workday',slot:'main_delivery',status:'queued',event:{id:'wd1',subject:'Leveranse',phase_tag:'workday'}}
]};
global.CivicationCalendar={DAY_PHASES:['morning','forenoon','workday','lunch','afternoon','dinner','evening','day_end'],getPhase:()=>phase,setPhase:p=>{phase=p},getPhaseLabel:p=>({forenoon:'Formiddag',workday:'Arbeidsdag'}[p]||p),getClock:()=>({dayIndex:1})};
global.CivicationState={getState:()=>({mail_day_runtime_v1:runtime}),setState:p=>{ if(p.mail_day_runtime_v1) Object.assign(runtime,p.mail_day_runtime_v1);},getActivePosition:()=>({career_id:'by',title:'Arealplanlegger',role_key:'arealplanlegger'}),getInbox:()=>inbox};
global.CivicationMailEngine={getInbox:()=>inbox,sendMail:item=>{inbox.push(item); return {ok:true};}};
global.HG_CiviEngine={getInbox:()=>inbox};
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js/Civication/systems/civicationDailyMailBuilder.js'),'utf8'),{filename:'builder.js'});
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js/Civication/systems/day/dayProgressionController.js'),'utf8'),{filename:'prog.js'});
(async()=>{
 let b=global.CivicationDayProgression.getCurrentPhaseBundle();
 assert.strictEqual(b.phase,'forenoon'); assert.strictEqual(b.phaseLabel,'Formiddag'); assert.strictEqual(b.queuedItems.length,3); assert.strictEqual(b.completedCount,1); assert.strictEqual(b.isComplete,false);
 let res=await global.CivicationDailyMailBuilder.enqueuePhaseBundle(global.HG_CiviEngine,{limit:5});
 assert.strictEqual(res.count,3,'opens entire queued phase bundle');
 assert.strictEqual(runtime.items.filter(x=>x.phase==='forenoon'&&x.status==='delivered').length,3);
 let opened=global.CivicationDayProgression.getCurrentPhaseBundle();
 assert.strictEqual(opened.pendingItems.length,3,'delivered bundle items are visible/actionable');
 assert.strictEqual(opened.pendingItems.find(x=>x.id==='w0').hasChoices,false,'generated/read-only item exposes no choices');
 assert.strictEqual(opened.pendingItems.find(x=>x.id==='w2').hasChoices,true,'choice item still exposes choices');
 assert.strictEqual(global.CivicationDayProgression.inspect().canAdvance,false,'delivered required items block phase advance');
 await global.CivicationDailyMailBuilder.markHandled('w0');
 assert.strictEqual(runtime.items.find(x=>x.event.id==='w0').status,'answered','read-only/generated item can be marked handled');
 assert.strictEqual(global.CivicationDayProgression.inspect().canAdvance,false,'choice/required delivered items still block');
 runtime.items.filter(x=>x.phase==='forenoon').forEach(x=>x.status='answered');
 assert.strictEqual(global.CivicationDayProgression.inspect().canAdvance,true,'answered bundle can advance');
 console.log('civication-phase-bundle.test.js passed');
})().catch(e=>{console.error(e);process.exit(1)});
