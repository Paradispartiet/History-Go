#!/usr/bin/env node
/**
 * Browser evidence of actual official website headers only.
 * This NEVER reconstructs logos or adds a logo to runtime/PlaceCard.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {chromium} from "playwright";
const sources=[
 {id:"lund_hagem",url:"https://www.lundhagem.no/"},
 {id:"simonsen_vogt_wiig",url:"https://svw.no/"},
 {id:"haavind",url:"https://haavind.no/"},
 {id:"tiger_of_sweden",url:"https://www.tigerofsweden.com/se/sv/home-page.html"}
];
const outDir="reports/place-production/aker-brygge-official-header-evidence";
const reportPath="reports/place-production/aker-brygge-remaining-brand-header-audit-2026-11-19.json";
const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
const report={schema:"history_go_aker_brygge_remaining_brand_header_audit_v1",date:"2026-11-19",placeId:"aker_brygge",publishable:false,brandCount:4,entries:[]};
await fs.mkdir(outDir,{recursive:true});
try{
 for(const site of sources){
  const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:2,colorScheme:"light",locale:"nb-NO"});
  const result={brandId:site.id,sourcePage:site.url,httpStatus:null,finalUrl:null,title:null,error:null,headerEvidence:null,headerEvidenceStorage:"actions_artifact_only",logoCandidates:[],published:false,reviewStatus:"UNVERIFIED_BROWSER_EVIDENCE"};
  try {
   const response=await page.goto(site.url,{waitUntil:"domcontentloaded",timeout:45000});
   result.httpStatus=response?.status()??null;
   result.finalUrl=page.url();
   result.title=await page.title();
   await page.waitForTimeout(900);
   const screenshotPath=path.join(outDir,site.id+"_header.png");
   await page.screenshot({path:screenshotPath,clip:{x:0,y:0,width:1280,height:380},animations:"disabled"});
   result.headerEvidence=screenshotPath;
   result.logoCandidates=await page.evaluate(()=>{
    const targets=[...document.querySelectorAll("header a, header svg, header img, a[class*=logo], .logo, .site-logo, [aria-label*=logo], [class*=wordmark]")];
    const found=[];
    for (const [i,node] of targets.entries()) {
      const r=node.getBoundingClientRect();
      if(r.width<24||r.height<12||r.width>1000||r.height>300||r.y>410||r.x>1000)continue;
      const text=(node.textContent||"").trim().replace(/\s+/g," ").slice(0,70);
      const attr=(node.getAttribute("class")||"")+" "+(node.getAttribute("aria-label")||"")+" "+(node.getAttribute("id")||"");
      const hasGraphic=!!node.querySelector?.("svg, img")||["SVG","IMG"].includes(node.tagName?.toUpperCase());
      const href=node.getAttribute?.("href")||"";
      const score=(/logo|brand|wordmark/i.test(attr)?9:0)+(hasGraphic?5:0)+(/^\/*$/.test(href)?3:0)-(text.length>60?8:0);
      found.push({score,tag:node.tagName,classes:attr.slice(0,170),text,href,box:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},html:node.outerHTML?.slice(0,280)});
    }
    return found.sort((a,b)=>b.score-a.score).slice(0,12);
   });
   console.log(site.id+": HTTP "+result.httpStatus+", "+result.logoCandidates.length+" DOM logo candidates");
   for(const c of result.logoCandidates.slice(0,4)) console.log("  score="+c.score+" "+c.tag+" "+c.classes+" "+JSON.stringify(c.box));
  }catch(e){result.error=String(e).slice(0,400);console.error(site.id+": "+result.error);}
  report.entries.push(result);
  await page.close();
 }
} finally {await browser.close();}
await fs.mkdir(path.dirname(reportPath),{recursive:true});
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+"\n");
