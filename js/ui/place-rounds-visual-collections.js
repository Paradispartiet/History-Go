// js/ui/place-rounds-visual-collections.js
// Presentasjonskontrakt: rundinger er visuelle samlinger, ikke kunnskapsfaner eller handlingsmenyer.
(function installVisualPlaceRounds(global) {
  "use strict";

  const VISUAL_ROUND_IDS = Object.freeze(["people", "nature", "badges", "works", "civication", "brands"]);
  const VISUAL_SET = new Set(VISUAL_ROUND_IDS);
  const LEGACY_NON_VISUAL_ICON_IDS = Object.freeze([
    "pcForNaIcon",
    "pcFortellingerIcon",
    "pcLeksikonIcon",
    "pcPlayIcon",
    "pcTrainingIcon",
    "pcTasksIcon",
    "pcWonderkammerIcon",
    "pcStoriesIcon",
    "pcRoutesIcon"
  ]);

  let observer = null;

  function currentPlace() {
    const id = String(document.getElementById("placeCard")?.dataset?.currentPlaceId || "").trim();
    if (!id) return null;
    return (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => String(place?.id || "").trim() === id) || null;
  }

  function visibleVisualIds(place) {
    const definitions = typeof global.HGPlaceRounds?.get === "function"
      ? global.HGPlaceRounds.get(place)
      : [];
    return new Set((Array.isArray(definitions) ? definitions : []).map(def => String(def?.id || "").trim()).filter(id => VISUAL_SET.has(id)));
  }

  function applyVisualPolicy(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card) return;
    card.dataset.roundMode = "visual-collections";

    const registry = Array.isArray(global.HGPlaceRounds?.registry) ? global.HGPlaceRounds.registry : [];
    const allowed = place ? visibleVisualIds(place) : new Set();

    for (const def of registry) {
      const id = String(def?.id || "").trim();
      const icon = document.getElementById(def?.iconId);
      if (!icon) continue;
      if (!VISUAL_SET.has(id)) {
        if (!icon.hidden) icon.hidden = true;
        icon.setAttribute("aria-hidden", "true");
        icon.dataset.roundSurface = "moved-to-place-popup";
        continue;
      }

      // Ikke overstyr kategori-, rounds_exclude- eller innholdslogikken som allerede
      // har skjult en visuell runding. Vi snevrer bare inn den eksisterende flaten.
      if (allowed.has(id) && !icon.hidden) {
        icon.removeAttribute("aria-hidden");
        icon.dataset.roundSurface = "visual-collection";
      }
    }

    for (const iconId of LEGACY_NON_VISUAL_ICON_IDS) {
      const icon = document.getElementById(iconId);
      if (!icon) continue;
      if (!icon.hidden) icon.hidden = true;
      icon.setAttribute("aria-hidden", "true");
      icon.dataset.roundSurface = "moved-to-place-popup";
    }

    const grid = card.querySelector(".pc-icons-quad");
    if (grid) grid.dataset.roundMode = "visual-collections";
  }

  function patchPublicRoundApi() {
    const api = global.HGPlaceRounds;
    if (!api || api.__visualCollectionsPatched) return;
    const originalGet = typeof api.get === "function" ? api.get.bind(api) : null;
    const originalApply = typeof api.apply === "function" ? api.apply.bind(api) : null;

    if (originalGet) {
      api.getVisual = place => (originalGet(place) || []).filter(def => VISUAL_SET.has(String(def?.id || "").trim()));
    }
    if (originalApply) {
      api.applyVisual = place => {
        originalApply(place);
        applyVisualPolicy(place);
      };
    }
    api.visualIds = [...VISUAL_ROUND_IDS];
    api.__visualCollectionsPatched = true;
  }

  function observe() {
    const card = document.getElementById("placeCard");
    if (!card || observer) return;
    observer = new MutationObserver(() => applyVisualPolicy());
    observer.observe(card, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden", "class", "data-current-place-id"]
    });
  }

  function init() {
    patchPublicRoundApi();
    applyVisualPolicy();
    observe();
  }

  global.HGVisualPlaceRounds = {
    ids: [...VISUAL_ROUND_IDS],
    apply: applyVisualPolicy
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.addEventListener?.("hg:appReady", init);
})(window);
