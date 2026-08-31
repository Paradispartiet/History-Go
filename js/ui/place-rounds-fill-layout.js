// @ts-nocheck
// js/ui/place-rounds-fill-layout.js
// Balanserer 1–4 ferdige PlaceCard-samlinger ved siden av frontImage.
(function installPlaceRoundsFillLayout(global) {
  "use strict";

  let attrObserver = null;
  let resizeObserver = null;
  let scheduled = false;

  const ICON_BY_ID = Object.freeze({
    people: "pcPeopleIcon",
    objects: "pcObjectsIcon",
    brands: "pcBrandsIcon",
    map: "pcNatureMapIcon",
    flora: "pcFloraIcon",
    fauna: "pcFaunaIcon",
    historical_events: "pcCategoryCollectionIcon",
    productions: "pcCategoryCollectionIcon",
    structures: "pcCategoryCollectionIcon",
    competitions: "pcCategoryCollectionIcon",
    related: "pcCategoryCollectionIcon",
    destinations: "pcCategoryCollectionIcon"
  });
  const SUBCATEGORY_IDS = new Set(["reuse", "materials", "environment", "systems"]);
  const CATEGORY_IDS = new Set(["historical_events", "productions", "structures", "competitions", "related", "destinations"]);
  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];

  function ensureSubcategoryCollectionsScript() {
    if (global.HGPlaceSubcategoryCollections || document.querySelector('script[src="js/ui/place-subcategory-collections.js"]')) return;
    const script = document.createElement("script");
    script.src = "js/ui/place-subcategory-collections.js";
    script.defer = true;
    document.body.appendChild(script);
  }

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }

  function isMicroPlace(place) {
    return s(place?.placeTier).toLowerCase() === "micro";
  }

  function curatedIds(place) {
    if (!place || isMicroPlace(place)) return null;
    const profile = place.place_card_profile;
    if (s(profile?.schema) !== "history_go_place_card_profile_v2") return null;
    const ids = arr(profile?.collection_ids).map(s).filter(Boolean);
    if (ids.length < 1 || ids.length > 4 || new Set(ids).size !== ids.length) return null;
    if (ids.some(id => SUBCATEGORY_IDS.has(id))) return null;
    if (ids.some(id => !ICON_BY_ID[id])) return null;
    if (ids.filter(id => CATEGORY_IDS.has(id)).length > 1) return null;
    // Firefeltsprofiler har allerede en stabil 2 x 2-renderer. Behold den som
    // bakoverkompatibilitet for eksisterende v2-profiler; den adaptive
    // synlighetsgaten eier bare de nye komposisjonene med 1–3 samlinger.
    if (ids.length === 4) return null;
    return ids;
  }

  function hasRealPreview(icon) {
    return Boolean(icon?.querySelector(":scope > img.pc-person-img"));
  }

  function applyCuratedVisibility() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    const place = currentPlace();
    if (!card || !grid || !place) return null;

    const requested = curatedIds(place);
    if (!requested) return null; // Legacy/default/subcategory keeps its existing renderer.

    const wantedIcons = [];
    for (const id of requested) {
      const iconId = ICON_BY_ID[id];
      const icon = document.getElementById(iconId);
      if (!icon) continue;
      if (CATEGORY_IDS.has(id) && s(icon.dataset.collectionId) !== id) continue;
      wantedIcons.push({ id, iconId, icon });
    }

    const uniqueWanted = wantedIcons.filter((entry, index, all) => all.findIndex(other => other.iconId === entry.iconId) === index);
    const visible = uniqueWanted.filter(entry => hasRealPreview(entry.icon));
    const allowed = new Set(visible.map(entry => entry.iconId));

    grid.querySelectorAll(".pc-round").forEach(icon => {
      const managed = Object.values(ICON_BY_ID).includes(icon.id);
      if (!managed) return;
      const show = allowed.has(icon.id);
      icon.hidden = !show;
      icon.setAttribute("aria-hidden", show ? "false" : "true");
      if (!show) {
        icon.style.order = "";
        delete icon.dataset.collectionPosition;
      }
    });

    visible.forEach((entry, index) => {
      entry.icon.hidden = false;
      entry.icon.setAttribute("aria-hidden", "false");
      entry.icon.style.order = String(index);
      entry.icon.dataset.collectionPosition = String(index);
    });

    const count = visible.length;
    card.dataset.collectionCount = String(count);
    card.dataset.collectionRequestedCount = String(requested.length);
    card.dataset.collectionProfileSource = "place_card_profile_v2_curated";
    grid.dataset.collectionCount = String(count);
    grid.dataset.collectionRequestedCount = String(requested.length);
    grid.dataset.collectionProfileSource = "place_card_profile_v2_curated";
    grid.dataset.roundCount = String(count);
    return count;
  }

  function numericGap(grid) {
    const style = global.getComputedStyle?.(grid);
    const raw = parseFloat(style?.gap || style?.columnGap || "0");
    return Number.isFinite(raw) ? raw : 0;
  }

  function layout() {
    const grid = document.querySelector("#placeCard .pc-icons-quad");
    if (!grid) return;

    const curatedCount = applyCuratedVisibility();
    const count = curatedCount == null
      ? Number(grid.dataset.collectionCount || grid.dataset.roundCount || 0)
      : curatedCount;

    grid.style.removeProperty("--hg-collection-fill-height");
    grid.style.removeProperty("--hg-collection-circle-size");
    grid.style.removeProperty("--hg-collection-wide-width");

    if (count < 1 || count > 4) return;

    const gap = numericGap(grid);
    const rect = grid.getBoundingClientRect();
    const width = rect.width || grid.clientWidth || 0;
    const height = rect.height || grid.clientHeight || 0;
    if (width <= 0 || height <= 0) return;

    let cellWidth = width;
    let cellHeight = height;
    let fillHeight = Math.min(height * 0.68, width * 0.72);
    let circleSize = Math.min(width * 0.66, height * 0.66);
    let wideWidth = width * 0.82;

    if (count === 2) {
      cellWidth = (width - gap) / 2;
      fillHeight = Math.min(height * 0.64, cellWidth * 0.94);
      circleSize = Math.min(cellWidth, fillHeight);
      wideWidth = width;
    } else if (count === 3) {
      cellWidth = (width - gap) / 2;
      cellHeight = (height - gap) / 2;
      fillHeight = Math.max(1, Math.floor(Math.min(cellHeight, cellWidth * 0.92)));
      circleSize = Math.max(1, Math.floor(Math.min(cellWidth, fillHeight)));
      wideWidth = Math.min(width, Math.max(cellWidth, width * 0.68));
    } else if (count === 4) {
      cellWidth = (width - gap) / 2;
      cellHeight = (height - gap) / 2;
      fillHeight = Math.max(1, Math.floor(Math.min(cellHeight, cellWidth * 0.92)));
      circleSize = Math.max(1, Math.floor(Math.min(cellWidth, fillHeight)));
      wideWidth = width;
    }

    grid.style.setProperty("--hg-collection-fill-height", `${Math.max(1, Math.floor(fillHeight))}px`);
    grid.style.setProperty("--hg-collection-circle-size", `${Math.max(1, Math.floor(circleSize))}px`);
    grid.style.setProperty("--hg-collection-wide-width", `${Math.max(1, Math.floor(wideWidth))}px`);
  }

  function scheduleLayout() {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      layout();
    };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run);
    else global.setTimeout(run, 0);
  }

  function bind() {
    const grid = document.querySelector("#placeCard .pc-icons-quad");
    if (!grid) return false;

    if (!attrObserver && typeof global.MutationObserver === "function") {
      attrObserver = new global.MutationObserver(scheduleLayout);
      attrObserver.observe(grid, { attributes: true, attributeFilter: ["data-collection-count", "data-round-count", "data-collection-profile-source"] });
    }

    if (!resizeObserver && typeof global.ResizeObserver === "function") {
      resizeObserver = new global.ResizeObserver(scheduleLayout);
      resizeObserver.observe(grid);
    }

    scheduleLayout();
    return true;
  }

  function init() {
    ensureSubcategoryCollectionsScript();
    if (!bind()) {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (bind() || attempts >= 80) global.clearInterval(timer);
      }, 100);
    }
  }

  global.HGPlaceRoundsFillLayout = { layout, scheduleLayout, applyCuratedVisibility };
  global.addEventListener?.("resize", scheduleLayout, { passive: true });
  ["hg:appReady", "hg:place-selected", "hg:place-open-ready", "hg:places-ready", "hg:placesUpdated", "updateProfile"].forEach(name => global.addEventListener?.(name, scheduleLayout));

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
