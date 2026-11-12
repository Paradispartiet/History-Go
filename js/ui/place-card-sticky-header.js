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
      shellHero = null;
      naturalHeight = 0;
      minimumHeight = 0;
    }

    function renderScroll() {
      frameScheduled = false;
      if (!shellHero || !naturalHeight || !card.classList.contains("is-original-photo-pinned")) return;
      // On desktop, the sticky photograph must yield when someone reads below
      // it. Otherwise a tall hero covers the native QuizCard pointer target.
      // Retain the pinned initial overview and historical source caption; keep
      // the hero unpinned until the reader has returned almost to the top.
      // Mobile retains the existing pinned-photo behavior.
      const quizAvailable = window.innerWidth >= 721 &&
        card.querySelector("#pcFrontCardFlip.has-quiz-card") instanceof HTMLElement;
      const releaseAt = Math.max(280, Math.min(350, Math.round(naturalHeight * 0.55)));
      const reading = card.classList.contains("is-quizcard-reading");
      card.classList.toggle("is-quizcard-reading", quizAvailable &&
        (reading ? scroller.scrollTop > 48 : scroller.scrollTop >= releaseAt));

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
      // The former minimum-height calculation used the title's bottom edge.
      // With a bottom-aligned heading that prevents nearly all collapse.
      // Show roughly the upper half of the original photograph when scrolled;
      // shift the original heading contents up alongside the cropped edge.
      naturalHeight = Math.ceil(Math.max(height, hero.offsetHeight)
        + Math.max(0, headingBounds.top - bounds.top));
      const titleHeight = Math.ceil(title.getBoundingClientRect().height);
      minimumHeight = Math.min(naturalHeight, Math.max(
        96,
        Math.ceil(naturalHeight * 0.53),
        titleHeight + 18
      ));
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
