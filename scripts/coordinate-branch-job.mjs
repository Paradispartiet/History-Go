import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const placeId = "brekkedammen";
const RELATION_ID = 14334474;
const WEIR_ID = 66357555;
const reportDir = "reports/visitoslo-parks-nature-audit-20260721/brekkedammen-waterbody-topology";
mkdirSync(reportDir, { recursive: true });

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "application/json", "User-Agent": "History-Go-coordinate-audit/1.0" }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
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

function acceptedNames(row) {
  return [...new Set([
    row?.name,
    String(row?.display_name ?? "").split(",")[0],
    ...Object.values(row?.namedetails ?? {})
  ].filter((value) => typeof value === "string").flatMap((value) => [value, ...value.split(/[;|]/g)]).map((value) => value.trim()).filter(Boolean))];
}

const previous = JSON.parse(readFileSync(`${reportDir}/result.json`, "utf8"));
if (!previous.gates?.acceptedWaterbodyIdentity || !previous.gates?.acceptedWeirIdentity || !previous.gates?.relationSemanticGate || !previous.gates?.weirSemanticGate || !previous.gates?.weirTouchesWaterbodyBoundary || !previous.gates?.officialSemanticGate || !previous.gates?.officialLinkGate) {
  throw new Error("Previous exact identity/topology gates are not all proven; refusing representation-point resolution.");
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places.filter((place) => place.id === placeId || norm(place.name) === norm("Brekkedammen") || norm(place.name) === norm("Kjelsåsdammen"));
if (identityMatches.length > 0) throw new Error(`Brekkedammen identity already canonical: ${identityMatches.map((place) => place.id).join(", ")}`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${RELATION_ID},W${WEIR_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const rows = await fetchJson(lookupUrl);
const relation = rows.find((row) => row.osm_type === "relation" && Number(row.osm_id) === RELATION_ID);
const weir = rows.find((row) => row.osm_type === "way" && Number(row.osm_id) === WEIR_ID);
if (!relation || !weir) throw new Error("Exact Nominatim lookup did not return both locked objects.");

const relationNames = acceptedNames(relation);
const weirNames = acceptedNames(weir);
if (!relationNames.some((name) => norm(name) === norm("Brekkedammen"))) throw new Error("Locked waterbody relation no longer carries Brekkedammen as an accepted exact name/alias.");
if (!weirNames.some((name) => norm(name) === norm("Brekkedammen"))) throw new Error("Locked weir no longer carries exact Brekkedammen name.");
if (!relation.geojson || !["Polygon", "MultiPolygon"].includes(relation.geojson.type)) throw new Error("Locked waterbody relation is no longer an area geometry.");

const representationPoint = { lat: Number(relation.lat), lon: Number(relation.lon) };
if (!Number.isFinite(representationPoint.lat) || !Number.isFinite(representationPoint.lon)) throw new Error("Exact relation has no finite Nominatim representation point.");
const representationPointInside = pointInGeometry(representationPoint, relation.geojson);
if (!representationPointInside) throw new Error(`Exact relation representation point is outside its polygon: ${representationPoint.lat},${representationPoint.lon}`);

const result = {
  ...previous,
  version: DATE,
  status: "verified_named_waterbody_geometry_candidate",
  representationDecision: "Model the physical impounded waterbody Frysja / Brekkedammen as the canonical place. The exact OSM waterbody relation carries alt_name=Brekkedammen; exact weir 66357555 is its named downstream boundary; bathing and recreation are current use layers of the same physical place.",
  gates: {
    ...previous.gates,
    centroidInside: false,
    representationPointInside: true
  },
  waterbody: {
    ...previous.waterbody,
    displayName: relation.display_name,
    namedetails: relation.namedetails ?? {},
    extratags: relation.extratags ?? {},
    acceptedNames: relationNames.map((raw) => ({ raw, normalized: norm(raw) })),
    rejectedArithmeticCentroid: previous.waterbody?.proposedCoordinate ?? null,
    proposedCoordinate: {
      lat: representationPoint.lat,
      lon: representationPoint.lon,
      coordType: "area_anchor",
      coordinateMethod: "nominatim_exact_object_representation_point",
      insideGeometry: true,
      sourceObjectId: `osm-relation:${RELATION_ID}`
    }
  },
  weir: {
    ...previous.weir,
    displayName: weir.display_name,
    namedetails: weir.namedetails ?? {},
    extratags: weir.extratags ?? {},
    acceptedNames: weirNames.map((raw) => ({ raw, normalized: norm(raw) }))
  },
  duplicateGate: { canonicalIdentityMatches: identityMatches },
  representationPointResolution: {
    reason: "The ordinary polygon area centroid falls outside this concave reservoir geometry. The exact Nominatim representation point for the already locked OSM relation is used instead, but only after an explicit point-in-polygon gate proves that it lies inside the same exact geometry.",
    rejectedMethod: "arithmetic_polygon_centroid_outside_geometry",
    acceptedMethod: "exact_object_representation_point_inside_geometry"
  }
};

writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Brekkedammen — waterbody identity and topology audit\n\nDate: ${DATE}\n\nStatus: **verified_named_waterbody_geometry_candidate**\n\nExact OSM relation ${RELATION_ID} is the reservoir named **Frysja** with **Brekkedammen** as an exact alternate name. Exact OSM way ${WEIR_ID} is the named Brekkedammen weir and is topologically on the waterbody boundary.\n\nThe ordinary polygon centroid is rejected because it falls outside the concave reservoir polygon. The exact relation representation point is accepted only after an explicit point-in-polygon check proves it lies inside the locked geometry.\n\nCanonical interpretation: the whole physical impounded waterbody is the place; bathing/recreation is a present-day use layer, and the weir is a boundary subfeature. No nearest/first-hit selection or arbitrary bathing-place pin is used.\n`, "utf8");

console.log(`Brekkedammen representation point verified inside exact relation: ${representationPoint.lat},${representationPoint.lon}`);
