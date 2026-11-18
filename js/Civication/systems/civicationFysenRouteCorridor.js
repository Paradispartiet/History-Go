// Local ONLY: shortlist public Fysen live restaurant results geographically near
// a verified private commute polyline. "Near" is a geometric corridor, NOT
// proof of a navigable detour, kitchen opening at passage, or an offer.
// This module MUST NOT perform any network, storage, GPS or AHA side effects.
(function () {
  "use strict";
  const METERS_PER_RADIAN = 6371008.8;
  const MAX_CORRIDOR_METERS = 500;
  const MAX_RESULTS = 10;

  function finite(value, min, max) {
    return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
  }
  function coordinate(pair) {
    return Array.isArray(pair) && pair.length === 2 &&
      finite(pair[0], -180, 180) && finite(pair[1], -90, 90);
  }
  function sourceFresh(proof, now) {
    if (!proof || typeof proof !== "object" ||
        typeof proof.sourceUrl !== "string" || !/^https:\/\//.test(proof.sourceUrl)) return false;
    const checked = Date.parse(proof.checkedAt || proof.lastCheckedAt || "");
    const until = Date.parse(proof.validUntil || proof.freshUntil || "");
    return Number.isFinite(checked) && Number.isFinite(until) &&
      checked <= now && until > now;
  }
  function routeReady(route, now) {
    const points = route?.roadGeometry?.coordinates;
    return route?.kind === "commute" && route.status === "planned" &&
      route.visibility === "private" && route.routingStatus === "verified_route" &&
      route.roadGeometry?.type === "LineString" &&
      Array.isArray(points) && points.length >= 2 && points.length <= 10000 &&
      points.every(coordinate) && typeof route.geometryRevision === "string" &&
      /^ors-geometry-v1-[a-f0-9]{8}$/.test(route.geometryRevision) &&
      sourceFresh(route.routeEvidence, now) &&
      /^https:\/\/api\.openrouteservice\.org\/v2\/directions\/(foot-walking|cycling-regular|driving-car)\/geojson$/.test(route.routeEvidence.sourceUrl);
  }
  function distanceToPolylineMeters(lat, lon, path) {
    // Equirectangular metric is appropriate for short urban corridors.
    // This is an approximate geometric distance, NEVER a detour duration.
    const referenceLatitude = lat * Math.PI / 180;
    const east = METERS_PER_RADIAN * Math.cos(referenceLatitude) * Math.PI / 180;
    const north = METERS_PER_RADIAN * Math.PI / 180;
    const targetX = lon * east, targetY = lat * north;
    let minimumSquared = Infinity;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i];
      const ax = a[0] * east, ay = a[1] * north;
      const dx = (b[0] - a[0]) * east, dy = (b[1] - a[1]) * north;
      const denom = dx * dx + dy * dy;
      const t = denom > 0
        ? Math.max(0, Math.min(1, ((targetX - ax) * dx + (targetY - ay) * dy) / denom))
        : 0;
      const x = ax + t * dx, y = ay + t * dy;
      const distSquared = (targetX - x) ** 2 + (targetY - y) ** 2;
      if (distSquared < minimumSquared) minimumSquared = distSquared;
    }
    return Math.sqrt(minimumSquared);
  }
  function isValidMenu(row, now) {
    const menu = row?.menu, restaurant = row?.restaurant;
    return restaurant && typeof restaurant.id === "string" && !!restaurant.id &&
      typeof restaurant.name === "string" && !!restaurant.name.trim() &&
      typeof restaurant.city === "string" && restaurant.city.toLowerCase() === "oslo" &&
      finite(restaurant.latitude, -90, 90) &&
      finite(restaurant.longitude, -180, 180) &&
      row.dish && typeof row.dish.name === "string" && !!row.dish.name.trim() &&
      sourceFresh(menu, now) &&
      Number.isFinite(Date.parse(menu.observedAt || "")) &&
      Date.parse(menu.observedAt) <= now &&
      typeof menu.sourceUrl === "string" && /^https:\/\//.test(menu.sourceUrl);
  }
  /** @param {{ route?: any, response?: any, nowMillis?: number, corridorMeters?: number }} [options] */
  function shortlist({ route, response, nowMillis, corridorMeters = MAX_CORRIDOR_METERS } = {}) {
    if (!Number.isFinite(nowMillis)) return { status: "invalid_time", candidates: [] };
    if (!routeReady(route, nowMillis)) return { status: "verified_route_required", candidates: [] };
    if (!finite(corridorMeters, 1, MAX_CORRIDOR_METERS)) {
      return { status: "invalid_corridor", candidates: [] };
    }
    if (!response || typeof response.city !== "string" || response.city.toLowerCase() !== "oslo" ||
        !Array.isArray(response.results) || response.results.length > 50) {
      return { status: "verified_public_results_required", candidates: [] };
    }
    const candidates = [];
    const seen = new Set();
    for (const row of response.results) {
      if (!isValidMenu(row, nowMillis) || row.match?.type === "fuzzy") continue;
      const distance = distanceToPolylineMeters(
        row.restaurant.latitude, row.restaurant.longitude, route.roadGeometry.coordinates
      );
      if (!Number.isFinite(distance) || distance > corridorMeters) continue;
      // Multiple dishes from a single restaurant should not crowd out other locations.
      if (seen.has(row.restaurant.id)) continue;
      seen.add(row.restaurant.id);
      candidates.push({
        restaurantId: row.restaurant.id,
        name: row.restaurant.name.trim().slice(0, 200),
        address: String(row.restaurant.address || "").slice(0, 500),
        dishName: row.dish.name.trim().slice(0, 300),
        latitude: row.restaurant.latitude,
        longitude: row.restaurant.longitude,
        approxCorridorMeters: Math.round(distance),
        routeId: route.id,
        routeGeometryRevision: route.geometryRevision,
        menuSourceUrl: row.menu.sourceUrl,
        menuCheckedAt: row.menu.lastCheckedAt,
        menuFreshUntil: row.menu.freshUntil,
        onRoute: "unverified",
        detourMinutes: null,
        kitchenOpenAtPassTime: "unknown",
        priceMinor: row.dish?.currency === "NOK" && Number.isSafeInteger(row.dish?.priceMinor) &&
          row.dish.priceMinor >= 0 && row.dish.priceMinor <= 5000000 ? row.dish.priceMinor : null,
        priceKind: ["exact", "from", "multiple"].includes(row.dish?.priceKind) ? row.dish.priceKind : "exact",
        currency: "NOK",
        source: "fysen_verified_public_menu"
      });
    }
    candidates.sort((a,b) => a.approxCorridorMeters - b.approxCorridorMeters ||
      a.name.localeCompare(b.name,"nb"));
    return { status: candidates.length ? "geographic_candidates" : "none_nearby", candidates: candidates.slice(0,MAX_RESULTS) };
  }
  window.CivicationFysenRouteCorridor = Object.freeze({ shortlist });
})();