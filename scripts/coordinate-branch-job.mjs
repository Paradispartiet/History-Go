import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

// Minimize batch-number races: update this one-shot branch to the latest main before reading shared protocol state.
execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git', ['fetch', 'origin', 'main'], { stdio: 'inherit' });
execFileSync('git', ['rebase', 'origin/main'], { stdio: 'inherit' });

const id = 'ekeberg_helleristninger';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = readFileSync(protocolPath, 'utf8');

const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse Oslo verified-place count.');
const currentCount = Number(countMatch[1]);

// Remove the misplaced Ekeberg row wherever it appears and remove the stale original production narrative.
protocol = protocol.replace(/^\|\s*\d+\s*\|\s*`ekeberg_helleristninger`\s*\|.*(?:\n|$)/gm, '');
protocol = protocol.replace(/^Batch\s+\d+\s+\(2026-07-20\)\s+produserer\s+`ekeberg_helleristninger`[^\n]*(?:\n|$)/gm, '');

const anchor = 'Relevante korrigerende merger for de første Oslo-batchene:';
const anchorIndex = protocol.indexOf(anchor);
if (anchorIndex < 0) throw new Error('Could not find Oslo coordinate table end anchor.');
const osloRegion = protocol.slice(0, anchorIndex);
const osloRows = [...osloRegion.matchAll(/^\|\s*(\d+)\s*\|.*$/gm)];
if (!osloRows.length) throw new Error('No Oslo coordinate table rows found.');
const nextBatch = Math.max(...osloRows.map((m) => Number(m[1]))) + 1;
const last = osloRows.at(-1);
const insertAt = last.index + last[0].length;
const row = `| ${nextBatch} | \`${id}\` | Helleristningene på Ekeberg | verified_geometry | \`kulturminnesok:41907\` |`;
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  `Oslo-tabellen inneholder nå ${currentCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} flytter Helleristningene på Ekeberg fra den feilplasserte opprinnelige raden i Etne-tabellen til riktig Oslo-tabell. Totalantallet endres ikke fordi stedet allerede var canonical og medregnet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 29.`
);

protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) retter protokollplasseringen for \`${id}\`. Den opprinnelige produksjonsmergen plasserte Ekeberg-raden nederst i Etne-tabellen, mens senere Oslo-batcher fortsatte å bruke den ordinære Oslo-tabellen. Denne reparasjonen fjerner den feilplasserte raden og den gamle produksjonsteksten og registrerer Ekeberg i riktig Oslo-tabell på neste ledige batch etter siste synkroniserte \`main\`. Canonical place, runtime-identitet, coordinate evidence og den Riksantikvaren-verifiserte geometrien \`kulturminnesok:41907\` endres ikke, og Oslo-totalen forblir ${currentCount}.\n`;
writeFileSync(protocolPath, protocol);
console.log(`Moved ${id} to Oslo coordinate batch ${nextBatch}; verified Oslo count remains ${currentCount}.`);
rmSync(new URL(import.meta.url));
