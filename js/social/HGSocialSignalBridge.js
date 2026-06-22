(function(){
  'use strict';
  const root=typeof window!=='undefined'?window:globalThis;
  let bound=false;
  const handlers={};
  const names=['hg:quizCompleted','hg:routeCompleted','hg:observationAdded','hg:badgeEarned','hg:placeAffinity','hg:badge-tier-unlock','hg:historicalRouteProgress'];
  function detail(e){return e?.detail||{};}
  function sig(){return root.HG_SocialSignals;}
  function recordFromQuizResult(d){return sig()?.recordQuizCompleted?.(d)||{ok:false,reason:'signals_missing'};}
  function recordFromRouteResult(d){return sig()?.recordRouteCompleted?.(d)||{ok:false,reason:'signals_missing'};}
  function recordFromObservation(d){const safe={...d}; delete safe.body; delete safe.note; delete safe.text; delete safe.rawText; return sig()?.recordObservationAdded?.(safe)||{ok:false,reason:'signals_missing'};}
  function recordFromBadge(d){return sig()?.recordBadgeEarned?.({badgeId:d?.badgeId||d?.categoryId,domain:d?.domain||d?.categoryId,tier:d?.tier||d?.nextTierIndex||d?.newTierLabel,tags:d?.tags,strength:d?.strength||d?.nextTierIndex||2})||{ok:false,reason:'signals_missing'};}
  function bind(){if(bound||!root.addEventListener)return {ok:true,bound}; handlers['hg:quizCompleted']=e=>recordFromQuizResult(detail(e)); handlers['hg:routeCompleted']=e=>recordFromRouteResult(detail(e)); handlers['hg:observationAdded']=e=>recordFromObservation(detail(e)); handlers['hg:badgeEarned']=e=>recordFromBadge(detail(e)); handlers['hg:placeAffinity']=e=>sig()?.recordPlaceAffinity?.(detail(e)); handlers['hg:badge-tier-unlock']=e=>recordFromBadge(detail(e)); handlers['hg:historicalRouteProgress']=e=>{const d=detail(e); if(d?.progress?.online?.completed||d?.progress?.status==='online_completed')recordFromRouteResult({routeId:d.routeId,strength:2});}; Object.keys(handlers).forEach(n=>root.addEventListener(n,handlers[n])); bound=true; return {ok:true,bound:true};}
  function unbind(){if(!bound||!root.removeEventListener)return {ok:true,bound:false}; Object.keys(handlers).forEach(n=>root.removeEventListener(n,handlers[n])); bound=false; return {ok:true,bound:false};}
  function health(){const warnings=[]; const blockers=[]; if(!sig())warnings.push({key:'social_signals_missing',message:'HG_SocialSignals mangler.'}); if(!bound)warnings.push({key:'bridge_unbound',message:'HG Social signal bridge er ikke bundet.'}); warnings.push({key:'route_completion_event_missing',message:'Route completion bridge lytter, men eksplisitt completion-event kan mangle på sider uten ruteruntime.'}); const signalHealth=sig()?.health?.(); if(signalHealth&&!signalHealth.ok)blockers.push(...(signalHealth.blockers||[])); return {ok:blockers.length===0,bound,checks:{signals:{ok:!!sig()},routeCompletion:{ok:true,status:'warning'}},blockers,warnings};}
  root.HG_SocialSignalBridge={bind,unbind,isBound:()=>bound,recordFromQuizResult,recordFromRouteResult,recordFromObservation,recordFromBadge,health};
  bind();
}());
