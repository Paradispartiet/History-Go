(function(){
  'use strict';
  const root=typeof window!=='undefined'?window:globalThis;
  function tm(){try{return root.localStorage?.getItem('HG_TEST_MODE')==='1';}catch{return false;}}
  function list(v){return Array.isArray(v)?v:[];}
  function item(key,message,details){return {key,message,details:details||{}};}
  async function health(){
    const blockers=[]; const warnings=[]; const checks={};
    const contract=!!root.HG_SocialSurfaceContract;
    checks.surfaceContract={ok:contract}; if(!contract) blockers.push(item('surface_contract_missing','HG_SocialSurfaceContract mangler.'));
    const signals=root.HG_SocialSignals;
    if(!signals) warnings.push(item('social_signals_missing','HG_SocialSignals mangler.'));
    else {
      const sh=signals.health?.()||{ok:true,blockers:[]};
      checks.socialSignals={ok:sh.ok,signalCount:sh.signalCount||0};
      if(!sh.ok) list(sh.blockers).forEach(b=>blockers.push(item('social_signal_privacy','HG Social Signals har personvernbrudd.',b)));
      if((sh.signalCount||0)===0) warnings.push(item('social_signals_idle','Ingen lokale learning/social signaler ennå.',{signalCount:0}));
    }
    const publicProfile=root.HG_PublicProfileReadModel;
    if(!publicProfile) warnings.push(item('public_profile_missing','HG_PublicProfileReadModel mangler.'));
    else {
      const ph=publicProfile.health?.()||{ok:true,blockers:[],warnings:[]};
      checks.publicProfile={ok:ph.ok,publicProfileEnabled:!!ph.publicProfileEnabled,signalCount:ph.signalCount||0};
      if(!ph.ok) list(ph.blockers).forEach(b=>blockers.push(item('public_profile_privacy','Offentlig profil har personvernbrudd.',b)));
      list(ph.warnings).forEach(w=>warnings.push(item(w.key||'public_profile_warning',w.message||'Offentlig profil har advarsel.',w)));
    }
    if(tm()){
      root.HG_SocialDemo?.logDemoAction?.('health_checked');
      const s=root.HG_SocialDemo?.snapshot?.()||{};
      const visible=root.HG_SocialSurfaceContract?.scanVisibleText?.(s)||{ok:true,blockers:[]};
      checks.visibleTextPrivacy={ok:visible.ok}; if(!visible.ok) list(visible.blockers).forEach(b=>blockers.push(item('visible_text_privacy','Synlig sosial demo-tekst bryter personvernspråk.',b)));
      if(s.seeded){ const p=list(s.profiles)[0]; const a=root.HG_SocialDemo?.sendDemoInvite?.({toUserId:p?.userId,placeId:'health-demo-place',presetMessageId:'meet_here',sourceSurface:'demoPanel'}); const b=root.HG_SocialDemo?.sendDemoInvite?.({toUserId:p?.userId,placeId:'health-demo-place',presetMessageId:'meet_here',sourceSurface:'demoPanel'}); checks.demoInviteUX={ok:!!(a?.ok&&b?.ok&&!b.created)}; if(!checks.demoInviteUX.ok) blockers.push(item('demo_invite_ux','Demo-invitasjon har ikke duplikatvern.')); }
    } else { checks.visibleTextPrivacy={ok:true,skipped:true}; checks.demoInviteUX={ok:true,skipped:true}; }
    return {ok:blockers.length===0,summary:blockers.length?'HG Social har blokkere.':'HG Social OK.',checks,blockers,warnings};
  }
  function snapshot(){const demo=root.HG_SocialDemo?.snapshot?.()||{}; return {...demo,signals:root.HG_SocialSignals?.getSummary?.()||null,signalHealth:root.HG_SocialSignals?.health?.()||null,publicProfile:root.HG_PublicProfileReadModel?.getReadModel?.()||null,publicProfileHealth:root.HG_PublicProfileReadModel?.health?.()||null};}
  root.HG_SocialDebug={health,snapshot,printHealth:async()=>{const h=await health(); console.info('HG Social health',h); return h;}};
}());
