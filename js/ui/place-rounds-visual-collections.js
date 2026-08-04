// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-rundinger: Badges ved tittelen og fire kategoriavhengige
// visuelle samlinger ved frontImage. Regler eies av data/places/README_place_rounds.md.
(function installCanonicalPlaceRounds(global) {
  "use strict";

  const DEFS = Object.freeze([
    { id:"badges",  label:"Merker",      fallbackIcon:"🏅", iconId:"pcBadgesIcon",  listId:"pcBadgesList",  kind:"badges" },
    { id:"people",  label:"Personer",    fallbackIcon:"👥", iconId:"pcPeopleIcon",  listId:"pcPeopleList",  kind:"people" },
    { id:"works",   label:"Verk",        fallbackIcon:"🎭", iconId:"pcWorksIcon",   listId:"pcWorksList",   kind:"works" },
    { id:"objects", label:"Gjenstander", fallbackIcon:"🏺", iconId:"pcObjectsIcon", listId:"pcObjectsList", kind:"objects" },
    { id:"details", label:"Detaljer",    fallbackIcon:"🔎", iconId:"pcDetailsIcon", listId:"pcDetailsList", kind:"details" },
    { id:"spots",   label:"Punkter",     fallbackIcon:"📍", iconId:"pcSpotsIcon",   listId:"pcSpotsList",   kind:"spots" },
    { id:"nature",  label:"Natur",       fallbackIcon:"🌿", iconId:"pcNatureIcon",  listId:"pcNatureList",  kind:"nature" },
    { id:"brands",  label:"Brands",      fallbackIcon:"🏷️", iconId:"pcBrandsIcon",  listId:"pcBrandsList",  kind:"brands" }
  ]);

  const BY_ID = new Map(DEFS.map(def => [def.id, def]));
  const CONTENT_IDS = new Set(DEFS.filter(def => def.id !== "badges").map(def => def.id));

  // Fire midtrundinger = kategoriens gamle 4-runders kjerne uten Badges,
  // pluss første prioritet fra normal utvidelse. Rekkefølgen følger den
  // canonicale kategori→rundingmatrisen.
  const CATEGORY_ROUND_PROFILES = Object.freeze({
    by:          ["works", "spots", "details", "people"],
    historie:    ["people", "objects", "spots", "details"],
    kunst:       ["works", "people", "details", "spots"],
    litteratur:  ["people", "works", "objects", "spots"],
    media:       ["people", "works", "objects", "spots"],
    musikk:      ["people", "works", "objects", "spots"],
    naeringsliv: ["brands", "people", "objects", "spots"],
    natur:       ["nature", "spots", "details", "people"],
    politikk:    ["people", "spots", "details", "objects"],
    psykologi:   ["people", "works", "objects", "spots"],
    religion:    ["people", "works", "objects", "spots"],
    scenekunst:  ["people", "works", "spots", "objects"],
    sport:       ["people", "objects", "spots", "details"],
    subkultur:   ["people", "works", "details", "spots"],
    vitenskap:   ["people", "objects", "spots", "details"],
    filosofi:    ["people", "works", "spots", "objects"],
    film_tv:     ["people", "works", "spots", "objects"],

    // Legacy presentasjonskategorier normaliseres til nærmeste canonical profil.
    historisk:   ["people", "objects", "spots", "details"],
    teknologi:   ["objects", "people", "spots", "details"],
    transport:   ["spots", "objects", "details", "people"],
    lekeplass:   ["spots", "objects", "nature", "details"],
    trening:     ["people", "spots", "objects", "details"]
  });

  const DEFAULT_PROFILE = CATEGORY_ROUND_PROFILES.by;
  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  let scheduled = false;
  let badgeBound = false;

  function unique(values) {
    return [...new Set(arr(values).map(s).filter(Boolean))];
  }

  function categoryFor(place) {
    return s(place?.category || "by").toLowerCase();
  }

  function priorityFor(place) {
    return CATEGORY_ROUND_PROFILES[categoryFor(place)] || DEFAULT_PROFILE;
  }

  function explicitContentIds(place) {
    const declared = Array.isArray(place?.rounds)
      ? place.rounds
      : (Array.isArray(place?.rundinger) ? place.rundinger : []);
    return unique(declared).filter(id => id !== "badges" && CONTENT_IDS.has(id));
  }

  function selectedIds(place) {
    const priority = priorityFor(place);
    const explicit = explicitContentIds(place);
    return unique([...explicit, ...priority]).slice(0, 4);
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
    return {
      id: id || s(item.title || item.name),
      title: s(item.title || item.name || item.label || item.id || `${sourceKind} ${index + 1}`),
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
      ...arr(place?.civication_store),
      ...arr(place?.civicationStore),
      ...arr(place?.civication_items),
      ...arr(place?.civicationItems)
    ];
  }

  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(
      item.physicalObject === true || item.physical === true || item.isPhysical === true ||
      s(item.objectType || item.object_type || item.material || item.historicalFunction || item.historical_function)
    );
  }

  function customItems(place, id) {
    let sources = [];
    if (id === "objects") {
      sources = [
        ...arr(place?.objects).map(item => [item, "objects"]),
        ...arr(place?.artifacts).map(item => [item, "artifacts"]),
        ...civicationItems(place).filter(physicalCivication).map(item => [item, "civication"])
      ];
    } else if (id === "details") {
      sources = [
        ...arr(place?.details).map(item => [item, "details"]),
        ...arr(place?.visual_details).map(item => [item, "details"]),
        ...arr(place?.site_details).map(item => [item, "details"])
      ];
    } else if (id === "spots") {
      sources = [
        ...arr(place?.spots).map(item => [item, "spots"]),
        ...arr(place?.subplaces).map(item => [item, "subplaces"]),
        ...arr(place?.subPlaces).map(item => [item, "subplaces"])
      ];
    }
    return dedupe(sources.map(([item, sourceKind], index) => normalizeItem(item, index, sourceKind)));
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

    for (const def of DEFS.filter(item => ["objects", "details", "spots"].includes(item.id))) {
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
    if (!items.length) return `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
    return items.map(item => `
      <button type="button" class="pc-person pc-visual-round-item" data-visual-round-item="${esc(item.id)}">
        ${item.image ? `<img src="${esc(item.image)}" class="pc-person-img" alt="">` : ""}
        <span class="pc-person-meta">
          <span class="pc-person-name">${esc(item.title)}</span>
          ${item.description ? `<span class="pc-person-desc">${esc(item.description)}</span>` : ""}
        </span>
      </button>
    `).join("");
  }

  function renderCustom(place, def) {
    const icon = document.getElementById(def.iconId);
    const list = document.getElementById(def.listId);
    if (!icon || !list) return;
    const items = customItems(place, def.id);
    list.innerHTML = renderRows(items, def);
    const preview = items.find(item => item.image);
    icon.innerHTML = preview?.image
      ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">`
      : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
    icon.dataset.roundReady = preview?.image ? "true" : "false";
  }

  function bindCustom(def) {
    const icon = document.getElementById(def.iconId);
    if (!icon || icon.dataset.canonicalRoundBound === "1") return;
    icon.dataset.canonicalRoundBound = "1";
    const open = event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place = currentPlace();
      if (!place) return;
      renderCustom(place, def);
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

  function apply(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card || !place) return;
    ensureDom();
    bindBadge();
    ensureBadgePlacement();

    for (const def of DEFS.filter(item => ["objects", "details", "spots"].includes(item.id))) {
      renderCustom(place, def);
      bindCustom(def);
    }

    const selected = selectedIds(place);
    const allowed = new Set(selected.map(id => BY_ID.get(id)?.iconId).filter(Boolean));
    const grid = card.querySelector(".pc-icons-quad");
    card.dataset.roundMode = `category-${categoryFor(place)}`;
    card.dataset.roundCount = "4";

    if (grid) {
      grid.querySelectorAll(".pc-round").forEach(icon => {
        const show = allowed.has(icon.id);
        icon.hidden = !show;
        icon.setAttribute("aria-hidden", show ? "false" : "true");
        const def = DEFS.find(item => item.iconId === icon.id);
        icon.style.order = show && def ? String(selected.indexOf(def.id)) : "";
      });
      grid.dataset.roundMode = card.dataset.roundMode;
      grid.dataset.roundCount = "4";
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
    if (original.__canonicalCategoryRoundsPatched) return true;
    const patched = async function(...args) {
      const result = await original.apply(this, args);
      scheduleApply();
      return result;
    };
    patched.__canonicalCategoryRoundsPatched = true;
    global.openPlaceCard = patched;
    return true;
  }

  function installApi() {
    const byId = Object.fromEntries(DEFS.map(def => [def.id, def]));
    global.HGPlaceRounds = {
      registry:[...DEFS],
      badge:BY_ID.get("badges"),
      defaults:[...DEFAULT_PROFILE],
      profiles:{ ...CATEGORY_ROUND_PROFILES },
      byId,
      get:place => selectedIds(place).map(id => BY_ID.get(id)),
      apply,
      __canonicalCategoryFourRounds:true
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
    ids:DEFS.map(def => def.id),
    registry:[...DEFS],
    badge:BY_ID.get("badges"),
    profiles:{ ...CATEGORY_ROUND_PROFILES },
    get:selectedIds,
    apply
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated", "updateProfile"].forEach(name =>
    global.addEventListener?.(name, () => { patchOpenPlaceCard(); scheduleApply(); })
  );
})(window);
