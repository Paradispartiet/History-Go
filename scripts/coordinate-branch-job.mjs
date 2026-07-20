import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '45eb27a822a12969bae5a7bc0426a2cdfd1893fb';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/nydalen-industristed-duplicate-migration-v4.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
const oldBlock = `if (canonicalMappingEntries.length < 1) {
  throw new Error('Canonical Nydalen route mapping is missing; refusing to create a second physical mapping implicitly');
}
const [oldMappingKey] = oldMappingEntries[0];
delete routeMapping.mappings[oldMappingKey];
writeJson(ROUTE_MAPPING, routeMapping);`;
const newBlock = `const [oldMappingKey] = oldMappingEntries[0];
const canonicalCivicationMappings = [];
for (const abs of walk(full('data/Civication/map'))) {
  if (!abs.endsWith('.json')) continue;
  const rel = path.relative(ROOT, abs);
  const data = readJson(rel);
  for (const [key, mapping] of Object.entries(data.mappings || {})) {
    if (mapping?.historyGoPlaceId === NEW) canonicalCivicationMappings.push({ file: rel, key });
  }
}
if (canonicalCivicationMappings.length < 1) {
  throw new Error('Canonical Nydalen has no Civication mapping anywhere; refusing to retire the only mapping');
}
delete routeMapping.mappings[oldMappingKey];
writeJson(ROUTE_MAPPING, routeMapping);`;

if (!source.includes(oldBlock)) {
  throw new Error('Could not locate the Nydalen route-mapping guard in the validated v2 migration source');
}
source = source.replace(oldBlock, newBlock);
source = source.replace(
  "const article = articles.find((row) => row.place_id === 'nydalen' && JSON.stringify(row).includes('Nydalens Compagnie'));",
  "const article = articles.find((row) => row.place_id === 'nydalen');"
);
fs.writeFileSync(TEMP_SCRIPT, source);
await import(`${pathToFileURL(TEMP_SCRIPT).href}?v=4`);
