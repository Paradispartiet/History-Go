#!/usr/bin/env node
// Reproduce real History Go index touch routing, not detached UI fixtures.
// Run with Playwright Chromium and WebKit; output elementFromPoint and event receipt.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, webkit } from "playwright";

const root=process.cwd();
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
  const requested=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=path.resolve(root,"."+ (requested==="/"?"/index.html":requested));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end("not found");return;
  }
  res.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const report=[];
let browser;
function isTarget(node,selector){return node?.matches?.(selector)||node?.closest?.(selector);}
async function inspect(page,selector,label){
  const detail=await page.evaluate(selector=>{
    const el=document.querySelector(selector);
    if(!el)return {missing:true,selector};
    const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    const stack=document.elementsFromPoint(x,y).slice(0,10).map(node=>({
      tag:node.tagName,id:node.id,cls:typeof node.className==="string"?node.className.slice(0,125):"",
      pe:getComputedStyle(node).pointerEvents,z:getComputedStyle(node).zIndex,
      opacity:getComputedStyle(node).opacity,display:getComputedStyle(node).display
    }));
    return {selector,rect:{x:r.x,y:r.y,width:r.width,height:r.height},top:stack[0],stack,
      visible:r.width>0&&r.height>0,style:{display:getComputedStyle(el).display,pointerEvents:getComputedStyle(el).pointerEvents},
      boot:{ready:window.__HG_APP_READY__,router:window.__HG_ROUTER_STARTED__,map:!!window.HGMap?.getMap?.(),mapMode:document.body.className},
      topTenFixed:[...document.querySelectorAll("body > *")].map(node=>({
        tag:node.tagName,id:node.id,className:typeof node.className==="string"?node.className:"",
        display:getComputedStyle(node).display,pe:getComputedStyle(node).pointerEvents,
        opacity:getComputedStyle(node).opacity,z:getComputedStyle(node).zIndex
      })).filter(z=>z.display!=="none").slice(0,22)};
  },selector);
  console.log("INDEX HIT "+label+" "+JSON.stringify(detail));
  return detail;
}
try{
  for(const [engineName,engine,width,height] of [["webkit-ipad",webkit,820,1180],["chromium-phone",chromium,390,844]]){
    browser=await engine.launch({headless:true});
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,locale:"nb-NO"});
    await context.addInitScript(()=>{
      localStorage.setItem("HG_TEST_MODE","1");
      localStorage.setItem("hg_onboarding_shown_v1","1");
      localStorage.setItem("hg_map_favorites_only_v1","0");
    });
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("console",msg=>{if(msg.type()==="error")errors.push(msg.text().slice(0,300));});
    try {
      await page.goto(base+"/index.html?hgTest=1#/",{waitUntil:"domcontentloaded",timeout:70000});
      await page.waitForFunction(()=>window.__HG_APP_READY__===true,null,{timeout:90000});
      await page.waitForTimeout(1200);
      await inspect(page,"#nearbyExploreToggle",engineName+" initial Explore");
      let exploreClicked=false,mapClicked=false,badgeClicked=false;
      try{
        await page.locator("#nearbyExploreToggle").click({timeout:9000});
        await page.waitForTimeout(400);
        exploreClicked=await page.locator("#nearbyExploreToggle").getAttribute("aria-expanded")==="true";
      }catch(e){console.error("EXPLORE CLICK ERROR "+engineName+" "+String(e).slice(0,2200));}
      console.log("INDEX EXPLORE RESULT "+engineName+" "+exploreClicked);
      await inspect(page,"#nearbyExploreToggle",engineName+" after Explore");
      // The same rendered map must still be reachable after opening the drawer.
      await page.evaluate(()=>window.HGNearbyDrawer?.close?.());
      await inspect(page,"#btnSeeMap",engineName+" before map-mode");
      try{
        await page.locator("#btnSeeMap").click({timeout:9000});
        await page.waitForTimeout(800);
      }catch(e){console.error("MAP CLICK ERROR "+engineName+" "+String(e).slice(0,2200));}
      mapClicked=await page.evaluate(()=>document.body.classList.contains("mode-map")||document.body.classList.contains("map-only"));
      console.log("INDEX MAP RESULT "+engineName+" "+mapClicked);
      await inspect(page,".hg-map-category-trigger",engineName+" badge");
      try{
        const b=page.locator(".hg-map-category-trigger");
        await b.click({timeout:9000});
        await page.waitForTimeout(350);
        badgeClicked=await b.getAttribute("aria-expanded")==="true";
      }catch(e){console.error("BADGE CLICK ERROR "+engineName+" "+String(e).slice(0,2200));}
      console.log("INDEX BADGE RESULT "+engineName+" "+badgeClicked+" errors="+JSON.stringify(errors.slice(0,12)));
      await page.locator(".hg-map-category-trigger").click({timeout:9000});
      await page.evaluate(()=>{
        const map=window.HGMap?.getMap?.();
        if(map?.jumpTo) map.jumpTo({center:[10.759,59.922],zoom:16});
      });
      await page.waitForTimeout(1200);
      const markerProbe=await page.evaluate(()=>{
        const map=window.HGMap?.getMap?.();
        const layers=["hg-places-hit","hg-place-areas-hit"].filter(id=>!!map?.getLayer?.(id));
        const markers=[...document.querySelectorAll(".hg-place-detail-marker, .hg-place-area-marker")]
          .map(el=>{
            const r=el.getBoundingClientRect();
            return {id:el.dataset.placeId,x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};
          }).filter(m=>m.x>35&&m.x<innerWidth-130&&m.y>90&&m.y<innerHeight-150&&m.w>0)
          .map(m=>({
            ...m,
            hit:layers.length?map.queryRenderedFeatures([m.x,m.y],{layers}).map(f=>f.properties?.id).slice(0,5):[],
            top:document.elementFromPoint(m.x,m.y)?.id||document.elementFromPoint(m.x,m.y)?.className||""
          }));
        const selected=markers.find(m=>m.hit.length)||markers[0]||null;
        const center={x:innerWidth*.45,y:innerHeight*.43};
        const stack=document.elementsFromPoint(center.x,center.y).slice(0,8).map(e=>e.id||e.className||e.tagName);
        return {layers,handlers:!!map?.__hgPlaceHandlers,markers:markers.slice(0,10),selected,center,centerStack:stack,
          panelRect:(()=>{const e=document.getElementById("panel");const r=e?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height,display:getComputedStyle(e).display,pe:getComputedStyle(e).pointerEvents}:null;})()};
      });
      console.log("INDEX MAP MARKER PROBE "+engineName+" "+JSON.stringify(markerProbe));
      let placeOpened=false;
      if(markerProbe.selected){
        await page.touchscreen.tap(markerProbe.selected.x,markerProbe.selected.y);
        await page.waitForTimeout(2300);
        placeOpened=await page.evaluate(()=>location.hash.includes("#/place/")||!!document.getElementById("placeCard")?.dataset.currentPlaceId);
      }
      console.log("INDEX MARKER TAP RESULT "+engineName+" "+placeOpened+" hash="+await page.evaluate(()=>location.hash));
      report.push({engineName,exploreClicked,mapClicked,badgeClicked,placeOpened,markerProbe,errors:errors.slice(0,12)});
    }catch(e){
      console.error("INDEX TEST FATAL "+engineName+" "+String(e.stack||e).slice(0,5000));
      report.push({engineName,fatal:String(e.stack||e),errors});
    }finally{await context.close();await browser.close();browser=null;}
  }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
console.log("INDEX CLICK REPORT "+JSON.stringify(report));
assert.equal(report.length,2);
assert.ok(report.every(r=>r.exploreClicked&&r.mapClicked&&r.badgeClicked&&r.placeOpened),
  "A real page must handle Explore, map, and category badge taps on iPad/WebKit and phone/Chromium");
