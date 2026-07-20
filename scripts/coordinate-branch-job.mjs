import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-production-batch-51';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_FILE = 'data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json';
const PLACE_MANIFEST_ENTRY = 'places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/vitenskap/oslo_reptilpark.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/vitenskap/oslo_reptilpark.json';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) { fs.mkdirSync(path.dirname(abs(rel)), { recursive: true }); fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n'); }
function rowsFrom(data) { if (Array.isArray(data)) return data; if (data?.places) return data.places; if (data?.items) return data.items; if (typeof data?.id === 'string') return [data]; return []; }
function replaceOnce(text, before, after, label) { const i = text.indexOf(before); if (i < 0) throw new Error(`${label}: expected text not found`); if (text.indexOf(before, i + before.length) >= 0) throw new Error(`${label}: expected exactly one match`); return text.slice(0, i) + after + text.slice(i + before.length); }
function assertNoActivePlaceId(placeId) { const hits = []; for (const entry of readJson(PLACE_MANIFEST).files || []) { const rel = `data/${entry}`; if (!fs.existsSync(abs(rel))) continue; for (const row of rowsFrom(readJson(rel))) if (row?.id === placeId) hits.push(rel); } if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`); }
function copyFromValidatedBranch(sourcePath, targetPath) { const content = execFileSync('git', ['show', `FETCH_HEAD:${sourcePath}`], { encoding: 'utf8' }); fs.mkdirSync(path.dirname(abs(targetPath)), { recursive: true }); fs.writeFileSync(abs(targetPath), content); }

assertNoActivePlaceId('oslo_reptilpark');
if (fs.existsSync(abs(PLACE_FILE)) || fs.existsSync(abs(EVIDENCE_FILE))) throw new Error('Oslo Reptilpark source/evidence already exists');
execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
copyFromValidatedBranch(PLACE_FILE, PLACE_FILE);
copyFromValidatedBranch(EVIDENCE_FILE, EVIDENCE_FILE);
const place = readJson(PLACE_FILE);
if (place.id !== 'oslo_reptilpark' || place.sourceObjectId !== 'geonorge-adresser-v1:0301:16935:2') throw new Error('Unexpected validated Reptilpark payload');

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error('Place manifest entry already exists');
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error('Evidence manifest entry already exists');
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(protocol,
  'Oslo-tabellen inneholder nå 196 verifiserte eller kildekontrollerte canonical steder. Duplikatet `good_game_redaksjon` er migrert til `nrk_huset_marienlyst` uten å opprette et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 33.',
  'Oslo-tabellen inneholder nå 197 verifiserte eller kildekontrollerte canonical steder. Batch 51 legger til Oslo Reptilpark med det entydige Geonorge-punktet for dagens besøksadresse i St. Olavs gate 2, samtidig som åpningen i Storgata i 2002 bevares som et separat historisk lokaliseringslag. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 33.', 'Oslo summary');
protocol = replaceOnce(protocol,
  '| 50 | `ibsen_museum_teater` | IBSEN Museum & Teater | verified | `geonorge-adresser-v1:0301:21471:26` |',
  '| 50 | `ibsen_museum_teater` | IBSEN Museum & Teater | verified | `geonorge-adresser-v1:0301:21471:26` |\n| 51 | `oslo_reptilpark` | Oslo Reptilpark | verified | `geonorge-adresser-v1:0301:16935:2` |', 'Batch 51 row');
const batch50 = 'Batch 50 (2026-07-20) fullfører den siste spesialkoordinatsaken fra museumsauditen. `ibsen_museum_teater` bruker det eksakte Geonorge-punktet for dagens offisielle publikumsinngang i Henrik Ibsens gate 26 som display- og unlock-anker. Museets historiske kjerne er Henrik og Suzannah Ibsens leilighet i Arbins gate 1, der de bodde fra 1895 til 1906; denne adressen bevares eksplisitt som historisk lag og skal ikke erstattes av den moderne besøksadressen i litteraturhistorisk innhold.';
protocol = replaceOnce(protocol, batch50, `${batch50}\n\nBatch 51 (2026-07-20) starter den avgrensede completeness-passeringen for VisitOSLO-attraksjoner utenfor museumskategorien. \`oslo_reptilpark\` bruker det entydige Geonorge-adressepunktet \`geonorge-adresser-v1:0301:16935:2\` for St. Olavs gate 2 som dagens bygnings- og displayanker. Oslo Reptilparks egen historikk dokumenterer at institusjonen åpnet i Storgata 10. januar 2002 og flyttet til større lokaler i St. Olavs gate 2 i september 2007. Dagens koordinat representerer derfor nåværende besøkssted, ikke den opprinnelige 2002-lokasjonen.`, 'Batch 51 narrative');
protocol = replaceOnce(protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 196 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 197 verifiserte eller kildekontrollerte canonical Oslo-stedene.', 'Oslo unresolved count reference');
fs.writeFileSync(abs(PROTOCOL), protocol);
console.log('Registered validated Oslo Reptilpark payload as coordinate batch 51 on latest main.');
