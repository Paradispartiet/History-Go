import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sourceCommit = '3a43e350bed8e961bc798ee2d43114721ecbf249';
let source = execFileSync('git', ['show', `${sourceCommit}:scripts/coordinate-branch-job.mjs`], { encoding: 'utf8' });

source = source.replace(
  "const lesespor = readJson(LESESPOR_FILE);\nlet lesesporReplacements = 0;\nfor (const item of lesespor) {",
  "const lesespor = readJson(LESESPOR_FILE);\nconst lesesporItems = Array.isArray(lesespor) ? lesespor : lesespor.items;\nif (!Array.isArray(lesesporItems)) throw new Error(`${LESESPOR_FILE} has no iterable items array`);\nlet lesesporReplacements = 0;\nfor (const item of lesesporItems) {"
);

source = source.replace(
  '// 12. Hard post-migration guards.',
  "// 12. Rebuild runtime index before residual-reference guards.\nconst runtimeRebuild = spawnSync('npm', ['run', 'places:index:build'], { encoding: 'utf8' });\nwriteFileSync(`${REPORT_DIR}/places-index-precheck-build.log`, `${runtimeRebuild.stdout ?? ''}${runtimeRebuild.stderr ?? ''}`, 'utf8');\nif (runtimeRebuild.status !== 0) throw new Error(`Runtime place-index rebuild failed with ${runtimeRebuild.status}`);\n\n// 13. Hard post-migration guards."
);

source = source.replace(
  "spawnSync('node', ['tools/audit-people-invalid-place-refs.mjs'], { encoding: 'utf8' })",
  "spawnSync('npm', ['run', 'audit:people-of-places'], { encoding: 'utf8' })"
);

const temp = '/tmp/sagene-kvernhus-duplicate-migration.mjs';
fs.writeFileSync(temp, source, 'utf8');
await import(pathToFileURL(temp).href);
