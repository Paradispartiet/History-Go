import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const read=(path)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));

test('Forhistorie preserves the approved parent Historie badge and remains inactive until verified',()=>{
  const category=read('data/badges/historie.json');
  const candidate=read('data/badges/historie_forhistorie_candidate_v1.json');
  assert.equal(category.image,'bilder/merker/historie.PNG');
  assert.equal(category.color,'#603E1E');
  assert.equal(category.secondaryColor,'#D6A127');
  assert.equal(category.sub.length,14);
  assert.equal(candidate.id,'forhistorie');
  assert.equal(candidate.parentBadgeReference.path,category.image);
  assert.equal(candidate.parentBadgeReference.preserveExactOriginal,true);
  assert.deepEqual(Object.keys(candidate.variants),['nb','en','es','pt','fr']);
  assert.equal(candidate.size[0],1024);
  assert.equal(candidate.size[1],1024);
  if(candidate.quality.integrated){
    assert.equal(candidate.quality.visualApproved,true);
    assert.equal(candidate.quality.binaryVerified,true);
    assert.equal(category.subBadgeImages?.forhistorie,candidate.sourceImage);
  }else{
    assert.equal(category.subBadgeImages?.forhistorie,undefined);
  }
});

test('Forhistorie five original WebPs are all present and match manifest, or candidate stays inactive',()=>{
  const candidate=read('data/badges/historie_forhistorie_candidate_v1.json');
  const files=Object.entries(candidate.variants).map(([lang,v])=>({lang,v,url:new URL(v.path,root)}));
  const present=files.filter(({url})=>existsSync(url));
  assert.ok(present.length===0 || present.length===5,'Never merge partial Forhistorie uploads');
  if(present.length===0){
    assert.equal(candidate.quality.binaryVerified,false);
    assert.equal(candidate.quality.integrated,false);
    return;
  }
  for(const {lang,v,url} of files){
    const b=readFileSync(url);
    assert.equal(b.length,v.bytes,lang+' bytes');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' SHA-256');
    assert.equal(b.toString('ascii',0,4),'RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.equal(b.toString('ascii',12,16),'VP8X');
    assert.equal(b.readUIntLE(24,3)+1,1024);
    assert.equal(b.readUIntLE(27,3)+1,1024);
    assert.ok(b[20]&0x10,lang+' must have alpha');
  }
});
