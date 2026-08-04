// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-rundinger. Regler eies kun av data/places/README_place_rounds.md.
(function installCanonicalPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id:"badges",  label:"Merker",      fallbackIcon:"🏅", iconId:"pcBadgesIcon",  listId:"pcBadgesList",  kind:"badges" },
    { id:"people",  label:"Personer",    fallbackIcon:"👥", iconId:"pcPeopleIcon",  listId:"pcPeopleList",  kind:"people" },
    { id:"works",   label:"Verk",        fallbackIcon:"🎭", iconId:"pcWorksIcon",   listId:"pcWorksList",   kind:"works" },
    { id:"objects", label:"Gjenstander", fallbackIcon:"🏺", iconId:"pcObjectsIcon", listId:"pcObjectsList", kind:"objects" },
    { id:"details", label:"Detaljer",    fallbackIcon:"🔎", iconId:"pcDetailsIcon", listId:"pcDetailsList", kind:"details" },
    { id:"spots",   label:"Punkter",     fallbackIcon:"📍", iconId:"pcSpotsIcon",   listId:"pcSpotsList",   kind:"spots" },
    { id:"brands",  label:"Brands",      fallbackIcon:"🏷️", iconId:"pcBrandsIcon",  listId:"pcBrandsList",  kind:"brands" },
    { id:"map",     label:"Kart",        fallbackIcon:"🗺️", iconId:"pcNatureMapIcon", listId:"pcNatureMapList", kind:"nature-map" },
    { id:"flora",   label:"Flora",       fallbackIcon:"🌱", iconId:"pcFloraIcon",   listId:"pcFloraList",   kind:"flora" },
    { id:"fauna",   label:"Fauna",       fallbackIcon:"🐾", iconId:"pcFaunaIcon",   listId:"pcFaunaList",   kind:"fauna" }
  ]);

  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const GENERAL_BASE = Object.freeze(["people", "objects", "brands"]);
  const NATURE_BASE = Object.freeze(["map", "flora", "fauna"]);

  // Hentet fra den canonicale kategori → rundingmatrisen. Første kandidat er
  // kategoriens normale fjerde runding; neste kandidat brukes når den første
  // mangler relevant stedsspesifikt innhold.
  const CATEGORY_FOURTH_PRIORITIES = Object.freeze({
    by:          ["works", "spots", "details"],
    historie:    ["spots", "details", "works"],
    historisk:   ["spots", "details", "works"],
    kunst:       ["works", "details", "spots"],
    litteratur:  ["works", "spots", "details"],
    media:       ["works", "spots", "details"],
    musikk:      ["works", "spots", "details"],
    naeringsliv: ["spots", "details", "works"],
    natur:       ["spots", "details", "works"],
    politikk:    ["spots", "details", "works"],
    psykologi:   ["works", "spots", "details"],
    religion:    ["works", "spots", "details"],
    scenekunst:  ["works", "spots", "details"],
    sport:       ["spots", "details", "works"],
    subkultur:   ["works", "details", "spots"],
    vitenskap:   ["spots", "details", "works"],
    teknologi:   ["spots", "details", "works"],
    filosofi:    ["works", "spots", "details"],
    film_tv:     ["works", "spots", "details"],
    lekeplass:   ["spots", "details", "works"],
    trening:     ["spots", "details", "works"],
    transport:   ["spots", "details", "works"]
  });

  const NON_GRID_ICON_IDS = Object.freeze([
    "pcCivicationStoreIcon", "pcNatureIcon", "pcForNaIcon", "pcFortellingerIcon",
    "pcLeksikonIcon", "pcPlayIcon", "pcTrainingIcon", "pcTasksIcon",
    "pcWonderkammerIcon", "pcStoriesIcon", "pcRoutesIcon"
  ]);

  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  let scheduled = false;
  let badgeBound = false;

  function normalizeCategory(place) {
    const raw = s(place?.category || "by").toLowerCase();
    if (["technology", "teknologi", "it", "informasjonsteknologi"].includes(raw)) return "vitenskap";
    if (["økonomi", "okonomi", "næringsliv"].includes(raw)) return "naeringsliv";
    if (["film", "tv"].includes(raw)) return "film_tv";
    if (["teater", "theatre", "theater"].includes(raw)) return "scenekunst";
    return raw;
  }

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }

  function imageFor(item) {
    return item && typeof item === "object"
      ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo)
      : "";
  }

  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") return { id:item, title:item, description:"", image:"", sourceKind };
    if (!item || typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.id || `${sourceKind} ${index + 1}`);
    if (!id && !title) return null;
    return {
      id: id || title,
      title,
      description: s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind),
      image: imageFor(item),
      sourceKind
    };
  }

  function dedupe(items) {
    const seen = new Set();
    return items.filter(Boolean).filter(item => {
      const key = s(item.id || item.title).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function civicationItems(place) {
    const id = s(place?.id);
    return [
      ...arr(global.CIVICATION_STORE_BY_PLACE?.[id]),
      ...arr(place?.civication_store), ...arr(place?.civicationStore),
      ...arr(place?.civication_items), ...arr(place?.civicationItems)
    ];
  }

  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(
      item.physicalObject === true || item.physical === true || item.isPhysical === true ||
      s(item.objectType || item.object_type || item.material || item.historicalFunction || item.historical_function)
    );
  }

  function collectionItems(place, id) {
    if (!place) return [];
    let sources = [];
    if (id === "objects") {
      sources = [
        ...arr(place?.objects).map(item => [item, "objects"]),
        ...arr(place.artifacts).map(item => [item, "artifacts"]),
        ...civicationItems(place).filter(physicalCivication).map(item => [item, "civication"])
      ];
    } else if (id === "details") {
      sources = [
        ...arr(place.details).map(item => [item, "details"]),
        ...arr(place.visual_details).map(item => [item, "details"]),
        ...arr(place.site_details).map(item => [item, "details"])
      ];
    } else if (id === "spots") {
      sources = [
        ...arr(place.spots).map(item => [item, "spots"]),
        ...arr(place.subplaces).map(item => [item, "subplaces"]),
        ...arr(place.subPlaces).map(item => [item, "subplaces"])
      ];
    }
    return dedupe(sources.map(([item, sourceKind], index) => normalizeItem(item, index, sourceKind)));
  }

  function listHasContent(id) {
    const text = s(document.getElementById(BY_ID.get(id)?.listId)?.textContent);
    return Boolean(text && !/^Ingen\b/i.test(text) && !/^Laster\b/i.test(text));
  }

  function iconHasImage(id) {
    return Boolean(document.getElementById(BY_ID.get(id)?.iconId)?.querySelector("img[src]"));
  }

  function roundHasContent(place, id) {
    if (["objects", "details", "spots"].includes(id)) return collectionItems(place, id).length > 0;
    if (id === "works") {
      return arr(place?.works).length > 0 || Boolean(place?.music_profile || place?.music || place?.sport_profile) || iconHasImage("works") || listHasContent("works");
    }
    return false;
  }

  function fourthRoundId(place) {
    const category = normalizeCategory(place);
    const candidates = CATEGORY_FOURTH_PRIORITIES[category] || CATEGORY_FOURTH_PRIORITIES.by;
    return candidates.find(id => roundHasContent(place, id)) || candidates[0];
  }

  function selectedIds(place) {
    const base = normalizeCategory(place) === "natur" ? NATURE_BASE : GENERAL_BASE;
    return [...base, fourthRoundId(place)];
  }

  function ensureBadgePlacement() {
    const titleRow = document.querySelector("#placeCard .pc-title-row");
    const badge = document.getElementById("pcBadgesIcon");
    if (!titleRow || !badge) return;
    badge.classList.add("pc-title-badge");
    badge.hidden = false;
    badge.setAttribute("aria-hidden", "false");
    if (badge.parentElement !== titleRow) titleRow.appendChild(badge);
  }

  function ensureDom() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    const body = card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;

    for (const def of DEFS.filter(item => ["objects", "details", "spots", "map", "flora", "fauna"].includes(item.id))) {
      if (!document.getElementById(def.iconId)) {
        const icon = document.createElement("div");
        icon.id = def.iconId;
        icon.className = "pc-round";
        icon.hidden = true;
        icon.setAttribute("role", "button");
        icon.tabIndex = 0;
        icon.setAttribute("aria-label", def.label);
        grid.appendChild(icon);
      }
      if (!document.getElementById(def.listId)) {
        const list = document.createElement("div");
        list.id = def.listId;
        list.hidden = true;
        list.setAttribute("aria-hidden", "true");
        body.appendChild(list);
      }
    }
    ensureBadgePlacement();
  }

  function renderRows(items, def) {
    return items.length
      ? items.map(item => `<button type="button" class="pc-person pc-visual-round-item" data-visual-round-item="${esc(item.id)}">${item.image ? `<img src="${esc(item.image)}" class="pc-person-img" alt="">` : ""}<span class="pc-person-meta"><span class="pc-person-name">${esc(item.title)}</span>${item.description ? `<span class="pc-person-desc">${esc(item.description)}</span>` : ""}</span></button>`).join("")
      : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
  }

  async function natureItems(place, kind) {
    const fromBridge = await global.HGNaturePlaceMap?.getForPlace?.(place).catch?.(() => null) || null;
    const bridged = kind === "flora" ? fromBridge?.floraItems : fromBridge?.faunaItems;
    if (arr(bridged).length) return arr(bridged).map((item, index) => normalizeItem(item, index, kind)).filter(Boolean);
    const registry = kind === "flora" ? arr(global.FLORA) : arr(global.FAUNA);
    return arr(place?.[kind]).map((id, index) => normalizeItem(registry.find(row => s(row?.id) === s(id)) || id, index, kind)).filter(Boolean);
  }

  async function renderCustom(place, def) {
    const icon = document.getElementById(def.iconId);
    const list = document.getElementById(def.listId);
    if (!icon || !list) return;

    if (def.id === "map") {
      const preview = await Promise.resolve(global.HGNatureDetailedMap?.getPreview?.(place)).catch(() => "");
      icon.innerHTML = preview ? `<img src="${esc(preview)}" class="pc-person-img" alt="Turkart">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
      list.innerHTML = '<div class="pc-empty">Tur- og naturkart åpnes fra Kart-rundingen.</div>';
      return;
    }

    const items = ["flora", "fauna"].includes(def.id)
      ? await natureItems(place, def.id)
      : collectionItems(place, def.id);
    list.innerHTML = renderRows(items, def);
    const preview=items.find(x=>x.image);
    icon.innerHTML = preview?.image
      ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">`
      : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
  }

  function showMissingDetailedMap(place) {
    global.showPlaceCardRoundPopup?.({
      title:"Kart", subtitle:s(place?.name || place?.title), kind:"nature-map", place,
      html:'<div class="pc-empty">Tur-/naturkartet er ikke lastet for dette naturstedet. History GO bruker aldri det generelle hovedkartet som fallback for Kart-rundingen.</div>'
    });
  }

  async function openNatureMap(place) {
    if (typeof global.HGNatureDetailedMap?.openPlace === "function") return global.HGNatureDetailedMap.openPlace(place);
    showMissingDetailedMap(place);
  }

  function bindCustom(def) {
    const icon = document.getElementById(def.iconId);
    if (!icon || icon.dataset.canonicalRoundBound === "1") return;
    icon.dataset.canonicalRoundBound = "1";
    const open = async event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place = currentPlace();
      if (!place) return;
      if (def.id === "map") return openNatureMap(place);
      await renderCustom(place, def);
      const html = s(document.getElementById(def.listId)?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({ title:def.label, subtitle:s(place.name || place.title), html, place, kind:def.kind });
    };
    icon.addEventListener("click", open);
    icon.addEventListener("keydown", open);
  }

  function bindBadge() {
    if (badgeBound) return;
    badgeBound = true;
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null;
      if (!target) return;
      const id = s(currentPlace()?.id);
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      global.location.href = `fagverk-sted.html?place=${encodeURIComponent(id)}`;
    }, true);
  }

  async function apply(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card || !place) return;
    ensureDom();
    bindBadge();
    ensureBadgePlacement();

    for (const def of DEFS.filter(item => ["objects", "details", "spots", "map", "flora", "fauna"].includes(item.id))) {
      await renderCustom(place, def);
      bindCustom(def);
    }

    const selected = selectedIds(place);
    const allowed = new Set(selected.map(id => BY_ID.get(id)?.iconId).filter(Boolean));
    const grid = card.querySelector(".pc-icons-quad");
    card.dataset.roundMode = "category-four";
    card.dataset.roundCount = "4";
    card.dataset.roundCategory = normalizeCategory(place);
    card.dataset.roundFourth = selected[3] || "";

    if (grid) {
      grid.querySelectorAll(".pc-round").forEach(icon => {
        const show = allowed.has(icon.id);
        icon.hidden = !show;
        icon.setAttribute("aria-hidden", show ? "false" : "true");
        const def = DEFS.find(item => item.iconId === icon.id);
        icon.style.order = show && def ? String(selected.indexOf(def.id)) : "";
      });
      for (const iconId of NON_GRID_ICON_IDS) {
        const icon = document.getElementById(iconId);
        if (!icon || allowed.has(iconId)) continue;
        icon.hidden = true;
        icon.setAttribute("aria-hidden", "true");
        icon.style.order = "";
      }
      grid.dataset.roundMode = "category-four";
      grid.dataset.roundCount = "4";
      grid.dataset.roundCategory = normalizeCategory(place);
      grid.dataset.roundFourth = selected[3] || "";
      grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
      grid.style.gridTemplateRows = "repeat(2, minmax(0, 1fr))";
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    const run = () => { scheduled = false; apply(); };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run);
    else global.setTimeout(run, 0);
  }

  function patchOpenPlaceCard() {
    const original = global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__canonicalCategoryFourPatched) return true;
    const patched = async function(...args) {
      const result = await original.apply(this, args);
      scheduleApply();
      return result;
    };
    patched.__canonicalCategoryFourPatched = true;
    global.openPlaceCard = patched;
    return true;
  }

  function installApi() {
    const byId = Object.fromEntries(DEFS.map(def => [def.id, def]));
    global.HGPlaceRounds = {
      registry:[...DEFS], badge:BY_ID.get("badges"),
      base:{ standard:[...GENERAL_BASE], natur:[...NATURE_BASE] },
      fourthPriorities:CATEGORY_FOURTH_PRIORITIES,
      byId, get:place => selectedIds(place).map(id => BY_ID.get(id)).filter(Boolean),
      getFourth:fourthRoundId, apply, __canonicalCategoryFour:true
    };
    global.getPlaceRounds = global.HGPlaceRounds.get;
  }

  function init() {
    ensureDom();
    installApi();
    bindBadge();
    patchOpenPlaceCard();
    scheduleApply();
    if (typeof global.openPlaceCard !== "function") {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 80) global.clearInterval(timer);
      }, 100);
    }
  }

  global.HGVisualPlaceRounds = {
    ids:DEFS.map(def => def.id), registry:[...DEFS], badge:BY_ID.get("badges"),
    base:{ standard:[...GENERAL_BASE], natur:[...NATURE_BASE] },
    fourthPriorities:CATEGORY_FOURTH_PRIORITIES,
    get:selectedIds, getFourth:fourthRoundId, getItems:collectionItems, apply
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated", "updateProfile", "hg:nature-detailed-map-ready"].forEach(name => global.addEventListener?.(name, () => { patchOpenPlaceCard(); scheduleApply(); }));
})(window);
