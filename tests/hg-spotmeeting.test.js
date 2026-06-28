const assert=require('assert'),fs=require('fs'),vm=require('vm');
function storage(seed={}){let s={...seed};return{getItem:k=>Object.prototype.hasOwnProperty.call(s,k)?s[k]:null,setItem:(k,v)=>{s[k]=String(v)},removeItem:k=>{delete s[k]},dump:()=>({...s})};}
function load(seed={}){global.window=global;global.localStorage=storage(seed);global.CustomEvent=function(n,o){return{type:n,detail:o&&o.detail}};global.dispatchEvent=()=>{};global.PEOPLE=[];['HG_Spotmeeting','HG_SocialDemo','HG_SocialDemoAdapter'].forEach(k=>delete global[k]);vm.runInThisContext(fs.readFileSync('js/social/HGSocialDemo.js','utf8'),{filename:'HGSocialDemo.js'});vm.runInThisContext(fs.readFileSync('js/social/HGSocialDemoAdapter.js','utf8'),{filename:'HGSocialDemoAdapter.js'});vm.runInThisContext(fs.readFileSync('js/social/HGSpotmeeting.js','utf8'),{filename:'HGSpotmeeting.js'});return global.HG_Spotmeeting;}
const ctx={contextType:'place',contextId:'factory_memory',title:'Factory',reason:'Delt industrihistorie',sourceSurface:'test'};
let api=load();
let cfg=api.getSpotmeetingConfig();assert.strictEqual(cfg.product,'HG Spotmeeting');assert.strictEqual(cfg.storageKey,'hg_spotmeeting_v1');assert.strictEqual(cfg.presetMessages.length,5);
let sug=api.getSpotmeetingSuggestions(ctx);assert(sug.ok);assert.strictEqual(sug.warning,'backend_not_enabled');assert.strictEqual(sug.suggestions.length,0,'production no backend candidates');
assert.strictEqual(api.createSpotmeetingInvite('u1',null,'quiz_together').ok,false,'manual context required');
assert.strictEqual(api.createSpotmeetingInvite('u1',ctx,'not_a_preset').reason,'invalid_preset_message');
assert.strictEqual(api.createSpotmeetingInvite('u1',ctx,'Vil du møtes?').reason,'invalid_preset_message','free text rejected');
assert.strictEqual(api.createSpotmeetingInvite('u1',{...ctx,latitude:1},'quiz_together').reason,'forbidden_privacy_field');
let created=api.createSpotmeetingInvite('u1',ctx,'quiz_together');assert(created.ok);assert.strictEqual(created.warning,'backend_not_enabled');
let accepted=api.acceptSpotmeetingInvite(created.invite.inviteId);assert(accepted.ok);assert.strictEqual(accepted.trustDelta,0,'accept does not increase trust');
let completed=api.confirmSpotmeetingCompleted(created.invite.inviteId);assert(completed.ok);assert.strictEqual(completed.invite.status,'completed');assert.strictEqual(completed.trustDelta,0);
let dup=api.confirmSpotmeetingCompleted(created.invite.inviteId);assert(dup.ok);assert.strictEqual(dup.duplicate,true);assert.strictEqual(dup.trustDelta,0,'duplicate completion no trust farm');
let state=api.getSpotmeetingState();state.blockedUserIds=['blocked'];localStorage.setItem('hg_spotmeeting_v1',JSON.stringify(state));assert.strictEqual(api.canCreateSpotmeetingInvite('blocked',ctx).reason,'blocked_or_reported');
state.reportedUserIds=[];state.blockedUserIds=[];state.reports=[{reporterUserId:'me',targetUserId:'reported'}];localStorage.setItem('hg_spotmeeting_v1',JSON.stringify(state));assert.strictEqual(api.canCreateSpotmeetingInvite('reported',ctx).reason,'blocked_or_reported');assert.strictEqual(api.canCreateSpotmeetingInvite('me',ctx).reason,'blocked_or_reported','reported user cannot invite reporter');
api=load({HG_TEST_MODE:'1'});HG_SocialDemo.seed({resetFirst:true});sug=api.getSpotmeetingSuggestions(ctx);assert(sug.ok);assert(sug.suggestions.length>0,'TEST_MODE can use demo candidates');
created=api.createSpotmeetingInvite(sug.suggestions[0].targetUserId,ctx,'compare_place_learning');assert(created.ok);const payload=JSON.stringify({cfg:api.getSpotmeetingConfig(),state:api.getSpotmeetingState(),inbox:api.getSpotmeetingInbox(),timeline:api.getSpotmeetingTimeline()});['gps','latitude','longitude','coords','liveLocation','lastSeen','nearby','distance','followers','following','feed','chat','freeText','publicVisitHistory','visitedPlaces'].forEach(k=>assert(!payload.includes('"'+k+'"'),k));
assert(api.health().ok,'health passes');
console.log('hg-spotmeeting ok');
