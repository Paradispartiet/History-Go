#!/usr/bin/env node
// Two documented photographs of Møllergata 23, taken 2022-03-23 by Jan-Tore Egge.
// CC BY-SA 4.0, Wikimedia Commons. Building photos are NOT interior club photos.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const out="bilder/places/candidates/oslo-v1-20261102";
const canonical="data/places/subkultur/oslo/places_subkultur/the_villa.json";
const runtimePath="data/runtime/place-open/the_villa.json";
const sourceFiles={
  i:{url:"https://upload.wikimedia.org/wikipedia/commons/9/91/M%C3%B8llergata_23_I.jpg",page:"https://commons.wikimedia.org/wiki/File:M%C3%B8llergata_23_I.jpg",minWidth:2653,minHeight:2904},
  ii:{url:"https://upload.wikimedia.org/wikipedia/commons/a/ae/M%C3%B8llergata_23_II.jpg",page:"https://commons.wikimedia.org/wiki/File:M%C3%B8llergata_23_II.jpg",minWidth:2846,minHeight:2603}
};
const specs=[
 {kind:"hero",source:"ii",width:1400,height:900,file:"the_villa_hero.webp"},
 {kind:"portrait",source:"i",width:900,height:1350,file:"the_villa_portrait.webp"},
 {kind:"card",source:"ii",width:900,height:600,file:"the_villa_card.webp"}
];
fs.mkdirSync(out,{recursive:true});
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),"hg-the-villa-"));
const originals={};
for(const spec of specs){
  const source=sourceFiles[spec.source];
  if(!originals[spec.source]){
    const file=path.join(scratch,spec.source+".jpg");
    execFileSync("curl",["-fL","--retry","3","--retry-delay","3","--user-agent","HistoryGo/1.0 (source-attributed Wikimedia editorial derivative)","--output",file,source.url],{stdio:"inherit",timeout:90000});
    const meta=await sharp(file).metadata();
    if(meta.format!=="jpeg"||meta.width!==source.minWidth||meta.height!==source.minHeight)throw Error("Incorrect Commons source "+JSON.stringify(meta));
    originals[spec.source]=file;
  }
  const target=path.join(out,spec.file);
  await sharp(originals[spec.source]).rotate().resize(spec.width,spec.height,{fit:"cover",position:"centre"}).webp({quality:83,effort:5}).toFile(target);
  const checked=await sharp(target).metadata();
  if(checked.format!=="webp"||checked.width!==spec.width||checked.height!==spec.height)throw Error("Bad derivative "+spec.file);
  console.log(spec.kind,spec.file,fs.statSync(target).size);
}
const place=JSON.parse(fs.readFileSync(canonical,"utf8"));
if(place.id!=="the_villa"||place.address.number!=="23"||place.category!=="musikk")throw Error("Place identity mismatch");
const meta=(spec,type)=>({
  source:"wikimedia_commons",sourcePage:sourceFiles[spec.source].page,
  creator:"Jan-Tore Egge",credit:"Jan-Tore Egge / Wikimedia Commons",license:"CC BY-SA 4.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
  assetType:type,verifiedAt:"2026-11-02",
  transformation:"Editorial crop, resampling and WebP conversion from the photographed 2022 Møllergata 23 exterior.",
  outputDimensions:spec.width+"x"+spec.height,cropSettings:[0.5,0.5,1],
  ...(spec.kind==="portrait"?{orientation:"portrait"}:{})
});
place.image=out+"/"+specs[0].file;
place.frontImage=out+"/"+specs[1].file;
place.cardImage=out+"/"+specs[2].file;
place.imageCredit="Jan-Tore Egge / Wikimedia Commons";
place.imageLicense="CC BY-SA 4.0";
place.imageSourceUrl=sourceFiles.ii.page;
place.imageCaption="Bygningen i Møllergata 23, fotografert 23. mars 2022. Foto: Jan-Tore Egge / Wikimedia Commons, CC BY-SA 4.0. Bildet er beskåret. Klubbens kjellerinteriør er ikke avbildet.";
place.imageComposition="Separate landscape facade, portrait facade and compact facade crops from two licensed documentary photographs.";
place.imageMeta=meta(specs[0],"documentary_building_exterior");
place.frontImageMeta=meta(specs[1],"documentary_building_portrait");
place.cardImageMeta=meta(specs[2],"documentary_building_exterior");
fs.writeFileSync(canonical,JSON.stringify(place,null,2)+"\n");
const runtime=JSON.parse(fs.readFileSync(runtimePath,"utf8"));
runtime.place={...runtime.place,...place,sourceFile:runtime.place.sourceFile};
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==="object"?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
fs.writeFileSync(runtimePath,JSON.stringify(stable(runtime))+"\n");
