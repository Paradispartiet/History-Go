import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const MODEL = 'data/Civication/roleModels/vitenskap/vitenskap_forskning.json';
const manifestPath = path.join(ROOT, MANIFEST);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!Array.isArray(manifest.files)) {
  throw new Error('Role-model manifest files[] is missing');
}
if (!manifest.files.includes(MODEL)) {
  manifest.files.push(MODEL);
  manifest.files.sort();
}
if (manifest.files.filter((entry) => entry === MODEL).length !== 1) {
  throw new Error('vitenskap_forskning role model must occur exactly once in manifest');
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Registered ${MODEL} exactly once in ${MANIFEST}.`);
