#!/usr/bin/env node
// tools/build_nature_place_candidates_v2.mjs
// Builds data/natur/nature_place_map_candidates.json from Artskart.
// Candidate file is not active app data. Curate before merging into nature_place_map.json.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const CFG = {
  placesManifest: "data/places/manifest.json",
  floraManifest: "data/natur/flora/manifest.json",
  faunaManifest: "data/natur/fauna/manifest.json",
  outPath: process.env.NATURE_CANDIDATES_OUT || "data/natur/nature_place_map_candidates.json",
  endpoint: "https://artskart.artsdatabanken.no/publicapi/api/observations/list/",
  defaultRadiusM: 180,
  minYear: 2000,
  maxPrecisionM: 250,
  pageSize: 200,
  maxPagesPerPlace: 8,
  maxObservationsPerPlace: 1500,
  requestDelayMs: 250,
  requestRetries: Number(process.env.ARTSKART_RETRIES || 3),
  retryBaseDelayMs: Number(process.env.ARTSKART_RETRY_BASE_DELAY_MS || 1000),
  maxExternalTaxaPerPlace: 40,
  includeCategories: new Set(["natur", "by", "sport", "historie", "kunst", "subkultur"]),
  priorityPlaceIds: new Set([
    "botanisk_hage",
    "sognsvann",
    "vigelandsparken",
    "slottsparken",
    "ekebergparken",
    "st_hanshaugen_park",
    "birkelunden",
    "stensparken",
    "botsparken",
    "sofienbergparken_subkultur",
    "holmenkollen",
    "olaf_ryes_plass",
    "inger_hagerups_plass",
    "ullevål_hageby",
    "nydalen"
  ])
};

function parseNonNegativeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseArgs(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--out=")) CFG.outPath = arg.slice("--out=".length);
    else if (arg.startsWith("--retries=")) CFG.requestRetries = parseNonNegativeNumber(arg.slice("--retries=".length), CFG.requestRetries);
    else if (arg.startsWith("--retry-base-delay-ms=")) CFG.retryBaseDelayMs = parseNonNegativeNumber(arg.slice("--retry-base-delay-ms=".length), CFG.retryBaseDelayMs);
    else if (arg.startsWith("--request-delay-ms=")) CFG.requestDelayMs = parseNonNegativeNumber(arg.slice("--request-delay-ms=".length), CFG.requestDelayMs);
  }
}

parseArgs(process.argv.slice(2));

function rel(p) {
  return String(p || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function abs(p) {
  return path.join(ROOT, p);
}

async function exists(p) {
  try {
    await fs.access(abs(p));
    return true;
  } catch {
    return false;
  }
}

async function readJson(p, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(abs(p), "utf8"));
  } catch (err) {
    if (fallback !== null) return fallback;
    throw new Error(`Kunne ikke lese ${p}: ${err.message}`);
  }
}

async function writeJson(p, data) {
  await fs.mkdir(path.dirname(abs(p)), { recursive: true });
  await fs.writeFile(abs(p), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableFetchError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  if (/artskart (429|500|502|503|504)/i.test(String(err?.message || ""))) return true;
  return [
    "fetch failed",
    "econnreset",
    "etimedout",
    "timeout",
    "socket",
    "network",
    "temporarily unavailable",
    "too many requests"
  ].some(token => msg.includes(token));
}

async function withRetries(label, fn) {
  const attempts = Math.max(1, Number(CFG.requestRetries || 0) + 1);
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= attempts || !isRetryableFetchError(err)) throw err;

      const delay = Math.min(Number(CFG.retryBaseDelayMs || 1000) * 2 ** (attempt - 1), 10000);
      console.warn(`[nature-map] ${label} failed attempt ${attempt}/${attempts}: ${err.message}; retrying in ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function uniq(xs) {
  return [...new Set((Array.isArray(xs) ? xs : []).filter(Boolean))];
}

async function resolveManifestFile(manifestPath, fileRef) {
  const file = typeof fileRef === "string" ? fileRef : fileRef?.file || fileRef?.path;
  if (!file) return null;

  const clean = rel(file);
  const baseDir = rel(path.dirname(manifestPath));
  const dataDir = rel(path.dirname(baseDir));
  const candidates = [];

  if (clean.startsWith("data/")) candidates.push(clean);
  candidates.push(rel(path.join(baseDir, clean)));
  candidates.push(rel(path.join(dataDir, clean)));
  candidates.push(rel(path.join("data", clean)));

  for (const p of [...new Set(candidates)]) {
    if (await exists(p)) return p;
  }
  console.warn(`[nature-map] fant ikke manifestfil: ${file} fra ${manifestPath}`);
  return null;
}

function flattenEntries(items) {
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== "object") continue;
    if (item.kind === "emne_pack" && Array.isArray(item.items)) {
      out.push(...flattenEntries(item.items));
    } else if (item.id) {
      out.push(item);
    }
  }
  return out;
}

async function loadManifestEntries(manifestPath) {
  const manifest = await readJson(manifestPath, []);
  const files = Array.isArray(manifest?.files) ? manifest.files : Array.isArray(manifest) ? manifest : [];
  const out = [];
  for (const f of files) {
    const resolved = await resolveManifestFile(manifestPath, f);
    if (!resolved) continue;
    out.push(...flattenEntries(await readJson(resolved, [])));
  }
  return out;
}

async function loadPlaces() {
  const manifest = await readJson(CFG.placesManifest, []);
  const files = Array.isArray(manifest?.files) ? manifest.files : Array.isArray(manifest) ? manifest : [];
  const out = [];
  for (const f of files) {
    const resolved = await resolveManifestFile(CFG.placesManifest, f);
    if (!resolved) continue;
    const data = await readJson(resolved, []);
    if (Array.isArray(data)) out.push(...data);
  }
  const valid = out.filter(p => p && p.id && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)));
  if (!valid.length) throw new Error("Ingen places ble lastet. Sjekk data/places/manifest.json.");
  return valid;
}

function indexSpecies(flora, fauna) {
  const byLatin = new Map();
  const byNorwegian = new Map();
  const byAny = new Map();

  function add(item, kind) {
    const id = String(item.id || "").trim();
    if (!id) return;
    const latin = String(item.latin || item.taxonomy?.latin_navn || "").trim();
    const title = String(item.title || item.name || item.taxonomy?.norsk_navn || "").trim();
    const record = { id, kind, title, latin, raw: item };
    if (latin) byLatin.set(norm(latin), record);
    if (title) byNorwegian.set(norm(title), record);
    byAny.set(norm(id), record);
    if (latin) byAny.set(norm(latin), record);
    if (title) byAny.set(norm(title), record);
  }

  flora.forEach(x => add(x, "flora"));
  fauna.forEach(x => add(x, "fauna"));
  return { byLatin, byNorwegian, byAny };
}

function lonLatToWebMercator(lon, lat) {
  const x = lon * 20037508.34 / 180;
  const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
  return { x, y };
}

function squareWktWebMercator(lon, lat, radiusM) {
  const c = lonLatToWebMercator(Number(lon), Number(lat));
  const r = Number(radiusM) || CFG.defaultRadiusM;
  const p1 = `${c.x - r} ${c.y - r}`;
  const p2 = `${c.x + r} ${c.y - r}`;
  const p3 = `${c.x + r} ${c.y + r}`;
  const p4 = `${c.x - r} ${c.y + r}`;
  return `POLYGON((${p1},${p2},${p3},${p4},${p1}))`;
}

function isObservationLike(obj) {
  return !!(obj && typeof obj === "object" && !Array.isArray(obj) && (
    obj.ScientificName || obj.scientificName || obj.ValidScientificName || obj.Name || obj.vernacularName ||
    obj.TaxonName || obj.taxonName || obj.TaxonId || obj.taxonId || obj.Latitude || obj.latitude || obj.Longitude || obj.longitude
  ));
}

function findObservationArray(payload, depth = 0) {
  if (Array.isArray(payload)) {
    if (!payload.length || payload.some(isObservationLike)) return payload;
  }
  if (!payload || typeof payload !== "object" || depth > 4) return [];

  for (const key of ["Observations", "observations", "Results", "results", "Items", "items", "Data", "data", "Rows", "rows"]) {
    if (key in payload) {
      const found = findObservationArray(payload[key], depth + 1);
      if (found.length || Array.isArray(payload[key])) return found;
    }
  }

  let best = [];
  for (const value of Object.values(payload)) {
    const found = findObservationArray(value, depth + 1);
    if (found.length > best.length) best = found;
  }
  return best;
}

function getYear(obs) {
  const raw = obs?.CollectedDate || obs?.EventDate || obs?.eventDate || obs?.date || obs?.Date || obs?.ObservedDate || "";
  const m = String(raw).match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

function getPrecision(obs) {
  const raw = obs?.Precision ?? obs?.CoordinateUncertaintyInMeters ?? obs?.coordinateUncertaintyInMeters ?? obs?.coordinateUncertainty ?? null;
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function nameRaw(obs) {
  return uniq([
    obs?.ScientificName,
    obs?.scientificName,
    obs?.ValidScientificName,
    obs?.Name,
    obs?.vernacularName,
    obs?.species,
    obs?.TaxonName,
    obs?.taxonName
  ].map(x => String(x ?? "").trim()).filter(Boolean));
}

function nameKeys(obs) {
  return nameRaw(obs).map(norm);
}

function useful(obs) {
  const y = getYear(obs);
  if (y && y < CFG.minYear) return false;
  const p = getPrecision(obs);
  if (p !== null && p > CFG.maxPrecisionM) return false;
  return true;
}

function matchObservation(obs, speciesIndex) {
  for (const key of nameKeys(obs)) {
    if (speciesIndex.byLatin.has(key)) return speciesIndex.byLatin.get(key);
    if (speciesIndex.byNorwegian.has(key)) return speciesIndex.byNorwegian.get(key);
    if (speciesIndex.byAny.has(key)) return speciesIndex.byAny.get(key);
  }
  return null;
}

function pageInfo(payload) {
  const totalCount = Number(payload?.TotalCount ?? payload?.totalCount ?? payload?.total ?? 0);
  const pageSize = Number(payload?.PageSize ?? payload?.pageSize ?? 0);
  const pageIndex = Number(payload?.PageIndex ?? payload?.pageIndex ?? 0);
  const totalPagesRaw = Number(payload?.TotalPages ?? payload?.totalPages ?? 0);
  const totalPages = totalPagesRaw || (totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1);
  return { pageIndex, pageSize, totalCount, totalPages };
}

async function fetchArtskartPage(place, pageIndex) {
  return withRetries(`Artskart ${place.id} page ${pageIndex}`, async () => {
    const radius = Number(place.r || CFG.defaultRadiusM);
    const url = new URL(CFG.endpoint);
    url.searchParams.set("gmWktPolygon", squareWktWebMercator(place.lon, place.lat, radius));
    url.searchParams.set("PageIndex", String(pageIndex));
    url.searchParams.set("PageSize", String(CFG.pageSize));

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Artskart ${res.status} for ${place.id}`);
    const payload = await res.json();
    return { url: url.toString(), payload, observations: findObservationArray(payload), info: pageInfo(payload) };
  });
}

async function fetchArtskartForPlace(place) {
  const first = await fetchArtskartPage(place, 0);
  const byId = new Map();
  const pages = [first.info];
  const urls = [first.url];

  function addObs(obs) {
    const id = String(obs?.Id || obs?.id || `${obs?.TaxonId || obs?.ScientificName || obs?.Name}-${obs?.CollectedDate || ""}-${obs?.Longitude || ""}-${obs?.Latitude || ""}`);
    if (!byId.has(id)) byId.set(id, obs);
  }
  first.observations.forEach(addObs);

  const totalPages = Math.max(1, Math.min(Number(first.info.totalPages || 1), CFG.maxPagesPerPlace));
  for (let pageIndex = 1; pageIndex < totalPages && byId.size < CFG.maxObservationsPerPlace; pageIndex += 1) {
    await sleep(40);
    const page = await fetchArtskartPage(place, pageIndex);
    pages.push(page.info);
    urls.push(page.url);
    page.observations.forEach(addObs);
  }

  const observations = [...byId.values()].slice(0, CFG.maxObservationsPerPlace);
  return {
    observations,
    diagnostic: {
      firstRequestUrl: first.url,
      pageRequests: urls.length,
      requestedPageSize: CFG.pageSize,
      pageInfo: pages,
      totalCount: first.info.totalCount,
      totalPagesReported: first.info.totalPages,
      extractedObservationCount: observations.length,
      firstObservationKeys: observations[0] && typeof observations[0] === "object" ? Object.keys(observations[0]).slice(0, 50) : []
    }
  };
}

function scoreCandidate(x) {
  const count = x.count || 0;
  const latest = x.latestYear || 0;
  if (count >= 5 && latest >= 2020) return "high";
  if (count >= 2 && latest >= 2015) return "medium";
  return "low";
}

function shouldCheckPlace(place) {
  return CFG.priorityPlaceIds.has(String(place.id)) || CFG.includeCategories.has(String(place.category || ""));
}

function addStats(map, key, base, obs) {
  const cur = map.get(key) || {
    ...base,
    count: 0,
    latestYear: null,
    precisionMin: null,
    examples: []
  };
  const y = getYear(obs);
  const p = getPrecision(obs);
  cur.count += 1;
  if (y && (!cur.latestYear || y > cur.latestYear)) cur.latestYear = y;
  if (p !== null && (cur.precisionMin === null || p < cur.precisionMin)) cur.precisionMin = p;
  if (cur.examples.length < 3) {
    cur.examples.push({
      year: y,
      precision: p,
      locality: obs.Locality || obs.locality || "",
      source: obs.Institution || obs.institution || obs.DatasetName || obs.datasetName || ""
    });
  }
  map.set(key, cur);
}

function externalBase(obs) {
  return {
    taxonId: obs?.TaxonId ?? obs?.taxonId ?? null,
    scientificName: obs?.ScientificName || obs?.scientificName || obs?.ValidScientificName || "",
    name: obs?.Name || obs?.vernacularName || obs?.TaxonName || "",
    kingdom: obs?.kingdom || obs?.Kingdom || "",
    klass: obs?.klass || obs?.Class || obs?.class || "",
    order: obs?.order || obs?.Order || "",
    family: obs?.family || obs?.Family || "",
    genus: obs?.genus || obs?.Genus || ""
  };
}

async function main() {
  const [places, flora, fauna] = await Promise.all([
    loadPlaces(),
    loadManifestEntries(CFG.floraManifest),
    loadManifestEntries(CFG.faunaManifest)
  ]);

  const speciesIndex = indexSpecies(flora, fauna);
  const targets = places.filter(shouldCheckPlace);
  if (!targets.length) throw new Error("Ingen steder matchet prioriterte placeIds eller includeCategories.");

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "Artskart public API",
      status: "candidate_only",
      filters: {
        minYear: CFG.minYear,
        maxPrecisionM: CFG.maxPrecisionM,
        defaultRadiusM: CFG.defaultRadiusM,
        pageSize: CFG.pageSize,
        maxPagesPerPlace: CFG.maxPagesPerPlace,
        requestRetries: CFG.requestRetries,
        retryBaseDelayMs: CFG.retryBaseDelayMs
      },
      counts: {
        placesTotal: places.length,
        placesChecked: targets.length,
        floraInRepo: flora.length,
        faunaInRepo: fauna.length
      }
    },
    places: {}
  };

  for (const place of targets) {
    console.log(`[nature-map] ${place.id} – ${place.name}`);
    const repoStats = new Map();
    const externalStats = new Map();
    let usefulObservationCount = 0;
    let matchedObservationCount = 0;
    let diagnostic = null;

    try {
      const fetched = await fetchArtskartForPlace(place);
      diagnostic = fetched.diagnostic;

      for (const obs of fetched.observations) {
        if (!useful(obs)) continue;
        usefulObservationCount += 1;

        const match = matchObservation(obs, speciesIndex);
        if (match) {
          matchedObservationCount += 1;
          addStats(repoStats, match.id, {
            id: match.id,
            kind: match.kind,
            title: match.title,
            latin: match.latin
          }, obs);
        } else {
          const base = externalBase(obs);
          const key = String(base.taxonId || base.scientificName || base.name || obs.Id || "").trim();
          if (key) addStats(externalStats, key, base, obs);
        }
      }

      const candidates = [...repoStats.values()]
        .map(x => ({ ...x, confidence: scoreCandidate(x) }))
        .sort((a, b) => {
          const conf = { high: 3, medium: 2, low: 1 };
          return (conf[b.confidence] - conf[a.confidence]) || (b.count - a.count) || String(a.title).localeCompare(String(b.title), "no");
        });

      const externalTaxa = [...externalStats.values()]
        .map(x => ({ ...x, confidence: scoreCandidate(x) }))
        .sort((a, b) => (b.count - a.count) || String(a.name || a.scientificName).localeCompare(String(b.name || b.scientificName), "no"))
        .slice(0, CFG.maxExternalTaxaPerPlace);

      output.places[place.id] = {
        name: place.name,
        lat: Number(place.lat),
        lon: Number(place.lon),
        radiusM: Number(place.r || CFG.defaultRadiusM),
        category: place.category || "",
        status: "candidate_from_artskart",
        diagnostic: {
          ...diagnostic,
          usefulObservationCount,
          matchedObservationCount,
          externalTaxaCount: externalStats.size
        },
        flora: candidates.filter(x => x.kind === "flora"),
        fauna: candidates.filter(x => x.kind === "fauna"),
        externalTaxa
      };
    } catch (err) {
      output.places[place.id] = {
        name: place.name,
        lat: Number(place.lat),
        lon: Number(place.lon),
        radiusM: Number(place.r || CFG.defaultRadiusM),
        category: place.category || "",
        status: "error",
        error: err.message,
        diagnostic,
        flora: [],
        fauna: [],
        externalTaxa: []
      };
      console.warn(`[nature-map] ${place.id}: ${err.message}`);
    }

    await sleep(CFG.requestDelayMs);
  }

  await writeJson(CFG.outPath, output);
  console.log(`[nature-map] placesTotal=${places.length} placesChecked=${targets.length}`);
  console.log(`[nature-map] skrev ${CFG.outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
