import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.ljanselva-route-bounded-query-fix.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/d2342f6a433797bc4e264fae5177a21c5988353f/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Kunne ikke hente immutable Ljanselva-runner: ${response.status} ${response.statusText}`);
let source = await response.text();
for (const query of ['Ljanselva Skullerud', 'Ljanselva Hauketo', 'Ljanselva Ljan', 'Ljanselva Fiskevollen']) {
  source = source.replace(`query: '${query}'`, "query: 'Ljanselva'");
}
fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
