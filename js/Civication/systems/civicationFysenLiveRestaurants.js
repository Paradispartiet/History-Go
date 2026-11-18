// Fysen live public menu discovery. The query contains the user-entered dish
// and the city Oslo ONLY. No Civication coordinates, routes, game clock, home,
// workplace, profile or weekly plan are sent to Fysen.
// Verified *menu records* are NOT proof of kitchen service at a future pass.
(function () {
  "use strict";
  const W = /** @type {any} */ (window);
  const ORIGIN = "https://fysen-api.vercel.app";
  const PATH = "/v1/dishes/search";
  const LIMIT = 20;

  function validText(value, maxLength) {
    return typeof value === "string" && value.trim().length > 0 &&
      value.length <= maxLength;
  }
  function validHTTPS(raw) {
    if (typeof raw !== "string" || raw.length > 1600) return false;
    try {
      const url = new URL(raw);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch (_) { return false; }
  }
  function validCoords(r) {
    return typeof r?.latitude === "number" &&
      Number.isFinite(r.latitude) && r.latitude >= -90 && r.latitude <= 90 &&
      typeof r.longitude === "number" && Number.isFinite(r.longitude) &&
      r.longitude >= -180 && r.longitude <= 180;
  }
  function observedDate(s) {
    return typeof s === "string" && Number.isFinite(Date.parse(s)) ? Date.parse(s) : null;
  }
  function liveRow(row, now) {
    const r = row?.restaurant;
    const m = row?.menu;
    const d = row?.dish;
    if (!validText(r?.id, 150) || !validText(r?.name, 200) ||
        !validText(r?.address, 500) || typeof r?.city !== "string" || r.city.toLowerCase() !== "oslo" ||
        !validCoords(r) || !validText(d?.name, 300) ||
        !["exact", "canonical", "prefix", "contains"].includes(row?.match?.type) ||
        !validHTTPS(m?.sourceUrl)) return null;
    const checked=observedDate(m.lastCheckedAt);
    const until=observedDate(m.freshUntil);
    const seen=observedDate(m.observedAt);
    if (checked === null || until === null || seen === null ||
        checked > now || until <= now || seen > now || seen > checked) return null;
    return {
      dish: { name: d.name.trim(),
        priceMinor: d.currency === "NOK" && Number.isSafeInteger(d.priceMinor) &&
          d.priceMinor >= 0 && d.priceMinor <= 5000000 ? d.priceMinor : null,
        priceKind: ["exact", "from", "multiple"].includes(d.priceKind) ? d.priceKind : "exact",
        currency: d.currency === "NOK" ? "NOK" : null
      },
      restaurant: {
        id:r.id, name:r.name.trim(), address:r.address.trim(), city:"Oslo",
        latitude:r.latitude, longitude:r.longitude
      },
      menu: {
        sourceUrl:m.sourceUrl,
        observedAt:m.observedAt, lastCheckedAt:m.lastCheckedAt, freshUntil:m.freshUntil
      },
      match: {type:row.match.type}
    };
  }
  function response(status, results=[]) {
    return {status, city:"Oslo", results,
      priceAvailable:results.some(row => Number.isSafeInteger(row.dish?.priceMinor)),
      kitchenOpenAtPassTime:"unknown", routeMatched:false, realtimeAvailability:false};
  }
  /** @param {string} dish @param {{ consent?: boolean, signal?: AbortSignal, now?: Date }} [options] */
  async function lookup(dish, options={}) {
    if (options.consent !== true) return response("CONSENT_REQUIRED");
    const query = typeof dish === "string" ? dish.trim() : "";
    if (query.length < 2 || query.length > 80) return response("INVALID_QUERY");
    const now=options.now && typeof options.now.getTime==="function"
      ? Number(options.now.getTime()) : Date.now();
    if (!Number.isFinite(now)) return response("INVALID_TIME");
    const url = ORIGIN + PATH +
      "?q=" + encodeURIComponent(query) + "&city=Oslo&limit=" + LIMIT + "&sort=relevance";
    let http;
    try {
      http = await fetch(url, {
        method:"GET", credentials:"omit", mode:"cors", redirect:"error",
        referrerPolicy:"no-referrer",
        headers:{"Accept":"application/json"},
        signal:options.signal
      });
    } catch (_) {return response("PUBLIC_API_UNAVAILABLE");}
    if (!http?.ok) return response("PUBLIC_API_UNAVAILABLE");
    let parsed;
    try {parsed=await http.json();}
    catch (_) {return response("INVALID_RESPONSE");}
    if (typeof parsed?.city !== "string" || parsed.city.toLowerCase() !== "oslo" ||
        !Array.isArray(parsed?.results) ||
        parsed.results.length > LIMIT || parsed?.sort !== "relevance" ||
        typeof parsed?.query !== "string" || parsed.query.trim() !== query) return response("INVALID_RESPONSE");
    const live = parsed.results.map(row => liveRow(row,now)).filter(Boolean);
    return response(live.length ? "DOCUMENTED_PUBLIC_MENUS" : "NO_CURRENT_PUBLIC_MENUS",live);
  }
  W.CivicationFysenLiveRestaurants=Object.freeze({lookup});
})();