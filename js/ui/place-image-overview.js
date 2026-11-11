/* Keep the matte synchronized with the actual rendered place photograph.
   This file does not resize, crop, navigate, or intercept user input. */
(() => {
  "use strict";

  const selectors = [
    { image: "#pcHeaderImage", owner: ".pc-heading-hero" },
    { image: "#pcFrontImage", owner: ".pc-card-face-front" },
    { image: ".hg-place-popup-v2 .hg-place-hero-image", owner: ".hg-place-hero-media" }
  ];
  const imageSelector = selectors.map(item => item.image).join(", ");

  function update(image) {
    if (!(image instanceof HTMLImageElement)) return;
    const binding = selectors.find(item => image.matches(item.image));
    if (!binding) return;
    const owner = image.closest(binding.owner);
    if (!(owner instanceof HTMLElement)) return;
    const source = image.currentSrc || image.src;
    const isReady = Boolean(source && image.complete && image.naturalWidth > 0 && !image.hidden);
    if (!isReady) {
      owner.style.removeProperty("--hg-place-overview-backdrop");
      return;
    }
    // JSON.stringify yields a quoted CSS url() argument and escapes quotes.
    owner.style.setProperty("--hg-place-overview-backdrop", `url(${JSON.stringify(source)})`);
  }

  function updateAll() {
    document.querySelectorAll(imageSelector).forEach(update);
  }

  function mount() {
    updateAll();

    // Capture loaded images even in the dynamically inserted popup surface.
    document.addEventListener("load", event => update(event.target), true);
    document.addEventListener("error", event => update(event.target), true);

    // Observe only photo src/hidden changes. Map markers and other dynamic UI
    // add thousands of DOM nodes; never rescan on those unrelated inserts.
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.target instanceof HTMLImageElement
            && record.target.matches(imageSelector)) update(record.target);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "hidden"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
