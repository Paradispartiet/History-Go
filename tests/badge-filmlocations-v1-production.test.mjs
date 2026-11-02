import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read = p => JSON.parse(readFileSync(new URL('../'+p, import.meta.url),'utf8'));
const img = 'bilder/merker/film_tv/undermerker/filmlocations-brodert-v3.webp';
const sha = 'e2c44ebb35f46fef275daa17145a76806b651f6fa4a29784fc88e55d2c6fdb19';
test('Filminnspillingssteder has the active authentic WebP and approved production record',()=>{
 const f=read('data/badges/film_tv.json');
 const m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(x=>x.id==='filmlocations');
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(f.subBadgeImages.filmlocations,img);
 assert.equal(a.status,'integrated');
 assert.equal(a.selectedImage,img);
 assert.deepEqual(a.quality,{visualApproved:true,technicalApproved:true});
 assert.equal(a.productionBrief.topLabel,'FILMINNSPILLINGSSTEDER');
 assert.equal(a.productionBrief.bottomLabel,'FILM & TV');
 assert.equal(a.sha256,sha);
 const b=readFileSync(new URL('../'+img,import.meta.url));
 assert.equal(b.length,420684);
 assert.equal(b.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(b.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(b.subarray(12,16).toString('ascii'),'VP8X');
 assert.ok((b[20]&0x10)!==0);
 assert.equal(b.readUIntLE(24,3)+1,1024);
 assert.equal(b.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(b).digest('hex'),sha);
});
test('eight previous Film & TV subbadges and the seven Scenekunst subbadges are unchanged',()=>{
 const f=read('data/badges/film_tv.json'),s=read('data/badges/scenekunst.json');
 const prior={
 spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
 kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
 dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
 tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
 nyheter_og_reportasje:'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp',
 klassikere:'bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp',
 norsk_film_og_tv:'bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp',
 filmfestivaler:'bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v3.webp'
 };
 const {filmlocations,...other}=f.subBadgeImages;
 assert.deepEqual(other,prior);
 assert.equal(filmlocations,img);
 assert.equal(Object.keys(s.subBadgeImages).length,7);
 for(const id of s.sub) assert.ok(s.subBadgeImages[id]);
});
