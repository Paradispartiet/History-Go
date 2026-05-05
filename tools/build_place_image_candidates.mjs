#!/usr/bin/env node
// History Go: build image candidates for places.
// New places structure only.
// Manifest entries must look like:
//   places/by/oslo/places_by.json
// and are resolved to:
//   data/places/by/oslo/places_by.json
//
// Run:
//   node tools/build_place_image_candidates.mjs
//
// Optional, also check places that already have images:
//   node tools/build_place_image_candidates.mjs --include-existing
//
// Output:
//   data/places/place_image_candidates.json
//
// This script does not edit any place files.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MANIFEST_PATH = "data/places/manifest.json";
const OUT_PATH = "data/places/place_image_candidates.json";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const argv = process.argv.slice(2);
const INCLUDE_EXISTING = argv.includes("--include-existing");
const DEBUG = argv.includes("--debug");
const LIMIT_ARG = argv.find(arg => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Math.max(0, Number(LIMIT_ARG.split("=")[1]) || 0) : null;
const IDS_ARG = argv.find(arg => arg.startsWith("--ids="));
const IDS_FILTER = IDS_ARG
  ? new Set(IDS_ARG.split("=")[1].split(",").map(part => part.trim()).filter(Boolean))
  : null;
const SEED_FILE_ARG = argv.find(arg => arg.startsWith("--seed-file="));
const SEED_FILE = SEED_FILE_ARG ? SEED_FILE_ARG.split("=")[1].trim() : "";
const MAX_CANDIDATES = 5;
const REQUEST_DELAY_MS = 160;
const USER_AGENT = "HistoryGoImageCandidateBot/1.0 (https://github.com/Paradispartiet/History-Go)";

const abs = rel => path.join(ROOT, rel);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const hasText = value => typeof value === "string" && value.trim().length > 0;

function resolvePlacePath(manifestEntry) {
  if (typeof manifestEntry !== "string" || !manifestEntry.startsWith("places/")) {
    throw new Error(`Ugyldig manifest-entry for ny places-struktur: ${JSON.stringify(manifestEntry)}`);
  }
  return `data/${manifestEntry}`;
}

async function readJson(relPath) {
  return JSON.parse(await fs.readFile(abs(relPath), "utf8"));
}

async function writeJson(relPath, data) {
  await fs.mkdir(path.dirname(abs(relPath)), { recursive: true });
  await fs.writeFile(abs(relPath), JSON.stringify(data, null, 2) + "\n", "utf8");
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

function makeDiagnostics() {
  return {
    wikidataSearchCalls: 0,
    wikidataSearchErrors: [],
    wikidataEntitiesCalls: 0,
    wikidataEntitiesErrors: [],
    wikidataEntitiesWithP18: 0,
    commonsImageInfoCalls: 0,
    commonsImageInfoErrors: [],
    commonsGeoCalls: 0,
    commonsGeoErrors: [],
    commonsTextCalls: 0,
    commonsTextErrors: []
  };
}

function incDiag(diagnostics, key, by = 1) {
  if (!diagnostics || typeof diagnostics !== "object") return;
  const current = Number(diagnostics[key] || 0);
  diagnostics[key] = current + by;
}

function pushDiag(list, value, max = 40) {
  if (Array.isArray(list) && list.length < max) list.push(value);
}


function formatFetchError(err, url = null) {
  const name = err?.name || "Error";
  const message = err?.message || String(err);
  const cause = err?.cause;
  const causeCode = cause?.code ? ` code=${cause.code}` : "";
  const causeMessage = cause?.message ? ` cause=${cause.message}` : "";
  const target = url ? ` url=${url}` : "";
  return `${name}: ${message}${causeCode}${causeMessage}${target}`;
}

function apiUrl(base, params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchJson(url) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT
      }
    });
  } catch (err) {
    throw new Error(formatFetchError(err, url.toString()));
  }
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 220).replace(/\s+/g, " ").trim();
    throw new Error(`HTTP ${res.status} ${res.statusText} fra ${url.origin}; body=${snippet}`);
  }
  return res.json();
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function cleanLicenseUrl(value) {
  const raw = stripHtml(value);
  return raw.match(/https?:\/\/[^\s"<>]+/)?.[0] || raw;
}

function commonsFileTitle(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.startsWith("File:")) return text;
  return `File:${text.replace(/^File:/i, "")}`;
}

function extensionFrom(mime, url) {
  const ext = String(url || "").toLowerCase().split("?")[0].match(/\.([a-z0-9]{2,5})$/)?.[1];
  if (ext) return ext === "jpeg" ? "jpg" : ext;
  const m = String(mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  return "jpg";
}

function distMeters(aLat, aLon, bLat, bLon) {
  const R = 6371000;
  const rad = deg => Number(deg) * Math.PI / 180;
  const dLat = rad(Number(bLat) - Number(aLat));
  const dLon = rad(Number(bLon) - Number(aLon));
  const lat1 = rad(aLat);
  const lat2 = rad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function metaValue(meta, key) {
  return stripHtml(meta?.[key]?.value || "");
}

function normalizeImageInfo(title, page, info) {
  const meta = info?.extmetadata || {};
  const fileTitle = page?.title || title;
  const originalUrl = info?.url || "";
  return {
    fileTitle,
    originalUrl,
    thumbUrl: info?.thumburl || originalUrl,
    pageUrl: info?.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle.replaceAll(" ", "_"))}`,
    mime: info?.mime || "",
    width: Number(info?.width || 0),
    height: Number(info?.height || 0),
    extension: extensionFrom(info?.mime, originalUrl),
    objectName: metaValue(meta, "ObjectName"),
    author: metaValue(meta, "Artist"),
    credit: metaValue(meta, "Credit"),
    licenseShortName: metaValue(meta, "LicenseShortName"),
    licenseUrl: cleanLicenseUrl(meta?.LicenseUrl?.value || "")
  };
}

async function commonsImageInfo(fileTitle, diagnostics = null) {
  incDiag(diagnostics, "commonsImageInfoCalls");
  const title = commonsFileTitle(fileTitle);
  if (!title) return null;
  let data;
  try {
    data = await fetchJson(apiUrl(COMMONS_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: 900,
    iiextmetadatafilter: "Artist|Credit|ObjectName|LicenseShortName|LicenseUrl|UsageTerms"
  }));
  } catch (err) {
    pushDiag(diagnostics?.commonsImageInfoErrors, String(err?.message || err));
    throw err;
  }
  const page = data?.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  return info?.url ? normalizeImageInfo(title, page, info) : null;
}

function badTitle(title) {
  const t = norm(title);
  return ["locator_map", "location_map", "map_of", "karte", "coat_of_arms", "flag_of", "logo", "seal_of", "blank"].some(part => t.includes(part));
}

function labelScore(placeName, label, fileTitle) {
  const p = norm(placeName);
  const l = norm(label);
  const t = norm(fileTitle);
  if (!p) return 0;
  if (l === p || t.includes(p)) return 24;
  if (l.includes(p) || p.includes(l)) return 18;
  const parts = p.split("_").filter(part => part.length > 2);
  return Math.min(14, parts.filter(part => l.includes(part) || t.includes(part)).length * 4);
}

function scoreCandidate(place, source, imageInfo, label, distanceM) {
  let score = 0;
  if (source === "wikidata_p18") score += 82;
  if (source === "commons_geosearch") score += 45;
  if (source === "commons_text_search") score += 30;
  score += labelScore(place.name, label, imageInfo.fileTitle);
  if (Number.isFinite(distanceM)) {
    if (distanceM <= 80) score += 22;
    else if (distanceM <= 200) score += 16;
    else if (distanceM <= 650) score += 8;
    else if (distanceM > 1500) score -= 12;
  }
  if (badTitle(imageInfo.fileTitle)) score -= 28;
  return Math.max(0, Math.round(score));
}

function makeCandidate({ place, source, imageInfo, label = "", distanceM = null, wikidataItem = "", reasonOverride = "" }) {
  const ext = imageInfo.extension || "jpg";
  const imagePath = `bilder/places/auto/${place.id}.${ext}`;
  return {
    approved: false,
    source,
    score: scoreCandidate(place, source, imageInfo, label, distanceM),
    reason: reasonOverride || [
      source === "wikidata_p18" ? "bilde fra Wikidata P18" : "",
      source === "commons_geosearch" ? "Commons-fil med koordinater nær stedet" : "",
      source === "commons_text_search" ? "Commons-teksttreff på stedsnavn" : "",
      Number.isFinite(distanceM) ? `${distanceM} m fra stedets koordinat` : "",
      label ? `treff: ${label}` : ""
    ].filter(Boolean).join("; "),
    wikidataItem,
    label,
    fileTitle: imageInfo.fileTitle,
    originalUrl: imageInfo.originalUrl,
    thumbUrl: imageInfo.thumbUrl,
    pageUrl: imageInfo.pageUrl,
    mime: imageInfo.mime,
    width: imageInfo.width,
    height: imageInfo.height,
    author: imageInfo.author,
    credit: imageInfo.credit,
    licenseShortName: imageInfo.licenseShortName,
    licenseUrl: imageInfo.licenseUrl,
    distanceM: Number.isFinite(distanceM) ? distanceM : null,
    suggested: {
      image: imagePath,
      cardImage: imagePath
    }
  };
}

function usable(candidate) {
  const mime = String(candidate?.mime || "").toLowerCase();
  return Boolean(candidate?.originalUrl && mime.startsWith("image/") && !mime.includes("svg") && !mime.includes("gif"));
}

function rank(candidates) {
  const byUrl = new Map();
  for (const candidate of candidates.filter(usable)) {
    const key = candidate.originalUrl || candidate.fileTitle;
    const prev = byUrl.get(key);
    if (!prev || candidate.score > prev.score) byUrl.set(key, candidate);
  }
  return [...byUrl.values()]
    .sort((a, b) => (b.score - a.score) || String(a.fileTitle).localeCompare(String(b.fileTitle), "no"))
    .slice(0, MAX_CANDIDATES);
}

async function wikidataCandidates(place, diagnostics) {
  const ids = new Set();
  const searches = unique([place.name, `${place.name} Oslo`, `${place.name} Norway`]);

  for (const search of searches) {
    for (const language of ["nb", "en"]) {
      incDiag(diagnostics, "wikidataSearchCalls");
      let data;
      try {
        data = await fetchJson(apiUrl(WIKIDATA_API, {
        action: "wbsearchentities",
        format: "json",
        language,
        uselang: language,
        type: "item",
        limit: 8,
        search
      }));
      } catch (err) {
        pushDiag(diagnostics?.wikidataSearchErrors, `${search} (${language}): ${String(err?.message || err)}`);
        if (DEBUG) console.log(`[debug] wikidata search fail for ${place.id}: ${search} (${language}) => ${err.message}`);
        continue;
      }
      if (DEBUG) console.log(`[debug] wikidata search ${place.id}: "${search}" (${language}) => ${data?.search?.length || 0} treff`);
      for (const item of data?.search || []) {
        if (item?.id) ids.add(item.id);
      }
      await sleep(REQUEST_DELAY_MS);
    }
  }

  if (!ids.size) return [];

  incDiag(diagnostics, "wikidataEntitiesCalls");
  let data;
  try {
    data = await fetchJson(apiUrl(WIKIDATA_API, {
    action: "wbgetentities",
    format: "json",
    ids: [...ids].slice(0, 25).join("|"),
    props: "labels|claims",
    languages: "nb|nn|en"
  }));
  } catch (err) {
    pushDiag(diagnostics?.wikidataEntitiesErrors, String(err?.message || err));
    return [];
  }

  const out = [];
  for (const entity of Object.values(data?.entities || {})) {
    const file = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (!file) continue;
    incDiag(diagnostics, "wikidataEntitiesWithP18");
    const label = entity?.labels?.nb?.value || entity?.labels?.nn?.value || entity?.labels?.en?.value || "";
    const coord = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    const distanceM = coord ? distMeters(place.lat, place.lon, coord.latitude, coord.longitude) : null;
    const imageInfo = await commonsImageInfo(file, diagnostics);
    await sleep(REQUEST_DELAY_MS);
    if (!imageInfo) continue;
    out.push(makeCandidate({
      place,
      source: "wikidata_p18",
      imageInfo,
      label,
      distanceM,
      wikidataItem: entity.id ? `https://www.wikidata.org/wiki/${entity.id}` : ""
    }));
  }
  return out;
}

async function commonsGeoCandidates(place, diagnostics) {
  if (!Number.isFinite(Number(place.lat)) || !Number.isFinite(Number(place.lon))) return [];
  const radius = Math.min(2500, Math.max(650, Number(place.r || 0) * 3 || 650));
  incDiag(diagnostics, "commonsGeoCalls");
  let data;
  try {
    data = await fetchJson(apiUrl(COMMONS_API, {
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "geosearch",
    ggscoord: `${place.lat}|${place.lon}`,
    ggsradius: radius,
    ggslimit: 25,
    ggsnamespace: 6,
    prop: "coordinates|imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: 900,
    iiextmetadatafilter: "Artist|Credit|ObjectName|LicenseShortName|LicenseUrl|UsageTerms"
  }));
  } catch (err) {
    pushDiag(diagnostics?.commonsGeoErrors, String(err?.message || err));
    return [];
  }

  const out = [];
  for (const page of data?.query?.pages || []) {
    const info = page?.imageinfo?.[0];
    if (!info) continue;
    const imageInfo = normalizeImageInfo(page.title, page, info);
    const coord = page?.coordinates?.[0];
    const distanceM = coord ? distMeters(place.lat, place.lon, coord.lat, coord.lon) : null;
    out.push(makeCandidate({
      place,
      source: "commons_geosearch",
      imageInfo,
      label: imageInfo.objectName || page.title,
      distanceM
    }));
  }
  return out;
}

async function commonsTextCandidates(place, diagnostics) {
  const out = [];
  const searches = unique([`"${place.name}"`, `${place.name} Oslo`, `${place.name} Norway`]);
  for (const search of searches) {
    incDiag(diagnostics, "commonsTextCalls");
    let data;
    try {
      data = await fetchJson(apiUrl(COMMONS_API, {
        action: "query",
        format: "json",
        formatversion: "2",
        generator: "search",
        gsrsearch: search,
        gsrnamespace: 6,
        gsrlimit: 15,
        prop: "imageinfo",
        iiprop: "url|mime|size|extmetadata",
        iiurlwidth: 900,
        iiextmetadatafilter: "Artist|Credit|ObjectName|LicenseShortName|LicenseUrl|UsageTerms"
      }));
    } catch (err) {
      pushDiag(diagnostics?.commonsTextErrors, `${search}: ${String(err?.message || err)}`);
      if (DEBUG) console.log(`[debug] commons text fail ${place.id}: ${search} => ${err.message}`);
      continue;
    }
    if (DEBUG) console.log(`[debug] commons text ${place.id}: "${search}" => ${data?.query?.pages?.length || 0} sider`);

    for (const page of data?.query?.pages || []) {
      const info = page?.imageinfo?.[0];
      if (!info) continue;
      const imageInfo = normalizeImageInfo(page.title, page, info);
      out.push(makeCandidate({
        place,
        source: "commons_text_search",
        imageInfo,
        label: imageInfo.objectName || page.title
      }));
    }
    await sleep(REQUEST_DELAY_MS);
  }
  return out;
}


async function manualSeedCandidates(place, seedFile) {
  if (!seedFile) return [];
  const seedData = await readJson(seedFile);
  const seeds = Array.isArray(seedData?.seeds) ? seedData.seeds : [];
  const placeSeeds = seeds.filter(seed => seed?.place_id === place.id);

  return placeSeeds.map(seed => {
    const fileTitle = commonsFileTitle(seed.fileTitle || seed.pageUrl?.split("/").pop()?.replaceAll("_", " ") || "");
    const originalUrl = String(seed.originalUrl || "").trim();
    const pageUrl = String(seed.pageUrl || "").trim() || (fileTitle
      ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle.replaceAll(" ", "_"))}`
      : "");
    const mime = String(seed.mime || "").trim();
    const width = Number(seed.width || 0);
    const height = Number(seed.height || 0);
    const extension = extensionFrom(mime, originalUrl || pageUrl);

    return makeCandidate({
      place,
      source: "manual_seed",
      imageInfo: {
        fileTitle,
        originalUrl,
        thumbUrl: originalUrl,
        pageUrl,
        mime,
        width,
        height,
        extension,
        objectName: "",
        author: String(seed.author || "").trim(),
        credit: String(seed.credit || "").trim(),
        licenseShortName: String(seed.licenseShortName || "").trim(),
        licenseUrl: String(seed.licenseUrl || "").trim()
      },
      label: String(seed.note || "").trim(),
      reasonOverride: "manuelt seedet kandidat; krever manuell lisens- og bildesjekk"
    });
  });
}

async function candidatesFor(place, diagnostics) {
  const all = [];
  const seedCandidates = await manualSeedCandidates(place, SEED_FILE);
  if (seedCandidates.length) all.push(...seedCandidates);
  for (const fn of [wikidataCandidates, commonsGeoCandidates, commonsTextCandidates]) {
    try {
      all.push(...await fn(place, diagnostics));
    } catch (err) {
      console.warn(`[${place.id}] ${err.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }
  return rank(all);
}

async function loadPlaces() {
  const manifest = await readJson(MANIFEST_PATH);
  const entries = Array.isArray(manifest?.files) ? manifest.files : [];
  const places = [];

  for (const entry of entries) {
    const sourceFile = resolvePlacePath(entry);
    const data = await readJson(sourceFile);
    if (!Array.isArray(data)) throw new Error(`${sourceFile} må være en JSON-array`);
    data.forEach((place, index) => {
      if (place?.id) places.push({ place, sourceFile, index });
    });
  }

  return { entries, places };
}

async function main() {
  const { entries, places } = await loadPlaces();
  const filtered = places.filter(({ place }) => {
    if (IDS_FILTER && !IDS_FILTER.has(place?.id)) return false;
    if (!place || !place.id || place.hidden || place.stub) return false;
    if (INCLUDE_EXISTING) return true;
    return !hasText(place.image) || !hasText(place.cardImage);
  });

  const targets = LIMIT !== null ? filtered.slice(0, LIMIT) : filtered;
  const diagnostics = makeDiagnostics();

  const output = {
    schema: "historygo_place_image_candidates_v1",
    meta: {
      generatedAt: new Date().toISOString(),
      manifestPath: MANIFEST_PATH,
      structure: "new_only_data_places_category_city",
      sources: ["wikidata_p18", "commons_geosearch", "commons_text_search", "manual_seed"],
      note: "Kontroller kandidatene manuelt. Marker én kandidat per sted med approved: true før apply-scriptet kjøres.",
      diagnostics,
      counts: {
        manifestFiles: entries.length,
        placesTotal: places.length,
        placesChecked: targets.length
      }
    },
    places: []
  };

  for (const { place, sourceFile } of targets) {
    console.log(`[image-candidates] ${place.id} – ${place.name}`);
    const candidates = await candidatesFor(place, diagnostics);
    if (DEBUG) console.log(`[debug] ${place.id}: ${candidates.length} kandidater`);
    output.places.push({
      id: place.id,
      name: place.name,
      category: place.category || "",
      sourceFile,
      lat: Number(place.lat),
      lon: Number(place.lon),
      missing: {
        image: !hasText(place.image),
        cardImage: !hasText(place.cardImage)
      },
      status: candidates.length ? "needs_review" : "no_candidate_found",
      candidates
    });
  }

  output.meta.counts.placesWithCandidates = output.places.filter(place => place.candidates.length).length;
  output.meta.counts.candidatesTotal = output.places.reduce((sum, place) => sum + place.candidates.length, 0);

  await writeJson(OUT_PATH, output);
  console.log(`\nSkrev ${OUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
