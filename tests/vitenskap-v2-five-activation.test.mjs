import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const json = path => JSON.parse(read(path).toString('utf8'));
const registry = json('data/badges/vitenskap.json');
const artwork = json('data/badges/vitenskap_underbadge_artwork.json');
const archive = json('data/badges/vitenskap_v2_candidates_20261112.json');
const historical = json('data/badges/vitenskap_active_typography_audit_20261113.json');
const v7 = json('data/badges/vitenskap_v7_archived_candidates_20261113.json');
const sha = (alg, b) => createHash(alg).update(b).digest('hex');
const gitBlob = b => sha('sha1', Buffer.concat([Buffer.from('blob '+b.length+'\0'), b]));
const ids = [
  'informasjonsteknologi', 'matematikk', 'forskning_og_metode',
  'astronomi_og_fysikk', 'kjemi_og_materialvitenskap'
];
const root = 'bilder/merker/vitenskap/brodert/';

test('exact five v2 originals activated with original Git blobs and no recompression', () => {
  assert.equal(registry.id, 'vitenskap');
  assert.equal(registry.image, 'bilder/merker/vitenskap/brodert/vitenskap.webp');
  assert.equal(registry.color, '#6A5AE0');
  assert.equal(registry.sub.length, 16);
  assert.equal(Object.keys(registry.subBadgeImages).length, 16);
  assert.deepEqual(new Set(archive.items.map(x => x.id)), new Set(ids));
  for(const entry of archive.items) {
    const activePath = root+entry.id+'_v2.webp';
    const oldPath = root+entry.id+'.webp';
    assert.equal(registry.subBadgeImages[entry.id], activePath);
    const bytes = read(activePath);
    assert.deepEqual(bytes,read(entry.path),'v2 must match archived candidate bytes');
    assert.equal(bytes.length,entry.bytes);
    assert.equal(sha('sha256',bytes),entry.sha256);
    assert.equal(gitBlob(bytes),entry.gitBlobSha);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.equal(bytes.toString('ascii',12,16),'VP8X');
    assert.equal(bytes.readUIntLE(24,3)+1,1024);
    assert.equal(bytes.readUIntLE(27,3)+1,1024);
    assert.ok((bytes[20]&16)!==0);
    const old = read(oldPath);
    assert.equal(old.toString('ascii',8,12),'WEBP','old asset must survive rollback');
    const manifest = artwork.assets.find(x=>x.id===entry.id);
    assert.equal(manifest.image,activePath);
    assert.equal(manifest.previousOriginalImage,oldPath);
    assert.equal(manifest.archivedV2Source,entry.path);
  }
});

test('other 11 active underbadges and all historical originals remain unchanged', () => {
  assert.deepEqual(new Set(registry.sub),new Set(historical.items.map(x=>x.id)));
  assert.equal(v7.items.length,3);
  const special = new Set(ids);
  const v7ids = new Set(v7.items.map(x=>x.id));
  for(const item of historical.items) {
    const active = registry.subBadgeImages[item.id];
    assert.ok(active);
    if(special.has(item.id)) assert.equal(active,root+item.id+'_v2.webp');
    else if(v7ids.has(item.id)) assert.equal(active,root+item.id+'_v7.webp');
    else assert.equal(active,item.image,'unrelated badge path changed');
    assert.ok(read(item.image).length>3000,'historical original must survive');
  }
});

test('PlaceCard selects underbadge while map keeps science main badge', () => {
  const map=read('js/map.js').toString('utf8');
  const placecard=read('js/ui/place-card.js').toString('utf8');
  const css=read('css/placeCard.css').toString('utf8');
  assert.match(map,/badge\.image/);
  assert.match(placecard,/placeBadge\?\.subBadgeImages\?\.\[preferredSubBadgeId\]/);
  assert.match(placecard,/formatSubcategoryLabel\(sub, placeBadge\)/);
  assert.match(placecard,/class="pc-person-img pc-badge-round-img"/);
  assert.match(css,/#placeCard \.pc-title-row > #pcBadgesIcon > img\.pc-badge-round-img\s*\{[^}]*object-fit:\s*contain/);
});
