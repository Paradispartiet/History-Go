// js/ui/nearby-status-surface.js
// Read-only Nearby/Favorites status surface.
// Uses HGProfileProgressReader and annotates existing rendered cards after render.
// Local item work uses "Gjenstår"; "Neste" belongs to NextUp.
(function (global) {
  "use strict";

  const BOUND_FLAG = "__HG_NEARBY_STATUS_SURFACE_BOUND__";
  const STATUS_ATTR = "data-progress-status";

  function normalize(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeKey(value) {
    return normalize(value).toLowerCase();
  }

  function reader() {
    return global.HGProfileProgressReader || null;
  }

  function buildPlaceLookup() {
    const places = Array.isArray(global.PLACES) ? global.PLACES : [];
    const byKey = new Map();
    places.forEach((place) => {
      const keys = [place?.id, place?.name, place?.title]
        .map(normalizeKey)
        .filter(Boolean);
      keys.forEach((key) => {
        if (!byKey.has(key)) byKey.set(key, place);
      });
    });
    return byKey;
  }

  function statusLabel(summary) {
    if (summary?.status === "completed") return "Fullført";
    if (summary?.quizCompleted) return "Quiz fullført";
    if (summary?.visited) return "Besøkt";
    return "Ikke fullført";
  }

  function remainingActionLabel(summary) {
    if (summary?.nextAction === "completed") return "Ferdig";
    if (summary?.nextAction === "quiz") return "Gjenstår: Ta quiz";
    return "Gjenstår: Åpne";
  }

  function findPlaceForItem(item, lookup) {
    const explicitId = normalizeKey(item?.dataset?.placeId);
    if (explicitId && lookup.has(explicitId)) return lookup.get(explicitId);

    const title = normalizeKey(item?.querySelector?.(".nearby-title")?.textContent);
    if (title && lookup.has(title)) return lookup.get(title);

    return null;
  }

  function appendStatusToMeta(item, place) {
    const progress = reader();
    if (!progress || !item || !place) return;

    const placeId = normalize(place.id || place.placeId);
    if (!placeId) return;

    const summary = progress.getPlaceProgressSummary(placeId, {
      category: normalize(place.category || place.categoryId)
    });

    item.dataset.placeId = placeId;
    item.dataset.progressStatus = normalize(summary.status || "unknown");
    item.dataset.progressVisited = summary.visited ? "1" : "0";
    item.dataset.progressQuizCompleted = summary.quizCompleted ? "1" : "0";
    item.dataset.progressFavorite = summary.favorite ? "1" : "0";

    let meta = item.querySelector(".nearby-meta");
    if (!meta) {
      const content = item.querySelector(".nearby-content");
      if (!content) return;
      meta = document.createElement("div");
      meta.className = "nearby-meta";
      content.appendChild(meta);
    }

    const existing = normalize(meta.textContent)
      .split("·")
      .map(part => normalize(part))
      .filter(Boolean)
      .filter(part => ![
        "Ikke startet",
        "Ikke fullført",
        "Besøkt",
        "Quiz fullført",
        "Fullført",
        "Start",
        "Quiz neste",
        "Ferdig",
        "Gjenstår: Åpne",
        "Gjenstår: Ta quiz"
      ].includes(part));

    existing.push(statusLabel(summary));
    existing.push(remainingActionLabel(summary));
    if (summary.favorite && !existing.includes("Favoritt")) existing.push("Favoritt");

    meta.textContent = existing.join(" · ");
    meta.setAttribute(STATUS_ATTR, "1");
  }

  function annotateList(listId) {
    const progress = reader();
    const list = document.getElementById(listId);
    if (!progress || !list) return;

    const lookup = buildPlaceLookup();
    list.querySelectorAll(".nearby-item").forEach((item) => {
      const place = findPlaceForItem(item, lookup);
      appendStatusToMeta(item, place);
    });
  }

  function annotateAll() {
    annotateList("nearbyList");
    annotateList("leftFavoritesList");
  }

  function wrapRender(name, after) {
    const original = global[name];
    if (typeof original !== "function" || original.__hgNearbyStatusWrapped) return false;

    const wrapped = function wrappedNearbyStatusSurface() {
      const result = original.apply(this, arguments);
      try { after(); } catch (error) {
        if (global.DEBUG) console.warn("[nearby-status-surface]", error);
      }
      return result;
    };
    wrapped.__hgNearbyStatusWrapped = true;
    global[name] = wrapped;
    return true;
  }

  function install() {
    if (global[BOUND_FLAG]) return true;
    const nearbyWrapped = wrapRender("renderNearbyPlaces", () => annotateList("nearbyList"));
    const favoritesWrapped = wrapRender("renderLeftFavoritesList", () => annotateList("leftFavoritesList"));
    if (!nearbyWrapped && !favoritesWrapped) return false;

    global[BOUND_FLAG] = true;
    global.HGNearbyStatusSurface = { annotateAll, annotateList };
    try { annotateAll(); } catch {}
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
