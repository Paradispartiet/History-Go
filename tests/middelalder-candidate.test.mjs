import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const read=(path)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));

test('Middelalder: Forhistorie and Historie main badge remain unchanged',()=>{
  const cat=read('data/badges/historie.json');
  const candidate=read('data/badges/historie_middelalder_candidate_v1.json');
  assert.equal(cat.image,'bilder/merker/historie.PNG');
  assert.equal(cat.subBadgeImages?.forhistorie,'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp');
  assert.equal(cat.sub.length,14);
  assert.equal(cat.color,'#603E1E');
  assert.equal(candidate.parentBadgeReference.preserveExactOriginal,true);
  assert.equal(candidate.siblingReference.preserveExactOriginal,true);
  assert.deepEqual(Object.keys(candidate.variants),['nb','en','es','pt','fr']);
  if(candidate.quality.integrated){
    assert.equal(candidate.quality.binaryVerified,true);
    assert.equal(candidate.quality.visualApproved,true);
    assert.equal(cat.subBadgeImages?.middelalder,candidate.sourceImage);
    assert.equal(candidate.localesActive,false);
  }else{
    assert.equal(cat.subBadgeImages?.middelalder,undefined);
  }
});

test('Middelalder: all five original WebPs must exist and exactly match manifest before activation',()=>{
  const candidate=read('data/badges/historie_middelalder_candidate_v1.json');
  const files=Object.entries(candidate.variants).map(([lang,v])=>({lang,v,url:new URL(v.path,root)}));
  const present=files.filter(({url})=>existsSync(url));
  assert.ok(present.length===0 || present.length===5,'No partial Middelalder binary uploads');
  if(present.length===0){
    assert.equal(candidate.quality.binaryVerified,false);
    assert.equal(candidate.quality.integrated,false);
    return;
  }
  for(const {lang,v,url} of files){
    const b=readFileSync(url);
    assert.equal(b.length,v.bytes,lang+' length');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' SHA-256');
    const blobHash=createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
    assert.equal(blobHash,v.gitBlobSha,lang+' Git blob SHA');
    assert.equal(b.toString('ascii',0,4),'RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.equal(b.toString('ascii',12,16),'VP8X');
    assert.equal(b.readUIntLE(24,3)+1,1024);
    assert.equal(b.readUIntLE(27,3)+1,1024);
    assert.ok(b[20]&0x10,lang+' alpha channel required');
  }
  assert.equal(candidate.quality.binaryVerified,true,'Uploaded binaries must be marked verified');
});
