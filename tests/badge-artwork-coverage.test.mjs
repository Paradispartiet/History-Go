import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const categories = read('data/categories/category_contract.json').runtimeCategories;
const index = read('data/badges/index.json').files;
const redesigned = ['kunst','media','film_tv','psykologi','helse','utdanning'];

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
    assert.doesNotMatch(svg, /<script|<image\s|<foreignObject|xlink:href=|<use\s/);
  }
});

test('approved embroidered Religion artwork uses nine real WebP images', () => {
  const badge = read('data/badges/religion.json');
  const manifest = read('data/badges/religion_underbadge_artwork.json');
  assert.equal(badge.color, '#E7B517');
  assert.equal(manifest.categoryId, 'religion');
  assert.equal(manifest.color, '#E7B517');
  assert.equal(manifest.parentImage, badge.image);
  assert.equal(manifest.assets.length, 8);
  assert.equal(Object.keys(badge.subBadgeImages).length, 8);
  const assertWebp = imagePath => {
    assert.match(imagePath, /^bilder\/merker\/religion(?:-godkjent\.webp|\/familie\/godkjent\/[a-z0-9_]+\.webp)$/);
    const file = readFileSync(resolve(root, imagePath));
    assert.ok(file.length > 1000, imagePath);
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.equal(file.toString('ascii', 8, 12), 'WEBP');
  };
  assertWebp(badge.image);
  for (const asset of manifest.assets) {
    assert.equal(asset.parentBadgeId, 'religion');
    assert.equal(badge.subBadgeImages[asset.id], asset.image);
    assertWebp(asset.image);
  }
});
