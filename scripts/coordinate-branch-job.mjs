import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SOURCE_URL = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/d4990a2ef4a428ed932563989a7512962f36bd6c/scripts/coordinate-branch-job.mjs';

const response = await fetch(SOURCE_URL, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) {
  throw new Error(`Kunne ikke hente batch-142 runner-template: ${response.status}`);
}

let source = await response.text();
source = source.replace('const BATCH = 142;', 'const BATCH = 143;');
source = source.replaceAll('batch-142', 'batch-143');
source = source.replaceAll('Batch 142', 'Batch 143');

const tempScript = path.join('/tmp', 'history-go-coordinate-batch-143.mjs');
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolPath, 'utf8');

const blockPattern = /\n\n\| 143 \| `ljanselva_skullerud` \| Ljanselva ved Skullerud \| verified_geometry \| `osm-way:27271638` \|\n\nBatch 143 \(2026-07-22\) løser `ljanselva_skullerud`[\s\S]*?ingen nearest\/first-hit-logikk brukes\./;
const blockMatch = protocol.match(blockPattern);
if (!blockMatch) {
  throw new Error('Fant ikke generert batch 143-blokk i koordinatprotokollen');
}
const batch143Block = blockMatch[0];
protocol = protocol.replace(blockPattern, '');

const batch142Marker = 'Batch 142 (2026-07-22) etterfører den mergede Subkultur-randsonebatchen.';
const markerIndex = protocol.indexOf(batch142Marker);
if (markerIndex < 0) {
  throw new Error('Fant ikke Subkultur batch 142-ankeret på fresh main');
}
const paragraphEnd = protocol.indexOf('\n\n', markerIndex);
if (paragraphEnd < 0) {
  throw new Error('Fant ikke slutten på Subkultur batch 142-avsnittet');
}
protocol = `${protocol.slice(0, paragraphEnd)}${batch143Block}${protocol.slice(paragraphEnd)}`;

protocol = protocol.replace(
  /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
  (_match, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
);

fs.writeFileSync(protocolPath, protocol);
console.log('Reordered batch 143 after existing Subkultur batch 142 and incremented Oslo verified* protocol count.');
