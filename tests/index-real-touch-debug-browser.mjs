import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium, webkit } from "playwright";

const root = process.cwd();
const types = {".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml",".woff2":"font/woff2",".map":"application/json"};
const server = http.createServer((req,res)=>{
  const u=new URL(req.url || "/", "http://127.0.0.1");
  const file=path.resolve(root,"."+decodeURIComponent(u.pathname));
  if(!file.startsWith(root + path.sep) && file !== root){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,buffer)=>{
    if(err){res.writeHead(404);res.end("Missing "+u.pathname);return;}
    res.writeHead(200,{"content-type":(types[path.extname(file)]||"application/octet-stream")+"; charset=utf-8","cache-control":"no-store"});
    res.end(buffer);
  });
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const url="http://127.0.0.1:"+server.address().port+"/index.html";
const description = async page => page.evaluate(()=>{
  const el=(selector)=>document.querySelector(selector);
  const hit=(selector)=>{
    const n=el(selector);
    if(!n)return {selector,missing:true};
    const b=n.getBoundingClientRect();
    const x=Math.min(innerWidth-1,Math.max(0,b.left+b.width/2));
    const y=Math.min(innerHeight-1,Math.max(0,b.top+b.height/2));
    return {selector,rect:{x:b.x,y:b.y,w:b.width,h:b.height},display:getComputedStyle(n).display,point:[x,y],
      stack:document.elementsFromPoint(x,y).slice(0,7).map(e=>({tag:e.tagName,id:e.id,class:String(e.className).slice(0,90),z:getComputedStyle(e).zIndex,pe:getComputedStyle(e).pointerEvents}))};
  };
  return {ready:window.__HG_APP_READY__,load_error:window.__HG_APP_LOAD_ERROR__,last_error:window.__HG_LAST_ERROR__,
    missing:window.__HG_INDEX_RUNTIME_MISSING__,auth:!!window.HGLoginGate?.allowed,
    body_classes:document.body.className,html_classes:document.documentElement.className,shownFlag:localStorage.getItem("hg_onboarding_shown_v1"),
    map:!!window.HGMap?.getMap?.(),mapUnavailable:el("#map")?.dataset.mapUnavailable,initLeftPanel:typeof window.initLeftPanel,
    markerCount:document.querySelectorAll(".hg-place-detail-marker,.hg-place-area-marker").length,
    nearby:hit("#nearbyExploreToggle"),dock:hit(".hg-map-category-trigger"),
    mapCenter:(()=>{
      const x=Math.round(innerWidth/2),y=Math.round(innerHeight*0.55);
      const target=document.elementFromPoint(x,y);
      return {point:[x,y],mapReceivesTap:!!el("#map")?.contains(target),
        target:{tag:target?.tagName,id:target?.id,class:String(target?.className).slice(0,100)},
        stack:document.elementsFromPoint(x,y).slice(0,8).map(n=>({tag:n.tagName,id:n.id,class:String(n.className).slice(0,100),pe:getComputedStyle(n).pointerEvents}))};
    })(),
    overlays:[...document.querySelectorAll("[role=dialog],.modal,#badgeModal,.hg-popup")].slice(0,12).map(n=>({id:n.id,display:getComputedStyle(n).display,rect:n.getBoundingClientRect().toJSON?.(),hidden:n.hidden,aria:n.getAttribute("aria-hidden")}))};
});
let failures = [];
try {
 for(const [name,engine,width,height] of [["chromium",chromium,1024,900],["webkit",webkit,820,1180]]){
   let browser;
   try{
     browser=await engine.launch({headless:true});
     const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,locale:"nb-NO"});
     const page=await ctx.newPage();
     // Returning visitor: the first-visit welcome is intentionally not open.
     await page.addInitScript(() => localStorage.setItem("hg_onboarding_shown_v1", "1"));
     const errors=[];
     page.on("pageerror",e=>errors.push("PAGEERROR "+String(e).slice(0,400)));
     page.on("console",m=>{if(m.type()==="error")errors.push("CONSOLE "+m.text().slice(0,350));});
     page.on("requestfailed",r=>{if(errors.length<25)errors.push("FAILED "+r.url().slice(0,100)+" "+r.failure());});
     await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
     try{await page.waitForFunction(()=>window.__HG_APP_READY__ || window.__HG_APP_LOAD_ERROR__,{timeout:23000});}catch{}
     const before=await description(page);
     console.log("FULL INDEX STATE "+name+" "+JSON.stringify(before));
     console.log("FULL INDEX ERRORS "+name+" "+JSON.stringify(errors.slice(0,30)));
     let clickResult;
     try{
       const currentPoint=await page.evaluate(() => {
         const b=document.getElementById("nearbyExploreToggle").getBoundingClientRect();
         return {x:b.left+b.width/2,y:b.top+b.height/2};
       });
       await page.touchscreen.tap(currentPoint.x,currentPoint.y);
       await page.waitForTimeout(450);
       clickResult={physical:"touchscreen.tap",point:currentPoint,expanded:await page.locator("#nearbyExploreToggle").getAttribute("aria-expanded")};
     }catch(e){clickResult={physical:"failed",error:String(e).slice(0,6500),after:await description(page)};}
     console.log("FULL INDEX CLICK "+name+" "+JSON.stringify(clickResult));
     await page.evaluate(()=>window.HGNearbyDrawer?.close?.());
     let badgeResult;
     try {
       const point = await page.evaluate(() => {
         const b=document.querySelector(".hg-map-category-trigger").getBoundingClientRect();
         const x=b.left+b.width/2,y=b.top+b.height/2;
         const element=document.elementFromPoint(x,y);
         return {x,y,target:element?.outerHTML?.slice(0,160)};
       });
       await page.touchscreen.tap(point.x,point.y);
       await page.waitForTimeout(350);
       badgeResult={point,expanded:await page.locator(".hg-map-category-trigger").getAttribute("aria-expanded"),
         overlay:await page.evaluate(()=>document.getElementById("hgMapCategoryOptions")?.hidden)};
     }catch(e){badgeResult={error:String(e).slice(0,1300)};}
     console.log("FULL INDEX BADGETAP "+name+" "+JSON.stringify(badgeResult));
     let force;
     try{
       force=await page.evaluate(()=>{const b=document.getElementById("nearbyExploreToggle");if(!b)return "missing";b.click();return b.getAttribute("aria-expanded");});
     }catch(e){force=String(e);}
     console.log("FULL INDEX DOMCLICK "+name+" "+JSON.stringify(force));
     if(!before.ready || clickResult.physical!=="touchscreen.tap" || clickResult.expanded!=="true" || !before.mapCenter.mapReceivesTap || badgeResult.expanded!=="true")
       failures.push({name,ready:before.ready,error:before.load_error,mapCenter:before.mapCenter,click:clickResult,badge:badgeResult,dom:force});
     await ctx.close();
   }catch(e){failures.push({name,error:String(e)});console.log("BROWSER "+name+" ERROR "+String(e));}
   finally{await browser?.close();}
 }
}finally{await new Promise(r=>server.close(r));}
assert.deepEqual(failures,[],"The real index must initialize and receive user taps: "+JSON.stringify(failures));
