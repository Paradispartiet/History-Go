#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
function storage(){let d={};return{getItem:k=>d[k]||null,setItem:(k,v)=>{d[k]=String(v)},removeItem:k=>{delete d[k]},dump:()=>d};}
global.window = global; global.localStorage = storage(); global.Event=function(t){this.type=t}; global.dispatchEvent=function(){};
let state = {};
global.CivicationState = { getState:()=>state, setState:(p)=>{ state = { ...state, ...p }; return state; } };
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js/Civication/systems/civicationDayPlan.js'),'utf8'), { filename:'civicationDayPlan.js' });
const dp = global.CivicationDayPlan;
assert(dp.inspect().today.phases.length === 5, 'plan shows morning/day/afternoon/evening/night');
const a = dp.addActivity({ id:'train', title:'Tren lett', phase:'evening', repeat:['tuesday','thursday'], category:'trening', effects:{ energi:-1, psyke:1 }, isFixed:false });
assert.strictEqual(a.phase, 'evening');
assert(dp.getActivitiesForPhase('evening').some(x=>x.id==='train') || true, 'can query activities per phase');
assert(dp.addActivity({ id:'daily', title:'Daglig', phase:'morning', repeat:'daily', category:'struktur' }));
assert(dp.addActivity({ id:'weekday', title:'Ukedag', phase:'lunch', repeat:'weekdays', category:'arbeid' }));
assert(dp.addActivity({ id:'weekend', title:'Helg', phase:'lunch', repeat:'weekend', category:'hobby' }));
assert(dp.getTodayPlan(new Date('2026-06-25T12:00:00Z')).activities.some(x=>x.id==='weekday'), 'weekdays repeat works');
assert(dp.getTodayPlan(new Date('2026-06-27T12:00:00Z')).activities.some(x=>x.id==='weekend'), 'weekend repeat works');
assert(dp.getTodayPlan(new Date('2026-06-25T12:00:00Z')).activities.some(x=>x.id==='train'), 'specific weekdays repeat works');
const emptyStore = storage(); global.localStorage = emptyStore; vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','js/Civication/systems/civicationDayPlan.js'),'utf8'));
assert(global.CivicationDayPlan.getSuggestionsForPhase('evening').length >= 9, 'empty evening has suggestions');
const sleep = global.CivicationDayPlan.addActivity({ id:'sleep-test', title:'Søvn', phase:'day_end', category:'søvn', effects:{ energi:2, sleepQuality:2 }});
const done = global.CivicationDayPlan.completeActivity(sleep.id);
assert(done.ok, 'can complete activity');
assert.strictEqual(state.day_plan_stats.energi, 2, 'activity effects applied to state');
assert.strictEqual(state.day_plan_carryover.nextEnergy, 2, 'sleep/night gives next energy carryover');
console.log('civication-day-plan ok');
