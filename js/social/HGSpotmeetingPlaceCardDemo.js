(function(){
  "use strict";

  // Kompatibilitets-/demo-wrapper. Canonical Kunnskapsmøte-UI eies av
  // js/social/HGSpotmeetingUI.js (window.HG_SpotmeetingUI). Denne fila
  // beholdes bare fordi eldre flows og tester fortsatt laster den.
  const root = typeof window !== "undefined" ? window : globalThis;

  function bind(){
    root.HG_SpotmeetingUI?.bind?.();
  }

  root.HG_SpotmeetingPlaceCardDemo = {
    bind,
    isTestMode: () => {
      try { return root.localStorage?.getItem("HG_TEST_MODE") === "1"; }
      catch { return false; }
    },
    contextFor: (action, place) =>
      root.HG_SpotmeetingUI?.buildPlaceContext?.(place, {
        preferredAction: action,
        sourceSurface: "placeCardPeople"
      }),
    renderCandidates: (...args) =>
      root.HG_SpotmeetingUI?.renderCandidates?.(...args),
    sendInvite: (...args) =>
      root.HG_SpotmeetingUI?.sendInvite?.(...args)
  };

  bind();
}());
