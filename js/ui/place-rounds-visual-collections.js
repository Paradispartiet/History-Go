// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical presentasjonskontrakt: rundinger er visuelle samlinger. Nye/reviderte
// steder bruker nøyaktig fire eller seks rundinger, Badges er alltid med, og
// produksjonsklare rundinger skal ha et faktisk visuelt preview.
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
  // Brands er ikke en generell aktørkategori; eksisterende Brands-data avgjør
  // om Brands løftes foran en ellers tom anbefalt samling.
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
    filosofi:   ["badges", "people", "works", "spots", "objects", "details", "brands", "nature"],

    // Legacy place-kategorier beholdes som presentasjonskompatibilitet. De er ikke
    // en ny badge-taksonomi og endrer ingen eksisterende Brands-data.
    by:          ["badges", "spots", "details", "people", "works", "objects", "brands", "nature"],
    lekeplass:   ["badges", "spots", "objects", "nature", "details", "people", "brands", "works"],
    trening:     ["badges", "people", "spots", "objects", "details", "brands", "nature", "works"],
    media:       ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    psykologi:   ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    religion:    ["badges", "people", "works", "objects", "spots", "details", "brands", "nature"],
    subkultur:   ["badges", "people", "works", "details", "spots", "objects", "brands", "nature"],
    naeringsliv: ["badges", "brands", "people", "objects", "spots", "works", "details", "nature"],
    transport:   ["badges", "spots", "objects", "details", "people", "works", "brands", "nature"]
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

  function array(value) {
    return Array.isArray(value) ? value : [];
  }

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
    const declared = Array.isArray(place?.rounds)
      ? place.rounds
      : (Array.isArray(place?.rundinger) ? place.rundinger : []);
    return unique(declared).filter(id => VISUAL_SET.has(id));
  }

  function hasValidExplicitSet(place) {
    const explicit = explicitRoundIds(place);
    return (explicit.length === 4 || explicit.length === 6) && explicit.includes("badges");
  }

  function excludedRoundIds(place) {
    return new Set(
      unique(array(place?.rounds_exclude))
        .filter(id => VISUAL_SET.has(id) && id !== "badges")
    );
  }

  function recommendedIds(placeOrCategory, count = 4) {
    const target = count === 6 ? 6 : 4;
    return priorityFor(placeOrCategory).slice(0, target);
  }

  function imageFor(item) {
    if (!item || typeof item !== "object") return "";
    return s(item.imageCard || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo);
  }

  function hasImage(items) {
    return array(items).some(item => imageFor(item));
  }

  function iconHasImage(id) {
    const def = DEF_BY_ID.get(id);
    if (!def) return false;
    const img = document.getElementById(def.iconId)?.querySelector("img[src]");
    return Boolean(s(img?.getAttribute("src")));
  }

  function civicationSourceFor(place) {
    const id = s(place?.id);
    return [
      ...array(global.CIVICATION_STORE_BY_PLACE?.[id]),
      ...array(place?.civication_store),
      ...array(place?.civicationStore),
      ...array(place?.civication_items),
      ...array(place?.civicationItems),
      ...array(place?.civication_store_items),
      ...array(place?.civicationStoreItems)
    ];
  }

  function isPhysicalCivicationObject(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    const placeSpecific = s(item.placeSpecificReason || item.place_specific_reason);
    const physicalEvidence = s(
      item.historicalFunction || item.historical_function || item.material || item.objectType || item.object_type || item.kind || item.type
    );
    return Boolean(placeSpecific || physicalEvidence || item.physical === true || item.isPhysical === true || item.is_physical === true);
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

  function customItems(place, id) {
    if (!place) return [];
    let sources = [];

    if (id === "objects") {
      sources = [
        ...array(place.objects).map(item => [item, "objects"]),
        ...array(place.artifacts).map(item => [item, "artifacts"]),
        ...civicationSourceFor(place)
          .filter(isPhysicalCivicationObject)
          .map(item => [item, "civication"])
      ];
    } else if (id === "details") {
      sources = [
        ...array(place.details).map(item => [item, "details"]),
        ...array(place.visual_details).map(item => [item, "details"]),
        ...array(place.site_details).map(item => [item, "details"])
      ];
    } else if (id === "spots") {
      sources = [
        ...array(place.spots).map(item => [item, "spots"]),
        ...array(place.subplaces).map(item => [item, "subplaces"]),
        ...array(place.subPlaces).map(item => [item, "subplaces"])
      ];
    }

    return dedupeItems(sources.map(([item, sourceKind], index) => normalizeVisualItem(item, index, sourceKind)));
  }

  function badgeHasImage(place) {
    if (iconHasImage("badges")) return true;
    const category = s(place?.category);
    if (!category) return false;
    const badge = array(global.BADGES).find(item => s(item?.id) === category);
    return Boolean(imageFor(badge));
  }

  function brandsHaveImage(place) {
    if (iconHasImage("brands")) return true;
    const placeId = s(place?.id);
    const raw = [
      ...array(place?.brands),
      ...array(place?.brand_ids),
      ...array(global.BRANDS_BY_PLACE?.[placeId])
    ];
    return raw.some(item => {
      if (item && typeof item === "object") return Boolean(imageFor(item));
      const resolved = global.HGBrands?.getById?.(item);
      return Boolean(resolved && imageFor(resolved));
    });
  }

  function isRoundImageReady(place, id) {
    if (!place || !VISUAL_SET.has(id)) return false;
    if (id === "badges") return badgeHasImage(place);
    if (id === "people") return iconHasImage("people") || hasImage(place.people);
    if (id === "works") return iconHasImage("works") || hasImage(place.works);
    if (["objects", "details", "spots"].includes(id)) return customItems(place, id).some(item => Boolean(item.image));
    if (id === "nature") {
      return iconHasImage("nature") || hasImage([
        ...array(place.nature),
        ...array(place.flora),
        ...array(place.fauna)
      ]);
    }
    if (id === "brands") return brandsHaveImage(place);
    return false;
  }

  function selectedIds(place) {
    const explicit = explicitRoundIds(place);
    if (hasValidExplicitSet(place)) return explicit;

    const excluded = excludedRoundIds(place);
    const priority = priorityFor(place);
    const preferred = priority.filter(id => id === "badges" || isRoundImageReady(place, id));
    const target = preferred.length >= 6 ? 6 : 4;

    // Ekskluderte valg ligger sist. 4/6-layouten har høyere prioritet enn en
    // ugyldig konfigurasjon som forsøker å ekskludere så mange at færre enn fire gjenstår.
    const nonExcluded = priority.filter(id => id === "badges" || !excluded.has(id));
    const excludedFallback = priority.filter(id => id !== "badges" && excluded.has(id));
    const candidates = unique([
      ...preferred.filter(id => id === "badges" || !excluded.has(id)),
      ...nonExcluded,
      ...excludedFallback,
      ...VISUAL_ROUND_IDS
    ]);

    const selected = candidates.slice(0, target);
    if (!selected.includes("badges")) selected.unshift("badges");
    return unique(selected).slice(0, target);
  }

  function readinessFor(place, ids = selectedIds(place)) {
    const selected = unique(ids);
    const missingImages = selected.filter(id => !isRoundImageReady(place, id));
    return {
      selected,
      ready: selected.filter(id => !missingImages.includes(id)),
      missingImages,
      complete: (selected.length === 4 || selected.length === 6) && missingImages.length === 0
    };
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

  function stripLegacySportRowsFromWorks(place) {
    if (!place?.sport_profile) return;
    const worksEl = document.getElementById("pcWorksList");
    if (!worksEl) return;
    const legacySportChips = new Set(["Sport", "Arena", "Klubb / lag"]);
    worksEl.querySelectorAll(".pc-relation-card").forEach(card => {
      const chip = s(card.querySelector(".pc-relation-chip")?.textContent);
      if (legacySportChips.has(chip)) card.remove();
    });
    const remaining = s(worksEl.textContent);
    if (!remaining || remaining === "Ingen verk eller prestasjoner ennå") {
      worksEl.innerHTML = '<div class="pc-empty">Ingen verk ennå</div>';
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
    stripLegacySportRowsFromWorks(place);
    bindBadgeNavigation();

    const selected = place ? selectedIds(place) : [];
    const readiness = place ? readinessFor(place, selected) : { complete: false, missingImages: [] };
    const allowed = new Set(selected);
    card.dataset.roundMode = "visual-collections";
    card.dataset.roundCount = String(selected.length || 0);
    card.dataset.roundReadiness = readiness.complete ? "ready" : "incomplete";
    card.dataset.roundMissingImages = readiness.missingImages.join(",");

    for (const def of VISUAL_ROUND_DEFS) {
      const icon = document.getElementById(def.iconId);
      if (!icon) continue;
      const shouldShow = allowed.has(def.id);
      if (icon.hidden === shouldShow) icon.hidden = !shouldShow;
      icon.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      icon.dataset.roundSurface = shouldShow ? "visual-collection" : "visual-collection-inactive";
      icon.dataset.visualReady = place && isRoundImageReady(place, def.id) ? "true" : "false";
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
        ? "repeat(2, var(--place-card-orb-size))"
        : "repeat(3, var(--place-card-orb-size))";
      grid.style.gridTemplateRows = "repeat(2, var(--place-card-orb-size))";
    }
  }

  function patchPublicRoundApi() {
    const api = global.HGPlaceRounds;
    if (!api || api.__visualCollectionsPatchedV3) return;

    api.getVisual = place => selectedIds(place).map(id => DEF_BY_ID.get(id)).filter(Boolean);
    api.applyVisual = place => applyVisualPolicy(place);
    api.visualIds = [...VISUAL_ROUND_IDS];
    api.visualRegistry = [...VISUAL_ROUND_DEFS];
    api.visualPriorities = CATEGORY_ROUND_PRIORITIES;
    api.recommendVisual = (placeOrCategory, count = 4) => recommendedIds(placeOrCategory, count);
    api.getVisualReadiness = place => readinessFor(place);
    api.__visualCollectionsPatchedV3 = true;
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
    readiness: readinessFor,
    isImageReady: isRoundImageReady,
    getItems: customItems,
    apply: applyVisualPolicy
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.addEventListener?.("hg:appReady", init);
})(window);
