// Explicit city-only lookup against Fysen's verified PUBLIC menu archive.
// Never sends Civication positions, private routes, selected meals, GPS or accounts.
// Archive content is historical menu evidence, not current kitchen opening or stock.
(function () {
  "use strict";
  const BASE = "https://fysen-api.vercel.app/v1/dishes/archive/search";
  const MAX_RESULTS = 8;
  function cleanText(value, max) {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  }
  function proofDate(value) {
    return typeof value === "string" && Number.isFinite(Date.parse(value))
      ? value : null;
  }
  function safeSourceUrl(value) {
    if (typeof value !== "string" || value.length > 1500) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.username === "" && url.password === ""
        ? url.href : null;
    } catch (_) { return null; }
  }
  function result(status, items = [], archiveDate = null) {
    return { status, source: "fysen-public-archive", realtime: false, archiveDate, items };
  }
  function queryUrl(raw) {
    const query = cleanText(raw, 80);
    if (query.length < 2) return null;
    return BASE + "?q=" + encodeURIComponent(query) +
      "&city=Oslo&limit=" + MAX_RESULTS;
  }
  async function search(raw, opts) {
    const url = queryUrl(raw);
    if (!url) return result("invalid_query");
    const options = opts && typeof opts === "object" ? opts : {};
    // Only the caller's own click starts the request; optional signal handles
    // cancellation when the user closes a search or makes a different query.
    let response;
    try {
      response = await fetch(url, {
        method: "GET", credentials: "omit", mode: "cors",
        referrerPolicy: "no-referrer",
        headers: { "Accept": "application/json" },
        signal: options.signal
      });
    } catch (_) { return result("unavailable"); }
    if (!response || !response.ok) return result("unavailable");
    let data;
    try { data = await response.json(); }
    catch (_) { return result("unavailable"); }
    if (data?.source !== "verified-menu-archive" || data?.realtime !== false ||
        String(data?.city || "").toLowerCase() !== "oslo" ||
        !Array.isArray(data?.results) || data.results.length > MAX_RESULTS) {
      return result("unverified_response");
    }
    const archiveDate = proofDate(data.archiveDate);
    if (!archiveDate) return result("unverified_response");
    const items = [];
    for (const row of data.results) {
      const name = cleanText(row?.name, 260);
      const restaurant = cleanText(row?.restaurant?.name, 200);
      const address = cleanText(row?.restaurant?.address, 400);
      const restaurantCity = cleanText(row?.restaurant?.city, 100);
      const observedAt = proofDate(row?.menu?.observedAt);
      const sourceUrl = safeSourceUrl(row?.menu?.sourceUrl);
      // No independent evidence that an old archive item is on today's menu.
      if (!name || !restaurant || !address ||
          restaurantCity.toLowerCase() !== "oslo" ||
          !observedAt || !sourceUrl || Date.parse(observedAt) > Date.parse(archiveDate) + 86400000) {
        continue;
      }
      items.push({
        name, restaurant, address, sourceUrl, observedAt,
        availability: "unknown", openingAtPassTime: "unknown",
        onCommuteRoute: "unverified", priceMinor: null
      });
    }
    return result(items.length ? "archive_results" : "no_archive_results", items, archiveDate);
  }
  window.CivicationFysenPublicMenus = Object.freeze({ search });
})();