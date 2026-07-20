(function(){
  'use strict';

  const root=typeof window!=='undefined'?window:globalThis;
  const PANEL_ID='hgTodayHubPanel';
  const STYLE_ID='hgTodayHubPanelStyle';
  const QUIZ_TARGET_FALLBACKS=['aker_brygge','barcode','bjorvika','oslo_s','karl_johan','torggata','slottsparken'];
  let last=null;
  let lastOptions={};

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function list(v){return Array.isArray(v)?v:[];}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${PANEL_ID}{position:fixed;right:16px;top:16px;z-index:2147483646;width:min(720px,calc(100vw - 32px));max-height:calc(100vh - 96px);max-height:calc(100dvh - 96px);overflow-y:auto;overflow-x:hidden;background:#0f172a;color:white;border:1px solid rgba(255,255,255,.22);border-radius:18px;box-shadow:0 18px 54px rgba(0,0,0,.38);font:14px/1.25 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:16px 18px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;scrollbar-gutter:stable}
      #${PANEL_ID} header.hg-today-hub-header{display:flex;align-items:center;gap:9px;margin:0 0 2px;min-height:28px}
      #${PANEL_ID} .hg-today-hub-title-icon{width:26px;height:26px;flex:0 0 26px;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;color:#e5e7eb;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
      #${PANEL_ID} .hg-today-hub-title-icon svg{width:22px;height:22px;display:block}
      #${PANEL_ID} .hg-today-hub-header .muted{flex:1;min-width:0}
      #${PANEL_ID} .hg-today-hub-header .context{margin:0;white-space:nowrap}
      #${PANEL_ID} h3{margin:12px 0 7px;font-size:1rem;line-height:1.15}
      #${PANEL_ID} p,#${PANEL_ID} .muted{font-size:.86rem;line-height:1.3;margin:0}
      #${PANEL_ID} ul{margin:6px 0 0;padding-left:18px}
      #${PANEL_ID} li{margin:2px 0;line-height:1.25}
      #${PANEL_ID} button{min-height:34px;margin:0;border:0;border-radius:10px;padding:6px 11px;background:#e5e7eb;color:#111827;font:inherit;font-size:.86rem;font-weight:650;line-height:1.15}
      #${PANEL_ID} button[disabled]{opacity:.55}
      #${PANEL_ID} .muted{opacity:.78}
      #${PANEL_ID} .strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:0}
      #${PANEL_ID} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
      #${PANEL_ID} .pill,#${PANEL_ID} .card{border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.07);padding:8px 10px}
      #${PANEL_ID} .pill{min-height:48px;box-sizing:border-box;font-size:.82rem;line-height:1.2}
      #${PANEL_ID} .pill b{font-size:.9rem;line-height:1.15}
      #${PANEL_ID} .priority{display:flex;flex-direction:column;gap:8px;margin-bottom:0}
      #${PANEL_ID} .priority .card{padding:12px 14px;border-radius:14px;margin-bottom:0;min-height:unset;background:rgba(59,130,246,.16)}
      #${PANEL_ID} .priority p{margin-top:6px;margin-bottom:6px}
      #${PANEL_ID} .priority .meta,#${PANEL_ID} .priority .muted{font-size:.82rem}
      #${PANEL_ID} .actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
      #${PANEL_ID} .warn{color:#fde68a;font-size:.82rem;line-height:1.25;margin-top:6px}
      #${PANEL_ID} .context,#${PANEL_ID} .badge,#${PANEL_ID} [class*="badge"]{display:inline-block;margin:6px 0 0;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.12);font-size:.78rem;line-height:1.15}
      #${PANEL_ID} footer{display:flex;gap:7px;flex-wrap:wrap;margin-top:2px;padding-bottom:4px}
      @media (max-width:760px){
        #${PANEL_ID}{right:10px;top:10px;width:calc(100vw - 20px);max-height:calc(100vh - 76px);max-height:calc(100dvh - 76px);padding:14px}
        #${PANEL_ID} header.hg-today-hub-header{align-items:flex-start;gap:8px}
        #${PANEL_ID} .hg-today-hub-title-icon{width:24px;height:24px;flex-basis:24px;border-radius:9px}
        #${PANEL_ID} .hg-today-hub-title-icon svg{width:20px;height:20px}
        #${PANEL_ID} .hg-today-hub-header .context{white-space:normal}
        #${PANEL_ID} .strip{grid-template-columns:repeat(2,minmax(0,1fr))}
        #${PANEL_ID} .priority .card{padding:10px 12px}
        #${PANEL_ID} .grid{grid-template-columns:1fr}
      }
    `;
    document.head?.appendChild(s);
  }

  function panel(){return document.getElementById(PANEL_ID);}
  function remove(){panel()?.remove?.();}

  function currentPlaceId(){
    return String(document.getElementById('placeCard')?.dataset?.currentPlaceId||'').trim();
  }

  function preferredPlaceId(){
    const current=currentPlaceId();
    if(current)return current;
    const places=list(root.PLACES);
    const byPlace=places.find(p=>String(p?.categoryId||p?.category||p?.subject_id||'').trim()==='by');
    return String(byPlace?.id||places[0]?.id||'').trim();
  }

  function preferredQuizTarget(){
    const ids=new Set(list(root.PLACES).map(p=>String(p?.id||'').trim()).filter(Boolean));
    return QUIZ_TARGET_FALLBACKS.find(id=>ids.has(id))||currentPlaceId()||QUIZ_TARGET_FALLBACKS[0];
  }

  function normalizeAction(action){
    const a=Object.assign({},action||{});
    const aliases={open_route:'open_route_viewer',open_observation:'open_observation_ui'};
    const typeRoutes={
      learning_quiz:'open_quiz',
      learning_place:'open_place',
      route:'open_route_viewer',
      observation:'open_observation_ui',
      public_profile:'open_public_profile_preview',
      social_match:'open_match_graph',
      workday:'open_workday',
      economy:'open_civication_summary',
      home:'open_home',
      diagnostic:'open_runtime_health'
    };
    let routeKey=aliases[a.routeKey]||a.routeKey||'read_only';
    if(routeKey==='read_only'&&typeRoutes[a.type])routeKey=typeRoutes[a.type];
    const payload=Object.assign({},a.payload||{});
    if(routeKey==='open_quiz'&&!payload.targetId)payload.targetId=preferredQuizTarget();
    if((routeKey==='open_place'||routeKey==='open_observation_ui')&&!payload.targetId){
      const placeId=payload.placeId||preferredPlaceId();
      if(placeId){payload.placeId=payload.placeId||placeId; payload.targetId=placeId;}
    }
    return Object.assign({},a,{routeKey,payload,enabled:a.enabled!==false});
  }

  function showActionExplanation(action){
    return root.HG_TodayActionRouter?._showActionExplanation?.(normalizeAction(action))||null;
  }

  function route(action){
    const normalized=normalizeAction(action);
    if(typeof root.HG_TodayActionRouter?.route==='function')return root.HG_TodayActionRouter.route(normalized);
    return showActionExplanation(normalized);
  }

  function diagnose(){route({title:'Diagnose',type:'diagnostic',routeKey:'open_runtime_health',enabled:true});}

  function can(action){
    const normalized=normalizeAction(action);
    return root.HG_TodayActionRouter?.canRoute?.(normalized)||{ok:normalized.enabled!==false};
  }

  function objectiveExists(id){
    if(!id)return false;
    const agenda=root.HG_DailyObjectives?.getAgenda?.();
    return list(agenda?.objectives).some(o=>String(o?.id||'')===String(id));
  }

  function bind(p,s){
    p.querySelector('[data-hg-progress-refresh]')?.addEventListener('click',async()=>{
      root.HG_DailyProgress?.refreshFromSignals?.({save:false});
      last=await (root.HG_TodayHub?.snapshot?.()||root.HG_TodayHub?.refresh?.());
      paint(last,lastOptions);
    });
    p.querySelector('[data-hg-progress-clear]')?.addEventListener('click',()=>{
      root.HG_DailyProgress?.clearProgressForTestMode?.();
      refresh(lastOptions);
    });
    p.querySelector('[data-hg-today-refresh]')?.addEventListener('click',()=>refresh(lastOptions));
    p.querySelector('[data-hg-today-hide]')?.addEventListener('click',remove);
    p.querySelector('[data-hg-today-diagnose]')?.addEventListener('click',diagnose);

    p.querySelectorAll('[data-hg-today-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const index=Number(btn.getAttribute('data-hg-today-action'));
      route((s.priority||[])[index]);
    }));

    p.querySelectorAll('[data-hg-today-explain]').forEach(btn=>btn.addEventListener('click',()=>{
      const index=Number(btn.getAttribute('data-hg-today-explain'));
      showActionExplanation((s.priority||[])[index]);
    }));

    p.querySelectorAll('[data-hg-today-dismiss]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.getAttribute('data-hg-today-dismiss');
      if(id)root.HG_DailyObjectives?.dismissObjective?.(id);
      refresh(lastOptions);
    }));

    p.querySelectorAll('[data-hg-card-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const raw=btn.getAttribute('data-hg-card-action');
      if(!raw)return;
      route(JSON.parse(decodeURIComponent(raw)));
    }));
  }

  function nowCard(action,index){
    const a=normalizeAction(action);
    const c=can(a);
    const canDismiss=objectiveExists(a.id)&&typeof root.HG_DailyObjectives?.dismissObjective==='function';
    const status=a.status?` <span class="context">${esc(a.status)}</span>`:'';
    const meta=[a.source||a.type,a.safetyLabel].filter(Boolean).join(' · ');
    return `<div class="card"><strong>${esc(a.title||'Neste steg')}</strong>${status}<p class="muted">${esc(a.subtitle||a.reason||a.whyNow||'')}</p>${meta?`<p class="muted meta">${esc(meta)}</p>`:''}<div class="actions"><button type="button" ${c.ok?'':`disabled title="${esc(c.reason||'Ikke tilgjengelig')}"`} data-hg-today-action="${index}">${esc(c.ok?'Åpne':'Ikke tilgjengelig')}</button><button type="button" data-hg-today-explain="${index}">Forklar</button>${canDismiss?`<button type="button" data-hg-today-dismiss="${esc(a.id)}">Skjul</button>`:''}</div></div>`;
  }

  function card(title,status,items,action,warnings){
    const normalized=normalizeAction(action||{title,routeKey:'read_only',enabled:true,safetyLabel:'Lesemodus'});
    const enc=encodeURIComponent(JSON.stringify(normalized));
    return `<article class="card"><strong>${esc(title)}</strong><p>${esc(status||'Ingen lokale data ennå')}</p><ul>${(items||[]).filter(Boolean).slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')||'<li class="muted">Ingen forslag ennå</li>'}</ul>${(warnings||[]).slice(0,2).map(w=>`<div class="warn">${esc(w.message||w.key||w)}</div>`).join('')}<button type="button" data-hg-card-action="${enc}">${esc(normalized.title||'Åpne')}</button></article>`;
  }

  function paint(s,opt){
    ensureStyle();
    let p=panel();
    if(!p){
      p=document.createElement('aside');
      p.id=PANEL_ID;
      p.setAttribute('aria-live','polite');
      document.body?.appendChild(p);
    }

    const basePriority=(s.priority||[]).slice(0,5);
    const ctx=opt?.context?.placeId?'<div class="context">For dette stedet</div>':'';
    const subtitle=s.status?.summary||'Her samles jobb, læring, ruter og folk når du spiller.';
    const demoSeed=(s.player?.mode==='test_mode'&&!s.social?.matchCount)?[{id:'seed-social-demo',title:'Seed social demo',reason:'Åpne demo-panelet og seed manuelt.',routeKey:'open_social_demo',enabled:true,safetyLabel:'Testmodus'}]:[];
    const priority=basePriority.concat(demoSeed).slice(0,5).map(normalizeAction);

    const progress=root.HG_DailyProgress?.getProgress?.()||s.progress||null;
    const ps=progress?.summary||{};
    const progressEvents=(ps.lastEvents||[]).slice(0,3);
    const progressHtml=`<h3>Dagens framgang</h3><section class="priority"><div class="card"><strong>${esc(ps.completedTodayLabel||'Ingen framgang registrert ennå')}</strong><p class="muted">${esc(ps.hasProgress?'Framgang fra fullførte mål.':'Fullfør et mål for å se framgang her.')}</p><ul>${progressEvents.map(e=>`<li>${esc(e.title)}${e.safetyLabel?' · '+esc(e.safetyLabel):''}</li>`).join('')||'<li class="muted">Fullfør et mål for å se framgang her.</li>'}</ul><p class="muted">${Object.keys(ps.bySource||{}).slice(0,3).map(esc).join(' · ')}</p><button type="button" data-hg-progress-refresh>Oppdater framgang</button>${s.player?.mode==='test_mode'?'<button type="button" data-hg-progress-clear>Clear progress</button>':''}</div></section>`;

    const quizAction=priority.find(a=>a.type==='learning_quiz')||{title:'Ta quiz',type:'learning_quiz',routeKey:'open_quiz',payload:{targetId:preferredQuizTarget()},enabled:true,safetyLabel:'Åpner quiz'};
    const routeAction=priority.find(a=>a.type==='route')||{title:'Se foreslått rute',type:'route',routeKey:'open_route_viewer',enabled:true,safetyLabel:'Åpner ruter'};
    const observationAction=priority.find(a=>a.type==='observation')||{title:'Legg til observasjon',type:'observation',routeKey:'open_observation_ui',payload:{targetId:preferredPlaceId(),placeId:preferredPlaceId(),subjectId:'by'},enabled:true,safetyLabel:'Åpner observasjon'};

    p.innerHTML=`
      <header class="hg-today-hub-header">
        <div class="hg-today-hub-title-icon" role="img" aria-label="Min dag" title="Min dag">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.8v2.4M16.5 3.8v2.4M5.4 8.3h13.2M6.6 5.4h10.8a2.2 2.2 0 0 1 2.2 2.2v9.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V7.6a2.2 2.2 0 0 1 2.2-2.2Z"/><path fill="currentColor" d="M8 12.3a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Zm4 0a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Zm4 0a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Zm-8 4a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Zm4 0a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"/></svg>
        </div>
        <p class="muted">${esc(subtitle)}</p>${ctx}
      </header>
      <section class="strip">
        <div class="pill"><b>${esc(s.status?.label||'Klar')}</b><br>${esc(s.status?.score??s.status?.state??'')}</div>
        <div class="pill">PC/lommebok<br><b>${esc(s.economy?.wallet??'ukjent')}</b></div>
        <div class="pill">Jobb/rolle<br><b>${esc(s.workday?.activeJob?.title||s.workday?.activeJob||s.civication?.role||'Ingen aktiv jobb')}</b></div>
        <div class="pill">Offentlig profil<br><b>${esc(s.social?.publicProfileEnabled?'på':'preview')}</b></div>
      </section>
      ${s.privacy?.ok===false?'<h3>Personvernblokkere</h3>':''}
      <h3>Nå</h3>
      <section class="priority">${priority.map(nowCard).join('')||'<div class="card muted">Ingen forslag ennå.</div>'}</section>
      ${progressHtml}
      <h3>Kort</h3>
      <section class="grid">
        ${card('Jobb og økonomi',s.workday?.activeJob?'Du har aktiv jobb':'Ingen aktiv jobb',['Se økonomi før nye kjøp',s.economy?.status],{title:'Se økonomi',type:'economy',routeKey:'open_civication_summary',enabled:true,safetyLabel:'Åpner Civication'},s.civication?.warnings)}
        ${card('Bolig og nabolag',s.home?.status||'Sjekk boligpress',['Sjekk boligpress'],{title:'Sjekk bolig',type:'home',routeKey:'open_home',enabled:true,safetyLabel:'Åpner Civication'})}
        ${card('Læring','Bygg læringsspor',[`Fortsett med ${(s.learning?.suggestedDomains||['historie'])[0]}`,'Ta en quiz som styrker profilen'],quizAction,s.learning?.warnings)}
        ${card('Folk',s.social?.matchCount?'Se kunnskapsmatchene dine':'Bygg offentlig profil',['Sammenlign kunnskap',`${s.social?.matchCount||0} matcher`],{title:s.social?.matchCount?'Se kunnskapsmatchene dine':'Bygg offentlig profil',type:s.social?.matchCount?'social_match':'public_profile',routeKey:s.social?.matchCount?'open_match_graph':'open_public_profile_preview',enabled:true,safetyLabel:'Åpner visning'},s.social?.warnings)}
        ${card('Ruter','Se foreslått rute',['Åpne en rute og fortsett derfra'],routeAction,s.routes?.warnings)}
        ${card('Observasjoner','Legg til observasjon',['Velg et sted og registrer observasjonen'],observationAction,s.observations?.warnings)}
        ${card('Diagnose','Sjekk om appen er spillbar',[`${(s.blockers||[]).length} blokkere`,`${(s.warnings||[]).length} advarsler`],{title:'Diagnose',type:'diagnostic',routeKey:'open_runtime_health',enabled:true,safetyLabel:'Åpner diagnose'})}
      </section>
      <footer><button type="button" data-hg-today-refresh>Oppdater</button><button type="button" data-hg-today-diagnose>Diagnose</button><button type="button" data-hg-today-hide>Skjul</button></footer>
    `;

    bind(p,Object.assign({},s,{priority}));
  }

  async function refresh(options){
    lastOptions=options||lastOptions||{};
    if(!root.HG_TodayHub?.snapshot){ensureStyle(); return null;}
    last=await (root.HG_TodayHub.refresh?.()||root.HG_TodayHub.snapshot());
    paint(last,lastOptions);
    return last;
  }

  async function render(options){
    lastOptions=options||{};
    return refresh(lastOptions);
  }

  function isEnabled(){return true;}

  root.HG_TodayHubPanel={render,refresh,remove,isEnabled,_safeOpen:route,showActionExplanation};
}());
