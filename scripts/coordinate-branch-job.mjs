import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_RUNNER_COMMIT = 'bab85f1f753fe995bf905a548dacc4d2388fe83a';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_RUNNER = path.join(ROOT, 'scripts/.sport-batch121-replay-fixed.mjs');

let source = execFileSync('git', ['show', `${SOURCE_RUNNER_COMMIT}:${SOURCE_PATH}`], {
  cwd: ROOT,
  encoding: 'utf8'
});

const oldEvidenceBlock = `// Strong replay gate: none of the sport source/split/evidence files may have changed on current main
// since the validated source branch started. Shared runtime/protocol/report files are intentionally excluded.
for (const rel of targetFiles) {
  const oldContent = execFileSync('git', ['show', \`\${SOURCE_BASE}:\${rel}\`], { cwd: ROOT, encoding: 'utf8' });
  const currentContent = fs.readFileSync(abs(rel), 'utf8');
  if (oldContent !== currentContent) {
    throw new Error(\`Fresh-main replay blocked: \${rel} changed since validated source base \${SOURCE_BASE}\`);
  }
}

for (const rel of targetFiles) copyFromCommit(rel);

// All evidence files already existed before the validated run; ensure the live manifest still registers them.
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const rel of targetEvidenceFiles) {
  const entry = rel.replace(/^data\\/coordinate-evidence\\//, '');
  if (!evidenceManifest.files.includes(entry)) {
    throw new Error(\`Coordinate evidence manifest unexpectedly lacks existing entry \${entry}\`);
  }
}`;

const newEvidenceBlock = `// Strong replay gate for files that existed when the validated source branch started.
// No pre-existing sport source/split/index/manifest file may have changed on current main.
for (const rel of targetPlaceFiles) {
  const oldContent = execFileSync('git', ['show', \`\${SOURCE_BASE}:\${rel}\`], { cwd: ROOT, encoding: 'utf8' });
  const currentContent = fs.readFileSync(abs(rel), 'utf8');
  if (oldContent !== currentContent) {
    throw new Error(\`Fresh-main replay blocked: \${rel} changed since validated source base \${SOURCE_BASE}\`);
  }
}

// The validated run created per-place evidence files that did not exist in SOURCE_BASE.
// If an evidence file did exist, it must still be byte-identical; if it did not, current main must still lack it.
for (const rel of targetEvidenceFiles) {
  let existedInBase = true;
  try {
    execFileSync('git', ['cat-file', '-e', \`\${SOURCE_BASE}:\${rel}\`], { cwd: ROOT, stdio: 'ignore' });
  } catch {
    existedInBase = false;
  }
  if (existedInBase) {
    const oldContent = execFileSync('git', ['show', \`\${SOURCE_BASE}:\${rel}\`], { cwd: ROOT, encoding: 'utf8' });
    const currentContent = fs.readFileSync(abs(rel), 'utf8');
    if (oldContent !== currentContent) {
      throw new Error(\`Fresh-main replay blocked: existing evidence \${rel} changed since source base\`);
    }
  } else if (fs.existsSync(abs(rel))) {
    throw new Error(\`Fresh-main replay blocked: new evidence path \${rel} now exists on current main\`);
  }
}

for (const rel of targetFiles) copyFromCommit(rel);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const rel of targetEvidenceFiles) {
  const entry = rel.replace(/^data\\/coordinate-evidence\\//, '');
  if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
}
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);`;

const oldDuplicateBlock = `// Guard against duplicate protocol decisions anywhere inside the Oslo section.
for (const id of [...verified.map(([id]) => id), ...needsReview.map(({ id }) => id)]) {
  const token = \`\\\`\${id}\\\`\`;
  if (lines.slice(osloIndex, osloEnd).some((line) => line.includes(token) && (line.startsWith('| ') || line.includes('needs_review')))) {
    throw new Error(\`Protocol already contains completed decision for \${id}; replay must be re-audited\`);
  }
}`;

const newDuplicateBlock = `// Guard only actual completed protocol decisions, not narrative mentions or contrast references.
const existingNumericIds = new Set();
const existingNeedsReviewIds = new Set();
for (const line of lines.slice(osloIndex, osloEnd)) {
  const numericMatch = line.match(/^\\|\\s*\\d+\\s*\\|\\s*\\\`([^\\\`]+)\\\`\\s*\\|/);
  if (numericMatch) existingNumericIds.add(numericMatch[1]);
  if (line.startsWith('| ') && line.includes('| needs_review |')) {
    const needsMatch = line.match(/\\\`([^\\\`]+)\\\`/);
    if (needsMatch) existingNeedsReviewIds.add(needsMatch[1]);
  }
}
for (const id of [...verified.map(([id]) => id), ...needsReview.map(({ id }) => id)]) {
  if (existingNumericIds.has(id) || existingNeedsReviewIds.has(id)) {
    throw new Error(\`Protocol already contains completed decision for \${id}; replay must be re-audited\`);
  }
}`;

if (!source.includes(oldEvidenceBlock)) {
  throw new Error('Could not find the original replay/evidence guard block');
}
if (!source.includes(oldDuplicateBlock)) {
  throw new Error('Could not find the original protocol duplicate guard block');
}
source = source.replace(oldEvidenceBlock, newEvidenceBlock);
source = source.replace(oldDuplicateBlock, newDuplicateBlock);
fs.writeFileSync(TEMP_RUNNER, source);

try {
  execFileSync(process.execPath, [TEMP_RUNNER], { cwd: ROOT, stdio: 'inherit' });
} finally {
  if (fs.existsSync(TEMP_RUNNER)) fs.unlinkSync(TEMP_RUNNER);
}
