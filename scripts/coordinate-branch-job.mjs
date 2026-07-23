import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '3a43e350bed8e961bc798ee2d43114721ecbf249';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/sagene-kvernhus-duplicate-migration.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
const original = `const lesespor = readJson(LESESPOR_FILE);\nlet lesesporReplacements = 0;\nfor (const item of lesespor) {\n  if (!Array.isArray(item?.place_ids)) continue;\n  if (item.place_ids.includes(LEGACY_ID)) {\n    item.place_ids = dedupe(item.place_ids.map((id) => id === LEGACY_ID ? CANONICAL_ID : id));\n    lesesporReplacements += 1;\n  }\n}\nif (lesesporReplacements !== 1) throw new Error(\`Expected one lesespor replacement, got \${lesesporReplacements}\`);\nwriteJson(LESESPOR_FILE, lesespor);`;
const replacement = `const lesespor = readJson(LESESPOR_FILE);\nconst lesesporItems = Array.isArray(lesespor) ? lesespor : lesespor.items;\nif (!Array.isArray(lesesporItems)) throw new Error(\`\${LESESPOR_FILE} has no iterable items array\`);\nlet lesesporReplacements = 0;\nfor (const item of lesesporItems) {\n  if (!Array.isArray(item?.place_ids)) continue;\n  if (item.place_ids.includes(LEGACY_ID)) {\n    item.place_ids = dedupe(item.place_ids.map((id) => id === LEGACY_ID ? CANONICAL_ID : id));\n    lesesporReplacements += 1;\n  }\n}\nif (lesesporReplacements !== 1) throw new Error(\`Expected one lesespor replacement, got \${lesesporReplacements}\`);\nwriteJson(LESESPOR_FILE, lesespor);`;

if (!source.includes(original)) throw new Error('Could not patch lesespor traversal into batch 188 source');
source = source.replace(original, replacement);
fs.writeFileSync(TEMP_SCRIPT, source, 'utf8');
await import(pathToFileURL(TEMP_SCRIPT).href);
