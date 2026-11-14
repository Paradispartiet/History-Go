import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';

const read = p => readFileSync(new URL('../' + p, import.meta.url));
const json = p => JSON.parse(read(p).toString('utf8'));
const badge = json('data/badges/vitenskap.json');
const archive = json('data/badges/vitenskap_v7_archived_candidates_20261113.json');
const historical = json('data/badges/vitenskap_active_typography_audit_20261113.json');
const ids = [
  'teknologi_og_ingeniorfag',
  'data_programvare_og_algoritmer',
  'nettverk_og_digital_infrastruktur'
];
const hex = (alg, contents) => createHash(alg).update(contents).digest('hex');
const gitBlob = b => hex('sha1',
  Buffer.concat([Buffer.from('blob ' + b.length + String.fromCharCode(0)), b]));

test('v7 activation proposal points to the exact three verified WebP Git blobs', () => {
  assert.equal(archive.status,'three_exact_v7_binary_candidate_artworks_archived_not_active');
  assert.equal(archive.visualSignoffRequired,true);
  assert.equal(archive.itemCount,3);
  assert.equal(badge.id,'vitenskap');
  assert.equal(badge.color,'#6A5AE0');
  assert.equal(Object.keys(badge.subBadgeImages).length,16);
  assert.deepEqual(new Set(archive.items.map(x=>x.id)),new Set(ids));
  assert.equal(historical.items.length,16);
  const originals = Object.fromEntries(historical.items.map(x=>[x.id,x.image]));
  const changed = Object.keys(badge.subBadgeImages).filter(id=>badge.subBadgeImages[id]!==originals[id]);
  assert.deepEqual(new Set(changed),new Set(ids));
  for(const item of archive.items){
    const path = 'bilder/merker/vitenskap/brodert/' + item.id + '_v7.webp';
    assert.equal(badge.subBadgeImages[item.id],path);
    const bytes = read(path);
    assert.equal(bytes.length,item.bytes);
    assert.equal(hex('sha256',bytes),item.sha256);
    assert.equal(gitBlob(bytes),item.gitBlobSha);
    assert.deepEqual(bytes,read(item.path),'Active file must be byte-identical to archive');
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.equal(bytes.toString('ascii',12,16),'VP8X');
    assert.equal(bytes.readUIntLE(24,3)+1,1024);
    assert.equal(bytes.readUIntLE(27,3)+1,1024);
    assert.ok((bytes[20] & 16)!==0,'Transparent WEBP alpha channel');
    // Formerly active originals are still present for exact rollback.
    const original = read(originals[item.id]);
    assert.equal(original.toString('ascii',8,12),'WEBP');
    assert.ok(original.length>3000);
  }
  for(const item of historical.items){
    if(ids.includes(item.id))continue;
    assert.equal(badge.subBadgeImages[item.id],item.image,'Unrelated science underbadge changed: '+item.id);
  }
});

test('map remains on science main badge, PlaceCard uses registered subbadge with readable name', () => {
  const map = read('js/map.js').toString('utf8');
  const card = read('js/ui/place-card.js').toString('utf8');
  const css = read('css/placeCard.css').toString('utf8');
  assert.match(map,/badge\.image/);
  assert.match(card,/preferredSubBadgeId/);
  assert.match(card,/placeBadge\?\.subBadgeImages\?\.\[preferredSubBadgeId\]/);
  assert.match(card,/class="pc-person-img pc-badge-round-img"/);
  assert.match(card,/formatSubcategoryLabel\(sub, placeBadge\)/);
  assert.match(css,/#placeCard \.pc-title-row > #pcBadgesIcon > img\.pc-badge-round-img\s*\{[^}]*object-fit:\s*contain/);
  assert.match(css,/@media\s*\(max-width:\s*520px\)/);
});

test('historical review still renders original and proposed new image side by side', () => {
  const html = read('vitenskap-aktive-merker-review.html').toString('utf8');
  assert.ok(html.includes('Historisk kontroll.'));
  assert.ok(html.includes('Arkivert original'));
  assert.ok(html.includes('Registrert nyere merke'));
  assert.ok(html.includes('src="js/auth/require-login.js'));
  for(const px of [38,52,96,160,320])assert.ok(html.includes('value="'+px+'"'));
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script,'Missing review renderer');
  assert.doesNotThrow(()=>new Script(script[1]));
});
