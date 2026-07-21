#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const CONFIG = {
  geometryReport: "reports/etne-natur-batch-8-akrafjorden-waterbody-geometry.json",
  floraManifest: "data/natur/flora/manifest.json",
  faunaManifest: "data/natur/fauna/manifest.json",
  outputJson: "reports/etne-natur-batch-9-akrafjorden-artskart.json",
  outputMarkdown: "reports/etne-natur-batch-9-akrafjorden-artskart.md",
  endpoint: "https://artskart.artsdatabanken.no/publicapi/api/observations/list/",
  minYear: 2000,
  maxPrecisionM: 250,
  tileSizeM: 4000,
  pageSize: 1000,
  maxPagesPerTile: 100,
  requestDelayMs: 80,
  sampleLimit: 5
};

const abs = rel => path.join(ROOT, rel);
const relNorm = value => String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");

async function readJson(relPath, fallback = undefined) {
  try {
    return JSON.parse(await fs.readFile(abs(relPath), "utf8"));
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Kunne ikke lese ${relPath}: ${error.message}`);
  }
}

async function writeJson(relPath, value) {
  await fs.mkdir(path.dirname(abs(relPath)), { recursive: true });
  await fs.writeFile(abs(relPath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeText(relPath, value) {
  await fs.mkdir(path.dirname(abs(relPath)), { recursive: true });
  await fs.writeFile(abs(relPath), value.endsWith("\n") ? value : `${value}\n`, "utf8");
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
  const raw = typeof fileRef === "string" ? fileRef : fileRef?.file || fileRef?.path;
  if (!raw) return null;

  const clean = relNorm(raw);
  const baseDir = relNorm(path.dirname(manifestPath));
  const dataDir = relNorm(path.dirname(baseDir));
  const candidates = [
    clean,
    relNorm(path.join(baseDir, clean)),
    relNorm(path.join(dataDir, clean)),
    relNorm(path.join("data", clean))
  ];

  for (const candidate of [...new Set(candidates)]) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

function collectSpecies(node, output, seenIds) {
  if (Array.isArray(node)) {
    for (const item of node) collectSpecies(item, output, seenIds);
    return;
  }
  if (!node || typeof node !== "object") return;

  const id = String(node.id || "").trim();
  const latin = String(node.latin || node.taxonomy?.latin_navn || "").trim();
  const title = String(node.title || node.name || node.taxonomy?.norsk_navn || "").trim();

  if (id && (latin || title) && !seenIds.has(id)) {
    seenIds.add(id);
    output.push(node);
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") collectSpecies(value, output, seenIds);
  }
}

async function loadSpeciesFromManifest(manifestPath) {
  const manifest = await readJson(manifestPath, []);
  const refs = Array.isArray(manifest?.files) ? manifest.files : Array.isArray(manifest) ? manifest : [];
  const output = [];
  const seenIds = new Set();

  for (const ref of refs) {
    const resolved = await resolveManifestFile(manifestPath, ref);
    if (!resolved) continue;
    collectSpecies(await readJson(resolved, []), output, seenIds);
  }

  return output;
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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function indexSpecies(flora, fauna) {
  const byName = new Map();
  const records = [];

  const add = (item, kind) => {
    const record = {
      id: String(item.id || "").trim(),
      kind,
      title: String(item.title || item.name || item.taxonomy?.norsk_navn || "").trim(),
      latin: String(item.latin || item.taxonomy?.latin_navn || "").trim()
    };
    if (!record.id) return;

    records.push(record);
    const names = unique([
      record.id,
      record.title,
      record.latin,
      item.taxonomy?.norsk_navn,
      item.taxonomy?.latin_navn
    ].map(value => String(value || "").trim()));

    for (const name of names) {
      const key = norm(name);
      if (key && !byName.has(key)) byName.set(key, record);
    }
  };

  flora.forEach(item => add(item, "flora"));
  fauna.forEach(item => add(item, "fauna"));
  return { byName, records };
}

function lonLatToWebMercator(lon, lat) {
  const x = Number(lon) * 20037508.34 / 180;
  const limitedLat = Math.max(-85.05112878, Math.min(85.05112878, Number(lat)));
  const y = Math.log(Math.tan((90 + limitedLat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
  return { x, y };
}

function webMercatorToLonLat(x, y) {
  const lon = Number(x) / 20037508.34 * 180;
  let lat = Number(y) / 20037508.34 * 180;
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
  return { lon, lat };
}

function collectCoordinatePairs(node, output = []) {
  if (!Array.isArray(node)) return output;
  if (node.length >= 2 && Number.isFinite(Number(node[0])) && Number.isFinite(Number(node[1]))) {
    output.push([Number(node[0]), Number(node[1])]);
    return output;
  }
  for (const child of node) collectCoordinatePairs(child, output);
  return output;
}

function geometryToPolygons(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  throw new Error(`Ustøttet geometri: ${geometry.type}`);
}

function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const [x, y] = point;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  if (Math.abs(cross) > epsilon) return false;
  const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
  if (dot < -epsilon) return false;
  const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  return dot <= lengthSquared + epsilon;
}

function pointInRing(point, ring) {
  if (!Array.isArray(ring) || ring.length < 4) return false;
  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j];
    const b = ring[i];
    if (pointOnSegment(point, a, b)) return true;

    const [xi, yi] = b;
    const [xj, yj] = a;
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInPolygon(point, polygon) {
  if (!polygon?.length || !pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i += 1) {
    if (pointInRing(point, polygon[i])) return false;
  }
  return true;
}

function pointInGeometry(point, polygons) {
  return polygons.some(polygon => pointInPolygon(point, polygon));
}

function buildTiles(bbox, tileSizeM) {
  const min = lonLatToWebMercator(bbox[0], bbox[1]);
  const max = lonLatToWebMercator(bbox[2], bbox[3]);
  const tiles = [];
  let row = 0;

  for (let y0 = min.y; y0 < max.y; y0 += tileSizeM) {
    const y1 = Math.min(y0 + tileSizeM, max.y);
    let col = 0;
    for (let x0 = min.x; x0 < max.x; x0 += tileSizeM) {
      const x1 = Math.min(x0 + tileSizeM, max.x);
      const corners = [
        webMercatorToLonLat(x0, y0),
        webMercatorToLonLat(x1, y0),
        webMercatorToLonLat(x1, y1),
        webMercatorToLonLat(x0, y1)
      ];
      const center = webMercatorToLonLat((x0 + x1) / 2, (y0 + y1) / 2);
      const intersectsBySample = [center, ...corners].some(p => pointInGeometry([p.lon, p.lat], bbox.polygons));

      if (intersectsBySample) {
        const wkt = `POLYGON((${x0} ${y0},${x1} ${y0},${x1} ${y1},${x0} ${y1},${x0} ${y0}))`;
        tiles.push({ id: `r${row}c${col}`, row, col, x0, y0, x1, y1, wkt });
      }
      col += 1;
    }
    row += 1;
  }

  return tiles;
}

function isObservationLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Boolean(
    value.Id || value.id || value.TaxonId || value.taxonId ||
    value.ScientificName || value.scientificName || value.Name || value.name
  );
}

function findObservationArray(payload, depth = 0) {
  if (Array.isArray(payload)) {
    if (!payload.length || payload.some(isObservationLike)) return payload;
  }
  if (!payload || typeof payload !== "object" || depth > 5) return [];

  for (const key of ["Observations", "observations", "Results", "results", "Items", "items", "Data", "data"]) {
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(500 * attempt);
    }
  }
  throw lastError;
}

async function fetchTile(tile) {
  const baseUrl = new URL(CONFIG.endpoint);
  baseUrl.searchParams.set("gmWktPolygon", tile.wkt);
  baseUrl.searchParams.set("pageSize", String(CONFIG.pageSize));

  const firstPayload = await fetchJsonWithRetry(baseUrl);
  const observations = [...findObservationArray(firstPayload)];
  const reportedPage = Number(firstPayload?.PageIndex ?? firstPayload?.pageIndex ?? 0);
  const totalPages = Math.max(1, Number(firstPayload?.TotalPages ?? firstPayload?.totalPages ?? 1));
  const totalCount = Number(firstPayload?.TotalCount ?? firstPayload?.totalCount ?? observations.length);
  const reportedPageSize = Number(firstPayload?.PageSize ?? firstPayload?.pageSize ?? observations.length);

  if (totalPages > CONFIG.maxPagesPerTile) {
    throw new Error(`Tile ${tile.id} har ${totalPages} sider, over sikkerhetsgrensen ${CONFIG.maxPagesPerTile}`);
  }

  for (let offset = 1; offset < totalPages; offset += 1) {
    const pageUrl = new URL(baseUrl);
    pageUrl.searchParams.set("pageIndex", String(reportedPage + offset));
    const payload = await fetchJsonWithRetry(pageUrl);
    observations.push(...findObservationArray(payload));
    await sleep(CONFIG.requestDelayMs);
  }

  return {
    observations,
    diagnostic: {
      tileId: tile.id,
      totalCount,
      totalPages,
      reportedPage,
      reportedPageSize,
      extractedCount: observations.length,
      requestUrl: baseUrl.toString()
    }
  };
}

function observationKey(obs) {
  const explicit = obs?.Id ?? obs?.id;
  if (explicit !== undefined && explicit !== null && String(explicit).trim()) return `id:${explicit}`;

  const institution = obs?.InstitutionCode || obs?.Institution || "";
  const collection = obs?.CollectionCode || obs?.Collection || "";
  const catalog = obs?.CatalogNumber || "";
  if (institution || collection || catalog) return `cat:${institution}|${collection}|${catalog}`;

  return `fallback:${[
    obs?.TaxonId || obs?.taxonId || "",
    obs?.ScientificName || obs?.scientificName || "",
    obs?.Name || obs?.name || "",
    obs?.Longitude || obs?.longitude || "",
    obs?.Latitude || obs?.latitude || "",
    obs?.CollectedDate || obs?.EventDate || obs?.eventDate || ""
  ].join("|")}`;
}

function getCoordinate(obs) {
  const lon = Number(String(obs?.Longitude ?? obs?.longitude ?? "").replace(",", "."));
  const lat = Number(String(obs?.Latitude ?? obs?.latitude ?? "").replace(",", "."));
  return Number.isFinite(lon) && Number.isFinite(lat) ? { lon, lat } : null;
}

function getYear(obs) {
  const raw = obs?.CollectedDate || obs?.EventDate || obs?.eventDate || obs?.ObservedDate || obs?.Date || "";
  const match = String(raw).match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function getPrecision(obs) {
  const raw = obs?.Precision ?? obs?.CoordinateUncertaintyInMeters ?? obs?.coordinateUncertaintyInMeters ?? null;
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(String(raw).replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function observationNames(obs) {
  const values = [
    obs?.ScientificName,
    obs?.scientificName,
    obs?.ValidScientificName,
    obs?.Name,
    obs?.name,
    obs?.vernacularName,
    obs?.TaxonName,
    obs?.taxonName
  ];
  return unique(values.map(value => String(value || "").trim()));
}

function matchObservation(obs, speciesIndex) {
  for (const name of observationNames(obs)) {
    const match = speciesIndex.byName.get(norm(name));
    if (match) return match;
  }
  return null;
}

function taxonKey(obs) {
  const taxonId = String(obs?.TaxonId ?? obs?.taxonId ?? "").trim();
  if (taxonId) return `taxon:${taxonId}`;
  const scientific = String(obs?.ScientificName || obs?.scientificName || "").trim();
  const vernacular = String(obs?.Name || obs?.name || "").trim();
  return `name:${norm(scientific || vernacular || "unknown")}`;
}

function assessRank(obs) {
  const scientific = String(obs?.ScientificName || obs?.scientificName || "").trim();
  const epithet = String(obs?.specificEpithet || "").trim();
  const words = scientific.split(/\s+/).filter(Boolean);
  const excluded = /\b(sp\.?|spp\.?|gruppe|group|familie|orden|klasse)\b/i.test(scientific);
  return {
    likelySpecies: Boolean(!excluded && (epithet || words.length >= 2)),
    scientificWordCount: words.length,
    hasSpecificEpithet: Boolean(epithet)
  };
}

function makeSample(obs) {
  const coordinate = getCoordinate(obs);
  return {
    observationId: obs?.Id ?? obs?.id ?? null,
    taxonId: String(obs?.TaxonId ?? obs?.taxonId ?? "") || null,
    scientificName: String(obs?.ScientificName || obs?.scientificName || "") || null,
    name: String(obs?.Name || obs?.name || "") || null,
    year: getYear(obs),
    precisionM: getPrecision(obs),
    longitude: coordinate?.lon ?? null,
    latitude: coordinate?.lat ?? null,
    locality: String(obs?.Locality || obs?.locality || "") || null,
    institution: String(obs?.Institution || obs?.institution || "") || null,
    dataset: String(obs?.DatasetName || obs?.datasetName || "") || null
  };
}

function updateStats(record, obs) {
  const year = getYear(obs);
  const precision = getPrecision(obs);
  const taxonId = String(obs?.TaxonId ?? obs?.taxonId ?? "").trim();

  record.count += 1;
  if (year && (!record.latestYear || year > record.latestYear)) record.latestYear = year;
  if (year && (!record.earliestYear || year < record.earliestYear)) record.earliestYear = year;
  if (precision !== null && (record.minPrecisionM === null || precision < record.minPrecisionM)) record.minPrecisionM = precision;
  if (precision !== null && (record.maxPrecisionM === null || precision > record.maxPrecisionM)) record.maxPrecisionM = precision;
  if (taxonId) record.taxonIds.add(taxonId);
  if (record.samples.length < CONFIG.sampleLimit) record.samples.push(makeSample(obs));
}

function finalizeRecord(record) {
  return {
    ...record,
    taxonIds: [...record.taxonIds].sort(),
    names: record.names ? [...record.names].sort((a, b) => a.localeCompare(b, "no")) : undefined
  };
}

function markdownTableRows(items, type) {
  if (!items.length) return "| – | – | – | – |\n";
  return items.map(item => {
    if (type === "matched") {
      return `| ${item.title || "–"} | \`${item.cardId}\` | ${item.latin || "–"} | ${item.count} |`;
    }
    return `| ${item.scientificName || "–"} | ${item.norwegianName || "–"} | ${item.taxonId || "–"} | ${item.count} | ${item.rankAssessment?.likelySpecies ? "art" : "må vurderes"} |`;
  }).join("\n");
}

async function main() {
  const geometryReport = await readJson(CONFIG.geometryReport);
  const feature = geometryReport?.featureCollection?.features?.find(item => item?.properties?.Name === "Åkrafjorden")
    || geometryReport?.featureCollection?.features?.[0];
  if (!feature?.geometry) throw new Error("Fant ikke Åkrafjorden-geometrien i Vann-Nett-rapporten");

  const polygons = geometryToPolygons(feature.geometry);
  const pairs = collectCoordinatePairs(feature.geometry.coordinates);
  if (!pairs.length) throw new Error("Åkrafjorden-polygonen mangler koordinater");

  const bbox = [
    Math.min(...pairs.map(pair => pair[0])),
    Math.min(...pairs.map(pair => pair[1])),
    Math.max(...pairs.map(pair => pair[0])),
    Math.max(...pairs.map(pair => pair[1]))
  ];
  bbox.polygons = polygons;

  const [flora, fauna] = await Promise.all([
    loadSpeciesFromManifest(CONFIG.floraManifest),
    loadSpeciesFromManifest(CONFIG.faunaManifest)
  ]);
  const speciesIndex = indexSpecies(flora, fauna);
  const tiles = buildTiles(bbox, CONFIG.tileSizeM);

  console.log(`Åkrafjorden polygon: ${pairs.length} punkter, ${polygons.length} polygon(er)`);
  console.log(`Artskart-fliser som berører fjorden: ${tiles.length}`);
  console.log(`Kort i repoet: ${flora.length} flora, ${fauna.length} fauna`);

  const rawByKey = new Map();
  const tileDiagnostics = [];

  for (let index = 0; index < tiles.length; index += 1) {
    const tile = tiles[index];
    console.log(`[${index + 1}/${tiles.length}] ${tile.id}`);
    const fetched = await fetchTile(tile);
    tileDiagnostics.push(fetched.diagnostic);
    for (const obs of fetched.observations) rawByKey.set(observationKey(obs), obs);
    await sleep(CONFIG.requestDelayMs);
  }

  const counters = {
    rawUniqueObservations: rawByKey.size,
    missingCoordinate: 0,
    outsideExactPolygon: 0,
    beforeMinYear: 0,
    overMaxPrecision: 0,
    acceptedObservations: 0,
    acceptedMatchedObservations: 0,
    acceptedUnmatchedObservations: 0
  };

  const matchedByCard = new Map();
  const unmatchedByTaxon = new Map();

  for (const obs of rawByKey.values()) {
    const coordinate = getCoordinate(obs);
    if (!coordinate) {
      counters.missingCoordinate += 1;
      continue;
    }
    if (!pointInGeometry([coordinate.lon, coordinate.lat], polygons)) {
      counters.outsideExactPolygon += 1;
      continue;
    }

    const year = getYear(obs);
    if (year && year < CONFIG.minYear) {
      counters.beforeMinYear += 1;
      continue;
    }

    const precision = getPrecision(obs);
    if (precision !== null && precision > CONFIG.maxPrecisionM) {
      counters.overMaxPrecision += 1;
      continue;
    }

    counters.acceptedObservations += 1;
    const match = matchObservation(obs, speciesIndex);

    if (match) {
      counters.acceptedMatchedObservations += 1;
      const record = matchedByCard.get(match.id) || {
        cardId: match.id,
        kind: match.kind,
        title: match.title,
        latin: match.latin,
        count: 0,
        earliestYear: null,
        latestYear: null,
        minPrecisionM: null,
        maxPrecisionM: null,
        taxonIds: new Set(),
        samples: []
      };
      updateStats(record, obs);
      matchedByCard.set(match.id, record);
      continue;
    }

    counters.acceptedUnmatchedObservations += 1;
    const key = taxonKey(obs);
    const scientificName = String(obs?.ScientificName || obs?.scientificName || "").trim();
    const norwegianName = String(obs?.Name || obs?.name || "").trim();
    const record = unmatchedByTaxon.get(key) || {
      taxonId: String(obs?.TaxonId ?? obs?.taxonId ?? "").trim() || null,
      scientificName: scientificName || null,
      norwegianName: norwegianName && norwegianName !== scientificName ? norwegianName : null,
      kingdom: String(obs?.kingdom || "").trim() || null,
      phylum: String(obs?.phylum || "").trim() || null,
      class: String(obs?.klass || obs?.class || "").trim() || null,
      order: String(obs?.order || "").trim() || null,
      family: String(obs?.family || "").trim() || null,
      genus: String(obs?.genus || "").trim() || null,
      specificEpithet: String(obs?.specificEpithet || "").trim() || null,
      rankAssessment: assessRank(obs),
      names: new Set(observationNames(obs)),
      count: 0,
      earliestYear: null,
      latestYear: null,
      minPrecisionM: null,
      maxPrecisionM: null,
      taxonIds: new Set(),
      samples: []
    };
    for (const name of observationNames(obs)) record.names.add(name);
    updateStats(record, obs);
    unmatchedByTaxon.set(key, record);
  }

  const matched = [...matchedByCard.values()]
    .map(finalizeRecord)
    .sort((a, b) => b.count - a.count || String(a.title).localeCompare(String(b.title), "no"));
  const unmatched = [...unmatchedByTaxon.values()]
    .map(finalizeRecord)
    .sort((a, b) => Number(b.rankAssessment?.likelySpecies) - Number(a.rankAssessment?.likelySpecies)
      || b.count - a.count
      || String(a.scientificName || a.norwegianName).localeCompare(String(b.scientificName || b.norwegianName), "no"));

  const output = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    placeId: "akrafjorden",
    placeName: "Åkrafjorden",
    source: {
      geometryProvider: "Miljødirektoratet / Vann-Nett",
      waterBodyCode: feature.properties?.EUSurfaceWaterBodyCode || "NO0260020600-C",
      waterBodyId: feature.properties?.WaterBodyID || "0260020600-C",
      geometryReport: CONFIG.geometryReport,
      observationProvider: "Artsdatabanken / Artskart public API",
      observationEndpoint: CONFIG.endpoint
    },
    method: {
      geometryType: feature.geometry.type,
      polygonCount: polygons.length,
      ringCount: polygons.reduce((sum, polygon) => sum + polygon.length, 0),
      polygonCoordinateCount: pairs.length,
      bbox,
      tileSizeM: CONFIG.tileSizeM,
      tilesQueried: tiles.length,
      exactPointInPolygonFiltering: true,
      filters: {
        minYear: CONFIG.minYear,
        maxPrecisionM: CONFIG.maxPrecisionM,
        observationsWithoutYearAccepted: true,
        observationsWithoutPrecisionAccepted: true
      }
    },
    repositorySpeciesCounts: {
      flora: flora.length,
      fauna: fauna.length,
      total: speciesIndex.records.length
    },
    counters,
    tileDiagnostics,
    matchedCards: matched,
    unmatchedTaxa: unmatched,
    summary: {
      matchedCardCount: matched.length,
      matchedFloraCardCount: matched.filter(item => item.kind === "flora").length,
      matchedFaunaCardCount: matched.filter(item => item.kind === "fauna").length,
      unmatchedTaxonCount: unmatched.length,
      unmatchedLikelySpeciesCount: unmatched.filter(item => item.rankAssessment?.likelySpecies).length,
      unmatchedNeedsRankReviewCount: unmatched.filter(item => !item.rankAssessment?.likelySpecies).length
    }
  };

  await writeJson(CONFIG.outputJson, output);

  const likelySpecies = unmatched.filter(item => item.rankAssessment?.likelySpecies);
  const rankReview = unmatched.filter(item => !item.rankAssessment?.likelySpecies);
  const markdown = `# Åkrafjorden – eksakt Artskart-revisjon\n\n` +
    `## Metode\n\n` +
    `Artskart ble spurt gjennom ${tiles.length} små WebMercator-fliser som dekker Vann-Nett-vannforekomsten \`${output.source.waterBodyCode}\`. ` +
    `Alle returnerte observasjoner ble deduplisert og deretter kontrollert punkt for punkt mot den fullstendige offisielle polygonen med ${pairs.length} koordinatpunkter. ` +
    `Det gamle History GO-navnepunktet og radiusen ble ikke brukt som artsgrense.\n\n` +
    `Filtrering: år ${CONFIG.minYear} eller nyere når år er oppgitt, og presisjon høyst ${CONFIG.maxPrecisionM} meter når presisjon er oppgitt.\n\n` +
    `## Resultat\n\n` +
    `- Unike råobservasjoner fra flisene: **${counters.rawUniqueObservations}**\n` +
    `- Observasjoner innenfor eksakt fjordpolygon etter filtrering: **${counters.acceptedObservations}**\n` +
    `- Treff mot eksisterende History GO-kort: **${counters.acceptedMatchedObservations} observasjoner / ${matched.length} kort**\n` +
    `- Observasjoner uten kortmatch: **${counters.acceptedUnmatchedObservations} observasjoner / ${unmatched.length} taxa**\n` +
    `- Sannsynlige arter uten kort: **${likelySpecies.length}**\n` +
    `- Treff som må rangeres eller ryddes manuelt: **${rankReview.length}**\n\n` +
    `## Eksisterende kort som matcher\n\n` +
    `| Art | Kort-ID | Vitenskapelig navn | Observasjoner |\n|---|---|---|---:|\n${markdownTableRows(matched, "matched")}\n\n` +
    `## Sannsynlige arter uten kort\n\n` +
    `| Vitenskapelig navn | Norsk navn | Takson-ID | Observasjoner | Vurdering |\n|---|---|---:|---:|---|\n${markdownTableRows(likelySpecies, "unmatched")}\n\n` +
    `## Treff som må rangeres manuelt\n\n` +
    `| Vitenskapelig navn | Norsk navn | Takson-ID | Observasjoner | Vurdering |\n|---|---|---:|---:|---|\n${markdownTableRows(rankReview, "unmatched")}\n\n` +
    `Den fullstendige revisjonen med flisdiagnostikk, observasjonseksempler og presisjonsdata ligger i \`${CONFIG.outputJson}\`.\n`;

  await writeText(CONFIG.outputMarkdown, markdown);

  console.log(JSON.stringify(output.summary, null, 2));
  console.log(`Skrev ${CONFIG.outputJson}`);
  console.log(`Skrev ${CONFIG.outputMarkdown}`);
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
