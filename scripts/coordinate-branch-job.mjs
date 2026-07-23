import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '3a43e350bed8e961bc798ee2d43114721ecbf249';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/sagene-kvernhus-duplicate-migration.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });

const oldLesespor = `const lesespor = readJson(LESESPOR_FILE);\nlet lesesporReplacements = 0;\nfor (const item of lesespor) {\n  if (!Array.isArray(item?.place_ids)) continue;\n  if (item.place_ids.includes(LEGACY_ID)) {\n    item.place_ids = dedupe(item.place_ids.map((id) => id === LEGACY_ID ? CANONICAL_ID : id));\n    lesesporReplacements += 1;\n  }\n}\nif (lesesporReplacements !== 1) throw new Error(\`Expected one lesespor replacement, got \${lesesporReplacements}\`);\nwriteJson(LESESPOR_FILE, lesespor);`;
const newLesespor = `const lesespor = readJson(LESESPOR_FILE);\nconst lesesporItems = Array.isArray(lesespor) ? lesespor : lesespor.items;\nif (!Array.isArray(lesesporItems)) throw new Error(\`\${LESESPOR_FILE} has no iterable items array\`);\nlet lesesporReplacements = 0;\nfor (const item of lesesporItems) {\n  if (!Array.isArray(item?.place_ids)) continue;\n  if (item.place_ids.includes(LEGACY_ID)) {\n    item.place_ids = dedupe(item.place_ids.map((id) => id === LEGACY_ID ? CANONICAL_ID : id));\n    lesesporReplacements += 1;\n  }\n}\nif (lesesporReplacements !== 1) throw new Error(\`Expected one lesespor replacement, got \${lesesporReplacements}\`);\nwriteJson(LESESPOR_FILE, lesespor);`;
if (!source.includes(oldLesespor)) throw new Error('Could not patch lesespor traversal into batch 188 source');
source = source.replace(oldLesespor, newLesespor);

const guardMarker = `// 12. Hard post-migration guards.\nconst postExact = spawnSync('git', ['grep', '-n', '-F', \`"\${LEGACY_ID}"\`, '--', 'data'], { encoding: 'utf8' });`;
const guardedWithRebuild = `// 12. Rebuild runtime place index before checking active residual references.\nconst runtimeRebuild = spawnSync('npm', ['run', 'places:index:build'], { encoding: 'utf8' });\nwriteFileSync(\`\${REPORT_DIR}/places-index-precheck-build.log\`, \`\${runtimeRebuild.stdout ?? ''}\${runtimeRebuild.stderr ?? ''}\`, 'utf8');\nif (runtimeRebuild.status !== 0) throw new Error(\`Runtime place-index rebuild failed with \${runtimeRebuild.status}\`);\n\n// 13. Hard post-migration guards.\nconst postExact = spawnSync('git', ['grep', '-n', '-F', \`"\${LEGACY_ID}"\`, '--', 'data'], { encoding: 'utf8' });`;
if (!source.includes(guardMarker)) throw new Error('Could not insert runtime index rebuild before batch 188 residual guards');
source = source.replace(guardMarker, guardedWithRebuild);

fs.writeFileSync(TEMP_SCRIPT, source, 'utf8');
await import(pathToFileURL(TEMP_SCRIPT).href);
