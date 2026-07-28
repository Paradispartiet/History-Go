// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-presentasjon: alltid fire rundinger i 2x2.
// Vanlig sted: Merker · People · Gjenstander · Brands.
// Natursted: Merker · Flora · Fauna · Kart.
(function installVisualPlaceRounds(global) {
  "use strict";

  const ORDINARY_IDS = Object.freeze(["badges", "people", "objects", "brands"]);
  const NATURE_IDS = Object.freeze(["badges", "flora", "fauna", "map"]);
  const DEFS = Object.freeze([
    { id: "badges", label: "Merker", fallbackIcon: "🏅", iconId: "pcBadgesIcon", listId: "pcBadgesList", kind: "badges" },
    { id: "people", label: "Personer", fallbackIcon: "👥", iconId: "pcPeopleIcon", listId: "pcPeopleList", kind: "people" },
    { id: "objects", label: "Gjenstander", fallbackIcon: "🏺", iconId: "pcObjectsIcon", listId: "pcObjectsList", kind: "objects" },
    { id: "brands", label: "Brands", fallbackIcon: "🏷️", iconId: "pcBrandsIcon", listId: "pcBrandsList", kind: "brands" },
    { id: "flora", label: "Flora", fallbackIcon: "🌿", iconId: "pcFloraIcon", listId: "pcFloraList", kind: "flora" },
    { id: "fauna", label: "Fauna", fallbackIcon: "🦉", iconId: "pcFaunaIcon", listId: "pcFaunaList", kind: "fauna" },
    { id: "map", label: "Kart", fallbackIcon: "🗺️", iconId: "pcNatureMapIcon", listId: "", kind: "map" }
  ]);
  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const natureCache = new Map();
  const natureLoads = new Map();
  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  let badgeBound = false;
  let scheduled = false;

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }

  function isNaturePlace(place) {
    return s(place?.category).toLowerCase() === "natur";
  }

  function selectedIds(place) {
    return isNaturePlace(place) ? [...NATURE_IDS] : [...ORDINARY_IDS];
  }

  function imageFor(item) {
    return item && typeof item === "object" ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo) : "";
  }

  function normalizeItem(item, index, sourceKind) {
    if (!item) return null;
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind, raw:item };
    if (typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.treasureTitle || item.id || `${sourceKind} ${index + 1}`);
    return {
      id:id || title,
      title,
      description:s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind),
      image:imageFor(item),
      sourceKind,
      raw:item
    };
  }

  function dedupe(items) {
    const seen = new Set();
    return items.filter(Boolean).filter(item => {
      const key=s(item.id || item.title).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function civicationItems(place) {
    const id=s(place?.id);
    return [
      ...arr(global.CIVICATION_STORE_BY_PLACE?.[id]),
      ...arr(place?.civication_store), ...arr(place?.civicationStore),
      ...arr(place?.civication_items), ...arr(place?.civicationItems),
      ...arr(place?.civication_store_items), ...arr(place?.civicationStoreItems)
    ];
  }

  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(
      s(item.placeSpecificReason || item.place_specific_reason || item.historicalFunction || item.historical_function || item.material || item.objectType || item.object_type || item.kind || item.type)
      || item.physical === true || item.isPhysical === true || item.is_physical === true
    );
  }

  function objectItems(place) {
    const rows=[
      ...arr(place?.objects).map(x=>[x,"objects"]),
      ...arr(place?.artifacts).map(x=>[x,"artifacts"]),
      ...civicationItems(place).filter(physicalCivication).map(x=>[x,"civication"])
    ];
    return dedupe(rows.map(([item,kind],index)=>normalizeItem(item,index,kind)));
  }

  function natureIndex(kind) {
    const rows = kind === "flora" ? arr(global.FLORA) : arr(global.FAUNA);
    return new Map(rows.map(item => [s(item?.id), item]).filter(([id]) => id));
  }

  function explicitNatureItems(place, kind) {
    const index=natureIndex(kind);
    return dedupe(arr(place?.[kind]).map((entry,i) => {
      const raw = typeof entry === "string" ? index.get(s(entry)) || entry : entry;
      return normalizeItem(raw,i,kind);
    }));
  }

  function classifyNatureRows(rows) {
    const floraIds=new Set(arr(global.FLORA).map(item=>s(item?.id)).filter(Boolean));
    const faunaIds=new Set(arr(global.FAUNA).map(item=>s(item?.id)).filter(Boolean));
    const flora=[];
    const fauna=[];
    arr(rows).forEach((row,index) => {
      const id=s(row?.id);
      if (floraIds.has(id)) flora.push(normalizeItem(row,index,"flora"));
      if (faunaIds.has(id)) fauna.push(normalizeItem(row,index,"fauna"));
    });
    return { flora:dedupe(flora), fauna:dedupe(fauna) };
  }

  function natureItems(place, kind) {
    const explicit=explicitNatureItems(place,kind);
    const cached=natureCache.get(s(place?.id))?.[kind] || [];
    return dedupe([...explicit,...cached]);
  }

  async function ensureNatureItems(place) {
    if (!place || !isNaturePlace(place)) return;
    const placeId=s(place.id);
    if (!placeId || natureLoads.has(placeId)) return natureLoads.get(placeId);
    const promise=(async()=>{
      try {
        if ((!arr(global.FLORA).length || !arr(global.FAUNA).length) && global.DataHub?.loadNature) {
          await global.DataHub.loadNature();
        }
        let rows=[];
        if (typeof global.HGNatureUnlocks?.getForPlace === "function") {
          rows=await global.HGNatureUnlocks.getForPlace(placeId);
        } else if (typeof global.HGNatureBridge?.getForPlace === "function") {
          rows=await global.HGNatureBridge.getForPlace(placeId);
        }
        natureCache.set(placeId,classifyNatureRows(rows));
      } catch (error) {
        if (global.DEBUG) console.warn("[place-rounds] nature load",error);
      } finally {
        natureLoads.delete(placeId);
        scheduleApply();
      }
    })();
    natureLoads.set(placeId,promise);
    return promise;
  }

  function ensureRoundElement(grid, body, def) {
    let icon=document.getElementById(def.iconId);
    if (!icon) {
      icon=document.createElement("div");
      icon.id=def.iconId;
      icon.className="pc-round";
      icon.hidden=true;
      icon.setAttribute("role","button");
      icon.tabIndex=0;
      icon.setAttribute("aria-label",def.label);
      grid.appendChild(icon);
    }
    if (def.listId && !document.getElementById(def.listId)) {
      const list=document.createElement("div");
      list.id=def.listId;
      list.hidden=true;
      list.setAttribute("aria-hidden","true");
      body.appendChild(list);
    }
    return icon;
  }

  function ensureDom() {
    const card=document.getElementById("placeCard"), grid=card?.querySelector(".pc-icons-quad"), body=card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    DEFS.forEach(def=>ensureRoundElement(grid,body,def));
  }

  function renderListRound(place, def, items) {
    const icon=document.getElementById(def.iconId), list=def.listId ? document.getElementById(def.listId) : null;
    if (!icon) return;
    const preview=items.find(x=>x.image);
    icon.innerHTML=preview?.image
      ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">`
      : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
    if (!list) return;
    list.innerHTML=items.length
      ? items.map(item=>`<button class="pc-person pc-visual-round-item" type="button" data-${def.kind}-id="${esc(item.id)}">${item.image?`<img src="${esc(item.image)}" class="pc-person-img" alt="">`:""}<div class="pc-person-meta"><div class="pc-person-name-row"><span class="pc-person-name">${esc(item.title)}</span></div>${item.description?`<div class="pc-person-desc">${esc(item.description)}</div>`:""}</div></button>`).join("")
      : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
    if (def.kind === "flora" || def.kind === "fauna") {
      list.querySelectorAll(`[data-${def.kind}-id]`).forEach(btn=>{
        btn.addEventListener("click",event=>{
          event.preventDefault();
          event.stopPropagation();
          const id=s(btn.getAttribute(`data-${def.kind}-id`));
          const source=(def.kind === "flora" ? arr(global.FLORA) : arr(global.FAUNA)).find(x=>s(x?.id)===id);
          const opener=def.kind === "flora" ? global.showFloraPopup : global.showFaunaPopup;
          if (source && typeof opener === "function") opener(source);
        });
      });
    }
  }

  function renderRoundContent(place) {
    renderListRound(place,BY_ID.get("objects"),objectItems(place));
    if (isNaturePlace(place)) {
      renderListRound(place,BY_ID.get("flora"),natureItems(place,"flora"));
      renderListRound(place,BY_ID.get("fauna"),natureItems(place,"fauna"));
      const mapIcon=document.getElementById("pcNatureMapIcon");
      if (mapIcon) mapIcon.innerHTML='<div class="pc-round-label"><span class="pc-round-emoji">🗺️</span></div>';
      void ensureNatureItems(place);
    }
  }

  function bindPopupRound(def) {
    const icon=document.getElementById(def.iconId);
    if (!icon || icon.dataset.canonicalRoundBound === "1") return;
    icon.dataset.canonicalRoundBound="1";
    const open=event=>{
      if (event?.type === "keydown" && !["Enter"," "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place=currentPlace();
      if (!place) return;
      if (def.id === "map") {
        if (!isNaturePlace(place)) return;
        if (typeof global.HGNaturePlaceMap?.open === "function") global.HGNaturePlaceMap.open(place);
        else global.showToast?.("Turkartet er ikke lastet ennå");
        return;
      }
      const list=def.listId ? document.getElementById(def.listId) : null;
      const html=s(list?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({title:def.label,subtitle:s(place.name || place.title),html,place,kind:def.kind});
    };
    icon.addEventListener("click",open);
    icon.addEventListener("keydown",open);
  }

  function bindBadge() {
    if (badgeBound) return;
    badgeBound=true;
    document.addEventListener("click",event=>{
      const target=event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null;
      if (!target) return;
      const id=s(currentPlace()?.id);
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      global.location.href=`fagverk-sted.html?place=${encodeURIComponent(id)}`;
    },true);
  }

  function apply(place=currentPlace()) {
    const card=document.getElementById("placeCard");
    if (!card) return;
    ensureDom();
    bindBadge();
    ["objects","flora","fauna","map"].forEach(id=>bindPopupRound(BY_ID.get(id)));
    if (place) renderRoundContent(place);
    const selected=place ? selectedIds(place) : [];
    const allowedIconIds=new Set(selected.map(id=>BY_ID.get(id)?.iconId).filter(Boolean));
    const grid=card.querySelector(".pc-icons-quad");
    if (!grid) return;
    grid.querySelectorAll(".pc-round").forEach(icon=>{
      const show=allowedIconIds.has(icon.id);
      icon.hidden=!show;
      icon.setAttribute("aria-hidden",show?"false":"true");
      icon.dataset.roundSurface=show?"canonical-round":"not-a-round";
      const def=DEFS.find(item=>item.iconId===icon.id);
      icon.style.order=show && def ? String(selected.indexOf(def.id)) : "";
    });
    card.dataset.roundMode=isNaturePlace(place)?"nature-four":"ordinary-four";
    card.dataset.roundCount="4";
    grid.dataset.roundMode=card.dataset.roundMode;
    grid.dataset.roundCount="4";
    grid.style.gridTemplateColumns="repeat(2, var(--place-card-orb-size))";
    grid.style.gridTemplateRows="repeat(2, var(--place-card-orb-size))";
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled=true;
    const run=()=>{scheduled=false;apply();};
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run); else global.setTimeout(run,0);
  }

  function patchOpenPlaceCard() {
    const original=global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__canonicalFourRounds) return true;
    const patched=async function openPlaceCardWithCanonicalFourRounds(...args) {
      const result=await original.apply(this,args);
      scheduleApply();
      return result;
    };
    patched.__canonicalFourRounds=true;
    patched.__canonicalFourRoundsOriginal=original;
    global.openPlaceCard=patched;
    return true;
  }

  function patchApi() {
    global.HGPlaceRounds={
      registry:[...DEFS],
      profiles:{ ordinary:[...ORDINARY_IDS], nature:[...NATURE_IDS] },
      get:place=>selectedIds(place).map(id=>BY_ID.get(id)),
      apply,
      canonicalOwner:"data/places/README_place_rounds.md"
    };
    global.getPlaceRounds=place=>global.HGPlaceRounds.get(place);
  }

  function init() {
    ensureDom();
    patchApi();
    bindBadge();
    patchOpenPlaceCard();
    scheduleApply();
    if (typeof global.openPlaceCard !== "function") {
      let attempts=0;
      const timer=global.setInterval(()=>{attempts+=1;if (patchOpenPlaceCard() || attempts>=80) global.clearInterval(timer);},100);
    }
  }

  global.HGVisualPlaceRounds={
    ids:[...new Set([...ORDINARY_IDS,...NATURE_IDS])],
    registry:[...DEFS],
    profiles:{ordinary:[...ORDINARY_IDS],nature:[...NATURE_IDS]},
    get:selectedIds,
    apply,
    isNaturePlace
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
  ["hg:appReady","hg:place-selected","hg:places-ready","hg:placesUpdated","hg:visitedUpdated","updateProfile"].forEach(name=>global.addEventListener?.(name,()=>{patchOpenPlaceCard();scheduleApply();}));
})(window);
