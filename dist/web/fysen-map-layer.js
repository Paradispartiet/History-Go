(() => {
  // js/ui/fysen-map-layer.ts
  var win = window;
  var DATA_URL = "https://raw.githubusercontent.com/Paradispartiet/fysen/fysen-public-restaurant-map/restaurants.json";
  var APP_URL = "https://fysen.vercel.app/";
  var SOURCE = "hg-fysen-restaurants";
  var POINTS = "hg-fysen-points";
  var LABELS = "hg-fysen-labels";
  var LOGOS = "hg-fysen-logos";
  var layers = [LABELS, LOGOS, POINTS];
  var enabled = false;
  var loading = false;
  var generation = 0;
  var request = null;
  var catalog = null;
  var boundMap = null;
  var popup = null;
  var logoCache = /* @__PURE__ */ new Map();
  var pendingLogos = /* @__PURE__ */ new Set();
  function validText(value, limit) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
  }
  function parseCatalog(raw) {
    if (!raw || typeof raw !== "object") throw new Error("Invalid Fysen catalog");
    const data = raw;
    if ((data == null ? void 0 : data.schemaVersion) !== 1 || data.source !== "fysen-catalog" || data.city !== "Oslo" || typeof data.sourceCommit !== "string" || !/^[a-f0-9]{40}$/.test(data.sourceCommit) || typeof data.catalogCount !== "number" || !Number.isSafeInteger(data.catalogCount) || data.catalogCount < 1 || data.catalogCount > 1e4 || !Array.isArray(data.restaurants) || !data.restaurants.length || data.restaurants.length > data.catalogCount) throw new Error("Invalid Fysen catalog");
    const seen = /* @__PURE__ */ new Set();
    const features = data.restaurants.map((rawRow) => {
      if (!rawRow || typeof rawRow !== "object") throw new Error("Invalid Fysen restaurant");
      const row = rawRow;
      if (!validText(row == null ? void 0 : row.slug, 160) || !/^[a-z0-9][a-z0-9-]*$/.test(row.slug) || seen.has(row.slug) || !validText(row.name, 240) || !validText(row.address, 500) || typeof row.latitude !== "number" || !Number.isFinite(row.latitude) || row.latitude < 59.7 || row.latitude > 60.2 || typeof row.longitude !== "number" || !Number.isFinite(row.longitude) || row.longitude < 10.4 || row.longitude > 11.1) {
        throw new Error("Invalid Fysen restaurant");
      }
      seen.add(row.slug);
      const logoPath = typeof row.logoPath === "string" && /^\/restaurants\/[a-z0-9-]+\/logo\.(svg|png|webp)$/u.test(row.logoPath) ? row.logoPath : null;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
        properties: { slug: row.slug, name: row.name, address: row.address, ...logoPath ? { logoKey: "hg-fysen-logo:" + logoPath, logoUrl: "https://raw.githubusercontent.com/Paradispartiet/fysen/" + data.sourceCommit + "/apps/web/public" + logoPath } : {} }
      };
    });
    return { type: "FeatureCollection", features };
  }
  function notify() {
    win.dispatchEvent(new CustomEvent("hg:fysen-map-change"));
  }
  function toast(message) {
    var _a;
    (_a = win.showToast) == null ? void 0 : _a.call(win, message);
  }
  function removePopup() {
    popup == null ? void 0 : popup.remove();
    popup = null;
  }
  function clearLayers(map) {
    if (!map) return;
    for (const id of layers) if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(SOURCE)) map.removeSource(SOURCE);
  }
  async function loadLogo(url) {
    try {
      const response = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", mode: "cors", redirect: "error" });
      if (!response.ok) return null;
      const type = url.endsWith(".svg") ? "image/svg+xml" : url.endsWith(".png") ? "image/png" : "image/webp";
      const objectUrl = URL.createObjectURL(new Blob([await response.arrayBuffer()], { type }));
      try {
        const img = new Image();
        img.src = objectUrl;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 48;
        const ctx = canvas.getContext("2d");
        if (!ctx || !img.naturalWidth || !img.naturalHeight) return null;
        ctx.beginPath();
        ctx.arc(24, 24, 23, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.clip();
        const scale = Math.min(38 / img.naturalWidth, 38 / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (48 - w) / 2, (48 - h) / 2, w, h);
        return ctx.getImageData(0, 0, 48, 48);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      return null;
    }
  }
  function syncLogoImages(map) {
    if (!catalog) return;
    for (const feature of catalog.features) {
      const { logoKey, logoUrl } = feature.properties;
      if (!logoKey || !logoUrl || map.hasImage(logoKey) || pendingLogos.has(logoKey)) continue;
      if (!logoCache.has(logoUrl)) logoCache.set(logoUrl, loadLogo(logoUrl));
      const promise = logoCache.get(logoUrl);
      if (!promise) continue;
      pendingLogos.add(logoKey);
      void promise.then((image) => {
        if (image && enabled && boundMap === map && map.getSource(SOURCE) && !map.hasImage(logoKey)) {
          map.addImage(logoKey, image, { pixelRatio: 2 });
        }
      }).catch(() => {
      }).finally(() => {
        pendingLogos.delete(logoKey);
      });
    }
  }
  function syncLayers() {
    var _a;
    const map = boundMap;
    if (!map || !enabled || !catalog || !((_a = map.getStyle) == null ? void 0 : _a.call(map))) return;
    try {
      if (!map.getSource(SOURCE)) {
        map.addSource(SOURCE, { type: "geojson", data: catalog, cluster: false });
      }
      if (!map.getLayer(POINTS)) map.addLayer({
        id: POINTS,
        type: "circle",
        source: SOURCE,
        paint: { "circle-color": "#3e985d", "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 10], "circle-stroke-color": "#fff", "circle-stroke-width": 2 }
      });
      if (catalog.features.some((feature) => feature.properties.logoKey)) {
        syncLogoImages(map);
        if (!map.getLayer(LOGOS)) map.addLayer({
          id: LOGOS,
          type: "symbol",
          source: SOURCE,
          filter: ["has", "logoKey"],
          layout: { "icon-image": ["get", "logoKey"], "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 16, 1], "icon-allow-overlap": true, "icon-ignore-placement": true }
        });
      }
      if (!map.getLayer(LABELS)) map.addLayer({
        id: LABELS,
        type: "symbol",
        source: SOURCE,
        minzoom: 15,
        layout: { "text-field": ["get", "name"], "text-size": 12, "text-anchor": "top", "text-offset": [0, 1.15], "text-max-width": 12 },
        paint: { "text-color": "#173825", "text-halo-color": "#fff", "text-halo-width": 1.5 }
      });
    } catch (error) {
      console.warn("[HGFysenMap] map layers not ready", error);
    }
  }
  function openRestaurant(feature) {
    var _a;
    const properties = feature.properties;
    if (!properties || !((_a = win.maplibregl) == null ? void 0 : _a.Popup)) return;
    removePopup();
    const card = document.createElement("div");
    card.className = "hg-fysen-map-popup";
    const heading = document.createElement("strong");
    heading.textContent = properties.name;
    const address = document.createElement("p");
    address.textContent = properties.address;
    const note = document.createElement("small");
    note.textContent = "Registrert i Fysen. \xC5pningstid og dagens meny er ikke bekreftet.";
    const link = document.createElement("a");
    link.href = APP_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "\xC5pne Fysen \u2197";
    card.append(heading, address, note, link);
    popup = new win.maplibregl.Popup({ closeButton: true, maxWidth: "270px" }).setLngLat(feature.geometry.coordinates).setDOMContent(card).addTo(boundMap);
  }
  function handleClick(event) {
    if (!enabled || !boundMap) return;
    const activeLayers = [LOGOS, POINTS].filter((id) => boundMap.getLayer(id));
    if (!activeLayers.length) return;
    const feature = boundMap.queryRenderedFeatures(event.point, { layers: activeLayers })[0];
    if (!feature) return;
    openRestaurant(feature);
  }
  function bindMap(map) {
    if (boundMap === map) return;
    if (boundMap) {
      removePopup();
      clearLayers(boundMap);
      boundMap.off("style.load", syncLayers);
      boundMap.off("idle", syncLayers);
      boundMap.off("click", handleClick);
    }
    boundMap = map;
    map.on("style.load", syncLayers);
    map.on("idle", syncLayers);
    map.on("click", handleClick);
  }
  async function setEnabled(value) {
    var _a, _b;
    if (!value) {
      if (!enabled && !loading) return false;
      generation += 1;
      request == null ? void 0 : request.abort();
      request = null;
      enabled = false;
      loading = false;
      removePopup();
      clearLayers(boundMap);
      notify();
      return false;
    }
    if (enabled || loading) return enabled;
    const map = (_b = (_a = win.HGMap) == null ? void 0 : _a.getMap) == null ? void 0 : _b.call(_a);
    if (!map) {
      toast("Kartet er ikke tilgjengelig enn\xE5.");
      return false;
    }
    const ticket = ++generation;
    loading = true;
    notify();
    try {
      if (!catalog) {
        request = new AbortController();
        const response = await fetch(DATA_URL, {
          method: "GET",
          credentials: "omit",
          referrerPolicy: "no-referrer",
          mode: "cors",
          redirect: "error",
          signal: request.signal
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const parsed = parseCatalog(await response.json());
        if (ticket !== generation) return false;
        catalog = parsed;
      }
      if (ticket !== generation) return false;
      bindMap(map);
      enabled = true;
      loading = false;
      request = null;
      syncLayers();
      notify();
      toast(catalog.features.length + " restauranter fra Fysen");
      return true;
    } catch (error) {
      if (ticket !== generation) return false;
      enabled = false;
      loading = false;
      request = null;
      console.warn("[HGFysenMap] catalog unavailable", error);
      notify();
      toast("Fysen-kartet er ikke tilgjengelig akkurat n\xE5.");
      return false;
    }
  }
  function foodLogo() {
    const img = document.createElement("img");
    img.className = "hg-map-category-logo";
    img.src = "bilder/merker/fysen-mat.svg";
    img.alt = "";
    return img;
  }
  function decorateOptions(options, trigger, logos, label) {
    const button = document.createElement("button");
    button.className = "hg-map-category-option hg-fysen-map-option" + (enabled ? " is-active" : "");
    button.type = "button";
    button.setAttribute("role", "menuitemcheckbox");
    button.setAttribute("aria-checked", String(enabled));
    button.setAttribute("aria-label", loading ? "Mat \xB7 Fysen, laster" : "Mat \xB7 Fysen");
    button.title = "Mat \xB7 Fysen";
    button.disabled = loading;
    const logoBox = document.createElement("span");
    logoBox.className = "hg-map-category-option-logos";
    logoBox.append(foodLogo());
    const text = document.createElement("span");
    text.className = "hg-map-category-option-label hg-fysen-map-option-label";
    text.textContent = loading ? "Laster\u2026" : "Mat \xB7 Fysen";
    const check = document.createElement("span");
    check.className = "hg-map-category-option-check";
    check.textContent = "\u2713";
    check.setAttribute("aria-hidden", "true");
    button.append(logoBox, text, check);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      void setEnabled(!enabled);
    });
    options.prepend(button);
    if (enabled) {
      for (const item of options.querySelectorAll("[data-map-category]")) {
        item.classList.remove("is-active");
        item.setAttribute("aria-checked", "false");
      }
      logos.replaceChildren(foodLogo());
      label.textContent = "Mat \xB7 Fysen";
      trigger.title = "Viser restauranter fra Fysen";
      trigger.setAttribute("aria-label", "Filter aktivt: Mat \xB7 Fysen");
    }
  }
  win.HGFysenMap = Object.freeze({
    isEnabled: () => enabled,
    setEnabled,
    decorateOptions,
    parseCatalog
  });
})();
