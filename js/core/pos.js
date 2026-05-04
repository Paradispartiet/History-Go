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
      source: "civication-location-picker",
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

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("aria-hidden", "false");
    modal.id = "locationPickerModal";

    const optionsHtml = locations.map((loc) => {
      const isActive = active?.cityId === loc.cityId;
      return `<button type="button" class="primary" data-location-city="${loc.cityId}" style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;"><span>${loc.label}</span><span style="opacity:.8">${isActive ? "Aktiv" : ""}</span></button>`;
    }).join("");

    const activeLabel = active
      ? `${active.cityLabel || active.cityId || "Valgt by"} – ${active.label || "Valgt lokasjon"}`
      : "Faktisk posisjon (GPS)";
    modal.innerHTML = `
      <div class="modal-body" style="max-width:420px;width:calc(100% - 24px);">
        <div class="modal-head">
          <h3 style="margin:0;">Velg lokasjon</h3>
          <button type="button" class="sheet-close" data-location-close>×</button>
        </div>
        <p class="muted" style="margin:0 0 10px 0;">Aktiv lokasjon: ${activeLabel}</p>
        <div id="locationPickerBody" style="display:grid;gap:8px;">
          ${optionsHtml || '<div class="muted">Ingen byer tilgjengelig.</div>'}
          <button type="button" class="iconbtn" data-location-use-gps style="justify-content:flex-start;">Bruk faktisk posisjon</button>
        </div>
      </div>`;

    const close = () => modal.remove();
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target?.hasAttribute?.("data-location-close")) close();
    });
    modal.querySelector("[data-location-use-gps]")?.addEventListener("click", () => {
      clearLocationOverride();
      close();
      request();
    });
    const body = modal.querySelector("#locationPickerBody");
    const renderCityOptions = () => {
      if (!body) return;
      body.innerHTML = `
        ${optionsHtml || '<div class="muted">Ingen byer tilgjengelig.</div>'}
        <button type="button" class="iconbtn" data-location-use-gps style="justify-content:flex-start;">Bruk faktisk posisjon</button>
      `;
      body.querySelector("[data-location-use-gps]")?.addEventListener("click", () => {
        clearLocationOverride();
        close();
        request();
      });
      body.querySelectorAll("[data-location-city]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const cityId = btn.getAttribute("data-location-city");
          const city = locations.find((loc) => loc.cityId === cityId);
          if (!city) return;
          const places = Array.isArray(city.places) ? city.places : [];
          if (!places.length) {
            setLocationOverride({
              cityId: city.cityId,
              cityLabel: city.label,
              label: city.label,
              lat: city.lat,
              lon: city.lon
            });
            close();
            return;
          }
          body.innerHTML = `
            <button type="button" class="iconbtn" data-location-back style="justify-content:flex-start;">← Tilbake til byvalg</button>
            ${places.map((place) => {
              const isActivePlace = active?.placeId ? active.placeId === place.id : (active?.cityId === city.cityId && active?.label === place.label);
              return `<button type="button" class="primary" data-location-place="${place.id}" style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;"><span>${place.label}</span><span style="opacity:.8">${isActivePlace ? "Aktiv" : ""}</span></button>`;
            }).join("")}
          `;
          body.querySelector("[data-location-back]")?.addEventListener("click", renderCityOptions);
          body.querySelectorAll("[data-location-place]").forEach((placeBtn) => {
            placeBtn.addEventListener("click", () => {
              const placeId = placeBtn.getAttribute("data-location-place");
              const place = places.find((entry) => entry.id === placeId);
              if (!place) return;
              setLocationOverride({
                cityId: city.cityId,
                cityLabel: city.label,
                placeId: place.id,
                label: place.label,
                lat: place.lat,
                lon: place.lon
              });
              close();
            });
          });
        });
      });
    };
    renderCityOptions();

    document.body.appendChild(modal);
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

  document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.getElementById("geoStatus");
    if (!trigger) return;
    trigger.style.cursor = "pointer";
    trigger.addEventListener("click", () => {
      openLocationPicker();
    });
  });
})();
