import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {chromium} from "playwright";
const root=process.cwd();
const place=JSON.parse(fs.readFileSync(path.join(root,"data/places/by/oslo/places/aker_brygge.json"),"utf8"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".jpg":"image/jpeg",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer((request,response)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);}catch{response.writeHead(400).end();return;}
 const file=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end("Not found");return;}
 response.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
 fs.createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const out=path.join(root,"artifacts/aker-brygge-v1-browser");fs.mkdirSync(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const viewport of [{width:390,height:844,mobile:true},{width:1440,height:960,mobile:false}]){
  const tag=viewport.mobile?"mobile":"desktop";
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.mobile,hasTouch:viewport.mobile,locale:"nb-NO"});
  const page=await context.newPage(),errors=[];page.on("pageerror",err=>errors.push(String(err.message)));
  await context.addInitScript(()=>{localStorage.setItem("hg_onboarding_shown_v1","1");localStorage.setItem("HG_TEST_MODE","1");localStorage.setItem("hg_lang","nb");});
  try{
    await page.goto(base+"/index.html?hgTest=1#/place/aker_brygge",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.getElementById("placeCard")?.dataset.currentPlaceId==="aker_brygge",null,{timeout:90000});
    await page.waitForFunction(()=>{
      const h=document.getElementById("pcHeaderImage"),f=document.getElementById("pcFrontImage");
      return h?.complete&&h.naturalWidth>0&&f?.complete&&f.naturalWidth>0;
    },null,{timeout:40000});
    // Hydration and icon-layout updates are asynchronous: wait for the
    // actual People image preview, not an intermediate zero-count state.
    await page.waitForFunction(()=>{
      const icon=document.getElementById("pcPeopleIcon");
      const img=icon?.querySelector(":scope > img.pc-person-img");
      return img?.complete&&img.naturalWidth>0
        &&document.getElementById("placeCard")?.dataset.collectionCount==="1";
    },null,{timeout:40000});
    const result=await page.evaluate(()=>{
      const card=document.getElementById("placeCard"),h=document.getElementById("pcHeaderImage"),f=document.getElementById("pcFrontImage");
      const brands=document.getElementById("pcBrandsIcon"),people=document.getElementById("pcPeopleIcon");
      return {hero:h?.getAttribute("src"),front:f?.getAttribute("src"),profile:card?.dataset.collectionProfileSource,count:card?.dataset.collectionCount,grid:card?.dataset.collectionGridCount,peoplePreview:people?.querySelector("img.pc-person-img")?.getAttribute("src"),brandsVisible:!!brands&&!brands.hidden,peopleVisible:!!people&&!people.hidden};
    });
    assert.ok(result.hero?.endsWith(place.image),tag+": hero path "+result.hero);
    assert.ok(result.front?.endsWith(place.frontImage),tag+": front path "+result.front);
    assert.equal(result.profile,"place_card_profile_v2_curated",tag+": canonical curated profile");
    assert.equal(result.count,"1",tag+": one image-ready People collection");
    assert.equal(result.grid,"0",tag+": no empty grid collections");
    assert.ok(!result.brandsVisible&&result.peopleVisible,tag+": no empty Brands preview; People visible");
    assert.ok(result.peoplePreview?.startsWith("bilder/kort/people/"),tag+": real People preview image");
    await page.waitForFunction(()=>document.querySelector("#pcFrontCardFlip")?.classList.contains("has-quiz-card")||!!document.querySelector("#pcQuizCardContent .pc-rendered-quiz-card"),null,{timeout:40000});
    await page.locator("#pcFrontCardFlip").click({timeout:20000});
    await page.waitForFunction(()=>document.querySelector("#pcFrontCardFlip")?.classList.contains("is-flipped"),null,{timeout:10000});
    assert.equal(errors.length,0,tag+": JavaScript errors: "+errors.join(" | "));
    await page.screenshot({path:path.join(out,tag+"-aker-brygge.png"),fullPage:false});
    console.log(tag.toUpperCase()+"_AKER_BRYGGE_V1_PASS "+JSON.stringify(result));
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
