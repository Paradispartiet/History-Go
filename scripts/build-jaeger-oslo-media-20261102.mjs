#!/usr/bin/env node
// Documentary location photos, CC BY-SA 3.0 Anne-Sophie Ofrim / Wikimedia Commons.
// Neither photo is presented as the club's interior or Jaeger's own courtyard.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const out="bilder/places/candidates/oslo-v1-20261102";
const canonical="data/places/subkultur/oslo/places_subkultur/jaeger_oslo.json";
const runtimePath="data/runtime/place-open/jaeger_oslo.json";
const commons={
  first:{filename:"Grensen_9_indre_gårdsrom_ID_165744.JPG",page:"https://commons.wikimedia.org/wiki/File:Grensen_9_indre_g%C3%A5rdsrom_ID_165744.JPG"},
  second:{filename:"Grensen_9_indre_gårdsrom2_ID_165744.JPG",page:"https://commons.wikimedia.org/wiki/File:Grensen_9_indre_g%C3%A5rdsrom2_ID_165744.JPG"}
};
const specs=[
  {kind:"hero",source:"first",width:1400,height:900,file:"jaeger_oslo_hero.webp"},
  {kind:"portrait",source:"second",width:900,height:1350,file:"jaeger_oslo_portrait.webp"},
  {kind:"card",source:"first",width:900,height:600,file:"jaeger_oslo_card.webp"}
];
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"hg-jaeger-"));
fs.mkdirSync(out,{recursive:true});
const originals={};
for(const spec of specs){
  const src=commons[spec.source];
  if(!originals[spec.source]){
    const md5=crypto.createHash("md5").update(src.filename).digest("hex");
    const url="https://upload.wikimedia.org/wikipedia/commons/"+md5[0]+"/"+md5.slice(0,2)+"/"+encodeURIComponent(src.filename);
    const downloaded=path.join(scratch,spec.source+".jpg");
    execFileSync("curl",["-fL","--retry","3","--retry-delay","2","--user-agent","HistoryGo/1.0 (CC BY-SA documented historic place imagery)","--output",downloaded,url],{stdio:"inherit",timeout:120000});
    const info=await sharp(downloaded).metadata();
    if(info.format!=="jpeg"||info.width!==3008||info.height!==2000)throw Error("Commons source mismatch "+src.filename+" "+JSON.stringify(info));
    originals[spec.source]=downloaded;
  }
  const target=path.join(out,spec.file);
  await sharp(originals[spec.source]).rotate().resize(spec.width,spec.height,{fit:"cover",position:"centre"}).webp({quality:83,effort:5}).toFile(target);
  const info=await sharp(target).metadata();
  if(info.format!=="webp"||info.width!==spec.width||info.height!==spec.height)throw Error("Bad photo derivative "+spec.file);
  console.log(spec.kind,spec.file,fs.statSync(target).size);
}
if(crypto.createHash("sha256").update(fs.readFileSync(originals.first)).digest("hex")===
   crypto.createHash("sha256").update(fs.readFileSync(originals.second)).digest("hex"))throw Error("Image and frontImage originals must differ");
const place=JSON.parse(fs.readFileSync(canonical,"utf8"));
if(place.id!=="jaeger_oslo"||place.address.number!=="9"||place.category!=="musikk")throw Error("Jaeger place ID/category/address changed");
const meta=(spec)=>({
 source:"wikimedia_commons",sourcePage:commons[spec.source].page,
 creator:"Anne-Sophie Ofrim",credit:"Anne-Sophie Ofrim / Wikimedia Commons",
 license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
 assetType:"documentary_site_courtyard_not_club_interior",verifiedAt:"2026-11-02",
 transformation:"Editorial crop, resampling and WebP conversion of a 2013 photo of Grensen 9 inner courtyard.",
 outputDimensions:spec.width+"x"+spec.height,cropSettings:[0.5,0.5,1],
 ...(spec.kind==="portrait"?{orientation:"portrait"}:{})
});
place.image=out+"/"+specs[0].file;
place.frontImage=out+"/"+specs[1].file;
place.cardImage=out+"/"+specs[2].file;
place.imageCredit="Anne-Sophie Ofrim / Wikimedia Commons";
place.imageLicense="CC BY-SA 3.0";
place.imageSourceUrl=commons.first.page;
place.imageCaption="Indre gårdsrom i Grensen 9, fotografert av Anne-Sophie Ofrim 6. oktober 2013. Foto: Wikimedia Commons / CC BY-SA 3.0, beskåret. Bildet er ikke dokumentasjon av Jaegers klubblokale.";
place.imageComposition="To distinct documentary courtyard originals for PlaceCard hero and frontImage, plus a smaller hero derivative for card.";
place.imageMeta=meta(specs[0]);
place.frontImageMeta=meta(specs[1]);
place.cardImageMeta=meta(specs[2]);
fs.writeFileSync(canonical,JSON.stringify(place,null,2)+"\n");
const runtime=JSON.parse(fs.readFileSync(runtimePath,"utf8"));
runtime.place={...runtime.place,...place,sourceFile:runtime.place.sourceFile};
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==="object"?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
fs.writeFileSync(runtimePath,JSON.stringify(stable(runtime))+"\n");
console.log("Two original photo sources and three local derivatives linked to Jaeger.");
