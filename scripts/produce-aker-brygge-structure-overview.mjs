#!/usr/bin/env node
/**
 * Preserve a CC BY-SA 4.0 street-view photograph of the historic Bryggegata
 * hall environment as an UNPUBLISHED, provenance-verified overview candidate.
 * Never assign this shared view to an individual hall or change PlaceCard.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const sourceUrl="https://upload.wikimedia.org/wikipedia/commons/b/b6/Bryggegata%2C_Oslo_%282022%29_%283%29.jpg";
const sourcePage="https://commons.wikimedia.org/wiki/File:Bryggegata,_Oslo_(2022)_(3).jpg";
const sourceSha1="eb45a0f9ea81d218715a56eddb300d132e4accf7";
const originalPath="bilder/kort/structures/source/aker_brygge/verkstedhallene_bryggegata_2022_original.jpg";
const candidatePath="bilder/kort/structures/candidates/aker_brygge/verkstedhallene_bryggegata_oversikt_2022.webp";
const reportPath="reports/place-production/aker-brygge-verkstedhallene-licensed-overview-2026-11-19.json";
const sha=(b,algorithm="sha256")=>crypto.createHash(algorithm).update(b).digest("hex");
const assert=(condition,message)=>{if(!condition)throw Error(message);};
assert(process.argv.includes("--write"),"Explicit --write is required");
const canonical=JSON.parse(await fs.readFile("reports/place-production/aker-brygge-structures-source-audit-2026-11-19.json","utf8"));
assert(canonical.placeId==="aker_brygge"&&canonical.publishable===false,"Structure hold contract changed");
assert(canonical.identityCrosswalk?.confirmedSeparatePairs?.some(pair=>pair.includes("aker_brygge_verkstedhallen")&&pair.includes("aker_brygge_maskinhallen")),"Hall distinction is not verified");
const res=await fetch(sourceUrl,{signal:AbortSignal.timeout(45000),headers:{"User-Agent":"HistoryGo-StructureImageAudit/1.0 (https://github.com/Paradispartiet/History-Go)","Accept":"image/jpeg"}});
assert(res.ok,"Wikimedia source HTTP "+res.status);
assert(new URL(res.url).hostname==="upload.wikimedia.org","Unexpected redirect target");
const bytes=Buffer.from(await res.arrayBuffer());
assert(bytes.length>500000&&bytes.length<10000000,"Unexpected image size");
assert(sha(bytes,"sha1")===sourceSha1,"Original Commons SHA-1 mismatch: do not publish changed image");
const inputMeta=await sharp(bytes).metadata();
assert(inputMeta.format==="jpeg"&&inputMeta.width===3767&&inputMeta.height===2825,"Source dimensions/format changed");
const candidate=await sharp(bytes,{limitInputPixels:32000000})
 .rotate()
 .resize(1200,900,{fit:"contain",background:"#edece8",kernel:"lanczos3"})
 .flatten({background:"#edece8"})
 .webp({quality:93,effort:6}).toBuffer();
const outputMeta=await sharp(candidate).metadata();
assert(outputMeta.format==="webp"&&outputMeta.width===1200&&outputMeta.height===900,"Candidate wrong format/size");
await fs.mkdir(path.dirname(originalPath),{recursive:true});
await fs.mkdir(path.dirname(candidatePath),{recursive:true});
await fs.mkdir(path.dirname(reportPath),{recursive:true});
await fs.writeFile(originalPath,bytes);
await fs.writeFile(candidatePath,candidate);
const report={
 schema:"history_go_aker_brygge_licensed_structure_overview_candidate_v1",
 placeId:"aker_brygge",
 subjectId:"aker_brygge_verkstedhallene_shared_environment",
 subjectName:"Verkstedhallene – historisk teglfasade ved Bryggegata",
 accurateScope:"shared_hall_environment_only",
 prohibitedIndividualAssignments:["aker_brygge_verkstedhallen","aker_brygge_maskinhallen","aker_brygge_dieselmotorverksted"],
 attribution:"Ssu / Wikimedia Commons",
 author:"Ssu",
 captureDate:"2022-06-14",
 sourcePage,sourceAsset:sourceUrl,
 sourceType:"authentic_documentary_photograph",
 license:"CC BY-SA 4.0",
 licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
 rightsBasis:"Openly licensed Wikimedia Commons own-work photograph; adapted WebP must carry attribution, license and modification notice",
 originalPath,originalSha1:sourceSha1,originalSha256:sha(bytes),sourceDimensions:[inputMeta.width,inputMeta.height],sourceBytes:bytes.length,
 candidatePath,candidateSha256:sha(candidate),candidateDimensions:[outputMeta.width,outputMeta.height],candidateBytes:candidate.length,
 transformation:"JPEG to WebP resampling, full frame preserved without hard crop or zoom; subtle 4:3 matte if needed",
 usageContext:"editorial_research_candidate",
 reviewStatus:"SOURCE_LICENSE_HASH_VERIFIED_FACADE_IDENTITY_REVIEW_PENDING",
 visualReview:false,
 individualBuildingIdentified:false,
 editorialApproval:false,
 publishable:false,
 placecardStructuresEnabled:false,
 vFerdig:false,
 notes:["Photo clearly depicts the old brick hall environment along Bryggegata, not enough evidence to label it as either individual hall.","No existing PlaceCard or canonical structure data are modified."]
};
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+"\n");
console.log("Source and candidate archived as hold:",report.subjectName,report.originalSha256,report.candidateSha256);
