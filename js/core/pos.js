// js/pos.js — History GO posisjon (én sannhet)
// Eksponerer: window.HGPos.request(), window.getPos(), window.setPos(), window.clearPos()
// Sender events: "hg:geo" { status: requesting|granted|blocked|unsupported }

(function () {
  "use strict";

  // ÉN state (ikke lag flere varianter)
  const HG_POS = (window.HG_POS = window.HG_POS || {
    status: "unknown", // unknown|requesting|granted|blocked|unsupported|test
    lat: null,
    lon: null,
    acc: null,
    ts: 0,
    reason: null,
    lastError: null
  });

  function emit(detail) {
    try {
      window.dispatchEvent(new CustomEvent("hg:geo", { detail }));
    } catch {}
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
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      ...opts
    };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (g) => {
          setPos(g.coords.latitude, g.coords.longitude, g.coords.accuracy);
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
    state: () => ({ ...HG_POS })
  };

  // små alias (så resten av appen din slipper å endres)
  window.getPos = getPos;
  window.setPos = setPos;
  window.clearPos = clearPos;
})();
