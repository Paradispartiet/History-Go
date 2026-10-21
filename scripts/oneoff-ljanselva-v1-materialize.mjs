#!/usr/bin/env node
// Temporary one-shot materialization for sourced Ljanselva v1. Removed after success.
import fs from "node:fs";
import crypto from "node:crypto";

const placePath="data/places/natur/oslo/places_oslo_natur_hovedsteder/ljanselva.json";
const place=JSON.parse(fs.readFileSync(placePath,"utf8"));
if(place.id!=="ljanselva")throw Error("Unexpected place identity");
const front="bilder/places/ljanselva_front_portrait.webp";
const hero="bilder/places/ljanselva_landscape.webp";
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
for(let p of [front,hero])if(!fs.existsSync(p)||fs.statSync(p).size<18000)throw Error("Missing image: "+p);
const license="https://creativecommons.org/licenses/by-sa/3.0/";
const links=[
 {label:"Ljanselva ved Ljabru – Kjetil Ree (CC BY-SA 3.0)",type:"reference",url:"https://commons.wikimedia.org/wiki/File:Ljanselva_-_2014-04-28_at_19-07-23.jpg",verifiedAt:"2026-10-21"},
 {label:"Ljanselva ved Rustadsaga – Kjetil Ree (CC BY-SA 3.0)",type:"reference",url:"https://commons.wikimedia.org/wiki/File:Ljanselva_-_2014-05-29_at_13-46-29.jpg",verifiedAt:"2026-10-21"}
];
const existing=Array.isArray(place.externalLinks)?place.externalLinks:[];
for(const link of links)if(!existing.some(x=>x.url===link.url))existing.push(link);
place.externalLinks=existing;
place.frontImage=front;
place.frontImageMeta={
 source:"wikimedia_commons",sourcePage:links[0].url,creator:"Kjetil Ree",credit:"Kjetil Ree / Wikimedia Commons",
 license:"CC BY-SA 3.0",licenseUrl:license,capturedAt:"2014-04-28",orientation:"portrait",sourceImageDimensions:[4288,2848],outputDimensions:[600,800],
 transformation:"Center-weighted documentary source crop 3:4; no added content",sourceSha256:sha("/tmp/ljanselva-ljabru.jpg"),outputSha256:sha(front),
 verifiedAt:"2026-10-21",visualReview:"source_file_and_crop_generated_actual_app_review_pending"
};
place.image=hero;
place.imageMeta={
 source:"wikimedia_commons",sourcePage:links[1].url,creator:"Kjetil Ree",credit:"Kjetil Ree / Wikimedia Commons",
 license:"CC BY-SA 3.0",licenseUrl:license,capturedAt:"2014-05-29",orientation:"landscape",sourceImageDimensions:[4288,2848],outputDimensions:[1400,900],
 transformation:"Source-preserving 1400x900 landscape crop; no added content",sourceSha256:sha("/tmp/ljanselva-rustadsaga.jpg"),outputSha256:sha(hero),
 verifiedAt:"2026-10-21",visualReview:"source_file_and_crop_generated_actual_app_review_pending"
};
place.imageComposition={portraitPosition:"50% 50%",heroPosition:"50% 50%",portraitRatio:"3:4"};
fs.writeFileSync(placePath,JSON.stringify(place,null,2)+"\n");
const report={
 schema:"history_go_ljanselva_v1_image_qa",status:"local_webp_generated_browser_acceptance_pending",
 assets:[
 {kind:"frontImage",path:front,sourcePage:links[0].url,author:"Kjetil Ree",license:"CC BY-SA 3.0",dimensions:[600,800],sha256:sha(front),visualAppApproval:false},
 {kind:"image",path:hero,sourcePage:links[1].url,author:"Kjetil Ree",license:"CC BY-SA 3.0",dimensions:[1400,900],sha256:sha(hero),visualAppApproval:false}
 ],
 notes:"Two different local documentary source photographs, explicit credit, two historic river stretches. Browser acceptance remains required before v1 merge."
};
const reportFile="reports/place-production/ljanselva-v1-images-20261021.json";
fs.mkdirSync("reports/place-production",{recursive:true});
fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+"\n");
console.log("Materialized Ljanselva canonical local images with provenance and pending browser QA.");
