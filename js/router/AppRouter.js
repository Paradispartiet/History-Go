// js/router/AppRouter.js
// Lett hash-router for index.html. Første scope: map/place/quiz.
// Profile.html og Civication.html beholdes som egne sider foreløpig.

(function () {
  "use strict";

  const DEFAULT_ROUTE = "#/map";
  let started = false;

  function normalizeHash(hash) {
    return String(hash || DEFAULT_ROUTE).startsWith("#")
      ? String(hash || DEFAULT_ROUTE)
      : `#${hash}`;
  }

  function encodeRoutePart(value) {
    return encodeURIComponent(String(value || "").trim());
  }

  function mapPath() {
    return "#/map";
  }

  function placePath(placeId) {
    const id = encodeRoutePart(placeId);
    return id ? `#/place/${id}` : mapPath();
  }

  function quizPath(targetId) {
    const id = encodeRoutePart(targetId);
    return id ? `#/quiz/${id}` : mapPath();
  }

  function parseHash(hash) {
    const raw = normalizeHash(hash || location.hash || DEFAULT_ROUTE);
    const clean = raw.startsWith("#") ? raw.slice(1) : raw;
    const parts = clean.split("/").filter(Boolean).map(decodeURIComponent);
    return {
      raw,
      name: parts[0] || "map",
      params: parts.slice(1)
    };
  }

  function navigate(hash, { replace = false } = {}) {
    const next = normalizeHash(hash);
    const current = location.hash ? normalizeHash(location.hash) : "";

    if (current === next) {
      render();
      return false;
    }

    if (replace) {
      history.replaceState(null, "", next);
      render();
      return true;
    }

    location.hash = next;
    return true;
  }

  function toMap(options = {}) {
    return navigate(mapPath(), options);
  }

  function toPlace(placeId, options = {}) {
    return navigate(placePath(placeId), options);
  }

  function toQuiz(targetId, options = {}) {
    return navigate(quizPath(targetId), options);
  }

  function render() {
    const route = parseHash(location.hash);

    if (route.name === "" || route.name === "map") {
      window.HGMapView?.showMap?.();
      return;
    }

    if (route.name === "place") {
      const ok = window.HGMapView?.openPlace?.(route.params[0]);
      if (!ok) window.HGMapView?.showMap?.();
      return;
    }

    if (route.name === "quiz") {
      const ok = window.HGMapView?.openQuiz?.(route.params[0]);
      if (!ok) window.HGMapView?.showMap?.();
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
    parseHash,
    normalizeHash,
    mapPath,
    placePath,
    quizPath,
    toMap,
    toPlace,
    toQuiz
  };
})();
