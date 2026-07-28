// js/ui/place-card-round-content-guard.js
// ------------------------------------------------------------
// Rundingsinnhold er datakilde for popupene, ikke en ekstra tekstflate
// under selve stedskortet. Natur-rundingen får hele naturinnholdet
// (profil, flora og fauna) fra pcNatureList.
// ------------------------------------------------------------
(function () {
  "use strict";

  const FALLBACK_ROUND_LIST_IDS = Object.freeze([
    "pcPeopleList",
    "pcNatureList",
    "pcWorksList",
    "pcBadgesList",
    "pcObjectsList",
    "pcDetailsList",
    "pcSpotsList",
    "pcTasksList",
    "pcCivicationStoreList",
    "pcBrandsList",
    "pcForNaList",
    "pcFortellingerList",
    "pcLeksikonList",
    "pcPlayList",
    "pcTrainingList"
  ]);

  let natureCaptureBound = false;
  let observer = null;

  function s(value) {
    return String(value ?? "").trim();
  }

  function unique(values) {
    return [...new Set(values.map(s).filter(Boolean))];
  }

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

  function getCurrentPlace() {
    const placeId = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!placeId) return null;
    return (Array.isArray(window.PLACES) ? window.PLACES : []).find(
      place => s(place?.id) === placeId
    ) || null;
  }

  async function openNatureRound(event) {
    const target = event.target instanceof Element
      ? event.target.closest("#pcNatureIcon")
      : null;
    if (!(target instanceof HTMLElement)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const place = getCurrentPlace();
    if (!place) return;

    try {
      if (typeof window.HGNaturePlaceMap?.applyToPlaceCard === "function") {
        await window.HGNaturePlaceMap.applyToPlaceCard(place);
      }
    } catch (error) {
      console.warn("[placeCardRoundContentGuard] Kunne ikke oppdatere naturinnhold", error);
    }

    hideInlineRoundLists();

    const natureEl = document.getElementById("pcNatureList");
    const profileFallback = typeof window.HGPlaceNatureProfile?.render === "function"
      ? window.HGPlaceNatureProfile.render(place)
      : "";
    const html = s(natureEl?.innerHTML) || profileFallback || '<div class="pc-empty">Ingen naturinnhold ennå</div>';

    if (typeof window.showPlaceCardRoundPopup === "function") {
      window.showPlaceCardRoundPopup({
        title: "Natur",
        subtitle: s(place.name || place.title),
        html,
        place,
        kind: "nature"
      });
    } else {
      window.showToast?.("Natur-rundingen er ikke lastet ennå");
    }
  }

  function bindNatureRoundCapture() {
    if (natureCaptureBound) return;
    natureCaptureBound = true;
    document.addEventListener("click", openNatureRound, true);
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
    bindNatureRoundCapture();
    observePlaceCard();

    if (!patchOpenPlaceCard()) {
      let attempts = 0;
      const retry = window.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 80) window.clearInterval(retry);
      }, 100);
    }
  }

  window.HGPlaceCardRoundContentGuard = {
    hideInlineRoundLists,
    patchOpenPlaceCard
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("hg:appReady", () => {
    hideInlineRoundLists();
    observePlaceCard();
    patchOpenPlaceCard();
  });
})();
