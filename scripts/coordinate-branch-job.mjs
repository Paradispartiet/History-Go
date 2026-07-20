import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/ovre-spinneri-address-building-correlation-20260720');
fs.mkdirSync(outDir, { recursive: true });

const buildings = [
  {
    key: 'candidate_east',
    bygningsnummer: '81764387',
    osmWay: 102598861,
    lat: 59.946972,
    lon: 10.767518,
  },
  {
    key: 'candidate_west',
    bygningsnummer: '300171619',
    osmWay: 188134011,
    lat: 59.946963,
    lon: 10.766603,
  },
];

const addressTargets = [
  { query: 'Gjerdrums vei 12 Oslo', expected: 'Gjerdrums vei 12', historicalIdentity: 'Øvre Spinderi' },
  { query: 'Gjerdrums vei 12A Oslo', expected: 'Gjerdrums vei 12A', historicalIdentity: 'Væveri A' },
  { query: 'Gjerdrums vei 12B Oslo', expected: 'Gjerdrums vei 12B', historicalIdentity: 'adjacent/current-address control' },
];

function distanceMeters(a, b) {
  const r = Math.PI / 180;
  const x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r);
  const y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-research/1.0' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

const results = [];
for (const target of addressTargets) {
  const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(target.query)}&treffPerSide=50&side=0`;
  const data = await fetchJson(url);
  const rawFile = `${target.expected.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.json`;
  fs.writeFileSync(path.join(outDir, rawFile), `${JSON.stringify({ url, data }, null, 2)}\n`);

  const osloHits = (data.adresser || []).filter(
    (address) => address.kommunenummer === '0301' && address.kommunenavn === 'OSLO',
  );
  const exactHits = osloHits.filter((address) => address.adressetekst === target.expected);
  const normalizedExactHits = exactHits.map((address) => {
    const point = {
      lat: Number(address.representasjonspunkt?.lat),
      lon: Number(address.representasjonspunkt?.lon),
    };
    const distances = buildings
      .map((building) => ({
        key: building.key,
        bygningsnummer: building.bygningsnummer,
        osmWay: building.osmWay,
        distanceMeters: Number(distanceMeters(point, building).toFixed(2)),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
    return {
      adressetekst: address.adressetekst,
      adressekode: address.adressekode,
      nummer: address.nummer,
      bokstav: address.bokstav || '',
      postnummer: address.postnummer,
      kommunenummer: address.kommunenummer,
      lat: point.lat,
      lon: point.lon,
      sourceObjectId: `geonorge-adresser-v1:${address.kommunenummer}:${address.adressekode}:${address.nummer}${address.bokstav || ''}`,
      distances,
      nearestBuilding: distances[0],
      secondNearestBuilding: distances[1],
      distanceMarginMeters: Number((distances[1].distanceMeters - distances[0].distanceMeters).toFixed(2)),
    };
  });

  results.push({
    query: target.query,
    expected: target.expected,
    historicalIdentity: target.historicalIdentity,
    osloHitCount: osloHits.length,
    exactHitCount: exactHits.length,
    exactHits: normalizedExactHits,
  });
}

const osmLookupUrl = 'https://nominatim.openstreetmap.org/lookup?osm_ids=W102598861,W188134011&format=jsonv2&addressdetails=1&extratags=1&namedetails=1';
const osmLookup = await fetchJson(osmLookupUrl);
fs.writeFileSync(
  path.join(outDir, 'osm-building-lookup.json'),
  `${JSON.stringify({ url: osmLookupUrl, data: osmLookup }, null, 2)}\n`,
);

const exact12 = results.find((result) => result.expected === 'Gjerdrums vei 12')?.exactHits ?? [];
const exact12A = results.find((result) => result.expected === 'Gjerdrums vei 12A')?.exactHits ?? [];
const exact12B = results.find((result) => result.expected === 'Gjerdrums vei 12B')?.exactHits ?? [];

const distinct12And12A =
  exact12.length === 1 &&
  exact12A.length === 1 &&
  exact12[0].nearestBuilding.osmWay !== exact12A[0].nearestBuilding.osmWay;

const conclusion = {
  canResolveByAddressCorrelation: distinct12And12A,
  reason: distinct12And12A
    ? `Exact Geonorge address 12 correlates most closely with OSM way ${exact12[0].nearestBuilding.osmWay}, while exact address 12A correlates most closely with the other candidate OSM way ${exact12A[0].nearestBuilding.osmWay}. Oslo byleksikon identifies no. 12 as Øvre Spinderi and 12A as Væveri A, so the two physical identities can be separated without nearest-hit guessing.`
    : 'The exact Geonorge address hits do not yet separate no. 12 and 12A cleanly across the two candidate buildings. Keep needs_review.',
  exact12,
  exact12A,
  exact12B,
};

const summary = {
  date: '2026-07-20',
  placeId: 'seilduksfabrikken_nydalen',
  currentCanonicalIdentity: 'Øvre spinneri (Nydalens Compagnie)',
  historicalAddressKey: {
    source: 'Oslo byleksikon – Gjerdrums vei',
    number12: 'Øvre Spinderi, oppført 1856',
    number12A: 'Væveri A, oppført 1864',
  },
  buildings,
  results,
  osmLookup,
  conclusion,
};

fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Øvre Spinneri address/building correlation\n\nDate: 2026-07-20\n\nThis research pass resolves the previously ambiguous Gjerdrums vei 12 / 12A / 12B address cluster against the two known building candidates. It uses exact Geonorge address hits first, then compares those points with the two candidate building representatives. Oslo byleksikon supplies the semantic identity key: no. 12 is Øvre Spinderi, while no. 12A is Væveri A.\n\nNo canonical coordinate is changed in this research pass. Production is allowed only if exact address 12 and exact address 12A each resolve once and correlate to different candidate buildings with a clear spatial separation.\n\nConclusion: **${conclusion.canResolveByAddressCorrelation ? 'RESOLVABLE' : 'KEEP NEEDS_REVIEW'}**\n\n${conclusion.reason}\n`,
);

console.log(JSON.stringify(summary, null, 2));
