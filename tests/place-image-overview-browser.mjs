#!/usr/bin/env node
/* Global PlaceCard overview framing regression: never crop image/frontImage. */
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root=process.cwd();
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
  const uri=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=path.resolve(root,"."+(uri==="/"?"/index.html":uri));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end("not found");return;
  }
  res.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
fs.mkdirSync("artifacts/place-image-overview",{recursive:true});
let browser;
try {
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
  for(const [label,width,height,mobile] of [["mobile",390,844,true],["desktop",1440,1000,false]]){
    const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:"nb-NO",reducedMotion:"reduce"});
    await ctx.addInitScript(()=>{localStorage.setItem("hg_onboarding_shown_v1","1");localStorage.setItem("HG_TEST_MODE","1");});
    const page=await ctx.newPage();
    const errors=[];
    page.on("pageerror",e=>errors.push(String(e)));
    try {
      await page.goto(base+"/index.html?hgTest=1#/place/tinghuset",{waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&document.querySelector("#placeCard")?.dataset.currentPlaceId==="tinghuset",null,{timeout:90000});
      await page.waitForFunction(()=>{
        const h=document.querySelector("#pcHeaderImage"),f=document.querySelector("#pcFrontImage");
        return [h,f].every(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0);
      },null,{timeout:70000});
      await page.waitForFunction(()=>{
        const h=document.querySelector("#pcHeaderHero"),f=document.querySelector("#pcFrontImage")?.closest(".pc-card-face-front");
        return [h,f].every(el=>el?.style.getPropertyValue("--hg-place-overview-backdrop").startsWith("url("));
      },null,{timeout:20000});
      const result=await page.evaluate(()=>{
        const checks={};
        for(const [key,selector] of [["hero","#pcHeaderImage"],["front","#pcFrontImage"]]){
          const img=document.querySelector(selector),style=getComputedStyle(img);
          const rect=img.getBoundingClientRect();
          const ratio=img.naturalWidth/img.naturalHeight;
          const target=rect.width/rect.height;
          checks[key]={objectFit:style.objectFit,objectPosition:style.objectPosition,source:img.getAttribute("src"),natural:[img.naturalWidth,img.naturalHeight],frame:[rect.width,rect.height],aspectRatio:ratio,frameRatio:target};
        }
        return checks;
      });
      for(const [key,value] of Object.entries(result)){
        assert.equal(value.objectFit,"contain",label+" "+key+" is still cropped/zoomed");
        assert.equal(value.objectPosition,"50% 50%",label+" "+key+" must center full motif");
        assert.ok(value.natural[0]>0&&value.frame[0]>0,label+" "+key+" image invalid");
      }
      const flip=page.locator("#pcFrontCardFlip");
      await flip.scrollIntoViewIfNeeded();
      await flip.click();
      assert.equal(await flip.evaluate(el=>el.classList.contains("is-flipped")),true,label+" QuizCard flip");
      await flip.click();
      assert.equal(await flip.evaluate(el=>el.classList.contains("is-flipped")),false,label+" QuizCard returns");
      await page.screenshot({path:"artifacts/place-image-overview/"+label+"-tinghuset.png"});
      // Alternative popup also uses no-crop. Test its actual CSS in the DOM,
      // without changing or opening the app's navigation state.
      const popupFit=await page.evaluate(()=>{
        const box=document.createElement("div");
        box.className="hg-place-popup-v2";
        const media=document.createElement("div");media.className="hg-place-hero-media";
        const img=document.createElement("img");img.className="hg-place-hero-image";
        media.append(img);box.append(media);document.body.append(box);
        const fit=getComputedStyle(img).objectFit;
        box.remove();return fit;
      });
      assert.equal(popupFit,"contain","Alternate place popup must preserve full image");
      assert.deepEqual(errors,[],"Page errors at "+label);
      fs.writeFileSync("artifacts/place-image-overview/"+label+".json",JSON.stringify({label,result,popupFit,quizCard:"PASS",pageErrors:errors},null,2)+"\n");
      console.log(label+" — full uncropped image/frontImage, automatic photo matte, QuizCard and popup contract PASS");
    }finally{await ctx.close();}
  }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
