import fs from 'node:fs';
import path from 'node:path';

const pairs = [
  ['data/places/historie/oslo/places_historie/paulus_kirke.json', 'data/coordinate-evidence/oslo/historie/paulus_kirke.json'],
  ['data/places/kunst/oslo/places_kunst/purenkel_galleri.json', 'data/coordinate-evidence/oslo/kunst/purenkel_galleri.json'],
  ['data/places/by/oslo/places/torshovparken.json', 'data/coordinate-evidence/oslo/by/torshovparken.json'],
  ['data/places/kunst/oslo/places_kunst/hodet_nn_torshovdalen.json', 'data/coordinate-evidence/oslo/kunst/hodet_nn_torshovdalen.json'],
];

const keys = ['lat', 'lon', 'r', 'coordStatus', 'coordSource', 'coordType', 'coordNote'];
const report = [];

for (const [placePath, evidencePath] of pairs) {
  const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  evidence.currentCoordinate = Object.fromEntries(keys.map((key) => [key, place[key]]));
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  report.push({ placeId: place.id, placePath, evidencePath, synchronizedKeys: keys });
}

const reportDir = 'reports/visitoslo-grunerlokka-audit-20260721';
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  path.join(reportDir, 'production-evidence-sync.json'),
  `${JSON.stringify({ status: 'synchronized', places: report }, null, 2)}\n`,
);

console.log(JSON.stringify({ status: 'synchronized', placeCount: report.length }, null, 2));
