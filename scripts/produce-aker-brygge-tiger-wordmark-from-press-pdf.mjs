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
const sourcePage="https://tigerofsweden-pressportal.qbank.se/detail/Press%20release%20Tiger%20of%20Sweden%20Spring%20Summer%202026.pdf/181132/download/original?pdf=1";
const sourcePdfPage=1;
const candidateDir="bilder/kort/brands/candidates/aker_brygge";
const originalDir="bilder/kort/brands/source/aker_brygge";
const reportPath="reports/place-production/aker-brygge-tiger-official-press-wordmark-2026-11-19.json";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const assert=(ok,m)=>{if(!ok)throw Error(m)};
const allowed=JSON.parse(await fs.readFile("data/brands/brands_by_place.json","utf8")).aker_brygge;
assert(allowed.length===9 && allowed.includes("tiger_of_sweden"),"Canonical brand mapping changed");
const response=await fetch(sourcePage,{signal:AbortSignal.timeout(40000),headers:{"User-Agent":"HistoryGoLogoAudit/1.0 (https://github.com/Paradispartiet/History-Go)","Accept":"application/pdf"}});
assert(response.ok,"Source PDF HTTP "+response.status);
assert(new URL(response.url).hostname==="tigerofsweden-pressportal.qbank.se","Unapproved PDF redirect");
const source=Buffer.from(await response.arrayBuffer());
assert(source.length>15000 && source.length<25000000,"Unexpected PDF bytes");
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
  const region={left:.30,top:.064,width:.40,height:.052};
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
  const originalPath=path.join(originalDir,"tiger_of_sweden_press_ss2026_authentic_wordmark_crop.png");
  const candidatePath=path.join(candidateDir,"tiger_of_sweden.webp");
  await fs.writeFile(originalPath,original);
  await fs.writeFile(candidatePath,webp);
  const report={
    schema:"history_go_aker_brygge_pdf_authentic_brandmark_candidate_v1",
    placeId:"aker_brygge",brandId:"tiger_of_sweden",name:"Tiger of Sweden",
    sourcePage,sourcePageNumber:sourcePdfPage,
    sourceType:"brand_official_2026_press_pdf_authentic_wordmark",
    sourceDescription:"Official Tiger of Sweden Spring Summer 2026 press release; authentic uppercase TIGER OF SWEDEN wordmark centered near top of page 1",
    sourceDocumentSha256:sha(source),sourceDocumentBytes:source.length,
    sourcePageRenderDimensions:[meta.width,meta.height],cropRatios:region,cropPixels:pixels,
    originalPath,originalDimensions:[origMeta.width,origMeta.height],originalSha256:sha(original),
    candidatePath,candidateDimensions:[outputMeta.width,outputMeta.height],candidateSha256:sha(webp),
    copyrightNote:"Official fashion brand press document; copyright and trademark use require review. Candidate only; do not redistribute source PDF.",
    rightsBasis:"Official brand-authored press release establishes authenticity; copyright and trademark identification need review before public use",
    transformation:"Documented crop of authentic printed logo, white trim, high-quality WebP fit contain; no text recreation",
    visualApproval:false,publishable:false,productionAssetsActivated:0,placecardBrandsEnabled:false,reviewStatus:"ORIGINAL_DOCUMENTARY_WORDMARK_VISUAL_AND_RIGHTS_REVIEW_PENDING"
  };
  await fs.mkdir(path.dirname(reportPath),{recursive:true});
  await fs.writeFile(reportPath,JSON.stringify(report,null,2)+"\n");
  console.log("Tiger of Sweden wordmark candidate "+JSON.stringify({sourcePdfSha256:report.sourceDocumentSha256,originalSha256:report.originalSha256,webpSha256:report.candidateSha256,cropPixels:pixels}));
} finally {await fs.rm(temporary,{recursive:true,force:true})}
