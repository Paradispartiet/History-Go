#!/usr/bin/env node
// Scoped, reproducible original-photograph derivative. No invented imagery.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const placePath='data/places/by/oslo/places/torshov.json';
const output='bilder/places/by/torshov_front_portrait.webp';
const sourcePage='https://commons.wikimedia.org/wiki/File:Torshov_Aerial_2018_(185922)_(cropped).jpg';
const filename='Torshov_Aerial_2018_(185922)_(cropped).jpg';
const hash=createHash('md5').update(filename).digest('hex');
const urlCandidates=[
  `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0,2)}/${encodeURIComponent(filename)}`,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Torshov%20Aerial%202018%20%28185922%29%20%28cropped%29.jpg'
];
let original;
let fetchedFrom='';
for(const url of urlCandidates){
 try{
  const res=await fetch(url,{headers:{'User-Agent':'HistoryGoPlaceProduction/1.0 (https://github.com/Paradispartiet/History-Go)','Accept':'image/jpeg,image/*'},signal:AbortSignal.timeout(30000),redirect:'follow'});
  if(!res.ok){console.error('Source HTTP',res.status,url);continue;}
  const bytes=Buffer.from(await res.arrayBuffer());
  const meta=await sharp(bytes).metadata();
  if(meta.width<1200||meta.height<800||meta.format!=='jpeg')throw Error('Unexpected source image format/dimensions');
  original=bytes;fetchedFrom=url;break;
 }catch(err){console.error('Source variant failed:',String(err?.message||err));}
}
if(!original)throw Error('No source photograph could be fetched; refuse to invent or copy an alternate Torshov photo.');
const meta=await sharp(original).metadata();
fs.mkdirSync(path.dirname(output),{recursive:true});
await sharp(original).rotate().resize({width:900,height:1200,fit:'cover',position:sharp.gravity.centre})
 .webp({quality:86,effort:6}).toFile(output);
const outmeta=await sharp(output).metadata();
if(outmeta.format!=='webp'||outmeta.width!==900||outmeta.height!==1200)throw Error('Invalid standing portrait output');
const sum=(buf)=>createHash('sha256').update(buf).digest('hex');
const place=JSON.parse(fs.readFileSync(placePath,'utf8'));
if(place.id!=='torshov'||place.imageSourceUrl!==sourcePage)throw Error('Canonical photo metadata changed: manual source review required');
place.frontImage=output;
place.frontImageMeta={
  source:'Wikimedia Commons, original documentary photograph',
  sourcePage,
  sourceAsset:fetchedFrom,
  creator:'Tore Sætre',
  credit:'Tore Sætre / Wikimedia Commons',
  originalDate:'2018-08-26',
  license:'CC BY-SA 4.0',
  licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  sourceDimensions:`${meta.width}x${meta.height}`,
  outputDimensions:'900x1200',
  sourceSha256:sum(original),
  outputSha256:sum(fs.readFileSync(output)),
  orientation:'portrait',
  aspectRatio:'3:4',
  assetType:'documentary_area_photo',
  transformation:'Stående sentrert utsnitt fra dokumentarfoto av Torshov og Sandaker i 2018; verken generert scene eller nøyaktig avgrensning av Torshovbyen.',
  reviewStatus:'pending_editorial_crop_review',
  verifiedAt:'2026-11-11'
};
place.imageComposition={...(place.imageComposition||{}),portraitPosition:'50% 50%'};
fs.writeFileSync(placePath,JSON.stringify(place,null,2)+'\n');
console.log(JSON.stringify({output,dimensions:place.frontImageMeta.outputDimensions,sha256:place.frontImageMeta.outputSha256,bytes:fs.statSync(output).size,sourceSource:sourcePage},null,2));
