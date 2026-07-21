import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempPath = path.resolve('scripts/.bygdoy-nature-current-main-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/75e80833533b24aa445ef3e7f85ed05294d145d0/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Kunne ikke hente immutable Bygdøy-runner: ${response.status} ${response.statusText}`);
let source = await response.text();

source = source.replace(
  "candidate.class === klass && candidate.type === type",
  "(candidate.class ?? candidate.category) === klass && candidate.type === type"
);
source = source.replace(
  "definition.preferences.some(([klass]) => candidate.class === klass)",
  "definition.preferences.some(([klass]) => (candidate.class ?? candidate.category) === klass)"
);
source = source.replaceAll("${candidate.class}/${candidate.type}", "${candidate.class ?? candidate.category}/${candidate.type}");
source = source.replaceAll("${resolution.selected.class}/${resolution.selected.type}", "${resolution.selected.class ?? resolution.selected.category}/${resolution.selected.type}");
source = source.replace(
  "preferences: [['natural', 'bay'], ['natural', 'beach'], ['leisure', 'park'], ['place', 'locality']]",
  "preferences: [['leisure', 'bathing_place'], ['natural', 'bay'], ['natural', 'beach'], ['leisure', 'park'], ['place', 'locality']]"
);

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
