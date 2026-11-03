#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root=process.cwd();
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const place=read("data/places/sport/europa/norway/oslo_sport/toyenbadet.json");
const quiz=read("data/quiz/sport/toyenbadet_sets.json");
const quizCard=read("data/quizcards/sport/toyenbadet_quizcard_v1.json");
assert.equal(place.id,"toyenbadet");
assert.equal(place.category,"sport");
assert.equal(quiz.sets.flatMap(s=>s.questions).length,21);
assert.equal(quizCard.cards.length,1);
assert.equal(quizCard.cards[0].targetId,"toyenbadet");
assert.equal(quizCard.cards[0].questions.length,10);
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}
 catch{res.writeHead(400).end("bad url");return;}
 const file=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
   res.writeHead(404).end("not found");return;
 }
 res.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const out=path.join(root,"artifacts/toyenbadet-vferdig-real-browser");
fs.mkdirSync(out,{recursive:true});
const results=[];
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const vp of [{name:"mobile",width:390,height:844,mobile:true},{name:"desktop",width:1440,height:960,mobile:false}]){
   const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.mobile,hasTouch:vp.mobile,locale:"nb-NO"});
   let page;
   try{
     await ctx.addInitScript(()=>{
       localStorage.setItem("hg_onboarding_shown_v1","1");
       localStorage.setItem("HG_TEST_MODE","1");
       localStorage.setItem("hg_lang","nb");
     });
     page=await ctx.newPage();
     await page.goto(base+"/index.html?hgTest=1#/place/toyenbadet",{waitUntil:"domcontentloaded",timeout:80000});
     await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector("#placeCard")?.dataset.currentPlaceId==="toyenbadet",null,{timeout:85000});
     await page.waitForFunction(expected=>document.getElementById("pcDesc")?.textContent===expected,place.desc,{timeout:25000});
     await page.waitForFunction(()=>{
       const h=document.querySelector("#pcHeaderImage"),f=document.querySelector("#pcFrontImage");
       return h?.complete&&h.naturalWidth>0&&f?.complete&&f.naturalWidth>0;
     },null,{timeout:60000});
     const imgs=await page.evaluate(()=>{
       const h=document.querySelector("#pcHeaderImage"),f=document.querySelector("#pcFrontImage");
       return {hero:{src:h.currentSrc,width:h.naturalWidth,height:h.naturalHeight},front:{src:f.currentSrc,width:f.naturalWidth,height:f.naturalHeight}};
     });
     assert.match(imgs.hero.src,/toyenbadet_2026_marek_lumi_glass\.webp$/,vp.name+" licensed modern 2026 header");
     assert.match(imgs.front.src,/toyenbadet_historic_1980_portrait\.webp$/,vp.name+" licensed 1980 front");
     assert.equal(imgs.hero.width,1400);
     assert.equal(imgs.hero.height,900);
     assert.equal(imgs.front.width,900);
     assert.equal(imgs.front.height,1350);
     // The historical before/after is source-owned and both photographs decode in the actual app.
     await page.waitForFunction(()=>{
       const p=window.HGPlaceOpen?.getPlace?.("toyenbadet")||window.PLACES?.find(x=>x?.id==="toyenbadet");
       return p?.for_na?.beforeImage&&p?.for_na?.nowImage;
     },null,{timeout:30000});
     const beforeAfter=await page.evaluate(async()=>{
       const p=window.HGPlaceOpen?.getPlace?.("toyenbadet")||window.PLACES?.find(x=>x?.id==="toyenbadet");
       const paths=[p.for_na.beforeImage,p.for_na.nowImage];
       const photos=await Promise.all(paths.map(src=>new Promise((resolve,reject)=>{
         const img=new Image();img.onload=()=>resolve({src,width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>reject(new Error("before/after photo failed: "+src));img.src=src;
       })));
       return {title:p.for_na.title,photos};
     });
     assert.match(beforeAfter.title,/2013 og 2026/);
     assert.equal(beforeAfter.photos.length,2);
     assert.ok(beforeAfter.photos.every(p=>p.width>0&&p.height>0));
     await page.waitForFunction(()=>document.querySelector("#pcFrontCardFlip")?.classList.contains("has-quiz-card"),null,{timeout:30000});
     // All four source-backed collections must be visible with genuine loaded preview assets.
     await page.waitForFunction(()=>{
       const card=document.getElementById("placeCard");
       const icon=document.getElementById("pcCategoryCollectionIcon");
       const list=document.getElementById("pcCategoryCollectionList");
       const img=icon?.querySelector("img");
       const brandIcon=document.getElementById("pcBrandsIcon");
       const brandImg=brandIcon?.querySelector("img");
       const objectIcon=document.getElementById("pcObjectsIcon");
       const objectImg=objectIcon?.querySelector("img");
       const peopleIcon=document.getElementById("pcPeopleIcon");
       const peopleImg=peopleIcon?.querySelector("img");
       return ["place_card_profile_v2_curated","place_card_profile_v2"].includes(card?.dataset.collectionProfileSource)
         && card?.dataset.collectionCount==="4"
         && icon?.dataset.collectionId==="competitions"
         && icon?.dataset.previewStatus==="member-image"
         && img?.complete&&img.naturalWidth>0
         && list?.textContent?.includes("NM langbane")
         && brandIcon?.dataset.collectionItemCount==="1"
         && brandImg?.complete&&brandImg.naturalWidth>0
         && objectIcon?.dataset.collectionItemCount==="2"
         && objectImg?.complete&&objectImg.naturalWidth>0
         && objectIcon?.querySelector(".pc-object-preview-disclosure")?.textContent?.includes("Illustrasjon")
         && peopleIcon?.dataset.collectionItemCount==="1"
         && peopleImg?.complete&&peopleImg.naturalWidth>0
         && peopleImg?.getAttribute("src")?.includes("anne_lindboe_2023_cc_by_sa");
     },null,{timeout:30000});
     const flip=page.locator("#pcFrontCardFlip");
     await flip.click();
     await page.waitForFunction(()=>document.querySelector("#pcFrontCardFlip")?.classList.contains("is-flipped"),null,{timeout:10000});
     assert.match(await page.locator("#pcQuizCardContent").innerText(),/Tøyenbadet/i);
     await page.locator("#placeCard").screenshot({path:path.join(out,vp.name+"-placecard.png")});
     await page.goto(base+"/fagverk-sted.html?place=toyenbadet",{waitUntil:"domcontentloaded",timeout:60000});
     await page.waitForFunction(()=>document.getElementById("fagverkPlaceContent")?.hidden===false,null,{timeout:45000});
     assert.match(await page.locator("#fagverkPlaceTitle").innerText(),/Tøyenbadet/i);
     assert.equal(await page.locator("#fagverkPlaceArticle p").count(),place.fagverk.article.length);
     assert.equal(await page.locator("#fagverkPlaceLenses a").count(),place.fagverk.lenses.length);
     assert.equal(await page.locator("#fagverkPlaceError").isHidden(),true);
     await page.screenshot({path:path.join(out,vp.name+"-fagverk.png"),fullPage:true});
     console.log("PASS Tøyenbadet media, QuizCard flip and Fagverk:",vp.name);
     results.push({viewport:vp.name,status:"passed",images:imgs});
   }catch(error){
     const diagnostic=page ? await page.evaluate(()=>{
       const card=document.getElementById("placeCard");
       const icon=document.getElementById("pcCategoryCollectionIcon");
       const list=document.getElementById("pcCategoryCollectionList");
       const img=icon?.querySelector("img");
       return {
         currentPlace:card?.dataset.currentPlaceId,
         collectionSource:card?.dataset.collectionProfileSource,
         collectionCount:card?.dataset.collectionCount,
         categoryId:icon?.dataset.collectionId,
         previewStatus:icon?.dataset.previewStatus,
         imageSrc:img?.getAttribute("src"),
         imageLoaded:img?.complete&&img.naturalWidth>0,
         peopleCount:document.getElementById("pcPeopleIcon")?.dataset.collectionItemCount,
         peopleImage:document.querySelector("#pcPeopleIcon img")?.getAttribute("src"),
         peopleImageLoaded:!!document.querySelector("#pcPeopleIcon img")?.complete && document.querySelector("#pcPeopleIcon img")?.naturalWidth>0,
         objectCount:document.getElementById("pcObjectsIcon")?.dataset.collectionItemCount,
         brandCount:document.getElementById("pcBrandsIcon")?.dataset.collectionItemCount,
         listText:list?.textContent?.slice(0,300),
         iconExists:!!icon,
         cardVisible:!!card&&getComputedStyle(card).display!=="none",
         appReady:window.__HG_APP_READY__,
         routerReady:window.__HG_ROUTER_STARTED__
       };
     }).catch(e=>({evaluateError:String(e)})) : null;
     console.error("Tøyenbadet browser diagnostic:",vp.name,JSON.stringify(diagnostic));
     results.push({viewport:vp.name,status:"failed",error:String(error.stack||error),diagnostic});
     if(page)await page.screenshot({path:path.join(out,vp.name+"-failure.png"),fullPage:true,timeout:10000}).catch(()=>{});
   }finally{await ctx.close();}
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(out,"results.json"),JSON.stringify(results,null,2)+"\n");
}
assert.equal(results.filter(x=>x.status!=="passed").length,0,results.filter(x=>x.status!=="passed").map(x=>x.error).join("\n"));
