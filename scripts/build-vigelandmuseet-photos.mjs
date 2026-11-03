#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
const base="bilder/places/oslo-aav-20261027",photo=path.join(base,"vigelandmuseet-original.tmp.jpg");
const source="https://upload.wikimedia.org/wikipedia/commons/c/c6/Vigelandsmuseet.JPG";
const placePath="data/places/kunst/oslo/places_kunst/vigelandmuseet.json";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
fs.mkdirSync(base,{recursive:true});
const response=await fetch(source,{headers:{"User-Agent":"HistoryGo/1.0 (CC/PD photography attribution audit)"},signal:AbortSignal.timeout(90000)});
if(!response.ok)throw Error("Failed to retrieve verified public-domain photo: HTTP "+response.status);
const data=Buffer.from(await response.arrayBuffer());
const original=await sharp(data).metadata();
if(original.width<1400||original.height<1350)throw Error("Public domain source resolution insufficient");
const variants=[
 ["vigelandmuseet_hero.webp",1400,900,"centre"],
 ["vigelandmuseet_portrait.webp",900,1350,"left"]
];
const p=JSON.parse(fs.readFileSync(placePath,"utf8"));
for(const [name,width,height,position] of variants){
 const out=await sharp(data).rotate().resize(width,height,{fit:"cover",position}).webp({quality:84}).toBuffer();
 const file=path.join(base,name);fs.writeFileSync(file,out);
 const m=name.includes("portrait")?p.frontImageMeta:p.imageMeta;
 m.sourceSha256=sha(data);m.outputSha256=sha(out);m.outputDimensions=width+"x"+height;
 m.cropSettings=[position==="left"?0.25:0.5,0.5,1];
}
fs.writeFileSync(placePath,JSON.stringify(p,null,2)+"\n");
console.log("Vigelandmuseet PD photo generated: hero and portrait; source bytes "+data.length);
