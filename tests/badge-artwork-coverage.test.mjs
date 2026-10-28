import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const categories = read('data/categories/category_contract.json').runtimeCategories;
const index = read('data/badges/index.json').files;
const redesigned = ['kunst','religion','media','film_tv','psykologi','helse','utdanning'];

test('all 19 canonical categories have actual badge images in the registry', () => {
  assert.deepEqual(new Set(index.map(path => path.split('/').at(-1).replace('.json',''))), new Set(categories));
  for (const id of categories) {
    const badge = read('data/badges/' + id + '.json');
    assert.equal(badge.id, id);
    assert.ok(badge.image, id + ' lacks image');
    assert.match(badge.image, /^bilder\/merker\/[a-zA-Z0-9_.-]+$/);
    assert.ok(existsSync(resolve(root, badge.image)), id + ' missing image file: ' + badge.image);
  }
});

test('redesigned badges have distinct accessible symbolic vector artwork', () => {
  for (const id of redesigned) {
    const badge = read('data/badges/' + id + '.json');
    assert.equal(badge.image, 'bilder/merker/' + id + '.svg');
    const svg = readFileSync(resolve(root, badge.image), 'utf8');
    assert.match(svg, /<svg\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /<title id="title">/);
    assert.match(svg, /<desc id="desc">/);
    assert.ok(svg.includes('id="symbol-' + id + '"'), id + ' lacks its dedicated motif');
    assert.match(svg, /<\/svg>\s*$/);
    assert.doesNotMatch(svg, /<script|<image\s|<foreignObject|https?:\/\/[^"]+["']/);
  }
});
