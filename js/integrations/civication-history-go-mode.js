// Civication-guided mode for History Go. Activated only by a session written by
// CivicationHistoryGoDeepLink; it never owns Civication task state.
(function () {
  "use strict";
  const W = /** @type {any} */ (window);
  const SESSION_KEY = "hg_civication_mode_v1";
  const ROOT_ID = "hgCivicationModeToast";
  const TTL = 24 * 60 * 60 * 1000;
  const s = (v) => v == null ? "" : String(v).trim();
  const read = (k, fallback) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? fallback : v; } catch { return fallback; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const arr = (v) => Array.isArray(v) ? v.map(s).filter(Boolean) : (s(v) ? [s(v)] : []);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  function normalizeSession(v) {
    if (!v || typeof v !== "object" || v.active === false) return null;
    const started = Number(v.started_ts || Date.parse(s(v.started_at)) || 0);
    if (started && Date.now() - started > TTL) return null;
    const p = v.payload && typeof v.payload === "object" ? { ...v.payload } : {};
    return {
      ...v, version: 1, active: true, started_ts: started || Date.now(), payload: p,
      title: s(v.title || p.title) || "Civication-oppdrag",
      description: s(v.description || p.description),
      target_type: s(v.target_type || p.target_type), target_id: s(v.target_id || p.target_id),
      place_id: s(v.place_id || p.place_id), quiz_id: s(v.quiz_id || p.quiz_id),
      category_id: s(v.category_id || p.category_id), emne_id: s(v.emne_id || p.emne_id),
      debate_id: s(v.debate_id || p.debate_id), conflict_id: s(v.conflict_id || p.conflict_id),
      unlock_id: s(v.unlock_id || p.unlock_id), required_kind: s(v.required_kind || p.required_kind),
      completion_mode: s(v.completion_mode || p.completion_mode), return_href: s(v.return_href) || "Civication.html",
      return_context: v.return_context && typeof v.return_context === "object" ? { ...v.return_context } : {},
      expanded: v.expanded === true
    };
  }
  const getSession = () => normalizeSession(read(SESSION_KEY, null));
  const saveSession = (v) => { const n = normalizeSession(v); return !!n && write(SESSION_KEY, n); };
  function endSession(reason = "return_to_civication") {
    const v = read(SESSION_KEY, null); if (!v || typeof v !== "object") return false;
    v.active = false; v.ended_at = new Date().toISOString(); v.end_reason = reason;
    const ok = write(SESSION_KEY, v); remove(); return ok;
  }

  function asSet(v) { const out = new Set(); if (Array.isArray(v)) v.forEach(x => s(x) && out.add(s(x))); else if (v && typeof v === "object") Object.keys(v).forEach(k => v[k] && out.add(s(k))); return out; }
  function bucket(key, sub) { const v = read(key, {}); return v?.[sub] && typeof v[sub] === "object" ? v[sub] : {}; }
  function readHistoryGoState() {
    return { visitedPlaces: asSet(read("visited_places", [])), unlockByQuiz: bucket("hg_unlocks_v1", "byQuiz"), quizProgress: read("quiz_progress", {}) || {}, merits: read("merits_by_category", {}) || {}, readStories: bucket("hg_reads_v1", "stories"), readLeksikon: bucket("hg_reads_v1", "leksikon"), readPersons: bucket("hg_reads_v1", "persons"), debateById: bucket("hg_debate_log_v1", "byId"), debateByConflict: bucket("hg_debate_log_v1", "byConflict") };
  }
  function has(bucketObj, field, id) { const wanted = s(id); if (!wanted) return false; if (bucketObj[wanted]) return true; return Object.values(bucketObj).some(row => row && field && s(row[field]) === wanted); }
  function evaluateCompletion(session, state = readHistoryGoState()) {
    const x = normalizeSession(session); if (!x) return { completed:false, correct:false, source:null };
    const mode = x.completion_mode, type = x.target_type;
    const unlocked = (id) => !!(s(id) && state.unlockByQuiz[s(id)]);
    const result = (completed, source, correct = completed) => ({ completed:!!completed, correct:!!correct, source:completed ? source : null });
    if (type === "place") {
      if (mode === "open_place" || mode === "visit_place") return result(x.place_id && state.visitedPlaces.has(x.place_id), "visited_places");
      if (mode === "place_quiz") return result(unlocked(x.quiz_id), "unlock_index");
      if (mode === "read_story") return result(has(state.readStories, "placeId", x.place_id || x.target_id), "reads_story");
    }
    if (type === "person") {
      if (mode === "person_quiz") return result(unlocked(x.quiz_id), "unlock_index");
      if (mode === "open_person" || mode === "read_profile") return result(has(state.readPersons, null, x.target_id || x.payload.person_id), "reads_person");
    }
    if (type === "knowledge") {
      if (mode === "correct_answer") return result(unlocked(x.quiz_id), "unlock_index");
      if (mode === "quiz_completed") {
        if (unlocked(x.quiz_id)) return result(true, "unlock_index");
        if (x.quiz_id && state.quizProgress[x.quiz_id]) return result(true, "quiz_progress", false);
        return result(x.category_id && Number(state.merits?.[x.category_id]?.points || 0) > 0, "merits");
      }
      if (mode === "read_leksikon") return result(has(state.readLeksikon, "emneId", x.emne_id) || has(state.readLeksikon, "categoryId", x.category_id) || has(state.readLeksikon, null, x.target_id), "reads_leksikon");
    }
    if (type === "unlock") return result(x.unlock_id && (unlocked(x.unlock_id) || state.visitedPlaces.has(x.unlock_id)), "unlock_index");
    if (type === "debate") {
      const ids = [x.debate_id, x.conflict_id, x.target_id].map(s).filter(Boolean); let row = null;
      for (const id of ids) { row = state.debateById[id] || state.debateById[state.debateByConflict[id]]; if (row) break; }
      return result(row && (mode === "position_chosen" ? row.position : row.participated), "debate_log");
    }
    return result(false, null);
  }

  function pos() { const p = W.HG_POS || W.currentPos || {}; const lat = Number(p.lat ?? W.userLat), lon = Number(p.lon ?? W.userLon); return Number.isFinite(lat) && Number.isFinite(lon) ? {lat,lon} : null; }
  function distance(place) {
    const p = pos(); if (!p) return null;
    const helper = W.HGNearbyPlaceSelector?.getPlaceDistanceMeters; if (typeof helper === "function") { const d = Number(helper(place, p)); if (Number.isFinite(d)) return d; }
    const lat = Number(place?.lat), lon = Number(place?.lon); if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const r = Math.PI/180, a = Math.sin((lat-p.lat)*r/2)**2 + Math.cos(p.lat*r)*Math.cos(lat*r)*Math.sin((lon-p.lon)*r/2)**2; return 12742000*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  function tokens(place) { return new Set([place?.id,place?.name,place?.title,place?.category,place?.category_id,place?.domain,place?.subject_id,...arr(place?.categories),...arr(place?.tags),...arr(place?.emne_ids),...arr(place?.emner),...arr(place?.knowledge?.tags)].map(v=>s(v).toLowerCase()).filter(Boolean)); }
  function suggestPlaces(session, places = W.PLACES) {
    const x = normalizeSession(session); if (!x) return [];
    const exact = new Set([x.place_id, x.target_type === "place" ? x.target_id : "", x.required_kind === "place" ? x.unlock_id : ""].map(v=>s(v).toLowerCase()).filter(Boolean));
    const strong = new Set([x.emne_id,...arr(x.payload.emne_ids)].map(v=>v.toLowerCase()).filter(Boolean));
    const broad = new Set([x.category_id,...arr(x.payload.category_ids),...arr(x.payload.subject_ids),...arr(x.payload.tags)].map(v=>v.toLowerCase()).filter(Boolean));
    return (Array.isArray(places)?places:[]).filter(p=>p && !p.hidden && !p.stub && s(p.id)).map(place=>{
      const t=tokens(place), id=s(place.id).toLowerCase(); let score=exact.has(id)?1000:0;
      if ([...strong].some(v=>t.has(v))) score+=240; if ([...broad].some(v=>t.has(v))) score+=110;
      const d=distance(place); if (Number.isFinite(d)) score+=Math.max(0,45-Math.min(45,d/500)); return {place,score,distance:d};
    }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score || (a.distance??Infinity)-(b.distance??Infinity)).slice(0,3);
  }
  function formatDistance(d) { if (!Number.isFinite(d)) return ""; return d < 1000 ? `${Math.max(10,Math.round(d/10)*10)} m` : `${(d/1000).toFixed(d<10000?1:0).replace(".",",")} km`; }
  const name = (p) => s(p?.name || p?.title || p?.id) || "History Go-sted";
  function contextLabel(x) { return s(x.role_label || x.life_role_label || x.role_id || x.life_role_id) || "oppdrag"; }
  function routeHit(x) { const h=s(location.hash); return (x.place_id && h===`#/place/${encodeURIComponent(x.place_id)}`) || (x.quiz_id && h===`#/quiz/${encodeURIComponent(x.quiz_id)}`) || ((x.debate_id||x.conflict_id) && h===`#/debate/${encodeURIComponent(x.debate_id||x.conflict_id)}`); }
  function getProgress(session, state) { const x=normalizeSession(session), done=evaluateCompletion(x,state); return done.completed?{current:3,total:3,completed:true}:routeHit(x)?{current:2,total:3,completed:false}:{current:1,total:3,completed:false}; }
  function goPlace(id){ if(!s(id)) return false; if(W.HGAppRouter?.toPlace) return W.HGAppRouter.toPlace(id); location.hash=`#/place/${encodeURIComponent(id)}`; return true; }
  function goQuiz(id){ if(!s(id)) return false; if(W.HGAppRouter?.toQuiz) return W.HGAppRouter.toQuiz(id); location.hash=`#/quiz/${encodeURIComponent(id)}`; return true; }
  function navigatePrimary(session){ const x=normalizeSession(session); if(!x)return false; if(x.place_id)return goPlace(x.place_id); if(x.quiz_id)return goQuiz(x.quiz_id); if(x.debate_id||x.conflict_id){const id=x.debate_id||x.conflict_id;if(W.HGAppRouter?.toDebate)return W.HGAppRouter.toDebate(id);location.hash=`#/debate/${encodeURIComponent(id)}`;return true;} return W.HGAppRouter?.toMap?.()??false; }

  function ensureStyles(){ if(document.getElementById("hgCiviModeStyles"))return; const el=document.createElement("style"); el.id="hgCiviModeStyles"; el.textContent=`#${ROOT_ID}{position:fixed;z-index:2147482000;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 86px);transform:translateX(-50%);width:min(720px,calc(100vw - 20px));background:#090a0dF5;color:#fff;border:1px solid #ffffff29;border-radius:15px;box-shadow:0 14px 42px #0008;font:13px system-ui}#${ROOT_ID} *{box-sizing:border-box}#${ROOT_ID} .top{display:flex;align-items:center;gap:10px;padding:10px}#${ROOT_ID} .toggle{display:flex;align-items:center;gap:9px;min-width:0;flex:1;background:none;border:0;color:#fff;text-align:left}#${ROOT_ID} .mark{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#fff;color:#000;font-weight:900}#${ROOT_ID} .copy{min-width:0;flex:1}#${ROOT_ID} small{display:block;color:#aaa}#${ROOT_ID} strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${ROOT_ID} button{cursor:pointer;font:inherit}#${ROOT_ID} .ret{border:0;border-radius:9px;padding:8px;background:#fff;color:#000;font-weight:800}#${ROOT_ID} .body{display:none;border-top:1px solid #ffffff1c;padding:10px}#${ROOT_ID}.expanded .body{display:block}#${ROOT_ID} .desc{margin:0 0 8px;color:#ddd}#${ROOT_ID} .places{display:grid;gap:6px;margin:8px 0}#${ROOT_ID} .place,#${ROOT_ID} .action{border:1px solid #ffffff24;background:#ffffff0f;color:#fff;border-radius:9px;padding:8px}#${ROOT_ID} .place{display:flex;justify-content:space-between;text-align:left}#${ROOT_ID} .actions{display:flex;gap:6px;flex-wrap:wrap}`; document.head.appendChild(el); }
  function render(){
    if(typeof document==="undefined"||!document.body)return null; const x=getSession(); if(!x){remove();return null;} ensureStyles(); const state=readHistoryGoState(), done=evaluateCompletion(x,state), prog=getProgress(x,state), suggestions=suggestPlaces(x), first=suggestions[0];
    let node=document.getElementById(ROOT_ID); if(!node){node=document.createElement("aside");node.id=ROOT_ID;node.setAttribute("aria-label","Civication-modus");document.body.appendChild(node);} node.classList.toggle("expanded",x.expanded);
    node.innerHTML=`<div class="top"><button class="toggle" data-civi-toggle><span class="mark">C</span><span class="copy"><small>Civication · ${esc(contextLabel(x))} · ${prog.current}/${prog.total}</small><strong>${done.completed?"✓ ":""}${esc(x.title)}</strong></span></button><button class="ret" data-civi-return>Tilbake til Civication</button></div><div class="body">${x.description?`<p class="desc">${esc(x.description)}</p>`:""}<strong>${esc(done.completed?"Oppgaven er registrert. Du kan gå tilbake til Civication.":first?`Neste relevante sted: ${name(first.place)}`:"Fortsett oppgaven i History Go.")}</strong><div class="places">${suggestions.map(r=>`<button class="place" data-civi-place="${esc(r.place.id)}"><span>${esc(name(r.place))}</span><span>${esc(formatDistance(r.distance))}</span></button>`).join("")||"Ingen sikre stedsforslag ennå"}</div><div class="actions">${x.quiz_id?`<button class="action" data-civi-quiz="${esc(x.quiz_id)}">Ta quiz</button>`:""}${x.place_id?`<button class="action" data-civi-primary>Vis målsted</button>`:""}<button class="action" data-civi-map>Vis kart</button></div></div>`; return node;
  }
  function returnToCivication(){ const x=getSession(); const href=x&&/^Civication\.html(?:[?#].*)?$/i.test(x.return_href)?x.return_href:"Civication.html"; endSession(); location.href=href; return true; }
  function remove(){ try{document.getElementById(ROOT_ID)?.remove();}catch{} }
  function onClick(e){ const t=e.target;if(!t?.closest||!t.closest(`#${ROOT_ID}`))return; if(t.closest("[data-civi-return]")){e.preventDefault();returnToCivication();return;} if(t.closest("[data-civi-toggle]")){e.preventDefault();const x=getSession();if(x){x.expanded=!x.expanded;saveSession(x);render();}return;} const p=t.closest("[data-civi-place]");if(p){e.preventDefault();goPlace(p.getAttribute("data-civi-place"));return;} const q=t.closest("[data-civi-quiz]");if(q){e.preventDefault();goQuiz(q.getAttribute("data-civi-quiz"));return;} if(t.closest("[data-civi-primary]")){e.preventDefault();navigatePrimary(getSession());return;} if(t.closest("[data-civi-map]")){e.preventDefault();if(W.HGAppRouter?.toMap)W.HGAppRouter.toMap();else location.hash="#/map";} }
  let queued=false; function schedule(){if(queued)return;queued=true;(typeof requestAnimationFrame==="function"?requestAnimationFrame:setTimeout)(()=>{queued=false;try{render();}catch{}},0);}
  function boot(){ if(typeof document==="undefined")return false; document.addEventListener("click",onClick); ["hashchange","hg:appReady","hg:routerReady","hg:geo","hg:placeDiscovered","hg:unlocks","updateProfile","resize"].forEach(n=>window.addEventListener(n,schedule)); window.addEventListener("storage",schedule); render(); setTimeout(schedule,900); return true; }

  W.HGCivicationMode={SESSION_KEY,normalizeSession,getSession,saveSession,endSession,readHistoryGoState,evaluateCompletion,getProgress,suggestPlaces,formatDistance,navigatePrimary,returnToCivication,render,boot,remove};
  if(typeof document!=="undefined"){ if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot(); }
})();
