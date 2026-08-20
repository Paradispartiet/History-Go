// History Go — Min samling → canonical main-map bridge.
// Reads transient URL intent only. No collection or navigation store is created.
(function installPersonalCollectionMapBridge(global) {
  "use strict";

  if (global.__HG_PERSONAL_COLLECTION_MAP_BRIDGE__) return;
  global.__HG_PERSONAL_COLLECTION_MAP_BRIDGE__ = true;

  const params = new URLSearchParams(global.location?.search || "");
  const wantsNextUp = params.get("nextup") === "1";
  const collectionPlaceId = String(params.get("collectionPlace") || "").trim();
  if (!wantsNextUp && !collectionPlaceId) return;

  let nextUpDone = !wantsNextUp;
  let placeDone = !collectionPlaceId;
  let attempts = 0;
  const MAX_ATTEMPTS = 30;

  function clearConsumedParams() {
    if (!nextUpDone || !placeDone) return;
    try {
      const url = new URL(global.location.href);
      url.searchParams.delete("nextup");
      url.searchParams.delete("collectionPlace");
      global.history?.replaceState?.(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {}
  }

  function openCollectionPlace() {
    if (placeDone) return true;
    const id = collectionPlaceId;
    if (!id) {
      placeDone = true;
      return true;
    }

    try {
      if (typeof global.HGMapView?.showMap === "function") global.HGMapView.showMap();
      if (typeof global.HGMapView?.openPlace === "function" && global.HGMapView.openPlace(id)) {
        placeDone = true;
        return true;
      }
    } catch {}

    const place = (Array.isArray(global.PLACES) ? global.PLACES : []).find(row => String(row?.id || "").trim() === id);
    if (place && typeof global.openPlaceCard === "function") {
      global.openPlaceCard(place);
      placeDone = true;
      return true;
    }
    return false;
  }

  function openCanonicalNextUp() {
    if (nextUpDone) return true;
    const panel = document.getElementById("footerNextUpPanel");
    const button = document.getElementById("pcNextUpBtn");
    if (!panel || !button || typeof global.toggleFooterNextUp !== "function") return false;
    if (!panel.classList.contains("is-open")) global.toggleFooterNextUp();
    nextUpDone = true;
    return true;
  }

  function tryApply() {
    attempts += 1;
    openCollectionPlace();
    openCanonicalNextUp();
    clearConsumedParams();
    if ((!nextUpDone || !placeDone) && attempts < MAX_ATTEMPTS) {
      global.setTimeout(tryApply, attempts < 8 ? 180 : 400);
    }
  }

  global.addEventListener?.("hg:appReady", () => global.setTimeout(tryApply, 0), { once: true });
  global.addEventListener?.("load", () => global.setTimeout(tryApply, 0), { once: true });
  global.setTimeout(tryApply, 250);
})(window);
