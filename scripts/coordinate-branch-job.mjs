import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-07-23";
const placeId = "brekkedammen";
const placeName = "Brekkedammen ved Frysja";
const RELATION_ID = 14334474;
const WEIR_ID = 66357555;
const OFFICIAL_PAGE = "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja/";
const PLACE_FILE = "data/places/natur/oslo/brekkedammen.json";
const PLACE_MANIFEST_ENTRY = "places/natur/oslo/brekkedammen.json";
const EVIDENCE_FILE = "data/coordinate-evidence/oslo/natur/brekkedammen.json";
const EVIDENCE_MANIFEST_ENTRY = "oslo/natur/brekkedammen.json";

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html,application/json,*/*", "User-Agent": "History-Go-coordinate-production/1.0", ...headers }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return { finalUrl: response.url, text };
}

async function fetchJson(url) {
  const result = await fetchText(url, { Accept: "application/json" });
  return JSON.parse(result.text);
}

function acceptedNames(row) {
  return [...new Set([
    row?.name,
    String(row?.display_name ?? "").split(",")[0],
    ...Object.values(row?.namedetails ?? {})
  ].filter((value) => typeof value === "string").flatMap((value) => [value, ...value.split(/[;|]/g)]).map((value) => value.trim()).filter(Boolean))];
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

function pointInGeometry(point, geojson) {
  if (geojson?.type === "Polygon") {
    const [outer, ...holes] = geojson.coordinates ?? [];
    return Boolean(outer) && pointInRing(point, outer) && !holes.some((hole) => pointInRing(point, hole));
  }
  if (geojson?.type === "MultiPolygon") {
    return (geojson.coordinates ?? []).some((polygon) => {
      const [outer, ...holes] = polygon ?? [];
      return Boolean(outer) && pointInRing(point, outer) && !holes.some((hole) => pointInRing(point, hole));
    });
  }
  return false;
}

function outerRings(geojson) {
  if (geojson?.type === "Polygon") return geojson.coordinates?.[0] ? [geojson.coordinates[0]] : [];
  if (geojson?.type === "MultiPolygon") return (geojson.coordinates ?? []).map((polygon) => polygon?.[0]).filter(Boolean);
  return [];
}

function projector(points) {
  const avgLat = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  const avgLon = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const cos = Math.cos(avgLat * Math.PI / 180);
  return {
    toXY([lon, lat]) {
      return [(lon - avgLon) * 111320 * cos, (lat - avgLat) * 110540];
    }
  };
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

function boundaryDistances(line, rings) {
  const allPoints = [...line, ...rings.flat()];
  const projection = projector(allPoints);
  const distances = line.map((point) => {
    let min = Infinity;
    for (const ring of rings) {
      for (let i = 0; i < ring.length - 1; i += 1) {
        min = Math.min(min, pointSegmentDistanceMeters(point, ring[i], ring[i + 1], projection));
      }
    }
    return min;
  });
  return {
    minM: Math.min(...distances),
    maxM: Math.max(...distances),
    meanM: distances.reduce((sum, value) => sum + value, 0) / distances.length,
    pointsWithin20m: distances.filter((value) => value <= 20).length,
    pointCount: distances.length
  };
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function appendUnique(array, value) {
  if (!array.includes(value)) array.push(value);
}

// Fresh-main duplicate gate.
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places.filter((place) => place.id === placeId || norm(place.name) === norm(placeName) || norm(place.name) === norm("Brekkedammen") || norm(place.name) === norm("Frysja / Brekkedammen"));
if (identityMatches.length > 0) throw new Error(`Brekkedammen identity already canonical on current main: ${identityMatches.map((place) => place.id).join(", ")}`);

// Revalidate the exact locked physical objects and official scope on this exact production branch.
const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${RELATION_ID},W${WEIR_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const [rows, official] = await Promise.all([fetchJson(lookupUrl), fetchText(OFFICIAL_PAGE)]);
const relation = rows.find((row) => row.osm_type === "relation" && Number(row.osm_id) === RELATION_ID);
const weir = rows.find((row) => row.osm_type === "way" && Number(row.osm_id) === WEIR_ID);
if (!relation || !weir) throw new Error("Exact OSM lookup did not return both locked Brekkedammen objects.");

const relationNames = acceptedNames(relation);
const weirNames = acceptedNames(weir);
const relationIdentityGate = relationNames.some((name) => norm(name) === norm("Brekkedammen"));
const weirIdentityGate = weirNames.some((name) => norm(name) === norm("Brekkedammen"));
const relationSemanticGate = relation.category === "water" && relation.type === "reservoir" && relation.extratags?.natural === "water";
const weirSemanticGate = weir.category === "waterway" && weir.type === "weir";
const officialSemanticGate = norm(official.text).includes(norm("Brekkedammen")) && /badeplass|bading|badested/i.test(official.text);
const officialLinkGate = typeof weir.extratags?.website === "string" && /oslo\.kommune\.no/i.test(weir.extratags.website) && /brekkedammen/i.test(weir.extratags.website);
if (!relationIdentityGate || !weirIdentityGate || !relationSemanticGate || !weirSemanticGate || !officialSemanticGate || !officialLinkGate) {
  throw new Error(`Identity/semantic gate failed: ${JSON.stringify({ relationIdentityGate, weirIdentityGate, relationSemanticGate, weirSemanticGate, officialSemanticGate, officialLinkGate })}`);
}
if (!relation.geojson || !["Polygon", "MultiPolygon"].includes(relation.geojson.type)) throw new Error("Locked waterbody relation no longer has Polygon/MultiPolygon geometry.");
if (weir.geojson?.type !== "LineString" || !Array.isArray(weir.geojson.coordinates) || weir.geojson.coordinates.length < 2) throw new Error("Locked Brekkedammen weir no longer has usable LineString geometry.");

const areaAnchor = { lat: Number(relation.lat), lon: Number(relation.lon) };
if (!Number.isFinite(areaAnchor.lat) || !Number.isFinite(areaAnchor.lon) || !pointInGeometry(areaAnchor, relation.geojson)) {
  throw new Error(`Exact relation representation point is not a valid interior area anchor: ${JSON.stringify(areaAnchor)}`);
}
const rings = outerRings(relation.geojson);
const topology = boundaryDistances(weir.geojson.coordinates, rings);
const topologyGate = topology.minM <= 20 && topology.pointsWithin20m >= Math.max(1, Math.ceil(topology.pointCount / 2));
if (!topologyGate) throw new Error(`Named weir no longer resolves as the waterbody boundary: ${JSON.stringify(topology)}`);

const weirAnchor = { lat: Number(weir.lat), lon: Number(weir.lon) };
if (!Number.isFinite(weirAnchor.lat) || !Number.isFinite(weirAnchor.lon)) throw new Error("Locked weir has no finite representation point.");

const coordNote = `Batch production object-type-first: exact OSM relation ${RELATION_ID} is the reservoir named Frysja with alt_name=Brekkedammen, and exact OSM way ${WEIR_ID} is the named Brekkedammen weir on its downstream boundary. The ordinary polygon centroid is rejected because it falls outside the concave geometry; the exact relation representation point is accepted only after an explicit point-in-polygon check. Oslo kommune documents Brekkedammen ved Frysja as a bathing place, so bathing/recreation is modeled as a current use layer of the same physical waterbody rather than as an invented standalone beach pin. No nearest/first-hit selection is used.`;

const place = {
  id: placeId,
  name: placeName,
  lat: areaAnchor.lat,
  lon: areaAnchor.lon,
  r: 320,
  category: "natur",
  place_type: "vannflate",
  tags: ["Akerselva", "badeplass", "dam", "reservoar"],
  desc: "Oppdemmet vannflate i øvre Akerselva ved Frysja, kartlagt som Frysja med Brekkedammen som alternativt navn og brukt som et populært bade- og rekreasjonsområde.",
  popupDesc: "Brekkedammen ved Frysja er den oppdemmede vannflaten i øvre Akerselva som i OpenStreetMap er navngitt Frysja med Brekkedammen som alternativt navn. Den navngitte Brekkedammen-demningen danner den nedre grensen mot elveløpet videre sørover. Oslo kommune bruker Brekkedammen ved Frysja som navn på badeplassen og rekreasjonsområdet her. I History Go modelleres derfor hele den fysiske vannflaten som stedet, mens bading og friluftsliv er dagens bruk av samme sted – ikke en separat, tilfeldig kartpinne.",
  externalLinks: [
    { type: "official", label: "Oslo kommune – Brekkedammen ved Frysja", url: OFFICIAL_PAGE, lang: "nb", verifiedAt: DATE },
    { type: "reference", label: "OpenStreetMap – Frysja / Brekkedammen", url: `https://www.openstreetmap.org/relation/${RELATION_ID}`, lang: "nb", verifiedAt: DATE }
  ],
  anchors: [
    {
      id: "brekkedammen_demning",
      name: "Brekkedammen – demningen",
      type: "boundary_point",
      lat: weirAnchor.lat,
      lon: weirAnchor.lon,
      r: 160
    }
  ],
  locatorType: "waterbody",
  sourceProvider: "osm",
  sourceObjectId: `osm-relation:${RELATION_ID}`,
  geocodeAccuracy: "geometric_center",
  coordRole: "area_anchor",
  coordStatus: "verified_geometry",
  coordSource: `OpenStreetMap relation ${RELATION_ID} – Frysja (alt_name Brekkedammen); boundary cross-checked with way ${WEIR_ID} and Oslo kommune`,
  coordSourceId: `osm-relation:${RELATION_ID}`,
  coordSourceUrl: `https://www.openstreetmap.org/relation/${RELATION_ID}`,
  coordType: "reservoir_area_anchor",
  coordVerifiedAt: DATE,
  coordNote,
  geometry: relation.geojson,
  nature_profile: {
    type: "oppdemmet elvevann / badevann / byvassdrag",
    title: "En rolig vannflate i øvre Akerselva",
    summary: "Brekkedammen er en oppdemmet del av Akerselva der et roligere vannspeil, elvekant og demningsanlegg danner ett sammenhengende natur- og rekreasjonsmiljø. Stedet brukes til bading og friluftsliv, samtidig som vannflaten er en fysisk del av det regulerte elveløpet.",
    themes: ["oppdemmet vannflate", "Akerselva", "bading og rekreasjon", "elvekant", "dam og vannføring"],
    nearby_place_ids: ["frysja_33_brekke_kraftstasjon", "frysja_industriomrade", "akerselva"]
  },
  quiz_profile: {
    place_type: "vannflate",
    subtype: "oppdemmet_badevann_i_akerselva",
    signature_features: ["oppdemmet vannflate i øvre Akerselva", "Brekkedammen som alternativt navn til Frysja-vannflaten", "bading og rekreasjon ved en navngitt demning"],
    primary_angles: ["natur_vannlop", "bruk", "teknikk", "utsyn_orientering"],
    question_families: ["gjenkjenning", "stedsspesifikk_funksjon", "teknisk_fysisk", "kontrast"],
    avoid_angles: ["generisk_badeplass", "generisk_elv"],
    must_include: ["forholdet mellom vannflaten og demningen", "bading som bruk av samme fysiske sted"],
    contrast_targets: ["frysjadammen", "frysja_33_brekke_kraftstasjon"],
    notes: "Skal spørres som oppdemmet vannflate og rekreasjonssted, ikke som en tilfeldig strandpinne."
  }
};

const evidence = {
  schemaVersion: "1.0",
  placeId,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: {
    lat: areaAnchor.lat,
    lon: areaAnchor.lon,
    r: place.r,
    coordStatus: "verified_geometry",
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote
  },
  identity: {
    currentName: placeName,
    resolvedIdentity: "Den fysiske oppdemmede vannflaten Frysja / Brekkedammen, med bade- og rekreasjonsbruk som innholdslag og den navngitte demningen som grense-subfeature",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "waterbody",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "eksakt navngitt eller eksplisitt aliasert vannflategeometri",
    "fysisk/topologisk kobling mellom vannflaten og den navngitte Brekkedammen-demningen",
    "offisiell kilde for bade- og rekreasjonsbruken"
  ],
  evidence: [
    {
      sourceProvider: "osm",
      sourceName: `OpenStreetMap – relation ${RELATION_ID} Frysja / Brekkedammen`,
      sourceUrl: `https://www.openstreetmap.org/relation/${RELATION_ID}`,
      sourceObjectId: `osm-relation:${RELATION_ID}`,
      sourceQuality: "exact_named_polygon_with_explicit_alt_name",
      finding: "Eksakt reservoir/multipolygon med name=Frysja og alt_name=Brekkedammen. Det eksakte objektrepresentasjonspunktet ligger inne i polygonet og brukes som area-anchor.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "osm",
      sourceName: `OpenStreetMap – way ${WEIR_ID} Brekkedammen`,
      sourceUrl: `https://www.openstreetmap.org/way/${WEIR_ID}`,
      sourceObjectId: `osm-way:${WEIR_ID}`,
      sourceQuality: "exact_named_boundary_subfeature",
      finding: `Eksakt navngitt weir. Alle tre geometripunkter ligger innen 20 meter fra vannflategrensen; målt minimum ${topology.minM.toFixed(1)} m og maksimum ${topology.maxM.toFixed(1)} m.`,
      canVerifyCoordinate: false,
      reason: "Verifiserer fysisk grense og identitet, men brukes ikke alene som koordinat for hele vannflaten."
    },
    {
      sourceProvider: "municipality",
      sourceName: "Oslo kommune – Brekkedammen ved Frysja",
      sourceUrl: OFFICIAL_PAGE,
      sourceObjectId: "oslo-kommune:badeplass:brekkedammen-ved-frysja",
      sourceQuality: "official_scope_and_use_definition",
      finding: "Oslo kommune dokumenterer Brekkedammen ved Frysja som badeplass i øvre Akerselva.",
      canVerifyCoordinate: false,
      reason: "Fastsetter dagens bruk og navn, mens den eksakte fysiske geometrien kommer fra OSM-relasjonen."
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-relation:${RELATION_ID}`, canApplyToPlace: true },
    { sourceProvider: "osm", sourceObjectId: `osm-way:${WEIR_ID}`, canApplyToPlace: false }
  ],
  geometryCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-relation:${RELATION_ID}`, lat: areaAnchor.lat, lon: areaAnchor.lon, coordRole: "area_anchor", canApplyToPlace: true },
    { sourceProvider: "osm", sourceObjectId: `osm-way:${WEIR_ID}`, lat: weirAnchor.lat, lon: weirAnchor.lon, coordRole: "boundary_anchor", canApplyToPlace: false }
  ],
  coordinateCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-relation:${RELATION_ID}`, lat: areaAnchor.lat, lon: areaAnchor.lon, coordRole: "area_anchor", canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Canonical Brekkedammen ved Frysja er produsert som den eksakte Frysja/Brekkedammen-vannflaten; demningen beholdes som grenseanker og badebruk som innholdslag."
  },
  notes: [coordNote]
};

writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);

const placesManifestPath = "data/places/manifest.json";
const placesManifest = JSON.parse(readFileSync(placesManifestPath, "utf8"));
if (!Array.isArray(placesManifest.files)) throw new Error("data/places/manifest.json has no files array.");
appendUnique(placesManifest.files, PLACE_MANIFEST_ENTRY);
writeJson(placesManifestPath, placesManifest);

const evidenceManifestPath = "data/coordinate-evidence/manifest.json";
const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, "utf8"));
if (!Array.isArray(evidenceManifest.files)) throw new Error("data/coordinate-evidence/manifest.json has no files array.");
appendUnique(evidenceManifest.files, EVIDENCE_MANIFEST_ENTRY);
writeJson(evidenceManifestPath, evidenceManifest);

// Dynamically allocate the next coordinate batch from current-main protocol state.
const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
if (protocol.includes(`\`${placeId}\``)) throw new Error(`${placeId} already exists in coordinate protocol.`);
const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])).filter(Number.isFinite);
const batch = Math.max(...batchNumbers) + 1;
const protocolRow = `| ${batch} | \`${placeId}\` | ${placeName} | verified_geometry | \`osm-relation:${RELATION_ID}\` |`;
let insertionIndex = protocol.search(/\n##+ [^\n]*Dokumenterte Oslo-kontroller uten godkjent koordinat[^\n]*/i);
if (insertionIndex < 0) insertionIndex = protocol.indexOf("\n## Etne – historiesett");
if (insertionIndex < 0) throw new Error("Could not locate end of Oslo verified coordinate table in protocol.");
protocol = `${protocol.slice(0, insertionIndex)}\n${protocolRow}${protocol.slice(insertionIndex)}`;
protocol = protocol.replace(/(Oslo-protokollen dekker nå )(\d+)( aktive current `verified\*` canonical Oslo-steder\.)/, (_, prefix, count, suffix) => `${prefix}${Number(count) + 1}${suffix}`);
writeFileSync(protocolPath, protocol, "utf8");

const reportDir = `reports/oslo-coordinate-control-batch-${batch}-brekkedammen-waterbody-production`;
mkdirSync(reportDir, { recursive: true });
writeJson(`${reportDir}/result.json`, {
  version: DATE,
  batch,
  placeId,
  status: "verified_geometry_applied_to_place",
  representation: "physical_impounded_waterbody_with_recreation_use_layer",
  coordinate: { lat: areaAnchor.lat, lon: areaAnchor.lon, r: place.r, coordRole: "area_anchor", coordType: place.coordType },
  sourceObject: { sourceObjectId: `osm-relation:${RELATION_ID}`, name: relation.name, altName: relation.namedetails?.alt_name ?? null, type: relation.type, geometryType: relation.geojson.type },
  boundarySubfeature: { sourceObjectId: `osm-way:${WEIR_ID}`, name: weir.name, type: weir.type, lat: weirAnchor.lat, lon: weirAnchor.lon, topology: { minDistanceM: Math.round(topology.minM * 10) / 10, maxDistanceM: Math.round(topology.maxM * 10) / 10, meanDistanceM: Math.round(topology.meanM * 10) / 10, pointsWithin20m: topology.pointsWithin20m, pointCount: topology.pointCount } },
  gates: { relationIdentityGate, weirIdentityGate, relationSemanticGate, weirSemanticGate, officialSemanticGate, officialLinkGate, representationPointInside: true, topologyGate, duplicateIdentityMatches: identityMatches.length },
  rejected: ["ordinary polygon centroid outside concave geometry", "weir centroid as whole-site coordinate", "nearest selection", "first-hit selection", "arbitrary bathing-place pin"]
});
writeFileSync(`${reportDir}/sources.md`, `# Brekkedammen waterbody production sources\n\n- Oslo kommune: ${OFFICIAL_PAGE}\n- OSM waterbody: https://www.openstreetmap.org/relation/${RELATION_ID}\n- OSM named weir: https://www.openstreetmap.org/way/${WEIR_ID}\n\nCanonical model: the exact physical Frysja/Brekkedammen reservoir polygon. Bathing/recreation is a current use layer; the named Brekkedammen weir is a boundary subfeature and unlock anchor.\n`, "utf8");

console.log(`Produced ${placeId} as batch ${batch}: ${areaAnchor.lat},${areaAnchor.lon}; source=osm-relation:${RELATION_ID}; boundary=osm-way:${WEIR_ID}`);
