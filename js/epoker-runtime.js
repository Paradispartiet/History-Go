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
// - start_year / year_start / years.from / start / from
// - end_year / year_end / years.to / end / to
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
        epN(e?.start_year) ?? epN(e?.year_start) ?? epN(e?.years?.from) ?? epN(e?.start) ?? epN(e?.from) ?? null;

      const end =
        epN(e?.end_year) ?? epN(e?.year_end) ?? epN(e?.years?.to) ?? epN(e?.end) ?? epN(e?.to) ?? null;

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
  film_tv: "data/epoker/epoker_film.json",
  tv: "data/epoker/epoker_TV.json",
  sport: "data/epoker/epoker_sport.json",
};

function normalizeEpokerFilePayload(payload, fallbackDomain) {
  const raw = payload ?? null;
  if (!raw) return { domain: epS(fallbackDomain), list: [] };

  if (Array.isArray(raw)) {
    return {
      domain: epS(fallbackDomain),
      list: raw
    };
  }

  const obj = typeof raw === "object" ? raw : {};
  const domain = epS(obj.domain_id || obj.domain || fallbackDomain);

  const list =
    epArr(obj.macro_epoker).length ? epArr(obj.macro_epoker) :
    epArr(obj.epoker).length ? epArr(obj.epoker) :
    epArr(obj.items).length ? epArr(obj.items) :
    [] ;

  return { domain, list };
}

const HGEpokerRuntime = (() => {
  let loadPromise = null;
  let cache = null;
  const status = {
    loaded: false,
    startedAt: null,
    finishedAt: null,
    domainsLoaded: [],
    missingFiles: [],
    failedFiles: [],
  };

  async function load() {
    if (cache) return cache;
    if (loadPromise) return loadPromise;

    status.startedAt = new Date().toISOString();

    loadPromise = (async () => {
      const epokerByDomain = Object.create(null);
      status.domainsLoaded = [];
      status.missingFiles = [];
      status.failedFiles = [];

      for (const [declaredDomain, path] of Object.entries(EPOKER_FILES)) {
        try {
          const res = await fetch(path, { cache: "no-store" });
          if (!res.ok) {
            const entry = { domain: declaredDomain, path, status: res.status };
            if (res.status === 404) status.missingFiles.push(entry);
            else status.failedFiles.push({ ...entry, reason: `HTTP ${res.status}` });
            continue;
          }

          const payload = await res.json();
          const normalized = normalizeEpokerFilePayload(payload, declaredDomain);
          const domain = epS(normalized.domain || declaredDomain);
          if (!domain) {
            status.failedFiles.push({ domain: declaredDomain, path, reason: "missing domain" });
            continue;
          }

          if (!epokerByDomain[domain]) epokerByDomain[domain] = [];
          epokerByDomain[domain].push(...epArr(normalized.list));
          status.domainsLoaded.push({ domain, path, count: epArr(normalized.list).length });
        } catch (err) {
          status.failedFiles.push({
            domain: declaredDomain,
            path,
            reason: err instanceof Error ? err.message : String(err),
          });
        }
      }

      const idx = buildEpokerRuntimeIndex(epokerByDomain);
      window.EPOKER_INDEX = idx;
      cache = idx;
      status.loaded = true;
      status.finishedAt = new Date().toISOString();
      return idx;
    })();

    return loadPromise;
  }

  function debug() {
    const index = window.EPOKER_INDEX || null;
    const byDomain = index?.byDomain || {};
    const domainCounts = Object.fromEntries(
      Object.entries(byDomain).map(([domain, dom]) => [domain, epArr(dom?.list).length])
    );

    const info = {
      hasIndex: Boolean(index),
      loadedDomains: Object.keys(byDomain),
      domainCounts,
      missingFiles: status.missingFiles.slice(),
      failedFiles: status.failedFiles.slice(),
      startedAt: status.startedAt,
      finishedAt: status.finishedAt,
    };

    console.log("[HGEpokerRuntime.debug]", info);
    return info;
  }

  return {
    load,
    debug,
    ready: null,
    get status() { return { ...status }; },
  };
})();

window.HGEpokerRuntime = HGEpokerRuntime;
window.HGEpokerRuntime.ready = window.HGEpokerRuntime.load().catch((err) => {
  console.warn("[HGEpokerRuntime] load failed", err);
  return window.EPOKER_INDEX || null;
});
