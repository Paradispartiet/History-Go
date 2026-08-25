// js/ui/micro-place-card.js
// Compact presentation layer for canonical placeTier="micro" places.
(function installMicroPlaceCard(global) {
  "use strict";

  const s = (value) => String(value == null ? "" : value).trim();
  const MICRO_HIDDEN = "microPlaceHidden";
  let observer = null;
  let scheduled = false;

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? (Array.isArray(global.PLACES) ? global.PLACES : []).find((place) => s(place?.id) === id) || null : null;
  }
  function isMicro(place) { return place?.placeTier === "micro"; }
  function hasOwnQuiz(place) { return place?.micro_place_profile?.quizMode === "place"; }

  function hideOwned(el) {
    if (!el) return;
    el.dataset[MICRO_HIDDEN] = "1";
    if (!el.hidden) el.hidden = true;
    el.setAttribute("aria-hidden", "true");
  }
  function restoreOwned(el) {
    if (!el || el.dataset[MICRO_HIDDEN] !== "1") return;
    delete el.dataset[MICRO_HIDDEN];
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
  }

  function apply(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card || !place) return;
    const grid = card.querySelector(".pc-icons-quad");
    const badge = document.getElementById("pcBadgesIcon");
    const quiz = document.getElementById("pcQuiz");

    if (!isMicro(place)) {
      card.classList.remove("pc-micro-place");
      delete card.dataset.placeTier;
      restoreOwned(grid);
      restoreOwned(badge);
      restoreOwned(quiz);
      return;
    }

    card.classList.add("pc-micro-place");
    card.dataset.placeTier = "micro";
    hideOwned(grid);
    hideOwned(badge);
    if (hasOwnQuiz(place)) restoreOwned(quiz);
    else hideOwned(quiz);
  }

  function schedule(place) {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      apply(place || currentPlace());
      global.setTimeout?.(() => apply(place || currentPlace()), 40);
    };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run);
    else global.setTimeout(run, 0);
  }

  function patchOpenPlaceCard() {
    const original = global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__microPlaceCardPatched) return true;
    const patched = async function openPlaceCardWithMicroTier(place) {
      const result = await original.apply(this, arguments);
      schedule(place);
      return result;
    };
    patched.__microPlaceCardPatched = true;
    global.openPlaceCard = patched;
    return true;
  }

  function observeOwnedSurface() {
    if (observer || typeof global.MutationObserver !== "function") return;
    const card = document.getElementById("placeCard");
    if (!card) return;
    observer = new global.MutationObserver(() => {
      const place = currentPlace();
      if (!isMicro(place)) return;
      const grid = card.querySelector(".pc-icons-quad");
      const badge = document.getElementById("pcBadgesIcon");
      const quiz = document.getElementById("pcQuiz");
      if ((grid && !grid.hidden) || (badge && !badge.hidden) || (quiz && !hasOwnQuiz(place) && !quiz.hidden)) schedule(place);
    });
    observer.observe(card, { subtree: true, attributes: true, attributeFilter: ["hidden", "aria-hidden"] });
  }

  function init() {
    patchOpenPlaceCard();
    observeOwnedSurface();
    schedule();
    if (typeof global.openPlaceCard !== "function") {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 80) global.clearInterval(timer);
      }, 100);
    }
  }

  global.HGMicroPlaceCard = { apply, isMicro, hasOwnQuiz };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated"].forEach((name) => global.addEventListener?.(name, () => schedule()));
})(window);
