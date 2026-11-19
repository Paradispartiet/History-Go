#!/usr/bin/env node
/* Produce ONLY a source-backed SVW logo candidate cropped from a firm-contributed
 * published PDF. No reconstructed typography and no PlaceCard activation.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
import sharp from "sharp";
const sourcePage="https://chambers.com/downloads/gpg/1090/018_norway.pdf";
const sourcePdfPage=5;
const candidateDir="bilder/kort/brands/candidates/aker_brygge";
const originalDir="bilder/kort/brands/source/aker_brygge";
const reportPath="reports/place-production/aker-brygge-svw-authentic-pdf-wordmark-2026-11-19.json";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const assert=(ok,m)=>{if(!ok)throw Error(m)};
const allowed=JSON.parse(await fs.readFile("data/brands/brands_by_place.json","utf8")).aker_brygge;
assert(allowed.length===9 && allowed.includes("simonsen_vogt_wiig"),"Canonical brand mapping changed");
const response=await fetch(sourcePage,{signal:AbortSignal.timeout(40000),headers:{"User-Agent":"HistoryGoLogoAudit/1.0 (https://github.com/Paradispartiet/History-Go)","Accept":"application/pdf"}});
assert(response.ok,"Source PDF HTTP "+response.status);
assert(new URL(response.url).hostname==="chambers.com","Unapproved PDF redirect");
const source=Buffer.from(await response.arrayBuffer());
assert(source.length>200000 && source.length<25000000,"Unexpected PDF bytes");
assert(source.subarray(0,5).toString()==="%PDF-","Input is not a PDF");
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),"hg-svw-"));
try{
  const pdfPath=path.join(temporary,"source.pdf"),outputPrefix=path.join(temporary,"page5");
  await fs.writeFile(pdfPath,source);
  execFileSync("pdftoppm",["-f",String(sourcePdfPage),"-l",String(sourcePdfPage),"-r","225","-png","-singlefile",pdfPath,outputPrefix],{timeout:80000,stdio:"pipe"});
  const page=await fs.readFile(outputPrefix+".png");
  const meta=await sharp(page).metadata();
  assert(meta.width>1300&&meta.height>1800,"PDF page render unexpectedly small");
  // Exact source-page logo region: right column of page 5 below the contact divider.
  // Ratios checked against published page screenshot. Never draw or retype the logo.
  const region={left:.55,top:.555,width:.345,height:.115};
  const pixels={left:Math.round(region.left*meta.width),top:Math.round(region.top*meta.height),width:Math.round(region.width*meta.width),height:Math.round(region.height*meta.height)};
  assert(pixels.left+pixels.width<=meta.width && pixels.top+pixels.height<=meta.height,"crop bounds invalid");
  const original=await sharp(page).extract(pixels).png().toBuffer();
  const origMeta=await sharp(original).metadata();
  const webp=await sharp(original).trim({background:"#ffffff",threshold:12})
    .resize(860,480,{fit:"contain",background:"#ffffff",kernel:"lanczos3"})
    .flatten({background:"#ffffff"})
    .extend({top:20,bottom:20,left:20,right:20,background:"#ffffff"})
    .webp({quality:94,effort:5}).toBuffer();
  const outputMeta=await sharp(webp).metadata();
  assert(outputMeta.width===900&&outputMeta.height===520&&outputMeta.format==="webp","bad WebP output");
  await fs.mkdir(originalDir,{recursive:true});
  await fs.mkdir(candidateDir,{recursive:true});
  const originalPath=path.join(originalDir,"simonsen_vogt_wiig_chambers_2024_authentic_wordmark_crop.png");
  const candidatePath=path.join(candidateDir,"simonsen_vogt_wiig.webp");
  await fs.writeFile(originalPath,original);
  await fs.writeFile(candidatePath,webp);
  const report={
    schema:"history_go_aker_brygge_pdf_authentic_brandmark_candidate_v1",
    placeId:"aker_brygge",brandId:"simonsen_vogt_wiig",name:"Simonsen Vogt Wiig",
    sourcePage,sourcePageNumber:sourcePdfPage,
    sourceType:"firm_contributed_editorial_pdf_authentic_wordmark",
    sourceDescription:"2024 Chambers Norway Law and Practice contributed by SVW; authentic wordmark at lower right of page 5",
    sourceDocumentSha256:sha(source),sourceDocumentBytes:source.length,
    sourcePageRenderDimensions:[meta.width,meta.height],cropRatios:region,cropPixels:pixels,
    originalPath,originalDimensions:[origMeta.width,origMeta.height],originalSha256:sha(original),
    candidatePath,candidateDimensions:[outputMeta.width,outputMeta.height],candidateSha256:sha(webp),
    copyrightNote:"Published editorial document copyright must be reviewed. Referent use candidate only; no redistribution of the source PDF.",
    rightsBasis:"Source-backed authenticity; photo/page copyright and referential trademark identification need approval before public use",
    transformation:"Documented crop of authentic printed logo, white trim, high-quality WebP fit contain; no text recreation",
    visualApproval:false,publishable:false,productionAssetsActivated:0,placecardBrandsEnabled:false,reviewStatus:"ORIGINAL_DOCUMENTARY_WORDMARK_VISUAL_AND_RIGHTS_REVIEW_PENDING"
  };
  await fs.mkdir(path.dirname(reportPath),{recursive:true});
  await fs.writeFile(reportPath,JSON.stringify(report,null,2)+"\n");
  console.log("SVW wordmark candidate "+JSON.stringify({sourcePdfSha256:report.sourceDocumentSha256,originalSha256:report.originalSha256,webpSha256:report.candidateSha256,cropPixels:pixels}));
} finally {await fs.rm(temporary,{recursive:true,force:true})}
