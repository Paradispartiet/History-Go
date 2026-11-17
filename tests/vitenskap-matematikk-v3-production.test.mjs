import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const raw = path => readFileSync(new URL('../'+path, import.meta.url));
const json = path => JSON.parse(raw(path).toString('utf8'));
const badge = json('data/badges/vitenskap.json');
const art = json('data/badges/vitenskap_underbadge_artwork.json');
const archive = json('data/badges/vitenskap_active_typography_audit_20261113.json');
const newPath = 'bilder/merker/vitenskap/brodert/matematikk_v3.webp';
const v2Path = 'bilder/merker/vitenskap/brodert/matematikk_v2.webp';
const oldPath = 'bilder/merker/vitenskap/brodert/matematikk.webp';
const sha256 = x => createHash('sha256').update(x).digest('hex');
const gitSha = x => createHash('sha1').update(Buffer.from('blob '+x.length+'\0')).update(x).digest('hex');

test('Matematikk v3 original is the exact reviewed, uncompressed-equivalent WebP blob', () => {
  const b = raw(newPath);
  assert.equal(b.length, 583444);
  assert.equal(sha256(b),'d7bbe97a799e3834a37b20e52dc0bd5b587021cf00f738908cc5b6dba5054492');
  assert.equal(gitSha(b),'b3469d216b4117f6316c4914c5fcb61a6db1c2e1');
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  assert.equal(b.toString('ascii',12,16),'VP8X');
  assert.equal(b.readUIntLE(24,3)+1,1024);
  assert.equal(b.readUIntLE(27,3)+1,1024);
  assert.notEqual(b[20]&16,0,'alpha channel must be present');
  assert.ok(raw(v2Path).length>100000,'retained v2 for rollback');
  assert.ok(raw(oldPath).length>100000,'retained original for rollback');
});

test('only Mathematics advances to v3; 15 other science underbadges and parent remain intact', () => {
  assert.equal(badge.id,'vitenskap');
  assert.equal(badge.image,'bilder/merker/vitenskap/brodert/vitenskap.webp');
  assert.equal(badge.color,'#6A5AE0');
  assert.equal(badge.sub.length,16);
  assert.equal(Object.keys(badge.subBadgeImages).length,16);
  assert.deepEqual(new Set(badge.sub),new Set(Object.keys(badge.subBadgeImages)));
  assert.equal(badge.subBadgeImages.matematikk,newPath);
  const v2 = new Set(['informasjonsteknologi','forskning_og_metode',
    'astronomi_og_fysikk','kjemi_og_materialvitenskap']);
  const v7 = new Set(['teknologi_og_ingeniorfag','data_programvare_og_algoritmer',
    'nettverk_og_digital_infrastruktur']);
  for(const i of archive.items) {
    const expected = i.id === 'matematikk' ? newPath :
      v2.has(i.id) ? 'bilder/merker/vitenskap/brodert/'+i.id+'_v2.webp' :
      v7.has(i.id) ? 'bilder/merker/vitenskap/brodert/'+i.id+'_v7.webp' :
      i.image;
    assert.equal(badge.subBadgeImages[i.id],expected,i.id+' unexpectedly changed');
  }
  const item=art.assets.find(x=>x.id==='matematikk');
  assert.equal(item.image,newPath);
  assert.equal(item.previousV2Image,v2Path);
  assert.equal(item.previousOriginalImage,oldPath);
});

test('map parent badge and PlaceCard underbadge selection remain in place', () => {
  const map=raw('js/map.js').toString('utf8');
  const card=raw('js/ui/place-card.js').toString('utf8');
  const css=raw('css/placeCard.css').toString('utf8');
  assert.match(map,/badge\.image/);
  assert.match(card,/placeBadge\?\.subBadgeImages\?\.\[preferredSubBadgeId\]/);
  assert.match(card,/formatSubcategoryLabel\(sub, placeBadge\)/);
  assert.match(css,/#placeCard \.pc-title-row > #pcBadgesIcon > img\.pc-badge-round-img\s*\{[^}]*object-fit:\s*contain/);
});
