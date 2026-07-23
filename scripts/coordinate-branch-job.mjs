#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'reports/oslo-coordinate-control-batch-168-nedre-hellerud-cadastral-research');
fs.mkdirSync(dir, { recursive: true });
const UA = 'History-Go-coordinate-control/1.0';
const addressText = 'Hellerud gårdsvei 7 Oslo';
const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(addressText)}`;

async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(35000) });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return await response.text();
}

const geonorge = JSON.parse(await get(geonorgeUrl));
const exactHits = (geonorge.adresser || []).filter((hit) =>
  hit.kommunenummer === '0301'
  && String(hit.adressenavn || '').toLocaleLowerCase('nb-NO') === 'hellerud gårdsvei'
  && Number(hit.nummer) === 7
  && !String(hit.bokstav || '').trim()
);
const cadastralMatches = exactHits.filter((hit) => Number(hit.gardsnummer) === 143 && Number(hit.bruksnummer) === 3);

const bbox = '59.905,10.835,59.925,10.860';
const query = `[out:json][timeout:25];(
  nwr["addr:street"="Hellerud gårdsvei"]["addr:housenumber"="7"](${bbox});
  nwr["name"="Nedre Hellerud"](${bbox});
  nwr["name"="Hellerud Hovedgård"](${bbox});
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
const exactAddressObjects = osmCandidates.filter((c) => c.tags['addr:street'] === 'Hellerud gårdsvei' && c.tags['addr:housenumber'] === '7');
const exactNamedObjects = osmCandidates.filter((c) => c.tags.name === 'Nedre Hellerud' || c.tags.name === 'Hellerud Hovedgård');
const roadObjects = osmCandidates.filter((c) => c.tags.name === 'Hellerud gårdsvei');

const selectedAddress = cadastralMatches.length === 1 ? cadastralMatches[0] : null;
const coordinate = selectedAddress?.representasjonspunkt
  ? { lat: Number(selectedAddress.representasjonspunkt.lat), lon: Number(selectedAddress.representasjonspunkt.lon) }
  : null;

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'hellerud_gard',
  proposedIdentity: 'Nedre Hellerud – historisk gårdssted',
  historicalIdentityBasis: {
    sourceIdentity: 'Nedre Hellerud',
    cadastralIdentity: 'gnr. 143 / bnr. 3',
    historicalLocationText: 'Hellerud gårdsvei',
    caveat: 'The address point can anchor the historical cadastral farm site, but does not by itself prove that the present building is an original eighteenth-century farmhouse.',
  },
  geonorge: {
    sourceUrl: geonorgeUrl,
    exactAddressHitCount: exactHits.length,
    exactHits,
    cadastralMatchCount: cadastralMatches.length,
    cadastralMatches,
    selectedAddress,
    coordinate,
  },
  osm: {
    sourceUrl: overpassUrl,
    exactAddressObjectCount: exactAddressObjects.length,
    exactAddressObjects,
    exactNamedObjectCount: exactNamedObjects.length,
    exactNamedObjects,
    roadObjectCount: roadObjects.length,
    roadObjects,
  },
  productionReady: cadastralMatches.length === 1,
  decisionRule: 'Production may proceed only if Geonorge returns exactly one exact Hellerud gårdsvei 7 address whose cadastral fields are gnr 143 and bnr 3. The address anchors the historical cadastral site, not an asserted surviving original farmhouse.',
  rejectedProxies: [
    'Haugerudtunet 1 / Østre Haugerud gård',
    'Tvetenveien 157 / modern Hellerud Hovedgård company identity unless independently tied to bnr 143/3',
    'legacy coordinate',
  ],
};

fs.writeFileSync(path.join(dir, 'cadastral-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(dir, 'geonorge-hellerud-gardsvei-7.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
fs.writeFileSync(path.join(dir, 'overpass-hellerud-gardsvei-7.json'), `${JSON.stringify(overpass, null, 2)}\n`);
console.log(JSON.stringify({
  exactAddressHitCount: result.geonorge.exactAddressHitCount,
  cadastralMatchCount: result.geonorge.cadastralMatchCount,
  coordinate: result.geonorge.coordinate,
  exactAddressObjectCount: result.osm.exactAddressObjectCount,
  exactNamedObjectCount: result.osm.exactNamedObjectCount,
  productionReady: result.productionReady,
}, null, 2));
