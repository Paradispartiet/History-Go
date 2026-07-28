// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-kontrakt: alltid fire rundinger.
(function installVisualPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id: "badges", label: "Merker", fallbackIcon: "🏅", iconId: "pcBadgesIcon", listId: "pcBadgesList", kind: "badges" },
    { id: "people", label: "Personer", fallbackIcon: "👥", iconId: "pcPeopleIcon", listId: "pcPeopleList", kind: "people" },
    { id: "objects", label: "Gjenstander", fallbackIcon: "🏺", iconId: "pcObjectsIcon", listId: "pcObjectsList", kind: "objects" },
    { id: "flora", label: "Flora", fallbackIcon: "🌿", iconId: "pcFloraIcon", listId: "pcFloraList", kind: "flora" },
    { id: "fauna", label: "Fauna", fallbackIcon: "🐞", iconId: "pcFaunaIcon", listId: "pcFaunaList", kind: "fauna" },
    { id: "map", label: "Kart", fallbackIcon: "🗺️", iconId: "pcMapIcon", listId: "", kind: "map" }
  ]);
  const IDS = DEFS.map(def => def.id);
  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const DEFAULT_PROFILE = Object.freeze(["badges", "people", "objects", "map"]);
  const NATURE_PROFILE = Object.freeze(["badges", "flora", "fauna", "map"]);
  const PROFILES = Object.freeze({ default: DEFAULT_PROFILE, natur: NATURE_PROFILE });

  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  const natureCache = new Map();
  let badgeBound = false;
  let mapBound = false;
  let scheduled = false;

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }

  function isNaturePlace(place) {
    return s(place?.category).toLowerCase() === "natur";
  }

  function selectedIds(place) {
    return [...(isNaturePlace(place) ? NATURE_PROFILE : DEFAULT_PROFILE)];
  }

  function imageFor(item) {
    return item && typeof item === "object"
      ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo)
      : "";
  }

  function iconHasImage(id) {
    const def = BY_ID.get(id);
    return Boolean(def && s(document.getElementById(def.iconId)?.querySelector("img[src]")?.getAttribute("src")));
  }

  function civicationItems(place) {
    const id = s(place?.id);
    return [
      ...arr(global.CIVICATION_STORE_BY_PLACE?.[id]),
      ...arr(place?.civication_store),
      ...arr(place?.civicationStore),
      ...arr(place?.civication_items),
      ...arr(place?.civicationItems),
      ...arr(place?.civication_store_items),
      ...arr(place?.civicationStoreItems)
    ];
  }

  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(
      s(item.placeSpecificReason || item.place_specific_reason || item.historicalFunction || item.historical_function || item.material || item.objectType || item.object_type || item.kind || item.type)
      || item.physical === true || item.isPhysical === true || item.is_physical === true
    );
  }

  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind, raw:item };
    if (!item || typeof item !== "object") return null;
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

  function objectItems(place) {
    if (!place) return [];
    const rows = [
      ...arr(place.objects).map(x=>[x,"objects"]),
      ...arr(place.artifacts).map(x=>[x,"artifacts"]),
      ...civicationItems(place).filter(physicalCivication).map(x=>[x,"civication"])
    ];
    return dedupe(rows.map(([item,kind], index) => normalizeItem(item,index,kind)));
  }

  function globalNatureList(kind) {
    return kind === "fauna" ? arr(global.FAUNA) : arr(global.FLORA);
  }

  function directNatureItems(place, kind) {
    const values = arr(place?.[kind]);
    const index = new Map(globalNatureList(kind).map(item => [s(item?.id), item]).filter(([id]) => id));
    return dedupe(values.map((value, i) => {
      const item = typeof value === "string" ? (index.get(s(value)) || value) : value;
      return normalizeItem(item, i, kind);
    }));
  }

  function cachedNatureItems(place, kind) {
    const pid = s(place?.id);
    const cached = natureCache.get(pid);
    if (cached) return cached[kind] || [];
    return directNatureItems(place, kind);
  }

  async function loadNatureItems(place) {
    const pid = s(place?.id);
    if (!pid || !isNaturePlace(place) || natureCache.has(pid)) return;
    let rows = [];
    try {
      if (typeof global.HGNatureUnlocks?.getForPlace === "function") {
        rows = await global.HGNatureUnlocks.getForPlace(pid) || [];
      } else if (global.DataHub?.loadNature) {
        await global.DataHub.loadNature();
      }
    } catch (error) {
      if (global.DEBUG) console.warn("[place-rounds] nature load", error);
    }
    const flora = [];
    const fauna = [];
    for (const item of rows) {
      const kind = s(item?._kind || item?.kind).toLowerCase();
      const target = kind === "fauna" ? fauna : flora;
      target.push(normalizeItem(item, target.length, kind === "fauna" ? "fauna" : "flora"));
    }
    const directFlora = directNatureItems(place, "flora");
    const directFauna = directNatureItems(place, "fauna");
    natureCache.set(pid, {
      flora: dedupe([...flora, ...directFlora]),
      fauna: dedupe([...fauna, ...directFauna])
    });
    renderNature(place, "flora");
    renderNature(place, "fauna");
    scheduleApply();
  }

  function imageReady(place, id) {
    if (!place || !BY_ID.has(id)) return false;
    if (id === "map") return true;
    if (id === "badges") return iconHasImage(id) || arr(global.BADGES).some(b => s(b?.id) === s(place.category) && imageFor(b));
    if (id === "people") return iconHasImage(id) || arr(place.people).some(x => imageFor(x));
    if (id === "objects") return objectItems(place).some(x => Boolean(x.image));
    if (id === "flora" || id === "fauna") return cachedNatureItems(place,id).some(x => Boolean(x.image));
    return false;
  }

  function readiness(place, ids = selectedIds(place)) {
    const selected = [...ids];
    const missingImages = selected.filter(id => !imageReady(place,id));
    return { selected, ready:selected.filter(id=>!missingImages.includes(id)), missingImages, complete:selected.length === 4 && missingImages.length === 0 };
  }

  function ensureRoundDom(def) {
    const card=document.getElementById("placeCard"), grid=card?.querySelector(".pc-icons-quad"), body=card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    if (!document.getElementById(def.iconId)) {
      const el=document.createElement("div");
      el.id=def.iconId;
      el.className="pc-round";
      el.hidden=true;
      el.setAttribute("role","button");
      el.tabIndex=0;
      el.setAttribute("aria-label",def.label);
      grid.appendChild(el);
    }
    if (def.listId && !document.getElementById(def.listId)) {
      const el=document.createElement("div");
      el.id=def.listId;
      el.hidden=true;
      el.setAttribute("aria-hidden","true");
      body.appendChild(el);
    }
  }

  function ensureDom() {
    for (const def of DEFS) ensureRoundDom(def);
    const mapIcon=document.getElementById("pcMapIcon");
    if (mapIcon && !mapIcon.dataset.mapPreviewReady) {
      mapIcon.dataset.mapPreviewReady="1";
      mapIcon.innerHTML=`<div class="pc-round-label"><span class="pc-round-emoji">🗺️</span><span class="pc-round-count"></span></div>`;
    }
  }

  function renderCollection(place, def, items) {
    const icon=document.getElementById(def.iconId), list=document.getElementById(def.listId);
    if (!icon || !list) return;
    const listSig=JSON.stringify(items.map(x=>[x.id,x.title,x.image,x.description]));
    if (list.dataset.visualSignature !== listSig) {
      list.dataset.visualSignature=listSig;
      list.innerHTML=items.length
        ? items.map(x=>`<article class="pc-person pc-visual-round-item" data-visual-round-item="${esc(x.id)}">${x.image?`<img src="${esc(x.image)}" class="pc-person-img" alt="">`:""}<div class="pc-person-meta"><div class="pc-person-name-row"><span class="pc-person-name">${esc(x.title)}</span></div>${x.description?`<div class="pc-person-desc">${esc(x.description)}</div>`:""}</div></article>`).join("")
        : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
    }
    const preview=items.find(x=>x.image);
    const previewSig=preview?.image ? `img:${preview.image}:${preview.title}` : `fallback:${items.length}`;
    if (icon.dataset.visualPreviewSignature !== previewSig) {
      icon.dataset.visualPreviewSignature=previewSig;
      icon.innerHTML=preview?.image
        ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">`
        : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
    }
  }

  function renderObjects(place) {
    renderCollection(place, BY_ID.get("objects"), objectItems(place));
  }

  function renderNature(place, kind) {
    const def=BY_ID.get(kind);
    const items=cachedNatureItems(place,kind);
    renderCollection(place,def,items);
    const list=document.getElementById(def.listId);
    list?.querySelectorAll("[data-visual-round-item]").forEach(node => {
      if (node.dataset.natureBound === "1") return;
      node.dataset.natureBound="1";
      node.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const item=items.find(x=>x.id === node.dataset.visualRoundItem)?.raw;
        if (!item) return;
        if (typeof global.openNatureCard === "function") global.openNatureCard(item);
        else if (typeof global.showFloraPopup === "function") global.showFloraPopup(item);
      });
    });
  }

  function bindCollection(def, getItems) {
    const icon=document.getElementById(def.iconId);
    if (!icon || icon.dataset.visualRoundBound === "1") return;
    icon.dataset.visualRoundBound="1";
    const open=event=>{
      if (event?.type === "keydown" && !["Enter"," "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place=currentPlace();
      if (!place) return;
      const items=getItems(place);
      renderCollection(place,def,items);
      if (def.id === "flora" || def.id === "fauna") renderNature(place,def.id);
      const html=s(document.getElementById(def.listId)?.innerHTML) || `<div class="pc-empty">Ingen innhold ennå</div>`;
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

  function bindMap() {
    if (mapBound) return;
    const icon=document.getElementById("pcMapIcon");
    if (!icon) return;
    mapBound=true;
    const open=event=>{
      if (event?.type === "keydown" && !["Enter"," "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      if (typeof global.collapsePlaceCard === "function") global.collapsePlaceCard();
      else document.getElementById("pcClose")?.click?.();
    };
    icon.addEventListener("click",open);
    icon.addEventListener("keydown",open);
  }

  function apply(place=currentPlace()) {
    const card=document.getElementById("placeCard");
    if (!card) return;
    ensureDom();
    bindBadge();
    bindMap();
    bindCollection(BY_ID.get("objects"), objectItems);
    bindCollection(BY_ID.get("flora"), p=>cachedNatureItems(p,"flora"));
    bindCollection(BY_ID.get("fauna"), p=>cachedNatureItems(p,"fauna"));

    if (place) {
      renderObjects(place);
      if (isNaturePlace(place)) {
        renderNature(place,"flora");
        renderNature(place,"fauna");
        void loadNatureItems(place);
      }
    }

    const selected=place ? selectedIds(place) : [];
    const state=place ? readiness(place,selected) : {complete:false,missingImages:[]};
    const allowedIds=new Set(selected.map(id=>BY_ID.get(id)?.iconId).filter(Boolean));
    card.dataset.roundMode="canonical-four";
    card.dataset.roundCount=String(selected.length || 0);
    card.dataset.roundReadiness=state.complete?"ready":"incomplete";
    card.dataset.roundMissingImages=state.missingImages.join(",");

    const grid=card.querySelector(".pc-icons-quad");
    if (grid) {
      grid.querySelectorAll(".pc-round").forEach(icon => {
        const show=allowedIds.has(icon.id);
        icon.hidden=!show;
        icon.setAttribute("aria-hidden",show?"false":"true");
        icon.dataset.roundSurface=show?"canonical-round":"legacy-hidden";
        const def=DEFS.find(item=>item.iconId === icon.id);
        icon.style.order=show && def ? String(selected.indexOf(def.id)) : "";
      });
      grid.dataset.roundMode="canonical-four";
      grid.dataset.roundCount="4";
      grid.style.gridTemplateColumns="repeat(2, var(--place-card-orb-size))";
      grid.style.gridTemplateRows="repeat(2, var(--place-card-orb-size))";
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled=true;
    const run=()=>{ scheduled=false; apply(); };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run);
    else global.setTimeout(run,0);
  }

  function patchOpenPlaceCard() {
    const original=global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__canonicalFourRoundsPatched) return true;
    const patched=async function openPlaceCardWithCanonicalRounds(...args) {
      const result=await original.apply(this,args);
      scheduleApply();
      return result;
    };
    patched.__canonicalFourRoundsPatched=true;
    patched.__canonicalFourRoundsOriginal=original;
    global.openPlaceCard=patched;
    return true;
  }

  function patchApi() {
    const api=global.HGPlaceRounds || {};
    api.registry=[...DEFS];
    api.profiles={ default:[...DEFAULT_PROFILE], natur:[...NATURE_PROFILE] };
    api.defaults=[...DEFAULT_PROFILE];
    api.byId=Object.fromEntries(DEFS.map(def=>[def.id,def]));
    api.get=place=>selectedIds(place).map(id=>BY_ID.get(id));
    api.apply=apply;
    api.getVisual=api.get;
    api.applyVisual=apply;
    api.visualIds=[...IDS];
    api.visualRegistry=[...DEFS];
    api.getVisualReadiness=readiness;
    api.__canonicalFourRounds=true;
    global.HGPlaceRounds=api;
  }

  function init() {
    ensureDom();
    patchApi();
    bindBadge();
    bindMap();
    patchOpenPlaceCard();
    scheduleApply();
    if (typeof global.openPlaceCard !== "function") {
      let attempts=0;
      const timer=global.setInterval(()=>{ attempts+=1; if (patchOpenPlaceCard() || attempts >= 80) global.clearInterval(timer); },100);
    }
  }

  global.HGVisualPlaceRounds={
    ids:[...IDS],
    registry:[...DEFS],
    profiles:PROFILES,
    get:selectedIds,
    readiness,
    isImageReady:imageReady,
    getItems:(place,id)=>id === "objects" ? objectItems(place) : (id === "flora" || id === "fauna") ? cachedNatureItems(place,id) : [],
    apply
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
  ["hg:appReady","hg:place-selected","hg:places-ready","hg:placesUpdated","hg:visitedUpdated","updateProfile"].forEach(name=>global.addEventListener?.(name,()=>{ patchOpenPlaceCard(); scheduleApply(); }));
})(window);
