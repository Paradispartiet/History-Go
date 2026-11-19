#!/usr/bin/env node
/**
 * Source-verified historical photograph candidate for Akers Mek. drydock.
 * Store an unaltered licensed original + full-frame WebP. No runtime changes.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
const sourcePage="https://commons.wikimedia.org/wiki/File:Frontenac_(OB.Y3285).jpg";
const sourceUrl="https://upload.wikimedia.org/wikipedia/commons/6/62/Frontenac_%28OB.Y3285%29.jpg";
const sha1="dfeb9349c60e718014e12c564702fcf306a1ec84";
const originalPath="bilder/kort/structures/source/aker_brygge/torrdokken_frontenac_wilse_1929_original.jpg";
const candidatePath="bilder/kort/structures/candidates/aker_brygge/torrdokken_frontenac_wilse_1929.webp";
const reportPath="reports/place-production/aker-brygge-torrdokken-wilse-1929-image-candidate.json";
const sha=(b,alg="sha256")=>crypto.createHash(alg).update(b).digest("hex");
const assert=(ok,message)=>{if(!ok)throw Error(message)};
assert(process.argv.includes("--write"),"Explicit --write required");
const audit=JSON.parse(await fs.readFile("reports/place-production/aker-brygge-structures-source-audit-2026-11-19.json","utf8"));
assert(audit.placeId==="aker_brygge"&&audit.publishable===false,"Unexpected Structures audit status");
assert(audit.candidates.some(x=>x.id==="aker_brygge_torrdokken"),"Missing canonical drydock candidate");
const r=await fetch(sourceUrl,{signal:AbortSignal.timeout(45000),
 headers:{"User-Agent":"HistoryGo-StructureAudit/1.0 (https://github.com/Paradispartiet/History-Go)","Accept":"image/jpeg"}});
assert(r.ok,"Wikimedia source error "+r.status);
assert(new URL(r.url).hostname==="upload.wikimedia.org","Unexpected source redirect");
const original=Buffer.from(await r.arrayBuffer());
assert(original.length>300000 && original.length<2500000,"Unexpected original byte count");
assert(sha(original,"sha1")===sha1,"Commons SHA-1 mismatch; do not reuse or guess source");
const im=await sharp(original).metadata();
assert(im.format==="jpeg"&&im.width===1200&&im.height===883,"Unexpected original format/dimensions");
const output=await sharp(original,{limitInputPixels:30000000})
 .rotate().resize(1200,900,{fit:"contain",background:"#f2f0ed",kernel:"lanczos3"})
 .flatten({background:"#f2f0ed"}).webp({quality:94,effort:6}).toBuffer();
const om=await sharp(output).metadata();
assert(om.format==="webp"&&om.width===1200&&om.height===900,"WebP dimensions mismatch");
for(const f of [originalPath,candidatePath,reportPath])await fs.mkdir(path.dirname(f),{recursive:true});
await fs.writeFile(originalPath,original);
await fs.writeFile(candidatePath,output);
const report={
 schema:"history_go_aker_brygge_historic_drydock_image_candidate_v1",
 placeId:"aker_brygge",subjectId:"aker_brygge_torrdokken",
 name:"Tørrdokken ved Akers mekaniske verksted (historisk foto, 1929)",
 caption:"Akers mekaniske verksted, tørrdokk med skipet Frontenac, 1929.",
 subjectValidity:"Source description specifically identifies Akers mekaniske verksteds tørrdokk; historic 1929 dock scene, NOT a modern photo or independently verified current dock walls",
 photographDate:"1929",photographer:"Anders Beer Wilse (1865–1949)",
 institution:"Oslo Museum",accession:"OB.Y3285",
 sourcePage,sourceAsset:sourceUrl,
 rightsSource:"Wikimedia Commons file review; originally Oslo Museum accession OB.Y3285, license reviewed 2016-12-03",
 license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
 credit:"Anders Beer Wilse / Oslo Museum (OB.Y3285), Wikimedia Commons. Bearbeidet til WebP med uforandret motiv.",
 originalPath,sourceSha1:sha1,sourceSha256:sha(original),sourceDimensions:[im.width,im.height],sourceBytes:original.length,
 candidatePath,candidateSha256:sha(output),candidateDimensions:[om.width,om.height],candidateBytes:output.length,
 transformation:"JPEG converted to 1200x900 WebP; full composition preserved with neutral matte, no crop and no extra zoom",
 contentUse:"historical_photo_only",
 copyrightApproval:"LICENSE_VERIFIED",subjectIdentityApproval:"HISTORICAL_DRYDOCK_SOURCE_MATCH",
 currentStructureGeometryVerified:false,
 editorialReview:"PENDING_PLACE_CARD_REVIEW",publishable:false,visualReview:false,
 placecardStructuresEnabled:false,vFerdig:false,
 notes:[
  "The photograph is documentary evidence for historical drydock operations, not evidence of today's exact remaining drydock footprint.",
  "Keep modern structure identity and other hall aliases separate; no fake photo assignment or inferred architecture.",
  "Preserve historic caption, photographer and CC BY-SA 4.0 adaptation notice wherever this image is used."
 ]
};
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+"\n");
console.log("Original and candidate captured:",JSON.stringify({sourceSha256:report.sourceSha256,webpSha256:report.candidateSha256,outputDimensions:report.candidateDimensions,bytes:report.candidateBytes}));
