import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const id = 'ekeberg_helleristninger';
const placeRel = 'places/historie/oslo/places_historie/ekeberg_helleristninger.json';
const evidenceRel = 'oslo/historie/ekeberg_helleristninger.json';
const placePath = `data/${placeRel}`;
const evidencePath = `data/coordinate-evidence/${evidenceRel}`;
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

if (!existsSync(placePath)) throw new Error(`Missing canonical place file: ${placePath}`);
if (!existsSync(evidencePath)) throw new Error(`Missing coordinate evidence file: ${evidencePath}`);

const placeManifest = JSON.parse(readFileSync('data/places/manifest.json', 'utf8'));
if (!placeManifest.files?.includes(placeRel)) throw new Error('Ekeberg place is not registered in the place manifest.');

const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, 'utf8'));
if (!Array.isArray(evidenceManifest.files)) throw new Error('Coordinate evidence manifest has no files array.');
if (!evidenceManifest.files.includes(evidenceRel)) {
  evidenceManifest.files.push(evidenceRel);
  writeFileSync(evidenceManifestPath, `${JSON.stringify(evidenceManifest, null, 2)}\n`);
}

let protocol = readFileSync(protocolPath, 'utf8');
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse the Oslo verified-place count.');
const currentCount = Number(countMatch[1]);
const unresolvedMatch = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
const unresolvedCount = unresolvedMatch ? Number(unresolvedMatch[1]) : 29;

// Remove every misplaced or duplicate Ekeberg protocol table row before reinserting it in the Oslo table.
protocol = protocol.replace(/^\|\s*\d+\s*\|\s*`ekeberg_helleristninger`\s*\|.*(?:\n|$)/gm, '');
// Remove the stale narrative that described the original, misplaced batch 74 row.
protocol = protocol.replace(/^Batch\s+\d+\s+\(2026-07-20\)\s+produserer\s+`ekeberg_helleristninger`[^\n]*(?:\n|$)/gm, '');

const osloNarrativeAnchor = 'Relevante korrigerende merger for de første Oslo-batchene:';
const anchorIndex = protocol.indexOf(osloNarrativeAnchor);
if (anchorIndex < 0) throw new Error('Could not find the end anchor for the Oslo coordinate table.');
const osloTableRegion = protocol.slice(0, anchorIndex);
const osloRows = [...osloTableRegion.matchAll(/^\|\s*(\d+)\s*\|.*$/gm)];
if (!osloRows.length) throw new Error('No Oslo coordinate rows found before the Oslo narrative anchor.');
const nextBatch = Math.max(...osloRows.map((match) => Number(match[1]))) + 1;
const lastOsloRow = osloRows.at(-1);
const insertAt = lastOsloRow.index + lastOsloRow[0].length;
const row = `| ${nextBatch} | \`${id}\` | Helleristningene på Ekeberg | verified_geometry | \`kulturminnesok:41907\` |`;
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  `Oslo-tabellen inneholder nå ${currentCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} flytter og renummererer Helleristningene på Ekeberg fra en feilplassert batch-74-rad i Etne-tabellen til riktig Oslo-tabell, og gjenoppretter coordinate-evidence-manifestregistreringen. Totalantallet endres ikke fordi stedet allerede var canonical og medregnet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);

protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) retter protokollplasseringen for \`${id}\`. Den opprinnelige produksjonsmergen la ved en feil batch-74-raden nederst i Etne-tabellen; FRIGO tok senere korrekt Oslo-batch 74. Denne reparasjonen fjerner den feilplasserte raden og den gamle batch-74-teksten, registrerer Ekeberg som Oslo-batch ${nextBatch}, og gjenoppretter \`${evidenceRel}\` i coordinate-evidence-manifestet. Canonical place, runtime-identitet, coordinate snapshot og den Riksantikvaren-verifiserte geometrien \`kulturminnesok:41907\` endres ikke, og Oslo-totalen forblir ${currentCount}.\n`;
writeFileSync(protocolPath, protocol);

console.log(`Relocated ${id} to Oslo coordinate batch ${nextBatch}; verified Oslo count remains ${currentCount}.`);
rmSync(new URL(import.meta.url));
