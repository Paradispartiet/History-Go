// js/views/MapView.js
// Tynt view-lag for index-appen. Flytter ikke DOM; styrer bare eksisterende kart/explore UI.

(function () {
  "use strict";

  /** @typedef {import("../../schemas/place").Place} Place */
  /** @typedef {{ showMap: () => void, show: () => void, cancelPendingPlaceNavigation: () => void, openPlace: (placeId?: unknown) => boolean, openQuiz: (targetId?: unknown) => boolean, openDebate: (debateId?: unknown) => boolean }} MapViewApi */

  function getPlaceCard() {
    return document.getElementById("placeCard");
  }

  function closeQuizModals() {
    const quizModal = document.getElementById("quizModal");
    if (quizModal) quizModal.remove();

    const summaryModal = document.getElementById("quizSummaryModal");
    if (summaryModal) summaryModal.remove();
  }

  function hidePlaceCardForMap() {
    const card = getPlaceCard();
    if (!card) return;

    card.setAttribute("aria-hidden", "true");
    card.dataset.currentPlaceId = "";

    if (typeof window.collapsePlaceCard === "function") {
      window.collapsePlaceCard();
    } else {
      card.classList.add("is-collapsed");
    }

    window.bottomSheetController?.hide?.();
  }

  // A pending navigation is deliberately kept here, beside the route view state.
  // Nearby, search and #/place routes must all wait for the same map completion
  // signal before they reveal a PlaceCard.
  let pendingPlaceNavigation = null;
  const PLACE_CENTER_TOLERANCE_DEGREES = 0.00015;

  function cancelPendingPlaceNavigation() {
    pendingPlaceNavigation = null;
  }

  /** @param {Place} place */
  function isMapCenteredOnPlace(map, place) {
    const center = map?.getCenter?.();
    const centerLon = Number(center?.lng ?? center?.lon);
    const centerLat = Number(center?.lat);
    return Number.isFinite(centerLon)
      && Number.isFinite(centerLat)
      && Math.abs(centerLon - place.lon) <= PLACE_CENTER_TOLERANCE_DEGREES
      && Math.abs(centerLat - place.lat) <= PLACE_CENTER_TOLERANCE_DEGREES;
  }

  function showExploreBase() {
    document.body?.classList.remove("hg-view-profile", "hg-view-civication", "hg-view-quiz");
    document.body?.classList.add("hg-view-map");

    if (window.LayerManager?.setMode) {
      window.LayerManager.setMode("explore");
    }

    window.setNearbyCollapsed?.(false);
    window.HGMap?.resize?.();
    window.MAP?.resize?.();
  }

  /** @param {unknown} placeId
   * @returns {Place | null}
   */
  function findPlace(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return null;

    return (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find((p) => String(p?.id || "").trim() === id) || null;
  }

  /**
   * Navigate to a place and open its card only when MapLibre reports that the
   * movement is complete. A newer selection invalidates any older moveend
   * callback, including one from an interrupted flyTo.
   *
   * @param {Place | null | undefined} place
   * @returns {boolean}
   */
  function navigateToPlace(place) {
    const map = window.HGMap?.getMap?.() || window.MAP;
    if (!map?.flyTo || !Number.isFinite(place?.lon) || !Number.isFinite(place?.lat)) return false;

    hidePlaceCardForMap();

    const pending = { place, id: String(place.id || "") };
    pendingPlaceNavigation = pending;
    const openWhenMapStops = () => {
      if (pendingPlaceNavigation !== pending) return;

      pendingPlaceNavigation = null;
      if (!isMapCenteredOnPlace(map, place)) return;
      void window.openPlaceCard?.(place);
    };

    // Register before flyTo so an already-near target cannot finish before the
    // completion listener is ready. This is event-driven; no timeout guesses.
    if (typeof map.once === "function") {
      map.once("moveend", openWhenMapStops);
    } else if (typeof map.on === "function") {
      const openOnceWhenMapStops = () => {
        map.off?.("moveend", openOnceWhenMapStops);
        openWhenMapStops();
      };
      map.on("moveend", openOnceWhenMapStops);
    } else {
      return false;
    }

    map.flyTo({
      center: [place.lon, place.lat],
      zoom: Math.max(map.getZoom?.() || 13, 16),
      speed: 1.1,
      essential: true
    });
    return true;
  }

  /** @type {MapViewApi} */
  const MapView = {
    showMap() {
      closeQuizModals();
      showExploreBase();
      cancelPendingPlaceNavigation();
      hidePlaceCardForMap();
    },

    // Backward compatibility for older callers.
    show() {
      this.showMap();
    },

    cancelPendingPlaceNavigation,

    openPlace(placeId) {
      closeQuizModals();
      showExploreBase();

      const place = findPlace(placeId);
      if (!place) return false;

      return navigateToPlace(place);
    },

    openQuiz(targetId) {
      showExploreBase();
      cancelPendingPlaceNavigation();

      const id = String(targetId || "").trim();
      if (!id) return false;

      // Quiz er en overlay på stedet brukeren allerede ser på. Ikke naviger til
      // stedet på nytt her: navigateToPlace() skjuler PlaceCard, flyr kartet og
      // åpner kortet igjen, som ga et synlig lukke/åpne-flimmer ved hvert quiztrykk.
      document.body?.classList.add("hg-view-quiz");
      window.showToast?.("Laster quiz …", 1400);

      if (typeof window.QuizEngine?.start === "function") {
        void Promise.resolve(window.QuizEngine.start(id)).catch((err) => {
          console.warn("[MapView.openQuiz] quiz start failed", err);
          window.showToast?.("Kunne ikke åpne quizen");
        });
        return true;
      }

      window.addEventListener("hg:backgroundReady", () => {
        window.QuizEngine?.start?.(id);
      }, { once: true });

      return true;
    },

    openDebate(debateId) {
      const id = String(debateId || "").trim();
      if (!id) return false;
      showExploreBase();
      // HGDebatesContent.open is async (loads data, then renders); kick it off optimistically.
      if (window.HGDebatesContent?.open) {
        void window.HGDebatesContent.open(id);
        return true;
      }
      window.addEventListener("hg:backgroundReady", function () {
        window.HGDebatesContent?.open?.(id);
      }, { once: true });
      window.showToast?.("Debatt lastes inn …");
      return true;
    }
  };

  window.HGMapView = MapView;
  // Existing callers (search, nature and unlock toasts) use this central
  // navigation entry point rather than controlling PlaceCard timing themselves.
  window.flyToPlace = navigateToPlace;
})();