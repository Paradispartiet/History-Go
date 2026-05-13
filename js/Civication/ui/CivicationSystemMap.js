// CivicationSystemMap.js
// Lett systemlag over eksisterende CivicationMap. Ingen motor- eller place-data-endringer.
(function(){
  const ACCESS_PATH="data/Civication/place_access_map.json";
  const STORE={home:"civi_home_v1",capital:"hg_capital_v1",state:"hg_civi_state_v1",inbox:"hg_civi_inbox_v1",mail:"hg_civi_mail_v1",active:"hg_active_position_v1"};
  const ZONES=[
    {id:"sentrum",name:"Sentrum",x:.48,y:.55,icon:"🏛️",context:"civic_power_core",summary:"Makt, offentlighet, status, debatt og sentrale hendelser."},
    {id:"grunerlokka",name:"Grünerløkka",x:.46,y:.45,icon:"🎭",context:"underground_edge_core",summary:"Subkultur, nettverk, kveldsflyt og kreativ friksjon."},
    {id:"frogner",name:"Frogner",x:.35,y:.55,icon:"🛍️",context:"work_trade_core",summary:"Status, handel, kapital og sosial synlighet."},
    {id:"sagene",name:"Sagene",x:.44,y:.35,icon:"🏠",context:"home_stability_core",summary:"Hjem, nabolag, ro og hverdagsstabilitet."},
    {id:"gamle_oslo",name:"Gamle Oslo",x:.52,y:.60,icon:"🏗️",context:"urban_growth_core",summary:"Byutvikling, logistikk, prosjekt og overgangssoner."},
    {id:"alna",name:"Alna",x:.60,y:.42,icon:"⚙️",context:"urban_growth_core",summary:"Arbeid, transport, hverdagsøkonomi og praktisk mobilitet."},
    {id:"nordstrand",name:"Nordstrand",x:.55,y:.75,icon:"🌿",context:"green_relief_core",summary:"Grønt, helse, familieliv og lavere sosialt trykk."},
    {id:"st_hanshaugen",name:"St. Hanshaugen",x:.40,y:.48,icon:"📚",context:"city_culture_core",summary:"Kultur, kafé, litteratur og urbant mellomrom."},
    {id:"ullern",name:"Ullern",x:.28,y:.58,icon:"💼",context:"work_trade_core",summary:"Økonomi, komfort, statusbolig og privat kapital."},
    {id:"stovner",name:"Stovner",x:.65,y:.22,icon:"🧭",context:"green_relief_core",summary:"Avstand, lokalmiljø, hverdagsliv og alternative ruter."}
  ];
  const FALLBACK_CONTEXTS=[
    {context_id:"city_culture_core",work:["kunst","litteratur","musikk","formidling"],leisure:["kultur","scene","litteratur","museum","kafe"],store:["books","audio","tickets","art_objects"],debate:["kultur","offentlig_stotte","kunst","formidling"],people:["artist","curator","critic","writer"],housing:["urban_core","cultural_quarter"]},
    {context_id:"urban_growth_core",work:["naeringsliv","by","logistikk","prosjekt"],leisure:["city_walk","networking","afterwork"],store:["equipment","business_style","coffee"],debate:["byutvikling","arbeidsliv","mobilitet","eiendom"],people:["planner","manager","developer","organizer"],housing:["urban_core","high_density"]},
    {context_id:"music_night_core",work:["musikk","media","scene"],leisure:["music","nightlife","subculture","concert"],store:["audio","records","tickets","streetwear"],debate:["kultur","nattliv","stoy","autentisitet"],people:["musician","promoter","dj","scene_worker"],housing:["nightlife_zone","creative_collective"]},
    {context_id:"civic_power_core",work:["politikk","media","institusjon"],leisure:["public_events","lectures","assemblies"],store:["books","formalwear","documents"],debate:["politikk","offentlighet","makt","rettsstat"],people:["politician","journalist","advisor","lawyer"],housing:["institutional_core","representational"]},
    {context_id:"green_relief_core",work:["natur","helse","omsorg"],leisure:["park","rest","walking","training"],store:["outdoor","sports","health"],debate:["miljo","helse","offentlig_rom","livskvalitet"],people:["runner","care_worker","guide","therapist"],housing:["quiet_district","green_edge"]},
    {context_id:"work_trade_core",work:["naeringsliv","handel","service"],leisure:["shopping","afterwork","streetlife"],store:["clothing","luxury","coffee","electronics"],debate:["forbruk","arbeidsliv","klasse","status"],people:["seller","brand_manager","customer_host","entrepreneur"],housing:["status_district","central_comfort"]},
    {context_id:"underground_edge_core",work:["subkultur","kunst","musikk","media"],leisure:["subculture","bars","collective","streetlife"],store:["records","zines","streetwear","niche_objects"],debate:["autentisitet","gentrifisering","kultur","motkultur"],people:["scene_actor","activist","artist","bartender"],housing:["collective","edge_district"]},
    {context_id:"home_stability_core",work:["omsorg","by","hverdagsliv"],leisure:["local_cafe","reading","neighborhood"],store:["home","books","food"],debate:["bolig","nabolag","familieliv","lokalmiljo"],people:["neighbor","parent","teacher","local_organizer"],housing:["quiet_district","family_friendly","stable_home"]}
  ];
  let contexts=FALLBACK_CONTEXTS,selectedId=null,resizeTimer=null,hudMinimized=false,panelMinimized=false,zonesHidden=false;
  function read(k,fallback){try{const raw=localStorage.getItem(k);return raw?JSON.parse(raw):fallback}catch{return fallback}}
  function esc(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]))}
  function list(v){return Array.isArray(v)&&v.length?v.join(", "):"—"}
  function contextFor(zone){return contexts.find(c=>c.context_id===zone.context)||FALLBACK_CONTEXTS.find(c=>c.context_id===zone.context)||{} }
  function getHomeDistrict(){const s=read(STORE.home,{});return s?.home?.district||null}
  function getActive(){return read(STORE.active,null)||read(STORE.state,{})?.active_role_key||null}
  function activeLabel(){const a=getActive();if(!a)return"Ingen rolle";if(typeof a==="string")return a;return a.title||a.role_title||a.roleName||a.role||a.positionTitle||a.career_title||a.role_scope||a.career_key||a.id||"Aktiv rolle"}
  function inboxCount(){const a=read(STORE.mail,null);if(a&&Array.isArray(a.items))return a.items.filter(x=>!x.status||x.status==="pending"||x.status==="unread").length;if(a&&Array.isArray(a.pending))return a.pending.length;const b=read(STORE.inbox,[]);return Array.isArray(b)?b.length:0}
  function capitalSum(){const c=read(STORE.capital,{});return ["economic","cultural","social","symbolic","political"].reduce((n,k)=>n+Number(c?.[k]||0),0)}
  function workMatches(zone){const a=getActive();if(!a)return false;const hay=JSON.stringify(a).toLowerCase();const ctx=contextFor(zone);return (ctx.work||[]).some(w=>hay.includes(String(w).toLowerCase()))}
  function syncMinimizedState(layer){
    layer.classList.toggle("is-hud-minimized",hudMinimized);
    layer.classList.toggle("is-clean-map",zonesHidden);
    const hudBtn=layer.querySelector("[data-civi-minimize-hud]");
    if(hudBtn){hudBtn.textContent=hudMinimized?"+":"−";hudBtn.setAttribute("aria-expanded",String(!hudMinimized));}
    const panel=layer.querySelector(".civi-system-panel");
    panel?.classList.toggle("is-minimized",panelMinimized);
    const panelBtn=layer.querySelector("[data-civi-minimize-panel]");
    if(panelBtn){panelBtn.textContent=panelMinimized?"+":"−";panelBtn.setAttribute("aria-expanded",String(!panelMinimized));}
    const zonesBtn=layer.querySelector("[data-civi-toggle-zones]");
    if(zonesBtn){zonesBtn.setAttribute("aria-pressed",String(zonesHidden));zonesBtn.textContent=zonesHidden?"Soner":"Ren kart";}
  }
  function ensureLayer(){const host=document.getElementById("civiMapWorld");if(!host)return null;let layer=host.querySelector(".civi-system-layer");if(layer){syncMinimizedState(layer);return layer;}layer=document.createElement("div");layer.className="civi-system-layer";layer.innerHTML=`<div class="civi-system-hud"><div class="civi-system-title"><strong>Civication-kart</strong><span>systemlag</span><button class="civi-system-control-btn is-text" type="button" data-civi-toggle-zones aria-label="Skjul eller vis soneknapper" aria-pressed="false">Ren kart</button><button class="civi-system-control-btn" type="button" data-civi-minimize-hud aria-label="Minimer kartstatus" aria-expanded="true">−</button></div><div class="civi-system-status"><div class="civi-system-status-item"><span>Rolle</span><strong data-civi-map-role>—</strong></div><div class="civi-system-status-item"><span>Hjem</span><strong data-civi-map-home>—</strong></div><div class="civi-system-status-item"><span>Inbox</span><strong data-civi-map-inbox>—</strong></div></div></div><button class="civi-system-close" type="button" aria-label="Lukk kart">×</button><div class="civi-system-zones"></div><aside class="civi-system-panel" aria-live="polite"></aside>`;host.appendChild(layer);layer.querySelector(".civi-system-close")?.addEventListener("click",()=>document.body.classList.remove("civi-mapmode"));layer.querySelector("[data-civi-toggle-zones]")?.addEventListener("click",()=>{zonesHidden=!zonesHidden;syncMinimizedState(layer)});layer.querySelector("[data-civi-minimize-hud]")?.addEventListener("click",()=>{hudMinimized=!hudMinimized;syncMinimizedState(layer)});syncMinimizedState(layer);return layer}
  function zoneHtml(zone){const home=getHomeDistrict();const cls=["civi-zone-node"];if(zone.id===selectedId)cls.push("is-selected");if(zone.id===home)cls.push("is-home");if(workMatches(zone))cls.push("is-work");if(inboxCount()>0&&zone.id==="sentrum")cls.push("has-events");return `<button type="button" class="${cls.join(" ")}" data-zone="${esc(zone.id)}" style="left:${zone.x*100}%;top:${zone.y*100}%"><span class="civi-zone-icon">${esc(zone.icon)}</span><span class="civi-zone-label">${esc(zone.name)}</span></button>`}
  function renderPanel(layer){const zone=ZONES.find(z=>z.id===selectedId)||ZONES[0];const ctx=contextFor(zone);const flags=[];if(zone.id===getHomeDistrict())flags.push("Hjem");if(workMatches(zone))flags.push("Aktiv arbeidssone");if(inboxCount()>0&&zone.id==="sentrum")flags.push("Åpne hendelser");const panel=layer.querySelector(".civi-system-panel");if(!panel)return;panel.innerHTML=`<div class="civi-system-panel-head"><strong>Sone</strong><button class="civi-system-control-btn" type="button" data-civi-minimize-panel aria-label="Minimer sonepanel" aria-expanded="true">−</button></div><div class="civi-system-panel-body"><div class="civi-system-panel-kicker">Sone / tilgang</div><h3>${esc(zone.icon)} ${esc(zone.name)}</h3><p class="civi-system-panel-summary">${esc(zone.summary)}</p><div class="civi-system-tags">${(flags.length?flags:["Kartlag"]).map(x=>`<span class="civi-system-tag">${esc(x)}</span>`).join("")}</div><div class="civi-system-access-grid"><div class="civi-system-access-item"><span>Arbeid</span><strong>${esc(list(ctx.work))}</strong></div><div class="civi-system-access-item"><span>Bolig</span><strong>${esc(list(ctx.housing))}</strong></div><div class="civi-system-access-item"><span>Butikk</span><strong>${esc(list(ctx.store))}</strong></div><div class="civi-system-access-item"><span>Mennesker</span><strong>${esc(list(ctx.people))}</strong></div><div class="civi-system-access-item"><span>Debatt</span><strong>${esc(list(ctx.debate))}</strong></div><div class="civi-system-access-item"><span>Fritid</span><strong>${esc(list(ctx.leisure))}</strong></div></div></div>`;panel.querySelector("[data-civi-minimize-panel]")?.addEventListener("click",()=>{panelMinimized=!panelMinimized;syncMinimizedState(layer)});syncMinimizedState(layer)}
  function render(){const layer=ensureLayer();if(!layer)return;if(!selectedId)selectedId=getHomeDistrict()||"sentrum";const home=getHomeDistrict();layer.querySelector("[data-civi-map-role]").textContent=activeLabel();layer.querySelector("[data-civi-map-home]").textContent=home||"Ikke valgt";layer.querySelector("[data-civi-map-inbox]").textContent=`${inboxCount()} / ${capitalSum()} kap.`;const zones=layer.querySelector(".civi-system-zones");zones.innerHTML=ZONES.map(zoneHtml).join("");zones.querySelectorAll("[data-zone]").forEach(btn=>btn.addEventListener("click",()=>{selectedId=btn.getAttribute("data-zone");document.body.classList.add("civi-mapmode");render()}));renderPanel(layer);syncMinimizedState(layer)}
  let renderQueued=false;
  function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{renderQueued=false;render()}));}
  function bindMapButton(){document.getElementById("btnCiviMap")?.addEventListener("click",e=>{e.preventDefault();document.body.classList.toggle("civi-mapmode");render()})}
  async function loadContexts(){try{const json=await fetch(ACCESS_PATH,{cache:"no-store"}).then(r=>r.json());if(Array.isArray(json?.contexts))contexts=json.contexts}catch{contexts=FALLBACK_CONTEXTS}}
  async function boot(){bindMapButton();await loadContexts();render()}
  document.addEventListener("DOMContentLoaded",boot);
  ["civi:booted","civi:dataReady","civi:homeChanged","updateProfile"].forEach(ev=>window.addEventListener(ev,scheduleRender));
  window.addEventListener("storage",scheduleRender);
  window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(scheduleRender,120)});
  window.CivicationSystemMap={render,scheduleRender};
})();
