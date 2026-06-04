// js/views/MapView.js
// Tynt view-lag for index-appen. Flytter ikke DOM; styrer bare eksisterende kart/explore UI.

(function () {
  "use strict";

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

  function findPlace(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return null;

    return (Array.isArray(window.PLACES) ? window.PLACES : [])
      .find((p) => String(p?.id || "").trim() === id) || null;
  }

  function focusPlaceOnMap(place) {
    const map = window.HGMap?.getMap?.() || window.MAP;
    if (!map || !Number.isFinite(place?.lon) || !Number.isFinite(place?.lat)) return;

    map.flyTo({
      center: [place.lon, place.lat],
      zoom: Math.max(map.getZoom?.() || 13, 16),
      speed: 1.1,
      essential: true
    });
  }

  const MapView = {
    showMap() {
      closeQuizModals();
      showExploreBase();
      hidePlaceCardForMap();
    },

    // Backward compatibility for older callers.
    show() {
      this.showMap();
    },

    openPlace(placeId) {
      closeQuizModals();
      showExploreBase();

      const place = findPlace(placeId);
      if (!place) return false;

      focusPlaceOnMap(place);
      window.openPlaceCard?.(place);
      window.bottomSheetController?.open?.();
      window.setPlaceCardCollapsed?.(false);
      return true;
    },

    openQuiz(targetId) {
      showExploreBase();

      const id = String(targetId || "").trim();
      if (!id) return false;

      const place = findPlace(id);
      if (place) {
        focusPlaceOnMap(place);
        window.openPlaceCard?.(place);
      }

      document.body?.classList.add("hg-view-quiz");

      if (typeof window.QuizEngine?.start === "function") {
        window.QuizEngine.start(id);
        return true;
      }

      window.addEventListener("hg:backgroundReady", () => {
        window.QuizEngine?.start?.(id);
      }, { once: true });

      window.showToast?.("Quiz lastes inn …");
      return true;
    }
  };

  window.HGMapView = MapView;
})();
