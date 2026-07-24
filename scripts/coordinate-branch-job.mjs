import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (!runnerReportDir) throw new Error('RUNNER_REPORT_DIR is missing.');

const sourceDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194');
const targetDir = join(root, runnerReportDir, 'manual-visual');
await mkdir(targetDir, { recursive: true });

const summary = JSON.parse(await readFile(join(sourceDir, 'summary.json'), 'utf8'));
if (summary.placeId !== 'sigrid_undset_statue') throw new Error('Unexpected source report.');
if (summary.exactOsmCandidate?.id !== 7596280553) throw new Error('Exact OSM candidate changed.');
if (summary.googleImage?.sha256 !== 'bc1dc83cce6a039eb1012cc69058ba09076707f1e603f36ba1326d326f4f1d6f') throw new Error('Pinned thumbnail hash changed.');

const files = [
  'osm-google-photo-1-full.jpg',
  'osm-google-photo-2-full.jpg',
  'photo-1-enhanced.png',
  'photo-1-bottom-enhanced.png',
  'photo-2-enhanced.png',
  'photo-2-bottom-enhanced.png',
];
for (const file of files) {
  await copyFile(join(sourceDir, file), join(targetDir, file));
}

await writeFile(join(targetDir, 'manifest.json'), `${JSON.stringify({
  version: '2026-07-24',
  placeId: 'sigrid_undset_statue',
  exactOsmNodeId: 7596280553,
  purpose: 'manual_visual_identity_review_only',
  files,
}, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({ targetDir: `${runnerReportDir}/manual-visual`, files }, null, 2));
