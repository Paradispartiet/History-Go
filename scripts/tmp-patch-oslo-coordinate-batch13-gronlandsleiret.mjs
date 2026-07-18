import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const AGG = path.join(ROOT, 'data/places/by/oslo/places_by.json');
const SPLIT = path.join(ROOT, 'data/places/by/oslo/places/gronlandsleiret.json');
const MANIFEST = path.join(ROOT, 'data/places/by/oslo/places_by_manifest.json');
const INDEX = path.join(ROOT, 'data/places/by/oslo/places_by_index.json');
const EVIDENCE = path.join(ROOT, 'data/coordinate-evidence/oslo/by/gronlandsleiret.json');
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-13.md');
const LAT = 59.91155;
const LON = 10.76715;
const NOTE = 'Dokumentert linjeanker for Grønlandsleiret. Oslo byleksikon avgrenser gaten fra Tøyenbekken til Schweigaards gate. Hovedpunktet er det matematiske midtpunktet mellom de to eksisterende, dokumenterte ruteankrene i vest og øst; det er derfor en avledet linjerepresentasjon og ikke kunstig desimalpresisjon eller et adressepunkt.';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const aggregate = read(AGG);
const aggRow = aggregate.find((p) => p?.id === 'gronlandsleiret');
if (!aggRow) throw new Error('Mangler gronlandsleiret i aggregate');
Object.assign(aggRow, { lat: LAT, lon: LON, coordNote: NOTE });
write(AGG, aggregate);

const split = read(SPLIT);
Object.assign(split, { lat: LAT, lon: LON, coordNote: NOTE });
write(SPLIT, split);

const manifest = read(MANIFEST);
manifest.source_sha256 = sha(AGG);
manifest.generated_at = new Date().toISOString();
const manifestRow = (manifest.places || []).find((p) => p?.id === 'gronlandsleiret');
if (!manifestRow) throw new Error('Mangler gronlandsleiret i split-manifest');
manifestRow.sha256 = sha(SPLIT);
write(MANIFEST, manifest);

const index = read(INDEX);
const indexRow = index.find((p) => p?.id === 'gronlandsleiret');
if (!indexRow) throw new Error('Mangler gronlandsleiret i by-index');
Object.assign(indexRow, { lat: LAT, lon: LON });
write(INDEX, index);

const evidence = read(EVIDENCE);
Object.assign(evidence.currentCoordinate, { lat: LAT, lon: LON, coordNote: NOTE });
evidence.coordinateCandidates = [{ lat: LAT, lon: LON, coordRole: 'line_anchor', canApplyToPlace: true }];
evidence.notes = [NOTE];
if (evidence.evidence?.[0]) evidence.evidence[0].reason = NOTE;
write(EVIDENCE, evidence);

let report = fs.readFileSync(REPORT, 'utf8');
report = report.replace('| `gronlandsleiret` | verified_geometry | `oslobyleksikon:gronlandsleiret` | Hovedpunkt beholdt; eksisterende ruteankre + dokumentert gateutstrekning. |', '| `gronlandsleiret` | verified_geometry | `oslobyleksikon:gronlandsleiret` | Hovedpunkt satt til matematisk midtpunkt mellom eksisterende ruteankre + dokumentert gateutstrekning. |');
fs.writeFileSync(REPORT, report);

console.log(`Grønlandsleiret midpoint: ${LAT}, ${LON}`);
