#!/usr/bin/env node
const assert=require('assert'); const fs=require('fs'); const vm=require('vm');
function storage(seed={}){const s={...seed}; return {getItem:k=>Object.hasOwn(s,k)?s[k]:null,setItem:(k,v)=>{s[k]=String(v)},removeItem:k=>delete s[k],dump:()=>({...s})};}
function doc(){const nodes={}; return {nodes,body:{appendChild(e){nodes[e.id]=e;return e}},createElement(){return {style:{},listeners:{},set id(v){this._id=v;nodes[v]=this},get id(){return this._id},innerHTML:'',querySelector(){return {addEventListener(){}}},remove(){delete nodes[this.id]}}},getElementById:id=>nodes[id]||null};}
global.window=global; global.document=doc(); global.localStorage=storage({}); global.console={warn(){},log(){},error(){}};
vm.runInThisContext(fs.readFileSync('js/today/HGTodayActionRouter.js','utf8'),{filename:'HGTodayActionRouter.js'});
const r=HG_TodayActionRouter; const supported=r.getSupportedActions();
assert(supported.includes('open_public_profile_preview')); assert(supported.includes('open_match_graph')); assert(supported.includes('read_only'));
assert.strictEqual(r.canRoute({routeKey:'complete_route',enabled:true}).ok,false); assert.strictEqual(r.canRoute({routeKey:'save_observation',enabled:true}).ok,false); assert.strictEqual(r.canRoute({routeKey:'unlock_place',enabled:true}).ok,false);
const before=localStorage.dump(); let ex=r.route({title:'Les bare',routeKey:'read_only',reason:'Forklar',enabled:true}); assert(ex.ok); assert(document.getElementById('hgTodayActionExplanation')); assert.deepStrictEqual(localStorage.dump(),before);
let profile=0,match=0,demo=0; global.HG_PublicProfilePreviewPanel={render:()=>{profile++}}; global.HGSocialMatchGraphPanel={render:()=>{match++}}; global.HG_SocialDemoPanel={render:()=>{demo++}};
r.route({routeKey:'open_public_profile_preview',enabled:true}); r.route({routeKey:'open_match_graph',enabled:true}); assert.strictEqual(profile,1); assert.strictEqual(match,1);
r.route({routeKey:'open_social_demo',enabled:true}); assert.strictEqual(demo,0,'social demo blocked outside TEST_MODE'); localStorage.setItem('HG_TEST_MODE','1'); r.route({routeKey:'open_social_demo',enabled:true}); assert.strictEqual(demo,1);
global.completeRoute=()=>{throw Error('must not complete')}; global.unlockPlace=()=>{throw Error('must not unlock')}; r.route({routeKey:'open_route',enabled:true,payload:{routeId:'r1'}}); r.route({routeKey:'open_place',enabled:true,payload:{placeId:'p1'}});
assert.strictEqual(r.canRoute({routeKey:'read_only',title:'GPS nå',enabled:true}).ok,false); assert(r.health().supported.includes('open_runtime_health'));
console.log('HG today action router tests passed');
