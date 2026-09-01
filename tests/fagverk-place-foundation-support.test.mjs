import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync('data/fagverk/fagverk_registry.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('data/fag/fag_manifest.json', 'utf8'));
const schema = JSON.parse(fs.readFileSync('data/places/regler/place_fagverk_v2.schema.json', 'utf8'));
const auditSource = fs.readFileSync('scripts/audit-fagverk-place-pages.mjs', 'utf8');

function list(value) {
  return Array.isArray(value) ? value : [];
}

test('foundation subjects expose canonical emners even before chapters are registered', () => {
  const religion = registry.subjects.religion;
  assert.equal(religion.canonicalModel.schemaFamily, 'foundation_v1');
  assert.equal(list(religion.chapters).length, 0, 'Religion is intentionally chapterless while chapters are still in progress');

  const emnerPointer = manifest.religion.emner;
  assert.equal(typeof emnerPointer, 'string');
  const document = JSON.parse(fs.readFileSync(`data/fag/${emnerPointer}`, 'utf8'));
  const rows = Array.isArray(document) ? document : list(document.emners || document.emner || document.items);
  const ids = new Set(rows.map((row) => row?.emne_id || row?.id).filter(Boolean));
  for (const id of [
    'em_religion_hellige_rom',
    'em_religion_ritualer_praksis',
    'em_religion_religionshistorie_lokalt',
    'em_religion_kristendom',
    'em_religion_religion_og_samfunn'
  ]) assert.ok(ids.has(id), `Religion manifest is missing ${id}`);

  assert.match(auditSource, /function foundationEmneIds\(/);
  assert.match(auditSource, /chapterlessFoundation/);
});

test('standard Place Fagverk schema permits chapterless foundation pages without weakening full pages', () => {
  const fullRule = schema.allOf.find((rule) => rule.if?.properties?.level?.const === 'full');
  const standardRule = schema.allOf.find((rule) => rule.if?.properties?.level?.const === 'standard');
  assert.equal(fullRule.then.properties.chapter_ids.minItems, 1);
  assert.equal(standardRule.then.properties.chapter_ids, undefined);
});
