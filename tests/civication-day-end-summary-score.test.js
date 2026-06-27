#!/usr/bin/env node
const fs = require('fs'); const path = require('path'); const vm = require('vm'); const assert = require('assert');
global.window=global; global.Event=function(t){this.type=t}; global.dispatchEvent=function(){};
let phase='day_end';
const phases=['morning','forenoon','workday','lunch','afternoon','dinner','evening','day_end'];
const runtime={items:[
 ...phases.slice(0,6).map((p,i)=>({phase:p,status:'answered',slot:'slot',event:{id:p,subject:p,phase_tag:p,mail_type:i%2?'people':'job',competency:i%2?'relasjon':'planfaglig vurdering',choices:[{tags:['learning','trust']}]}})),
 {phase:'evening',status:'queued',slot:'learning_or_hobby',event:{id:'open',subject:'Åpen læring',phase_tag:'evening'}},
 {phase:'day_end',status:'answered',slot:'day_summary',event:{id:'end',subject:'Dagen er over',phase_tag:'day_end',mail_type:'day_end'}}
]};
global.CivicationCalendar={DAY_PHASES:phases,getPhase:()=>phase,getPhaseLabel:p=>({'day_end':'Dagslutt / Natt'}[p]||p),getClock:()=>({dayIndex:2})};
global.CivicationDailyMailBuilder={inspect:()=>({runtime})}; global.CivicationState={getInbox:()=>[]};
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js/Civication/systems/day/dayProgressionController.js'),'utf8'),{filename:'prog.js'});
const s=global.CivicationDayProgression.getDayEndSummary();
assert.strictEqual(s.title,'Dagen er over'); assert.strictEqual(s.totalPhases,8); assert(s.completedPhases>=6); assert(s.handledItems>=7); assert(s.score>0); assert(s.scoreExplanation.includes('Score =')); assert(s.roleDevelopment.includes('Rolleutvikling')); assert(Array.isArray(s.learning));
console.log('civication-day-end-summary-score.test.js passed');
