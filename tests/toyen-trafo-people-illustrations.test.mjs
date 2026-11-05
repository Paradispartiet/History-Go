import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import test from 'node:test';
import sharp from 'sharp';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const report=read('reports/place-production/toyen-trafo-people-illustrations-20261105.json');
const runtime=read('data/runtime/place-open/toyen_trafo.json');
test('Tøyen trafo People: original illustrations and honest image metadata',async()=>{
  assert.equal(report.media.length,2);
  for(const img of report.media){
    const p=runtime.people.find(x=>x.id===img.id);
    assert.ok(p, img.id);
    assert.equal(p.image,img.image);
    assert.equal(p.cardImage,img.image);
    assert.equal(p.imageStatus,'original_ai_illustration_published');
    assert.equal(p.imageMeta.imageKind,'ai_generated_illustration');
    assert.equal(p.imageMeta.nonDocumentary,true);
    assert.equal(p.imageMeta.facialLikenessVerified,false);
    assert.equal(p.imageMeta.visibleLabel,'AI-ILLUSTRASJON');
    const svg=fs.readFileSync(img.source,'utf8');
    assert.ok(svg.includes('AI-ILLUSTRASJON'));
    assert.ok(!svg.includes('<image'));
    const bytes=fs.readFileSync(img.image);
    const meta=await sharp(bytes).metadata();
    assert.equal(meta.format,'webp');
    assert.equal(meta.width,1024);
    assert.equal(meta.height,1536);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),img.sha256);
    assert.equal(bytes.length,img.bytes);
  }
  assert.equal(runtime.brands.length,2);
  assert.equal(runtime.lesespor.length,4);
  assert.equal(runtime.stories.length,1);
});
