// ============================================================
// HG Time Resolver – felles normalisering av tidsdata for places
// ============================================================

(function (global) {
  "use strict";

  function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function toText(value) {
    return String(value ?? "").trim();
  }

  function normalizeYearsFromPeriod(period) {
    if (period == null) return { startYear: null, endYear: null };

    if (Array.isArray(period)) {
      const startYear = toNumber(period[0]);
      const endYear = toNumber(period[1]);
      return { startYear, endYear };
    }

    if (typeof period === "object") {
      const startYear =
        toNumber(period.start_year) ??
        toNumber(period.startYear) ??
        toNumber(period.start) ??
        toNumber(period.from);

      const endYear =
        toNumber(period.end_year) ??
        toNumber(period.endYear) ??
        toNumber(period.end) ??
        toNumber(period.to);

      return { startYear, endYear };
    }

    return { startYear: null, endYear: null };
  }

  function extractEpokeIds(place) {
    const ids = [];

    const single = toText(place?.epoke_id);
    if (single) ids.push(single);

    const many = Array.isArray(place?.epoke_ids) ? place.epoke_ids : [];
    for (const raw of many) {
      const id = toText(raw);
      if (id) ids.push(id);
    }

    return ids;
  }

  function findEpokeByYear(domain, year, epokerIndex) {
    if (!epokerIndex || !epokerIndex.byDomain || !domain || year == null) return null;

    const list = Array.isArray(epokerIndex.byDomain?.[domain]?.list)
      ? epokerIndex.byDomain[domain].list
      : [];

    for (const ep of list) {
      const start = toNumber(ep?.start_year);
      const end = toNumber(ep?.end_year);

      if (start != null && end != null && year >= start && year <= end) return ep;
      if (start != null && end == null && year >= start) return ep;
      if (start == null && end != null && year <= end) return ep;
    }

    return null;
  }

  function isLastEpokeInDomain(epoke, domain, epokerIndex) {
    if (!epoke || !domain || !epokerIndex?.byDomain?.[domain]) return false;

    const list = Array.isArray(epokerIndex.byDomain[domain].list)
      ? epokerIndex.byDomain[domain].list
      : [];

    if (!list.length) return false;

    let last = null;
    for (const current of list) {
      if (!last) {
        last = current;
        continue;
      }

      const a = toNumber(last?.start_year);
      const b = toNumber(current?.start_year);
      const A = a == null ? -Infinity : a;
      const B = b == null ? -Infinity : b;

      if (B > A) last = current;
    }

    return toText(last?.id) !== "" && toText(last?.id) === toText(epoke?.id);
  }

  function pickDomain(place, preferredDomain) {
    const explicit = toText(preferredDomain);
    if (explicit) return explicit;

    return (
      toText(place?.domain) ||
      toText(place?.category) ||
      toText(place?.categoryId) ||
      toText(place?.fag) ||
      null
    );
  }

  function labelForEpoke(epoke) {
    if (!epoke) return null;
    return (
      toText(epoke.label) ||
      toText(epoke.name) ||
      toText(epoke.title) ||
      toText(epoke.id) ||
      null
    );
  }

  function resolvePlaceTime(place, options) {
    const opts = options || {};
    const epokerIndex = opts.epokerIndex || global.EPOKER_INDEX || null;

    const domain = pickDomain(place, opts.domain);

    const year = toNumber(place?.year);

    const periodYears = normalizeYearsFromPeriod(place?.period);

    const startYear =
      toNumber(place?.start_year) ??
      toNumber(place?.startYear) ??
      periodYears.startYear ??
      year;

    const endYear =
      toNumber(place?.end_year) ??
      toNumber(place?.endYear) ??
      periodYears.endYear ??
      year;

    const explicitIds = extractEpokeIds(place);
    const explicitId = explicitIds.length ? explicitIds[0] : null;

    let epoke = null;
    let confidence = "unknown";

    if (explicitId && domain && epokerIndex?.byDomain?.[domain]?.byId?.[explicitId]) {
      epoke = epokerIndex.byDomain[domain].byId[explicitId];
      confidence = "explicit";
    } else if (year != null) {
      epoke = findEpokeByYear(domain, year, epokerIndex);
      confidence = epoke ? "year_match" : "year_only";
    } else if (startYear != null) {
      epoke = findEpokeByYear(domain, startYear, epokerIndex);
      confidence = epoke ? "year_match" : "unknown";
    }

    const epokeId = epoke ? toText(epoke.id) || null : explicitId;
    const epokeLabel = labelForEpoke(epoke);

    const epokeSortBase = epoke
      ? (
        toNumber(epoke.start_year) ??
        toNumber(epoke.start) ??
        toNumber(epoke.from) ??
        toNumber(epoke.order)
      )
      : null;

    const sortBase = startYear ?? year ?? epokeSortBase ?? Number.POSITIVE_INFINITY;
    const sortKey = Number.isFinite(sortBase) ? sortBase : Number.MAX_SAFE_INTEGER;

    return {
      year,
      startYear,
      endYear,
      epokeId,
      epokeLabel,
      domain,
      sortKey,
      confidence,
      isZeitgeist: isLastEpokeInDomain(epoke, domain, epokerIndex)
    };
  }

  function resolveMany(places, options) {
    const list = Array.isArray(places) ? places : [];
    return list.map((place) => resolvePlaceTime(place, options));
  }

  /**
   * Debug helper for a single place id.
   * Returns normalized resolver output when found, otherwise a non-throwing missing payload.
   */
  function debugPlace(placeId, options) {
    const id = toText(placeId);
    const places = Array.isArray(global.PLACES) ? global.PLACES : [];
    const place = places.find((p) => toText(p?.id) === id) || null;

    if (!place) {
      const missing = { placeId: id || null, found: false, normalized: null };
      console.warn("[HGTimeResolver.debugPlace] place not found", missing);
      return missing;
    }

    const normalized = resolvePlaceTime(place, options);
    console.log("[HGTimeResolver.debugPlace]", { placeId: id, normalized });
    return normalized;
  }

  global.HGTimeResolver = {
    resolvePlaceTime,
    resolveMany,
    debugPlace
  };
})(window);
