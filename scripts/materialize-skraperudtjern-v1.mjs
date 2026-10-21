#!/usr/bin/env node
// Reproducible, source-preserving local media for Skraperudtjern History Go v1.
// Downloads are handled in the caller; this script never requests permissions.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const approve=process.argv.includes('--approve');
const root=process.cwd();
const sourceDir=process.env.SK_SOURCE_DIR || '/tmp/skraperudtjern-sources';
const placePath='data/places/natur/oslo/places_oslo_natur_ljanselva_rute/skraperudtjern.json';
const reportPath='reports/place-production/skraperudtjern-v1-images-20261021.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,obj)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n')};
const sha=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const sources=[
 {role:'front',file:'winter-2021.jpg',output:'bilder/places/skraperudtjern_front_portrait.webp',width:600,height:800,
  sourcePage:'https://commons.wikimedia.org/wiki/File:Skraperudtjern_(6._januar_2021).jpg',capturedAt:'2021-01-06',description:'Winter view of the actual lake'},
 {role:'hero',file:'summer-2008.jpg',output:'bilder/places/skraperudtjern_landscape.webp',width:1400,height:900,
  sourcePage:'https://commons.wikimedia.org/wiki/File:Skraperudtjern.jpg',capturedAt:'2008-07-12',description:'Summer view of the actual lake'}
];
const place=read(placePath);
if(place.id!=='skraperudtjern')throw new Error('Wrong canonical place identity');
if(approve){
 for(const field of ['frontImageMeta','imageMeta']){
  if(!place[field]?.outputSha256||!fs.existsSync(field==='frontImageMeta'?sources[0].output:sources[1].output))throw new Error('Cannot approve absent materialized image');
  place[field].visualReview='approved_2026-10-21_actual_390_1440_history_go_browser';
 }
 write(placePath,place);
 console.log('Marked local images approved after actual app browser pass');
 process.exit(0);
}
const report={schema:'history_go_v1_photo_acceptance_v1',placeId:place.id,status:'pending_actual_app_browser_qa',images:[]};
for(const s of sources){
 const src=fs.readFileSync(path.join(sourceDir,s.file));
 const srcMeta=await sharp(src).metadata();
 if(srcMeta.width<1400||srcMeta.height<900)throw new Error('Insufficient source image dimensions '+s.file);
 fs.mkdirSync(path.dirname(s.output),{recursive:true});
 await sharp(src).rotate().resize(s.width,s.height,{fit:'cover',position:sharp.strategy.attention}).webp({quality:86,effort:5}).toFile(s.output);
 const output=fs.readFileSync(s.output);
 const outMeta=await sharp(output).metadata();
 if(outMeta.width!==s.width||outMeta.height!==s.height||outMeta.format!=='webp'||output.length<15000)throw new Error('Invalid output '+s.output);
 const meta={
   source:'wikimedia_commons',sourcePage:s.sourcePage,creator:'Kjetil Ree',
   credit:'Kjetil Ree / Wikimedia Commons',license:'CC BY-SA 3.0',
   licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',capturedAt:s.capturedAt,
   orientation:s.role==='front'?'portrait':'landscape',sourceImageDimensions:[srcMeta.width,srcMeta.height],
   outputDimensions:[outMeta.width,outMeta.height],
   transformation:'Editorial crop from original documentary photograph; no content added; WebP quality 86',
   sourceSha256:sha(src),outputSha256:sha(output),
   verifiedAt:'2026-10-21',visualReview:'pending_actual_390_1440_browser_qa'
 };
 if(s.role==='front'){place.frontImage=s.output;place.frontImageMeta=meta;}
 else {place.image=s.output;place.imageMeta=meta;}
 report.images.push({role:s.role,path:s.output,...meta,bytes:output.length});
}
const winterUrl=sources[0].sourcePage;
if(!place.externalLinks.some(x=>x.url===winterUrl)){
 place.externalLinks.push({label:'Vinterfoto Skraperudtjern – Kjetil Ree, CC BY-SA 3.0',url:winterUrl,type:'reference',verifiedAt:'2026-10-21'});
}
write(placePath,place);
write(reportPath,report);
console.log('Local CC BY-SA 3.0 documentary photos prepared:',report.images.map(x=>x.path).join(', '));
