// js/views/MapView.js
// Tynt view-lag for index-appen. Flytter ikke DOM; styrer bare eksisterende kart/explore UI.

(function () {
  "use strict";

  const MapView = {
    show() {
      document.body?.classList.remove("hg-view-profile", "hg-view-civication", "hg-view-quiz");
      document.body?.classList.add("hg-view-map");

      if (window.LayerManager?.setMode) {
        window.LayerManager.setMode("explore");
      }

      window.setNearbyCollapsed?.(false);
      window.setPlaceCardCollapsed?.(false);
      window.HGMap?.resize?.();
      window.MAP?.resize?.();
    },

    openPlace(placeId) {
      this.show();

      const id = String(placeId || "").trim();
      if (!id) return false;

      const place = (Array.isArray(window.PLACES) ? window.PLACES : [])
        .find((p) => String(p?.id || "").trim() === id);

      if (!place) return false;

      const map = window.HGMap?.getMap?.() || window.MAP;
      if (map && Number.isFinite(place.lon) && Number.isFinite(place.lat)) {
        map.flyTo({
          center: [place.lon, place.lat],
          zoom: Math.max(map.getZoom?.() || 13, 16),
          speed: 1.1,
          essential: true
        });
      }

      window.openPlaceCard?.(place);
      window.bottomSheetController?.open?.();
      return true;
    },

    openQuiz(targetId) {
      this.show();
      const id = String(targetId || "").trim();
      if (!id) return false;

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
