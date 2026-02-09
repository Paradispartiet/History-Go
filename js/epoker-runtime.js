// ============================================================
// Epoker – runtime index (robust, ikke skjør)
// ============================================================

function epArr(x) { return Array.isArray(x) ? x : []; }
function epS(x) { return String(x ?? "").trim(); }
function epN(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}
function epKey(domain, id) {
  const d = epS(domain);
  const i = epS(id);
  return d && i ? `${d}:${i}` : "";
}

// Støtter flere schema-varianter uten å kreve kanonisk format:
// - id / epoke_id
// - start_year / start / from
// - end_year / end / to
function buildEpokerRuntimeIndex(epokerByDomain) {
  const idx = {
    byKey: Object.create(null),       // "domain:id" -> epoke
    byDomain: Object.create(null),    // domain -> { list, byId, byStart }
    all: []                           // flat liste (med domain)
  };

  const input = epokerByDomain && typeof epokerByDomain === "object" ? epokerByDomain : {};

  for (const [domainRaw, rawList] of Object.entries(input)) {
    const domain = epS(domainRaw);
    if (!domain) continue;

    const list = epArr(rawList);

    const dom = {
      list: [],
      byId: Object.create(null),      // id -> epoke (innen domain)
      byStart: []
    };

    for (const e of list) {
      const id = epS(e?.id || e?.epoke_id);
      if (!id) continue;

      const start =
        epN(e?.start_year) ?? epN(e?.start) ?? epN(e?.from) ?? null;

      const end =
        epN(e?.end_year) ?? epN(e?.end) ?? epN(e?.to) ?? null;

      const ep = { ...(e || {}), id, domain, start_year: start, end_year: end };

      dom.list.push(ep);
      dom.byId[id] = ep;

      const k = epKey(domain, id);
      if (k) {
        // Unngå silent overwrite hvis du vil: legg en DEBUG-warn her
        idx.byKey[k] = ep;
      }

      idx.all.push(ep);
    }

    dom.byStart = dom.list
      .slice()
      .sort((a, b) => {
        const A = a.start_year ?? 999999;
        const B = b.start_year ?? 999999;
        return A - B;
      });

    idx.byDomain[domain] = dom;
  }

  return idx;
}

// Små helpers
function getEpoke(domain, epokeId) {
  const d = epS(domain);
  const id = epS(epokeId);
  if (!id) return null;

  // 1) Strict: domain + id
  const k = epKey(d, id);
  if (k && window.EPOKER_INDEX?.byKey?.[k]) return window.EPOKER_INDEX.byKey[k];

  // 2) Fallback: hvis domain finnes, slå opp i domain-index
  if (d && window.EPOKER_INDEX?.byDomain?.[d]?.byId?.[id]) {
    return window.EPOKER_INDEX.byDomain[d].byId[id];
  }

  return null;
}

// ✅ Epoker: hvilke domener/merker som har epoke-fil
// Nøkkelen (domain) må matche det du bruker ellers: "film", "tv", "sport", osv.
const EPOKER_FILES = {
  historie:       "data/epoker_historie.json",
  vitenskap:      "data/epoker_vitenskap.json",
  kunst:          "data/epoker_kunst.json",
  by:             "data/epoker_by.json",
  musikk:         "data/epoker_musikk.json",
  litteratur:     "data/epoker_litteratur.json",
  natur:          "data/epoker_natur.json",
  sport:          "data/epoker_sport.json",
  politikk:       "data/epoker_politikk.json",
  naeringsliv:    "data/epoker_naeringsliv.json",
  populaerkultur: "data/epoker_populaerkultur.json",
  subkultur:      "data/epoker_subkultur.json",
  film_tv:        "data/epoker_film_tv.json",
  scenekunst:     "data/epoker_scenekunst.json",
  media:          "data/epoker_media.json",
  psykologi:      "data/epoker_psykologi.json",
};
