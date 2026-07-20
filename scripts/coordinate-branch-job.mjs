import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const run = (args) => execFileSync('git', args, { stdio: 'inherit' });
run(['config', 'user.name', 'github-actions[bot]']);
run(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run(['fetch', 'origin', 'main']);
run(['merge', '--no-edit', '-X', 'theirs', 'origin/main']);

const tempPath = path.resolve('scripts/.alna-coordinate-current-main-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/dc50908c6a1b6dd9dc031d370b9c10e681482456/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Kunne ikke hente immutable Alna-runner: ${response.status} ${response.statusText}`);
}

let source = await response.text();
source = source.replace('if (newBatch !== 91)', 'if (newBatch < 92)');
source = source.replaceAll('Neste nye Oslo-kontroll er batch 92.', 'Neste nye Oslo-kontroll er batch ${newBatch + 1}.');
source = source.replaceAll('Før batch 92 starter', 'Før batch ${newBatch + 1} starter');

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
