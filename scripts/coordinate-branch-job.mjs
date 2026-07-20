import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const id = 'ekeberg_helleristninger';
const placeRel = 'places/historie/oslo/places_historie/ekeberg_helleristninger.json';
const evidenceRel = 'oslo/historie/ekeberg_helleristninger.json';
const placePath = `data/${placeRel}`;
const evidencePath = `data/coordinate-evidence/${evidenceRel}`;
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

if (!existsSync(placePath)) throw new Error(`Missing canonical place file ${placePath}`);
if (!existsSync(evidencePath)) throw new Error(`Missing coordinate evidence file ${evidencePath}`);

const placeManifest = JSON.parse(readFileSync('data/places/manifest.json', 'utf8'));
if (!placeManifest.files?.includes(placeRel)) throw new Error('Ekeberg place is not registered in place manifest; this is not a simple after-register repair.');

const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, 'utf8'));
if (!Array.isArray(evidenceManifest.files)) throw new Error('Coordinate evidence manifest has no files array.');
if (!evidenceManifest.files.includes(evidenceRel)) {
  evidenceManifest.files.push(evidenceRel);
  writeFileSync(evidenceManifestPath, `${JSON.stringify(evidenceManifest, null, 2)}\n`);
}

let protocol = readFileSync(protocolPath, 'utf8');
if (protocol.includes(`| \` ${id} \``)) throw new Error('Unexpected malformed Ekeberg row marker.');
if (new RegExp(`^\\|\\s*\\d+\\s*\\|\\s*\\\`${id}\\\``,'m').test(protocol)) throw new Error('Ekeberg already has a protocol row; abort duplicate after-register.');

const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse Oslo verified-place count.');
const currentCount = Number(countMatch[1]);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const nextBatch = Math.max(...batches) + 1;

const row = `| ${nextBatch} | \`${id}\` | Helleristningene på Ekeberg | verified_geometry | \`kulturminnesok:41907\` |`;
const rows = [...protocol.matchAll(/^\|\s*\d+\s*\|.*$/gm)];
const last = rows.at(-1);
if (!last) throw new Error('No coordinate protocol rows found.');
const insertAt = last.index + last[0].length;
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  `Oslo-tabellen inneholder nå ${currentCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} etterfører Helleristningene på Ekeberg i koordinatprotokollen og coordinate-evidence-manifestet etter at en parallell FRIGO-merge beholdt canonical place-filen og totalantallet, men overskrev Ekeberg-raden og evidence-manifestregistreringen. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 29.`
);
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) etterfører \`${id}\` uten å øke Oslo-totalen. Stedet var allerede canonical, registrert i place-manifestet og med egen evidence-fil etter den tidligere produksjonsmergen. En parallell stale FRIGO-merge beholdt place-dataene, men fjernet Ekeberg-raden fra koordinatprotokollen og registreringen av \`${evidenceRel}\` i evidence-manifestet. Denne batchen gjenoppretter bare disse kontrollflatene; coordinate snapshot og den Riksantikvaren-verifiserte geometrien \`kulturminnesok:41907\` endres ikke.\n`;
writeFileSync(protocolPath, protocol);

console.log(`After-registered ${id} as Oslo coordinate batch ${nextBatch}; verified Oslo count remains ${currentCount}.`);
rmSync(new URL(import.meta.url));
