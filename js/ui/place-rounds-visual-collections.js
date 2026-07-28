// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical presentasjonskontrakt: rundinger er visuelle samlinger. Nye/reviderte
// steder bruker nøyaktig fire eller seks rundinger, og Badges er alltid med.
(function installVisualPlaceRounds(global) {
  "use strict";

  const VISUAL_ROUND_DEFS = Object.freeze([
    { id: "badges",  label: "Merker",       fallbackIcon: "🏅", iconId: "pcBadgesIcon",  listId: "pcBadgesList",  kind: "badges" },
    { id: "people",  label: "Personer",     fallbackIcon: "👥", iconId: "pcPeopleIcon",  listId: "pcPeopleList",  kind: "people" },
    { id: "works",   label: "Verk",         fallbackIcon: "🎭", iconId: "pcWorksIcon",   listId: "pcWorksList",   kind: "works" },
    { id: "objects", label: "Gjenstander",  fallbackIcon: "🏺", iconId: "pcObjectsIcon", listId: "pcObjectsList", kind: "objects" },
    { id: "details", label: "Detaljer",     fallbackIcon: "🔎", iconId: "pcDetailsIcon", listId: "pcDetailsList", kind: "details" },
    { id: "spots",   label: "Punkter",      fallbackIcon: "📍", iconId: "pcSpotsIcon",   listId: "pcSpotsList",   kind: "spots" },
    { id: "nature",  label: "Natur",        fallbackIcon: "🌿", iconId: "pcNatureIcon",  listId: "pcNatureList",  kind: "nature" },
    { id: "brands",  label: "Brands",       fallbackIcon: "🏷️", iconId: "pcBrandsIcon",  listId: "pcBrandsList",  kind: "brands" }
  ]);

  const VISUAL_ROUND_IDS = Object.freeze(VISUAL_ROUND_DEFS.map(def => def.id));
  const VISUAL_SET = new Set(VISUAL_ROUND_IDS);
  const DEF_BY_ID = new Map(VISUAL_ROUND_DEFS.map(def => [def.id, def]));

  // Prioritet = 4-runders kjerne først, deretter de to normale utvidelsene.
  // De siste to er reservevalg ved eksplisitt kuratering.
  const CATEGORY_ROUND_PRIORITIES = Object.freeze({
    historie:   ["badges", "people", "objects", "spots", "details", "works", "brands", "nature"],
    historisk:  ["badges", "people", "objects", "spots", "details", "works", "brands", "nature"],
    kunst:      ["badges", "works", "people", "details", "brands", "spots", "objects", "nature"],
    politikk:   ["badges", "people", "brands", "spots", "objects", "details", "works", "nature"],
    musikk:     ["badges", "people", "works", "brands", "objects", "spots", "details", "nature"],
    litteratur: ["badges", "people", "works", "objects", "spots", "brands", "details", "nature"],
    sport:      ["badges", "people", "brands", "spots", "objects", "details", "works", "nature"],
    natur:      ["badges", "nature", "spots", "details", "people", "objects", "works", "brands"],
    vitenskap:  ["badges", "people", "objects", "brands", "spots", "details", "nature", "works"],
    filosofi:   ["badges", "people", "works", "spots", "objects", "brands", "details", "nature"],

    // Legacy place-kategorier beholdes som presentasjonskompatibilitet. De er ikke
    // en ny badge-taksonomi og endrer ingen eksisterende Brands-data.
    by:         ["badges", "spots", "details", "people", "works", "objects", "brands", "nature"],
    lekeplass:  ["badges", "spots", "objects", "nature", "details", "people", "brands", "works"],
    trening:    ["badges", "people", "spots", "objects", "brands", "details", "nature", "works"],
    media:      ["badges", "people", "works", "objects", "brands", "spots", "details", "nature"],
    psykologi:  ["badges", "people", "works", "objects", "spots", "brands", "details", "nature"],
    religion:   ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    subkultur:  ["badges", "people", "works", "details", "spots", "objects", "brands", "nature"],
    naeringsliv:["badges", "brands", "people", "objects", "spots", "works", "details", "nature"],
    transport:  ["badges", "spots", "objects", "brands", "details", "people", "works", "nature"]
  });

  const DEFAULT_PRIORITY = CATEGORY_ROUND_PRIORITIES.by;

  const LEGACY_NON_VISUAL_ICON_IDS = Object.freeze([
    "pcForNaIcon",
    "pcFortellingerIcon",
    "pcLeksikonIcon",
    "pcPlayIcon",
    "pcTrainingIcon",
    "pcTasksIcon",
    "pcWonderkammerIcon",
    "pcStoriesIcon",
    "pcRoutesIcon",
    "pcCivicationStoreIcon"
  ]);

  let observer = null;
  let badgeNavigationBound = false;

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function unique(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(s).filter(Boolean))];
  }

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!id) return null;
    return (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => s(place?.id) === id) || null;
  }

  function normalizeCategory(placeOrCategory) {
    const raw = typeof placeOrCategory === "string" ? placeOrCategory : placeOrCategory?.category;
    return s(raw || "by").toLowerCase();
  }

  function priorityFor(placeOrCategory) {
    return CATEGORY_ROUND_PRIORITIES[normalizeCategory(placeOrCategory)] || DEFAULT_PRIORITY;
  }

  function explicitRoundIds(place) {
    const declared = Array.isArray(place?.rounds)
      ? place.rounds
      : (Array.isArray(place?.rundinger) ? place.rundinger : []);
    return unique(declared).filter(id => VISUAL_SET.has(id));
  }

  function excludedRoundIds(place) {
    return new Set(
      unique(Array.isArray(place?.rounds_exclude) ? place.rounds_exclude : [])
        .filter(id => VISUAL_SET.has(id) && id !== "badges")
    );
  }

  function recommendedIds(placeOrCategory, count = 4) {
    const target = count === 6 ? 6 : 4;
    return priorityFor(placeOrCategory).slice(0, target);
  }

  function selectedIds(place) {
    const explicit = explicitRoundIds(place);
    const target = explicit.length >= 6 ? 6 : 4;
    const excluded = excludedRoundIds(place);
    const priority = priorityFor(place);

    const seed = explicit.length >= 4
      ? ["badges", ...explicit.filter(id => id !== "badges")]
      : priority;

    const candidates = unique([...seed, ...priority, ...VISUAL_ROUND_IDS]);
    const selected = [];

    for (const id of candidates) {
      if (!VISUAL_SET.has(id)) continue;
      if (id !== "badges" && excluded.has(id)) continue;
      if (!selected.includes(id)) selected.push(id);
      if (selected.length >= target) break;
    }

    // Badges er obligatorisk. Runtime skal aldri ende på fem rundinger.
    if (!selected.includes("badges")) selected.unshift("badges");
    return unique(selected).slice(0, target);
  }

  function ensureCustomRoundDom() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    const body = card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;

    for (const def of VISUAL_ROUND_DEFS.filter(def => ["objects", "details", "spots"].includes(def.id))) {
      if (!document.getElementById(def.iconId)) {
        const icon = document.createElement("div");
        icon.id = def.iconId;
        icon.className = "pc-round";
        icon.hidden = true;
        icon.setAttribute("role", "button");
        icon.setAttribute("tabindex", "0");
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
  }

  function imageFor(item) {
    if (!item || typeof item !== "object") return "";
    return s(item.imageCard || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo || item.icon);
  }

  function normalizeVisualItem(item, index, sourceKind) {
    if (typeof item === "string") {
      return { id: item, title: item, description: "", image: "", sourceKind, raw: item };
    }
    if (!item || typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.treasureTitle || item.id || `${sourceKind} ${index + 1}`);
    if (!id && !title) return null;
    return {
      id: id || title,
      title,
      description: s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind),
      image: imageFor(item),
      sourceKind,
      raw: item,
      civicationId: sourceKind === "civication" ? id : ""
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

  function civicationSourceFor(place) {
    const id = s(place?.id);
    return [
      ...(Array.isArray(global.CIVICATION_STORE_BY_PLACE?.[id]) ? global.CIVICATION_STORE_BY_PLACE[id] : []),
      ...(Array.isArray(place?.civication_store) ? place.civication_store : []),
      ...(Array.isArray(place?.civicationStore) ? place.civicationStore : []),
      ...(Array.isArray(place?.civication_items) ? place.civication_items : []),
      ...(Array.isArray(place?.civicationItems) ? place.civicationItems : []),
      ...(Array.isArray(place?.civication_store_items) ? place.civication_store_items : []),
      ...(Array.isArray(place?.civicationStoreItems) ? place.civicationStoreItems : [])
    ];
  }

  function customItems(place, id) {
    if (!place) return [];
    let sources = [];

    if (id === "objects") {
      sources = [
        ...((Array.isArray(place.objects) ? place.objects : []).map(item => [item, "objects"])),
        ...((Array.isArray(place.artifacts) ? place.artifacts : []).map(item => [item, "artifacts"])),
        ...(civicationSourceFor(place).map(item => [item, "civication"]))
      ];
    } else if (id === "details") {
      sources = [
        ...((Array.isArray(place.details) ? place.details : []).map(item => [item, "details"])),
        ...((Array.isArray(place.visual_details) ? place.visual_details : []).map(item => [item, "details"])),
        ...((Array.isArray(place.site_details) ? place.site_details : []).map(item => [item, "details"]))
      ];
    } else if (id === "spots") {
      sources = [
        ...((Array.isArray(place.spots) ? place.spots : []).map(item => [item, "spots"])),
        ...((Array.isArray(place.subplaces) ? place.subplaces : []).map(item => [item, "subplaces"])),
        ...((Array.isArray(place.subPlaces) ? place.subPlaces : []).map(item => [item, "subplaces"]))
      ];
    }

    return dedupeItems(sources.map(([item, sourceKind], index) => normalizeVisualItem(item, index, sourceKind)));
  }

  function renderCustomCollection(place, def) {
    const icon = document.getElementById(def.iconId);
    const list = document.getElementById(def.listId);
    if (!icon || !list) return;

    const items = customItems(place, def.id);
    const signature = JSON.stringify(items.map(item => [item.id, item.title, item.image]));
    if (list.dataset.visualSignature !== signature) {
      list.dataset.visualSignature = signature;
      list.innerHTML = items.length
        ? items.map(item => `
            <article class="pc-person pc-visual-round-item" data-visual-round-item="${escapeHTML(item.id)}">
              ${item.image ? `<img src="${escapeHTML(item.image)}" class="pc-person-img" alt="">` : ""}
              <div class="pc-person-meta">
                <div class="pc-person-name-row"><span class="pc-person-name">${escapeHTML(item.title)}</span></div>
                ${item.description ? `<div class="pc-person-desc">${escapeHTML(item.description)}</div>` : ""}
              </div>
              ${item.civicationId ? `<button type="button" class="pc-civi-entry" data-visual-civi-store="${escapeHTML(item.civicationId)}">Åpne i Civication</button>` : ""}
            </article>
          `).join("")
        : `<div class="pc-empty">Ingen ${escapeHTML(def.label.toLowerCase())} registrert ennå</div>`;

      list.querySelectorAll("[data-visual-civi-store]").forEach(node => {
        node.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          const itemId = s(node.getAttribute("data-visual-civi-store"));
          if (!itemId) return;
          if (global.CivicationStore && typeof global.CivicationStore.openEntry === "function") {
            global.CivicationStore.openEntry(itemId, place);
          } else if (typeof global.openCivicationStoreEntry === "function") {
            global.openCivicationStoreEntry(itemId, place);
          } else {
            global.showToast?.("Civication Store-handler ikke lastet");
          }
        });
      });
    }

    const preview = items.find(item => item.image);
    if (preview?.image) {
      icon.innerHTML = `<img src="${escapeHTML(preview.image)}" class="pc-person-img" alt="${escapeHTML(preview.title)}">`;
    } else {
      icon.innerHTML = `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
    }
    icon.dataset.visualItemCount = String(items.length);
  }

  function bindCustomRound(def) {
    const icon = document.getElementById(def.iconId);
    if (!icon || icon.dataset.visualRoundBound === "1") return;
    icon.dataset.visualRoundBound = "1";

    const open = event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place = currentPlace();
      if (!place) return;
      renderCustomCollection(place, def);
      const list = document.getElementById(def.listId);
      const html = s(list?.innerHTML) || `<div class="pc-empty">Ingen innhold ennå</div>`;
      if (typeof global.showPlaceCardRoundPopup === "function") {
        global.showPlaceCardRoundPopup({
          title: def.label,
          subtitle: s(place.name || place.title),
          html,
          place,
          kind: def.kind
        });
      } else {
        global.showToast?.(`${def.label}-rundingen er ikke lastet ennå`);
      }
    };

    icon.addEventListener("click", open);
    icon.addEventListener("keydown", open);
  }

  function renderCustomRounds(place) {
    for (const def of VISUAL_ROUND_DEFS.filter(def => ["objects", "details", "spots"].includes(def.id))) {
      renderCustomCollection(place, def);
      bindCustomRound(def);
    }
  }

  function bindBadgeNavigation() {
    if (badgeNavigationBound) return;
    badgeNavigationBound = true;
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null;
      if (!(target instanceof HTMLElement)) return;
      const place = currentPlace();
      const placeId = s(place?.id);
      if (!placeId) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      global.location.href = `fagverk-sted.html?place=${encodeURIComponent(placeId)}`;
    }, true);
  }

  function applyVisualPolicy(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card) return;

    ensureCustomRoundDom();
    renderCustomRounds(place);
    bindBadgeNavigation();

    const selected = place ? selectedIds(place) : [];
    const allowed = new Set(selected);
    card.dataset.roundMode = "visual-collections";
    card.dataset.roundCount = String(selected.length || 0);

    for (const def of VISUAL_ROUND_DEFS) {
      const icon = document.getElementById(def.iconId);
      if (!icon) continue;
      const shouldShow = allowed.has(def.id);
      if (icon.hidden === shouldShow) icon.hidden = !shouldShow;
      icon.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      icon.dataset.roundSurface = shouldShow ? "visual-collection" : "visual-collection-inactive";
      icon.style.order = shouldShow ? String(selected.indexOf(def.id)) : "";
    }

    for (const iconId of LEGACY_NON_VISUAL_ICON_IDS) {
      const icon = document.getElementById(iconId);
      if (!icon) continue;
      if (!icon.hidden) icon.hidden = true;
      icon.setAttribute("aria-hidden", "true");
      icon.dataset.roundSurface = "moved-out-of-round-grid";
      icon.style.order = "";
    }

    const grid = card.querySelector(".pc-icons-quad");
    if (grid) {
      grid.dataset.roundMode = "visual-collections";
      grid.dataset.roundCount = String(selected.length || 0);
      grid.style.gridTemplateColumns = selected.length === 4
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))";
    }
  }

  function patchPublicRoundApi() {
    const api = global.HGPlaceRounds;
    if (!api || api.__visualCollectionsPatchedV2) return;

    api.getVisual = place => selectedIds(place).map(id => DEF_BY_ID.get(id)).filter(Boolean);
    api.applyVisual = place => applyVisualPolicy(place);
    api.visualIds = [...VISUAL_ROUND_IDS];
    api.visualRegistry = [...VISUAL_ROUND_DEFS];
    api.visualPriorities = CATEGORY_ROUND_PRIORITIES;
    api.recommendVisual = (placeOrCategory, count = 4) => recommendedIds(placeOrCategory, count);
    api.__visualCollectionsPatchedV2 = true;
  }

  function observe() {
    const card = document.getElementById("placeCard");
    if (!card || observer) return;
    observer = new MutationObserver(() => applyVisualPolicy());
    observer.observe(card, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden", "class", "data-current-place-id"]
    });
  }

  function init() {
    ensureCustomRoundDom();
    patchPublicRoundApi();
    bindBadgeNavigation();
    applyVisualPolicy();
    observe();
  }

  global.HGVisualPlaceRounds = {
    ids: [...VISUAL_ROUND_IDS],
    registry: [...VISUAL_ROUND_DEFS],
    priorities: CATEGORY_ROUND_PRIORITIES,
    get: selectedIds,
    recommend: recommendedIds,
    apply: applyVisualPolicy
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.addEventListener?.("hg:appReady", init);
})(window);
