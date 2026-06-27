#!/usr/bin/env node
const fs = require('fs'); const path = require('path'); const vm = require('vm'); const assert = require('assert');
global.window=global; global.Event=function(t){this.type=t}; global.dispatchEvent=function(){};
let phase='morning';
const runtime={ current_index:0, items:[
 { phase:'morning', status:'answered', event:{ id:'m1', subject:'Morgenbrief', phase_tag:'morning' } },
 { phase:'morning', status:'queued', event:{ id:'m2', subject:'Kollega', phase_tag:'morning' } },
 { phase:'lunch', status:'queued', event:{ id:'l1', subject:'Lunsj', phase_tag:'lunch' } },
 { phase:'day_end', status:'queued', event:{ id:'d1', subject:'Natt', phase_tag:'day_end' } }
]};
global.CivicationCalendar={ DAY_PHASES:['morning','lunch','afternoon','evening','day_end'], getPhase:()=>phase, setPhase:p=>{phase=p}, getPhaseLabel:p=>p, getClock:()=>({dayIndex:1}), advancePhase:()=>{ const i=global.CivicationCalendar.DAY_PHASES.indexOf(phase); phase=global.CivicationCalendar.DAY_PHASES[i+1]||phase; } };
let enqueued=0; global.CivicationDailyMailBuilder={ inspect:()=>({runtime}), enqueueNext:()=>{ enqueued++; const row=runtime.items.find(x=>x.status==='queued'); if(row){row.status='delivered'; phase=row.phase; return {enqueued:true,event:row.event};} return {enqueued:false}; } };
global.CivicationState={ getInbox:()=>[] };
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js/Civication/systems/day/dayProgressionController.js'),'utf8'), {filename:'dayProgressionController.js'});
let i=global.CivicationDayProgression.inspect();
assert.strictEqual(i.canAdvance,false,'queued item in same phase blocks advance');
assert.strictEqual(i.nextQueuedItem.id,'m2','next queued item surfaced');
runtime.items[1].status='answered'; i=global.CivicationDayProgression.inspect();
assert.strictEqual(i.canAdvance,true,'phase can advance when current phase handled');
(async()=>{ await global.CivicationDayProgression.advancePhaseIfReady(); assert.strictEqual(phase,'lunch','lunch follows morning'); assert(enqueued>0,'advance clearly delivers next runtime item'); assert.strictEqual(runtime.items[2].status,'delivered','lunch item delivered'); runtime.items[2].status='answered'; await global.CivicationDayProgression.advancePhaseIfReady(); phase='day_end'; let end=global.CivicationDayProgression.inspect(); assert.strictEqual(end.canAdvance,false,'day_end queued/delivered work blocks next day'); console.log('civication-daily-gameplay-loop ok'); })().catch(e=>{ console.error(e); process.exit(1); });
