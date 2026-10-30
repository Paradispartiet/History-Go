import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

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


test('Religion uses approved old-fashioned sewn WebP patches on all nine badge surfaces', () => {
  const badge=read('data/badges/religion.json');
  const manifest=read('data/badges/religion_underbadge_artwork.json');
  const expected={
  "religion": "2ba997eadb756ccad54afc39a9d1b196f85de099",
  "kristendom": "b2772ba35aa5bc179e7a5e1fb4cb70f72e4e1745",
  "islam": "5498cd40888fccc4a0de23783d995548290e92d5",
  "jodedom": "cb8779b5bf9ab6eaa75e446f60b0a37c8bf76c54",
  "hinduisme": "f0186c74159d5cb792b880a2e52f519470ddac8d",
  "buddhisme": "ef1c2d81cf3d1db5a97fcdc41439b68b71beadbb",
  "andre_tros_og_livssynstradisjoner": "6b4b808786a955b94d6a2d9b1b4305bb3cfdee06",
  "naturreligion": "d81e78407f85507bcf3fa20ef00a9e21e3c7b5ee",
  "livssyn": "53e2b10b778d4e1d01118bbc4cd166995d546110"
};
  assert.equal(badge.color,'#E7B517');
  assert.equal(manifest.color,badge.color);
  assert.equal(manifest.version,3);
  assert.equal(manifest.assets.length,8);
  assert.deepEqual(new Set(Object.keys(badge.subBadgeImages)),new Set(Object.keys(expected).filter(id=>id!=='religion')));
  for(const [id,sha] of Object.entries(expected)){
    const path=id==='religion' ? badge.image : badge.subBadgeImages[id];
    assert.equal(path,id==='religion'?'bilder/merker/religion.webp':`bilder/merker/religion/familie/${id}.webp`);
    const bytes=readFileSync(resolve(root,path));
    assert.ok(bytes.length>50000,id+' must contain an actual textile patch image');
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    const imageManifest=manifest.assets.find(x=>x.id===id);
    if(id!=='religion')assert.equal(imageManifest?.image,path);
    const input=Buffer.concat([Buffer.from(`blob ${bytes.length}`),Buffer.from([0]),bytes]);
    assert.equal(createHash('sha1').update(input).digest('hex'),sha,id+' differs from approved source image');
  }
});
