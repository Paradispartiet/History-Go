import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '232cd56ec6704023d49d8e9462427491c3a0fd4c';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/loelva-historical-alias-migration-final.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
source = source.replace(
  `const I18N_FILES = [\n  'data/i18n/content/places/en.json',\n  'data/i18n/content/places/es.json',\n  'data/i18n/content/places/pt.json'\n];`,
  `const I18N_FILES = [\n  'data/i18n/content/places/en.json',\n  'data/i18n/content/places/es.json',\n  'data/i18n/content/places/pt.json'\n];\nconst APPROVED_KEY_COLLISION_FILES = new Set([\n  'data/natur/nature_place_map.json',\n  'data/natur/nature_place_map_candidates.json'\n]);`
);
source = source.replace(
  `function replaceExact(value, rel, collisions) {`,
  `function mergeCanonicalPreferred(existing, incoming) {\n  if (existing === undefined) return incoming;\n  if (incoming === undefined) return existing;\n  if (JSON.stringify(existing) === JSON.stringify(incoming)) return existing;\n  if (Array.isArray(existing) && Array.isArray(incoming)) return dedupeArray([...existing, ...incoming]);\n  if (existing && incoming && typeof existing === 'object' && typeof incoming === 'object' && !Array.isArray(existing) && !Array.isArray(incoming)) {\n    const out = { ...existing };\n    for (const [key, value] of Object.entries(incoming)) out[key] = mergeCanonicalPreferred(out[key], value);\n    return out;\n  }\n  return existing;\n}\n\nfunction replaceExact(value, rel, collisions) {`
);
source = source.replace(
  `if (Object.prototype.hasOwnProperty.call(out, nextKey) && nextKey !== key) {\n        if (JSON.stringify(out[nextKey]) !== JSON.stringify(nextValue)) {\n          collisions.push({ file: rel, key: nextKey });\n        }\n        continue;\n      }`,
  `if (Object.prototype.hasOwnProperty.call(out, nextKey) && nextKey !== key) {\n        if (APPROVED_KEY_COLLISION_FILES.has(rel)) {\n          out[nextKey] = mergeCanonicalPreferred(out[nextKey], nextValue);\n          continue;\n        }\n        if (JSON.stringify(out[nextKey]) !== JSON.stringify(nextValue)) {\n          collisions.push({ file: rel, key: nextKey });\n        }\n        continue;\n      }`
);
if (!source.includes('APPROVED_KEY_COLLISION_FILES.has(rel)')) {
  throw new Error('Could not patch Loelva nature-map collision handling');
}
fs.writeFileSync(TEMP_SCRIPT, source);
await import(`${pathToFileURL(TEMP_SCRIPT).href}?final=3`);
