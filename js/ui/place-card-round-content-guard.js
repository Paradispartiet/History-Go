// js/ui/place-card-round-content-guard.js
// Round content belongs in popups/specialized surfaces, never as an inline text block
// below the PlaceCard. Canonical round identity is owned exclusively by
// data/places/README_place_rounds.md and js/ui/place-rounds-visual-collections.js.
(function () {
  "use strict";

  // Includes legacy list IDs only so old DOM cannot leak inline content back into
  // PlaceCard while migration debt still exists elsewhere in the template/runtime.
  const FALLBACK_ROUND_LIST_IDS = Object.freeze([
    "pcPeopleList",
    "pcBadgesList",
    "pcObjectsList",
    "pcBrandsList",
    "pcFloraList",
    "pcFaunaList",
    "pcNatureList",
    "pcWorksList",
    "pcDetailsList",
    "pcSpotsList",
    "pcTasksList",
    "pcCivicationStoreList",
    "pcForNaList",
    "pcFortellingerList",
    "pcLeksikonList",
    "pcPlayList",
    "pcTrainingList"
  ]);

  let observer = null;

  function s(value) { return String(value ?? "").trim(); }
  function unique(values) { return [...new Set(values.map(s).filter(Boolean))]; }

  function getRoundListIds() {
    const registryIds = Array.isArray(window.HGPlaceRounds?.registry)
      ? window.HGPlaceRounds.registry.map(def => def?.listId)
      : [];
    const visualRegistryIds = Array.isArray(window.HGVisualPlaceRounds?.registry)
      ? window.HGVisualPlaceRounds.registry.map(def => def?.listId)
      : [];
    return unique([...registryIds, ...visualRegistryIds, ...FALLBACK_ROUND_LIST_IDS]);
  }

  function hideInlineRoundLists() {
    for (const id of getRoundListIds()) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (!el.hidden) el.hidden = true;
      if (el.getAttribute("aria-hidden") !== "true") el.setAttribute("aria-hidden", "true");
      if (el.classList.contains("is-open")) el.classList.remove("is-open");
    }
  }

  function patchOpenPlaceCard() {
    const original = window.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__roundContentGuardPatched) return true;
    const patched = async function guardedOpenPlaceCard(...args) {
      hideInlineRoundLists();
      const result = await original.apply(this, args);
      hideInlineRoundLists();
      return result;
    };
    patched.__roundContentGuardPatched = true;
    patched.__roundContentGuardOriginal = original;
    window.openPlaceCard = patched;
    return true;
  }

  function observePlaceCard() {
    const card = document.getElementById("placeCard");
    if (!card || observer) return;
    observer = new MutationObserver(() => hideInlineRoundLists());
    observer.observe(card, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "hidden"]
    });
  }

  function init() {
    hideInlineRoundLists();
    observePlaceCard();
    if (!patchOpenPlaceCard()) {
      let attempts = 0;
      const retry = window.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 80) window.clearInterval(retry);
      }, 100);
    }
  }

  window.HGPlaceCardRoundContentGuard = { hideInlineRoundLists, patchOpenPlaceCard };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  window.addEventListener("hg:appReady", () => {
    hideInlineRoundLists();
    observePlaceCard();
    patchOpenPlaceCard();
  });
})();
