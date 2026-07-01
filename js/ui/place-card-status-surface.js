// js/ui/place-card-status-surface.js
// Read-only PlaceCard status surface.
// Uses HGProfileProgressReader; writes no progress and changes no gameplay.
(function (global) {
  "use strict";

  const BOUND_FLAG = "__HG_PLACE_CARD_STATUS_SURFACE_BOUND__";
  const ROW_ATTR = "data-pc-progress-status";

  function getReader() {
    return global.HGProfileProgressReader || null;
  }

  function safeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function statusLabel(summary) {
    if (summary?.status === "completed") return "Fullført";
    if (summary?.quizCompleted) return "Quiz fullført";
    if (summary?.visited) return "Besøkt";
    return "Ikke fullført";
  }

  function isVisibleAction(id) {
    const el = document.getElementById(id);
    if (!el || el.hidden || el.disabled) return false;
    const style = global.getComputedStyle ? global.getComputedStyle(el) : null;
    if (style && (style.display === "none" || style.visibility === "hidden")) return false;
    return true;
  }

  function remainingActionLabel(summary) {
    if (summary?.nextAction === "completed") return "Ferdig her";
    if (!summary?.quizCompleted && isVisibleAction("pcQuiz")) return "Gjenstår: Ta quiz";
    if (isVisibleAction("pcUnlock")) return "Gjenstår: Lås opp";
    if (isVisibleAction("pcObserve")) return "Gjenstår: Observer";
    if (isVisibleAction("pcRoute")) return "Gjenstår: Følg rute";
    return "Gjenstår: Utforsk videre";
  }

  function renderStatus(place) {
    const reader = getReader();
    const metaEl = document.getElementById("pcMeta");
    if (!reader || !metaEl || !place) return;

    const placeId = safeText(place.id || place.placeId);
    if (!placeId) return;

    const summary = reader.getPlaceProgressSummary(placeId, {
      category: safeText(place.category || place.categoryId)
    });

    const parts = [statusLabel(summary)];
    if (summary.favorite) parts.push("Favoritt");
    parts.push(remainingActionLabel(summary));

    let row = metaEl.querySelector(`[${ROW_ATTR}]`);
    if (!row) {
      row = document.createElement("div");
      row.setAttribute(ROW_ATTR, "1");
      row.className = "pc-progress-status-line";
      metaEl.appendChild(row);
    }

    row.textContent = `Status: ${parts.join(" · ")}`;
    row.dataset.status = safeText(summary.status || "unknown");
    row.dataset.visited = summary.visited ? "1" : "0";
    row.dataset.quizCompleted = summary.quizCompleted ? "1" : "0";
    row.dataset.favorite = summary.favorite ? "1" : "0";
  }

  function loadNearbyStatusSurface() {
    if (global.__HG_NEARBY_STATUS_SURFACE_SCRIPT_REQUESTED__) return;
    if (global.HGNearbyStatusSurface) return;
    if (document.querySelector('script[src="js/ui/nearby-status-surface.js"]')) return;

    global.__HG_NEARBY_STATUS_SURFACE_SCRIPT_REQUESTED__ = true;
    const script = document.createElement("script");
    script.src = "js/ui/nearby-status-surface.js";
    script.defer = true;
    document.body.appendChild(script);
  }

  function install() {
    if (global[BOUND_FLAG]) return true;
    if (typeof global.openPlaceCard !== "function") return false;

    const original = global.openPlaceCard;
    global.openPlaceCard = async function openPlaceCardWithStatusSurface(place) {
      const result = await original.apply(this, arguments);
      try { renderStatus(place); } catch (error) {
        if (global.DEBUG) console.warn("[place-card-status-surface]", error);
      }
      return result;
    };

    global[BOUND_FLAG] = true;
    global.HGPlaceCardStatusSurface = { render: renderStatus };
    loadNearbyStatusSurface();
    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window);
