import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_FIXES = [
  'data/coordinate-evidence/oslo/historie/norges_hjemmefrontmuseum.json',
  'data/coordinate-evidence/oslo/historie/forsvarsmuseet.json',
  'data/coordinate-evidence/oslo/kunst/roseslottet.json'
];

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, data) {
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}

function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}

function findActivePlace(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const place of rowsFrom(readJson(rel))) {
      if (place?.id === placeId) hits.push({ place, rel });
    }
  }
  if (hits.length !== 1) throw new Error(`${placeId}: expected one active place, found ${hits.length}`);
  return hits[0];
}

function snapshot(place) {
  return {
    lat: place?.lat ?? null,
    lon: place?.lon ?? null,
    r: place?.r ?? null,
    coordStatus: place?.coordStatus ?? '',
    coordSource: place?.coordSource ?? '',
    coordType: place?.coordType ?? '',
    coordNote: place?.coordNote ?? ''
  };
}

for (const evidenceRel of EVIDENCE_FIXES) {
  const evidence = readJson(evidenceRel);
  const active = findActivePlace(evidence.placeId);
  evidence.placeFile = active.rel;
  evidence.evidenceStatus = 'applied_to_place';
  evidence.coordinateDecision = 'do_not_change_coordinates_yet';
  evidence.currentCoordinate = snapshot(active.place);
  writeJson(evidenceRel, evidence);
}

function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected exactly one match`);
  }
  return text.slice(0, first) + after + text.slice(first + before.length);
}

let text = fs.readFileSync(abs(PROTOCOL), 'utf8');

text = replaceOnce(
  text,
  'Oslo-tabellen inneholder nå 174 verifiserte eller kildekontrollerte canonical steder. Batch 39 normaliserer Grensen som lineær handelsgate med kildebelagte endeankre, mens Ring 3 holdes tilbake til en entydig ruteankermodell. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 41.',
  'Oslo-tabellen inneholder nå 177 verifiserte eller kildekontrollerte canonical steder. Batch 40 etterfører tre museums- og kultursteder som allerede er produsert med kildebelagte geometriankre: Norges Hjemmefrontmuseum, Forsvarsmuseet og Roseslottet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 41.',
  'Oslo summary'
);

text = replaceOnce(
  text,
  '| 39 | `grensen_kjopesenter` | Grensen – handelsgate | verified_geometry | `oslobyleksikon:grensen` |',
  '| 39 | `grensen_kjopesenter` | Grensen – handelsgate | verified_geometry | `oslobyleksikon:grensen` |\n| 40 | `norges_hjemmefrontmuseum` | Norges Hjemmefrontmuseum | verified_geometry | `osm-way:111833902` |\n| 40 | `forsvarsmuseet` | Forsvarsmuseet | verified_geometry | `osm-way:54830211` |\n| 40 | `roseslottet` | Roseslottet | verified_geometry | `osm-way:1004591108` |',
  'Batch 40 rows'
);

text = replaceOnce(
  text,
  'Batch 39 (2026-07-20) normaliserer `grensen_kjopesenter` til den faktiske lineære gaten Grensen. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass; tre eksakte navngitte OSM-way-segmenter dokumenterer gateløpet, men parallelle kjørebaner modelleres ikke som én falskt sammenhengende polyline. To kildebelagte endeankre og et representativt linjeanker brukes. `ring_3` forblir needs_review fordi research ikke ga en entydig komplett ruteankerkjede.',
  'Batch 39 (2026-07-20) normaliserer `grensen_kjopesenter` til den faktiske lineære gaten Grensen. Oslo byleksikon avgrenser gaten fra Møllergata ved Stortorvet til Professor Aschehougs plass; tre eksakte navngitte OSM-way-segmenter dokumenterer gateløpet, men parallelle kjørebaner modelleres ikke som én falskt sammenhengende polyline. To kildebelagte endeankre og et representativt linjeanker brukes. `ring_3` forblir needs_review fordi research ikke ga en entydig komplett ruteankerkjede.\n\nBatch 40 (2026-07-20) etterfører koordinatkontrollen fra PR #2594. `norges_hjemmefrontmuseum` bruker eksakt bygningsgeometri for Det dobbelte batteri / bygning 21 (`osm-way:111833902`), og `forsvarsmuseet` bruker eksakt bygningsgeometri for Hovedarsenalet / bygning 62 (`osm-way:54830211`); begge identiteter er kryssjekket mot Forsvarshistorisk museums offisielle dokumentasjon og skal ikke bruke den brede `akershus_festning`-markøren. `roseslottet` bruker den navngitte installasjonsgeometrien `osm-way:1004591108` som `site_center`, ikke Frognerseteren stasjon, og aktiv status skal revurderes etter 2026-12-31.',
  'Batch 40 note'
);

text = replaceOnce(
  text,
  'Disse kontrollene er fullført, men teller ikke blant de 174 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 177 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);

fs.writeFileSync(abs(PROTOCOL), text);

// The workflow writes scripts/.coordinate-branch-job-complete after all validations pass.
fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));

console.log('Fixed three museum evidence snapshots and updated Oslo coordinate protocol batch 40.');
