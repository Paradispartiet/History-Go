// CivicationMapZoom.js
// Smooth zoom/pan for det eksisterende Civication-SVG-kartet.
// Endrer kun SVG viewBox, og sender rolige/debounced zoom-events etter interaksjon.
(function () {
  "use strict";

  if (window.CIVICATION_CANVAS_MAP_ENABLED === true) {
    window.CivicationMapZoom = {
      init() {},
      reset() {},
      zoomIn() {},
      zoomOut() {},
      getZoom() { return 1; }
    };
    return;
  }

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 6.5;
  const DEFAULT_ZOOM = 1;
  const STEP = 1.22;
  const ZOOM_EVENT_DELAY_MS = 160;

  const STATE = { zoom: DEFAULT_ZOOM, cx: 0.5, cy: 0.5 };

  const pointers = new Map();
  let pinchPrev = null;
  let panPrev = null;
  let bound = false;
  let applyQueued = false;
  let zoomEventTimer = null;
  let lastZoomEventBucket = null;
  let lastZoomEventValue = DEFAULT_ZOOM;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function host() { return document.getElementById("civiMapWorld"); }
  function svgEl() {
    const h = host();
    return h ? h.querySelector("svg") : null;
  }
  function inMapMode() { return document.body.classList.contains("civi-mapmode"); }

  function dims() {
    const h = host();
    return { w: (h && h.clientWidth) || 960, h: (h && h.clientHeight) || 640 };
  }

  function zoomBucket(zoom) {
    if (zoom > 2.2) return "high";
    if (zoom > 1.4) return "mid";
    return "low";
  }

  function setHostZoomLevel(zoom) {
    const h = host();
    if (!h) return;
    h.setAttribute("data-civi-zoom-level", zoomBucket(zoom));
  }

  function applyNow() {
    applyQueued = false;

    const svg = svgEl();
    if (!svg) return;

    const { w, h } = dims();
    const zoom = clamp(STATE.zoom, MIN_ZOOM, MAX_ZOOM);
    STATE.zoom = zoom;

    const vw = w / zoom;
    const vh = h / zoom;
    const halfW = vw / 2;
    const halfH = vh / 2;

    const cx = clamp(STATE.cx * w, halfW, w - halfW);
    const cy = clamp(STATE.cy * h, halfH, h - halfH);
    STATE.cx = w ? cx / w : 0.5;
    STATE.cy = h ? cy / h : 0.5;

    svg.setAttribute("viewBox", `${cx - halfW} ${cy - halfH} ${vw} ${vh}`);
    setHostZoomLevel(zoom);
    scheduleZoomEvent();
  }

  function requestApply() {
    if (applyQueued) return;
    applyQueued = true;
    requestAnimationFrame(applyNow);
  }

  function dispatchZoom() {
    const bucket = zoomBucket(STATE.zoom);
    const zoomChangedEnough = Math.abs(STATE.zoom - lastZoomEventValue) >= 0.08;
    if (bucket === lastZoomEventBucket && !zoomChangedEnough) return;

    lastZoomEventBucket = bucket;
    lastZoomEventValue = STATE.zoom;

    try {
      window.dispatchEvent(new CustomEvent("civi:mapZoomChanged", { detail: { zoom: STATE.zoom } }));
    } catch (e) {}
  }

  function scheduleZoomEvent() {
    clearTimeout(zoomEventTimer);
    zoomEventTimer = setTimeout(dispatchZoom, ZOOM_EVENT_DELAY_MS);
  }

  function zoomTo(newZoom, px, py) {
    const oldZoom = STATE.zoom;
    const zoom = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
    if (Math.abs(zoom - oldZoom) < 0.002) return;

    if (typeof px === "number" && typeof py === "number") {
      const oldView = 1 / oldZoom;
      const pointX = STATE.cx - oldView / 2 + px * oldView;
      const pointY = STATE.cy - oldView / 2 + py * oldView;
      const newView = 1 / zoom;
      STATE.cx = pointX - (px - 0.5) * newView;
      STATE.cy = pointY - (py - 0.5) * newView;
    }

    STATE.zoom = zoom;
    requestApply();
  }

  function zoomIn() { zoomTo(STATE.zoom * STEP, 0.5, 0.5); }
  function zoomOut() { zoomTo(STATE.zoom / STEP, 0.5, 0.5); }
  function reset() {
    STATE.zoom = DEFAULT_ZOOM;
    STATE.cx = 0.5;
    STATE.cy = 0.5;
    requestApply();
  }
  function getZoom() { return STATE.zoom; }

  function relPos(e) {
    const h = host();
    if (!h) return { px: 0.5, py: 0.5 };
    const r = h.getBoundingClientRect();
    return {
      px: r.width ? clamp((e.clientX - r.left) / r.width, 0, 1) : 0.5,
      py: r.height ? clamp((e.clientY - r.top) / r.height, 0, 1) : 0.5
    };
  }

  function onWheel(e) {
    if (!inMapMode()) return;
    e.preventDefault();
    const { px, py } = relPos(e);
    const factor = e.deltaY < 0 ? STEP : 1 / STEP;
    zoomTo(STATE.zoom * factor, px, py);
  }

  function panBy(dxPx, dyPx) {
    const { w, h } = dims();
    if (!w || !h) return;
    STATE.cx -= (dxPx / w) / STATE.zoom;
    STATE.cy -= (dyPx / h) / STATE.zoom;
    requestApply();
  }

  function onPointerDown(e) {
    if (!inMapMode()) return;
    const target = /** @type {Element} */ (e.target);
    if (target && target.closest && target.closest(".civi-map-zoom-controls, .civi-hg-place-miniature, .civi-system-hud, .civi-system-panel, .civi-zone-node")) return;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panPrev = { x: e.clientX, y: e.clientY };
    } else if (pointers.size === 2) {
      panPrev = null;
      pinchPrev = pinchState();
    }
  }

  function pinchState() {
    const pts = [...pointers.values()];
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    const dist = Math.hypot(dx, dy) || 1;
    const h = host();
    const r = h ? h.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
    const midX = (pts[0].x + pts[1].x) / 2;
    const midY = (pts[0].y + pts[1].y) / 2;
    return {
      dist,
      px: r.width ? clamp((midX - r.left) / r.width, 0, 1) : 0.5,
      py: r.height ? clamp((midY - r.top) / r.height, 0, 1) : 0.5
    };
  }

  function onPointerMove(e) {
    if (!inMapMode()) return;
    if (!pointers.has(e.pointerId)) return;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2) {
      const now = pinchState();
      if (pinchPrev) {
        e.preventDefault();
        const ratio = now.dist / pinchPrev.dist;
        if (ratio && Number.isFinite(ratio)) zoomTo(STATE.zoom * ratio, now.px, now.py);
      }
      pinchPrev = now;
      return;
    }

    if (panPrev) {
      e.preventDefault();
      panBy(e.clientX - panPrev.x, e.clientY - panPrev.y);
      panPrev = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchPrev = null;
    if (pointers.size === 1) {
      const p = [...pointers.values()][0];
      panPrev = { x: p.x, y: p.y };
    } else if (pointers.size === 0) {
      panPrev = null;
      scheduleZoomEvent();
    }
  }

  function ensureControls() {
    const h = host();
    if (!h || h.querySelector(".civi-map-zoom-controls")) return;
    const box = document.createElement("div");
    box.className = "civi-map-zoom-controls";
    box.innerHTML =
      '<button type="button" class="civi-map-zoom-btn" data-civi-zoom-in aria-label="Zoom inn">+</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-civi-zoom-reset aria-label="Nullstill zoom">⤢</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-civi-zoom-out aria-label="Zoom ut">−</button>';
    box.querySelector("[data-civi-zoom-in]").addEventListener("click", (e) => { e.preventDefault(); zoomIn(); });
    box.querySelector("[data-civi-zoom-out]").addEventListener("click", (e) => { e.preventDefault(); zoomOut(); });
    box.querySelector("[data-civi-zoom-reset]").addEventListener("click", (e) => { e.preventDefault(); reset(); });
    h.appendChild(box);
  }

  function bind() {
    if (bound) return;
    const h = host();
    if (!h) return;
    bound = true;
    h.addEventListener("wheel", onWheel, { passive: false });
    h.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function init() {
    ensureControls();
    bind();
    requestApply();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("civi:mapRendered", init);
  window.addEventListener("resize", () => setTimeout(requestApply, 80));

  window.CivicationMapZoom = { init, reset, zoomIn, zoomOut, getZoom };
})();
