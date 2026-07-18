// js/pos.js — History GO posisjon (én sannhet)
// Eksponerer: window.HGPos.request(), window.getPos(), window.setPos(), window.clearPos()
// Sender events: "hg:geo" { status: requesting|granted|blocked|unsupported }

(function () {
  "use strict";

  const TODAY_VISITED_KEY = "hg_today_visited_v1";
  const DISCOVERY_COOLDOWN_MS = 15000;
  const WATCH_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000
  };
  const LOCATION_OVERRIDE_KEY = "hg_location_override_v1";
  const CIVICATION_LOCATION_MANIFEST_PATH = "data/Civication/locations/manifest.json";
  let civicationLocationsCache = null;
  let civicationLocationsPromise = null;
  let activeLocationPickerClose = null;

  // ÉN state (ikke lag flere varianter)
  const HG_POS = (window.HG_POS = window.HG_POS || {
    status: "unknown", // unknown|requesting|granted|blocked|unsupported|test
    lat: null,
    lon: null,
    acc: null,
    ts: 0,
    reason: null,
    lastError: null,
    watchId: null
  });

  const discoveryCooldowns = new Map();

  function emit(detail) {
    try {
      window.dispatchEvent(new CustomEvent("hg:geo", { detail }));
    } catch {}
  }

  function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function loadTodayVisited() {
    try {
      const raw = JSON.parse(localStorage.getItem(TODAY_VISITED_KEY) || "{}");
      if (!raw || typeof raw !== "object") return { date: getTodayKey(), ids: [] };
      const date = String(raw.date || "").trim() || getTodayKey();
      const ids = Array.isArray(raw.ids) ? raw.ids.filter(Boolean).map(String) : [];
      return { date, ids };
    } catch {
      return { date: getTodayKey(), ids: [] };
    }
  }

  function saveTodayVisited(data) {
    try {
      localStorage.setItem(TODAY_VISITED_KEY, JSON.stringify(data));
    } catch {}
  }

  function ensureTodayVisitedStore() {
    const today = getTodayKey();
    const state = loadTodayVisited();
    if (state.date !== today) {
      const fresh = { date: today, ids: [] };
      saveTodayVisited(fresh);
      return fresh;
    }
    return state;
  }

  function markPlaceVisitedToday(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return false;

    const state = ensureTodayVisitedStore();
    if (state.ids.includes(id)) return false;

    state.ids.push(id);
    saveTodayVisited(state);

    try {
      window.dispatchEvent(new CustomEvent("hg:todayVisited", {
        detail: { placeId: id, date: state.date }
      }));
    } catch {}

    return true;
  }

  function isInDiscoveryCooldown(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return false;

    const lastTs = discoveryCooldowns.get(id);
    if (!Number.isFinite(lastTs)) return false;

    return (Date.now() - lastTs) < DISCOVERY_COOLDOWN_MS;
  }

  function markDiscoveryCooldown(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return;
    discoveryCooldowns.set(id, Date.now());
  }

  function shouldAutoOpenPlace(place) {
    if (!place?.id) return false;

    const card = document.getElementById("placeCard");
    const currentPlaceId = String(card?.dataset?.currentPlaceId || "").trim();
    const nextPlaceId = String(place.id || "").trim();
    const cardVisible = card?.getAttribute("aria-hidden") === "false";

    if (!cardVisible) return true;
    if (!currentPlaceId) return true;
    if (currentPlaceId === nextPlaceId) return false;

    return true;
  }

  function announceDiscovery(place, { isNewUnlock = false, isNewToday = false } = {}) {
    if (!place?.id || isInDiscoveryCooldown(place.id)) return;

    markDiscoveryCooldown(place.id);
    window.HG_LAST_DISCOVERED_PLACE_ID = String(place.id || "").trim();

    if (typeof window.showToast === "function") {
      const prefix = isNewUnlock ? "📍 Låst opp" : "📍 Besøkt";
      const suffix = isNewToday && !isNewUnlock ? " i dag" : "";
      window.showToast(`${prefix}: ${place.name}${suffix}`, 2600);
    }

    if (typeof window.renderNearbyPlaces === "function") {
      window.renderNearbyPlaces();
    }

    if (shouldAutoOpenPlace(place) && typeof window.openPlaceCard === "function") {
      setTimeout(() => {
        window.openPlaceCard(place);
      }, 450);
    }

    window.dispatchEvent(new CustomEvent("hg:placeDiscovered", {
      detail: {
        placeId: String(place.id || "").trim(),
        name: place.name || "",
        isNewUnlock: !!isNewUnlock,
        isNewToday: !!isNewToday
      }
    }));
  }

  function autoUnlockPlacesFromPosition(lat, lon) {
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    if (!places.length) return;
    if (typeof window.distMeters !== "function") return;
    if (typeof window.saveVisitedFromQuiz !== "function") return;

    const userPos = { lat, lon };

    for (const place of places) {
      if (!place || place.hidden || place.stub) continue;

      const getAnchors = (typeof window.getPlaceUnlockAnchors === "function")
        ? window.getPlaceUnlockAnchors
        : null;
      const anchors = getAnchors
        ? getAnchors(place)
        : [{ lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) }];

      const canUnlock = anchors.some((anchor) => {
        const aLat = Number(anchor?.lat);
        const aLon = Number(anchor?.lon);
        const aR = Number(anchor?.r);
        if (![aLat, aLon, aR].every(Number.isFinite)) return false;
        if (aR <= 0) return false;
        const d = window.distMeters(userPos, { lat: aLat, lon: aLon });
        return Number.isFinite(d) && d <= aR;
      });
      if (!canUnlock) continue;

      const wasVisited = !!window.visited?.[place.id];
      const isNewToday = markPlaceVisitedToday(place.id);

      if (!wasVisited) {
        window.saveVisitedFromQuiz(place.id);
        announceDiscovery(place, { isNewUnlock: true, isNewToday: true });
        continue;
      }

      if (isNewToday) {
        announceDiscovery(place, { isNewUnlock: false, isNewToday: true });
      }
    }
  }

  function getPos() {
    const override = getLocationOverride();
    if (override && Number.isFinite(override.lat) && Number.isFinite(override.lon)) {
      return {
        lat: override.lat,
        lon: override.lon,
        acc: override.acc ?? null,
        ts: override.ts ?? 0,
        source: override.source || "civication-location-picker",
        cityId: override.cityId || null,
        cityLabel: override.cityLabel || null,
        placeId: override.placeId || null,
        label: override.label || null,
        mode: "manual"
      };
    }

    if (Number.isFinite(HG_POS.lat) && Number.isFinite(HG_POS.lon)) {
      return { lat: HG_POS.lat, lon: HG_POS.lon, acc: HG_POS.acc, ts: HG_POS.ts };
    }
    return null;
  }

  function getLocationOverride() {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCATION_OVERRIDE_KEY) || "null");
      if (!raw || raw.mode !== "manual") return null;
      const lat = Number(raw.lat);
      const lon = Number(raw.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return {
        ...raw,
        lat,
        lon
      };
    } catch {
      return null;
    }
  }

  function normalizeLocationSearch(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeLocationHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /** @param {any} place */
  function getLocationPlaceName(place) {
    return String(place?.name || place?.title || place?.id || "").trim();
  }

  function hasValidLocationCoordinates(place) {
    const lat = Number(place?.lat);
    const lon = Number(place?.lon);
    return Number.isFinite(lat) && Number.isFinite(lon) &&
      lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  function getLocationCategoryLabel(categoryId) {
    const id = String(categoryId || "").trim();
    if (!id) return "History Go-sted";
    const categories = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
    const category = categories.find((entry) => String(entry?.id || "").trim() === id);
    return String(category?.name || id).trim();
  }

  /** @param {any} place */
  function getLocationPlaceMeta(place) {
    const category = getLocationCategoryLabel(place?.category);
    const context = String(
      place?.cityLabel ||
      place?.city ||
      place?.municipality ||
      place?.kommune ||
      place?.country ||
      ""
    ).trim();
    return [category, context].filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(" · ");
  }

  /**
   * Search the canonical History Go place registry. Manual location selection
   * must resolve to one of these records; arbitrary addresses/coordinates are
   * deliberately not accepted.
   *
   * @param {unknown} query
   * @param {{ limit?: number }} [options]
   */
  function searchLocationPlaces(query, { limit = 12 } = {}) {
    const q = normalizeLocationSearch(query);
    if (q.length < 2) return [];

    const rawPlaces = Array.isArray(window.PLACES) ? window.PLACES : [];
    const localizedPlaces = (typeof window.HG_I18N?.localizePlaces === "function")
      ? window.HG_I18N.localizePlaces(rawPlaces)
      : rawPlaces;
    const places = Array.isArray(localizedPlaces) ? localizedPlaces : rawPlaces;
    const tokens = q.split(/\s+/).filter(Boolean);
    const rows = [];
    const seenIds = new Set();

    for (const place of places) {
      if (!place || place.hidden || place.stub) continue;
      const id = String(place.id || "").trim();
      const name = getLocationPlaceName(place);
      if (!id || seenIds.has(id) || !name || !hasValidLocationCoordinates(place)) continue;

      const anyPlace = /** @type {any} */ (place);
      const normalizedName = normalizeLocationSearch(name);
      const normalizedId = normalizeLocationSearch(id.replace(/[_-]+/g, " "));
      const category = normalizeLocationSearch(getLocationCategoryLabel(place.category));
      const extra = [
        anyPlace.cityLabel,
        anyPlace.city,
        anyPlace.municipality,
        anyPlace.kommune,
        anyPlace.country,
        ...(Array.isArray(anyPlace.aliases) ? anyPlace.aliases : []),
        ...(Array.isArray(anyPlace.tags) ? anyPlace.tags : [])
      ];
      const haystack = normalizeLocationSearch([name, id, category, ...extra].filter(Boolean).join(" "));
      if (!tokens.every((token) => haystack.includes(token))) continue;
      seenIds.add(id);

      let score = 20;
      if (normalizedName === q) score = 120;
      else if (normalizedName.startsWith(q)) score = 100;
      else if (normalizedName.includes(q)) score = 80;
      else if (normalizedId === q) score = 70;
      else if (normalizedId.startsWith(q)) score = 60;
      else if (category.includes(q)) score = 40;

      rows.push({ place, score, name });
    }

    const safeLimit = Math.max(1, Math.min(30, Number(limit) || 12));
    return rows
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "nb"))
      .slice(0, safeLimit)
      .map((row) => row.place);
  }

  /** @param {any} selectedPlace */
  function setLocationFromPlace(selectedPlace) {
    const id = String(selectedPlace?.id || "").trim();
    if (!id) return false;

    const canonicalPlaces = Array.isArray(window.PLACES) ? window.PLACES : [];
    const canonicalPlace = canonicalPlaces.find((place) => (
      String(place?.id || "").trim() === id &&
      !place?.hidden &&
      !place?.stub &&
      hasValidLocationCoordinates(place)
    ));
    if (!canonicalPlace) return false;

    const anyPlace = /** @type {any} */ (canonicalPlace);
    const localizedPlaces = (typeof window.HG_I18N?.localizePlaces === "function")
      ? window.HG_I18N.localizePlaces(canonicalPlaces)
      : canonicalPlaces;
    const localizedPlace = Array.isArray(localizedPlaces)
      ? localizedPlaces.find((place) => String(place?.id || "").trim() === id)
      : null;
    const label = getLocationPlaceName(localizedPlace) || getLocationPlaceName(canonicalPlace);
    const cityLabel = String(
      anyPlace.cityLabel || anyPlace.city || anyPlace.municipality || anyPlace.kommune || ""
    ).trim();

    return setLocationOverride({
      cityId: String(anyPlace.cityId || anyPlace.city || anyPlace.municipality || anyPlace.kommune || "").trim(),
      cityLabel,
      placeId: id,
      label,
      lat: Number(canonicalPlace.lat),
      lon: Number(canonicalPlace.lon),
      source: "history-go-place-picker"
    });
  }

  function setLocationOverride(location) {
    const lat = Number(location?.lat);
    const lon = Number(location?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;

    const payload = {
      mode: "manual",
      cityId: String(location?.cityId || "").trim(),
      cityLabel: String(location?.cityLabel || "").trim() || String(location?.label || "").trim(),
      placeId: String(location?.placeId || "").trim() || null,
      label: String(location?.label || "").trim() || "Valgt lokasjon",
      lat,
      lon,
      acc: location?.acc ?? null,
      source: String(location?.source || "civication-location-picker").trim(),
      ts: Date.now()
    };

    try {
      localStorage.setItem(LOCATION_OVERRIDE_KEY, JSON.stringify(payload));
    } catch {
      return false;
    }

    emit({ status: "test", mode: "manual", ...payload });
    autoUnlockPlacesFromPosition(payload.lat, payload.lon);
    refreshGeoConsumers({ recenterMap: true });
    return true;
  }

  function clearLocationOverride() {
    try {
      localStorage.removeItem(LOCATION_OVERRIDE_KEY);
    } catch {}
    refreshGeoConsumers({ recenterMap: true });
  }

  function refreshGeoConsumers({ recenterMap = false } = {}) {
    if (window.HGMap?.setUser) {
      const p = getPos();
      if (p?.lat != null && p?.lon != null) {
        window.HGMap.setUser(p.lat, p.lon, { fly: recenterMap });
      }
    }
    if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();
    window.dispatchEvent(new Event("updateProfile"));
    window.dispatchEvent(new Event("hg:locationChanged"));
  }

  async function loadCivicationLocations() {
    if (Array.isArray(civicationLocationsCache)) return civicationLocationsCache;
    if (civicationLocationsPromise) return civicationLocationsPromise;

    civicationLocationsPromise = fetch(CIVICATION_LOCATION_MANIFEST_PATH, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const locations = Array.isArray(data?.locations) ? data.locations : [];
        civicationLocationsCache = locations
          .map((loc) => {
            const places = Array.isArray(loc?.places) ? loc.places : [];
            return {
            cityId: String(loc?.cityId || "").trim(),
            label: String(loc?.label || "").trim(),
            lat: Number(loc?.lat),
            lon: Number(loc?.lon),
            places: places
              .map((place) => ({
                id: String(place?.id || "").trim(),
                label: String(place?.label || "").trim(),
                lat: Number(place?.lat),
                lon: Number(place?.lon)
              }))
              .filter((place) => place.id && place.label && Number.isFinite(place.lat) && Number.isFinite(place.lon))
          };
          })
          .filter((loc) => loc.cityId && loc.label && Number.isFinite(loc.lat) && Number.isFinite(loc.lon));
        return civicationLocationsCache;
      })
      .catch(() => {
        civicationLocationsCache = [];
        return civicationLocationsCache;
      })
      .finally(() => {
        civicationLocationsPromise = null;
      });

    return civicationLocationsPromise;
  }

  async function openLocationPicker() {
    const locations = await loadCivicationLocations();
    const active = getLocationOverride();

    activeLocationPickerClose?.();
    document.getElementById("locationPickerModal")?.remove();

    const modal = document.createElement("div");
    modal.className = "modal hg-location-picker";
    modal.setAttribute("aria-hidden", "false");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "locationPickerTitle");
    modal.id = "locationPickerModal";

    const activeTitle = active?.label || active?.cityLabel || active?.cityId || "Faktisk posisjon";
    const activeMeta = active
      ? (active.placeId ? "History Go-sted" : "Manuelt valgt område")
      : "GPS brukes for kart og steder i nærheten";
    const cityOptionsHtml = locations.map((loc) => {
      const isActive = !active?.placeId && active?.cityId === loc.cityId;
      return `
        <button type="button"
                class="hg-location-quick-option${isActive ? " is-active" : ""}"
                data-location-city="${escapeLocationHTML(loc.cityId)}"
                aria-pressed="${isActive ? "true" : "false"}">
          <span class="hg-location-quick-icon" aria-hidden="true">⌖</span>
          <span class="hg-location-option-copy">
            <strong>${escapeLocationHTML(loc.label)}</strong>
            <small>Byområde</small>
          </span>
          <span class="hg-location-option-action">${isActive ? "Aktiv" : "Velg"}</span>
        </button>`;
    }).join("");

    modal.innerHTML = `
      <section class="modal-body hg-location-picker-card">
        <header class="hg-location-picker-head">
          <div>
            <span class="hg-location-eyebrow">Kartposisjon</span>
            <h2 id="locationPickerTitle">Velg lokasjon</h2>
            <p>Finn et offentlig History Go-sted, velg et byområde eller bruk GPS.</p>
          </div>
          <button type="button" class="sheet-close hg-location-close" data-location-close aria-label="Lukk lokasjonsvelger">×</button>
        </header>

        <div class="hg-location-active" data-location-active-mode="${active ? "manual" : "gps"}">
          <span class="hg-location-active-icon" aria-hidden="true">◎</span>
          <span class="hg-location-active-copy">
            <small>Aktiv lokasjon</small>
            <strong>${escapeLocationHTML(activeTitle)}</strong>
            <span>${escapeLocationHTML(activeMeta)}</span>
          </span>
          <span class="hg-location-active-dot" aria-hidden="true"></span>
        </div>

        <label class="hg-location-search" for="locationPlaceSearch">
          <span class="hg-location-section-label">Søk i History Go-steder</span>
          <span class="hg-location-search-field">
            <span class="hg-location-search-icon" aria-hidden="true">⌕</span>
            <input id="locationPlaceSearch"
                   type="search"
                   placeholder="Skriv navnet på et sted …"
                   autocomplete="off"
                   enterkeyhint="search"
                   aria-controls="locationPlaceResults"
                   aria-autocomplete="list">
          </span>
        </label>

        <div id="locationPlaceResults"
             class="hg-location-results"
             role="listbox"
             aria-label="Treff i History Go-steder"
             aria-live="polite"
             hidden></div>

        <section class="hg-location-quick" data-location-quick>
          <div class="hg-location-section-head">
            <span class="hg-location-section-label">Hurtigvalg</span>
            <span>Byområder</span>
          </div>
          <div class="hg-location-quick-grid">
            ${cityOptionsHtml || '<div class="hg-location-empty">Ingen byområder tilgjengelig.</div>'}
          </div>
        </section>

        <button type="button" class="hg-location-gps" data-location-use-gps>
          <span class="hg-location-gps-icon" aria-hidden="true">◉</span>
          <span class="hg-location-option-copy">
            <strong>Bruk faktisk posisjon</strong>
            <small>Oppdater kartet med GPS på denne enheten</small>
          </span>
          <span class="hg-location-option-arrow" aria-hidden="true">→</span>
        </button>
      </section>`;

    const onDocumentKeydown = (event) => {
      if (event.key === "Escape") close();
    };
    const close = () => {
      document.removeEventListener("keydown", onDocumentKeydown);
      modal.remove();
      if (activeLocationPickerClose === close) activeLocationPickerClose = null;
    };
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target === modal || (target instanceof Element && target.hasAttribute("data-location-close"))) close();
    });
    modal.querySelector("[data-location-use-gps]")?.addEventListener("click", () => {
      clearLocationOverride();
      close();
      request();
    });

    modal.querySelectorAll("[data-location-city]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cityId = btn.getAttribute("data-location-city");
        const city = locations.find((loc) => loc.cityId === cityId);
        if (!city) return;
        setLocationOverride({
          cityId: city.cityId,
          cityLabel: city.label,
          label: city.label,
          lat: city.lat,
          lon: city.lon,
          source: "civication-location-picker"
        });
        close();
      });
    });

    const searchInput = /** @type {HTMLInputElement|null} */ (modal.querySelector("#locationPlaceSearch"));
    const searchResults = modal.querySelector("#locationPlaceResults");
    const quickOptions = /** @type {HTMLElement|null} */ (modal.querySelector("[data-location-quick]"));
    let currentResults = [];

    const chooseSearchPlace = (placeId) => {
      const id = String(placeId || "").trim();
      const place = currentResults.find((entry) => String(entry?.id || "").trim() === id);
      if (!place || !setLocationFromPlace(place)) return;
      close();
    };

    const renderPlaceResults = () => {
      if (!searchInput || !searchResults) return;
      const query = searchInput.value.trim();
      const hasSearch = normalizeLocationSearch(query).length >= 2;
      quickOptions?.toggleAttribute("hidden", hasSearch);

      if (!hasSearch) {
        currentResults = [];
        searchResults.innerHTML = "";
        searchResults.setAttribute("hidden", "");
        return;
      }

      currentResults = searchLocationPlaces(query, { limit: 12 });
      searchResults.removeAttribute("hidden");

      if (!currentResults.length) {
        const hasPlaces = Array.isArray(window.PLACES) && window.PLACES.length > 0;
        searchResults.innerHTML = `
          <div class="hg-location-empty">
            <strong>${hasPlaces ? "Ingen History Go-steder funnet" : "Stedsregisteret lastes inn"}</strong>
            <span>${hasPlaces ? `Prøv et annet stedsnavn enn «${escapeLocationHTML(query)}».` : "Vent et øyeblikk og prøv igjen."}</span>
          </div>`;
        return;
      }

      searchResults.innerHTML = currentResults.map((place) => {
        const isActive = active?.placeId === place.id;
        return `
          <button type="button"
                  class="hg-location-result${isActive ? " is-active" : ""}"
                  role="option"
                  aria-selected="${isActive ? "true" : "false"}"
                  data-location-search-place="${escapeLocationHTML(place.id)}">
            <span class="hg-location-result-icon" aria-hidden="true">⌖</span>
            <span class="hg-location-option-copy">
              <strong>${escapeLocationHTML(getLocationPlaceName(place))}</strong>
              <small>${escapeLocationHTML(getLocationPlaceMeta(place))}</small>
            </span>
            <span class="hg-location-option-action">${isActive ? "Aktiv" : "Velg"}</span>
          </button>`;
      }).join("");
    };

    searchInput?.addEventListener("input", renderPlaceResults);
    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        const first = /** @type {HTMLElement|null} */ (searchResults?.querySelector("[data-location-search-place]"));
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Enter" && currentResults.length) {
        event.preventDefault();
        chooseSearchPlace(currentResults[0].id);
      }
    });
    searchResults?.addEventListener("click", (event) => {
      const target = event.target instanceof Element
        ? event.target.closest("[data-location-search-place]")
        : null;
      if (!target) return;
      chooseSearchPlace(target.getAttribute("data-location-search-place"));
    });
    searchResults?.addEventListener("keydown", (/** @type {KeyboardEvent} */ event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const buttons = Array.from(searchResults.querySelectorAll("[data-location-search-place]"));
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = /** @type {HTMLElement|undefined} */ (buttons[(index + direction + buttons.length) % buttons.length]);
      next?.focus();
    });

    document.body.appendChild(modal);
    activeLocationPickerClose = close;
    document.addEventListener("keydown", onDocumentKeydown);
  }

  function setPos(lat, lon, acc) {
    HG_POS.status = "granted";
    HG_POS.lat = Number(lat);
    HG_POS.lon = Number(lon);
    HG_POS.acc = acc ?? null;
    HG_POS.ts = Date.now();
    HG_POS.reason = null;
    HG_POS.lastError = null;

    // legacy kompat
    window.userLat = HG_POS.lat;
    window.userLon = HG_POS.lon;
    window.currentPos = { lat: HG_POS.lat, lon: HG_POS.lon };

    // event
    emit({ status: "granted", lat: HG_POS.lat, lon: HG_POS.lon, acc: HG_POS.acc, ts: HG_POS.ts });

    // kart
    if (window.HGMap?.setUser) window.HGMap.setUser(HG_POS.lat, HG_POS.lon);

    // progresjon
    autoUnlockPlacesFromPosition(HG_POS.lat, HG_POS.lon);

    // UI
    if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();
  }

  function clearPos(reason) {
    HG_POS.status = reason === "unsupported" ? "unsupported" : "blocked";
    HG_POS.lat = null;
    HG_POS.lon = null;
    HG_POS.acc = null;
    HG_POS.ts = Date.now();
    HG_POS.reason = reason ?? "blocked";

    window.userLat = null;
    window.userLon = null;
    window.currentPos = null;

    emit({ status: HG_POS.status, reason: HG_POS.reason, ts: HG_POS.ts });

    if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();
  }

  function stopWatch() {
    try {
      if (HG_POS.watchId != null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(HG_POS.watchId);
      }
    } catch {}
    HG_POS.watchId = null;
  }

  function startWatch(opts = {}) {
    if (!navigator.geolocation?.watchPosition) return null;

    stopWatch();

    HG_POS.watchId = navigator.geolocation.watchPosition(
      (g) => {
        setPos(g.coords.latitude, g.coords.longitude, g.coords.accuracy);
      },
      (err) => {
        HG_POS.lastError = { code: err?.code, message: err?.message };
      },
      { ...WATCH_OPTIONS, ...opts }
    );

    return HG_POS.watchId;
  }

  function request(opts = {}) {
    if (!navigator.geolocation) {
      clearPos("unsupported");
      return Promise.resolve(null);
    }

    HG_POS.status = "requesting";
    HG_POS.reason = null;
    HG_POS.lastError = null;
    emit({ status: "requesting" });

    const options = {
      ...WATCH_OPTIONS,
      ...opts
    };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (g) => {
          setPos(g.coords.latitude, g.coords.longitude, g.coords.accuracy);
          startWatch(options);
          resolve(getPos());
        },
        (err) => {
          HG_POS.lastError = { code: err?.code, message: err?.message };
          clearPos(err?.code || "blocked");
          resolve(null);
        },
        options
      );
    });
  }

  // API
  window.HGPos = {
    request,
    getPos,
    openLocationPicker,
    getLocationOverride,
    setLocationOverride,
    searchLocationPlaces,
    setLocationFromPlace,
    clearLocationOverride,
    setPos,
    clearPos,
    stopWatch,
    state: () => ({ ...HG_POS })
  };

  // små alias (så resten av appen din slipper å endres)
  window.getPos = getPos;
  window.setPos = setPos;
  window.clearPos = clearPos;

  function bindGeoStatusClick() {
    const trigger = document.getElementById("geoStatus");
    if (!trigger || trigger.dataset.hgGeoClickBound === "1") return;
    trigger.dataset.hgGeoClickBound = "1";
    trigger.style.cursor = "pointer";
    trigger.addEventListener("click", () => {
      openLocationPicker();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGeoStatusClick, { once: true });
  } else {
    bindGeoStatusClick();
  }
})();
