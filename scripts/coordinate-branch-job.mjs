import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.art-queue-tail-current-main-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/f734447aac2f49555f250666baa2dee4b4264708/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Kunne ikke hente immutable art-queue-runner: ${response.status} ${response.statusText}`);
}

let source = await response.text();
const oldTotalBlock = `const totalMatch = protocol.match(/Oslo-tabellen inneholder nå (\\d+) (?:dokumenterte )?verifiserte eller kildekontrollerte canonical steder\\./);
if (!totalMatch) throw new Error('Kunne ikke lese Oslo-totalen i protokollen.');
const newTotal = Number(totalMatch[1]) + ids.length;`;
const robustTotalBlock = `const osloSectionStart = protocol.indexOf('## Oslo');
const osloCorrectionsMarker = protocol.indexOf('\\nRelevante korrigerende merger for de første Oslo-batchene:', osloSectionStart);
if (osloSectionStart < 0 || osloCorrectionsMarker < 0) throw new Error('Kunne ikke avgrense Oslo-hovedtabellen i protokollen.');
const osloPrimarySection = protocol.slice(osloSectionStart, osloCorrectionsMarker);
const existingVerifiedIds = new Set([...osloPrimarySection.matchAll(/^\\|\\s*\\d+\\s*\\|\\s*\\x60([^\\x60]+)\\x60\\s*\\|/gm)].map((match) => match[1]));
const newIds = ids.filter((id) => !existingVerifiedIds.has(id));
const newTotal = existingVerifiedIds.size + newIds.length;`;

if (!source.includes(oldTotalBlock)) {
  throw new Error('Fant ikke den gamle Oslo-tellerblokken i immutable art-queue-runner.');
}
source = source.replace(oldTotalBlock, robustTotalBlock);

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
