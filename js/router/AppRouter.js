// js/router/AppRouter.js
// Lett hash-router for index.html. Første scope: map/place/quiz.
// Profile.html og Civication.html beholdes som egne sider foreløpig.

(function () {
  "use strict";

  const DEFAULT_ROUTE = "#/map";
  let started = false;

  function parseHash(hash) {
    const raw = String(hash || "").trim() || DEFAULT_ROUTE;
    const clean = raw.startsWith("#") ? raw.slice(1) : raw;
    const parts = clean.split("/").filter(Boolean).map(decodeURIComponent);
    return {
      raw,
      name: parts[0] || "map",
      params: parts.slice(1)
    };
  }

  function navigate(hash, { replace = false } = {}) {
    const next = String(hash || DEFAULT_ROUTE).startsWith("#") ? String(hash || DEFAULT_ROUTE) : `#${hash}`;
    if (replace) {
      history.replaceState(null, "", next);
      render();
      return;
    }
    location.hash = next;
  }

  function render() {
    const route = parseHash(location.hash);

    if (route.name === "" || route.name === "map") {
      window.HGMapView?.show?.();
      return;
    }

    if (route.name === "place") {
      const ok = window.HGMapView?.openPlace?.(route.params[0]);
      if (!ok) window.HGMapView?.show?.();
      return;
    }

    if (route.name === "quiz") {
      const ok = window.HGMapView?.openQuiz?.(route.params[0]);
      if (!ok) window.HGMapView?.show?.();
      return;
    }

    // Ikke flytt disse inn ennå. Send til eksisterende fullsider.
    if (route.name === "profile") {
      window.location.href = "profile.html";
      return;
    }

    if (route.name === "civication") {
      window.location.href = "Civication.html";
      return;
    }

    navigate(DEFAULT_ROUTE, { replace: true });
  }

  function start() {
    if (started) return;
    started = true;

    window.addEventListener("hashchange", render);

    if (!location.hash) {
      navigate(DEFAULT_ROUTE, { replace: true });
      return;
    }

    render();
  }

  window.HGAppRouter = {
    start,
    navigate,
    render,
    parseHash
  };
})();
