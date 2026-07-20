(function(){
  'use strict';

  const root=typeof window!=='undefined'?window:globalThis;
  const SAFE=[
    'open_public_profile_preview','open_match_graph','open_social_demo','open_runtime_health',
    'open_civication_summary','open_workday','open_home','open_place','open_quiz',
    'open_route_viewer','open_observation_ui','open_today_explanation','open_route',
    'open_observation','read_only'
  ];
  const FORBIDDEN=['start_workday','run_economy_tick','complete_route','complete_quiz','save_observation','send_real_invite','publish_profile_backend','unlock_place','buy_item','move_home'];
  const FIELDS=['lat','lng','latitude','longitude','gps','location','liveLocation','presence','isOnline','lastSeen','visitLog','visitedAt','timestampedVisits','followers','followerCount','following','feedTracking'];
  const WORDS=['nearby','distance','GPS','live location','online','last seen','followers','following','feed','avstand','i nærheten','live-posisjon','pålogget','sist sett','følgere','følger'];

  function tm(){
    try{return root.localStorage?.getItem?.('HG_TEST_MODE')==='1'||root.HG_TEST_MODE===true||root.TEST_MODE===true;}
    catch{return false;}
  }

  function list(v){return Array.isArray(v)?v:[];}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function scan(v){
    const out=[];
    const seen=new WeakSet();
    function w(x,p){
      if(x&&typeof x==='object'){
        if(seen.has(x))return;
        seen.add(x);
        Object.keys(x).forEach(key=>{
          const np=p?`${p}.${key}`:key;
          if(FIELDS.includes(key))out.push({type:'field',field:key,path:np});
          w(x[key],np);
        });
        return;
      }
      if(typeof x==='string'){
        const low=x.toLowerCase();
        WORDS.forEach(word=>{if(low.includes(word.toLowerCase()))out.push({type:'word',word,path:p});});
      }
    }
    w(v,'');
    return out;
  }

  function normalize(a){
    const mapped={
      HGSocialMatchGraphPanel:'open_match_graph',
      HG_SocialMatchGraphPanel:'open_match_graph',
      HG_PublicProfilePreviewPanel:'open_public_profile_preview',
      HG_RuntimeHealthPanel:'open_runtime_health',
      HG_SocialDemoPanel:'open_social_demo'
    }[a?.target];
    const aliases={open_route:'open_route_viewer',open_observation:'open_observation_ui'};
    const rawRouteKey=a?.routeKey||mapped||(a?.actionKind==='read_only'?'read_only':null)||'read_only';
    return Object.assign({},a,{routeKey:aliases[rawRouteKey]||rawRouteKey});
  }

  function showActionExplanation(action,why){
    const doc=root.document;
    if(!doc?.createElement)return {ok:true,mode:'console',reason:why||'read_only'};
    doc.getElementById('hgTodayActionExplanation')?.remove?.();
    const el=doc.createElement('div');
    el.id='hgTodayActionExplanation';
    el.style.cssText='position:fixed;inset:auto 16px 16px auto;z-index:2147483647;max-width:360px;background:#111;color:#fff;border:1px solid rgba(255,255,255,.24);border-radius:14px;padding:14px;font:14px system-ui;box-shadow:0 16px 40px rgba(0,0,0,.45)';
    el.innerHTML=`<strong>${esc(action?.title||'Min dag')}</strong><p>${esc(action?.reason||action?.subtitle||'Lesemodus uten spillendring.')}</p><p>Kilde: ${esc(action?.source||'today_hub')}</p><p>${esc(why||action?.safetyLabel||'Trygg visning')}</p><button type="button" data-close>OK</button>`;
    el.querySelector('[data-close]')?.addEventListener('click',()=>el.remove());
    doc.body?.appendChild(el);
    return {ok:true,mode:'explanation'};
  }

  function canRoute(action){
    const a=normalize(action||{});
    const violations=scan({title:a.title,subtitle:a.subtitle,reason:a.reason,payload:a.payload});
    if(violations.length)return {ok:false,enabled:false,reason:'Personvernblokkere',violations};
    if(FORBIDDEN.includes(a.routeKey)||FORBIDDEN.includes(a.type)||FORBIDDEN.includes(a.actionKind))return {ok:false,enabled:false,reason:'Ikke koblet til trygg handling ennå.'};
    if(a.enabled===false)return {ok:false,enabled:false,reason:a.reason||'Ikke koblet til trygg handling ennå.'};
    if(a.routeKey==='open_social_demo'&&!tm())return {ok:false,enabled:false,reason:'Testmodus kreves.'};
    return {ok:SAFE.includes(a.routeKey),enabled:SAFE.includes(a.routeKey),reason:SAFE.includes(a.routeKey)?'Trygg handling':'Ikke koblet til trygg handling ennå.'};
  }

  function closeTodayHub(){
    root.HG_TodayHubPanel?.remove?.();
  }

  function actionTargetId(action){
    return String(action?.payload?.targetId||action?.payload?.placeId||'').trim();
  }

  function currentPlaceId(){
    return String(root.document?.getElementById?.('placeCard')?.dataset?.currentPlaceId||'').trim();
  }

  function resolvePlace(action){
    const id=actionTargetId(action)||currentPlaceId();
    if(!id)return null;
    return list(root.PLACES).find(place=>String(place?.id||'').trim()===id)||null;
  }

  function invokePanel(action,fn,missingReason){
    if(typeof fn!=='function')return showActionExplanation(action,missingReason||'Denne visningen er ikke lastet ennå.');
    closeTodayHub();
    return {ok:true,value:fn()};
  }

  function openQuiz(action){
    const targetId=actionTargetId(action)||currentPlaceId()||'aker_brygge';
    closeTodayHub();

    if(typeof root.HGMapView?.openQuiz==='function'){
      const value=root.HGMapView.openQuiz(targetId);
      return {ok:value!==false,value,targetId};
    }

    const hash=`#/quiz/${encodeURIComponent(targetId)}`;
    if(typeof root.HGAppRouter?.navigate==='function'){
      return {ok:true,value:root.HGAppRouter.navigate(hash),targetId};
    }
    if(root.location){
      root.location.hash=hash;
      return {ok:true,value:hash,targetId};
    }
    return showActionExplanation(action,'Quizvisningen er ikke lastet ennå.');
  }

  function openPlace(action){
    const targetId=actionTargetId(action);
    if(!targetId)return showActionExplanation(action,'Dette målet mangler et sted å åpne.');
    if(typeof root.HGMapView?.openPlace!=='function')return showActionExplanation(action,'Kartvisningen er ikke klar ennå.');
    closeTodayHub();
    const value=root.HGMapView.openPlace(targetId);
    return value===false?showActionExplanation(action,'Fant ikke stedet i kartet.'):{ok:true,value,targetId};
  }

  function openRoutePanel(){
    root.setNearbyCollapsed?.(false);
    const modeSelect=/** @type {HTMLSelectElement|null} */ (root.document?.getElementById?.('leftPanelMode'));
    if(modeSelect){
      modeSelect.value='routes';
      modeSelect.dispatchEvent?.(new Event('change',{bubbles:true}));
    }
    root.setLeftPanelMode?.('routes');
    return /** @type {any} */ (root).renderLeftRoutesList?.();
  }

  function openRouteViewer(action){
    const targetId=actionTargetId(action);
    closeTodayHub();

    const task=Promise.all([
      Promise.resolve(root.HGRoutes?.load?.()).catch(()=>[]),
      Promise.resolve(root.HGHistoricalRoutes?.load?.()).catch(()=>[])
    ]).then(([standardRoutes,historicalRoutes])=>{
      if(targetId){
        const historical=list(historicalRoutes).some(route=>String(route?.id||'')===targetId)
          || list(root.HGHistoricalRoutes?.getAll?.()).some(route=>String(route?.id||'')===targetId);
        if(historical&&typeof root.HGHistoricalRoutes?.open==='function'){
          root.HGHistoricalRoutes.open(targetId);
          return true;
        }

        const standard=list(standardRoutes).some(route=>String(route?.id||'')===targetId)
          || list(root.ROUTES).some(route=>String(route?.id||'')===targetId);
        if(standard&&typeof root.HGRoutes?.showThematic==='function'){
          root.HGRoutes.showThematic(targetId);
          return true;
        }
      }

      openRoutePanel();
      return true;
    }).catch(error=>{
      console.warn('[HGTodayActionRouter] route viewer failed',error);
      openRoutePanel();
      return false;
    });

    return {ok:true,value:task,targetId};
  }

  function startObservation(action){
    const place=resolvePlace(action);
    if(!place)return showActionExplanation(action,'Fant ikke stedet observasjonen skulle knyttes til.');

    const subjectId=String(action?.payload?.subjectId||place.categoryId||place.category||place.subject_id||'by').trim()||'by';
    const request={
      target:{
        targetId:String(place.id||'').trim(),
        targetType:'place',
        subject_id:subjectId,
        categoryId:subjectId,
        title:place.name||''
      },
      lensId:String(action?.payload?.lensId||'by_byliv').trim()||'by_byliv'
    };

    const launch=()=>{
      if(typeof root.HGObservations?.start!=='function')return false;
      void root.HGObservations.start(request);
      return true;
    };

    closeTodayHub();
    if(launch())return {ok:true,value:true,targetId:request.target.targetId};

    if(typeof root.addEventListener==='function'){
      root.addEventListener('hg:backgroundReady',()=>{launch();},{once:true});
      root.showToast?.('Observasjon lastes inn …');
      return {ok:true,mode:'deferred',targetId:request.target.targetId};
    }
    return showActionExplanation(action,'Observasjonsverktøyet er ikke lastet ennå.');
  }

  function openCivication(action){
    closeTodayHub();
    const link=/** @type {HTMLAnchorElement|null} */ (root.document?.querySelector?.('.civication-nav-link'));
    if(typeof link?.click==='function'){
      link.click();
      return {ok:true,value:'civication-link'};
    }

    let href='Civication.html';
    try{href=new URL('Civication.html',root.document?.baseURI||root.location?.href||'http://localhost/').toString();}catch{}
    if(typeof root.location?.assign==='function'){
      root.location.assign(href);
      return {ok:true,value:href};
    }
    if(root.location){
      root.location.href=href;
      return {ok:true,value:href};
    }
    return showActionExplanation(action,'Civication kunne ikke åpnes herfra.');
  }

  function route(action){
    const a=normalize(action||{});
    const c=canRoute(a);
    if(!c.ok)return showActionExplanation(a,c.reason);

    if(a.routeKey==='open_public_profile_preview')return invokePanel(a,root.HG_PublicProfilePreviewPanel?.render,'Profilvisningen er ikke lastet ennå.');
    if(a.routeKey==='open_match_graph'){
      const panel=root.HGSocialMatchGraphPanel||root.HG_SocialMatchGraphPanel;
      return invokePanel(a,panel?.render,'Kunnskapsmatchene er ikke lastet ennå.');
    }
    if(a.routeKey==='open_social_demo')return invokePanel(a,root.HG_SocialDemoPanel?.render,'Social demo er ikke lastet ennå.');
    if(a.routeKey==='open_runtime_health')return invokePanel(a,root.HG_RuntimeHealthPanel?.render||root.HG_RuntimeHealth?.printHealth,'Diagnosepanelet er ikke lastet ennå.');
    if(a.routeKey==='open_quiz')return openQuiz(a);
    if(a.routeKey==='open_place')return openPlace(a);
    if(a.routeKey==='open_route_viewer')return openRouteViewer(a);
    if(a.routeKey==='open_observation_ui')return startObservation(a);
    if(a.routeKey==='open_civication_summary'||a.routeKey==='open_workday'||a.routeKey==='open_home')return openCivication(a);
    return showActionExplanation(a,a.safetyLabel||'Lesemodus');
  }

  function health(){
    const blockers=[];
    if(!root.HG_TodayActionRouter)blockers.push({key:'router_missing',message:'Action router mangler.'});
    return {ok:blockers.length===0,blockers,warnings:[],supported:SAFE.slice(),forbidden:FORBIDDEN.slice()};
  }

  root.HG_TodayActionRouter={
    route,
    canRoute,
    getSupportedActions:()=>SAFE.slice(),
    health,
    _scanPrivacy:scan,
    _showActionExplanation:showActionExplanation,
    _forbidden:FORBIDDEN.slice()
  };
}());
