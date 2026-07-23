import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const placeId = "brekkedammen";
const reportDir = "reports/visitoslo-parks-nature-audit-20260721/brekkedammen-recreation-anchor";
mkdirSync(reportDir, { recursive: true });

const OFFICIAL_PAGE = "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja/";
const LOCKED_WEIR = { sourceObjectId: "osm-way:66357555", lat: 59.9667474, lon: 10.7767656 };

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
async function fetchText(url, headers = {}) {
  const response = await fetch(url, { redirect: "follow", headers: { Accept: "text/html,application/json,*/*", "User-Agent": "History-Go-coordinate-audit/1.0", ...headers } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0,500)}`);
  return { url: response.url, text, contentType: response.headers.get("content-type") };
}
async function fetchJson(url, headers = {}) {
  const result = await fetchText(url, { Accept: "application/json", ...headers });
  return { ...result, data: JSON.parse(result.text) };
}
function collectObjects(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (!Array.isArray(value)) out.push(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectObjects(child, out);
  return out;
}
function ssrCoordinate(row) {
  const p = row.representasjonspunkt;
  if (Number.isFinite(Number(p?.nord)) && Number.isFinite(Number(p?.øst))) return { lat: Number(p.nord), lon: Number(p.øst), method: "representasjonspunkt.nord_øst" };
  const coords = row.geojson?.geometry?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) return { lat: Number(coords[1]), lon: Number(coords[0]), method: "geojson.geometry.coordinates" };
  return null;
}
function parseOsloCoordinates(text) {
  const patterns = [
    /@(-?\d{2}\.\d+),(-?\d{1,2}\.\d+)/g,
    /(?:lat|latitude)["'=:\s]+(-?\d{2}\.\d+)[\s\S]{0,100}?(?:lon|lng|longitude)["'=:\s]+(-?\d{1,2}\.\d+)/gi,
    /"coordinates"\s*:\s*\[\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{2}\.\d+)\s*\]/g,
    /(-?59\.\d{4,}),\s*(10\.\d{4,})/g
  ];
  const out = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text))) {
      let lat, lon;
      if (pattern.source.startsWith('"coordinates"')) { lon = Number(match[1]); lat = Number(match[2]); }
      else { lat = Number(match[1]); lon = Number(match[2]); }
      if (lat >= 59.8 && lat <= 60.1 && lon >= 10.5 && lon <= 10.95) out.push({ lat, lon, matched: match[0] });
    }
  }
  const unique = new Map();
  for (const p of out) unique.set(`${p.lat.toFixed(7)},${p.lon.toFixed(7)}`, p);
  return [...unique.values()];
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((p) => p.id === placeId || norm(p.name) === norm("Brekkedammen"))) throw new Error("Brekkedammen already canonical on current main.");

// 1) Exact Kartverket SSR name in Oslo.
const ssrAttempts = [];
for (const endpoint of ["navn", "sted"]) {
  const params = new URLSearchParams({ sok: "Brekkedammen", knr: "0301", treffPerSide: "100", side: "1" });
  const url = `https://api.kartverket.no/stedsnavn/v1/${endpoint}?${params.toString()}`;
  ssrAttempts.push({ endpoint, url, data: (await fetchJson(url)).data });
}
const ssrRows = ssrAttempts.flatMap((attempt) => Array.isArray(attempt.data?.navn) ? attempt.data.navn : []);
const exactSsrRows = ssrRows.filter((row) => {
  const spellings = [row.skrivemåte, ...(row.stedsnavn ?? []).map((s) => s.skrivemåte)].filter(Boolean).map(norm);
  return spellings.includes(norm("Brekkedammen")) && row.stedstatus === "aktiv";
});
const uniqueSsrByNumber = new Map();
for (const row of exactSsrRows) uniqueSsrByNumber.set(String(row.stedsnummer), row);
const ssrCandidates = [...uniqueSsrByNumber.values()].map((row) => ({
  stedsnummer: row.stedsnummer,
  navneobjekttype: row.navneobjekttype,
  coordinate: ssrCoordinate(row),
  rawRow: row
})).filter((row) => row.coordinate);

// 2) Official Oslo bathing page source snapshot and any encoded map/location coordinates.
const official = await fetchText(OFFICIAL_PAGE);
writeFileSync(`${reportDir}/official-page.html`, official.text, "utf8");
const officialPageCoordinates = parseOsloCoordinates(`${official.url}\n${official.text}`);
const outgoingLinks = [...official.text.matchAll(/href=["']([^"']+)["']/gi)].map((m) => {
  try { return new URL(m[1], official.url).href; } catch { return null; }
}).filter(Boolean);
const mapLikeLinks = [...new Set(outgoingLinks.filter((url) => /map|kart|maps|norgeskart|google/i.test(url)))];
const resolvedMapLinks = [];
for (const url of mapLikeLinks.slice(0,20)) {
  try {
    const page = await fetchText(url);
    resolvedMapLinks.push({ sourceUrl: url, finalUrl: page.url, coordinates: parseOsloCoordinates(`${page.url}\n${page.text}`), htmlPreview: page.text.slice(0,2000) });
  } catch (error) {
    resolvedMapLinks.push({ sourceUrl: url, error: String(error) });
  }
}

// 3) OSM exact-name objects around the locked weir, including recreation/bathing semantics.
const nomParams = new URLSearchParams({ q: "Brekkedammen, Oslo, Norway", format: "jsonv2", addressdetails: "1", extratags: "1", namedetails: "1", polygon_geojson: "1", limit: "30", bounded: "1", viewbox: "10.74,59.99,10.81,59.94" });
const nomUrl = `https://nominatim.openstreetmap.org/search?${nomParams.toString()}`;
const nomRows = (await fetchJson(nomUrl, { "User-Agent": "History-Go-coordinate-audit/1.0" })).data;
const exactOsmRows = nomRows.filter((row) => {
  const names = [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})].filter((v) => typeof v === "string").map(norm);
  return names.includes(norm("Brekkedammen")) || names.includes(norm("Kjelsåsdammen"));
}).map((row) => ({
  sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
  sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
  lat: Number(row.lat), lon: Number(row.lon), category: row.category, class: row.class, type: row.type, displayName: row.display_name, geojsonType: row.geojson?.type ?? null, extratags: row.extratags ?? null
}));

// 4) Proximity checks for every authoritative/semantic candidate.
const allCandidatePoints = [];
for (const ssr of ssrCandidates) allCandidatePoints.push({ source: `kartverket-ssr:${ssr.stedsnummer}`, kind: `SSR ${ssr.navneobjekttype}`, ...ssr.coordinate });
for (const p of officialPageCoordinates) allCandidatePoints.push({ source: "oslo-official-page-encoded", kind: "official_page", lat: p.lat, lon: p.lon });
for (const link of resolvedMapLinks) for (const p of link.coordinates ?? []) allCandidatePoints.push({ source: link.finalUrl ?? link.sourceUrl, kind: "official_linked_map", lat: p.lat, lon: p.lon });
for (const osm of exactOsmRows) allCandidatePoints.push({ source: osm.sourceObjectId, kind: `OSM ${osm.type ?? osm.category}`, lat: osm.lat, lon: osm.lon });
const dedupPoints = new Map();
for (const p of allCandidatePoints) dedupPoints.set(`${p.source}|${p.lat.toFixed(7)},${p.lon.toFixed(7)}`, p);
const candidatePoints = [...dedupPoints.values()].map((p) => ({
  ...p,
  distanceFromLockedWeirM: Math.round(haversineMeters(p, LOCKED_WEIR) * 10) / 10,
  distanceFromBrekkePowerStationM: (() => {
    const power = places.find((place) => place.id === "frysja_33_brekke_kraftstasjon");
    return power ? Math.round(haversineMeters(p, { lat: Number(power.lat), lon: Number(power.lon) }) * 10) / 10 : null;
  })()
}));

// Conservative decision: prefer an exact official bathing/recreation object or explicit official linked map point.
// An SSR object of type Badeplass/Badested may qualify. Generic Dam/Weir does not.
const ssrRecreation = ssrCandidates.filter((row) => /badeplass|badested|friluft|rekreasjon/i.test(String(row.navneobjekttype)));
const officialLinkedDistinct = candidatePoints.filter((p) => p.kind === "official_linked_map" && p.distanceFromLockedWeirM <= 250);
let selected = null;
let status = "coordinate_blocked_no_recreation_site_anchor";
if (ssrRecreation.length === 1) {
  const row = ssrRecreation[0];
  selected = {
    authority: "kartverket_ssr_recreation_place",
    sourceProvider: "kartverket",
    sourceObjectId: `kartverket-ssr:${row.stedsnummer}`,
    sourceUrl: ssrAttempts.find((a) => a.endpoint === "sted")?.url,
    lat: row.coordinate.lat,
    lon: row.coordinate.lon,
    navneobjekttype: row.navneobjekttype,
    coordType: "named_place_anchor"
  };
  status = "verified_recreation_site_candidate";
} else if (officialLinkedDistinct.length === 1) {
  const p = officialLinkedDistinct[0];
  selected = {
    authority: "oslo_official_linked_map",
    sourceProvider: "manual_research",
    sourceObjectId: "oslo-kommune:brekkedammen-badeplass-map",
    sourceUrl: p.source,
    lat: p.lat,
    lon: p.lon,
    coordType: "official_recreation_site_anchor"
  };
  status = "verified_recreation_site_candidate";
}

const result = {
  version: DATE,
  placeId,
  status,
  scopeStatus: "approved_new_physical_place",
  representationLock: "Brekkedammen ved Frysja as the named bathing/recreation site in upper Akerselva. The weir is a physical/historical subfeature and must not by itself define the whole canonical place.",
  selected,
  officialSource: { url: OFFICIAL_PAGE, title: "Brekkedammen ved Frysja", statement: "Oslo kommune identifies Brekkedammen ved Frysja as a popular bathing place in the upper Akerselva." },
  lockedWeirEvidence: { ...LOCKED_WEIR, role: "physical_subfeature_not_sufficient_as_whole_site_anchor" },
  ssrCandidates,
  officialPageCoordinates,
  officialMapLinks: resolvedMapLinks,
  exactOsmRows,
  candidatePoints,
  duplicateGate: {
    canonicalIdentityMatches: [],
    nearbyCanonical: places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)) && haversineMeters(LOCKED_WEIR, { lat: Number(p.lat), lon: Number(p.lon) }) <= 100).map((p) => ({ id: p.id, name: p.name, category: p.category, distanceFromWeirM: Math.round(haversineMeters(LOCKED_WEIR, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 }))
  }
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Brekkedammen — recreation-site anchor audit\n\nDate: ${DATE}\n\nStatus: **${status}**\n\nThe canonical scope is the Oslo municipality bathing/recreation place, not merely OSM way 66357555 (the weir). The runner queries Kartverket SSR, the official municipal bathing page and its map-like links, and exact named OSM objects. It only unblocks production when one exact recreation/bathing identity or one explicit official linked-map anchor resolves.\n`, "utf8");
console.log(`Brekkedammen recreation anchor: ${status}; selected=${selected?.sourceObjectId ?? "none"}; ssr=${ssrCandidates.map((s) => `${s.stedsnummer}:${s.navneobjekttype}`).join(",") || "none"}; officialLinked=${officialLinkedDistinct.length}`);
