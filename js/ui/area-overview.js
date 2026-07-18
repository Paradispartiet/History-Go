// js/ui/area-overview.js
// Universal radius-based overview centered on the active History Go place.
(function (global) {
  "use strict";

  const RADII_KM = Object.freeze([2, 5, 20, 50, 100]);
  const MAX_RADIUS_KM = RADII_KM[RADII_KM.length - 1];
  const DEFAULT_TARGET_COUNT = 24;
  const CARD_PREVIEW_LIMIT = 24;
  const ROOT_ID = "hgAreaOverview";
  const STYLE_ID = "hgAreaOverviewStylesheet";
  const BUTTON_ID = "pcArea";

  const DISTANCE_BANDS = Object.freeze([
    { id: "0-2", min: 0, max: 2, title: "Rett rundt stedet", subtitle: "0–2 km" },
    { id: "2-5", min: 2, max: 5, title: "I nærheten", subtitle: "2–5 km" },
    { id: "5-20", min: 5, max: 20, title: "En liten tur unna", subtitle: "5–20 km" },
    { id: "20-50", min: 20, max: 50, title: "Utforsk regionen", subtitle: "20–50 km" },
    { id: "50-100", min: 50, max: 100, title: "Større område", subtitle: "50–100 km" }
  ]);

  const state = {
    open: false,
    centerPlaceId: "",
    centerPlace: null,
    radiusKm: 20,
    placesWithin100Km: [],
    categoryFilter: "",
    expandedBands: new Set()
  };

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

  function normalizeLon(place) {
    const value = Number(place?.lon ?? place?.lng);
    return Number.isFinite(value) ? value : NaN;
  }

  function getCoords(place) {
    const lat = Number(place?.lat);
    const lon = normalizeLon(place);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  }

  function isUsablePlace(place) {
    if (!place || typeof place !== "object") return false;
    if (!safeText(place.id) || place.hidden === true || place.stub === true) return false;
    return Boolean(getCoords(place));
  }

  function findPlace(placeId) {
    const id = safeText(placeId);
    if (!id) return null;
    return (Array.isArray(global.PLACES) ? global.PLACES : [])
      .find((place) => safeText(place?.id) === id) || null;
  }

  function fallbackDistanceMeters(a, b) {
    const ac = getCoords(a);
    const bc = getCoords(b);
    if (!ac || !bc) return Infinity;

    const R = 6371e3;
    const toRad = (degrees) => degrees * Math.PI / 180;
    const dLat = toRad(bc.lat - ac.lat);
    const dLon = toRad(bc.lon - ac.lon);
    const lat1 = toRad(ac.lat);
    const lat2 = toRad(bc.lat);
    const x = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function distanceKm(a, b) {
    const ac = getCoords(a);
    const bc = getCoords(b);
    if (!ac || !bc) return Infinity;
    const meters = typeof global.distMeters === "function"
      ? global.distMeters(ac, bc)
      : fallbackDistanceMeters(ac, bc);
    return Number.isFinite(meters) ? meters / 1000 : Infinity;
  }

  function buildDistanceIndex(centerPlace) {
    const centerId = safeText(centerPlace?.id);
    return (Array.isArray(global.PLACES) ? global.PLACES : [])
      .filter(isUsablePlace)
      .filter((place) => safeText(place.id) !== centerId)
      .map((place) => ({ place, distanceKm: distanceKm(centerPlace, place) }))
      .filter((entry) => Number.isFinite(entry.distanceKm) && entry.distanceKm <= MAX_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm || safeText(a.place?.name).localeCompare(safeText(b.place?.name), "nb"));
  }

  function chooseDefaultRadius(entries) {
    for (const radius of RADII_KM) {
      const count = entries.filter((entry) => entry.distanceKm <= radius).length;
      if (count >= DEFAULT_TARGET_COUNT) return radius;
    }
    if (!entries.length) return 20;
    const farthestDistance = entries[entries.length - 1].distanceKm;
    return RADII_KM.find((radius) => farthestDistance <= radius) || MAX_RADIUS_KM;
  }

  function categoryLabel(categoryId) {
    const id = safeText(categoryId);
    const match = (Array.isArray(global.CATEGORY_LIST) ? global.CATEGORY_LIST : [])
      .find((category) => safeText(category?.id) === id);
    if (match?.name) return safeText(match.name);
    return id
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "Annet";
  }

  function getImage(place) {
    return safeText(place?.frontImage || place?.cardImage || place?.image || "");
  }

  function formatDistance(km) {
    if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
    if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
    return `${Math.round(km)} km`;
  }

  function getPeopleCount(entries) {
    const ids = new Set();
    const placeIds = [state.centerPlaceId, ...entries.map((entry) => safeText(entry.place?.id))].filter(Boolean);
    for (const placeId of placeIds) {
      const relations = Array.isArray(global.REL_BY_PLACE?.[placeId]) ? global.REL_BY_PLACE[placeId] : [];
      for (const relation of relations) {
        const personId = safeText(relation?.person || relation?.person_id || relation?.personId);
        if (personId) ids.add(personId);
      }
    }
    return ids.size;
  }

  function getVisibleEntries() {
    return state.placesWithin100Km
      .filter((entry) => entry.distanceKm <= state.radiusKm)
      .filter((entry) => !state.categoryFilter || safeText(entry.place?.category) === state.categoryFilter);
  }

  function getAllRadiusEntries() {
    return state.placesWithin100Km.filter((entry) => entry.distanceKm <= state.radiusKm);
  }

  function renderRadiusButtons() {
    return RADII_KM.map((radius) => `
      <button class="hg-area-radius${radius === state.radiusKm ? " is-active" : ""}"
              type="button"
              data-area-radius="${radius}"
              aria-pressed="${radius === state.radiusKm ? "true" : "false"}">
        ${radius} km
      </button>
    `).join("");
  }

  function renderCategoryButtons(entries) {
    const counts = new Map();
    for (const entry of entries) {
      const category = safeText(entry.place?.category) || "annet";
      counts.set(category, (counts.get(category) || 0) + 1);
    }

    const categories = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || categoryLabel(a[0]).localeCompare(categoryLabel(b[0]), "nb"));

    if (!categories.length) return "";

    return `
      <section class="hg-area-section" aria-labelledby="hgAreaCategoriesTitle">
        <div class="hg-area-section-heading">
          <div>
            <p class="hg-area-eyebrow">Oversikt</p>
            <h2 id="hgAreaCategoriesTitle">Hva finnes her?</h2>
          </div>
          ${state.categoryFilter ? `<button class="hg-area-clear-filter" type="button" data-area-clear-category>Vis alle</button>` : ""}
        </div>
        <div class="hg-area-categories">
          ${categories.map(([category, count]) => `
            <button class="hg-area-category${state.categoryFilter === category ? " is-active" : ""}"
                    type="button"
                    data-area-category="${escapeHtml(category)}"
                    aria-pressed="${state.categoryFilter === category ? "true" : "false"}">
              <span>${escapeHtml(categoryLabel(category))}</span>
              <strong>${count}</strong>
            </button>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderPlaceCard(entry) {
    const place = entry.place || {};
    const image = getImage(place);
    const title = safeText(place.name || place.title || place.id) || "Ukjent sted";
    const category = categoryLabel(place.category);
    const description = safeText(place.desc || place.popupDesc || "");

    return `
      <button class="hg-area-place-card" type="button" data-area-place-id="${escapeHtml(place.id)}">
        <span class="hg-area-place-media${image ? " has-image" : ""}">
          ${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : `<span class="hg-area-place-placeholder" aria-hidden="true">◎</span>`}
        </span>
        <span class="hg-area-place-copy">
          <span class="hg-area-place-meta">${escapeHtml(category)} · ${escapeHtml(formatDistance(entry.distanceKm))}</span>
          <strong>${escapeHtml(title)}</strong>
          ${description ? `<span class="hg-area-place-desc">${escapeHtml(description)}</span>` : ""}
        </span>
        <span class="hg-area-place-arrow" aria-hidden="true">→</span>
      </button>
    `;
  }

  function isInBand(distance, band) {
    if (band.min === 0) return distance >= 0 && distance <= band.max;
    return distance > band.min && distance <= band.max;
  }

  function renderDistanceBands(entries) {
    const visibleBands = DISTANCE_BANDS.filter((band) => band.min < state.radiusKm && entries.some((entry) => isInBand(entry.distanceKm, band)));
    if (!visibleBands.length) {
      return `
        <section class="hg-area-empty">
          <strong>Ingen andre History Go-steder i denne radiusen ennå.</strong>
          <span>Prøv en større radius.</span>
        </section>
      `;
    }

    return visibleBands.map((band) => {
      const bandEntries = entries.filter((entry) => isInBand(entry.distanceKm, band));
      const expanded = state.expandedBands.has(band.id);
      const shownEntries = expanded ? bandEntries : bandEntries.slice(0, CARD_PREVIEW_LIMIT);
      return `
        <section class="hg-area-section hg-area-distance-band" aria-labelledby="hgAreaBand-${band.id}">
          <div class="hg-area-section-heading">
            <div>
              <p class="hg-area-eyebrow">${escapeHtml(band.subtitle)}</p>
              <h2 id="hgAreaBand-${band.id}">${escapeHtml(band.title)}</h2>
            </div>
            <span class="hg-area-band-count">${bandEntries.length} steder</span>
          </div>
          <div class="hg-area-place-list">
            ${shownEntries.map(renderPlaceCard).join("")}
          </div>
          ${bandEntries.length > CARD_PREVIEW_LIMIT ? `
            <button class="hg-area-show-more" type="button" data-area-expand-band="${escapeHtml(band.id)}">
              ${expanded ? "Vis færre" : `Vis alle ${bandEntries.length}`}
            </button>
          ` : ""}
        </section>
      `;
    }).join("");
  }

  function ensureStylesheet() {
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = "css/area-overview.css";
    document.head.appendChild(link);
  }

  function ensureButton() {
    if (document.getElementById(BUTTON_ID)) return document.getElementById(BUTTON_ID);
    const actions = document.querySelector(".app-footer .app-actions");
    if (!actions) return null;

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.className = "pc-action pc-action-icon";
    button.type = "button";
    button.setAttribute("aria-label", "Område");
    button.title = "Område";

    const routeButton = document.getElementById("pcRoute");
    actions.insertBefore(button, routeButton || null);
    return button;
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "hg-area-overview";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("aria-label", "Områdeoversikt");
    root.innerHTML = `
      <div class="hg-area-shell">
        <header class="hg-area-header">
          <button class="hg-area-back" type="button" data-area-close aria-label="Tilbake til kartet">←</button>
          <div class="hg-area-header-copy">
            <span>History Go</span>
            <strong>Område</strong>
          </div>
        </header>
        <main class="hg-area-content" id="hgAreaContent"></main>
      </div>
    `;
    document.body.appendChild(root);
    bindRootEvents(root);
    return root;
  }

  function render() {
    const root = ensureRoot();
    const content = root.querySelector("#hgAreaContent");
    const center = state.centerPlace;
    if (!content || !center) return;

    const allEntries = getAllRadiusEntries();
    const visibleEntries = getVisibleEntries();
    const categoryCount = new Set(allEntries.map((entry) => safeText(entry.place?.category)).filter(Boolean)).size;
    const peopleCount = getPeopleCount(allEntries);
    const centerImage = getImage(center);
    const centerTitle = safeText(center.name || center.title || center.id);

    content.innerHTML = `
      <section class="hg-area-hero${centerImage ? " has-image" : ""}">
        ${centerImage ? `<img class="hg-area-hero-image" src="${escapeHtml(centerImage)}" alt="">` : ""}
        <div class="hg-area-hero-shade"></div>
        <div class="hg-area-hero-copy">
          <p class="hg-area-eyebrow">Området rundt</p>
          <h1>${escapeHtml(centerTitle)}</h1>
          <p>${allEntries.length} steder å utforske innen ${state.radiusKm} km</p>
        </div>
      </section>

      <nav class="hg-area-radius-nav" aria-label="Velg radius">
        ${renderRadiusButtons()}
      </nav>

      <section class="hg-area-stats" aria-label="Områdestatistikk">
        <div><strong>${allEntries.length}</strong><span>steder</span></div>
        <div><strong>${categoryCount}</strong><span>kategorier</span></div>
        ${peopleCount ? `<div><strong>${peopleCount}</strong><span>personer</span></div>` : ""}
      </section>

      ${renderCategoryButtons(allEntries)}

      ${state.categoryFilter ? `
        <section class="hg-area-filter-summary">
          Viser ${visibleEntries.length} steder i <strong>${escapeHtml(categoryLabel(state.categoryFilter))}</strong>
        </section>
      ` : ""}

      ${renderDistanceBands(visibleEntries)}
    `;

    root.scrollTop = 0;
  }

  function setRadius(radiusKm) {
    const radius = Number(radiusKm);
    if (!RADII_KM.includes(radius)) return false;
    state.radiusKm = radius;
    state.categoryFilter = "";
    state.expandedBands.clear();
    render();
    return true;
  }

  function close() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    document.body?.classList.remove("hg-area-open");
    state.open = false;
  }

  function open(options = {}) {
    const currentCardId = safeText(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    const centerPlaceId = safeText(options.centerPlaceId || currentCardId);
    const centerPlace = findPlace(centerPlaceId);
    if (!centerPlace || !getCoords(centerPlace)) {
      global.showToast?.("Velg et History Go-sted først");
      return false;
    }

    state.centerPlaceId = centerPlaceId;
    state.centerPlace = centerPlace;
    state.placesWithin100Km = buildDistanceIndex(centerPlace);
    const requestedRadius = Number(options.radiusKm);
    state.radiusKm = RADII_KM.includes(requestedRadius)
      ? requestedRadius
      : chooseDefaultRadius(state.placesWithin100Km);
    state.categoryFilter = "";
    state.expandedBands.clear();
    state.open = true;

    global.__closePcRouteMenu?.();
    const root = ensureRoot();
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.body?.classList.add("hg-area-open");
    render();
    root.querySelector("[data-area-close]")?.focus?.();
    return true;
  }

  function openPlaceFromArea(placeId) {
    const id = safeText(placeId);
    if (!id) return;
    const place = findPlace(id);
    close();

    if (typeof global.HGMapView?.openPlace === "function" && global.HGMapView.openPlace(id)) return;
    if (place && typeof global.flyToPlace === "function" && global.flyToPlace(place)) return;
    if (place && typeof global.openPlaceCard === "function") void global.openPlaceCard(place);
  }

  function bindRootEvents(root) {
    root.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest("[data-area-close]")) {
        close();
        return;
      }

      const radiusButton = target.closest("[data-area-radius]");
      if (radiusButton) {
        setRadius(radiusButton.getAttribute("data-area-radius"));
        return;
      }

      const categoryButton = target.closest("[data-area-category]");
      if (categoryButton) {
        const category = safeText(categoryButton.getAttribute("data-area-category"));
        state.categoryFilter = state.categoryFilter === category ? "" : category;
        state.expandedBands.clear();
        render();
        return;
      }

      if (target.closest("[data-area-clear-category]")) {
        state.categoryFilter = "";
        state.expandedBands.clear();
        render();
        return;
      }

      const expandButton = target.closest("[data-area-expand-band]");
      if (expandButton) {
        const bandId = safeText(expandButton.getAttribute("data-area-expand-band"));
        if (state.expandedBands.has(bandId)) state.expandedBands.delete(bandId);
        else state.expandedBands.add(bandId);
        render();
        return;
      }

      const placeButton = target.closest("[data-area-place-id]");
      if (placeButton) {
        openPlaceFromArea(placeButton.getAttribute("data-area-place-id"));
      }
    });
  }

  function bindButton() {
    const button = ensureButton();
    if (!button || button.dataset.areaOverviewBound === "1") return Boolean(button);
    button.dataset.areaOverviewBound = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      open();
    });
    return true;
  }

  function init() {
    ensureStylesheet();
    ensureRoot();
    if (bindButton()) return;

    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (bindButton() || attempts > 200) global.clearInterval(timer);
    }, 50);
  }

  global.HGAreaOverview = {
    RADII_KM,
    open,
    close,
    setRadius,
    buildDistanceIndex,
    distanceKm,
    getState() {
      return {
        open: state.open,
        centerPlaceId: state.centerPlaceId,
        radiusKm: state.radiusKm,
        categoryFilter: state.categoryFilter,
        resultCount: getVisibleEntries().length
      };
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.open) close();
  });

  init();
})(window);
