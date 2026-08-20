const HG_TOAST_READY_DELAY_MS = 260;
const HG_TOAST_QUEUE_STAGGER_MS = 350;
const pendingToasts = [];
let toastReadyListenerBound = false;
let toastQueueFlushing = false;

function getToastDuration(msg) {
  const text = String(msg || "").trim();
  const len = text.length;

  if (len <= 20) return 1400;
  if (len <= 55) return 2300;
  if (len <= 110) return 3600;
  return 5200;
}

function ensureToastElement() {
  let toast = window.el?.toast || document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body?.appendChild(toast);
  }

  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");

  window.el = window.el || {};
  window.el.toast = toast;

  return toast;
}

function isWaitingForIndexAppReady() {
  return !!document.body?.classList.contains("hg-app")
    && window.__HG_APP_READY__ !== true
    && !document.body?.classList.contains("hg-loaded");
}

function normalizeToastArgs(ms, options) {
  if (ms && typeof ms === "object" && !Array.isArray(ms)) {
    return { ms: null, options: ms };
  }

  return {
    ms,
    options: options && typeof options === "object" ? options : {}
  };
}

function applyToastPresentation(toast, closeBtn, options = {}) {
  const compact = options.compact === true;

  if (compact) {
    toast.style.width = "auto";
    toast.style.maxWidth = "min(420px, calc(100vw - 32px))";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "18px";
    toast.style.fontSize = "15px";
    toast.style.fontWeight = "700";
    toast.style.textAlign = "center";
    closeBtn.style.display = "none";
    return;
  }

  toast.style.removeProperty("width");
  toast.style.removeProperty("max-width");
  toast.style.removeProperty("padding");
  toast.style.removeProperty("border-radius");
  toast.style.removeProperty("font-size");
  toast.style.removeProperty("font-weight");
  toast.style.removeProperty("text-align");
  closeBtn.style.removeProperty("display");
}

function showToastNow(msg, ms = null, options = {}) {
  const tt = (key, fallback) => window.HG_I18N?.t?.(key, fallback) || fallback;
  const t = /** @type {HTMLElement & { _hide?: any }} */ (ensureToastElement());

  clearTimeout(t._hide);
  t._hide = null;

  t.innerHTML = "";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", tt("ui.toast.closeMessage", "Lukk melding"));
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    clearTimeout(t._hide);
    t._hide = null;
    t.style.display = "none";
  });

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = String(msg || "");

  t.appendChild(closeBtn);
  t.appendChild(body);

  const compactByDuration = Number.isFinite(ms) && Number(ms) <= 1600;
  applyToastPresentation(t, closeBtn, {
    ...options,
    compact: options.compact === true || (options.compact !== false && compactByDuration)
  });
  t.style.display = "block";

  const duration = Number.isFinite(ms) ? Number(ms) : getToastDuration(msg);

  if (duration > 0) {
    t._hide = setTimeout(() => {
      t.style.display = "none";
    }, duration);
  }
}

function flushPendingToasts() {
  if (toastQueueFlushing || !pendingToasts.length) return;
  toastQueueFlushing = true;

  const queue = pendingToasts.splice(0);
  queue.forEach((item, index) => {
    setTimeout(() => {
      showToastNow(item.msg, item.ms, item.options);
      if (index === queue.length - 1) toastQueueFlushing = false;
    }, HG_TOAST_READY_DELAY_MS + index * HG_TOAST_QUEUE_STAGGER_MS);
  });
}

function ensureToastReadyListener() {
  if (toastReadyListenerBound) return;
  toastReadyListenerBound = true;

  window.addEventListener("hg:appReady", flushPendingToasts, { once: true });
}

function showToast(msg, ms = null, options = null) {
  const normalized = normalizeToastArgs(ms, options);

  if (isWaitingForIndexAppReady()) {
    pendingToasts.push({
      msg,
      ms: normalized.ms,
      options: normalized.options
    });
    ensureToastReadyListener();
    return;
  }

  showToastNow(msg, normalized.ms, normalized.options);
}

const earlyToastQueue = Array.isArray(window.__HG_EARLY_TOAST_QUEUE__)
  ? window.__HG_EARLY_TOAST_QUEUE__.splice(0)
  : [];

// config.js installerer en tidlig bridge før app.js starter. Når den gamle
// app-køen senere gjenoppretter bridgen, skal den fortsatt delegere hit i stedet
// for å gjøre den virkelige toast-runtime utilgjengelig igjen.
window.__HG_REAL_SHOW_TOAST__ = showToast;
window.showToast = showToast;
window.API = window.API || {};
window.API.showToast = showToast;

earlyToastQueue.forEach((args) => {
  if (Array.isArray(args)) showToast(...args);
});

// Persistent Civication mission toast mode.
// Civication mission mode for History Go. State lives only in shared localStorage.
(function () {
  "use strict";
  const W = /** @type {any} */ (window), KEY = "hg_civication_mode_v1", ROOT = "hgCivicationModeToast";
  const s = (v) => v == null ? "" : String(v).trim();
  const j = (k, f = {}) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? f; } catch { return f; } };
  const a = (v) => Array.isArray(v) ? v.map(s).filter(Boolean) : (s(v) ? [s(v)] : []);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  function norm(v) {
    if (!v || typeof v !== "object" || v.active === false) return null;
    const ts = Number(v.started_ts || Date.parse(s(v.started_at)) || 0); if (ts && Date.now() - ts > 86400000) return null;
    const p = v.payload && typeof v.payload === "object" ? { ...v.payload } : {};
    const x = (k) => s(v[k] || p[k]);
    return { ...v, active:true, started_ts:ts||Date.now(), started_at:s(v.started_at)||new Date().toISOString(), title:x("title")||"Civication-oppdrag", description:x("description"), target_type:x("target_type"), target_id:x("target_id"), place_id:x("place_id"), person_id:x("person_id"), quiz_id:x("quiz_id"), category_id:x("category_id"), emne_id:x("emne_id"), debate_id:x("debate_id"), conflict_id:x("conflict_id"), unlock_id:x("unlock_id"), required_kind:x("required_kind"), completion_mode:x("completion_mode"), return_href:s(v.return_href)||"Civication.html", expanded:v.expanded===true, payload:p };
  }
  const get = () => norm(j(KEY, null));
  const save = (x) => { x = norm(x); if (!x) return false; try { localStorage.setItem(KEY, JSON.stringify(x)); return true; } catch { return false; } };
  function end() { try { localStorage.removeItem(KEY); } catch {} remove(); return true; }
  const sub = (k,n) => { const x=j(k,{}); return x&&typeof x[n]==="object"?x[n]:{}; };
  const set = (v) => new Set(Array.isArray(v)?v.map(s).filter(Boolean):Object.keys(v||{}).filter(k=>v[k]));
  function state() { return { visitedPlaces:set(j("visited_places",[])), unlockByQuiz:sub("hg_unlocks_v1","byQuiz"), quizProgress:j("quiz_progress",{}), merits:j("merits_by_category",{}), readLeksikon:sub("hg_reads_v1","leksikon"), readStories:sub("hg_reads_v1","stories"), readPersons:sub("hg_reads_v1","persons"), debateById:sub("hg_debate_log_v1","byId"), debateByConflict:sub("hg_debate_log_v1","byConflict") }; }
  const has = (b,f,id) => { id=s(id); return !!(id && (b[id] || Object.values(b).some(r=>r&&f&&s(r[f])===id))); };
  function done(v, st=state()) {
    const x=norm(v); if(!x) return {completed:false,correct:false,source:null}; const q=(id)=>!!(s(id)&&st.unlockByQuiz[s(id)]), out=(ok,source,correct=ok)=>({completed:!!ok,correct:!!correct,source:ok?source:null}), m=x.completion_mode;
    if(x.target_type==="place") { if(m==="open_place"||m==="visit_place") return out(st.visitedPlaces.has(x.place_id),"visited_places"); if(m==="place_quiz") return out(q(x.quiz_id),"unlock_index"); if(m==="read_story") return out(has(st.readStories,"placeId",x.place_id||x.target_id),"reads_story"); }
    if(x.target_type==="person") { if(m==="person_quiz") return out(q(x.quiz_id),"unlock_index"); return out(has(st.readPersons,null,x.person_id||x.target_id),"reads_person"); }
    if(x.target_type==="knowledge") { if(q(x.quiz_id)) return out(true,"unlock_index"); if(m==="quiz_completed"&&x.quiz_id&&st.quizProgress[x.quiz_id]) return out(true,"quiz_progress",false); if(m==="read_leksikon") return out(has(st.readLeksikon,"emneId",x.emne_id)||has(st.readLeksikon,"categoryId",x.category_id)||has(st.readLeksikon,null,x.target_id),"reads_leksikon"); return out(x.category_id&&Number(st.merits?.[x.category_id]?.points||0)>0,"merits"); }
    if(x.target_type==="unlock") return out(q(x.unlock_id)||st.visitedPlaces.has(x.unlock_id),"unlock_index");
    if(x.target_type==="debate") { const ids=[x.debate_id,x.conflict_id,x.target_id].filter(Boolean), r=ids.map(id=>st.debateById[id]||st.debateById[st.debateByConflict[id]]).find(Boolean); return out(r&&(m==="position_chosen"?r.position:r.participated),"debate_log"); }
    return out(false,null);
  }
  function progress(v,st) { if(done(v,st).completed) return {current:3,total:3,completed:true}; const x=norm(v), h=s(location.hash), on=(x?.place_id&&h===`#/place/${encodeURIComponent(x.place_id)}`)||(x?.quiz_id&&h===`#/quiz/${encodeURIComponent(x.quiz_id)}`)||((x?.debate_id||x?.conflict_id)&&h===`#/debate/${encodeURIComponent(x.debate_id||x.conflict_id)}`); return {current:on?2:1,total:3,completed:false}; }
  function dist(p) { const q=W.HG_POS||W.currentPos||{}, lat=Number(q.lat??W.userLat), lon=Number(q.lon??W.userLon); if(!Number.isFinite(lat)||!Number.isFinite(lon)) return null; try { const d=Number(W.HGNearbyPlaceSelector?.getPlaceDistanceMeters?.(p,{lat,lon})); if(Number.isFinite(d)) return d; } catch{} const y=Number(p?.lat),x=Number(p?.lon); if(!Number.isFinite(y)||!Number.isFinite(x)) return null; const r=Math.PI/180,A=Math.sin((y-lat)*r/2)**2+Math.cos(lat*r)*Math.cos(y*r)*Math.sin((x-lon)*r/2)**2; return 12742000*Math.atan2(Math.sqrt(A),Math.sqrt(1-A)); }
  function score(p,v) { const x=norm(v); if(!x||!p||p.hidden||p.stub||!s(p.id)) return -Infinity; const T=new Set([p.id,p.name,p.title,p.category,p.category_id,p.domain,p.subject_id,...a(p.categories),...a(p.tags),...a(p.emne_ids),...a(p.emner),...a(p.knowledge?.tags)].map(z=>s(z).toLowerCase()).filter(Boolean)); const id=s(p.id).toLowerCase(), exact=[x.place_id,x.target_type==="place"?x.target_id:"",x.required_kind==="place"?x.unlock_id:""].map(z=>s(z).toLowerCase()), strong=[x.emne_id,...a(x.payload.emne_ids)].map(z=>s(z).toLowerCase()), broad=[x.category_id,...a(x.payload.category_ids),...a(x.payload.subject_ids),...a(x.payload.tags)].map(z=>s(z).toLowerCase()); let n=exact.includes(id)?1000:0; if(strong.some(z=>T.has(z)))n+=240;if(broad.some(z=>T.has(z)))n+=110;const d=dist(p);if(Number.isFinite(d))n+=Math.max(0,45-Math.min(45,d/500));return n; }
  function suggestions(v, explicit) { let src=Array.isArray(explicit)?explicit:[]; if(!src.length)try{src=W.HGNearbyPlaceSelector?.select?.()?.items||[];}catch{} if(!src.length)src=Array.isArray(W.PLACES)?W.PLACES.slice():[]; const x=norm(v), exact=s(x?.place_id||(x?.target_type==="place"?x?.target_id:"")); if(exact&&!src.some(p=>s(p?.id)===exact)){const p=(W.PLACES||[]).find(p=>s(p?.id)===exact);if(p)src.unshift(p);} return src.map(place=>({place,score:score(place,v),distance:dist(place)})).filter(r=>Number.isFinite(r.score)&&r.score>0).sort((u,v)=>v.score-u.score||(u.distance??Infinity)-(v.distance??Infinity)).slice(0,3); }
  const fd=(m)=>!Number.isFinite(m)?"":m<1000?`${Math.max(10,Math.round(m/10)*10)} m`:`${(m/1000).toFixed(m<10000?1:0).replace(".",",")} km`;
  function css(){if(document.getElementById(ROOT+"Css"))return;const e=document.createElement("style");e.id=ROOT+"Css";e.textContent=`#${ROOT}{position:fixed;z-index:2147482000;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 86px);transform:translateX(-50%);width:min(700px,calc(100vw - 16px));background:#090a0ef5;color:#fff;border:1px solid #ffffff2b;border-radius:14px;font:13px system-ui;box-shadow:0 12px 40px #0007}#${ROOT} button{font:inherit;cursor:pointer}#${ROOT} .top,#${ROOT} .row,#${ROOT} .actions{display:flex;align-items:center;gap:8px}#${ROOT} .top{padding:9px}#${ROOT} .toggle{flex:1;display:flex;align-items:center;gap:8px;min-width:0;border:0;background:none;color:#fff;text-align:left}#${ROOT} .mark{display:grid;place-items:center;width:25px;height:25px;border-radius:7px;background:#fff;color:#000;font-weight:900}#${ROOT} .copy{min-width:0}#${ROOT} small{display:block;color:#ffffffa8}#${ROOT} strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${ROOT} .return{border:0;border-radius:9px;padding:7px 9px;font-weight:800}#${ROOT} .body{display:none;border-top:1px solid #ffffff1c;padding:9px}#${ROOT}.open .body{display:block}#${ROOT}.pc .body{display:none!important}#${ROOT} p{margin:0 0 7px;color:#ffffffcf}#${ROOT} .row{justify-content:space-between;padding:5px 0}#${ROOT} .places{display:grid;gap:5px;margin:4px 0 8px}#${ROOT} .place,#${ROOT} .action{border:1px solid #ffffff24;background:#ffffff10;color:#fff;border-radius:8px;padding:6px 8px}#${ROOT} .place{display:flex;justify-content:space-between}#${ROOT} .muted{color:#ffffff88;white-space:nowrap}`;document.head.appendChild(e);}
  const card=()=>document.getElementById("placeCard")||document.querySelector(".place-card"), cardOpen=()=>{const c=card();return!!(c&&c.getAttribute("aria-hidden")!=="true")};
  const goPlace=(id)=>W.HGAppRouter?.toPlace?.(id)??(location.hash=`#/place/${encodeURIComponent(id)}`,true), goQuiz=(id)=>W.HGAppRouter?.toQuiz?.(id)??(location.hash=`#/quiz/${encodeURIComponent(id)}`,true);
  function primary(v){const x=norm(v);if(!x)return false;if(x.place_id)return goPlace(x.place_id);if(x.quiz_id)return goQuiz(x.quiz_id);if(x.debate_id||x.conflict_id)return W.HGAppRouter?.toDebate?.(x.debate_id||x.conflict_id)??false;return W.HGAppRouter?.toMap?.()??false;}
  function back(){const x=get(),raw=s(x?.return_href)||"Civication.html",href=/^Civication\.html(?:[?#].*)?$/i.test(raw)?raw:"Civication.html";end();location.href=href;return true;}
  function render(){if(typeof document==="undefined"||!document.body)return null;const x=get();if(!x){remove();return null;}css();const st=state(),d=done(x,st),p=progress(x,st),S=suggestions(x),first=S[0],label=s(x.role_label||x.life_role_label||x.role_id||x.life_role_id)||"oppdrag";let n=document.getElementById(ROOT);if(!n){n=document.createElement("aside");n.id=ROOT;n.setAttribute("aria-label","Civication-modus");document.body.appendChild(n);}n.classList.toggle("open",x.expanded&&!cardOpen());n.classList.toggle("pc",cardOpen());const rows=S.length?S.map(r=>`<button class="place" data-place="${esc(r.place.id)}"><span>${esc(r.place.name||r.place.title||r.place.id)}</span><span class="muted">${esc(fd(r.distance))}</span></button>`).join(""):`<div class="row"><span>Ingen sikre stedsforslag ennå</span><span class="muted">Bruk kartet</span></div>`,next=d.completed?"Oppgaven er registrert. Du kan gå tilbake til Civication.":first?`Neste relevante sted: ${s(first.place.name||first.place.title||first.place.id)}`:"Fortsett oppgaven i History Go.";n.innerHTML=`<div class="top"><button class="toggle" data-toggle><span class="mark">C</span><span class="copy"><small>Civication · ${esc(label)} · ${p.current}/${p.total}</small><strong>${d.completed?"✓ ":""}${esc(x.title)}</strong></span></button><button class="return" data-return>Tilbake til Civication</button></div><div class="body">${x.description?`<p>${esc(x.description)}</p>`:""}<div class="row"><strong>${esc(next)}</strong>${first?`<span class="muted">${esc(fd(first.distance))}</span>`:""}</div><div class="places">${rows}</div><div class="actions">${x.quiz_id?`<button class="action" data-quiz="${esc(x.quiz_id)}">Ta quiz</button>`:""}${x.place_id?`<button class="action" data-primary>Vis målsted</button>`:""}<button class="action" data-map>Vis kart</button></div></div>`;const c=card();n.style.bottom=cardOpen()&&c?`${Math.max(12,Math.round(innerHeight-c.getBoundingClientRect().top+8))}px`:"calc(env(safe-area-inset-bottom,0px) + 86px)";return n;}
  function click(e){const t=e?.target;if(!t?.closest||!t.closest(`#${ROOT}`))return;if(t.closest("[data-return]")){e.preventDefault();back();return;}if(t.closest("[data-toggle]")){e.preventDefault();const x=get();x.expanded=!x.expanded;save(x);render();return;}const p=t.closest("[data-place]");if(p){e.preventDefault();goPlace(p.getAttribute("data-place"));return;}const q=t.closest("[data-quiz]");if(q){e.preventDefault();goQuiz(q.getAttribute("data-quiz"));return;}if(t.closest("[data-primary]")){e.preventDefault();primary(get());return;}if(t.closest("[data-map]")){e.preventDefault();W.HGAppRouter?.toMap?.();}}
  function remove(){try{document.getElementById(ROOT)?.remove();}catch{}}
  let queued=false;function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;try{render();}catch{}},0);}let booted=false;function boot(){if(booted||typeof document==="undefined")return false;booted=true;document.addEventListener("click",click);["hashchange","hg:appReady","hg:routerReady","hg:geo","hg:placeDiscovered","hg:unlocks","updateProfile","resize","storage"].forEach(n=>window.addEventListener(n,schedule));render();setTimeout(schedule,1000);return true;}
  W.HGCivicationMode={SESSION_KEY:KEY,normalizeSession:norm,getSession:get,saveSession:save,endSession:end,readHistoryGoState:state,evaluateCompletion:done,getProgress:progress,scorePlace:score,suggestPlaces:suggestions,formatDistance:fd,navigatePrimary:primary,returnToCivication:back,render,boot,remove};
  if(typeof document!=="undefined")document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
})();
