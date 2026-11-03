#!/usr/bin/env node
// Preserve the original historic photo within a portrait/card canvas.
// Background is only a blurred, darkened enlargement of the same documented
// source; never generate fictional architecture or counterfeit archival detail.
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import assert from 'node:assert/strict';

const provenancePath='reports/place-production/oslo-sentrum-next-six-media-provenance-20261027.json';
const manifest=JSON.parse(fs.readFileSync(provenancePath,'utf8'));
const targetIds=['palehaven_paleet','mustadgarden_kongens_gate_3'];
const dims={
 hero:{width:1400,height:900},
 front:{width:800,height:1050},
 card:{width:700,height:980}
};
const hash=buf=>crypto.createHash('sha256').update(buf).digest('hex');
for(const id of targetIds){
 const rec=manifest.items.find(x=>x.placeId===id);
 assert.ok(rec && rec.assets.length===3,id+' provenance missing');
 const place=JSON.parse(fs.readFileSync(rec.placeFile,'utf8'));
 assert.equal(place.id,id);
 const image=rec.assets.find(x=>x.target===place.image);
 assert.ok(image,'Image source path missing '+id);
 const original=fs.readFileSync(image.target);
 assert.equal(hash(original),image.sha256,id+' source asset unexpectedly changed');
 for(const [kind,target,metaName] of [
  ['hero',place.image,'imageMeta'],
  ['front',place.frontImage,'frontImageMeta'],
  ['card',place.cardImage,'cardImageMeta']
 ]){
  const asset=rec.assets.find(x=>x.target===target);
  assert.ok(asset,id+' missing '+kind);
  const before=fs.readFileSync(target);
  assert.equal(hash(before),asset.sha256,id+' asset mismatch before recomposition '+kind);
  const size=dims[kind];
  const background=await sharp(original).resize(size.width,size.height,{fit:'cover'}).blur(28).modulate({brightness:0.47}).png().toBuffer();
  const foreground=await sharp(original).resize(size.width,size.height,{fit:'inside',withoutEnlargement:true}).png().toBuffer();
  const result=await sharp(background).composite([{input:foreground,gravity:'center'}]).webp({quality:85,effort:5}).toBuffer();
  const info=await sharp(result).metadata();
  assert.equal(info.width,size.width);
  assert.equal(info.height,size.height);
  fs.writeFileSync(target,result);
  asset.sha256=hash(result);
  asset.dimensions=info.width+'x'+info.height;
  asset.size=result.length;
  place[metaName].outputSha256=asset.sha256;
  place[metaName].outputDimensions=asset.dimensions;
  place[metaName].transformation='Original documentary photo centered without enlargement; extended canvas uses blurred and darkened pixels from the same photograph, not a reconstruction.';
  console.log('HISTORIC_PHOTO_ASPECT_PASS',id,kind,asset.dimensions);
 }
 fs.writeFileSync(rec.placeFile,JSON.stringify(place,null,2)+'\n');
}
manifest.qualityNote='Aspect-correct hero, portrait and QuizCard frames for small historical photographs; blurred padding made only from the licensed documentary photo.';
fs.writeFileSync(provenancePath,JSON.stringify(manifest,null,2)+'\n');
