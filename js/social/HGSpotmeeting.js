(function(){
  'use strict';
  const root=typeof window!=='undefined'?window:globalThis;
  const STORAGE_KEY='hg_spotmeeting_v1';
  const CONTEXT_TYPES=Object.freeze(['place','quiz','route','observation','topic','circle']);
  const PRESETS=Object.freeze([
    {presetMessageId:'quiz_together',label:'Vil du ta denne quizen sammen?'},
    {presetMessageId:'route_one_day',label:'Vil du gå denne ruten en dag?'},
    {presetMessageId:'compare_place_learning',label:'Vil du sammenligne hva vi har lært om dette stedet?'},
    {presetMessageId:'shared_observation',label:'Vil du gjøre en felles observasjon her?'},
    {presetMessageId:'meet_topic',label:'Vil du møtes rundt dette temaet?'}
  ]);
  const FORBIDDEN=Object.freeze(['gps','latitude','longitude','coords','liveLocation','lastSeen','nearby','distance','followers','following','feed','chat','freeText','publicVisitHistory','visitedPlaces']);
  const FORBIDDEN_LOOKUP=new Set(FORBIDDEN.map(x=>x.toLowerCase()));
  const BASE=Object.freeze({version:1,sequence:0,invites:[],timeline:[],blockedUserIds:[],reportedUserIds:[],reports:[]});
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function testMode(){try{return root.localStorage?.getItem('HG_TEST_MODE')==='1';}catch{return false;}}
  function read(){try{return {...clone(BASE),...(JSON.parse(root.localStorage?.getItem(STORAGE_KEY)||'{}')||{})};}catch{return clone(BASE);}}
  function write(s){root.localStorage?.setItem(STORAGE_KEY,JSON.stringify(s));}
  function list(v){return Array.isArray(v)?v:[];}
  function scanForbidden(value){const found=[];const seen=new WeakSet();(function scan(v,path){if(!v||typeof v!=='object'||seen.has(v))return;seen.add(v);Object.keys(v).forEach(k=>{const p=path?`${path}.${k}`:k;if(FORBIDDEN_LOOKUP.has(String(k).toLowerCase()))found.push({field:k,path:p});scan(v[k],p);});})(value,'');return {ok:found.length===0,blockers:found};}
  function sanitizeContext(context){
    if(!context||typeof context!=='object')return {ok:false,reason:'missing_context'};
    const forbidden=scanForbidden(context); if(!forbidden.ok)return {ok:false,reason:'forbidden_privacy_field',privacy:forbidden};
    const c={contextType:String(context.contextType||''),contextId:String(context.contextId||''),title:String(context.title||''),reason:String(context.reason||''),sourceSurface:String(context.sourceSurface||'')};
    if(!CONTEXT_TYPES.includes(c.contextType))return {ok:false,reason:'invalid_context_type'};
    if(!c.contextId||!c.title||!c.reason||!c.sourceSurface)return {ok:false,reason:'incomplete_context'};
    return {ok:true,context:c};
  }
  function bool(value){return value===true;}
  function readiness(){
    const raw=root.HG_SPOTMEETING_READINESS||root.HGSpotmeetingReadiness;
    const source=raw||{};
    const flags={
      backendReady:bool(source.backendReady),
      identityReady:bool(source.identityReady),
      invitePersistenceReady:bool(source.invitePersistenceReady),
      moderationReady:bool(source.moderationReady),
      sourceConfigured:!!raw
    };
    flags.productionDiscoveryEnabled=flags.backendReady&&flags.identityReady&&flags.invitePersistenceReady&&flags.moderationReady;
    return flags;
  }
  function disabledReason(flags){
    if(!flags.backendReady)return 'backend_not_enabled';
    if(!flags.identityReady)return 'identity_not_enabled';
    if(!flags.invitePersistenceReady)return 'invite_persistence_not_enabled';
    if(!flags.moderationReady)return 'moderation_not_enabled';
    if(!flags.productionDiscoveryEnabled)return 'production_discovery_disabled';
    return null;
  }
  function config(){const flags=readiness();return {product:'HG Spotmeeting',version:1,storageKey:STORAGE_KEY,backendEnabled:flags.backendReady,backendReady:flags.backendReady,identityReady:flags.identityReady,invitePersistenceReady:flags.invitePersistenceReady,moderationReady:flags.moderationReady,productionDiscoveryEnabled:flags.productionDiscoveryEnabled,privateByDefault:true,manualOnly:true,presetOnly:true,allowedContextTypes:CONTEXT_TYPES.slice(),presetMessages:clone(PRESETS),productionWarning:flags.productionDiscoveryEnabled?null:'production_discovery_disabled',disabledReason:disabledReason(flags)};}
  function candidatesFor(context){
    if(!testMode())return [];
    const placeLike=context?.contextType==='place'||context?.contextType==='quiz'||context?.contextType==='observation';
    const demo=root.HG_SocialDemoAdapter?.getPeopleForPlace?.(placeLike?context.contextId:context.title)||root.HG_SocialDemo?.getProfiles?.()||[];
    return list(demo).slice(0,6).map((p,i)=>({targetUserId:p.userId,displayName:p.displayName,reason:p.reason||'Deler kunnskap, ruter eller begreper',score:p.score||90-i,demoOnly:true}));
  }
  function getSpotmeetingConfig(){return clone(config());}
  function getSpotmeetingState(){const s=read();return {...clone(s),config:getSpotmeetingConfig()};}
  function getSpotmeetingSuggestions(context){const valid=sanitizeContext(context);if(!valid.ok)return {ok:false,reason:valid.reason,suggestions:[],privacy:valid.privacy};const flags=readiness();if(!testMode()&&!flags.productionDiscoveryEnabled){const reason=disabledReason(flags)||'production_discovery_disabled';return {ok:false,reason,suggestions:[],warning:reason,context:valid.context,readiness:flags};}const suggestions=candidatesFor(valid.context);return {ok:true,context:valid.context,suggestions,warning:testMode()?null:null,demoOnly:testMode(),readiness:flags};}
  function isBlockedOrReported(targetUserId){const s=read();const id=String(targetUserId||'');return list(s.blockedUserIds).includes(id)||list(s.reportedUserIds).includes(id)||list(s.reports).some(r=>r?.targetUserId===id||r?.reporterUserId===id);}
  function canCreateSpotmeetingInvite(targetUserId,context){const valid=sanitizeContext(context);if(!valid.ok)return {ok:false,reason:valid.reason,privacy:valid.privacy};if(!String(targetUserId||''))return {ok:false,reason:'missing_target_user'};if(isBlockedOrReported(targetUserId))return {ok:false,reason:'blocked_or_reported'};const flags=readiness();if(!testMode()&&!flags.productionDiscoveryEnabled){const reason=disabledReason(flags)||'production_discovery_disabled';return {ok:false,reason,warning:reason,context:valid.context,readiness:flags};}return {ok:true,warning:testMode()?null:null,context:valid.context,readiness:flags};}
  function createSpotmeetingInvite(targetUserId,context,presetMessageId){const preset=PRESETS.find(p=>p.presetMessageId===presetMessageId);if(!preset)return {ok:false,reason:'invalid_preset_message'};const can=canCreateSpotmeetingInvite(targetUserId,context);if(!can.ok)return can;const s=read();s.sequence=Number(s.sequence||0)+1;const now=new Date().toISOString();const target=String(targetUserId);const profile=list(root.HG_SocialDemo?.getProfiles?.()).find(p=>String(p?.userId||'')===target)||{};const invite={inviteId:`spotmeeting-${s.sequence}`,targetUserId:target,targetDisplayName:String(profile.displayName||''),createdByUserId:String(root.HG_CURRENT_USER_ID||root.currentUserId||'me'),context:can.context,presetMessageId:preset.presetMessageId,presetLabel:preset.label,status:'pending',createdAt:now,updatedAt:now,manual:true,private:true,demoOnly:testMode()};const privacy=scanForbidden(invite);if(!privacy.ok)return {ok:false,reason:'forbidden_privacy_field',privacy};s.invites=list(s.invites);s.invites.push(invite);s.timeline=list(s.timeline);s.timeline.push({eventId:`spotmeeting-event-${s.sequence}`,inviteId:invite.inviteId,type:'created',context:invite.context,private:true,demoOnly:invite.demoOnly});write(s);return {ok:true,invite:clone(invite),warning:testMode()?null:null};}
  function update(inviteId,status){const s=read();const inv=list(s.invites).find(i=>i.inviteId===inviteId);if(!inv)return {ok:false,reason:'unknown_invite'};if(status==='completed'&&inv.status==='completed')return {ok:true,invite:clone(inv),duplicate:true,trustDelta:0};inv.status=status;inv.updatedAt=new Date().toISOString();s.timeline=list(s.timeline);s.timeline.push({eventId:`spotmeeting-event-${Number(s.sequence||0)+s.timeline.length+1}`,inviteId,type:status,private:true,demoOnly:inv.demoOnly});write(s);return {ok:true,invite:clone(inv),trustDelta:0};}
  function cancelSpotmeetingInvite(id){return update(id,'cancelled');}
  function acceptSpotmeetingInvite(id){return update(id,'accepted');}
  function declineSpotmeetingInvite(id){return update(id,'declined');}
  function confirmSpotmeetingCompleted(id){return update(id,'completed');}
  function getSpotmeetingInbox(){const state=read();const invites=list(state.invites);return {pending:invites.filter(i=>i.status==='pending'),accepted:invites.filter(i=>i.status==='accepted'),completed:invites.filter(i=>i.status==='completed'),declined:invites.filter(i=>i.status==='declined'),cancelled:invites.filter(i=>i.status==='cancelled'),declinedCancelled:invites.filter(i=>i.status==='declined'||i.status==='cancelled'),blockedOrReported:list(state.blockedUserIds).length+list(state.reportedUserIds).length>0,privacyChecklist:['Manuell','Kunnskapsbasert','Forhåndsmelding','Privat','Kan avbrytes/blokkeres/rapporteres']};}
  function getSpotmeetingTimeline(){return list(read().timeline).map(clone);}
  function health(){const cfg=config();const state=read();const flags=readiness();const gateOk=flags.productionDiscoveryEnabled===(flags.backendReady&&flags.identityReady&&flags.invitePersistenceReady&&flags.moderationReady);const defaultSafe=flags.sourceConfigured||(!flags.productionDiscoveryEnabled&&!flags.backendReady&&!flags.identityReady&&!flags.invitePersistenceReady&&!flags.moderationReady);const payload={cfg,state};const privacy=scanForbidden(payload);const presetsOnly=cfg.presetMessages.every(p=>PRESETS.some(x=>x.presetMessageId===p.presetMessageId&&x.label===p.label));const demoLeaked=list(root.PEOPLE).some(p=>String(p?.id||p?.userId||'').startsWith('demo-'));return {ok:privacy.ok&&presetsOnly&&!demoLeaked&&gateOk&&defaultSafe,checks:{exists:true,privacy:privacy.ok,presetOnly:presetsOnly,testModeDemoSeparated:true,noDemoUsersInPeople:!demoLeaked,productionDiscoveryGateSafe:gateOk,productionDiscoveryDisabledByDefault:defaultSafe&&(!flags.sourceConfigured?flags.productionDiscoveryEnabled===false:true),backendReadyDefaultFalse:defaultSafe&&(!flags.sourceConfigured?flags.backendReady===false:true),identityReadyDefaultFalse:defaultSafe&&(!flags.sourceConfigured?flags.identityReady===false:true),invitePersistenceReadyDefaultFalse:defaultSafe&&(!flags.sourceConfigured?flags.invitePersistenceReady===false:true),moderationReadyDefaultFalse:defaultSafe&&(!flags.sourceConfigured?flags.moderationReady===false:true)},readiness:flags,blockers:[...(!privacy.ok?privacy.blockers.map(b=>({key:'spotmeeting_privacy_field',...b})):[]),...(demoLeaked?[{key:'demo_users_leaked_global_people'}]:[]),...(!gateOk?[{key:'spotmeeting_production_discovery_gate_invalid',message:'Production discovery readiness must require all flags.'}]:[]),...(!defaultSafe?[{key:'spotmeeting_readiness_defaults_changed',message:'Production discovery readiness flags must default to false.'}]:[])],warnings:testMode()?[]:[{key:'production_discovery_disabled',message:'Ekte spotmeeting krever backend, identitet, invitasjonslagring og moderering.'}]};}
  root.HG_Spotmeeting={getSpotmeetingConfig,getSpotmeetingState,getSpotmeetingSuggestions,canCreateSpotmeetingInvite,createSpotmeetingInvite,cancelSpotmeetingInvite,acceptSpotmeetingInvite,declineSpotmeetingInvite,confirmSpotmeetingCompleted,getSpotmeetingInbox,getSpotmeetingTimeline,health,scanForbiddenFields:scanForbidden};
}());
