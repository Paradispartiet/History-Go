import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
test('Infrastruktur is an unactivated 8/10 candidate with five pinned languages',()=>{
  const by=read('data/badges/by.json');
  const c=read('data/badges/infrastruktur_candidate_v1.json');
  assert.equal(by.sub.length,10);
  assert.equal(Object.keys(by.subBadgeImages).length,7,'seven existing badges must remain active');
  assert.equal(by.subBadgeImages.infrastruktur,undefined);
  assert.equal(c.status,'produced_awaiting_binary_transfer');
  assert.equal(c.quality.registered,false);
  assert.equal(c.quality.visualApproved,false);
  assert.equal(c.sourceImage,'bilder/merker/by/undermerker/infrastruktur-brodert-v1.webp');
  assert.deepEqual(Object.keys(c.variants),['nb','en','es','pt','fr']);
  assert.deepEqual(c.size,[1024,1024]);
  for(const [locale,v] of Object.entries(c.variants)){
    assert.match(v.sha256,/^[0-9a-f]{64}$/);
    assert.ok(v.bytes>0);
    assert.equal(v.path,locale==='nb'?c.sourceImage:'bilder/merker/by/locales/'+locale+'/infrastruktur.webp');
  }
});
