import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const stage=read('data/people/staging/toyenbadet_people_20261103.json');
const manifest=read('data/people/manifest.json');
const provenance=read('data/people/media/toyenbadet_ai_illustrated_people_assets.json');
const runtime=read('data/runtime/place-open/toyenbadet.json');
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');

test('Five real People biographies, four painted AI illustrations, zero fabricated photographs',()=>{
  assert.equal(stage.profiles.length,4);
  const expected=new Set(['anne_lindboe', ...stage.profiles.map(x=>x.id)]);
  assert.deepEqual(new Set(runtime.people.map(x=>x.id)),expected);
  assert.equal(runtime.people.length,5);
  const accepted=read('data/people/politikk/oslo/toyenbadet/anne_lindboe.json')[0];
  assert.equal(accepted.imageMeta.imageKind,'photo');
  for(const person of stage.profiles){
    const file=`data/people/${person.category}/oslo/toyenbadet/${person.id}.json`;
    assert.ok(manifest.files.includes(file.slice('data/'.length)),file);
    assert.ok(manifest.priorityFilesByPlace.toyenbadet.includes(file.slice('data/'.length)));
    const profile=read(file)[0];
    assert.equal(profile.id,person.id);
    assert.equal(profile.placeId,'toyenbadet');
    assert.equal(profile.image,person.image);
    assert.equal(profile.cardImage,person.image);
    assert.equal(profile.imageMeta.imageKind,'ai_generated_illustration');
    assert.equal(profile.imageMeta.nonDocumentary,true);
    assert.equal(profile.imageMeta.facialLikenessVerified,false);
    assert.equal(profile.imageMeta.noSourcePhotographClaim,true);
    assert.equal(profile.imageMeta.visibleLabel,'AI-ILLUSTRASJON');
    const buf=fs.readFileSync(profile.image);
    assert.equal(buf.toString('ascii',0,4),'RIFF');
    assert.equal(buf.toString('ascii',8,12),'WEBP');
    assert.ok(buf.length>7000);
    assert.equal(sha256(buf),profile.imageMeta.assetSha256);
    assert.equal(provenance.assets.find(x=>x.person_id===person.id)?.sha256,sha256(buf));
    const claimFile=read(profile.claimsFile);
    assert.equal(claimFile.person_id,person.id);
    assert.equal(claimFile.image_provenance.isPhotographicEvidence,false);
    assert.ok(claimFile.claims.length>=4);
    assert.ok(claimFile.claims.every(x=>x.status==='verified'));
  }
});
