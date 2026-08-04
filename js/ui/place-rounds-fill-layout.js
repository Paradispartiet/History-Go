// @ts-nocheck
// js/ui/place-rounds-fill-layout.js
// Maksimerer de fire canonical rundingene i et 2 × 2-felt ved siden av frontImage.
(function installPlaceRoundsFillLayout(global) {
  "use strict";

  let attrObserver = null;
  let resizeObserver = null;
  let scheduled = false;

  function numericGap(grid) {
    const style = global.getComputedStyle?.(grid);
    const raw = parseFloat(style?.gap || style?.columnGap || "0");
    return Number.isFinite(raw) ? raw : 0;
  }

  function layout() {
    const grid = document.querySelector("#placeCard .pc-icons-quad");
    if (!grid) return;

    const count = Number(grid.dataset.roundCount || 0);
    if (count !== 4) {
      grid.style.removeProperty("--hg-round-fill-size");
      return;
    }

    const cols = 2;
    const rows = 2;
    const gap = numericGap(grid);
    const rect = grid.getBoundingClientRect();
    const width = rect.width || grid.clientWidth || 0;
    const height = rect.height || grid.clientHeight || 0;
    if (width <= 0 || height <= 0) return;

    const byWidth = (width - gap * (cols - 1)) / cols;
    const byHeight = (height - gap * (rows - 1)) / rows;
    const size = Math.max(1, Math.floor(Math.min(byWidth, byHeight)));
    grid.style.setProperty("--hg-round-fill-size", `${size}px`);
  }

  function scheduleLayout() {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      layout();
    };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run);
    else global.setTimeout(run, 0);
  }

  function bind() {
    const grid = document.querySelector("#placeCard .pc-icons-quad");
    if (!grid) return false;

    if (!attrObserver && typeof global.MutationObserver === "function") {
      attrObserver = new global.MutationObserver(scheduleLayout);
      attrObserver.observe(grid, { attributes: true, attributeFilter: ["data-round-count"] });
    }

    if (!resizeObserver && typeof global.ResizeObserver === "function") {
      resizeObserver = new global.ResizeObserver(scheduleLayout);
      resizeObserver.observe(grid);
    }

    scheduleLayout();
    return true;
  }

  function init() {
    if (!bind()) {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (bind() || attempts >= 80) global.clearInterval(timer);
      }, 100);
    }
  }

  global.HGPlaceRoundsFillLayout = { layout, scheduleLayout };
  global.addEventListener?.("resize", scheduleLayout, { passive: true });
  ["hg:appReady", "hg:place-selected", "hg:placesUpdated"].forEach(name => global.addEventListener?.(name, scheduleLayout));

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
