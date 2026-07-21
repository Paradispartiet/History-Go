import { mkdirSync, writeFileSync } from "node:fs";

const reportDir = "reports/visitoslo-oslofjord-audit-20260721/island-coordinate-intake-ssr";
mkdirSync(reportDir, { recursive: true });

const candidates = [
  { id: "heggholmen", name: "Heggholmen" },
  { id: "rambergoya", name: "Rambergøya" }
];

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function collectObjects(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (!Array.isArray(value)) out.push(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectObjects(child, out);
  return out;
}

function findExactNameObjects(raw, wantedName) {
  const wanted = norm(wantedName);
  return collectObjects(raw).filter((obj) => {
    const values = Object.values(obj)
      .filter((value) => typeof value === "string")
      .map(norm);
    return values.includes(wanted);
  });
}

function extractCoordinate(obj) {
  const directLat = obj.lat ?? obj.latitude ?? obj.nord ?? obj.y;
  const directLon = obj.lon ?? obj.lng ?? obj.longitude ?? obj.ost ?? obj.x;
  if (Number.isFinite(Number(directLat)) && Number.isFinite(Number(directLon))) {
    const lat = Number(directLat);
    const lon = Number(directLon);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon, source: "direct_fields" };
  }
  for (const [key, value] of Object.entries(obj)) {
    if (!value || typeof value !== "object") continue;
    if (/representasjonspunkt|punkt|geometry|geometri/i.test(key)) {
      const nested = extractCoordinate(value);
      if (nested) return { ...nested, source: `${key}.${nested.source}` };
      if (Array.isArray(value.coordinates) && value.coordinates.length >= 2) {
        const [lon, lat] = value.coordinates.map(Number);
        if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
          return { lat, lon, source: `${key}.coordinates` };
        }
      }
    }
  }
  return null;
}

async function querySsr(candidate) {
  const attempts = [];
  for (const endpoint of ["navn", "sted"]) {
    const params = new URLSearchParams({ sok: candidate.name, knr: "0301", treffPerSide: "100", side: "1" });
    const url = `https://api.kartverket.no/stedsnavn/v1/${endpoint}?${params.toString()}`;
    const data = await fetchJson(url);
    attempts.push({ endpoint, url, data });
  }
  const exactObjects = attempts.flatMap((attempt) => findExactNameObjects(attempt.data, candidate.name));
  const withCoordinates = exactObjects
    .map((obj) => ({ obj, coordinate: extractCoordinate(obj) }))
    .filter((row) => row.coordinate);
  return { attempts, exactObjects, withCoordinates };
}

async function queryNatureReserve(where) {
  const params = new URLSearchParams({
    where,
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson"
  });
  const url = `https://kart.miljodirektoratet.no/arcgis/rest/services/vern/FeatureServer/0/query?${params.toString()}`;
  return { url, data: await fetchJson(url) };
}

const natureQueries = {
  heggholmen: await queryNatureReserve("naturvernId='VV00002668'"),
  rambergoya: await queryNatureReserve("navn LIKE '%Ramberg%' OR offisieltNavn LIKE '%Ramberg%'")
};

const summary = [];
for (const candidate of candidates) {
  const ssr = await querySsr(candidate);
  const exactCoordinateRows = ssr.withCoordinates;
  const uniqueCoordinates = [];
  for (const row of exactCoordinateRows) {
    const key = `${row.coordinate.lat.toFixed(7)},${row.coordinate.lon.toFixed(7)}`;
    if (!uniqueCoordinates.some((item) => item.key === key)) uniqueCoordinates.push({ key, ...row });
  }

  const selected = uniqueCoordinates.length === 1 ? uniqueCoordinates[0] : null;
  const reserve = natureQueries[candidate.id];
  const result = {
    version: "2026-07-21",
    placeId: candidate.id,
    name: candidate.name,
    status: selected ? "verified_ssr_namepoint_candidate" : "needs_review",
    selectionRule: "exact official Kartverket SSR name in Oslo municipality with one unique geographic representation point; no fuzzy/nearest selection",
    selected: selected ? {
      lat: selected.coordinate.lat,
      lon: selected.coordinate.lon,
      coordinateSourcePath: selected.coordinate.source,
      sourceProvider: "kartverket_ssr",
      sourceObjectId: null,
      rawObject: selected.obj
    } : null,
    exactNameObjectCount: ssr.exactObjects.length,
    uniqueCoordinateCount: uniqueCoordinates.length,
    uniqueCoordinateCandidates: uniqueCoordinates.map((row) => ({ coordinate: row.coordinate, rawObject: row.obj })),
    ssrAttempts: ssr.attempts,
    natureReserveCrosscheck: {
      url: reserve.url,
      featureCount: reserve.data?.features?.length ?? 0,
      features: reserve.data?.features ?? []
    }
  };
  mkdirSync(`${reportDir}/${candidate.id}`, { recursive: true });
  writeFileSync(`${reportDir}/${candidate.id}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  summary.push({ placeId: candidate.id, name: candidate.name, status: result.status, selected: result.selected, exactNameObjectCount: result.exactNameObjectCount, uniqueCoordinateCount: result.uniqueCoordinateCount, natureReserveFeatureCount: result.natureReserveCrosscheck.featureCount });
  console.log(`${candidate.id}: ${result.status}; unique SSR coordinate count=${uniqueCoordinates.length}; reserve features=${result.natureReserveCrosscheck.featureCount}`);
}

writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify({ version: "2026-07-21", results: summary }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
