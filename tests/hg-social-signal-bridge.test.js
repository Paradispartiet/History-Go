const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
class CE{constructor(type,init={}){this.type=type;this.detail=init.detail||{};}}
function storage(){const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),dump:()=>Object.fromEntries(m)};}
function load(){global.window=global; global.localStorage=storage(); global.CustomEvent=CE; const ev={}; global.addEventListener=(n,h)=>(ev[n]=ev[n]||[]).push(h); global.removeEventListener=(n,h)=>{ev[n]=(ev[n]||[]).filter(x=>x!==h)}; global.dispatchEvent=e=>{(ev[e.type]||[]).forEach(h=>h(e));}; delete global.HG_SocialSignals; delete global.HG_SocialSignalBridge; vm.runInThisContext(fs.readFileSync('js/social/HGSocialSignals.js','utf8')); vm.runInThisContext(fs.readFileSync('js/social/HGSocialSignalBridge.js','utf8')); return {signals:global.HG_SocialSignals,bridge:global.HG_SocialSignalBridge};}
const {signals,bridge}=load();
global.dispatchEvent(new CustomEvent('hg:quizCompleted',{detail:{quizId:'q1',categoryId:'historie',correct:5,total:5}}));
assert.strictEqual(signals.getSignals()[0].type,'quiz_completed'); assert.strictEqual(signals.getSignals()[0].strength,3);
global.dispatchEvent(new CustomEvent('hg:observationAdded',{detail:{observationId:'o1',placeId:'p1',domain:'kunst',tags:['fasade'],body:'do not store'}}));
assert(signals.getSignals().some(x=>x.type==='observation_added')); assert(!JSON.stringify(signals.getSignals()).includes('do not store'));
bridge.recordFromBadge({badgeId:'b1',domain:'historie',tier:1}); bridge.recordFromBadge({badgeId:'b1',domain:'historie',tier:1,points:2}); assert.strictEqual(signals.getSignals().filter(x=>x.type==='badge_earned').length,1);
assert(bridge.health().warnings.some(w=>w.key==='route_completion_event_missing')); assert(!bridge.health().blockers.length);
// Debug and smoke integration
vm.runInThisContext(fs.readFileSync('js/social/HGSocialSurfaceContract.js','utf8')); vm.runInThisContext(fs.readFileSync('js/social/HGSocialDebug.js','utf8')); const snap=global.HG_SocialDebug.snapshot(); assert(snap.signals.signalCount>=3); assert(global.HG_SocialDebug.health() instanceof Promise);
global.localStorage.setItem('HG_TEST_MODE','1'); global.PLACES=[{id:'p'}]; global.HG_RuntimeHealth={health:async()=>({blockers:[],warnings:[]})}; vm.runInThisContext(fs.readFileSync('js/debug/HGRuntimeSmokeRunner.js','utf8')); signals.recordSignal({type:'quiz_completed',source:'quiz',quizId:'bad',domain:'GPS'}); global.HG_RuntimeSmokeRunner.run().then(r=>{assert(r.blockers.some(b=>/privacy|socialSignals/.test(`${b.key} ${b.check}`))); assert(!signals.getSignals().some(x=>x.demoOnly===true||x.userId)); console.log('hg-social-signal-bridge ok');}).catch(e=>{console.error(e);process.exit(1);});
