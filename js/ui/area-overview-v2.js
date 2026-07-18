// js/ui/area-overview-v2.js
// V2 enrichment for the universal Area surface: geographic overview, progress and highlights.
(function (global) {
  "use strict";

  const ROOT_ID = "hgAreaOverview";
  const CONTENT_ID = "hgAreaContent";
  const STYLE_ID = "hgAreaOverviewV2Stylesheet";
  const MAX_PLOT_POINTS = 360;
  const HIGHLIGHT_LIMIT = 6;
  const cache = { centerPlaceId: "", entries: [] };
  let observer = null;
  let scheduled = false;

  function safeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPlaces() {
    return Array.isArray(global.PLACES) ? global.PLACES : [];
  }

  function findPlace(placeId) {
    const id = safeText(placeId);
    if (!id) return null;
    return getPlaces().find((place) => safeText(place?.id) === id) || null;
  }

  function getCategoryLabel(categoryId) {
    const id = safeText(categoryId);
    const match = (Array.isArray(global.CATEGORY_LIST) ? global.CATEGORY_LIST : [])
      .find((category) => safeText(category?.id) === id);
    if (match?.name) return safeText(match.name);
    return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) || "Annet";
  }

  function getCategoryColor(categoryId) {
    try {
      if (typeof global.catColor === "function") {
        const color = global.catColor(categoryId);
        if (color) return String(color);
      }
    } catch {}
    return "#ffffff";
  }

  function getImage(place) {
    return safeText(place?.frontImage || place?.cardImage || place?.image || "");
  }

  function getDescription(place) {
    return safeText(place?.desc || place?.popupDesc || place?.shortDesc || "");
  }

  function getDistanceEntries(centerPlace) {
    const centerId = safeText(centerPlace?.id);
    if (cache.centerPlaceId === centerId) return cache.entries;
    cache.centerPlaceId = centerId;
    cache.entries = typeof global.HGAreaOverview?.buildDistanceIndex === "function"
      ? global.HGAreaOverview.buildDistanceIndex(centerPlace)
      : [];
    return cache.entries;
  }

  function getAreaModel() {
    const areaState = global.HGAreaOverview?.getState?.() || {};
    const centerPlaceId = safeText(areaState.centerPlaceId);
    const centerPlace = findPlace(centerPlaceId);
    const radiusKm = Number(areaState.radiusKm) || 20;
    const categoryFilter = safeText(areaState.categoryFilter);
    const allEntries = centerPlace
      ? getDistanceEntries(centerPlace).filter((entry) => Number(entry?.distanceKm) <= radiusKm)
      : [];
    const visibleEntries = categoryFilter
      ? allEntries.filter((entry) => safeText(entry?.place?.category) === categoryFilter)
      : allEntries;
    return { areaState, centerPlaceId, centerPlace, radiusKm, categoryFilter, allEntries, visibleEntries };
  }

  function countStructuredFields(place) {
    const arrayFields = [
      place?.people,
      place?.badges,
      place?.relations,
      place?.nature,
      place?.works,
      place?.emne_ids,
      place?.rounds,
      place?.rundinger
    ];
    return arrayFields.reduce((count, value) => count + (Array.isArray(value) && value.length ? 1 : 0), 0);
  }

  function getRelationCount(placeId) {
    const relations = global.REL_BY_PLACE?.[safeText(placeId)];
    return Array.isArray(relations) ? relations.length : 0;
  }

  function highlightScore(entry) {
    const place = entry?.place || {};
    let score = 0;
    if (getImage(place)) score += 6;
    if (getDescription(place)) score += 3;
    score += Math.min(4, getRelationCount(place.id));
    score += Math.min(4, countStructuredFields(place));
    if (Number(entry?.distanceKm) <= 5) score += 1;
    return score;
  }

  function rankHighlights(entries, limit = HIGHLIGHT_LIMIT) {
    const ranked = (Array.isArray(entries) ? entries : [])
      .slice()
      .sort((a, b) => highlightScore(b) - highlightScore(a)
        || Number(a?.distanceKm) - Number(b?.distanceKm)
        || safeText(a?.place?.name).localeCompare(safeText(b?.place?.name), "nb"));

    const chosen = [];
    const chosenIds = new Set();
    const usedCategories = new Set();

    for (const entry of ranked) {
      if (chosen.length >= limit) break;
      const id = safeText(entry?.place?.id);
      const category = safeText(entry?.place?.category);
      if (!id || chosenIds.has(id) || (category && usedCategories.has(category))) continue;
      chosen.push(entry);
      chosenIds.add(id);
      if (category) usedCategories.add(category);
    }

    for (const entry of ranked) {
      if (chosen.length >= limit) break;
      const id = safeText(entry?.place?.id);
      if (!id || chosenIds.has(id)) continue;
      chosen.push(entry);
      chosenIds.add(id);
    }

    return chosen;
  }

  function getProgress(entries) {
    const reader = global.HGProfileProgressReader;
    const visitedIds = reader?.getVisitedPlaceIds?.() || new Set();
    const quizIds = reader?.getCompletedQuizUnitIds?.() || new Set();
    const favoriteIds = reader?.getFavoritePlaceIds?.() || new Set();
    const ids = (Array.isArray(entries) ? entries : []).map((entry) => safeText(entry?.place?.id)).filter(Boolean);
    const visited = ids.filter((id) => visitedIds.has(id)).length;
    const quizCompleted = ids.filter((id) => quizIds.has(id)).length;
    const favorites = ids.filter((id) => favoriteIds.has(id)).length;
    const total = ids.length;
    return {
      total,
      visited,
      quizCompleted,
      favorites,
      percent: total ? Math.round((visited / total) * 100) : 0
    };
  }

  function sampleEntries(entries, maxPoints = MAX_PLOT_POINTS) {
    const list = Array.isArray(entries) ? entries : [];
    if (list.length <= maxPoints) return list;
    const stride = list.length / maxPoints;
    const sampled = [];
    for (let i = 0; i < maxPoints; i += 1) sampled.push(list[Math.floor(i * stride)]);
    return sampled;
  }

  function projectEntry(centerPlace, entry, radiusKm) {
    const centerLat = Number(centerPlace?.lat);
    const centerLon = Number(centerPlace?.lon ?? centerPlace?.lng);
    const lat = Number(entry?.place?.lat);
    const lon = Number(entry?.place?.lon ?? entry?.place?.lng);
    if (![centerLat, centerLon, lat, lon, radiusKm].every(Number.isFinite) || radiusKm <= 0) return null;

    const latScaleKm = 110.574;
    const lonScaleKm = 111.32 * Math.cos(centerLat * Math.PI / 180);
    const dxKm = (lon - centerLon) * lonScaleKm;
    const dyKm = (lat - centerLat) * latScaleKm;
    const scale = 88 / radiusKm;
    return {
      x: Math.max(-88, Math.min(88, dxKm * scale)),
      y: Math.max(-88, Math.min(88, -dyKm * scale))
    };
  }

  function renderGeoPlot(model) {
    if (!model.centerPlace || !model.visibleEntries.length) return "";
    const plotted = sampleEntries(model.visibleEntries)
      .map((entry) => ({ entry, point: projectEntry(model.centerPlace, entry, model.radiusKm) }))
      .filter((item) => item.point);

    const innerRing = model.radiusKm >= 20 ? 5 : Math.max(1, model.radiusKm / 2);
    const innerRadius = Math.min(82, Math.max(10, (innerRing / model.radiusKm) * 88));

    return `
      <section class="hg-area-v2-map" data-area-v2-root="map" aria-labelledby="hgAreaV2MapTitle">
        <div class="hg-area-v2-heading">
          <div>
            <p class="hg-area-eyebrow">Geografisk oversikt</p>
            <h2 id="hgAreaV2MapTitle">Slik ligger stedene</h2>
          </div>
          <button type="button" class="hg-area-v2-open-map" data-area-v2-open-map>Åpne på kart</button>
        </div>
        <div class="hg-area-v2-map-frame">
          <svg class="hg-area-v2-plot" viewBox="-100 -100 200 200" role="img" aria-label="Steder innen ${escapeHtml(model.radiusKm)} kilometer fra ${escapeHtml(model.centerPlace?.name || model.centerPlaceId)}">
            <circle class="hg-area-v2-radius-fill" cx="0" cy="0" r="88"></circle>
            <circle class="hg-area-v2-radius-line" cx="0" cy="0" r="88"></circle>
            <circle class="hg-area-v2-inner-ring" cx="0" cy="0" r="${innerRadius}"></circle>
            <line class="hg-area-v2-axis" x1="-92" y1="0" x2="92" y2="0"></line>
            <line class="hg-area-v2-axis" x1="0" y1="-92" x2="0" y2="92"></line>
            <text class="hg-area-v2-compass" x="0" y="-93" text-anchor="middle">N</text>
            <text class="hg-area-v2-compass" x="94" y="3" text-anchor="middle">Ø</text>
            <text class="hg-area-v2-compass" x="0" y="98" text-anchor="middle">S</text>
            <text class="hg-area-v2-compass" x="-94" y="3" text-anchor="middle">V</text>
            ${plotted.map(({ entry, point }) => `
              <circle class="hg-area-v2-point"
                      cx="${point.x.toFixed(2)}"
                      cy="${point.y.toFixed(2)}"
                      r="2.35"
                      fill="${escapeHtml(getCategoryColor(entry?.place?.category))}"
                      data-area-v2-point-id="${escapeHtml(entry?.place?.id)}">
                <title>${escapeHtml(entry?.place?.name || entry?.place?.id)} · ${Number(entry?.distanceKm).toFixed(1)} km</title>
              </circle>
            `).join("")}
            <circle class="hg-area-v2-center-halo" cx="0" cy="0" r="6"></circle>
            <circle class="hg-area-v2-center" cx="0" cy="0" r="3.2"></circle>
          </svg>
          <div class="hg-area-v2-map-legend">
            <span><i class="is-center"></i>${escapeHtml(model.centerPlace?.name || "Sentrum")}</span>
            <span><i></i>${model.visibleEntries.length} steder</span>
            <span>${escapeHtml(innerRing)} km ring</span>
          </div>
        </div>
      </section>
    `;
  }

  function renderProgress(model) {
    const progress = getProgress(model.allEntries);
    if (!progress.total) return "";
    const nextEntry = model.allEntries.find((entry) => {
      const id = safeText(entry?.place?.id);
      return id && !(global.HGProfileProgressReader?.getVisitedPlaceIds?.() || new Set()).has(id);
    });

    return `
      <section class="hg-area-v2-progress" data-area-v2-root="progress" aria-labelledby="hgAreaV2ProgressTitle">
        <div class="hg-area-v2-heading">
          <div>
            <p class="hg-area-eyebrow">Din utforskning</p>
            <h2 id="hgAreaV2ProgressTitle">${progress.visited} av ${progress.total} steder oppdaget</h2>
          </div>
          <strong class="hg-area-v2-percent">${progress.percent}%</strong>
        </div>
        <div class="hg-area-v2-progress-track" aria-label="${progress.percent} prosent utforsket">
          <span style="width:${Math.max(0, Math.min(100, progress.percent))}%"></span>
        </div>
        <div class="hg-area-v2-progress-meta">
          <span>${progress.quizCompleted} quiz fullført</span>
          <span>${progress.favorites} favoritter</span>
          ${nextEntry ? `<button type="button" data-area-place-id="${escapeHtml(nextEntry.place.id)}">Neste nærmeste: ${escapeHtml(nextEntry.place.name || nextEntry.place.id)}</button>` : ""}
        </div>
      </section>
    `;
  }

  function renderHighlights(model) {
    const highlights = rankHighlights(model.visibleEntries);
    if (!highlights.length) return "";
    return `
      <section class="hg-area-v2-highlights" data-area-v2-root="highlights" aria-labelledby="hgAreaV2HighlightsTitle">
        <div class="hg-area-v2-heading">
          <div>
            <p class="hg-area-eyebrow">Utvalgt fra området</p>
            <h2 id="hgAreaV2HighlightsTitle">Høydepunkter</h2>
          </div>
        </div>
        <div class="hg-area-v2-highlight-strip">
          ${highlights.map((entry) => {
            const place = entry.place || {};
            const image = getImage(place);
            return `
              <button type="button" class="hg-area-v2-highlight" data-area-place-id="${escapeHtml(place.id)}">
                <span class="hg-area-v2-highlight-media">
                  ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : `<span aria-hidden="true">◎</span>`}
                </span>
                <span class="hg-area-v2-highlight-copy">
                  <small>${escapeHtml(getCategoryLabel(place.category))} · ${Number(entry.distanceKm).toFixed(1).replace(".", ",")} km</small>
                  <strong>${escapeHtml(place.name || place.title || place.id)}</strong>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function openAreaOnMainMap(model) {
    const map = global.HGMap?.getMap?.() || global.MAP;
    if (!map || !model.centerPlace) return false;

    const points = [model.centerPlace, ...model.allEntries.map((entry) => entry.place)]
      .map((place) => [Number(place?.lon ?? place?.lng), Number(place?.lat)])
      .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));

    global.HGAreaOverview?.close?.();
    global.setNearbyCollapsed?.(true);
    global.collapsePlaceCard?.();

    if (points.length <= 1 || !global.maplibregl?.LngLatBounds) {
      const [lon, lat] = points[0] || [];
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        map.flyTo?.({ center: [lon, lat], zoom: Math.min(map.getZoom?.() || 12, 13), essential: true });
        return true;
      }
      return false;
    }

    const bounds = new global.maplibregl.LngLatBounds();
    points.forEach((point) => bounds.extend(point));
    map.resize?.();
    map.fitBounds?.(bounds, {
      padding: { top: 110, right: 55, bottom: 120, left: 55 },
      maxZoom: 15,
      duration: 900,
      essential: true
    });
    return true;
  }

  function ensureStylesheet() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = "css/area-overview-v2.css";
    document.head.appendChild(link);
  }

  function decorate() {
    scheduled = false;
    const root = document.getElementById(ROOT_ID);
    const content = document.getElementById(CONTENT_ID);
    if (!root || !content || root.hidden || !global.HGAreaOverview) return;
    if (content.querySelector("[data-area-v2-root]")) return;

    const model = getAreaModel();
    if (!model.centerPlace) return;

    const stats = content.querySelector(".hg-area-stats");
    if (!stats) return;

    const block = document.createElement("div");
    block.className = "hg-area-v2-block";
    block.setAttribute("data-area-v2-root", "bundle");
    block.innerHTML = `${renderGeoPlot(model)}${renderProgress(model)}${renderHighlights(model)}`;
    stats.insertAdjacentElement("afterend", block);
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(decorate);
    else global.setTimeout?.(decorate, 0);
  }

  function bindObserver() {
    const content = document.getElementById(CONTENT_ID);
    if (!content || observer) return Boolean(content);
    observer = new MutationObserver(scheduleDecorate);
    observer.observe(content, { childList: true });
    scheduleDecorate();
    return true;
  }

  function bindActions() {
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const point = target.closest("[data-area-v2-point-id]");
      if (point) {
        const placeId = safeText(point.getAttribute("data-area-v2-point-id"));
        if (!placeId) return;
        global.HGAreaOverview?.close?.();
        if (global.HGMapView?.openPlace?.(placeId)) return;
        const place = findPlace(placeId);
        if (place && typeof global.flyToPlace === "function") global.flyToPlace(place);
        return;
      }

      if (target.closest("[data-area-v2-open-map]")) {
        openAreaOnMainMap(getAreaModel());
      }
    });
  }

  function init() {
    ensureStylesheet();
    bindActions();
    if (bindObserver()) return;
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (bindObserver() || attempts > 200) global.clearInterval(timer);
    }, 50);
  }

  global.HGAreaOverviewV2 = {
    getAreaModel,
    getProgress,
    rankHighlights,
    projectEntry,
    openAreaOnMainMap
  };

  init();
})(window);
