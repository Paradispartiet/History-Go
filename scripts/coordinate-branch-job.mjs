import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/ovre-spinneri-address-building-correlation');
fs.mkdirSync(outDir, { recursive: true });

const buildings = [
  { bygningsnummer: '81764387', osmWay: 102598861, lat: 59.946972, lon: 10.767518 },
  { bygningsnummer: '300171619', osmWay: 188134011, lat: 59.946963, lon: 10.766603 }
];
const queries = ['Gjerdrums vei 12 Oslo', 'Gjerdrums vei 12A Oslo', 'Gjerdrums vei 12B Oslo'];

function distanceMeters(a, b) {
  const r = Math.PI / 180;
  const x = (b.lon - a.lon) * r * Math.cos(((a.lat + b.lat) / 2) * r);
  const y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
}

const results = [];
for (const query of queries) {
  const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}&treffPerSide=50&side=0`;
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-research/1.0' } });
  const data = await response.json();
  fs.writeFileSync(path.join(outDir, `${query.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.json`), `${JSON.stringify({ url, data }, null, 2)}\n`);
  const treff = (data.adresser || []).map((address) => {
    const point = { lat: Number(address.representasjonspunkt?.lat), lon: Number(address.representasjonspunkt?.lon) };
    return {
      adressetekst: address.adressetekst,
      adressekode: address.adressekode,
      nummer: address.nummer,
      bokstav: address.bokstav || '',
      postnummer: address.postnummer,
      kommunenummer: address.kommunenummer,
      lat: point.lat,
      lon: point.lon,
      distances: buildings.map((building) => ({
        bygningsnummer: building.bygningsnummer,
        osmWay: building.osmWay,
        distanceMeters: Number(distanceMeters(point, building).toFixed(2))
      }))
    };
  });
  results.push({ query, status: response.status, treffCount: treff.length, treff });
}

const summary = { date: '2026-07-20', buildings, results };
fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'README.md'), `# Øvre Spinneri address/building correlation\n\nOfficial Geonorge address search for Gjerdrums vei 12, 12A and 12B, compared with the two exact Matrikkelen building points already matched to OSM ways. No canonical coordinates are changed.\n`);
console.log(JSON.stringify(summary, null, 2));
