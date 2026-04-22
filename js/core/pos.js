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

      const placeLat = Number(place.lat);
      const placeLon = Number(place.lon);
      const radius = Number(place.r);

      if (![placeLat, placeLon, radius].every(Number.isFinite)) continue;
      if (radius <= 0) continue;

      const d = window.distMeters(userPos, { lat: placeLat, lon: placeLon });
      if (!Number.isFinite(d) || d > radius) continue;

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
    if (Number.isFinite(HG_POS.lat) && Number.isFinite(HG_POS.lon)) {
      return { lat: HG_POS.lat, lon: HG_POS.lon, acc: HG_POS.acc, ts: HG_POS.ts };
    }
    return null;
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
    setPos,
    clearPos,
    stopWatch,
    state: () => ({ ...HG_POS })
  };

  // små alias (så resten av appen din slipper å endres)
  window.getPos = getPos;
  window.setPos = setPos;
  window.clearPos = clearPos;
})();
