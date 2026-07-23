#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'reports/oslo-coordinate-control-batch-168-nedre-hellerud-research');
fs.mkdirSync(dir, { recursive: true });
const UA = 'History-Go-coordinate-control/1.0';
const bbox = '59.915,10.810,59.945,10.875';

async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(35000) });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return await response.text();
}

const geonorgeUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=Tvetenveien%20157%20Oslo';
const geonorge = JSON.parse(await get(geonorgeUrl));
const addressHits = (geonorge.adresser || []).filter((hit) =>
  hit.kommunenummer === '0301'
  && hit.adressenavn === 'Tvetenveien'
  && Number(hit.nummer) === 157
);

const query = `[out:json][timeout:30];(
  nwr["name"~"Hellerud",i](${bbox});
  nwr["addr:street"="Tvetenveien"]["addr:housenumber"="157"](${bbox});
  way["name"="Hellerud gårdsvei"](${bbox});
);out tags center;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const overpass = JSON.parse(await get(overpassUrl));
const osmCandidates = (overpass.elements || []).map((e) => ({
  type: e.type,
  id: e.id,
  tags: e.tags || {},
  center: e.center || (e.lat !== undefined ? { lat: e.lat, lon: e.lon } : null),
}));
const exactNames = osmCandidates.filter((c) => ['Nedre Hellerud','Hellerud Hovedgård','Hellerud gård','Hellerud'].includes(c.tags.name));
const addressObjects = osmCandidates.filter((c) => c.tags['addr:street'] === 'Tvetenveien' && c.tags['addr:housenumber'] === '157');
const farmObjects = osmCandidates.filter((c) => c.tags.place === 'farm' || c.tags.place === 'farmyard' || c.tags.landuse === 'farmyard' || c.tags.building === 'farm');
const roadObjects = osmCandidates.filter((c) => c.tags.name === 'Hellerud gårdsvei');

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'hellerud_gard',
  legacyIdentity: 'Hellerud gård',
  historicalIdentityCandidate: 'Nedre Hellerud',
  historicalBasis: {
    nordreHellerudGnr: 143,
    splitYear: 1767,
    nedreHellerudGnrBnr: '143/3',
    locationText: 'Hellerud gårdsvei',
    namingCaveat: 'Nedre Hellerud is often misleadingly called Hellerud Hovedgård.',
  },
  geonorge: {
    sourceUrl: geonorgeUrl,
    exactAddressHitCount: addressHits.length,
    exactAddressHits: addressHits,
    gnr143HitCount: addressHits.filter((hit) => Number(hit.gardsnummer) === 143).length,
  },
  osm: {
    queryUrl: overpassUrl,
    candidateCount: osmCandidates.length,
    exactNames,
    addressObjects,
    farmObjects,
    roadObjects,
    allCandidates: osmCandidates,
  },
  productionReady: false,
  nextAction: 'Determine whether Tvetenveien 157 is a surviving physical component of historical Nedre Hellerud, rather than relying on the modern company name alone. A gnr 143 match is supportive but not sufficient by itself.',
};
fs.writeFileSync(path.join(dir, 'identity-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(dir, 'geonorge-tvetenveien-157.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
fs.writeFileSync(path.join(dir, 'overpass-hellerud-candidates.json'), `${JSON.stringify(overpass, null, 2)}\n`);
console.log(JSON.stringify({
  exactAddressHitCount: addressHits.length,
  gnr143HitCount: result.geonorge.gnr143HitCount,
  exactNameCount: exactNames.length,
  addressObjectCount: addressObjects.length,
  farmObjectCount: farmObjects.length,
  roadObjectCount: roadObjects.length,
}, null, 2));
