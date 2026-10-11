/* Keep a cropped part of place.image and the place name visible as the
   PlaceCard scrolls. The canonical hero, its controls and the nav retain
   their existing owners; this module only mirrors decorative media/text. */
(() => {
  "use strict";

  function initialize() {
    const card = document.getElementById("placeCard");
    const scroller = card?.querySelector(".pc-body");
    const hero = document.getElementById("pcHeaderHero");
    const heroImage = document.getElementById("pcHeaderImage");
    const title = document.getElementById("pcTitle");
    if (!(card instanceof HTMLElement) || !(scroller instanceof HTMLElement)
      || !(hero instanceof HTMLElement) || !(heroImage instanceof HTMLImageElement)
      || !(title instanceof HTMLElement)) return;

    const compact = document.createElement("div");
    compact.className = "pc-sticky-image-header";
    compact.setAttribute("aria-hidden", "true");
    const compactImage = document.createElement("img");
    compactImage.className = "pc-sticky-image-header-photo";
    compactImage.alt = "";
    const compactTitle = document.createElement("span");
    compactTitle.className = "pc-sticky-image-header-title";
    compact.append(compactImage, compactTitle);
    card.insertBefore(compact, scroller);

    // A small canvas sample of the actual pixels behind each title gives
    // dark lettering on bright photographs and light lettering on dark ones.
    // Cross-origin images without CORS permission fall back to light text
    // on a dark contrast plate; the source image is never changed.
    function chooseContrast(host, image, textNode, imageY) {
      host.dataset.pcContrast = "light";
      if (!image.complete || !image.naturalWidth || !image.naturalHeight) return;
      const bounds = image.getBoundingClientRect();
      const letters = textNode.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1 || letters.width < 1) return;
      const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const overflowX = (image.naturalWidth * scale - bounds.width) / 2;
      const overflowY = (image.naturalHeight * scale - bounds.height) * imageY;
      const x = Math.max(0, letters.left - bounds.left);
      const y = Math.max(0, letters.top - bounds.top);
      const w = Math.min(bounds.width - x, letters.width);
      const h = Math.min(bounds.height - y, letters.height);
      if (w < 1 || h < 1) return;
      const sx = (x + overflowX) / scale;
      const sy = (y + overflowY) / scale;
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
        host.dataset.pcContrast = sum / (pixels.length / 4) > 0.57 ? "dark" : "light";
      } catch {
        // Tainted canvas (remote image): CSS guarantees a readable fallback.
      }
    }

    function syncVisibility() {
      const ready = hero.classList.contains("has-image") && heroImage.naturalWidth > 0
        && compactImage.complete && compactImage.naturalWidth > 0
        && Boolean(compactTitle.textContent);
      const threshold = Math.min(70, Math.max(30, hero.offsetHeight * 0.4));
      const show = ready && scroller.scrollTop > threshold;
      const wasVisible = card.classList.contains("is-sticky-image-visible");
      card.classList.toggle("is-sticky-image-visible", show);
      // The compact image has zero height before its first appearance, so
      // its photo pixels can only be sampled after layout has expanded it.
      if (show && !wasVisible) {
        requestAnimationFrame(() => chooseContrast(compact, compactImage, compactTitle, 0));
      }
    }

    function refreshContrast() {
      chooseContrast(hero, heroImage, title, 0.5);
      chooseContrast(compact, compactImage, compactTitle, 0);
      syncVisibility();
    }

    function syncPhotoAndTitle() {
      compactTitle.textContent = title.textContent?.trim() || "";
      const src = heroImage.getAttribute("src") || "";
      if (src && compactImage.getAttribute("src") !== src) {
        compactImage.src = src;
      } else if (!src && compactImage.hasAttribute("src")) {
        compactImage.removeAttribute("src");
      }
      refreshContrast();
    }

    scroller.addEventListener("scroll", syncVisibility, { passive: true });
    heroImage.addEventListener("load", refreshContrast);
    heroImage.addEventListener("error", syncPhotoAndTitle);
    compactImage.addEventListener("load", refreshContrast);
    compactImage.addEventListener("error", syncVisibility);
    window.addEventListener("resize", refreshContrast, { passive: true });

    new MutationObserver(syncPhotoAndTitle).observe(title, { childList: true, characterData: true, subtree: true });
    new MutationObserver(syncPhotoAndTitle).observe(heroImage, { attributes: true, attributeFilter: ["src"] });
    new MutationObserver(refreshContrast).observe(hero, { attributes: true, attributeFilter: ["class"] });
    new MutationObserver(syncVisibility).observe(card, { attributes: true, attributeFilter: ["data-current-place-id"] });

    syncPhotoAndTitle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
