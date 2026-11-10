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
    body_classes:document.body.className,html_classes:document.documentElement.className,
    map:!!window.HGMap?.getMap?.(),mapUnavailable:el("#map")?.dataset.mapUnavailable,initLeftPanel:typeof window.initLeftPanel,
    markerCount:document.querySelectorAll(".hg-place-detail-marker,.hg-place-area-marker").length,
    nearby:hit("#nearbyExploreToggle"),dock:hit(".hg-map-category-trigger"),
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
       const target=page.locator("#nearbyExploreToggle");
       if(before.nearby && !before.nearby.missing && before.nearby.rect.w>0){
         await target.click({timeout:4500});
         clickResult={physical:"ok",expanded:await target.getAttribute("aria-expanded")};
       }else clickResult={physical:"unavailable"};
     }catch(e){clickResult={physical:"failed",error:String(e).slice(0,1400)};}
     console.log("FULL INDEX CLICK "+name+" "+JSON.stringify(clickResult));
     let force;
     try{
       force=await page.evaluate(()=>{const b=document.getElementById("nearbyExploreToggle");if(!b)return "missing";b.click();return b.getAttribute("aria-expanded");});
     }catch(e){force=String(e);}
     console.log("FULL INDEX DOMCLICK "+name+" "+JSON.stringify(force));
     if(!before.ready || clickResult.physical!=="ok" || clickResult.expanded!=="true")
       failures.push({name,ready:before.ready,error:before.load_error,click:clickResult,dom:force});
     await ctx.close();
   }catch(e){failures.push({name,error:String(e)});console.log("BROWSER "+name+" ERROR "+String(e));}
   finally{await browser?.close();}
 }
}finally{await new Promise(r=>server.close(r));}
assert.deepEqual(failures,[],"The real index must initialize and receive user taps: "+JSON.stringify(failures));
