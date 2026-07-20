import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-production-batch-54-holmlia-bad';
const ID = 'holmlia_bad';
const PLACE = 'data/places/sport/europa/norway/oslo_sport/holmlia_bad.json';
const PLACE_ENTRY = 'places/sport/europa/norway/oslo_sport/holmlia_bad.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/sport/holmlia_bad.json';
const EVIDENCE_ENTRY = 'oslo/sport/holmlia_bad.json';
const DECISION = 'reports/oslo-attractions-completeness-20260720/holmlia-bad/decision.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const abs = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const write = (p, value) => {
  fs.mkdirSync(path.dirname(abs(p)), { recursive: true });
  fs.writeFileSync(abs(p), `${JSON.stringify(value, null, 2)}\n`);
};
const rows = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : data?.id ? [data] : [];
const copyFromSource = (sourcePath, targetPath = sourcePath) => {
  const content = execFileSync('git', ['show', `FETCH_HEAD:${sourcePath}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(targetPath)), { recursive: true });
  fs.writeFileSync(abs(targetPath), content);
};

for (const entry of read(PLACE_MANIFEST).files || []) {
  const file = `data/${entry}`;
  if (!fs.existsSync(abs(file))) continue;
  if (rows(read(file)).some((row) => row?.id === ID)) throw new Error(`${ID}: active place already exists in ${file}`);
}
if (fs.existsSync(abs(PLACE)) || fs.existsSync(abs(EVIDENCE))) throw new Error(`${ID}: target files already exist`);

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
copyFromSource(PLACE);
copyFromSource(EVIDENCE);
copyFromSource(DECISION);

const place = read(PLACE);
if (place.id !== ID) throw new Error('Unexpected copied Holmlia place payload');
if (place.sourceObjectId !== 'geonorge-adresser-v1:0301:13084:34') throw new Error('Unexpected Holmlia coordinate source');

const pm = read(PLACE_MANIFEST);
if (pm.files.includes(PLACE_ENTRY)) throw new Error(`${PLACE_ENTRY}: already in place manifest`);
pm.files.push(PLACE_ENTRY);
write(PLACE_MANIFEST, pm);

const em = read(EVIDENCE_MANIFEST);
if (em.files.includes(EVIDENCE_ENTRY)) throw new Error(`${EVIDENCE_ENTRY}: already in evidence manifest`);
em.files.push(EVIDENCE_ENTRY);
em.files.sort();
write(EVIDENCE_MANIFEST, em);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
const summary = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*/);
if (!summary) throw new Error('Could not find Oslo controlled-place summary');
const oldCount = Number(summary[1]);
const newCount = oldCount + 1;
const unresolved = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!unresolved) throw new Error('Could not parse unresolved count');
const unresolvedCount = Number(unresolved[1]);

const tableMarker = '\n\nRelevante korrigerende merger for de første Oslo-batchene:';
const tableEnd = protocol.indexOf(tableMarker);
if (tableEnd < 0) throw new Error('Could not find Oslo table end');
const batchNos = [...protocol.slice(0, tableEnd).matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1]));
if (!batchNos.length) throw new Error('Could not parse Oslo batch numbers');
const batchNo = Math.max(...batchNos) + 1;

protocol = protocol.replace(summary[0], `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Holmlia bad som et eget kommunalt svømme- og idrettsanlegg på det verifiserte Holmlia Senter vei 34-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.slice(0, tableEnd) + `\n| ${batchNo} | \`${ID}\` | Holmlia bad | verified | \`${place.sourceObjectId}\` |` + protocol.slice(tableEnd);

const duplicateIndex = protocol.indexOf('\nDuplikatmigrering (');
if (duplicateIndex < 0) throw new Error('Could not find duplicate-migration narrative boundary');
const narrative = `\n\nBatch ${batchNo} (2026-07-20) legger til \`${ID}\` som et eget kommunalt svømme- og idrettsanlegg. Det entydige Geonorge-punktet \`${place.sourceObjectId}\` for Holmlia Senter vei 34 brukes som dagens bygnings-, display- og unlock-anker. Holmlia bad stod klart i 1983 som del av et fjellanlegg der idrettshall, svømmehall og tilfluktsrom ble kombinert. Den bredere underjordiske infrastrukturen er fysisk og historisk kontekst, ikke en ekstra overlappende markør. Midlertidige sommerstenginger gjelder drift og endrer ikke canonical stedsstatus.`;
protocol = protocol.slice(0, duplicateIndex) + narrative + protocol.slice(duplicateIndex);
protocol = protocol.replace(/Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./, `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(JSON.stringify({
  ok: true,
  placeId: ID,
  category: place.category,
  sourceObjectId: place.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  verifiedCount: newCount,
  unresolvedCount,
  batchNo
}, null, 2));
