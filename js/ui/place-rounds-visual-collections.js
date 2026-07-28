// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical presentasjonskontrakt: 4 eller 6 visuelle rundinger, uten DOM-observer-loop.
(function installVisualPlaceRounds(global) {
  "use strict";

  const VISUAL_ROUND_DEFS = Object.freeze([
    { id: "badges",  label: "Merker",      fallbackIcon: "🏅", iconId: "pcBadgesIcon",  listId: "pcBadgesList",  kind: "badges" },
    { id: "people",  label: "Personer",    fallbackIcon: "👥", iconId: "pcPeopleIcon",  listId: "pcPeopleList",  kind: "people" },
    { id: "works",   label: "Verk",        fallbackIcon: "🎭", iconId: "pcWorksIcon",   listId: "pcWorksList",   kind: "works" },
    { id: "objects", label: "Gjenstander", fallbackIcon: "🏺", iconId: "pcObjectsIcon", listId: "pcObjectsList", kind: "objects" },
    { id: "details", label: "Detaljer",    fallbackIcon: "🔎", iconId: "pcDetailsIcon", listId: "pcDetailsList", kind: "details" },
    { id: "spots",   label: "Punkter",     fallbackIcon: "📍", iconId: "pcSpotsIcon",   listId: "pcSpotsList",   kind: "spots" },
    { id: "nature",  label: "Natur",       fallbackIcon: "🌿", iconId: "pcNatureIcon",  listId: "pcNatureList",  kind: "nature" },
    { id: "brands",  label: "Brands",      fallbackIcon: "🏷️", iconId: "pcBrandsIcon",  listId: "pcBrandsList",  kind: "brands" }
  ]);

  const VISUAL_ROUND_IDS = VISUAL_ROUND_DEFS.map(def => def.id);
  const VISUAL_SET = new Set(VISUAL_ROUND_IDS);
  const DEF_BY_ID = new Map(VISUAL_ROUND_DEFS.map(def => [def.id, def]));

  const CATEGORY_ROUND_PRIORITIES = Object.freeze({
    historie:   ["badges", "people", "objects", "spots", "details", "works", "brands", "nature"],
    historisk:  ["badges", "people", "objects", "spots", "details", "works", "brands", "nature"],
    kunst:      ["badges", "works", "people", "details", "spots", "objects", "brands", "nature"],
    politikk:   ["badges", "people", "spots", "details", "objects", "works", "brands", "nature"],
    musikk:     ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    litteratur: ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    sport:      ["badges", "people", "objects", "spots", "details", "works", "brands", "nature"],
    natur:      ["badges", "nature", "spots", "details", "people", "objects", "works", "brands"],
    vitenskap:  ["badges", "people", "objects", "spots", "details", "works", "brands", "nature"],
    teknologi:  ["badges", "objects", "people", "spots", "details", "works", "brands", "nature"],
    filosofi:   ["badges", "people", "works", "spots", "objects", "details", "brands", "nature"],
    film_tv:    ["badges", "people", "works", "spots", "objects", "details", "brands", "nature"],
    by:         ["badges", "works", "spots", "details", "people", "objects", "brands", "nature"],
    lekeplass:  ["badges", "spots", "objects", "nature", "details", "people", "brands", "works"],
    trening:    ["badges", "people", "spots", "objects", "details", "brands", "nature", "works"],
    media:      ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    psykologi:  ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    religion:   ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    scenekunst: ["badges", "people", "works", "spots", "objects", "details", "brands", "nature"],
    subkultur:  ["badges", "people", "works", "details", "spots", "objects", "brands", "nature"],
    naeringsliv:["badges", "brands", "people", "objects", "spots", "details", "works", "nature"],
    transport:  ["badges", "spots", "objects", "details", "people", "works", "brands", "nature"]
  });

  const DEFAULT_PRIORITY = CATEGORY_ROUND_PRIORITIES.by;
  const LEGACY_NON_VISUAL_ICON_IDS = [
    "pcForNaIcon", "pcFortellingerIcon", "pcLeksikonIcon", "pcPlayIcon", "pcTrainingIcon",
    "pcTasksIcon", "pcWonderkammerIcon", "pcStoriesIcon", "pcRoutesIcon", "pcCivicationStoreIcon"
  ];

  let badgeNavigationBound = false;
  let scheduled = false;

  const s = value => String(value == null ? "" : value).trim();
  const array = value => Array.isArray(value) ? value : [];
  const unique = values => [...new Set(array(values).map(s).filter(Boolean))];
  const escapeHTML = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!id) return null;
    return array(global.PLACES).find(place => s(place?.id) === id) || null;
  }

  function normalizeCategory(placeOrCategory) {
    const raw = typeof placeOrCategory === "string" ? placeOrCategory : placeOrCategory?.category;
    return s(raw || "by").toLowerCase();
  }

  function priorityFor(placeOrCategory) {
    return CATEGORY_ROUND_PRIORITIES[normalizeCategory(placeOrCategory)] || DEFAULT_PRIORITY;
  }

  function explicitRoundIds(place) {
    const declared = array(place?.rounds).length ? place.rounds : array(place?.rundinger);
    return unique(declared).filter(id => VISUAL_SET.has(id));
  }

  function hasValidExplicitSet(place) {
    const explicit = explicitRoundIds(place);
    return (explicit.length === 4 || explicit.length === 6) && explicit.includes("badges");
  }

  function excludedRoundIds(place) {
    return new Set(unique(place?.rounds_exclude).filter(id => VISUAL_SET.has(id) && id !== "badges"));
  }

  function recommendedIds(placeOrCategory, count = 4) {
    return priorityFor(placeOrCategory).slice(0, count === 6 ? 6 : 4);
  }

  function imageFor(item) {
    if (!item || typeof item !== "object") return "";
    return s(item.imageCard || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo);
  }

  function iconHasImage(id) {
    const def = DEF_BY_ID.get(id);
    return Boolean(s(document.getElementById(def?.iconId)?.querySelector("img[src]")?.getAttribute("src")));
  }

  function civicationSourceFor(place) {
    const id = s(place?.id);
    return [
      ...array(global.CIVICATION_STORE_BY_PLACE?.[id]), ...array(place?.civication_store),
      ...array(place?.civicationStore), ...array(place?.civication_items), ...array(place?.civicationItems),
      ...array(place?.civication_store_items), ...array(place?.civicationStoreItems)
    ];
  }

  function isPhysicalCivicationObject(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(
      s(item.placeSpecificReason || item.place_specific_reason || item.historicalFunction || item.historical_function || item.material || item.objectType || item.object_type || item.kind || item.type)
      || item.physical === true || item.isPhysical === true || item.is_physical === true
    );
  }

  function normalizeVisualItem(item, index, sourceKind) {
    if (typeof item === "string") return { id: item, title: item, description: "", image: "", sourceKind, raw: item };
    if (!item || typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.treasureTitle || item.id || `${sourceKind} ${index + 1}`);
    return {
      id: id || title,
      title,
      description: s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind),
      image: imageFor(item), sourceKind, raw: item, civicationId: sourceKind === "civication" ? id : ""
    };
  }

  function dedupeItems(items) {
    const seen = new Set();
    return items.filter(Boolean).filter(item => {
      const key = s(item.id || item.title).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function customItems(place, id) {
    if (!place) return [];
    let sources = [];
    if (id === "objects") {
      sources = [
        ...array(place.objects).map(item => [item, "objects"]),
        ...array(place.artifacts).map(item => [item, "artifacts"]),
        ...civicationSourceFor(place).filter(isPhysicalCivicationObject).map(item => [item, "civication"])
      ];
    } else if (id === "details") {
      sources = [...array(place.details).map(item => [item, "details"]), ...array(place.visual_details).map(item => [item, "details"]), ...array(place.site_details).map(item => [item, "details"])];
    } else if (id === "spots") {
      sources = [...array(place.spots).map(item => [item, "spots"]), ...array(place.subplaces).map(item => [item, "subplaces"]), ...array(place.subPlaces).map(item => [item, "subplaces"])];
    }
    return dedupeItems(sources.map(([item, sourceKind], index) => normalizeVisualItem(item, index, sourceKind)));
  }

  function isRoundImageReady(place, id) {
    if (!place) return false;
    if (id === "badges") return iconHasImage(id) || Boolean(s(place.category));
    if (id === "people") return iconHasImage(id) || array(place.people).some(imageFor);
    if (id === "works") return iconHasImage(id) || array(place.works).some(imageFor);
    if (["objects", "details", "spots"].includes(id)) return customItems(place, id).some(item => Boolean(item.image));
    if (id === "nature") return iconHasImage(id) || [...array(place.nature), ...array(place.flora), ...array(place.fauna)].some(imageFor);
    if (id === "brands") return iconHasImage(id) || [...array(place.brands), ...array(global.BRANDS_BY_PLACE?.[s(place.id)])].some(item => typeof item === "object" && imageFor(item));
    return false;
  }

  function selectedIds(place) {
    const explicit = explicitRoundIds(place);
    if (hasValidExplicitSet(place)) return explicit;
    const priority = priorityFor(place);
    const excluded = excludedRoundIds(place);
    const preferred = priority.filter(id => id === "badges" || isRoundImageReady(place, id));
    const target = preferred.length >= 6 ? 6 : 4;
    const candidates = unique([
      ...preferred.filter(id => id === "badges" || !excluded.has(id)),
      ...priority.filter(id => id === "badges" || !excluded.has(id)),
      ...priority,
      ...VISUAL_ROUND_IDS
    ]);
    const selected = candidates.slice(0, target);
    if (!selected.includes("badges")) selected.unshift("badges");
    return unique(selected).slice(0, target);
  }

  function readinessFor(place, ids = selectedIds(place)) {
    const selected = unique(ids);
    const missingImages = selected.filter(id => !isRoundImageReady(place, id));
    return { selected, ready: selected.filter(id => !missingImages.includes(id)), missingImages, complete: (selected.length === 4 || selected.length === 6) && missingImages.length === 0 };
  }

  function ensureCustomRoundDom() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    const body = card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    for (const def of VISUAL_ROUND_DEFS.filter(def => ["objects", "details", "spots"].includes(def.id))) {
      if (!document.getElementById(def.iconId)) {
        const icon = document.createElement("div");
        icon.id = def.iconId; icon.className = "pc-round"; icon.hidden = true; icon.setAttribute("role", "button"); icon.tabIndex = 0; icon.setAttribute("aria-label", def.label); grid.appendChild(icon);
      }
      if (!document.getElementById(def.listId)) {
        const list = document.createElement("div");
        list.id = def.listId; list.hidden = true; list.setAttribute("aria-hidden", "true"); body.appendChild(list);
      }
    }
  }

  function renderCustomCollection(place, def) {
    const icon = document.getElementById(def.iconId);
    const list = document.getElementById(def.listId);
    if (!icon || !list) return;
    const items = customItems(place, def.id);
    const listSignature = JSON.stringify(items.map(item => [item.id, item.title, item.image, item.description]));
    if (list.dataset.visualSignature !== listSignature) {
      list.dataset.visualSignature = listSignature;
      list.innerHTML = items.length ? items.map(item => `<article class="pc-person pc-visual-round-item" data-visual-round-item="${escapeHTML(item.id)}">${item.image ? `<img src="${escapeHTML(item.image)}" class="pc-person-img" alt="">` : ""}<div class="pc-person-meta"><div class="pc-person-name-row"><span class="pc-person-name">${escapeHTML(item.title)}</span></div>${item.description ? `<div class="pc-person-desc">${escapeHTML(item.description)}</div>` : ""}</div></article>`).join("") : `<div class="pc-empty">Ingen ${escapeHTML(def.label.toLowerCase())} registrert ennå</div>`;
    }
    const preview = items.find(item => item.image);
    const previewSignature = preview?.image ? `img:${preview.image}:${preview.title}` : `fallback:${items.length}`;
    if (icon.dataset.visualPreviewSignature !== previewSignature) {
      icon.dataset.visualPreviewSignature = previewSignature;
      icon.innerHTML = preview?.image
        ? `<img src="${escapeHTML(preview.image)}" class="pc-person-img" alt="${escapeHTML(preview.title)}">`
        : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
    }
    icon.dataset.visualItemCount = String(items.length);
  }

  function bindCustomRound(def) {
    const icon = document.getElementById(def.iconId);
    if (!icon || icon.dataset.visualRoundBound === "1") return;
    icon.dataset.visualRoundBound = "1";
    const open = event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.(); event?.stopPropagation?.();
      const place = currentPlace(); if (!place) return;
      renderCustomCollection(place, def);
      const html = s(document.getElementById(def.listId)?.innerHTML) || `<div class="pc-empty">Ingen innhold ennå</div>`;
      global.showPlaceCardRoundPopup?.({ title: def.label, subtitle: s(place.name || place.title), html, place, kind: def.kind });
    };
    icon.addEventListener("click", open); icon.addEventListener("keydown", open);
  }

  function bindBadgeNavigation() {
    if (badgeNavigationBound) return;
    badgeNavigationBound = true;
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null;
      if (!target) return;
      const placeId = s(currentPlace()?.id); if (!placeId) return;
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      global.location.href = `fagverk-sted.html?place=${encodeURIComponent(placeId)}`;
    }, true);
  }

  function applyVisualPolicy(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card) return;
    ensureCustomRoundDom();
    for (const def of VISUAL_ROUND_DEFS.filter(def => ["objects", "details", "spots"].includes(def.id))) {
      renderCustomCollection(place, def); bindCustomRound(def);
    }
    bindBadgeNavigation();
    const selected = place ? selectedIds(place) : [];
    const readiness = place ? readinessFor(place, selected) : { complete: false, missingImages: [] };
    const allowed = new Set(selected);
    card.dataset.roundMode = "visual-collections";
    card.dataset.roundCount = String(selected.length || 0);
    card.dataset.roundReadiness = readiness.complete ? "ready" : "incomplete";
    card.dataset.roundMissingImages = readiness.missingImages.join(",");
    for (const def of VISUAL_ROUND_DEFS) {
      const icon = document.getElementById(def.iconId); if (!icon) continue;
      const shouldShow = allowed.has(def.id);
      if (icon.hidden !== !shouldShow) icon.hidden = !shouldShow;
      icon.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      icon.style.order = shouldShow ? String(selected.indexOf(def.id)) : "";
    }
    for (const iconId of LEGACY_NON_VISUAL_ICON_IDS) {
      const icon = document.getElementById(iconId); if (!icon) continue;
      if (!icon.hidden) icon.hidden = true;
      icon.setAttribute("aria-hidden", "true");
      icon.style.order = "";
    }
    const grid = card.querySelector(".pc-icons-quad");
    if (grid) {
      grid.dataset.roundMode = "visual-collections";
      grid.dataset.roundCount = String(selected.length || 0);
      grid.style.gridTemplateColumns = selected.length === 4 ? "repeat(2, var(--place-card-orb-size))" : "repeat(3, var(--place-card-orb-size))";
      grid.style.gridTemplateRows = "repeat(2, var(--place-card-orb-size))";
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyVisualPolicy();
    });
  }

  function patchPublicRoundApi() {
    const api = global.HGPlaceRounds;
    if (!api || api.__visualCollectionsPatchedV4) return;
    api.getVisual = place => selectedIds(place).map(id => DEF_BY_ID.get(id)).filter(Boolean);
    api.applyVisual = place => applyVisualPolicy(place);
    api.visualIds = [...VISUAL_ROUND_IDS];
    api.visualRegistry = [...VISUAL_ROUND_DEFS];
    api.visualPriorities = CATEGORY_ROUND_PRIORITIES;
    api.recommendVisual = recommendedIds;
    api.getVisualReadiness = readinessFor;
    api.__visualCollectionsPatchedV4 = true;
  }

  function init() {
    ensureCustomRoundDom(); patchPublicRoundApi(); bindBadgeNavigation(); scheduleApply();
  }

  global.HGVisualPlaceRounds = {
    ids: [...VISUAL_ROUND_IDS], registry: [...VISUAL_ROUND_DEFS], priorities: CATEGORY_ROUND_PRIORITIES,
    get: selectedIds, recommend: recommendedIds, readiness: readinessFor, isImageReady: isRoundImageReady,
    getItems: customItems, apply: applyVisualPolicy
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated", "hg:visitedUpdated", "updateProfile"].forEach(name => global.addEventListener?.(name, scheduleApply));
})(window);
