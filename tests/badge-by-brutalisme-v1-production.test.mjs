import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
test('Brutalisme 4/10 exact original and EN ES PT FR variants are registered without altering earlier art',()=>{
  const rec=read('data/badges/brutalisme_candidate_v1.json');
  const by=read('data/badges/by.json');
  const prod=read('data/badges/underbadge_batch01_production.json');
  const locales=read('data/badges/badge_locale_images_candidates.json');
  const scene=read('data/badges/scenekunst.json');
  const film=read('data/badges/film_tv.json');
  const expected={
    nb:'19ba27d9c3a0c49488899fa7cef6cbb56a8a8b4a9ec82401f9797a1753c4d427',
    en:'362cf3365be5fae912c9dc9e79a0a1bd3d427a36369fc2621270972e72a22368',
    es:'ba18e9d4fc61b53238cecccd8d7a8cdcb460168740b9662bfa6b45210fb7fdcc',
    pt:'8d26929994717958349e30c29e31dad52f88682bb5f4bd90a90d1340e6b4cf7d',
    fr:'5e36b3d2ba45c31ec1d51add62acf2b8a23e548f582c0c11bce77c6109256396'
  };
  assert.equal(rec.status,'integrated_v1_active');
  assert.deepEqual(rec.quality,{visualApproved:true,technicalApproved:true,registered:true});
  assert.equal(by.color,'#808080');assert.equal(by.secondaryColor,'#404040');
  assert.equal(by.sub.length,10);
  const infrastructureActive=read('data/badges/infrastruktur_candidate_v1.json').status==='integrated';
  const activeCount=Object.keys(by.subBadgeImages).length;
  assert.ok(activeCount>= (infrastructureActive?8:7));
  assert.deepEqual(Object.keys(by.subBadgeImages),by.sub.slice(0,activeCount));
  assert.equal(by.subBadgeImages.brutalisme,rec.sourceImage);
  assert.equal(by.subBadgeImages.klassisk_arkitektur,'bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v2.webp');
  assert.equal(by.subBadgeImages.modernisme,'bilder/merker/by/undermerker/modernisme-brodert-v1.webp');
  assert.equal(by.subBadgeImages.funksjonalisme,'bilder/merker/by/undermerker/funksjonalisme-brodert-v1.webp');
  for(const id of by.sub.slice(activeCount)) assert.equal(by.subBadgeImages[id],undefined);
  assert.equal(Object.keys(scene.subBadgeImages).length,7);
  assert.equal(Object.keys(film.subBadgeImages).length,12);
  const production=prod.families.by.assets.find(a=>a.id==='brutalisme');
  assert.equal(production.status,'integrated');
  assert.deepEqual(production.quality,{visualApproved:true,technicalApproved:true});
  assert.equal(production.selectedImage,rec.sourceImage);
  assert.equal(production.sha256,expected.nb);
  assert.equal(locales.status,'review_required_not_active');
  assert.equal(locales.entries.length,4*(activeCount+Object.keys(scene.subBadgeImages).length));
  assert.equal(locales.skipped.some(x=>x.category==='by'&&x.id==='brutalisme'),false);
  for(const [locale,digest] of Object.entries(expected)){
    const v=rec.variants[locale];
    assert.ok(v,'missing variant '+locale);
    assert.equal(v.sha256,digest);
    const image=readFileSync(new URL(v.path,root));
    assert.equal(image.length,v.bytes);
    assert.equal(image.toString('ascii',0,4),'RIFF');
    assert.equal(image.toString('ascii',8,12),'WEBP');
    assert.equal(image.toString('ascii',12,16),'VP8X');
    assert.ok(image[20]&0x10,'alpha present');
    assert.equal(image.readUIntLE(24,3)+1,1024);
    assert.equal(image.readUIntLE(27,3)+1,1024);
    assert.equal(sha(image),digest);
    if(locale==='nb') continue;
    const e=locales.entries.find(x=>x.category==='by'&&x.id==='brutalisme'&&x.locale===locale);
    assert.ok(e,'locale entry '+locale);
    assert.equal(e.path,v.path);
    assert.equal(e.sha256,digest);
    assert.equal(e.originalSha256,expected.nb);
    assert.equal(e.bytes,image.length);
  }
});
