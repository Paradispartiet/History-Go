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
    if(tm()){
      root.HG_SocialDemo?.logDemoAction?.('health_checked');
      const s=root.HG_SocialDemo?.snapshot?.()||{};
      const visible=root.HG_SocialSurfaceContract?.scanVisibleText?.(s)||{ok:true,blockers:[]};
      checks.visibleTextPrivacy={ok:visible.ok}; if(!visible.ok) list(visible.blockers).forEach(b=>blockers.push(item('visible_text_privacy','Synlig sosial demo-tekst bryter personvernspråk.',b)));
      if(s.seeded){ const p=list(s.profiles)[0]; const a=root.HG_SocialDemo?.sendDemoInvite?.({toUserId:p?.userId,placeId:'health-demo-place',presetMessageId:'meet_here',sourceSurface:'demoPanel'}); const b=root.HG_SocialDemo?.sendDemoInvite?.({toUserId:p?.userId,placeId:'health-demo-place',presetMessageId:'meet_here',sourceSurface:'demoPanel'}); checks.demoInviteUX={ok:!!(a?.ok&&b?.ok&&!b.created)}; if(!checks.demoInviteUX.ok) blockers.push(item('demo_invite_ux','Demo-invitasjon har ikke duplikatvern.')); }
    } else { checks.visibleTextPrivacy={ok:true,skipped:true}; checks.demoInviteUX={ok:true,skipped:true}; }
    return {ok:blockers.length===0,summary:blockers.length?'HG Social har blokkere.':'HG Social OK.',checks,blockers,warnings};
  }
  function snapshot(){return root.HG_SocialDemo?.snapshot?.()||{};}
  root.HG_SocialDebug={health,snapshot,printHealth:async()=>{const h=await health(); console.info('HG Social health',h); return h;}};
}());
