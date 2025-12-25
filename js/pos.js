// ==============================
// HG POS — én sannhet + pro flow
// ==============================
(function () {
  const HG_POS = (window.HG_POS = window.HG_POS || {
    status: "unknown",   // unknown | prompt | granted | denied | unavailable
    lat: null,
    lon: null,
    acc: null,
    ts: 0,
    reason: null,
    lastError: null
  });

  let watchId = null;

  function setPos(lat, lon, acc) {
    lat = Number(lat); lon = Number(lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;

    HG_POS.lat = lat;
    HG_POS.lon = lon;
    HG_POS.acc = Number.isFinite(Number(acc)) ? Number(acc) : null;
    HG_POS.ts = Date.now();
    HG_POS.status = "granted";
    HG_POS.reason = null;
    HG_POS.lastError = null;

    // legacy compat (midlertidig)
    window.userLat = lat;
    window.userLon = lon;
    window.currentPos = { lat, lon };

    // kart
    if (window.HGMap?.setUser) window.HGMap.setUser(lat, lon);

    // UI
    if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();

    // event
    window.dispatchEvent(new CustomEvent("hg:geo", { detail: { status: "granted", lat, lon, acc: HG_POS.acc } }));

    // lagre last known good (pro)
    try {
      localStorage.setItem("hg_last_pos_v1", JSON.stringify({ lat, lon, acc: HG_POS.acc, ts: HG_POS.ts }));
    } catch {}
    return true;
  }

  function clearPos(reason = "denied", err = null) {
    HG_POS.status = (reason === "denied" ? "denied" : "unavailable");
    HG_POS.reason = String(reason || "unavailable");
    HG_POS.lastError = err ? { code: err.code, message: err.message } : null;
    HG_POS.lat = null;
    HG_POS.lon = null;
    HG_POS.acc = null;
    HG_POS.ts = Date.now();

    window.userLat = null;
    window.userLon = null;
    window.currentPos = null;

    if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();
    window.dispatchEvent(new CustomEvent("hg:geo", { detail: { status: HG_POS.status, reason: HG_POS.reason, error: HG_POS.lastError } }));
  }

  function hasPos() {
    return Number.isFinite(HG_POS.lat) && Number.isFinite(HG_POS.lon);
  }

  function getPos() {
    return hasPos() ? { lat: HG_POS.lat, lon: HG_POS.lon, acc: HG_POS.acc } : null;
  }

  async function checkPermissionState() {
    // Permissions API finnes ikke alltid (Safari)
    if (!navigator.permissions?.query) return "unknown";
    try {
      const p = await navigator.permissions.query({ name: "geolocation" });
      return p.state; // granted | denied | prompt
    } catch {
      return "unknown";
    }
  }

  async function requestLocation() {
    if (!navigator.geolocation) {
      HG_POS.status = "unavailable";
      clearPos("unsupported");
      return;
    }

    // pro: sjekk permission state
    const st = await checkPermissionState();
    if (st === "denied") {
      HG_POS.status = "denied";
      clearPos("denied");
      return;
    }
    if (st === "prompt") HG_POS.status = "prompt";

    // alltid vis nearby med “–” mens vi venter
    if (typeof window.renderNearbyPlaces === "function") window.renderNearbyPlaces();

    // kick: getCurrentPosition (for å trigge prompt)
    navigator.geolocation.getCurrentPosition(
      (g) => setPos(g.coords.latitude, g.coords.longitude, g.coords.accuracy),
      (err) => {
        // code 1 = denied
        if (err?.code === 1) clearPos("denied", err);
        else clearPos("unavailable", err);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );

    // pro: stabil tracking
    if (watchId != null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      (g) => setPos(g.coords.latitude, g.coords.longitude, g.coords.accuracy),
      (err) => {
        if (err?.code === 1) clearPos("denied", err);
        else clearPos("unavailable", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
  }

  function stopLocation() {
    if (watchId != null && navigator.geolocation?.clearWatch) {
      navigator.geolocation.clearWatch(watchId);
    }
    watchId = null;
  }

  // pro fallback: last known good
  try {
    const raw = localStorage.getItem("hg_last_pos_v1");
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Number.isFinite(p.lat) && Number.isFinite(p.lon)) {
        // Ikke sett status=granted, bare bruk som “hint” hvis du vil
        // setPos(p.lat, p.lon, p.acc);
        HG_POS.lastKnown = p;
      }
    }
  } catch {}

  window.setPos = setPos;
  window.clearPos = clearPos;
  window.hasPos = hasPos;
  window.getPos = getPos;

  window.HGPos = {
    request: requestLocation,
    stop: stopLocation
  };
})();
