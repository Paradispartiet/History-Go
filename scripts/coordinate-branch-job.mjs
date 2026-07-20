import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'reports/ovre-spinneri-culvert-geometry-20260720');
fs.mkdirSync(outDir, { recursive: true });

const searchCenter = { lat: 59.95478, lon: 10.76535 };

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'History-Go-coordinate-research/1.0',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

function distanceMeters(a, b) {
  const r = Math.PI / 180;
  const x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r);
  const y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function centroid(points) {
  if (!points.length) return null;
  const sum = points.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lon: acc.lon + point.lon }),
    { lat: 0, lon: 0 },
  );
  return { lat: sum.lat / points.length, lon: sum.lon / points.length };
}

function toPoints(geometry = []) {
  return geometry
    .filter((point) => Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lon)))
    .map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
}

const addressUrl =
  'https://ws.geonorge.no/adresser/v1/sok?sok=Gjerdrums%20vei%2012%20Oslo&treffPerSide=100&side=0';
const addressData = await fetchJson(addressUrl);
const addressHits = (addressData.adresser || [])
  .filter(
    (address) =>
      address.kommunenummer === '0301' &&
      address.kommunenavn === 'OSLO' &&
      address.nummer === 12,
  )
  .map((address) => ({
    adressetekst: address.adressetekst,
    adressekode: address.adressekode,
    nummer: address.nummer,
    bokstav: address.bokstav || '',
    postnummer: address.postnummer,
    gardsnummer: address.gardsnummer,
    bruksnummer: address.bruksnummer,
    lat: Number(address.representasjonspunkt?.lat),
    lon: Number(address.representasjonspunkt?.lon),
    sourceObjectId: `geonorge-adresser-v1:${address.kommunenummer}:${address.adressekode}:${address.nummer}${address.bokstav || ''}`,
  }))
  .sort((a, b) => a.bokstav.localeCompare(b.bokstav));
fs.writeFileSync(
  path.join(outDir, 'geonorge-gjerdrums-vei-12-cluster.json'),
  `${JSON.stringify({ url: addressUrl, hits: addressHits, raw: addressData }, null, 2)}\n`,
);

const overpassQuery = `[out:json][timeout:40];\n(\n  way(around:350,${searchCenter.lat},${searchCenter.lon})[\"building\"];\n  relation(around:350,${searchCenter.lat},${searchCenter.lon})[\"building\"];\n  way(around:350,${searchCenter.lat},${searchCenter.lon})[\"waterway\"];\n  node(around:350,${searchCenter.lat},${searchCenter.lon})[\"addr:housenumber\"];\n);\nout tags center geom;`;
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let overpassData = null;
let usedOverpassEndpoint = null;
let overpassError = null;
for (const endpoint of overpassEndpoints) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'User-Agent': 'History-Go-coordinate-research/1.0',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams({ data: overpassQuery }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    overpassData = await response.json();
    usedOverpassEndpoint = endpoint;
    break;
  } catch (error) {
    overpassError = String(error);
  }
}
if (!overpassData) throw new Error(`All Overpass endpoints failed: ${overpassError}`);
fs.writeFileSync(
  path.join(outDir, 'overpass-raw.json'),
  `${JSON.stringify({ endpoint: usedOverpassEndpoint, query: overpassQuery, data: overpassData }, null, 2)}\n`,
);

const buildingElements = (overpassData.elements || []).filter(
  (element) => (element.type === 'way' || element.type === 'relation') && element.tags?.building,
);
const waterwayElements = (overpassData.elements || []).filter(
  (element) => element.type === 'way' && element.tags?.waterway,
);
const addressNodes = (overpassData.elements || []).filter(
  (element) => element.type === 'node' && element.tags?.['addr:housenumber'],
);

const buildings = buildingElements.map((element) => {
  const geometry = toPoints(element.geometry);
  const center = element.center
    ? { lat: Number(element.center.lat), lon: Number(element.center.lon) }
    : centroid(geometry);
  const addressDistances = addressHits
    .map((address) => ({
      adressetekst: address.adressetekst,
      sourceObjectId: address.sourceObjectId,
      distanceMeters: center ? Number(distanceMeters(center, address).toFixed(2)) : null,
    }))
    .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
  return {
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    center,
    geometry,
    nearestGeonorgeAddresses: addressDistances.slice(0, 5),
  };
});

const waterways = waterwayElements.map((element) => ({
  osmId: element.id,
  tags: element.tags || {},
  geometry: toPoints(element.geometry),
}));

const culvertWays = waterways.filter(
  (waterway) =>
    waterway.tags.tunnel === 'culvert' ||
    waterway.tags.tunnel === 'yes' ||
    waterway.tags.covered === 'yes',
);

const buildingRiverRelations = buildings
  .map((building) => {
    const crossings = waterways
      .map((waterway) => {
        const pointsInside = building.geometry.length
          ? waterway.geometry.filter((point) => pointInPolygon(point, building.geometry))
          : [];
        const minCenterDistance = building.center
          ? Math.min(
              ...waterway.geometry.map((point) => distanceMeters(building.center, point)),
              Infinity,
            )
          : Infinity;
        return {
          waterwayOsmId: waterway.osmId,
          waterwayTags: waterway.tags,
          pointsInsideCount: pointsInside.length,
          minCenterDistanceMeters: Number(minCenterDistance.toFixed(2)),
        };
      })
      .filter(
        (relation) =>
          relation.pointsInsideCount > 0 || relation.minCenterDistanceMeters <= 80,
      )
      .sort((a, b) => {
        if (a.pointsInsideCount !== b.pointsInsideCount) return b.pointsInsideCount - a.pointsInsideCount;
        return a.minCenterDistanceMeters - b.minCenterDistanceMeters;
      });
    return {
      osmType: building.osmType,
      osmId: building.osmId,
      tags: building.tags,
      center: building.center,
      nearestGeonorgeAddresses: building.nearestGeonorgeAddresses,
      crossings,
    };
  })
  .filter((building) => building.crossings.length > 0)
  .sort((a, b) => {
    const aInside = Math.max(...a.crossings.map((crossing) => crossing.pointsInsideCount), 0);
    const bInside = Math.max(...b.crossings.map((crossing) => crossing.pointsInsideCount), 0);
    if (aInside !== bInside) return bInside - aInside;
    return a.crossings[0].minCenterDistanceMeters - b.crossings[0].minCenterDistanceMeters;
  });

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&polygon_geojson=1&addressdetails=1&extratags=1&namedetails=1&limit=20`;
  const data = await fetchJson(url);
  return { query, url, data };
}
const nominatimSearches = [];
for (const query of [
  'Campus G12 Oslo',
  'Gjerdrums torg Oslo',
  'Øvre Spinneri Nydalen Oslo',
  'Gjerdrums vei 12 Oslo',
]) {
  nominatimSearches.push(await nominatimSearch(query));
}
fs.writeFileSync(
  path.join(outDir, 'nominatim-searches.json'),
  `${JSON.stringify(nominatimSearches, null, 2)}\n`,
);

const explicitCulvertRelations = buildingRiverRelations.filter((building) =>
  building.crossings.some(
    (crossing) =>
      crossing.pointsInsideCount > 0 &&
      (crossing.waterwayTags.tunnel === 'culvert' ||
        crossing.waterwayTags.tunnel === 'yes' ||
        crossing.waterwayTags.covered === 'yes'),
  ),
);

const summary = {
  date: '2026-07-20',
  placeId: 'seilduksfabrikken_nydalen',
  semanticIdentityKey: {
    historicalSource: 'Oslo byleksikon / Norsk biografisk leksikon',
    identity: 'Øvre Spinderi, Gjerdrums vei 12, oppført 1856',
    distinguishingIdentity: 'Væveri A, historisk nr. 12A, oppført 1864',
    physicalKey:
      'Oslo byleksikon documents that Akerselva is led in a culvert under Øvre Spinneri.',
  },
  searchCenter,
  geonorgeAddressHits: addressHits,
  overpassEndpoint: usedOverpassEndpoint,
  buildingCount: buildings.length,
  waterwayCount: waterways.length,
  culvertWays,
  addressNodes,
  buildingRiverRelations,
  explicitCulvertRelations,
  nominatimSearches,
  conclusion: {
    uniqueBuildingCrossedByCulvert: explicitCulvertRelations.length === 1,
    candidate:
      explicitCulvertRelations.length === 1
        ? explicitCulvertRelations[0]
        : null,
    decision:
      explicitCulvertRelations.length === 1
        ? 'geometry_candidate_ready_for_manual_cross_check'
        : 'keep_needs_review',
    reason:
      explicitCulvertRelations.length === 1
        ? 'Exactly one nearby building geometry is crossed by an OSM waterway segment explicitly tagged as covered/tunnel/culvert, matching the historical physical identity key for Øvre Spinneri. Manual source and map cross-check is still required before production.'
        : `Found ${explicitCulvertRelations.length} nearby buildings crossed by explicit covered/tunnel/culvert waterway geometry; no unique building can yet be selected.`,
  },
};

fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Øvre Spinneri — culvert geometry research\n\nDate: 2026-07-20\n\nThe previous candidate-building correlation was discarded because its two assumed building points were about 850 metres from the current Gjerdrums vei 12 address cluster. This pass restarts from the correct Geonorge address cluster and the stronger historical physical identity key: Akerselva is documented as running in a culvert under Øvre Spinneri.\n\nResearch combines:\n\n- the complete current Geonorge no. 12 address cluster;\n- nearby OSM building and waterway geometry from Overpass;\n- explicit tunnel/culvert/covered waterway tags;\n- Nominatim identity searches for Campus G12, Gjerdrums torg and Øvre Spinneri.\n\nNo canonical coordinate is changed here. A production candidate is allowed only if the physical culvert relationship identifies one unique building and the result survives manual source/map cross-check.\n\nDecision: **${summary.conclusion.decision}**\n\n${summary.conclusion.reason}\n`,
);

console.log(JSON.stringify(summary, null, 2));
