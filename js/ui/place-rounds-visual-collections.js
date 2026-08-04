// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-rundinger. Regler eies kun av data/places/README_place_rounds.md.
(function installCanonicalPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id:"badges",      label:"Merker",      fallbackIcon:"🏅", iconId:"pcBadgesIcon",          listId:"pcBadgesList",          kind:"badges" },
    { id:"people",      label:"Personer",    fallbackIcon:"👥", iconId:"pcPeopleIcon",          listId:"pcPeopleList",          kind:"people" },
    { id:"objects",     label:"Gjenstander", fallbackIcon:"🏺", iconId:"pcObjectsIcon",         listId:"pcObjectsList",         kind:"objects" },
    { id:"brands",      label:"Brands",      fallbackIcon:"🏷️", iconId:"pcBrandsIcon",          listId:"pcBrandsList",          kind:"brands" },
    { id:"civication",  label:"Civication",  fallbackIcon:"🛒", iconId:"pcCivicationStoreIcon", listId:"pcCivicationStoreList", kind:"civication" },
    { id:"map",         label:"Kart",        fallbackIcon:"🗺️", iconId:"pcNatureMapIcon",       listId:"pcNatureMapList",       kind:"nature-map" },
    { id:"flora",       label:"Flora",       fallbackIcon:"🌱", iconId:"pcFloraIcon",           listId:"pcFloraList",           kind:"flora" },
    { id:"fauna",       label:"Fauna",       fallbackIcon:"🐾", iconId:"pcFaunaIcon",           listId:"pcFaunaList",           kind:"fauna" }
  ]);
  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const GENERAL_ROUNDS = Object.freeze(["people", "objects", "brands", "civication"]);
  const NATURE_ROUNDS = Object.freeze(["map", "flora", "fauna", "civication"]);
  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  let scheduled = false;
  let badgeBound = false;

  function isNature(place) { return s(place?.category).toLowerCase() === "natur"; }
  function selectedIds(place) { return [...(isNature(place) ? NATURE_ROUNDS : GENERAL_ROUNDS)]; }
  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }
  function imageFor(item) {
    return item && typeof item === "object" ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo) : "";
  }
  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind };
    if (!item || typeof item !== "object") return null;
    const id=s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    return { id:id || s(item.title || item.name), title:s(item.title || item.name || item.label || item.id || `${sourceKind} ${index+1}`), description:s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind), image:imageFor(item), sourceKind };
  }
  function dedupe(items) {
    const seen=new Set();
    return items.filter(Boolean).filter(item=>{const key=s(item.id || item.title).toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;});
  }
  function civicationItems(place) {
    const id=s(place?.id);
    return [...arr(global.CIVICATION_STORE_BY_PLACE?.[id]),...arr(place?.civication_store),...arr(place?.civicationStore),...arr(place?.civication_items),...arr(place?.civicationItems)];
  }
  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(item.physicalObject === true || item.physical === true || item.isPhysical === true || s(item.objectType || item.object_type || item.material || item.historicalFunction || item.historical_function));
  }
  function objectItems(place) {
    return dedupe([
      ...arr(place?.objects).map((x,i)=>normalizeItem(x,i,"objects")),
      ...arr(place?.artifacts).map((x,i)=>normalizeItem(x,i,"artifacts")),
      ...civicationItems(place).filter(physicalCivication).map((x,i)=>normalizeItem(x,i,"civication"))
    ]);
  }
  async function natureItems(place, kind) {
    const fromBridge = await global.HGNaturePlaceMap?.getForPlace?.(place).catch?.(()=>null) || null;
    const items = kind === "flora" ? fromBridge?.floraItems : fromBridge?.faunaItems;
    if (arr(items).length) return arr(items).map((x,i)=>normalizeItem(x,i,kind)).filter(Boolean);
    const registry = kind === "flora" ? arr(global.FLORA) : arr(global.FAUNA);
    const ids = arr(place?.[kind]);
    return ids.map((id,i)=>normalizeItem(registry.find(row=>s(row?.id)===s(id)) || id,i,kind)).filter(Boolean);
  }
  function ensureBadgePlacement() {
    const titleRow=document.querySelector("#placeCard .pc-title-row");
    const badge=document.getElementById("pcBadgesIcon");
    if (!titleRow || !badge) return;
    badge.classList.add("pc-title-badge");
    badge.hidden=false;
    badge.setAttribute("aria-hidden","false");
    if (badge.parentElement !== titleRow) titleRow.appendChild(badge);
  }
  function ensureDom() {
    const card=document.getElementById("placeCard"), grid=card?.querySelector(".pc-icons-quad"), body=card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    for (const def of DEFS.filter(d=>["objects","map","flora","fauna"].includes(d.id))) {
      if (!document.getElementById(def.iconId)) { const el=document.createElement("div"); el.id=def.iconId; el.className="pc-round"; el.hidden=true; el.setAttribute("role","button"); el.tabIndex=0; el.setAttribute("aria-label",def.label); grid.appendChild(el); }
      if (!document.getElementById(def.listId)) { const el=document.createElement("div"); el.id=def.listId; el.hidden=true; el.setAttribute("aria-hidden","true"); body.appendChild(el); }
    }
    ensureBadgePlacement();
  }
  function renderRows(items, def) {
    const attr = def.id === "flora" ? "data-flora" : def.id === "fauna" ? "data-fauna" : "data-visual-round-item";
    return items.length ? items.map(x=>`<button type="button" class="pc-person pc-visual-round-item" ${attr}="${esc(x.id)}">${x.image?`<img src="${esc(x.image)}" class="pc-person-img" alt="">`:""}<span class="pc-person-meta"><span class="pc-person-name">${esc(x.title)}</span>${x.description?`<span class="pc-person-desc">${esc(x.description)}</span>`:""}</span></button>`).join("") : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
  }
  async function renderCustom(place, def) {
    const icon=document.getElementById(def.iconId), list=document.getElementById(def.listId); if (!icon || !list) return;
    if (def.id === "map") {
      const preview = await Promise.resolve(global.HGNatureDetailedMap?.getPreview?.(place)).catch(()=>"");
      icon.innerHTML = preview ? `<img src="${esc(preview)}" class="pc-person-img" alt="Turkart">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
      list.innerHTML = `<div class="pc-empty">Tur- og naturkart åpnes fra Kart-rundingen.</div>`;
      icon.dataset.roundReady = preview || typeof global.HGNatureDetailedMap?.openPlace === "function" ? "true" : "false";
      return;
    }
    const items = def.id === "objects" ? objectItems(place) : await natureItems(place, def.id);
    list.innerHTML=renderRows(items,def);
    const preview=items.find(x=>x.image);
    icon.innerHTML=preview?.image ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
    icon.dataset.roundReady = preview?.image ? "true" : "false";
  }
  function showMissingDetailedMap(place) {
    global.showPlaceCardRoundPopup?.({
      title:"Kart",
      subtitle:s(place?.name || place?.title),
      kind:"nature-map",
      place,
      html:'<div class="pc-empty">Tur-/naturkartet er ikke lastet for dette naturstedet. History GO bruker aldri det generelle hovedkartet som fallback for Kart-rundingen.</div>'
    });
  }
  async function openNatureMap(place) {
    if (typeof global.HGNatureDetailedMap?.openPlace === "function") {
      await global.HGNatureDetailedMap.openPlace(place);
      return;
    }
    showMissingDetailedMap(place);
  }
  function bindCustom(def) {
    const icon=document.getElementById(def.iconId); if (!icon || icon.dataset.canonicalRoundBound === "1") return; icon.dataset.canonicalRoundBound="1";
    const open=async event=>{
      if(event?.type==="keydown"&&!['Enter',' '].includes(event.key))return;
      event?.preventDefault?.();event?.stopPropagation?.();
      const place=currentPlace();if(!place)return;
      if(def.id==="map"){await openNatureMap(place);return;}
      await renderCustom(place,def);
      const html=s(document.getElementById(def.listId)?.innerHTML)||'<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({title:def.label,subtitle:s(place.name||place.title),html,place,kind:def.kind});
    };
    icon.addEventListener("click",open);icon.addEventListener("keydown",open);
  }
  function bindBadge() {
    if (badgeBound) return; badgeBound=true;
    document.addEventListener("click",event=>{const target=event.target instanceof Element?event.target.closest("#pcBadgesIcon"):null;if(!target)return;const id=s(currentPlace()?.id);if(!id)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();global.location.href=`fagverk-sted.html?place=${encodeURIComponent(id)}`;},true);
  }
  async function apply(place=currentPlace()) {
    const card=document.getElementById("placeCard");if(!card||!place)return;
    ensureDom();bindBadge();ensureBadgePlacement();
    for(const def of DEFS.filter(d=>["objects","map","flora","fauna"].includes(d.id))){await renderCustom(place,def);bindCustom(def);}
    const selected=selectedIds(place);const allowed=new Set(selected.map(id=>BY_ID.get(id)?.iconId).filter(Boolean));const grid=card.querySelector(".pc-icons-quad");
    card.dataset.roundMode=isNature(place)?"nature-four":"standard-four";card.dataset.roundCount="4";
    if(grid){grid.querySelectorAll(".pc-round").forEach(icon=>{const show=allowed.has(icon.id);icon.hidden=!show;icon.setAttribute("aria-hidden",show?"false":"true");const def=DEFS.find(item=>item.iconId===icon.id);icon.style.order=show&&def?String(selected.indexOf(def.id)):"";});grid.dataset.roundMode=card.dataset.roundMode;grid.dataset.roundCount="4";grid.style.gridTemplateColumns="repeat(2, minmax(0, 1fr))";grid.style.gridTemplateRows="repeat(2, minmax(0, 1fr))";}
  }
  function scheduleApply(){if(scheduled)return;scheduled=true;const run=()=>{scheduled=false;apply();};if(typeof global.requestAnimationFrame==="function")global.requestAnimationFrame(run);else global.setTimeout(run,0);}
  function patchOpenPlaceCard(){const original=global.openPlaceCard;if(typeof original!=="function")return false;if(original.__canonicalFourRoundsPatched)return true;const patched=async function(...args){const result=await original.apply(this,args);scheduleApply();return result;};patched.__canonicalFourRoundsPatched=true;global.openPlaceCard=patched;return true;}
  function installApi(){const byId=Object.fromEntries(DEFS.map(def=>[def.id,def]));global.HGPlaceRounds={registry:[...DEFS],badge:BY_ID.get("badges"),defaults:[...GENERAL_ROUNDS],profiles:{standard:[...GENERAL_ROUNDS],natur:[...NATURE_ROUNDS]},byId,get:place=>selectedIds(place).map(id=>BY_ID.get(id)),apply,__canonicalFourRounds:true};global.getPlaceRounds=global.HGPlaceRounds.get;}
  function init(){ensureDom();installApi();bindBadge();patchOpenPlaceCard();scheduleApply();if(typeof global.openPlaceCard!=="function"){let attempts=0;const timer=global.setInterval(()=>{attempts+=1;if(patchOpenPlaceCard()||attempts>=80)global.clearInterval(timer);},100);}}

  global.HGVisualPlaceRounds={ids:DEFS.map(def=>def.id),registry:[...DEFS],badge:BY_ID.get("badges"),standardRounds:[...GENERAL_ROUNDS],natureRounds:[...NATURE_ROUNDS],get:selectedIds,apply};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  ["hg:appReady","hg:place-selected","hg:places-ready","hg:placesUpdated","updateProfile","hg:nature-detailed-map-ready"].forEach(name=>global.addEventListener?.(name,()=>{patchOpenPlaceCard();scheduleApply();}));
})(window);
