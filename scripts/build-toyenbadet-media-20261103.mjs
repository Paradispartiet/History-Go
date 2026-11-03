#!/usr/bin/env node
// Tøyenbadet: two different Commons photographs, both of the demolished pre-2020 building.
// The 2013 exterior and 1980 interior must NEVER be presented as photos of the new 2025 bath.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const repoRoot=process.cwd();
const out="bilder/places/candidates/oslo-vferdig-20261103";
const placePath="data/places/sport/europa/norway/oslo_sport/toyenbadet.json";
const runtimePath="data/runtime/place-open/toyenbadet.json";
const workcardPath="reports/place-production/toyenbadet-workcard-current.json";
const sources={
  exterior:{
    url:"https://upload.wikimedia.org/wikipedia/commons/c/c3/2013-05_T%C3%B8yenbadet.jpg",
    page:"https://commons.wikimedia.org/wiki/File:2013-05_T%C3%B8yenbadet.jpg",
    creator:"Chell Hill",credit:"Chell Hill / Wikimedia Commons",
    license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
    width:5041,height:2535,sha1:"52ad35c531bf34f1048d376388c3a1e438b0a547"
  },
  interior:{
    url:"https://upload.wikimedia.org/wikipedia/commons/7/71/T%C3%B8yenbadet_OB.R15617d.jpg",
    page:"https://commons.wikimedia.org/wiki/File:T%C3%B8yenbadet_OB.R15617d.jpg",
    creator:"Atelier Rude",credit:"Atelier Rude / Oslo Museum / Wikimedia Commons",
    license:"CC BY 4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0/",
    width:4000,height:2704,sha1:"ff3786131e2068df103a8edb9e6be112f07d2e1d"
  }
};
const specs=[
  {kind:"hero",source:"exterior",name:"toyenbadet_historic_2013_hero.webp",width:1400,height:900,position:"centre"},
  {kind:"portrait",source:"interior",name:"toyenbadet_historic_1980_portrait.webp",width:900,height:1350,position:"right"}
];
const hash=(b,algo="sha256")=>crypto.createHash(algo).update(b).digest("hex");
const place=JSON.parse(fs.readFileSync(placePath,"utf8"));
if(place.id!=="toyenbadet"||place.category!=="sport"||place.address.number!=="90")throw Error("Tøyenbadet identity mismatch");
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"hg-toyenbadet-"));
fs.mkdirSync(out,{recursive:true});
const originals={};
for(const spec of specs){
  const src=sources[spec.source];
  if(!originals[spec.source]){
    const temp=path.join(scratch,spec.source+".jpg");
    execFileSync("curl",["-fLSs","--retry","3","--retry-delay","2","--max-time","95","--user-agent","HistoryGo/1.0 (CC attribution audit; contact repository owner)","--output",temp,src.url],{stdio:"inherit",timeout:125000});
    const buf=fs.readFileSync(temp);
    const meta=await sharp(buf).metadata();
    if(meta.format!=="jpeg"||meta.width!==src.width||meta.height!==src.height)throw Error("Unexpected source dimensions: "+spec.source+" "+JSON.stringify(meta));
    if(hash(buf,"sha1")!==src.sha1)throw Error("Commons SHA-1 mismatch for "+spec.source);
    originals[spec.source]={buf,sourceSha256:hash(buf)};
  }
  const srcData=originals[spec.source];
  const file=path.join(out,spec.name);
  const content=await sharp(srcData.buf).rotate().resize(spec.width,spec.height,{fit:"cover",position:spec.position}).webp({quality:83,effort:5}).toBuffer();
  fs.writeFileSync(file,content);
  const result=await sharp(file).metadata();
  if(result.format!=="webp"||result.width!==spec.width||result.height!==spec.height||content.length<15000)throw Error("Bad generated image "+file);
  spec.sourceSha256=srcData.sourceSha256;
  spec.outputSha256=hash(content);
  console.log(spec.kind+" "+file+" "+result.width+"x"+result.height+" bytes="+content.length+" sha256="+spec.outputSha256);
}
const metadata=(spec,assetKind)=>{
  const s=sources[spec.source];
  return {
    source:"wikimedia_commons",sourcePage:s.page,creator:s.creator,credit:s.credit,
    license:s.license,licenseUrl:s.licenseUrl,assetKind,
    verifiedAt:"2026-11-03",
    transformation:"Documentary crop of the demolished historic Tøyenbadet, "+(spec.source==="exterior"?"photographed in 2013.":"photographed in 1980.")+" Resampled and encoded as WebP. Not the 2025 bath.",
    outputDimensions:spec.width+"x"+spec.height,
    cropSettings:[spec.position==="right"?1:0.5,0.5,1],
    sourceSha256:spec.sourceSha256,outputSha256:spec.outputSha256,
    ...(spec.kind==="portrait"?{orientation:"portrait"}:{})
  };
};
place.image=out+"/"+specs[0].name;
place.frontImage=out+"/"+specs[1].name;
delete place.cardImage;delete place.cardImageMeta;
place.imageCredit=sources.exterior.credit;
place.imageLicense=sources.exterior.license;
place.imageLicenseUrl=sources.exterior.licenseUrl;
place.imageSourceUrl=sources.exterior.page;
place.imageCaption="Tøyenbadet i 2013, fotografert av Chell Hill. Viser bygningen som ble revet i 2020, ikke det nye badet.";
place.imageMeta=metadata(specs[0],"historical_documentary_exterior");
place.frontImageMeta=metadata(specs[1],"historical_documentary_interieur");
fs.writeFileSync(placePath,JSON.stringify(place,null,2)+"\n");
const runtime=JSON.parse(fs.readFileSync(runtimePath,"utf8"));
if(runtime.place?.id!=="toyenbadet")throw Error("runtime identity mismatch");
runtime.place={...runtime.place,...place,sourceFile:runtime.place.sourceFile};
delete runtime.place.cardImage;delete runtime.place.cardImageMeta;
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
fs.writeFileSync(runtimePath,JSON.stringify(stable(runtime))+"\n");
const work=JSON.parse(fs.readFileSync(workcardPath,"utf8"));
if(work.place_id!=="toyenbadet")throw Error("workcard identity mismatch");
work.media_gate={
 status:"PASS_IMAGES_PENDING_BROWSER",
 hero:{path:place.image,sourcePage:sources.exterior.page,license:sources.exterior.license,size:"1400x900",sha256:specs[0].outputSha256},
 portrait:{path:place.frontImage,sourcePage:sources.interior.page,license:sources.interior.license,size:"900x1350",sha256:specs[1].outputSha256},
 caveat:"Both depict the original Tøyenbadet demolished in 2020. No image of new 2025 building is licensed in this package. Final actual app/mobile validation not yet done."
};
work.universal_core.photos="PASS_CANONICAL_ASSETS: separate license-tracked historic hero and true 900x1350 portrait; visual browser QA remains blocked.";
work.active_file_scope=[...new Set([...(work.active_file_scope||[]),place.image,place.frontImage])];
fs.writeFileSync(workcardPath,JSON.stringify(work,null,2)+"\n");
