#!/usr/bin/env node
// tools/build_nature_place_candidates.mjs
// ------------------------------------------------------------
// Dev-script for History Go:
// Lager kandidater til data/natur/nature_place_map.json ved å:
// 1) lese aktive places fra data/places/manifest.json
// 2) lese eksisterende flora/fauna fra data/natur/*/manifest.json
// 3) spørre Artskart API per sted med WebMercator/WKT-polygon
// 4) matche observasjoner mot arter som allerede finnes i repoet
// 5) skrive forslag til data/natur/nature_place_map_candidates.json
//
// Kjør lokalt fra repo-root:
//   node tools/build_nature_place_candidates.mjs
//
// NB:
// - Scriptet gjør ingen endringer i nature_place_map.json.
// - Resultatet er kandidater som må kurateres før de legges inn i appen.
// - Krever Node 18+ for global fetch.
// ------------------------------------------------------------

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const CONFIG = {
  placesManifest: "data/places/manifest.json",
  floraManifest: "data/natur/flora/manifest.json",
  faunaManifest: "data/natur/fauna/manifest.json",
  outPath: "data/natur/nature_place_map_candidates.json",
  artskartEndpoint: "https://artskart.artsdatabanken.no/publicapi/api/observations/list/",
  defaultRadiusM: 180,
  minYear: 2000,
  maxPrecisionM: 250,
  maxObservationsPerPlace: 2500,
  requestDelayMs: 450,
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

function relNorm(p) {
  return String(p || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function abs(relPath) {
  return path.join(ROOT, relPath);
}

async function exists(relPath) {
  try {
    await fs.access(abs(relPath));
    return true;
  } catch {
    return false;
  }
}

async function resolveManifestFile(manifestPath, fileRef) {
  const file = typeof fileRef === "string" ? fileRef : fileRef?.file || fileRef?.path;
  if (!file) return null;

  const clean = relNorm(file);
  const baseDir = relNorm(path.dirname(manifestPath));
  const dataDir = relNorm(path.dirname(baseDir));

  const candidates = [];

  if (clean.startsWith("data/")) candidates.push(clean);

  // Vanlig manifest-format: filnavn relativt til manifestmappen.
  candidates.push(relNorm(path.join(baseDir, clean)));

  // History Go places-manifest bruker bl.a. "places/places_by.json".
  // Det er relativt til data/, ikke til data/places/.
  candidates.push(relNorm(path.join(dataDir, clean)));

  // Ekstra fallback for rene filnavn i data/places-manifest.
  candidates.push(relNorm(path.join("data", clean)));

  for (const candidate of [...new Set(candidates)]) {
    if (await exists(candidate)) return candidate;
  }

  console.warn(`[nature-map] fant ikke manifestfil: ${file} fra ${manifestPath}`);
  return null;
}

async function readJson(relPath, fallback = null) {
  try {
    const raw = await fs.readFile(abs(relPath), "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (fallback !== null) return fallback;
    throw new Error(`Kunne ikke lese ${relPath}: ${err.message}`);
  }
}

async function writeJson(relPath, data) {
  await fs.mkdir(path.dirname(abs(relPath)), { recursive: true });
  await fs.writeFile(abs(relPath), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function norm(value) {
  return String(value ?? "")
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

function unique(list) {
  return [...new Set((Array.isArray(list) ? list : []).filter(Boolean))];
}

function flattenManifestEntries(items) {
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    if (!item) continue;
    if (item.kind === "emne_pack" && Array.isArray(item.items)) {
      out.push(...flattenManifestEntries(item.items));
      continue;
    }
    if (item.id) out.push(item);
  }
  return out;
}

async function loadFilesFromManifest(manifestPath) {
  const manifest = await readJson(manifestPath, []);
  const files = Array.isArray(manifest?.files) ? manifest.files : Array.isArray(manifest) ? manifest : [];
  const all = [];

  for (const fileRef of files) {
    const rel = await resolveManifestFile(manifestPath, fileRef);
    if (!rel) continue;
    const data = await readJson(rel, []);
    all.push(...flattenManifestEntries(data));
  }

  return all;
}

async function loadPlaces() {
  const manifest = await readJson(CONFIG.placesManifest, []);
  const files = Array.isArray(manifest?.files) ? manifest.files : Array.isArray(manifest) ? manifest : [];
  const places = [];

  for (const fileRef of files) {
    const rel = await resolveManifestFile(CONFIG.placesManifest, fileRef);
    if (!rel) continue;
    const data = await readJson(rel, []);
    if (Array.isArray(data)) places.push(...data);
  }

  const valid = places.filter(p => p && p.id && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)));

  if (!valid.length) {
    throw new Error("Ingen places ble lastet. Sjekk data/places/manifest.json og manifest-stier.");
  }

  return valid;
}

function indexSpecies(flora, fauna) {
  const byLatin = new Map();
  const byNorwegian = new Map();
  const byAny = new Map();

  const add = (item, kind) => {
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
  };

  flora.forEach(item => add(item, "flora"));
  fauna.forEach(item => add(item, "fauna"));

  return { byLatin, byNorwegian, byAny };
}

function lonLatToWebMercator(lon, lat) {
  const x = lon * 20037508.34 / 180;
  const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
  return { x, y };
}

function squareWktWebMercator(lon, lat, radiusM) {
  const c = lonLatToWebMercator(Number(lon), Number(lat));
  const r = Number(radiusM) || CONFIG.defaultRadiusM;
  const p1 = `${c.x - r} ${c.y - r}`;
  const p2 = `${c.x + r} ${c.y - r}`;
  const p3 = `${c.x + r} ${c.y + r}`;
  const p4 = `${c.x - r} ${c.y + r}`;
  return `POLYGON((${p1},${p2},${p3},${p4},${p1}))`;
}

function extractObservationList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.Results)) return payload.Results;
  if (Array.isArray(payload?.Items)) return payload.Items;
  if (Array.isArray(payload?.observations)) return payload.observations;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getObsYear(obs) {
  const raw = obs?.CollectedDate || obs?.EventDate || obs?.eventDate || obs?.date || obs?.Date || obs?.ObservedDate || "";
  const text = String(raw);
  const m = text.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

function getObsPrecision(obs) {
  const raw = obs?.Precision ?? obs?.CoordinateUncertaintyInMeters ?? obs?.coordinateUncertaintyInMeters ?? obs?.coordinateUncertainty ?? null;
  const num = Number(String(raw).replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function getObsNameKeys(obs) {
  return unique([
    obs?.ScientificName,
    obs?.scientificName,
    obs?.ValidScientificName,
    obs?.Name,
    obs?.vernacularName,
    obs?.species,
    obs?.TaxonName,
    obs?.taxonName
  ].map(x => norm(x)));
}

function isUsefulObservation(obs) {
  const year = getObsYear(obs);
  if (year && year < CONFIG.minYear) return false;

  const precision = getObsPrecision(obs);
  if (precision !== null && precision > CONFIG.maxPrecisionM) return false;

  return true;
}

function matchObservation(obs, speciesIndex) {
  const keys = getObsNameKeys(obs);
  for (const key of keys) {
    if (speciesIndex.byLatin.has(key)) return speciesIndex.byLatin.get(key);
    if (speciesIndex.byNorwegian.has(key)) return speciesIndex.byNorwegian.get(key);
    if (speciesIndex.byAny.has(key)) return speciesIndex.byAny.get(key);
  }
  return null;
}

async function fetchArtskartForPlace(place) {
  const radius = Number(place.r || CONFIG.defaultRadiusM);
  const wkt = squareWktWebMercator(place.lon, place.lat, radius);
  const url = new URL(CONFIG.artskartEndpoint);
  url.searchParams.set("gmWktPolygon", wkt);

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error(`Artskart ${res.status} for ${place.id}`);
  }

  const payload = await res.json();
  return extractObservationList(payload).slice(0, CONFIG.maxObservationsPerPlace);
}

function scoreCandidate(stats) {
  const count = stats.count || 0;
  const latest = stats.latestYear || 0;

  if (count >= 5 && latest >= 2020) return "high";
  if (count >= 2 && latest >= 2015) return "medium";
  return "low";
}

function shouldCheckPlace(place) {
  if (CONFIG.priorityPlaceIds.has(String(place.id))) return true;
  if (CONFIG.includeCategories.has(String(place.category || ""))) return true;
  return false;
}

async function main() {
  const [places, flora, fauna] = await Promise.all([
    loadPlaces(),
    loadFilesFromManifest(CONFIG.floraManifest),
    loadFilesFromManifest(CONFIG.faunaManifest)
  ]);

  const speciesIndex = indexSpecies(flora, fauna);
  const targets = places.filter(shouldCheckPlace);

  if (!targets.length) {
    throw new Error("Ingen steder matchet prioriterte placeIds eller includeCategories.");
  }

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "Artskart public API",
      status: "candidate_only",
      filters: {
        minYear: CONFIG.minYear,
        maxPrecisionM: CONFIG.maxPrecisionM,
        defaultRadiusM: CONFIG.defaultRadiusM
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

    const statsById = new Map();
    try {
      const observations = await fetchArtskartForPlace(place);

      for (const obs of observations) {
        if (!isUsefulObservation(obs)) continue;
        const match = matchObservation(obs, speciesIndex);
        if (!match) continue;

        const current = statsById.get(match.id) || {
          id: match.id,
          kind: match.kind,
          title: match.title,
          latin: match.latin,
          count: 0,
          latestYear: null,
          precisionMin: null,
          examples: []
        };

        const year = getObsYear(obs);
        const precision = getObsPrecision(obs);

        current.count += 1;
        if (year && (!current.latestYear || year > current.latestYear)) current.latestYear = year;
        if (precision !== null && (current.precisionMin === null || precision < current.precisionMin)) current.precisionMin = precision;
        if (current.examples.length < 3) {
          current.examples.push({
            year,
            precision,
            locality: obs.Locality || obs.locality || "",
            source: obs.Institution || obs.institution || obs.DatasetName || obs.datasetName || ""
          });
        }

        statsById.set(match.id, current);
      }

      const candidates = [...statsById.values()]
        .map(x => ({ ...x, confidence: scoreCandidate(x) }))
        .sort((a, b) => {
          const conf = { high: 3, medium: 2, low: 1 };
          return (conf[b.confidence] - conf[a.confidence]) || (b.count - a.count) || String(a.title).localeCompare(String(b.title), "no");
        });

      output.places[place.id] = {
        name: place.name,
        lat: Number(place.lat),
        lon: Number(place.lon),
        radiusM: Number(place.r || CONFIG.defaultRadiusM),
        category: place.category || "",
        status: "candidate_from_artskart",
        flora: candidates.filter(x => x.kind === "flora"),
        fauna: candidates.filter(x => x.kind === "fauna")
      };
    } catch (err) {
      output.places[place.id] = {
        name: place.name,
        lat: Number(place.lat),
        lon: Number(place.lon),
        radiusM: Number(place.r || CONFIG.defaultRadiusM),
        category: place.category || "",
        status: "error",
        error: err.message,
        flora: [],
        fauna: []
      };
      console.warn(`[nature-map] ${place.id}: ${err.message}`);
    }

    await sleep(CONFIG.requestDelayMs);
  }

  await writeJson(CONFIG.outPath, output);
  console.log(`[nature-map] placesTotal=${places.length} placesChecked=${targets.length}`);
  console.log(`[nature-map] skrev ${CONFIG.outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
