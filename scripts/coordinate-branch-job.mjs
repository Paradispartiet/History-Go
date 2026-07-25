import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const original = spawnSync('git', [
  'show',
  '8575b5204ed61586fd6c07d9af11b2a9fd45005d:scripts/coordinate-branch-job.mjs'
], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024
});
if (original.error || original.status !== 0) {
  throw new Error(`Kunne ikke hente den opprinnelige økonomirunneren\n${original.stderr || ''}`);
}

const oldClassifier = `function isCurated(object) {
  return String(object?.status || '').includes('curated') &&
    !String(object?.definition || '').includes('betegner «');
}`;
const newClassifier = `function isCurated(object) {
  const definition = String(object?.definition || '');
  const misuse = (object?.common_misuse || []).join(' ');
  const semanticRelations = [
    ...(object?.broader_concepts || []),
    ...(object?.narrower_concepts || []),
    ...(object?.related_concepts || []),
    ...(object?.distinguish_from || [])
  ];
  return definition.length >= 80 &&
    !definition.includes('betegner «') &&
    semanticRelations.length > 0 &&
    !misuse.includes('som en tidløs etikett');
}`;
const oldContextSeed = `affectedContexts.add(path.join(contextRoot, 'by', 'deichman_bjorvika.json'));`;
const newContextSeed = `affectedContexts.add(path.join(contextRoot, 'by', 'deichman_bjorvika.json'));
for (const targetId of [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
]) {
  affectedContexts.add(path.join(contextRoot, 'historie', \`${'${targetId}'}.json\`));
}`;
if (!original.stdout.includes(oldClassifier)) {
  throw new Error('Fant ikke isCurated-blokken i den opprinnelige runneren');
}
if (!original.stdout.includes(oldContextSeed)) {
  throw new Error('Fant ikke quizkontekstfrøet i den opprinnelige runneren');
}
const transformed = original.stdout
  .replace(oldClassifier, newClassifier)
  .replace(oldContextSeed, newContextSeed);
const target = path.join('/tmp', 'history-economy-curation-fixed.mjs');
fs.writeFileSync(target, transformed);
await import(`file://${target}?v=${Date.now()}`);
