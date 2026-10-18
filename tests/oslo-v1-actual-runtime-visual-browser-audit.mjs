#!/usr/bin/env node
// Chromium audit of the real History Go index.html, app boot, canonical PlaceCard
// and actual place-open payloads. No synthetic placeholder images or v1 promotion.
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const ROOT=process.cwd();
const OUT="reports/oslo-v1-runtime-visual-20261018";
const TMP=".tmp/oslo-v1-runtime-captures";
const ids=["groruddammen","svartdalen","alnaparken","alna_bryn",
 "kvaernerbyen_alna","alna_utlop_bjorvika","voienfossen","myralokka",
 "vaterland_historisk_elvelop","vulkan_industriomrade","glads_molle","salt",
 "blaa","rockefeller","john_dee","sentrum_scene"];
const places=ids.map(id=>{
 const file="data/runtime/place-open/"+id+".json";
 const item=JSON.parse(fs.readFileSync(file,"utf8")).place;
 if(item.id!==id||!item.imageComposition)throw Error("Missing canonical media composition: "+id);
 return item;
});
fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(TMP,{recursive:true});
const MIME={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",
 ".json":"application/json",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml",
 ".jpg":"image/jpeg",".wasm":"application/wasm",".woff2":"font/woff2"};
const server=http.createServer((request,response)=>{
 const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);
 const file=path.resolve(ROOT,"."+pathname);
 if(!(file===ROOT||file.startsWith(ROOT+path.sep))||!fs.existsSync(file)||fs.statSync(file).isDirectory()){
  response.writeHead(404);response.end("not found");return;
 }
 response.writeHead(200,{"content-type":MIME[path.extname(file).toLowerCase()]||"application/octet-stream"});
 fs.createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const report={schema:"history_go_oslo_v1_native_browser_visual_audit_v1",
 source:"Unmodified real index.html boot, real app.js and 16 canonical place-open payloads",
 scope:"Two browser viewport sizes; photo geometry, flip and QuizCard rendering",
 date:"2026-10-18",viewports:[390,768],places:[],blockers:[],v1_approved:0};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of report.viewports){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1024},deviceScaleFactor:1});
  const errs=[];
  page.on("pageerror",error=>errs.push(String(error.message).slice(0,240)));
  let booted=false;
  try{
   await page.goto("http://127.0.0.1:"+port+"/index.html",{waitUntil:"domcontentloaded",timeout:28000});
   await page.waitForFunction(()=>typeof window.openPlaceCard==="function"&&!!document.getElementById("pcFrontImage"),{timeout:16000});
   booted=true;
   // Close the actual app onboarding using its public start button before taking screenshots.
   await page.locator("#hgOnboardingModal .hg-onb-primary").click({timeout:1800}).catch(async()=>{
     await page.evaluate(()=>window.HGOnboarding?.close?.());
   });
   // Let app/router startup settle before opening the first place, otherwise
   // a late initial-hide can race with the first PlaceCard request.
   await page.waitForTimeout(850);
  }catch(e){report.blockers.push({width,reason:"Native index/app boot unavailable",error:String(e).slice(0,380),pageErrors:errs.slice(0,6)});}
  for(const place of places){
   const problems=[],snapshots=[];
   let open=false,media=null,flip=null;
   if(!booted) problems.push("Native app was not ready");
   else{
    try{
     open=await page.evaluate(async place=>{
      window.HG_PLACES_READY=true;
      window.PLACES=[place];
      return await Promise.race([
       window.openPlaceCard(place),
       new Promise((_,reject)=>setTimeout(()=>reject(new Error("PlaceCard open timeout")),9000))
      ]);
     },place)!==false;
     if(!open)problems.push("openPlaceCard returned false");
     await page.waitForTimeout(450);
    }catch(e){problems.push("openPlaceCard: "+String(e).slice(0,240));}
    try{
     media=await page.evaluate(()=>{
      const get=sel=>{
       const x=document.querySelector(sel);
       if(!x)return null;
       const st=getComputedStyle(x),rect=x.getBoundingClientRect();
       return{source:x.getAttribute("src")||"",decoded:x.complete&&x.naturalWidth>0,
        naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight,fit:st.objectFit,
        position:st.objectPosition,width:Math.round(rect.width),height:Math.round(rect.height)};
      };
      return{visible:document.querySelector("#placeCard")?.classList.contains("is-open"),
       hero:get("#pcHeaderImage"),portrait:get("#pcFrontImage"),quiz:get("#pcQuizCardImage")};
     });
     if(!media.visible)problems.push("PlaceCard not visible");
     if(!media.hero?.decoded||!media.hero?.source.endsWith(place.image))problems.push("Real hero image did not decode");
     if(!media.portrait?.decoded||!media.portrait?.source.endsWith(place.frontImage))problems.push("Real portrait did not decode");
     if(media.hero?.fit!=="cover")problems.push("Hero CSS does not use cover");
     if(media.hero?.position!==place.imageComposition.heroPosition)problems.push("Wrong hero focus point");
     if(media.portrait?.position!==place.imageComposition.portraitPosition)problems.push("Wrong portrait focus point");
     if(media.visible){
      for(const [selector,label] of [["#pcHeaderHero","hero"],["#pcFrontCardFlip","front"]]){
       try{
        await page.locator(selector).screenshot({path:TMP+"/"+place.id+"-"+width+"-"+label+".png",timeout:6000});
        snapshots.push(label);
       }catch(e){problems.push("Screenshot "+label+": "+String(e).slice(0,120));}
      }
      try{
       await page.locator("#pcFrontCardFlip").click({timeout:5500,force:true});
       await page.waitForTimeout(500);
       flip=await page.evaluate(()=>{
        const card=document.querySelector("#pcFrontCardFlip");
        const image=document.querySelector("#pcQuizCardImage");
        const content=document.querySelector("#pcQuizCardContent");
        return{flipped:!!card?.classList.contains("is-flipped"),
         image:!!image&&getComputedStyle(image).display!=="none"&&image.naturalWidth>0,
         content:!!content&&!content.hidden&&(content.textContent||"").length>50,
         fit:image?getComputedStyle(image).objectFit:null};
       });
       if(!flip.flipped)problems.push("QuizCard flip not activated");
       if(!flip.image&&!flip.content)problems.push("QuizCard reverse empty");
       if(flip.image&&flip.fit!=="contain")problems.push("QuizCard image cropped");
       await page.locator("#pcFrontCardFlip").screenshot({path:TMP+"/"+place.id+"-"+width+"-reverse.png",timeout:6000});
       snapshots.push("reverse");
      }catch(e){problems.push("Flip: "+String(e).slice(0,200));}
     }
    }catch(e){problems.push("DOM: "+String(e).slice(0,200));}
   }
   report.places.push({id:place.id,width,open,media,flip,problems,snapshots});
   console.log("VISUAL",width,place.id,problems.length?"BLOCKED "+problems.join(" | "):"PASS");
  }
  if(errs.length)report.blockers.push({width,reason:"App JavaScript errors",count:errs.length,samples:errs.slice(0,12)});
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
report.summary={places:ids.length,checks:report.places.length,
 passed:report.places.filter(x=>!x.problems.length).length,
 blocked:report.places.filter(x=>x.problems.length).length,
 v1_approved:0};
report.status=report.summary.blocked?"BLOCKED":"BROWSER_PASS_VISUAL_EDITORIAL_REVIEW_PENDING";
fs.writeFileSync(OUT+"/report.json",JSON.stringify(report,null,2)+"\n");
console.log("AUDIT_SUMMARY",JSON.stringify(report.summary));
