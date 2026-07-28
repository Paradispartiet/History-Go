// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical presentasjonskontrakt: 4 eller 6 visuelle rundinger, uten DOM-observer-loop.
(function installVisualPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id: "badges", label: "Merker", fallbackIcon: "🏅", iconId: "pcBadgesIcon", listId: "pcBadgesList", kind: "badges" },
    { id: "people", label: "Personer", fallbackIcon: "👥", iconId: "pcPeopleIcon", listId: "pcPeopleList", kind: "people" },
    { id: "works", label: "Verk", fallbackIcon: "🎭", iconId: "pcWorksIcon", listId: "pcWorksList", kind: "works" },
    { id: "objects", label: "Gjenstander", fallbackIcon: "🏺", iconId: "pcObjectsIcon", listId: "pcObjectsList", kind: "objects" },
    { id: "details", label: "Detaljer", fallbackIcon: "🔎", iconId: "pcDetailsIcon", listId: "pcDetailsList", kind: "details" },
    { id: "spots", label: "Punkter", fallbackIcon: "📍", iconId: "pcSpotsIcon", listId: "pcSpotsList", kind: "spots" },
    { id: "nature", label: "Natur", fallbackIcon: "🌿", iconId: "pcNatureIcon", listId: "pcNatureList", kind: "nature" },
    { id: "brands", label: "Brands", fallbackIcon: "🏷️", iconId: "pcBrandsIcon", listId: "pcBrandsList", kind: "brands" }
  ]);
  const IDS = DEFS.map(def => def.id);
  const ID_SET = new Set(IDS);
  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const PRIORITIES = Object.freeze({
    historie:["badges","people","objects","spots","details","works","brands","nature"], historisk:["badges","people","objects","spots","details","works","brands","nature"],
    kunst:["badges","works","people","details","spots","objects","brands","nature"], politikk:["badges","people","spots","details","objects","works","brands","nature"],
    musikk:["badges","people","works","objects","spots","details","brands","nature"], litteratur:["badges","people","works","objects","spots","details","brands","nature"],
    sport:["badges","people","objects","spots","details","works","brands","nature"], natur:["badges","nature","spots","details","people","objects","works","brands"],
    vitenskap:["badges","people","objects","spots","details","works","brands","nature"], teknologi:["badges","objects","people","spots","details","works","brands","nature"],
    filosofi:["badges","people","works","spots","objects","details","brands","nature"], film_tv:["badges","people","works","spots","objects","details","brands","nature"],
    by:["badges","works","spots","details","people","objects","brands","nature"], lekeplass:["badges","spots","objects","nature","details","people","brands","works"],
    trening:["badges","people","spots","objects","details","brands","nature","works"], media:["badges","people","works","objects","spots","details","brands","nature"],
    psykologi:["badges","people","works","objects","spots","details","brands","nature"], religion:["badges","people","works","objects","spots","details","brands","nature"],
    scenekunst:["badges","people","works","spots","objects","details","brands","nature"], subkultur:["badges","people","works","details","spots","objects","brands","nature"],
    naeringsliv:["badges","brands","people","objects","spots","details","works","nature"], transport:["badges","spots","objects","details","people","works","brands","nature"]
  });
  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const uniq = values => [...new Set(arr(values).map(s).filter(Boolean))];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  let badgeBound = false;
  let scheduled = false;

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }
  function priority(placeOrCategory) {
    const category = s(typeof placeOrCategory === "string" ? placeOrCategory : placeOrCategory?.category || "by").toLowerCase();
    return PRIORITIES[category] || PRIORITIES.by;
  }
  function explicitIds(place) {
    const declared = arr(place?.rounds).length ? place.rounds : arr(place?.rundinger);
    return uniq(declared).filter(id => ID_SET.has(id));
  }
  function validExplicit(place) {
    const ids = explicitIds(place);
    return (ids.length === 4 || ids.length === 6) && ids.includes("badges");
  }
  function recommend(placeOrCategory, count = 4) { return priority(placeOrCategory).slice(0, count === 6 ? 6 : 4); }
  function imageFor(item) {
    return item && typeof item === "object" ? s(item.imageCard || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo) : "";
  }
  function iconHasImage(id) {
    return Boolean(s(document.getElementById(BY_ID.get(id)?.iconId)?.querySelector("img[src]")?.getAttribute("src")));
  }
  function civicationItems(place) {
    const id = s(place?.id);
    return [...arr(global.CIVICATION_STORE_BY_PLACE?.[id]), ...arr(place?.civication_store), ...arr(place?.civicationStore), ...arr(place?.civication_items), ...arr(place?.civicationItems), ...arr(place?.civication_store_items), ...arr(place?.civicationStoreItems)];
  }
  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(s(item.placeSpecificReason || item.place_specific_reason || item.historicalFunction || item.historical_function || item.material || item.objectType || item.object_type || item.kind || item.type) || item.physical === true || item.isPhysical === true || item.is_physical === true);
  }
  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind, raw:item };
    if (!item || typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.treasureTitle || item.id || `${sourceKind} ${index + 1}`);
    return { id:id || title, title, description:s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind), image:imageFor(item), sourceKind, raw:item, civicationId:sourceKind === "civication" ? id : "" };
  }
  function dedupe(items) {
    const seen = new Set();
    return items.filter(Boolean).filter(item => { const key=s(item.id || item.title).toLowerCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; });
  }
  function customItems(place, id) {
    if (!place) return [];
    let rows = [];
    if (id === "objects") rows = [...arr(place.objects).map(x=>[x,"objects"]), ...arr(place.artifacts).map(x=>[x,"artifacts"]), ...civicationItems(place).filter(physicalCivication).map(x=>[x,"civication"])];
    if (id === "details") rows = [...arr(place.details).map(x=>[x,"details"]), ...arr(place.visual_details).map(x=>[x,"details"]), ...arr(place.site_details).map(x=>[x,"details"])];
    if (id === "spots") rows = [...arr(place.spots).map(x=>[x,"spots"]), ...arr(place.subplaces).map(x=>[x,"subplaces"]), ...arr(place.subPlaces).map(x=>[x,"subplaces"])];
    return dedupe(rows.map(([item,kind], index) => normalizeItem(item,index,kind)));
  }
  function brandReady(place) {
    if (iconHasImage("brands")) return true;
    const placeId = s(place?.id);
    const values = [...arr(place?.brands), ...arr(place?.brand_ids), ...arr(global.BRANDS_BY_PLACE?.[placeId])];
    return values.some(item => {
      if (item && typeof item === "object") return Boolean(imageFor(item));
      const resolved = global.HGBrands?.getById?.(item);
      return Boolean(resolved && imageFor(resolved));
    });
  }
  function imageReady(place, id) {
    if (!place || !ID_SET.has(id)) return false;
    if (id === "badges") return iconHasImage(id) || arr(global.BADGES).some(b => s(b?.id) === s(place.category) && imageFor(b));
    if (id === "people") return iconHasImage(id) || arr(place.people).some(x => imageFor(x));
    if (id === "works") return iconHasImage(id) || arr(place.works).some(x => imageFor(x));
    if (["objects","details","spots"].includes(id)) return customItems(place,id).some(x => Boolean(x.image));
    if (id === "nature") return iconHasImage(id) || [...arr(place.nature),...arr(place.flora),...arr(place.fauna)].some(x => imageFor(x));
    if (id === "brands") return brandReady(place);
    return false;
  }
  function selectedIds(place) {
    const explicit = explicitIds(place);
    if (validExplicit(place)) return explicit;
    const p = priority(place);
    const excluded = new Set(uniq(place?.rounds_exclude).filter(id => id !== "badges"));
    const preferred = p.filter(id => id === "badges" || imageReady(place,id));
    const target = preferred.length >= 6 ? 6 : 4;
    const candidates = uniq([...preferred.filter(id=>id === "badges" || !excluded.has(id)), ...p.filter(id=>id === "badges" || !excluded.has(id)), ...p, ...IDS]);
    const out = candidates.slice(0,target);
    if (!out.includes("badges")) out.unshift("badges");
    return uniq(out).slice(0,target);
  }
  function readiness(place, ids = selectedIds(place)) {
    const selected = uniq(ids);
    const missingImages = selected.filter(id => !imageReady(place,id));
    return { selected, ready:selected.filter(id=>!missingImages.includes(id)), missingImages, complete:(selected.length === 4 || selected.length === 6) && missingImages.length === 0 };
  }
  function ensureDom() {
    const card=document.getElementById("placeCard"), grid=card?.querySelector(".pc-icons-quad"), body=card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    for (const def of DEFS.filter(d=>["objects","details","spots"].includes(d.id))) {
      if (!document.getElementById(def.iconId)) { const el=document.createElement("div"); el.id=def.iconId; el.className="pc-round"; el.hidden=true; el.setAttribute("role","button"); el.tabIndex=0; el.setAttribute("aria-label",def.label); grid.appendChild(el); }
      if (!document.getElementById(def.listId)) { const el=document.createElement("div"); el.id=def.listId; el.hidden=true; el.setAttribute("aria-hidden","true"); body.appendChild(el); }
    }
  }
  function renderCustom(place, def) {
    const icon=document.getElementById(def.iconId), list=document.getElementById(def.listId); if (!icon || !list) return;
    const items=customItems(place,def.id);
    const listSig=JSON.stringify(items.map(x=>[x.id,x.title,x.image,x.description]));
    if (list.dataset.visualSignature !== listSig) { list.dataset.visualSignature=listSig; list.innerHTML=items.length ? items.map(x=>`<article class="pc-person pc-visual-round-item" data-visual-round-item="${esc(x.id)}">${x.image?`<img src="${esc(x.image)}" class="pc-person-img" alt="">`:""}<div class="pc-person-meta"><div class="pc-person-name-row"><span class="pc-person-name">${esc(x.title)}</span></div>${x.description?`<div class="pc-person-desc">${esc(x.description)}</div>`:""}</div></article>`).join("") : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`; }
    const preview=items.find(x=>x.image); const previewSig=preview?.image ? `img:${preview.image}:${preview.title}` : `fallback:${items.length}`;
    if (icon.dataset.visualPreviewSignature !== previewSig) { icon.dataset.visualPreviewSignature=previewSig; icon.innerHTML=preview?.image ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`; }
  }
  function bindCustom(def) {
    const icon=document.getElementById(def.iconId); if (!icon || icon.dataset.visualRoundBound === "1") return; icon.dataset.visualRoundBound="1";
    const open=event=>{ if (event?.type === "keydown" && !["Enter"," "].includes(event.key)) return; event?.preventDefault?.(); event?.stopPropagation?.(); const place=currentPlace(); if (!place) return; renderCustom(place,def); const html=s(document.getElementById(def.listId)?.innerHTML) || `<div class="pc-empty">Ingen innhold ennå</div>`; global.showPlaceCardRoundPopup?.({title:def.label,subtitle:s(place.name || place.title),html,place,kind:def.kind}); };
    icon.addEventListener("click",open); icon.addEventListener("keydown",open);
  }
  function bindBadge() {
    if (badgeBound) return; badgeBound=true;
    document.addEventListener("click",event=>{ const target=event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null; if (!target) return; const id=s(currentPlace()?.id); if (!id) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); global.location.href=`fagverk-sted.html?place=${encodeURIComponent(id)}`; },true);
  }
  function apply(place=currentPlace()) {
    const card=document.getElementById("placeCard"); if (!card) return; ensureDom(); bindBadge();
    for (const def of DEFS.filter(d=>["objects","details","spots"].includes(d.id))) { renderCustom(place,def); bindCustom(def); }
    const selected=place ? selectedIds(place) : [], state=place ? readiness(place,selected) : {complete:false,missingImages:[]}, allowedIds=new Set(selected.map(id=>BY_ID.get(id)?.iconId).filter(Boolean));
    card.dataset.roundMode="visual-collections"; card.dataset.roundCount=String(selected.length || 0); card.dataset.roundReadiness=state.complete?"ready":"incomplete"; card.dataset.roundMissingImages=state.missingImages.join(",");
    const grid=card.querySelector(".pc-icons-quad");
    if (grid) {
      // Canonical kontrakt: gridet eies av visual-rounds. Alle andre .pc-round
      // (legacy, handlinger eller plugin-innslag) skal ut av selve rundingsgridet.
      grid.querySelectorAll(".pc-round").forEach(icon => {
        const show=allowedIds.has(icon.id);
        if (icon.hidden !== !show) icon.hidden=!show;
        icon.setAttribute("aria-hidden",show?"false":"true");
        icon.dataset.roundSurface=show?"visual-collection":"moved-out-of-round-grid";
        const def=DEFS.find(item=>item.iconId === icon.id);
        icon.style.order=show && def ? String(selected.indexOf(def.id)) : "";
      });
      grid.dataset.roundMode="visual-collections";
      grid.dataset.roundCount=String(selected.length || 0);
      grid.style.gridTemplateColumns=selected.length === 4 ? "repeat(2, var(--place-card-orb-size))" : "repeat(3, var(--place-card-orb-size))";
      grid.style.gridTemplateRows="repeat(2, var(--place-card-orb-size))";
    }
  }
  function scheduleApply() {
    if (scheduled) return; scheduled=true;
    const run=()=>{ scheduled=false; apply(); };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run); else global.setTimeout(run,0);
  }
  function patchOpenPlaceCard() {
    const original=global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__visualRoundsPatchedV5) return true;
    const patched=async function openPlaceCardWithCanonicalRounds(...args) {
      const result=await original.apply(this,args);
      scheduleApply();
      return result;
    };
    patched.__visualRoundsPatchedV5=true;
    patched.__visualRoundsOriginal=original;
    global.openPlaceCard=patched;
    return true;
  }
  function patchApi() {
    const api=global.HGPlaceRounds; if (!api || api.__visualCollectionsPatchedV5) return;
    api.getVisual=place=>selectedIds(place).map(id=>BY_ID.get(id)).filter(Boolean); api.applyVisual=apply; api.visualIds=[...IDS]; api.visualRegistry=[...DEFS]; api.visualPriorities=PRIORITIES; api.recommendVisual=recommend; api.getVisualReadiness=readiness; api.__visualCollectionsPatchedV5=true;
  }
  function init() {
    ensureDom(); patchApi(); bindBadge(); patchOpenPlaceCard(); scheduleApply();
    if (typeof global.openPlaceCard !== "function") {
      let attempts=0;
      const timer=global.setInterval(()=>{ attempts+=1; if (patchOpenPlaceCard() || attempts >= 80) global.clearInterval(timer); },100);
    }
  }

  global.HGVisualPlaceRounds={ ids:[...IDS], registry:[...DEFS], priorities:PRIORITIES, get:selectedIds, recommend, readiness, isImageReady:imageReady, getItems:customItems, apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
  ["hg:appReady","hg:place-selected","hg:places-ready","hg:placesUpdated","hg:visitedUpdated","updateProfile"].forEach(name=>global.addEventListener?.(name,()=>{ patchOpenPlaceCard(); scheduleApply(); }));
})(window);
