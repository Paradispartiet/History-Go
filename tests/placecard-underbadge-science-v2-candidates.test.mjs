import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const data = path => JSON.parse(read(path).toString('utf8'));
const manifest = data('data/badges/vitenskap_v2_candidates_20261112.json');
const badge = data('data/badges/vitenskap.json');

test('Five Norwegian v2 images are real, byte-verified, nonactive WebP candidates', () => {
  assert.equal(manifest.items.length, 5);
  assert.equal(manifest.state, 'stored_candidate_not_active');
  assert.equal(Object.keys(badge.subBadgeImages).length, 16);
  for (const art of manifest.items) {
    assert.ok(badge.subBadgeImages[art.id], art.id);
    assert.notEqual(badge.subBadgeImages[art.id], art.path, 'Candidate cannot replace an active badge yet');
    const bytes = read(art.path);
    assert.equal(bytes.length, art.bytes);
    assert.equal(bytes.toString('ascii',0,4), 'RIFF');
    assert.equal(bytes.toString('ascii',8,12), 'WEBP');
    assert.equal(bytes.toString('ascii',12,16), 'VP8X');
    assert.equal(bytes.readUIntLE(24,3)+1, 1024);
    assert.equal(bytes.readUIntLE(27,3)+1, 1024);
    assert.ok((bytes[20] & 16) !== 0, 'WebP image has alpha channel');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), art.sha256);
    assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'), art.gitBlobSha);
  }
});

test('Map retains main badge, PlaceCard prefers place-specific underbadge with fallback', () => {
  const mapCode = read('js/map.js').toString('utf8');
  const placeCardCode = read('js/ui/place-card.js').toString('utf8');
  const badgeCode = read('js/ui/badges.js').toString('utf8');
  assert.match(mapCode, /placeBadgeImages\.set\(id, image\)/);
  assert.match(mapCode, /badge\.image/);
  assert.match(placeCardCode, /preferredSubBadgeId/);
  assert.match(placeCardCode, /placeBadge\?\.subBadgeImages\?\.\[id\]/);
  assert.match(placeCardCode, /HGPlaceBadgeRelevantSubcategories/);
  const context = {window: { BADGES:[badge] },console};
  runInNewContext(badgeCode, context, {filename:'js/ui/badges.js'});
  const place = data('data/places/vitenskap/oslo/places_vitenskap/abelhaugen.json');
  const subs = context.relevantPlaceSubBadgeIds(place, badge);
  assert.ok(subs.includes('matematikk'));
  const card={dataset:{currentPlaceId:place.id}};
  const icon={innerHTML:'', title:'',setAttribute(name,value){this[name]=value;}};
  const panel={innerHTML:''};
  context.document={getElementById(id){return ({placeCard:card,pcBadgesIcon:icon,pcBadgesList:panel})[id]||null;}};
  context.window.HGPlaceOpen={getPlace(){return place;}};
  context.applyPlaceCardBadgeRound(place);
  assert.match(icon.innerHTML, /matematikk\.webp/);
  assert.match(panel.innerHTML, /matematikk\.webp/);
  assert.doesNotMatch(icon.innerHTML, /vitenskap\.webp/);
  const unknown={id:'unmapped-science', category:'vitenskap'};
  card.dataset.currentPlaceId=unknown.id;
  context.window.HGPlaceOpen={getPlace(){return unknown;}};
  context.applyPlaceCardBadgeRound(unknown);
  assert.match(icon.innerHTML, /vitenskap\.webp/);
  assert.doesNotMatch(icon.innerHTML, /matematikk\.webp/);
});
