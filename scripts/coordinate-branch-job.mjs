import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.popkultur-control-fixed-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/b45b74325197a1f4d805a91a8484f5ed2074f6f9/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Kunne ikke hente immutable popkultur-runner: ${response.status} ${response.statusText}`);
let source = await response.text();
source = source.replaceAll("locatorType: 'venue'", "locatorType: 'current_place'");
source = source.replace(
  "definition.locatorType === 'building' ? 'building' : 'semantic_anchor'",
  "['building','current_place'].includes(definition.locatorType) ? 'building' : 'semantic_anchor'"
);
if (source.includes("locatorType: 'venue'")) throw new Error('Ugyldig venue-locatorType ble ikke fullstendig erstattet.');
if (!source.includes("['building','current_place'].includes(definition.locatorType) ? 'building'")) throw new Error('current_place-nøyaktighetsrettingen ble ikke anvendt.');
fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
