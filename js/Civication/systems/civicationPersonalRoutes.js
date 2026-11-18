// Civication's PRIVATE locations and planned journeys. Does not claim actual travel.
// Owns a dedicated key, separate from CivicationTravelState (observed game travel).
(function () {
  "use strict";
  const W = /** @type {any} */ (window);
  const KEY = "hg_civi_personal_routes_v1";
  const MODES = ["walking", "cycling", "driving", "transit"];
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      return data && data.version === 1 && data.workplaces && typeof data.workplaces === "object" && !Array.isArray(data.workplaces)
        ? { version: 1, home: data.home || null, workplaces: data.workplaces, routes: data.routes || {} }
        : { version: 1, home: null, workplaces: {}, routes: {} };
    } catch (_) { return { version: 1, home: null, workplaces: {}, routes: {} }; }
  }
  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    return copy(data);
  }
  function jobKey(active) {
    const p = active || W.CivicationState?.getActivePosition?.();
    const career = String(p?.career_id || "").trim();
    if (!career) return null;
    const employer = String(p?.brand_id || p?.employer_context?.brand_id || p?.place_id || "unspecified").trim();
    const role = String(p?.role_id || p?.role_key || p?.title || "role").trim();
    return [career, employer, role].join("::");
  }
  function geoFrom(raw) {
    const hasLat = raw?.latitude !== undefined && raw?.latitude !== null && raw?.latitude !== "";
    const hasLon = raw?.longitude !== undefined && raw?.longitude !== null && raw?.longitude !== "";
    if (hasLat !== hasLon) throw new Error("Both latitude and longitude are required");
    if (!hasLat) return { latitude: null, longitude: null };
    const latitude = Number(raw.latitude);
    const longitude = Number(raw.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error("Invalid geographic coordinates");
    }
    return { latitude, longitude };
  }
  function place(raw, kind) {
    if (!raw || typeof raw !== "object") throw new Error("Location is required");
    const name = String(raw.name || (kind === "home" ? "Hjem" : "Arbeidssted")).trim().slice(0, 150);
    const address = String(raw.address || "").trim().slice(0, 500);
    // Real workplaces must have an actual street/postal address, not a guessed map-zone label.
    if (kind === "work" && !address) throw new Error("Workplace address is required");
    if (!name) throw new Error("Location name is required");
    const coordinates = geoFrom(raw);
    return {
      name, address,
      ...coordinates,
      source: String(raw.source || "player_entered").slice(0, 80),
      geocoded: coordinates.latitude !== null,
      kind
    };
  }
  function setHome(raw) {
    const data = read();
    const next = place(raw, "home");
    const changed = JSON.stringify(next) !== JSON.stringify(data.home);
    data.home = next;
    // Old routes embed precise former home coordinates. Remove them when edited.
    if (changed) data.routes = {};
    write(data);
    return copy(data.home);
  }
  function setWorkplace(raw, active) {
    const key = jobKey(active);
    if (!key) throw new Error("Active job is required");
    const data = read();
    const next = place(raw, "work");
    if (JSON.stringify(next) !== JSON.stringify(data.workplaces[key])) {
      // Invalidate only this employer's routes; other jobs remain untouched.
      for (const id of Object.keys(data.routes)) {
        if (data.routes[id]?.jobKey === key) delete data.routes[id];
      }
    }
    data.workplaces[key] = next;
    write(data);
    return copy(next);
  }
  function getWorkplace(active) {
    const key = jobKey(active);
    if (!key) return null;
    const data = read();
    if (data.workplaces[key]) return copy(data.workplaces[key]);
    // Do not infer addresses from a brand name or a district. An employer
    // context can supply a real address but is never persisted automatically.
    const p = active || W.CivicationState?.getActivePosition?.();
    const ctx = p?.employer_context || {};
    const address = String(ctx.address || ctx.street_address || p?.workplace_address || "").trim();
    if (!address) return null;
    try {
      return place({
        name: p?.brand_name || p?.workplace || p?.title || "Arbeidssted",
        address,
        latitude: ctx.latitude ?? ctx.lat ?? null,
        longitude: ctx.longitude ?? ctx.lon ?? null,
        source: "employer_context"
      }, "work");
    } catch (_) { return null; }
  }
  function getHome() { return copy(read().home); }
  function clearHome() { const data = read(); data.home = null; data.routes = {}; write(data); }
  function clearWorkplace(active) {
    const key = jobKey(active);
    const data = read();
    if (key) {
      delete data.workplaces[key];
      for (const id of Object.keys(data.routes)) {
        if (data.routes[id]?.jobKey === key) delete data.routes[id];
      }
    }
    write(data);
  }
  function planCommute(options) {
    const opts = options && typeof options === "object" ? options : {};
    const key = jobKey(opts.active);
    if (!key) return { ok: false, reason: "NO_ACTIVE_JOB" };
    const home = getHome(), work = getWorkplace(opts.active);
    if (!home) return { ok: false, reason: "HOME_REQUIRED" };
    if (!work) return { ok: false, reason: "WORK_ADDRESS_REQUIRED" };
    if (!home.geocoded || !work.geocoded) return { ok: false, reason: "COORDINATES_REQUIRED" };
    const mode = String(opts.travelMode || "walking");
    if (!MODES.includes(mode)) return { ok: false, reason: "INVALID_TRAVEL_MODE" };
    const direction = String(opts.direction || "to_work");
    if (!["to_work", "to_home"].includes(direction)) return { ok: false, reason: "INVALID_DIRECTION" };
    const weekDay = Number(opts.weekDay);
    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) return { ok: false, reason: "INVALID_WEEKDAY" };
    // These are endpoints, not a straight-line road route. A separate router
    // must provide validated road geometry / travel time before map navigation.
    const points = direction === "to_work" ? [home, work] : [work, home];
    const id = ["commute", key, direction, String(weekDay), mode].join("::");
    const route = {
      id, kind: "commute", source: "civication_planner",
      status: "planned", realWorldTravelConfirmed: false,
      jobKey: key, direction, weekDay, travelMode: mode,
      waypoints: points.map(p => ({ name: p.name, address: p.address, latitude: p.latitude, longitude: p.longitude })),
      roadGeometry: null, durationMinutes: null, distanceMeters: null,
      routingStatus: "awaiting_road_router", visibility: "private"
    };
    const data = read();
    data.routes[id] = route;
    write(data);
    return { ok: true, route: copy(route) };
  }
  function saveResolvedRoute(routeId, result) {
    if (!result || result.ok !== true || result.routeId !== routeId ||
      result.routingStatus !== "verified_route") throw new Error("Invalid routing result");
    const data = read();
    const existing = data.routes[routeId];
    if (!existing || existing.kind !== "commute" || existing.status !== "planned" ||
        existing.visibility !== "private") throw new Error("Unknown private planned route");
    const coordinates = result.roadGeometry?.coordinates;
    if (result.roadGeometry?.type !== "LineString" || !Array.isArray(coordinates) ||
      coordinates.length < 2 || coordinates.length > 10000 ||
      !coordinates.every(pair => Array.isArray(pair) && pair.length === 2 &&
        Number.isFinite(pair[0]) && pair[0] >= -180 && pair[0] <= 180 &&
        Number.isFinite(pair[1]) && pair[1] >= -90 && pair[1] <= 90)) {
      throw new Error("Invalid routed coordinates");
    }
    const evidence = result.routeEvidence || {};
    const checked = Date.parse(evidence.checkedAt || "");
    const until = Date.parse(evidence.validUntil || "");
    if (!/^https:\/\/api\.openrouteservice\.org\/v2\/directions\/[^/]+\/geojson$/.test(evidence.sourceUrl || "") ||
        !Number.isFinite(checked) || !Number.isFinite(until) || until <= checked ||
        !Number.isFinite(result.distanceMeters) || result.distanceMeters < 0 ||
        !Number.isFinite(result.durationMinutes) || result.durationMinutes < 0 ||
        typeof result.geometryRevision !== "string" || !/^ors-geometry-v1-[a-f0-9]{8}$/.test(result.geometryRevision)) {
      throw new Error("Missing route proof");
    }
    const next = {
      ...existing,
      routingStatus: "verified_route",
      roadGeometry: { type: "LineString", coordinates: coordinates.map(pair => [pair[0], pair[1]]) },
      distanceMeters: result.distanceMeters,
      durationMinutes: result.durationMinutes,
      geometryRevision: result.geometryRevision,
      routeEvidence: { sourceUrl: evidence.sourceUrl, checkedAt: evidence.checkedAt, validUntil: evidence.validUntil },
      realWorldTravelConfirmed: false
    };
    data.routes[routeId] = next;
    write(data);
    return copy(next);
  }
  function listRoutes() { return Object.values(read().routes).map(copy); }
  function deleteRoute(id) {
    const data = read();
    const existed = Object.prototype.hasOwnProperty.call(data.routes, id);
    delete data.routes[id];
    if (existed) write(data);
    return existed;
  }
  W.CivicationPersonalRoutes = Object.freeze({
    jobKey, setHome, getHome, clearHome, setWorkplace, getWorkplace,
    clearWorkplace, planCommute, saveResolvedRoute, listRoutes, deleteRoute
  });
})();
