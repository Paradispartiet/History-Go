import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
test('Infrastruktur is an unactivated 8/10 candidate preserving all seven existing By badges',()=>{
  const by=read('data/badges/by.json');
  const c=read('data/badges/infrastruktur_candidate_v1.json');
  assert.equal(by.sub.length,10);
  assert.equal(Object.keys(by.subBadgeImages).length,7);
  assert.equal(by.subBadgeImages.infrastruktur,undefined);
  assert.equal(c.status,'produced_awaiting_binary_transfer');
  assert.equal(c.quality.registered,false);
  assert.equal(c.quality.visualApproved,false);
  assert.equal(c.sourceImage,'bilder/merker/by/undermerker/infrastruktur-brodert-v1.webp');
  assert.deepEqual(Object.keys(c.variants),['nb','en','es','pt','fr']);
  assert.deepEqual(c.size,[1024,1024]);
});
test('All five Infrastruktur WebPs are absent or all have exact SHA-256, size, alpha and dimensions',()=>{
  const c=read('data/badges/infrastruktur_candidate_v1.json');
  const files=Object.entries(c.variants).map(([locale,v])=>({locale,v,url:new URL(v.path,root)}));
  for(const {locale,v} of files){
    assert.match(v.sha256,/^[0-9a-f]{64}$/);
    assert.ok(v.bytes>0);
    assert.equal(v.path,locale==='nb'?c.sourceImage:'bilder/merker/by/locales/'+locale+'/infrastruktur.webp');
  }
  const found=files.filter(f=>existsSync(f.url));
  assert.ok(found.length===0 || found.length===5,'Partial upload of Infrastruktur WebPs must fail CI');
  if(found.length===0){
    assert.equal(c.quality.repositoryBinaryVerified,false);
    return;
  }
  for(const {locale,v,url} of files){
    const b=readFileSync(url);
    assert.equal(b.length,v.bytes,locale+' file size mismatch');
    assert.equal(b.toString('ascii',0,4),'RIFF',locale+' RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP',locale+' WEBP');
    const chunk=b.toString('ascii',12,16);
    let width,height,alpha;
    if(chunk==='VP8X'){
      width=b.readUIntLE(24,3)+1;
      height=b.readUIntLE(27,3)+1;
      alpha=Boolean(b[20]&0x10);
    } else if(chunk==='VP8L'){
      assert.equal(b[20],0x2f,locale+' lossless signature');
      const bits=b.readUInt32LE(21);
      width=(bits&0x3fff)+1;
      height=((bits>>>14)&0x3fff)+1;
      alpha=Boolean((bits>>>28)&1);
    } else {
      assert.fail(locale+' unsupported WebP chunk '+chunk);
    }
    assert.equal(width,1024,locale+' width');
    assert.equal(height,1024,locale+' height');
    assert.ok(alpha,locale+' missing alpha');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,locale+' checksum mismatch');
  }
});
