/* The authentic PlaceCard hero stays in the DOM and becomes sticky.
   No duplicate photo, title, badge or alternative header is ever created. */
(() => {
  "use strict";

  function initialize() {
    const card = document.getElementById("placeCard");
    const scroller = card?.querySelector(".pc-body");
    const hero = document.getElementById("pcHeaderHero");
    const image = /** @type {HTMLImageElement|null} */ (document.getElementById("pcHeaderImage"));
    const title = document.getElementById("pcTitle");
    const headingRow = hero?.querySelector(".pc-title-row");
    if (!(card instanceof HTMLElement) || !(scroller instanceof HTMLElement)
      || !(hero instanceof HTMLElement) || !(image instanceof HTMLImageElement)
      || !(title instanceof HTMLElement)) return;

    // Remove the artificial companion from the former version, if a cached
    // old script created one earlier in the same browser session.
    card.querySelector(":scope > .pc-sticky-image-header")?.remove();

    let shellHero = null;
    let naturalHeight = 0;
    let minimumHeight = 0;
    let frameScheduled = false;
    let measureScheduled = false;

    // Sample only the pixels underneath the original title. If canvas is
    // blocked by CORS, retain the existing light text/shadow instead.
    function updateTitleContrast() {
      hero.dataset.pcContrast = "light";
      if (!image.complete || !image.naturalWidth || !image.naturalHeight) return;
      const bounds = image.getBoundingClientRect();
      const letters = title.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1 || letters.width < 1) return;
      const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const offsetX = (image.naturalWidth * scale - bounds.width) / 2;
      const offsetY = (image.naturalHeight * scale - bounds.height) / 2;
      const x = Math.max(0, letters.left - bounds.left);
      const y = Math.max(0, letters.top - bounds.top);
      const w = Math.min(letters.width, bounds.width - x);
      const h = Math.min(letters.height, bounds.height - y);
      if (w < 1 || h < 1) return;
      const sx = (x + offsetX) / scale;
      const sy = (y + offsetY) / scale;
      const sw = Math.min(w / scale, image.naturalWidth - sx);
      const sh = Math.min(h / scale, image.naturalHeight - sy);
      if (sw <= 0 || sh <= 0) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 12;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, sx, sy, sw, sh, 0, 0, 32, 12);
        const pixels = context.getImageData(0, 0, 32, 12).data;
        let sum = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          sum += (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
        }
        hero.dataset.pcContrast = sum / (pixels.length / 4) > 0.57 ? "dark" : "light";
      } catch {
        // A remote image may disallow canvas pixel access.
      }
    }

    function release() {
      card.classList.remove("is-original-photo-pinned");
      card.style.removeProperty("--pc-original-hero-height");
      card.style.removeProperty("--pc-visible-hero-height");
      shellHero = null;
      naturalHeight = 0;
      minimumHeight = 0;
    }

    function renderScroll() {
      frameScheduled = false;
      if (!shellHero || !naturalHeight || !card.classList.contains("is-original-photo-pinned")) return;
      // Continuous crop of the ORIGINAL photograph; font, badges, positions,
      // source image and image scaling stay exactly the same.
      const crop = Math.min(naturalHeight - minimumHeight, Math.max(0, scroller.scrollTop));
      const visible = naturalHeight - crop;
      const value = visible + "px";
      if (card.style.getPropertyValue("--pc-visible-hero-height") !== value) {
        card.style.setProperty("--pc-visible-hero-height", value);
      }
    }

    function scheduleScroll() {
      if (frameScheduled) return;
      frameScheduled = true;
      requestAnimationFrame(renderScroll);
    }

    function measure() {
      measureScheduled = false;
      const owningHero = hero.closest(".pc-sheet-hero");
      if (!(owningHero instanceof HTMLElement)
        || !card.classList.contains("is-place-sheet-direct")
        || !hero.classList.contains("has-image") || !image.naturalWidth) {
        if (shellHero || card.classList.contains("is-original-photo-pinned")) release();
        return;
      }

      shellHero = owningHero;
      // The image retains its natural layout height independently of the
      // sticky wrapper, which only reveals less of the image from the bottom.
      const height = Math.ceil(hero.getBoundingClientRect().height);
      if (!height) return;
      const bounds = owningHero.getBoundingClientRect();
      const headingBounds = hero.getBoundingClientRect();
      // Preserve the original title, audio/favorite controls and the live
      // people/badge circles. Metadata and status stay in their ORIGINAL
      // positions in the expanded photo but may scroll out of the clipped
      // lower edge. Including them in this limit prevented any real collapse.
      const headingBottom = headingRow instanceof HTMLElement
        ? headingRow.getBoundingClientRect().bottom - headingBounds.top
        : title.getBoundingClientRect().bottom - headingBounds.top;
      naturalHeight = Math.ceil(Math.max(height, hero.offsetHeight) + Math.max(0, headingBounds.top - bounds.top));
      minimumHeight = Math.min(naturalHeight, Math.max(96,
        Math.ceil(headingBottom + 9 + Math.max(0, headingBounds.top - bounds.top))));
      card.style.setProperty("--pc-original-hero-height", height + "px");
      card.classList.add("is-original-photo-pinned");
      updateTitleContrast();
      scheduleScroll();
    }

    function scheduleMeasure() {
      if (measureScheduled) return;
      measureScheduled = true;
      requestAnimationFrame(measure);
    }

    scroller.addEventListener("scroll", scheduleScroll, { passive: true });
    image.addEventListener("load", scheduleMeasure);
    image.addEventListener("error", scheduleMeasure);
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    new ResizeObserver(scheduleMeasure).observe(hero);
    new MutationObserver(scheduleMeasure).observe(title, { childList: true, characterData: true, subtree: true });
    if (headingRow) new ResizeObserver(scheduleMeasure).observe(headingRow);
    new MutationObserver(scheduleMeasure).observe(hero, { attributes: true, attributeFilter: ["class"] });
    new MutationObserver(scheduleMeasure).observe(card, { attributes: true, attributeFilter: ["data-current-place-id", "class"] });
    scheduleMeasure();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
