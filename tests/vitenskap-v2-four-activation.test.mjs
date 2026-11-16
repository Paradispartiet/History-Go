import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const raw = path => readFileSync(new URL('../'+path,import.meta.url));
const json = path => JSON.parse(raw(path).toString('utf8'));
const active = json('data/badges/vitenskap.json');
const src = json('data/badges/vitenskap_v2_candidates_20261112.json');
const review = json('reports/badges/vitenskap_v2_four_activation_review_20261116.json');
const old = json('data/badges/vitenskap_active_typography_audit_20261113.json');
const revised = Object.keys(review.proposedVersions);
const gitBlob = b => createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');

test('exactly four archived v2 Norwegian originals proposed with byte-perfect copies', () => {
 assert.equal(active.id,'vitenskap');
 assert.equal(active.image,'bilder/merker/vitenskap/brodert/vitenskap.webp');
 assert.equal(Object.keys(active.subBadgeImages).length,16);
 assert.equal(new Set(active.sub).size,16);
 for(const id of revised) {
   const item=src.items.find(x=>x.id===id);
   assert.ok(item,id+' missing source');
   const path='bilder/merker/vitenskap/brodert/'+id+'_v2.webp';
   assert.equal(active.subBadgeImages[id],path);
   const now=raw(path);
   const prev=raw('bilder/merker/vitenskap/brodert/'+id+'.webp');
   assert.ok(prev.length>3000);
   assert.deepEqual(now,raw(item.path),id+' must be exact archived original');
   assert.equal(now.length,item.bytes);
   assert.equal(createHash('sha256').update(now).digest('hex'),item.sha256);
   assert.equal(gitBlob(now),item.gitBlobSha);
   assert.equal(now.toString('ascii',0,4),'RIFF');
   assert.equal(now.toString('ascii',8,12),'WEBP');
   assert.equal(now.toString('ascii',12,16),'VP8X');
   assert.equal(now.readUIntLE(24,3)+1,1024);
   assert.equal(now.readUIntLE(27,3)+1,1024);
   assert.ok((now[20]&16)!==0,id+' needs alpha');
 }
 const oldById=Object.fromEntries(old.items.map(x=>[x.id,x.image]));
 for(const id of active.sub) {
   if(revised.includes(id)) continue;
   const expected = review.previouslyActivatedV7.includes(id)
     ? 'bilder/merker/vitenskap/brodert/'+id+'_v7.webp'
     : oldById[id];
   assert.equal(active.subBadgeImages[id],expected,id+' changed without review');
 }
 assert.equal(active.subBadgeImages.matematikk,
   'bilder/merker/vitenskap/brodert/matematikk.webp');
});

test('map main badge and readable PlaceCard subbadge are retained',()=>{
 const map=raw('js/map.js').toString('utf8');
 const card=raw('js/ui/place-card.js').toString('utf8');
 const css=raw('css/placeCard.css').toString('utf8');
 assert.match(map,/badge\.image/);
 assert.match(card,/preferredSubBadgeId/);
 assert.match(card,/placeBadge\?\.subBadgeImages\?\.\[preferredSubBadgeId\]/);
 assert.match(card,/formatSubcategoryLabel\(sub, placeBadge\)/);
 assert.match(card,/pc-person-img pc-badge-round-img/);
 assert.match(css,/pc-badge-round-img\s*\{[^}]*object-fit:\s*contain/);
});
