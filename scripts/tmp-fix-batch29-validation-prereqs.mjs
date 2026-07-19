import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const byPlaces = read('data/places/by/oslo/places_by.json');
const byId = new Map(byPlaces.map((place) => [place.id, place]));

for (const id of ['torggata', 'storgata']) {
  const place = byId.get(id);
  if (!place) throw new Error(`Missing ${id} in Oslo by aggregate`);
  const evidenceFile = `data/coordinate-evidence/oslo/by/${id}.json`;
  const evidence = read(evidenceFile);
  evidence.currentCoordinate = {
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '',
    coordNote: place.coordNote ?? '',
  };
  write(evidenceFile, evidence);
}

const splitReportFile = 'data/places/litteratur/oslo/places_litteratur_split_report.txt';
const splitReport = fs.readFileSync(splitReportFile, 'utf8').replace(/\s+$/u, '');
fs.writeFileSync(splitReportFile, `${splitReport}\n`);

console.log('Synced stale Torggata/Storgata evidence snapshots and normalized literature split report EOF.');
