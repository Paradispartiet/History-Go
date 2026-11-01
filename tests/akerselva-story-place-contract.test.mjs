import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = p => JSON.parse(readFileSync(new URL('../'+p, import.meta.url), 'utf8'));

test('1889 strike is anchored at Bryn, never Akerselva, with source and stable story ID', () => {
  const entry = read('data/stories/stories_akerselva.json')[0];
  const manifest = read('data/stories/stories_manifest.json').files;
  const src = manifest.find(x => x.path === 'data/stories/stories_akerselva.json');
  const akerselva = read('data/runtime/place-open/akerselva.json');
  const bryn = read('data/runtime/place-open/bryn_industriomrade.json');
  const shard = read('data/runtime/stories-all/part-001.json').find(x => x.id === entry.id);
  assert.equal(entry.id, 'st_akerselva_fyrstikkpikene_1889'); // legacy stable ID for progress
  assert.equal(entry.place_id, 'bryn_industriomrade');
  assert.equal(src.entity_id, 'bryn_industriomrade');
  assert.equal(src.category, 'naeringsliv');
  assert.equal(entry.sources.length, 3);
  assert.ok(entry.sources.every(x => x.url.startsWith('https://')));
  assert.equal(akerselva.stories.some(x => x.id === entry.id), false);
  assert.deepEqual(bryn.stories, [entry]);
  assert.deepEqual(shard, entry);
  assert.ok(!/streiken varte i ti dager|langs Akerselva/.test(entry.story + entry.title));
});
