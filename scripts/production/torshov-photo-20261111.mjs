#!/usr/bin/env node
// Historical Torshov place: one independently sourced original for each photo surface.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const placePath='data/places/by/oslo/places/torshov.json';
const output='bilder/places/by/torshov_front_portrait.webp';
const heroSource='https://commons.wikimedia.org/wiki/File:Torshov_Aerial_2018_(185922)_(cropped).jpg';
const frontSource='https://commons.wikimedia.org/wiki/File:Torshov_arial.jpg';
const frontFilename='Torshov arial.jpg';
const heroSourceSha256='39fe81477fa5f4ec633a2745b4931269d05f71cd203576e71ede036a5cd0a539';
const sum=bytes=>createHash('sha256').update(bytes).digest('hex');
const hash=createHash('md5').update(frontFilename.replaceAll(' ','_')).digest('hex');
const candidates=[
 `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.slice(0,2)}/${encodeURIComponent(frontFilename.replaceAll(' ','_'))}`,
 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Torshov%20arial.jpg'
];
let original;
let fetchedFrom='';
for(const url of candidates){
 try{
  const res=await fetch(url,{headers:{'User-Agent':'HistoryGoPlaceProduction/1.0 (https://github.com/Paradispartiet/History-Go)','Accept':'image/jpeg,image/*'},signal:AbortSignal.timeout(40000),redirect:'follow'});
  if(!res.ok){console.error('Source HTTP',res.status,url);continue;}
  const bytes=Buffer.from(await res.arrayBuffer());
  const info=await sharp(bytes).metadata();
  if(info.width<2500||info.height<1800||info.format!=='jpeg')throw Error('Unexpected 2010 photo source format or dimensions');
  original=bytes;fetchedFrom=url;break;
 }catch(err){console.error('Photo source failed:',String(err?.message||err));}
}
if(!original)throw Error('Distinct and licensed 2010 Torshov source photo unavailable; abort without substituting.');
const meta=await sharp(original).metadata();
fs.mkdirSync(path.dirname(output),{recursive:true});
await sharp(original).rotate().resize({width:900,height:1200,fit:'cover',position:sharp.gravity.centre}).webp({quality:86,effort:6}).toFile(output);
const outmeta=await sharp(output).metadata();
if(outmeta.format!=='webp'||outmeta.width!==900||outmeta.height!==1200)throw Error('Invalid standing WebP output');
const place=JSON.parse(fs.readFileSync(placePath,'utf8'));
const normalizeUrl=u=>decodeURIComponent(u||'').replaceAll('_',' ').replaceAll('%20',' ');
if(place.id!=='torshov'||normalizeUrl(place.imageSourceUrl)!==normalizeUrl(heroSource))throw Error('Original Torshov hero source changed; stop to review.');
if(frontSource===heroSource||sum(original)===heroSourceSha256)throw Error('Original photos must be distinct');
place.imageMeta={
 source:'existing_documentary_place_photo',
 sourcePage:heroSource,
 originalUrl:heroSource,
 creator:'Tore Sætre',
 credit:'Tore Sætre / Wikimedia Commons',
 originalDate:'2018-08-26',
 license:'CC BY-SA 4.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
 sourceSha256:heroSourceSha256,
 assetType:'documentary_area_photo',
 attributionScope:'unchanged preexisting area hero image; no additional cropping or bytes changed',
 verifiedAt:'2026-11-11'
};
place.frontImage=output;
place.frontImageMeta={
 source:'Wikimedia Commons, independent original photo',
 sourcePage:frontSource,
 originalUrl:frontSource,
 sourceAsset:fetchedFrom,
 creator:'Wilhelm Joys Andersen',
 credit:'Wilhelm Joys Andersen / Wikimedia Commons',
 originalDate:'2010-06-22',
 license:'CC BY-SA 2.0',
 licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/',
 sourceDimensions:`${meta.width}x${meta.height}`,
 outputDimensions:'900x1200',
 sourceSha256:sum(original),
 outputSha256:sum(fs.readFileSync(output)),
 orientation:'portrait',
 aspectRatio:'3:4',
 assetType:'documentary_area_photo',
 transformation:'Stående 3:4-sentrert utsnitt av et selvstendig foto tatt i 2010. Ikke samme fotografi som hovedbildet fra 2018, og ikke en generert scene.',
 reviewStatus:'pending_editorial_crop_review',
 verifiedAt:'2026-11-11'
};
place.imageComposition={...(place.imageComposition||{}),portraitPosition:'50% 50%'};
fs.writeFileSync(placePath,JSON.stringify(place,null,2)+'\n');
console.log(JSON.stringify({output,source:frontSource,heroSource,dimensions:place.frontImageMeta.outputDimensions,sourceSha256:place.frontImageMeta.sourceSha256,outputSha256:place.frontImageMeta.outputSha256,bytes:fs.statSync(output).size},null,2));
