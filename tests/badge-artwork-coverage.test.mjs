import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const categories = read('data/categories/category_contract.json').runtimeCategories;
const index = read('data/badges/index.json').files;
const redesigned = ['film_tv','psykologi','helse','utdanning'];

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

test('Kunst uses its own tricolor, embroidered WebP artwork', () => {
  const badge = read('data/badges/kunst.json');
  assert.equal(badge.image, 'bilder/merker/kunst-brodert.webp');
  const image = readFileSync(resolve(root, badge.image));
  assert.ok(image.length > 4000, 'Kunst badge file is too small');
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
});

test('Medier uses lighter-blue embroidered art without replacing other category badges', () => {
  const badge = read('data/badges/media.json');
  assert.equal(badge.image, 'bilder/merker/media-brodert-lysbla.webp');
  assert.equal(badge.color, '#57AEE2');
  const file = readFileSync(resolve(root, badge.image));
  assert.ok(file.length > 7000, 'Medier image is too small');
  assert.equal(file.toString('ascii', 0, 4), 'RIFF');
  assert.equal(file.toString('ascii', 8, 12), 'WEBP');
});

test('originale merker beholdes med eksisterende bildefiler og farger', () => {
  const locked = {
    historie: {image:'bilder/merker/historie.PNG',color:'#603E1E',secondaryColor:'#533217'},
    sport: {image:'bilder/merker/sport.PNG',color:'#A01D13',secondaryColor:'#A51E15'},
    naeringsliv: {image:'bilder/merker/naeringsliv3.webp',color:'#0E3290',secondaryColor:'#AFB0B0'},
    politikk: {image:'bilder/merker/politikk.PNG',color:'#103E71',secondaryColor:'#114A84'},
    subkultur: {image:'bilder/merker/Subkultur3.PNG',color:'#292625',secondaryColor:'#E78847'},
    musikk: {image:'bilder/merker/musikk.PNG',color:'#122033',secondaryColor:'#121E2B'}
  };
  for (const [id,expected] of Object.entries(locked)) {
    const badge=read('data/badges/' + id + '.json');
    for (const [key,value] of Object.entries(expected)) {
      assert.equal(badge[key],value,id + ': ' + key + ' must stay unchanged');
    }
  }
});

test('Vitenskap har registrert lilla, sydd hovedmerke og sju fungerende undermerker', () => {
  const badge = read('data/badges/vitenskap.json');
  const manifest=read('data/badges/vitenskap_underbadge_artwork.json');
  assert.equal(badge.color,'#6A5AE0');
  assert.equal(badge.secondaryColor,'#332B51');
  assert.equal(manifest.categoryId,'vitenskap');
  assert.equal(manifest.color,badge.color);
  assert.equal(manifest.parentImage,badge.image);
  assert.equal(manifest.assets.length,7);
  assert.equal(Object.keys(badge.subBadgeImages).length,7);
  const checkImage=(imagePath,svgPath)=>{
    assert.match(imagePath,/^bilder\/merker\/vitenskap\/brodert\/[a-z_]+\.webp$/);
    const bytes=readFileSync(resolve(root,imagePath));
    assert.ok(bytes.length>3000,imagePath + ': empty artwork');
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    const svg=readFileSync(resolve(root,svgPath),'utf8');
    assert.match(svg,/<svg\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg,/<pattern id="fabric"/);
    assert.match(svg,/<\/svg>\s*$/);
  };
  checkImage(badge.image,'bilder/merker/vitenskap/brodert/vitenskap.svg');
  for(const asset of manifest.assets){
    assert.ok(badge.sub.includes(asset.id));
    assert.equal(asset.parentBadgeId,'vitenskap');
    assert.equal(badge.subBadgeImages[asset.id],asset.image);
    checkImage(asset.image,asset.svg);
  }
});
