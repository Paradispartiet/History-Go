#!/usr/bin/env node
/**
 * Preserve exact SVG DOM artwork from official websites as unpublished candidates.
 * Rendering matte + captured inherited CSS color are technical, not redesigned artwork.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {chromium} from "playwright";
import sharp from "sharp";
const items=[
 {id:"lund_hagem",name:"Lundhagem",url:"https://www.lundhagem.no/",selector:"h1.site-logo svg",matte:"#242422",rightsBasis:"Official inline SVG wordmark; referential use pending rights review"},
 {id:"haavind",name:"Haavind",url:"https://haavind.no/",selector:"svg.main-logo",matte:"#fffdf0",rightsBasis:"Official inline SVG emblem; Haavind logo terms require separate approval before publication"}
];
const sourceDir="bilder/kort/brands/source/aker_brygge";
const candidateDir="bilder/kort/brands/candidates/aker_brygge";
const reportPath="reports/place-production/aker-brygge-inline-svg-candidates-2026-11-19.json";
const digest=b=>crypto.createHash("sha256").update(b).digest("hex");
function assert(ok,msg){if(!ok)throw new Error(msg);}
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
const output={schema:"history_go_aker_brygge_inline_svg_source_candidates_v1",placeId:"aker_brygge",candidates:[],productionAssetsActivated:0,placecardBrandsEnabled:false,publishable:false};
try{
 for(const item of items){
  const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:2,locale:"nb-NO"});
  try{
    const response=await page.goto(item.url,{waitUntil:"domcontentloaded",timeout:45000});
    assert(response?.status()===200,item.id+" unexpected HTTP response "+response?.status());
    const record=await page.locator(item.selector).first().evaluate(el=>({markup:el.outerHTML,computedColor:getComputedStyle(el).color,fill:getComputedStyle(el).fill}));
    assert(/^<svg[\s>]/i.test(record.markup),item.id+" selector did not yield SVG");
    assert(!/<script[\s>]|<foreignObject[\s>]|onload\s*=|href\s*=\s*["']https?:/i.test(record.markup),item.id+" active external SVG content blocked");
    const original=Buffer.from(record.markup,"utf8");
    assert(original.length>150 && original.length<250000,item.id+" unusual SVG byte size");
    const sourceMeta=await sharp(original).metadata();
    assert(sourceMeta.format==="svg" && sourceMeta.width>30 && sourceMeta.height>10,item.id+" invalid SVG");
    // Preserve original untouched; add ONLY captured inherited CSS color for rendering if needed.
    let renderSvg=record.markup;
    if(/currentColor/.test(renderSvg)&&!/<svg[^>]*\bstyle=/.test(renderSvg)){
       renderSvg=renderSvg.replace(/^<svg\b/,'<svg style="color:'+record.computedColor+'"');
    }
    const matte=item.matte;
    const webp=await sharp(Buffer.from(renderSvg),{limitInputPixels:32000000})
       .resize(860,480,{fit:"contain",background:matte,kernel:"lanczos3"})
       .flatten({background:matte})
       .extend({top:20,bottom:20,left:20,right:20,background:matte})
       .webp({quality:93,effort:5}).toBuffer();
    const m=await sharp(webp).metadata();
    assert(m.width===900&&m.height===520&&m.format==="webp",item.id+" invalid export");
    await fs.mkdir(sourceDir,{recursive:true});
    await fs.mkdir(candidateDir,{recursive:true});
    const sourcePath=path.join(sourceDir,item.id+"_official_inline.svg");
    const candidatePath=path.join(candidateDir,item.id+".webp");
    await fs.writeFile(sourcePath,original);
    await fs.writeFile(candidatePath,webp);
    output.candidates.push({brandId:item.id,name:item.name,sourcePage:item.url,sourceSelector:item.selector,sourceType:"original_inline_svg",capturedInheritedColor:record.computedColor,sourceDimensions:[sourceMeta.width,sourceMeta.height],sourcePath,sourceSha256:digest(original),candidatePath,candidateSha256:digest(webp),candidateDimensions:[m.width,m.height],matteColor:matte,rightsBasis:item.rightsBasis,transformation:"Faithful original SVG DOM rendered against contrasting matte; no artwork reconstruction/crop",visualApproval:false,publishable:false,reviewStatus:"SOURCE_AUTHENTIC_VISUAL_AND_RIGHTS_REVIEW_PENDING"});
    console.log(item.id+": original "+digest(original)+" candidate "+digest(webp));
  }finally{await page.close();}
 }
} finally {await browser.close();}
assert(output.candidates.length===2,"Both source candidates are required");
await fs.mkdir(path.dirname(reportPath),{recursive:true});
await fs.writeFile(reportPath,JSON.stringify(output,null,2)+"\n");
