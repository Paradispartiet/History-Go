const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
function storage(){const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>Array.from(m.keys())[i],get length(){return m.size},dump:()=>Object.fromEntries(m)};}
function load(){global.window=global; global.localStorage=storage(); delete global.HG_SocialSignals; vm.runInThisContext(fs.readFileSync('js/social/HGSocialSignals.js','utf8'),{filename:'HGSocialSignals.js'}); return global.HG_SocialSignals;}
let s=load();
let r=s.recordSignal({type:'quiz_completed',source:'quiz',quizId:'q1',domain:'history',conceptIds:['c1'],placeId:'p1',strength:1});
assert(r.ok&&r.created&&r.signal.seq===1);
r=s.recordSignal({type:'quiz_completed',source:'quiz',quizId:'q1',domain:'history',conceptIds:['c1'],placeId:'p1',strength:1});
assert(!r.created&&!r.updated&&s.getSignals().length===1);
r=s.recordSignal({type:'quiz_completed',source:'quiz',quizId:'q1',domain:'history',placeId:'p1',strength:3});
assert(!r.created&&r.updated&&r.signal.strength===3);
s.recordObservationAdded({observationId:'o1',placeId:'p1',domain:'nature',conceptIds:['c2'],tags:['arkitektur'],body:'raw body must not store'});
s.recordBadgeEarned({badgeId:'b1',domain:'history',tier:2});
const sum=s.getSummary();
assert.strictEqual(sum.signalCount,3); assert(sum.domains.history===2); assert(sum.concepts.c1===1); assert(sum.places.p1===2); assert(sum.badges.b1===1);
const seed=s.getPublicProfileSeed();
assert(seed.privacyLabels.includes('Ingen GPS')); assert(seed.knowledgeDomains.includes('history'));
assert(!JSON.stringify(s.getSignals()).includes('raw body must not store'));
global.localStorage.setItem('hg_social_signals_v1', JSON.stringify({version:1,updatedSeq:1,summary:{},signals:[{id:'x',seq:1,type:'quiz_completed',source:'quiz',latitude:1}]}));
assert.strictEqual(s.health().ok,false);
global.localStorage.setItem('hg_social_signals_v1', JSON.stringify({version:1,updatedSeq:1,summary:{},signals:[{id:'x',seq:1,type:'quiz_completed',source:'quiz',tags:['online club']}]}));
assert.strictEqual(s.health().ok,false);
s=load(); global.localStorage.setItem('other','keep'); s.recordQuizCompleted({quizId:'q2'}); assert(s.clearSignalsForTestMode().skipped); global.localStorage.setItem('HG_TEST_MODE','1'); assert(!s.clearSignalsForTestMode().skipped); assert.strictEqual(global.localStorage.getItem('other'),'keep'); assert.strictEqual(global.localStorage.getItem('hg_social_signals_v1'),null);
s=load(); s.recordPlaceAffinity({placeId:'p2',domain:'sted'}); assert(!JSON.stringify(s.getSignals()).match(/lat|lng|location|presence|followers/));
console.log('hg-social-signals ok');
