import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=(path)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const blobHash=(b)=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');

test('Tidlig moderne tid retains the original History badge and two approved predecessors',()=>{
 const category=read('data/badges/historie.json');
 const candidate=read('data/badges/historie_tidlig_modernetid_candidate_v1.json');
 assert.equal(category.image,'bilder/merker/historie.PNG');
 assert.equal(category.color,'#603E1E');
 assert.equal(category.secondaryColor,'#D6A127');
 assert.equal(category.sub.length,14);
 assert.equal(category.subBadgeImages?.forhistorie,'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp');
 assert.equal(category.subBadgeImages?.middelalder,'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp');
 assert.equal(category.subBadgeImages?.tidlig_modernetid,candidate.sourceImage);
 assert.equal(candidate.parentBadgeReference.preserveExactOriginal,true);
 assert.ok(candidate.siblingReferences.every(x=>x.preserveExactOriginal));
 assert.equal(candidate.quality.visualApproved,true);
 assert.equal(candidate.localesActive,false);
 assert.deepEqual(Object.keys(candidate.variants),['nb','en','es','pt','fr']);
});

test('Tidlig moderne tid five WebP originals match exact bytes, SHA-256 and Git blobs',()=>{
 const candidate=read('data/badges/historie_tidlig_modernetid_candidate_v1.json');
 const files=Object.entries(candidate.variants);
 assert.equal(files.length,5);
 for(const [lang,v] of files){
   const path=new URL(v.path,root);
   assert.equal(existsSync(path),true,lang+' exists');
   const b=readFileSync(path);
   assert.equal(b.length,v.bytes,lang+' length');
   assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' sha256');
   assert.equal(blobHash(b),v.gitBlobSha,lang+' git hash');
   assert.equal(b.toString('ascii',0,4),'RIFF');
   assert.equal(b.toString('ascii',8,12),'WEBP');
   assert.equal(b.toString('ascii',12,16),'VP8X');
   assert.equal(b.readUIntLE(24,3)+1,1024);
   assert.equal(b.readUIntLE(27,3)+1,1024);
   assert.ok((b[20]&0x10)!==0,lang+' alpha');
 }
 assert.equal(candidate.quality.binaryVerified,true);
 assert.equal(candidate.quality.integrated,true);
});
