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
    let measuredLayout = "";

    // Text always remains white; the hero has a dark gradient underneath.
    function updateTitleContrast() {
      hero.dataset.pcContrast = "light";
    }

    function release() {
      card.classList.remove("is-original-photo-pinned", "is-quizcard-reading");
      card.style.removeProperty("--pc-original-hero-height");
      card.style.removeProperty("--pc-visible-hero-height");
      card.style.removeProperty("--pc-hero-collapse-offset");
      card.style.removeProperty("--pc-reader-runway");
      shellHero = null;
      naturalHeight = 0;
      minimumHeight = 0;
    }

    function renderScroll() {
      frameScheduled = false;
      if (!shellHero || !naturalHeight || !card.classList.contains("is-original-photo-pinned")) return;
      // Do not automatically release the sticky photograph at an arbitrary
      // scroll threshold. Switching position:sticky to position:relative here
      // made the title suddenly jump away on iPad after the first scroll stop.
      // The smaller collapsed hero and scroll padding leave room for reading.

      // Continuous crop of the ORIGINAL photograph; font, badges, positions,
      // source image and image scaling stay exactly the same.
      let crop = Math.min(naturalHeight - minimumHeight, Math.max(0, scroller.scrollTop));
      const caption = hero.querySelector('.pc-photo-caption');
      if (caption instanceof HTMLElement && caption.getBoundingClientRect().height > 0) {
        // The dated caption is counter-translated by CSS. Reserve its real
        // height before moving the quiz/title/meta upward; otherwise the date
        // stays inside the photo but overlaps those controls after collapse.
        const currentCrop = parseFloat(card.style.getPropertyValue('--pc-hero-collapse-offset')) || 0;
        const captionBounds = caption.getBoundingClientRect();
        const textTops = [
          hero.querySelector('#pcStatusBar > .pc-progress-status-line'),
          headingRow,
          hero.querySelector('#pcMeta')
        ].filter(node => node instanceof HTMLElement)
          .map(node => node.getBoundingClientRect())
          .filter(bounds => bounds.width > 0 && bounds.height > 0)
          .map(bounds => bounds.top);
        if (textTops.length) {
          const readableCrop = Math.max(0, currentCrop + Math.min(...textTops) - captionBounds.bottom - 8);
          crop = Math.min(crop, readableCrop);
        }
      }
      const visible = naturalHeight - crop;
      const value = visible + "px";
      if (card.style.getPropertyValue("--pc-visible-hero-height") !== value) {
        card.style.setProperty("--pc-visible-hero-height", value);
      }
      const offset = crop + "px";
      if (card.style.getPropertyValue("--pc-hero-collapse-offset") !== offset) {
        card.style.setProperty("--pc-hero-collapse-offset", offset);
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

      // Pinned CSS fixes the previous hero height. Release it when the place,
      // width or wrapped title row changes so the next heading is measured at
      // its own natural height, rather than clipped inside the previous one.
      const layout = [card.dataset.currentPlaceId || "", hero.clientWidth,
        headingRow?.scrollHeight || title.scrollHeight].join("|");
      if (layout !== measuredLayout) {
        release();
        measuredLayout = layout;
      }
      shellHero = owningHero;
      // The image retains its natural layout height independently of the
      // sticky wrapper, which only reveals less of the image from the bottom.
      const height = Math.ceil(hero.getBoundingClientRect().height);
      if (!height) return;
      const bounds = owningHero.getBoundingClientRect();
      const headingBounds = hero.getBoundingClientRect();
      // The layout slot stays full height while only its bottom is clipped.
      // A fixed 46% minimum can clip the real title above the visible photo
      // when category/epoch text wraps on a narrow phone. Calculate the
      // maximum safe crop from the title's actual top edge instead.
      naturalHeight = Math.ceil(Math.max(height, hero.offsetHeight)
        + Math.max(0, headingBounds.top - bounds.top));
      const currentCrop = parseFloat(card.style.getPropertyValue("--pc-hero-collapse-offset")) || 0;
      // The heading content was moved by -currentCrop after a prior scroll.
      // Undo that movement for a stable measurement during resize/remeasure.
      const titleTop = title.getBoundingClientRect().top - headingBounds.top + currentCrop;
      const safeCrop = Math.max(0, titleTop - 12);
      minimumHeight = Math.min(naturalHeight, Math.max(
        96,
        Math.ceil(naturalHeight * 0.46),
        naturalHeight - safeCrop
      ));
      card.style.setProperty("--pc-original-hero-height", height + "px");
      card.classList.add("is-original-photo-pinned");
      // On a short Place Sheet the initial hero + 3:4 QuizCard may be taller
      // than the scroll pane. Provide only the missing scroll range needed to
      // reveal the *entire* card below the compact sticky heading. Preserve
      // the original content height to prevent scrollTop feedback and jumps.
      const flip = card.querySelector("#pcFrontCardFlip");
      if (window.innerWidth >= 721 && flip instanceof HTMLElement && flip.getBoundingClientRect().height > 0) {
        const previousRunway = parseFloat(card.style.getPropertyValue("--pc-reader-runway")) || 0;
        const topInScrollContent = flip.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top + scroller.scrollTop;
        const targetScroll = Math.max(0, Math.ceil(topInScrollContent - minimumHeight - 14));
        const ordinaryMaxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight - previousRunway);
        const requiredRunway = Math.max(0, targetScroll - ordinaryMaxScroll);
        if (Math.abs(requiredRunway - previousRunway) > 1) {
          card.style.setProperty("--pc-reader-runway", requiredRunway + "px");
        }
      } else {
        card.style.removeProperty("--pc-reader-runway");
      }
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
