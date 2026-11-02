#!/usr/bin/env node
// One-time, source-verifiable Revolver photo derivation. CC BY-SA 4.0, Ssu / Wikimedia Commons.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const out = "bilder/places/candidates/oslo-v1-20261102";
const canonical = "data/places/subkultur/oslo/places_subkultur/revolver_oslo.json";
const runtime = "data/runtime/place-open/revolver_oslo.json";
const files = [
  { name:"hero", jpg:"Revolver_bar%2C_M%C3%B8llergata_32%2C_Oslo.jpg", shaDir:"3/33",
    sourcePage:"https://commons.wikimedia.org/wiki/File:Revolver_bar,_M%C3%B8llergata_32,_Oslo.jpg", width:1400,height:900,orientation:"landscape",
    output:"revolver_oslo_hero.webp", date:"2024-01-10" },
  { name:"portrait", jpg:"Revolver_Bar_%28ELO-bygget%29%2C_M%C3%B8llergata_32%2C_Oslo.jpg", shaDir:"8/8d",
    sourcePage:"https://commons.wikimedia.org/wiki/File:Revolver_Bar_(ELO-bygget),_M%C3%B8llergata_32,_Oslo.jpg", width:900,height:1350,orientation:"portrait",
    output:"revolver_oslo_portrait.webp", date:"2020-01-15" },
  { name:"card", jpg:"Revolver_bar%2C_M%C3%B8llergata_32%2C_Oslo.jpg", shaDir:"3/33",
    sourcePage:"https://commons.wikimedia.org/wiki/File:Revolver_bar,_M%C3%B8llergata_32,_Oslo.jpg", width:900,height:600,orientation:"landscape",
    output:"revolver_oslo_card.webp", date:"2024-01-10" }
];
fs.mkdirSync(out,{recursive:true});
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"hg-revolver-"));
const originals=new Map();
for(const file of files){
  let source=originals.get(file.jpg);
  if(!source){
    source=path.join(scratch,file.name+".jpg");
    const url="https://upload.wikimedia.org/wikipedia/commons/"+file.shaDir+"/"+file.jpg;
    execFileSync("curl",["-fL","--retry","3","--retry-delay","3","--user-agent","HistoryGo/1.0 (source-attributed Wikimedia editorial derivative)","--output",source,url],{stdio:"inherit",timeout:90000});
    const meta=await sharp(source).metadata();
    if(meta.format!=="jpeg"||meta.width<2500||meta.height<1700) throw Error("Unexpected source image "+JSON.stringify(meta));
    originals.set(file.jpg,source);
  }
  await sharp(source).rotate().resize(file.width,file.height,{fit:"cover",position:"centre"}).webp({quality:83,effort:5}).toFile(path.join(out,file.output));
  const check=await sharp(path.join(out,file.output)).metadata();
  if(check.width!==file.width||check.height!==file.height||check.format!=="webp") throw Error("Invalid output "+file.output);
  console.log(file.name, file.output, file.width+"x"+file.height, fs.statSync(path.join(out,file.output)).size);
}
const record=JSON.parse(fs.readFileSync(canonical,"utf8"));
if(record.id!=="revolver_oslo"||record.address.number!=="32B")throw Error("Revolver identity changed");
const hero=files[0],portrait=files[1],card=files[2];
function meta(x,kind){return {
  source:"wikimedia_commons",sourcePage:x.sourcePage,creator:"Ssu",
  credit:"Ssu / Wikimedia Commons",license:"CC BY-SA 4.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
  assetType:kind,verifiedAt:"2026-11-02",
  transformation:"Separate editorial crop, resampling and WebP encoding from Ssu's original documentary photo.",
  outputDimensions:x.width+"x"+x.height,cropSettings:[0.5,0.5,1],
  ...(x.orientation==="portrait"?{orientation:"portrait"}:{})
};}
record.image=out+"/"+hero.output;
record.frontImage=out+"/"+portrait.output;
record.cardImage=out+"/"+card.output;
record.imageCredit="Ssu / Wikimedia Commons";
record.imageLicense="CC BY-SA 4.0";
record.imageSourceUrl=hero.sourcePage;
record.imageCaption="Revolvers røde bygning i Møllergata, fotografert i januar 2024. Foto: Ssu / Wikimedia Commons, CC BY-SA 4.0. Bildet er beskåret.";
record.imageComposition="Eget horisontalt toppbilde, stående QuizCard-bilde og lite kortbilde fra to dokumentarfotografier.";
record.imageMeta=meta(hero,"documentary_place_photo");
record.frontImageMeta=meta(portrait,"documentary_place_portrait");
record.cardImageMeta=meta(card,"documentary_place_photo");
fs.writeFileSync(canonical,JSON.stringify(record,null,2)+"\n");
const runtimeData=JSON.parse(fs.readFileSync(runtime,"utf8"));
runtimeData.place={...runtimeData.place,...record,sourceFile:runtimeData.place.sourceFile};
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==="object"?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
fs.writeFileSync(runtime,JSON.stringify(stable(runtimeData))+"\n");
console.log("Updated canonical place with three licensed photographic WebP files and synced Place-open");
