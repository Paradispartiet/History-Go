#!/usr/bin/env node
// Dedicated Tjuvholmen photo/PlaceCard regression against the real app and local images.
// Does not simulate or pre-paint images; vFerdig still needs editorial collection QA.
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const root=process.cwd();
const place=JSON.parse(fs.readFileSync("data/places/by/oslo/places/tjuvholmen.json","utf8"));
assert.equal(place.id,"tjuvholmen");
assert.ok(!Object.hasOwn(place,"cardImage"),"Retired cardImage must not be reintroduced");
assert.equal(place.underbadge_ids.join(","),"samtidsarkitektur,byplanlegging,bolig_og_bomiljo");
const out=".tmp/tjuvholmen-photo-browser"; fs.mkdirSync(out,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml",".jpg":"image/jpeg",".wasm":"application/wasm",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
 const p=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 const f=path.resolve(root,"."+p);
 if(!(f===root||f.startsWith(root+path.sep))||!fs.existsSync(f)||fs.statSync(f).isDirectory()){
   res.writeHead(404);res.end("not found");return;
 }
 res.writeHead(200,{"content-type":mime[path.extname(f).toLowerCase()]||"application/octet-stream"});
 fs.createReadStream(f).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port, results=[];
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:950},deviceScaleFactor:1});
  const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+port+"/index.html",{waitUntil:"domcontentloaded",timeout:45000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&typeof window.openPlaceCard==="function",{timeout:30000});
   await page.locator("#hgOnboardingModal .hg-onb-primary").click({timeout:2000}).catch(async()=>await page.evaluate(()=>window.HGOnboarding?.close?.()));
   await page.waitForTimeout(700);
   await page.evaluate(()=>document.querySelector("#hgOnboardingModal .hg-onb-close")?.click());
   await page.evaluate(async data=>{
     window.HG_PLACES_READY=true;window.PLACES=[data];
     await window.openPlaceCard(data);
   },place);
   await page.waitForFunction(()=>document.getElementById("placeCard")?.classList.contains("is-open"),{timeout:20000});
   await page.waitForTimeout(400);
   await page.evaluate(()=>document.querySelector("#hgOnboardingModal .hg-onb-close")?.click());
   const data=await page.evaluate(()=>{
    const get=sel=>{
     const el=document.querySelector(sel);
     if(!el)return null;
     const st=getComputedStyle(el),r=el.getBoundingClientRect();
     return{src:el.getAttribute("src"),decoded:el.complete&&el.naturalWidth>0,fit:st.objectFit,width:r.width,height:r.height,
        imageWidth:el.naturalWidth,imageHeight:el.naturalHeight};
    };
    return{hero:get("#pcHeaderImage"),front:get("#pcFrontImage"),quizImage:get("#pcQuizCardImage"),
      heroContainer:getComputedStyle(document.querySelector("#pcHeaderHero")).height,
      width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth,cardOpen:document.querySelector("#placeCard").classList.contains("is-open")};
   });
   assert.ok(data.cardOpen);
   for(const [key,source] of [["hero",place.image],["front",place.frontImage]]){
     assert.ok(data[key]?.decoded,key+" not decoded");
     assert.ok(data[key].src?.endsWith(source),key+" not bound to local source");
     assert.equal(data[key].fit,"contain",key+" must not be cropped");
   }
   assert.ok(data.front.imageHeight>data.front.imageWidth,"frontImage source must be portrait");
   assert.ok(data.scrollWidth<=width+4,"Horizontal overflow at "+width);
   await page.screenshot({path:`${out}/place-${width}.png`,animations:"disabled",timeout:15000});
   const quiz=page.locator("#pcFrontCardFlip");
   await page.waitForFunction(()=>{
     const c=document.querySelector("#pcFrontCardFlip"),body=document.querySelector("#pcQuizCardContent");
     return c?.classList.contains("has-quiz-card")&&body&&!body.hidden;
   },{timeout:15000});
   const bounds=await quiz.boundingBox();
   assert.ok(bounds&&bounds.width>40&&bounds.height>40,"QuizCard flip front missing");
   await quiz.click({position:{x:20,y:Math.max(20,bounds.height-24)},timeout:8000});
   await page.waitForFunction(()=>document.querySelector("#pcFrontCardFlip")?.classList.contains("is-flipped"),{timeout:7000});
   // Class toggling is NOT sufficient: mobile can visually dismiss the entire
   // PlaceCard while leaving is-flipped on a detached/hidden DOM node.
   await page.waitForTimeout(650);
   const afterFlip=await page.evaluate(()=>{
     const card=document.querySelector("#placeCard");
     const flip=document.querySelector("#pcFrontCardFlip");
     const qr=flip?.getBoundingClientRect(),r=card?.getBoundingClientRect();
     const s=card?getComputedStyle(card):null;
     const quiz=document.querySelector("#pcQuizCardContent");
     const isOpen=card?.classList.contains("is-open")&&!card.classList.contains("is-hidden");
     const cardVisible=!!r && r.width>60 && r.height>100 && r.top<innerHeight && r.bottom>0 && s?.display!=="none" && s?.visibility!=="hidden";
     const flipVisible=!!qr&&qr.width>30&&qr.height>30&&qr.top<innerHeight&&qr.bottom>0;
     return{isOpen,cardVisible,flipVisible,flipped:flip?.classList.contains("is-flipped"),
       cardClasses:card?.className,ariaHidden:card?.getAttribute("aria-hidden"),
       cardRect:r?{top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null,
       flipRect:qr?{top:qr.top,bottom:qr.bottom,width:qr.width,height:qr.height}:null,
       quizTextLength:quiz?.textContent?.trim().length||0};
   });
   console.log("TJUVHOLMEN_POST_FLIP",width,JSON.stringify(afterFlip));
   await page.screenshot({path:`${out}/quiz-${width}.png`,animations:"disabled",timeout:15000});
   assert.ok(afterFlip.isOpen&&afterFlip.cardVisible&&afterFlip.flipVisible,
     "QuizCard flip visually dismissed PlaceCard: "+JSON.stringify(afterFlip));
   assert.ok(afterFlip.quizTextLength>50,"QuizCard back content missing after flip");
   assert.deepEqual(pageErrors,[],"Uncaught page errors");
   results.push({width,status:"PASS",hero:data.hero,front:data.front,flip:true});
   console.log("TJUVHOLMEN",width,"PASS",JSON.stringify({heroFit:data.hero.fit,frontFit:data.front.fit,flip:true}));
  }catch(e){results.push({width,status:"BLOCKED",error:String(e.stack||e).slice(0,1300),pageErrors});console.error("TJUVHOLMEN",width,"BLOCKED",e.message);}
  await page.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
fs.writeFileSync(`${out}/report.json`,JSON.stringify({place_id:"tjuvholmen",results,status:results.every(r=>r.status==="PASS")?"BROWSER_PASS":"BLOCKED",editorial_vferdig:false},null,2)+"\\n");
if(results.some(r=>r.status!=="PASS"))process.exitCode=1;
