// js/ui/sprakatlas-map-experience-v3.js
// Transient map presentation for explicit Språkatlas → canonical Place relations.
// Canonical language data and dialect ownership stay in data/leksikon/sprak/**.
(function installSprakatlasMapExperienceV3(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_SPRAKATLAS_MAP_EXPERIENCE_V3_INSTALLED__";
  const STYLE_ID = "hg-sprakatlas-map-v3-style";
  if (global[INSTALL_FLAG]) return;
  global[INSTALL_FLAG] = true;

  const markers = new Map();
  const pendingHosts = new WeakSet();
  let activeSelectionId = "";
  let activeRows = [];
  let syncToken = 0;

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];

  function atlasItemKind(atlas, selectionId) {
    const id = text(selectionId);
    if (!id) return "";
    if (list(atlas?.local_varieties).some(row => text(row?.id) === id)) return "local";
    if (list(atlas?.dialect_regions).some(row => text(row?.id) === id)) return "region";
    if (list(atlas?.macro_regions).some(row => text(row?.id) === id)) return "macro";
    return "";
  }

  function rowsForSelection(rows, atlas, selectionId) {
    const id = text(selectionId);
    const kind = atlasItemKind(atlas, id);
    if (!id || !kind) return [];

    const regionById = new Map(list(atlas?.dialect_regions).map(region => [text(region?.id), region]));
    return list(rows).filter(row => {
      if (kind === "local") return list(row?.localIds).includes(id);
      if (kind === "region") return list(row?.regionIds).includes(id);
      return list(row?.regionIds).includes(id)
        || list(row?.regionIds).some(regionId => text(regionById.get(text(regionId))?.macro_region_id) === id);
    });
  }

  function coordinateFor(row) {
    const lat = Number(row?.place?.lat);
    // Canonical History GO Places use lon. lng is retained only as a legacy runtime fallback.
    const lon = Number(row?.place?.lon ?? row?.place?.lng);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".hg-sprakatlas-map-marker{width:28px;height:28px;padding:0;border:3px solid #fff;border-radius:999px;background:#f6c800;box-shadow:0 0 0 3px rgba(24,33,26,.72),0 4px 14px rgba(0,0,0,.36);cursor:pointer;position:relative;}",
      ".hg-sprakatlas-map-marker::after{content:'';position:absolute;inset:7px;border-radius:999px;background:#18211a;}",
      ".hg-sprakatlas-map-marker:hover,.hg-sprakatlas-map-marker:focus-visible{outline:4px solid rgba(246,200,0,.30);outline-offset:3px;}",
      ".hg-sprakatlas-map-action{display:inline-flex;align-items:center;justify-content:center;min-height:40px;margin-top:10px;padding:9px 13px;border:1px solid rgba(24,33,26,.25);border-radius:999px;background:#18211a;color:#fff;font:inherit;font-weight:700;cursor:pointer;}",
      ".hg-sprakatlas-map-action:hover,.hg-sprakatlas-map-action:focus-visible{background:#263529;outline:2px solid rgba(24,33,26,.18);outline-offset:2px;}"
    ].join("");
    document.head.appendChild(style);
  }

  function clearMarkers() {
    for (const marker of markers.values()) {
      try { marker.remove(); } catch {}
    }
    markers.clear();
  }

  function openCanonicalPlace(placeId) {
    const id = text(placeId);
    if (!id) return false;
    return Boolean(global.HGMapView?.openPlace?.(id));
  }

  function addMarker(row) {
    const coordinate = coordinateFor(row);
    const map = global.HGMap?.getMap?.();
    const Marker = global.maplibregl?.Marker;
    if (!coordinate || !map || typeof Marker !== "function") return null;

    ensureStyle();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hg-sprakatlas-map-marker";
    button.dataset.sprakatlasMapPlace = text(row?.placeId);
    button.setAttribute("aria-label", `Åpne ${text(row?.place?.name || row?.placeId)} fra Språkatlas`);
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      openCanonicalPlace(row?.placeId);
    });

    const marker = new Marker({ element: button, anchor: "bottom" })
      .setLngLat([coordinate.lon, coordinate.lat])
      .addTo(map);
    markers.set(text(row?.placeId), marker);
    return marker;
  }

  function renderMarkers(rows) {
    clearMarkers();
    for (const row of list(rows)) addMarker(row);
  }

  function fitMapToRows(rows) {
    const map = global.HGMap?.getMap?.();
    const coordinates = list(rows).map(coordinateFor).filter(Boolean);
    if (!map || !coordinates.length) return false;

    if (coordinates.length === 1) {
      const coordinate = coordinates[0];
      const currentZoom = Number(map.getZoom?.());
      const zoom = Number.isFinite(currentZoom) ? Math.max(9, Math.min(12, currentZoom)) : 10;
      map.flyTo?.({ center: [coordinate.lon, coordinate.lat], zoom, duration: 650 });
      return true;
    }

    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;
    for (const coordinate of coordinates) {
      minLon = Math.min(minLon, coordinate.lon);
      minLat = Math.min(minLat, coordinate.lat);
      maxLon = Math.max(maxLon, coordinate.lon);
      maxLat = Math.max(maxLat, coordinate.lat);
    }
    map.fitBounds?.([[minLon, minLat], [maxLon, maxLat]], {
      padding: { top: 80, bottom: 90, left: 48, right: 48 },
      maxZoom: 13,
      duration: 650
    });
    return true;
  }

  function mapActionLabel(count) {
    return count === 1 ? "Vis stedet på kartet" : `Vis ${count} steder på kartet`;
  }

  function syncMapAction(host, selectionId, rows) {
    if (!(host instanceof Element)) return;
    const existing = host.querySelector("[data-sprakatlas-show-map]");
    if (!rows.length) {
      existing?.remove();
      return;
    }

    ensureStyle();
    const label = mapActionLabel(rows.length);
    const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!(existing instanceof HTMLButtonElement)) {
      button.type = "button";
      button.className = "hg-sprakatlas-map-action";
      host.appendChild(button);
    }
    button.dataset.sprakatlasShowMap = text(selectionId);
    if (button.textContent !== label) button.textContent = label;
  }

  async function resolveRows(selectionId) {
    const languageLayer = global.HGLanguageLayer;
    if (!languageLayer?.loadAtlas || !languageLayer?.loadAtlasPlaceLinks) return [];
    const [atlas, allRows] = await Promise.all([
      languageLayer.loadAtlas(),
      languageLayer.loadAtlasPlaceLinks()
    ]);
    if (!atlas) return [];
    return rowsForSelection(allRows, atlas, selectionId).filter(row => coordinateFor(row));
  }

  async function highlightSelection(selectionId, options = {}) {
    const id = text(selectionId);
    if (!id) return [];
    const token = ++syncToken;
    const rows = await resolveRows(id);
    if (token !== syncToken) return [];

    activeSelectionId = id;
    activeRows = rows;
    renderMarkers(rows);

    document.querySelectorAll("[data-atlas-place-selection]").forEach(host => {
      if (text(host.getAttribute("data-atlas-place-selection")) === id) syncMapAction(host, id, rows);
    });

    if (options.fit === true && rows.length) {
      global.HGMapView?.showMap?.();
      global.HGMap?.resize?.();
      const fit = () => fitMapToRows(rows);
      if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(fit);
      else global.setTimeout?.(fit, 0);
    }

    global.dispatchEvent?.(new CustomEvent("hg:sprakatlas-map-focus", {
      detail: { selectionId: id, placeIds: rows.map(row => text(row?.placeId)).filter(Boolean) }
    }));
    return rows;
  }

  function scheduleHostSync(host) {
    if (!(host instanceof Element) || pendingHosts.has(host)) return;
    pendingHosts.add(host);
    const run = () => {
      pendingHosts.delete(host);
      const selectionId = text(host.getAttribute("data-atlas-place-selection"));
      if (selectionId) void highlightSelection(selectionId);
    };
    if (typeof global.queueMicrotask === "function") global.queueMicrotask(run);
    else Promise.resolve().then(run);
  }

  function installSelectionObserver() {
    const root = document.documentElement;
    if (!root || typeof MutationObserver !== "function") return;
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-atlas-place-selection") {
          scheduleHostSync(mutation.target);
          continue;
        }
        if (mutation.type !== "childList") continue;
        const target = mutation.target instanceof Element ? mutation.target : mutation.target?.parentElement;
        const host = target?.matches?.("[data-atlas-place-selection]")
          ? target
          : target?.closest?.("[data-atlas-place-selection]");
        if (host) scheduleHostSync(host);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-atlas-place-selection"]
    });

    document.querySelectorAll("[data-atlas-place-selection]").forEach(scheduleHostSync);
  }

  function clear() {
    ++syncToken;
    activeSelectionId = "";
    activeRows = [];
    clearMarkers();
  }

  document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest?.("[data-sprakatlas-show-map]");
    if (!button) return;
    const selectionId = text(button.getAttribute("data-sprakatlas-show-map"));
    if (!selectionId) return;
    event.preventDefault();
    event.stopPropagation();
    void highlightSelection(selectionId, { fit: true });
  });

  installSelectionObserver();

  global.HGSprakatlasMapExperienceV3 = Object.freeze({
    rowsForSelection,
    coordinateFor,
    highlightSelection,
    fitMapToRows,
    clear,
    getActiveSelectionId: () => activeSelectionId,
    getHighlightedPlaceIds: () => activeRows.map(row => text(row?.placeId)).filter(Boolean)
  });
})(window);
