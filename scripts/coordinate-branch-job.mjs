import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const placeId = "brekkedammen";
const RELATION_ID = 14334474;
const WEIR_ID = 66357555;
const OFFICIAL_PAGE = "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja/";
const reportDir = "reports/visitoslo-parks-nature-audit-20260721/brekkedammen-waterbody-topology";
mkdirSync(reportDir, { recursive: true });

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

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "text/html,application/json,*/*",
      "User-Agent": "History-Go-coordinate-audit/1.0",
      ...headers
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return { finalUrl: response.url, text, contentType: response.headers.get("content-type") };
}

async function fetchJson(url, headers = {}) {
  const result = await fetchText(url, { Accept: "application/json", ...headers });
  return { ...result, data: JSON.parse(result.text) };
}

function splitNames(value) {
  if (typeof value !== "string") return [];
  return [value, ...value.split(/[;|]/g)].map((item) => item.trim()).filter(Boolean);
}

function acceptedNames(row, tags) {
  const values = [
    row?.name,
    String(row?.display_name ?? "").split(",")[0],
    ...Object.values(row?.namedetails ?? {}),
    ...Object.entries(tags ?? {})
      .filter(([key]) => /(^name$|name:|alt_name|official_name|loc_name|short_name|old_name)/i.test(key))
      .flatMap(([, value]) => splitNames(value))
  ].flatMap(splitNames);
  return [...new Set(values.map((value) => ({ raw: value, normalized: norm(value) })).filter((entry) => entry.normalized).map((entry) => JSON.stringify(entry)))].map((entry) => JSON.parse(entry));
}

function getOuterRings(geojson) {
  if (!geojson) return [];
  if (geojson.type === "Polygon") return geojson.coordinates?.[0] ? [geojson.coordinates[0]] : [];
  if (geojson.type === "MultiPolygon") return (geojson.coordinates ?? []).map((polygon) => polygon?.[0]).filter(Boolean);
  return [];
}

function rawRingArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function projector(points) {
  const avgLat = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  const avgLon = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const cos = Math.cos(avgLat * Math.PI / 180);
  return {
    toXY([lon, lat]) {
      return [(lon - avgLon) * 111320 * cos, (lat - avgLat) * 110540];
    },
    toLonLat([x, y]) {
      return [avgLon + x / (111320 * cos), avgLat + y / 110540];
    }
  };
}

function polygonCentroid(ring) {
  const projection = projector(ring);
  const points = ring.map((point) => projection.toXY(point));
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-9) throw new Error("Cannot compute centroid for zero-area ring.");
  const centroidXY = [cx / (3 * twiceArea), cy / (3 * twiceArea)];
  const [lon, lat] = projection.toLonLat(centroidXY);
  return { lat, lon };
}

function pointInRing(point, ring) {
  const x = point.lon;
  const y = point.lat;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointSegmentDistanceMeters(point, a, b, projection) {
  const p = projection.toXY(point);
  const p1 = projection.toXY(a);
  const p2 = projection.toXY(b);
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const denom = dx * dx + dy * dy;
  const t = denom === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - p1[0]) * dx + (p[1] - p1[1]) * dy) / denom));
  const qx = p1[0] + t * dx;
  const qy = p1[1] + t * dy;
  return Math.hypot(p[0] - qx, p[1] - qy);
}

function boundaryDistances(line, ring) {
  const projection = projector([...line, ...ring]);
  const distances = line.map((point) => {
    let min = Infinity;
    for (let i = 0; i < ring.length - 1; i += 1) {
      min = Math.min(min, pointSegmentDistanceMeters(point, ring[i], ring[i + 1], projection));
    }
    return min;
  });
  return {
    minM: Math.min(...distances),
    maxM: Math.max(...distances),
    meanM: distances.reduce((sum, value) => sum + value, 0) / distances.length,
    pointsWithin20m: distances.filter((value) => value <= 20).length,
    pointCount: distances.length,
    distancesM: distances
  };
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places.filter((place) => place.id === placeId || norm(place.name) === norm("Brekkedammen") || norm(place.name) === norm("Kjelsåsdammen"));
if (identityMatches.length > 0) throw new Error(`Brekkedammen identity already canonical on current main: ${identityMatches.map((place) => place.id).join(", ")}`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${RELATION_ID},W${WEIR_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const lookup = await fetchJson(lookupUrl);
const relationRow = lookup.data.find((row) => row.osm_type === "relation" && Number(row.osm_id) === RELATION_ID);
const weirRow = lookup.data.find((row) => row.osm_type === "way" && Number(row.osm_id) === WEIR_ID);
if (!relationRow || !weirRow) throw new Error(`Exact OSM lookup did not return both locked objects. Returned: ${lookup.data.map((row) => `${row.osm_type}:${row.osm_id}`).join(", ")}`);

const relationApiUrl = `https://api.openstreetmap.org/api/0.6/relation/${RELATION_ID}.json`;
const wayApiUrl = `https://api.openstreetmap.org/api/0.6/way/${WEIR_ID}.json`;
const [relationApi, wayApi, official] = await Promise.all([
  fetchJson(relationApiUrl),
  fetchJson(wayApiUrl),
  fetchText(OFFICIAL_PAGE)
]);

const relationElement = relationApi.data.elements?.find((element) => element.type === "relation" && Number(element.id) === RELATION_ID);
const wayElement = wayApi.data.elements?.find((element) => element.type === "way" && Number(element.id) === WEIR_ID);
if (!relationElement || !wayElement) throw new Error("OSM API did not return both locked object metadata records.");

const relationNames = acceptedNames(relationRow, relationElement.tags);
const weirNames = acceptedNames(weirRow, wayElement.tags);
const acceptedWaterbodyIdentity = relationNames.some((entry) => entry.normalized === norm("Brekkedammen") || entry.normalized === norm("Kjelsåsdammen"));
const acceptedWeirIdentity = weirNames.some((entry) => entry.normalized === norm("Brekkedammen"));

const relationRings = getOuterRings(relationRow.geojson);
if (relationRings.length === 0) throw new Error(`Locked relation ${RELATION_ID} has no Polygon/MultiPolygon geometry.`);
const largestRing = [...relationRings].sort((a, b) => Math.abs(rawRingArea(b)) - Math.abs(rawRingArea(a)))[0];
const centroid = polygonCentroid(largestRing);
const centroidInside = pointInRing(centroid, largestRing);

if (weirRow.geojson?.type !== "LineString" || !Array.isArray(weirRow.geojson.coordinates) || weirRow.geojson.coordinates.length < 2) {
  throw new Error(`Locked weir ${WEIR_ID} does not have a usable LineString geometry.`);
}
const topology = boundaryDistances(weirRow.geojson.coordinates, largestRing);
const weirTouchesWaterbodyBoundary = topology.minM <= 20 && topology.pointsWithin20m >= Math.max(1, Math.ceil(topology.pointCount / 2));

const relationSemanticGate = relationRow.category === "water" && relationRow.type === "reservoir" && relationElement.tags?.natural === "water";
const weirSemanticGate = weirRow.category === "waterway" && weirRow.type === "weir";
const officialSemanticGate = norm(official.text).includes(norm("Brekkedammen")) && /badeplass|bading|badested/i.test(official.text);
const officialLinkGate = [weirRow.extratags?.website, wayElement.tags?.website].filter(Boolean).some((url) => /oslo\.kommune\.no/i.test(url) && /brekkedammen/i.test(url));

const status = acceptedWaterbodyIdentity && acceptedWeirIdentity && relationSemanticGate && weirSemanticGate && weirTouchesWaterbodyBoundary && centroidInside && officialSemanticGate && officialLinkGate
  ? "verified_named_waterbody_geometry_candidate"
  : "coordinate_blocked_waterbody_identity_or_topology_not_proven";

const result = {
  version: DATE,
  placeId,
  status,
  scopeStatus: "approved_new_physical_place",
  representationDecision: status === "verified_named_waterbody_geometry_candidate"
    ? "Model the physical impounded waterbody Brekkedammen/Kjelsåsdammen as the canonical place. Bathing and recreation are current use layers of the same place; OSM way 66357555 is the named downstream weir/boundary subfeature, not a standalone substitute for the whole waterbody."
    : "No production decision. Do not invent a bathing-place pin and do not use nearest/first-hit selection.",
  lockedObjects: {
    waterbody: `osm-relation:${RELATION_ID}`,
    weir: `osm-way:${WEIR_ID}`
  },
  gates: {
    acceptedWaterbodyIdentity,
    acceptedWeirIdentity,
    relationSemanticGate,
    weirSemanticGate,
    weirTouchesWaterbodyBoundary,
    centroidInside,
    officialSemanticGate,
    officialLinkGate
  },
  waterbody: {
    sourceObjectId: `osm-relation:${RELATION_ID}`,
    sourceUrl: `https://www.openstreetmap.org/relation/${RELATION_ID}`,
    displayName: relationRow.display_name,
    category: relationRow.category,
    type: relationRow.type,
    geojsonType: relationRow.geojson?.type,
    namedetails: relationRow.namedetails ?? {},
    extratags: relationRow.extratags ?? {},
    apiTags: relationElement.tags ?? {},
    acceptedNames: relationNames,
    proposedCoordinate: {
      lat: centroid.lat,
      lon: centroid.lon,
      coordType: "polygon_centroid",
      insideGeometry: centroidInside
    }
  },
  weir: {
    sourceObjectId: `osm-way:${WEIR_ID}`,
    sourceUrl: `https://www.openstreetmap.org/way/${WEIR_ID}`,
    displayName: weirRow.display_name,
    category: weirRow.category,
    type: weirRow.type,
    geojsonType: weirRow.geojson?.type,
    namedetails: weirRow.namedetails ?? {},
    extratags: weirRow.extratags ?? {},
    apiTags: wayElement.tags ?? {},
    acceptedNames: weirNames,
    boundaryTopology: {
      minDistanceM: Math.round(topology.minM * 10) / 10,
      maxDistanceM: Math.round(topology.maxM * 10) / 10,
      meanDistanceM: Math.round(topology.meanM * 10) / 10,
      pointsWithin20m: topology.pointsWithin20m,
      pointCount: topology.pointCount
    }
  },
  officialSource: {
    url: OFFICIAL_PAGE,
    finalUrl: official.finalUrl,
    semanticGate: officialSemanticGate,
    statement: "Oslo kommune treats Brekkedammen ved Frysja as a bathing place in the upper Akerselva. This is interpreted as a present-day use layer of the same named physical dam/pond when the exact OSM waterbody identity and boundary topology are independently verified."
  },
  duplicateGate: {
    canonicalIdentityMatches: identityMatches
  },
  methodology: {
    selection: "exact locked OSM object IDs and explicit name/topology gates only",
    rejected: ["nearest selection", "first-hit selection", "arbitrary beach pin", "using the weir centroid as the whole waterbody"]
  }
};

writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Brekkedammen — waterbody identity and topology audit\n\nDate: ${DATE}\n\nStatus: **${status}**\n\nThis pass tests whether exact OSM relation ${RELATION_ID} is the named Brekkedammen/Kjelsåsdammen waterbody and whether exact weir way ${WEIR_ID} forms its physical boundary. It does not select by proximity and it does not invent a bathing-place point.\n\nIf all gates pass, the correct canonical model is the physical impounded waterbody with bathing/recreation as a use layer and the named weir as a boundary subfeature.\n`, "utf8");

console.log(`Brekkedammen waterbody topology: ${status}`);
console.log(`waterbody names: ${relationNames.map((entry) => entry.raw).join(" | ")}`);
console.log(`weir names: ${weirNames.map((entry) => entry.raw).join(" | ")}`);
console.log(`topology: min=${topology.minM.toFixed(1)}m max=${topology.maxM.toFixed(1)}m within20=${topology.pointsWithin20m}/${topology.pointCount}`);
console.log(`centroid: ${centroid.lat},${centroid.lon}; inside=${centroidInside}`);
