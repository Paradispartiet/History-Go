import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const qualityDir = path.join(repoRoot, 'data/fag/politikk/kvalitetslag_v1');
const fagkartPath = path.join(repoRoot, 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json');
const emnerPath = path.join(repoRoot, 'data/fag/politikk/emner_politikk_canonical_v4_5.json');

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function mergeObjects(parts) {
  return Object.assign({}, ...parts);
}

const manifest = await loadJson(path.join(qualityDir, 'manifest.json'));
const hookParts = await Promise.all(manifest.files.hooks.map((file) => loadJson(path.join(qualityDir, file))));
const emneParts = await Promise.all(manifest.files.emner.map((file) => loadJson(path.join(qualityDir, file))));
const hookUpgrades = mergeObjects(hookParts);
const emneUpgrades = mergeObjects(emneParts);
const fagkart = await loadJson(fagkartPath);
const emner = await loadJson(emnerPath);

const errors = [];
const domain = fagkart.categories?.find((category) => category.id === manifest.scope.domain_id);
assert(domain, `Mangler fagkartdomene: ${manifest.scope.domain_id}`, errors);

const canonicalHookIds = new Set((domain?.topic_hooks ?? []).map((hook) => hook.id));
const canonicalEmneIds = new Set(emner.map((emne) => emne.emne_id));

for (const [hookId, upgrade] of Object.entries(hookUpgrades)) {
  assert(canonicalHookIds.has(hookId), `Ukjent hook-id: ${hookId}`, errors);
  for (const field of manifest.quality_standard.hook_fields) {
    assert(upgrade[field] !== undefined, `Hook ${hookId} mangler ${field}`, errors);
  }
}

for (const [emneId, upgrade] of Object.entries(emneUpgrades)) {
  assert(canonicalEmneIds.has(emneId), `Ukjent emne-id: ${emneId}`, errors);
  for (const field of manifest.quality_standard.emne_fields) {
    assert(upgrade[field] !== undefined, `Emne ${emneId} mangler ${field}`, errors);
  }
}

assert(Object.keys(hookUpgrades).length === manifest.scope.hook_count,
  `Forventet ${manifest.scope.hook_count} hooks, fant ${Object.keys(hookUpgrades).length}`, errors);
assert(Object.keys(emneUpgrades).length === manifest.scope.emne_count,
  `Forventet ${manifest.scope.emne_count} emner, fant ${Object.keys(emneUpgrades).length}`, errors);

if (errors.length) {
  console.error('Politikk-kvalitetslag: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Politikk-kvalitetslag: PASS');
console.log(`- domene: ${manifest.scope.domain_id}`);
console.log(`- hooks: ${Object.keys(hookUpgrades).length}`);
console.log(`- emner: ${Object.keys(emneUpgrades).length}`);
