// Explicit user action only. Route calculation via the existing HG OpenRouteService
// account; no background GPS, map emulation, home/work sync or automatic suggestions.
(function () {
  "use strict";
  const W = /** @type {any} */ (window);
  const PROFILES = { walking: "foot-walking", cycling: "cycling-regular", driving: "driving-car" };
  const SOURCE_HOST = "api.openrouteservice.org";
  function validCoords(point) {
    return Number.isFinite(point?.latitude) && point.latitude >= -90 && point.latitude <= 90 &&
      Number.isFinite(point?.longitude) && point.longitude >= -180 && point.longitude <= 180;
  }
  function validGeometry(geometry) {
    return geometry?.type === "LineString" &&
      Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2 &&
      geometry.coordinates.length <= 10000 &&
      geometry.coordinates.every(c => Array.isArray(c) && c.length === 2 &&
        Number.isFinite(c[0]) && c[0] >= -180 && c[0] <= 180 &&
        Number.isFinite(c[1]) && c[1] >= -90 && c[1] <= 90);
  }
  function revision(routeId, geometry) {
    const text = routeId + ":" + JSON.stringify(geometry.coordinates);
    let sum = 2166136261;
    for (let i = 0; i < text.length; i++) {
      sum ^= text.charCodeAt(i);
      sum = Math.imul(sum, 16777619);
    }
    return "ors-geometry-v1-" + (sum >>> 0).toString(16).padStart(8, "0");
  }
  function validConfig() {
    const config = W.HG_ORS;
    if (!config || typeof config.apiKey !== "string" || !config.apiKey.trim()) return null;
    try {
      const uri = new URL(config.baseUrl || "https://api.openrouteservice.org");
      if (uri.protocol !== "https:" || uri.hostname !== SOURCE_HOST ||
        uri.username || uri.password || uri.search || uri.hash || (uri.pathname !== "/" && uri.pathname !== "")) return null;
      return { baseUrl: uri.origin, apiKey: config.apiKey };
    } catch (_) { return null; }
  }
  async function calculate(route, { consent = false, now = new Date() } = {}) {
    if (consent !== true) return { ok: false, reason: "CONSENT_REQUIRED" };
    if (!route || route.kind !== "commute" || route.status !== "planned" ||
      route.visibility !== "private" || !Array.isArray(route.waypoints) ||
      route.waypoints.length !== 2 || !route.id) return { ok: false, reason: "INVALID_ROUTE" };
    const profile = PROFILES[route.travelMode];
    if (!profile) return { ok: false, reason: "UNSUPPORTED_TRAVEL_MODE" };
    const from = route.waypoints[0], to = route.waypoints[1];
    if (!validCoords(from) || !validCoords(to)) return { ok: false, reason: "COORDINATES_REQUIRED" };
    const config = validConfig();
    if (!config) return { ok: false, reason: "ROUTER_NOT_CONFIGURED" };
    const time = now instanceof Date ? now.getTime() : NaN;
    if (!Number.isFinite(time)) return { ok: false, reason: "INVALID_TIME" };
    const sourceUrl = config.baseUrl + "/v2/directions/" + profile + "/geojson";
    let response;
    try {
      response = await fetch(sourceUrl, {
        method: "POST",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { "Authorization": config.apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinates: [[from.longitude, from.latitude], [to.longitude, to.latitude]]
        })
      });
    } catch (_) { return { ok: false, reason: "ROUTING_UNAVAILABLE" }; }
    if (!response?.ok) return { ok: false, reason: "ROUTING_UNAVAILABLE" };
    let payload;
    try { payload = await response.json(); }
    catch (_) { return { ok: false, reason: "INVALID_ROUTING_RESPONSE" }; }
    const first = payload?.features?.[0];
    const geometry = first?.geometry;
    const segment = first?.properties?.segments?.[0];
    if (!validGeometry(geometry) || !Number.isFinite(segment?.distance) ||
      segment.distance < 0 || !Number.isFinite(segment?.duration) ||
      segment.duration < 0) return { ok: false, reason: "INVALID_ROUTING_RESPONSE" };
    return {
      ok: true,
      routeId: String(route.id),
      roadGeometry: { type: "LineString", coordinates: geometry.coordinates.map(c => [c[0], c[1]]) },
      geometryRevision: revision(String(route.id), geometry),
      distanceMeters: segment.distance,
      durationMinutes: segment.duration / 60,
      routingStatus: "verified_route",
      routeEvidence: {
        sourceUrl,
        checkedAt: new Date(time).toISOString(),
        validUntil: new Date(time + 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }
  W.CivicationRoadRouter = Object.freeze({ calculate });
})();
