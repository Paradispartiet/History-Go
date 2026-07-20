import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '29645f7cde648e41dce75d07e5ff78bc6f333678';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/nydalen-industristed-duplicate-migration.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });

source = source.replace(
  "const REPORT_DIR = 'reports/nydalen-industristed-duplicate-migration-final';",
  "const REPORT_DIR = 'reports/nydalen-industristed-duplicate-migration-final';\nconst NATURE_COLLISION_FILES = [\n  'data/natur/nature_bird_place_map.json',\n  'data/natur/nature_place_map_candidates.json'\n];"
);

const helper = `function mergeCollisionValue(canonicalValue, legacyValue) {
  if (canonicalValue === undefined || canonicalValue === null) return legacyValue;
  if (legacyValue === undefined || legacyValue === null) return canonicalValue;
  if (Array.isArray(canonicalValue) && Array.isArray(legacyValue)) {
    const out = [];
    const seen = new Set();
    for (const item of [...canonicalValue, ...legacyValue]) {
      const key = JSON.stringify(item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }
  if (canonicalValue && legacyValue && typeof canonicalValue === 'object' && typeof legacyValue === 'object' && !Array.isArray(canonicalValue) && !Array.isArray(legacyValue)) {
    const out = { ...canonicalValue };
    for (const [key, legacyChild] of Object.entries(legacyValue)) {
      out[key] = Object.prototype.hasOwnProperty.call(out, key)
        ? mergeCollisionValue(out[key], legacyChild)
        : legacyChild;
    }
    return out;
  }
  return canonicalValue;
}

function mergeLegacyKeyRecursively(value) {
  if (Array.isArray(value)) {
    for (const item of value) mergeLegacyKeyRecursively(item);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (Object.prototype.hasOwnProperty.call(value, OLD)) {
    const legacyValue = value[OLD];
    value[NEW] = Object.prototype.hasOwnProperty.call(value, NEW)
      ? mergeCollisionValue(value[NEW], legacyValue)
      : legacyValue;
    delete value[OLD];
  }
  for (const child of Object.values(value)) mergeLegacyKeyRecursively(child);
}

`;
source = source.replace('function replaceExact(value, rel, collisions) {', `${helper}function replaceExact(value, rel, collisions) {`);

const collisionHandling = `// Merge the two known nature-map key collisions explicitly instead of overwriting canonical Nydalen data.
for (const rel of NATURE_COLLISION_FILES) {
  const data = readJson(rel);
  mergeLegacyKeyRecursively(data);
  const postMergeCollisions = [];
  const normalized = replaceExact(data, rel, postMergeCollisions);
  if (postMergeCollisions.length) throw new Error(\`Nature-map collisions remain after explicit Nydalen merge in \${rel}: \${JSON.stringify(postMergeCollisions)}\`);
  writeJson(rel, normalized);
}

`;
source = source.replace('const specialFiles = new Set([', `${collisionHandling}const specialFiles = new Set([\n  ...NATURE_COLLISION_FILES,`);

source = source.replace(
  "const article = readJson(articlePath).find((row) => row.place_id === 'nydalen' && JSON.stringify(row).includes('Nydalens Compagnie'));",
  "const article = readJson(articlePath).find((row) => row.place_id === 'nydalen' && Array.isArray(row.wikiText) && row.wikiText.length >= 2);"
);

for (const required of ['NATURE_COLLISION_FILES', 'mergeLegacyKeyRecursively', '...NATURE_COLLISION_FILES', "row.place_id === 'nydalen' && Array.isArray(row.wikiText)"]) {
  if (!source.includes(required)) throw new Error(`Failed to patch Nydalen migration source: missing ${required}`);
}

fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);
