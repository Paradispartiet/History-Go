#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const previous = execFileSync('git', ['show', 'HEAD~1:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const marker = "let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');";
if (!previous.includes(marker)) throw new Error('Fant ikke evidence-manifest injection marker i batch 125-implementasjonen');

const evidenceSync = `
// Keep the evidence manifest in sync with canonical ID migrations. Batch 124 created
// Frognerparken evidence but did not register it, so include that file here as well.
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceManifest = readJson(evidenceManifestFile);
const retiredEvidenceEntries = new Set([
  'oslo/subkultur/sofienbergparken_subkultur.json',
  'oslo/sport/treningssted_torshovdalen.json',
  'oslo/sport/treningssted_sognsvann.json',
]);
const canonicalEvidenceEntries = [
  'oslo/by/frognerparken.json',
  'oslo/by/sofienbergparken.json',
  'oslo/by/torshovdalen.json',
  'oslo/natur/sognsvann.json',
];
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => !retiredEvidenceEntries.has(entry));
for (const entry of canonicalEvidenceEntries) {
  const evidencePath = path.join(root, 'data/coordinate-evidence', entry);
  if (!fs.existsSync(evidencePath)) throw new Error('Mangler canonical evidence-fil før manifest-sync: ' + entry);
  if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
}
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

`;

const implementation = previous.replace(marker, evidenceSync + marker);
const tmp = path.join(root, 'scripts/.coordinate-batch-125-impl.tmp.mjs');
fs.writeFileSync(tmp, implementation);

try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);

  // Run evidence audit inside the one-shot step as a diagnostic gate so a future failure
  // includes the full problem table in the runner artifact instead of only a problem count.
  execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
  try {
    execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });
  } catch (error) {
    const report = path.join(root, 'reports/coordinate-evidence-audit.md');
    if (fs.existsSync(report)) {
      const text = fs.readFileSync(report, 'utf8');
      console.error('\n--- coordinate evidence diagnostic ---\n' + text);
      const runnerDir = process.env.RUNNER_REPORT_DIR ? path.join(root, process.env.RUNNER_REPORT_DIR) : null;
      if (runnerDir) {
        fs.mkdirSync(runnerDir, { recursive: true });
        fs.writeFileSync(path.join(runnerDir, 'coordinate-evidence-diagnostic.md'), text);
      }
    }
    throw error;
  }
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
