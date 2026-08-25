// js/ui/place-card-status-surface.js
// Read-only PlaceCard status surface.
// Uses HGProfileProgressReader; writes no progress and changes no gameplay.
(function (global) {
  "use strict";

  const BOUND_FLAG = "__HG_PLACE_CARD_STATUS_SURFACE_BOUND__";
  const ROW_ATTR = "data-pc-progress-status";
  let currentPlace = null;

  function getReader() {
    return global.HGProfileProgressReader || null;
  }

  function safeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function ensureStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    document.head.appendChild(stylesheet);
  }

  function ensureScript(src) {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && existing.type !== "application/x-history-go-deferred") return;
    existing?.remove();
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadPlacePopupV2() {
    ensureStylesheet("css/place-popup-v2.css");
    if (!global.__HG_PLACE_POPUP_V2_INSTALLED__) ensureScript("js/ui/place-popup-v2.js");
    ensureScript("js/ui/place-popup-sport-training.js");
    ensureStylesheet("css/place-popup-tabs.css");
    ensureScript("js/ui/place-popup-tabs.js");
    ensureScript("js/ui/place-popup-direct-tabs.js");
    ensureScript("js/ui/nature-detailed-map.js");
    ensureScript("js/ui/place-rounds-visual-collections.js");
    ensureScript("js/ui/place-collection-knowledge-routing.js");
    ensureStylesheet("css/place-rounds-fill-layout.css");
    ensureScript("js/ui/place-rounds-fill-layout.js");
    ensureStylesheet("css/place-popup-shortcuts.css");
    ensureScript("js/ui/place-popup-shortcuts.js");
    ensureStylesheet("css/place-onsite-surface.css");
    ensureScript("js/ui/place-onsite-surface.js");
  }

  function loadPlaceLearningSurface() {
    // Canonical politics data is shared by popup, fagverk and place pages.
    ensureScript("js/politikk-fag-model.js");
    ensureScript("js/ui/place-learning-canonical.js");
    if (global.__HG_PLACE_LEARNING_SURFACE_SCRIPT_REQUESTED__) return;
    if (global.HGPlaceLearningSurface) return;
    if (document.querySelector('script[src="js/ui/place-learning-surface.js"]')) return;
    global.__HG_PLACE_LEARNING_SURFACE_SCRIPT_REQUESTED__ = true;
    const script = document.createElement("script");
    script.src = "js/ui/place-learning-surface.js";
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadRoundContentGuard() {
    if (
      global.HGPlaceCardRoundContentGuard ||
      global.__HG_PLACE_CARD_ROUND_CONTENT_GUARD_REQUESTED__ ||
      document.querySelector('script[src="js/ui/place-card-round-content-guard.js"]')
    ) return;
    global.__HG_PLACE_CARD_ROUND_CONTENT_GUARD_REQUESTED__ = true;
    const script = document.createElement("script");
    script.src = "js/ui/place-card-round-content-guard.js";
    script.defer = true;
    document.body.appendChild(script);
  }

  function statusLabel(summary) {
    if (summary?.status === "completed") return "Fullført";
    if (summary?.quizCompleted) return "Quiz fullført";
    if (summary?.visited) return "Besøkt";
    return "Ikke fullført";
  }

  function isShownAction(id) {
    const el = document.getElementById(id);
    if (!el || el.hidden) return false;
    const style = global.getComputedStyle ? global.getComputedStyle(el) : null;
    return !(style && (style.display === "none" || style.visibility === "hidden"));
  }

  function isVisibleAction(id) {
    const el = document.getElementById(id);
    return !!el && !el.disabled && isShownAction(id);
  }

  function remainingActionLabel(summary) {
    if (summary?.nextAction === "completed") return "Ferdig her";
    if (summary?.nextAction === "visit" && isShownAction("pcVisit")) return "Gjenstår: Registrer besøk";
    if (!summary?.quizCompleted && isVisibleAction("pcQuiz")) return "Gjenstår: Ta quiz";
    if (isShownAction("pcVisit")) return "Gjenstår: Registrer besøk";
    if (isVisibleAction("pcObserve")) return "Gjenstår: Observer";
    if (isVisibleAction("pcRoute")) return "Gjenstår: Følg rute";
    return "Gjenstår: Utforsk videre";
  }

  function activateStatus(summary) {
    if (!summary?.quizCompleted && isVisibleAction("pcQuiz")) {
      document.getElementById("pcQuiz")?.click();
      return;
    }
    if (summary?.nextAction === "visit") {
      if (isVisibleAction("pcVisit")) {
        document.getElementById("pcVisit")?.click();
        return;
      }
      if (isVisibleAction("pcRoute")) {
        document.getElementById("pcRoute")?.click();
        return;
      }
    }
    if (isVisibleAction("pcObserve")) {
      document.getElementById("pcObserve")?.click();
      return;
    }
    global.location.href = "profile.html#collectionCardsSection";
  }

  function renderStatus(place) {
    const reader = getReader();
    const metaEl = document.getElementById("pcMeta");
    if (!reader || !metaEl || !place) return null;

    currentPlace = place;
    const placeId = safeText(place.id || place.placeId);
    if (!placeId) return null;

    const summary = reader.getPlaceProgressSummary(placeId, {
      category: safeText(place.category || place.categoryId)
    });
    const parts = [statusLabel(summary)];
    if (summary.favorite) parts.push("Favoritt");
    parts.push(remainingActionLabel(summary));

    let row = /** @type {HTMLButtonElement|null} */ (metaEl.querySelector(`[${ROW_ATTR}]`));
    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.setAttribute(ROW_ATTR, "1");
      row.className = "pc-progress-status-line";
      metaEl.appendChild(row);
    }
    row.textContent = `Status: ${parts.join(" · ")}`;
    row.setAttribute("aria-label", `${row.textContent}. Åpne neste handling.`);
    row.title = "Åpne neste handling";
    row.dataset.status = safeText(summary.status || "unknown");
    row.dataset.visited = summary.visited ? "1" : "0";
    row.dataset.quizCompleted = summary.quizCompleted ? "1" : "0";
    row.dataset.favorite = summary.favorite ? "1" : "0";
    row.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      activateStatus(summary);
    };
    return row;
  }

  function currentOpenPlace() {
    const placeId = safeText(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    if (!placeId || !Array.isArray(global.PLACES)) return null;
    return global.PLACES.find((place) => safeText(place?.id) === placeId) || null;
  }

  function loadNearbyStatusSurface() {
    if (
      global.__HG_NEARBY_STATUS_SURFACE_SCRIPT_REQUESTED__ ||
      global.HGNearbyStatusSurface ||
      document.querySelector('script[src="js/ui/nearby-status-surface.js"]')
    ) return;
    global.__HG_NEARBY_STATUS_SURFACE_SCRIPT_REQUESTED__ = true;
    const script = document.createElement("script");
    script.src = "js/ui/nearby-status-surface.js";
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadAreaOverviewSurface() {
    if (
      global.__HG_AREA_OVERVIEW_SCRIPT_REQUESTED__ ||
      global.HGAreaOverview ||
      document.querySelector('script[src="js/ui/area-overview.js"]')
    ) return;
    global.__HG_AREA_OVERVIEW_SCRIPT_REQUESTED__ = true;
    const script = document.createElement("script");
    script.src = "js/ui/area-overview.js";
    script.defer = true;
    script.addEventListener("load", () => {
      if (document.querySelector('script[src="js/ui/area-overview-scroll.js"]')) return;
      const scrollScript = document.createElement("script");
      scrollScript.src = "js/ui/area-overview-scroll.js";
      scrollScript.defer = true;
      document.body.appendChild(scrollScript);
    }, { once: true });
    document.body.appendChild(script);
  }

  function install() {
    if (global[BOUND_FLAG]) return true;
    if (typeof global.openPlaceCard !== "function") return false;

    const original = global.openPlaceCard;
    global.openPlaceCard = async function openPlaceCardWithStatusSurface(place) {
      const result = await original.apply(this, arguments);
      try {
        renderStatus(place);
      } catch (error) {
        if (global.DEBUG) console.warn("[place-card-status-surface]", error);
      }
      return result;
    };

    global[BOUND_FLAG] = true;
    global.HGPlaceCardStatusSurface = { render: renderStatus };
    for (const eventName of ["hg:physicalVisitRegistered", "hg:quizCompleted"]) {
      global.addEventListener?.(eventName, () => {
        if (currentPlace) renderStatus(currentPlace);
      });
    }

    // If a place was opened before this module became available, render the
    // status immediately instead of waiting for the user to reopen the card.
    const openPlace = currentOpenPlace();
    if (openPlace) renderStatus(openPlace);

    loadNearbyStatusSurface();
    loadAreaOverviewSurface();
    return true;
  }

  loadPlacePopupV2();
  loadPlaceLearningSurface();
  loadRoundContentGuard();
  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window);
