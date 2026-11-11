#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const root = process.cwd();
const mime = {".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server = http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const target = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    res.writeHead(404); res.end("not found"); return;
  }
  res.writeHead(200, {"content-type": mime[path.extname(target).toLowerCase()] || "application/octet-stream"});
  fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
fs.mkdirSync("artifacts/placecard-overview-framing", {recursive:true});

let browser;
try {
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
  for(const [device,width,height,mobile] of [["mobile",390,844,true],["desktop",1440,1000,false]]) {
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,locale:"nb-NO",reducedMotion:"reduce"});
    await context.addInitScript(()=>{localStorage.setItem("hg_onboarding_shown_v1","1");localStorage.setItem("HG_TEST_MODE","1");});
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",err=>errors.push(String(err)));
    try {
      for(const id of ["tinghuset","toyen_torg"]) {
        await page.goto(origin+"/index.html?hgTest=1#/place/"+id,{waitUntil:"domcontentloaded",timeout:90000});
        await page.waitForFunction(id=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true &&
          document.querySelector("#placeCard")?.dataset.currentPlaceId===id,id,{timeout:90000});
        await page.waitForFunction(()=>{
          const front=document.querySelector("#pcFrontImage"),hero=document.querySelector("#pcHeaderImage");
          return front?.complete && front.naturalWidth>0 && hero?.complete && hero.naturalWidth>0 &&
            document.querySelector(".pc-card-face-front")?.dataset.mediaState==="ready";
        },null,{timeout:90000});
        await page.waitForFunction(()=>{
          const front=document.querySelector("#pcFrontImage"),hero=document.querySelector("#pcHeaderImage");
          return getComputedStyle(front).objectFit==="contain" &&
            getComputedStyle(hero).objectFit==="contain" &&
            getComputedStyle(document.querySelector(".pc-heading-hero"),"::before").backgroundImage!=="none";
        },null,{timeout:15000});
        const media=await page.evaluate(()=>{
          const front=document.querySelector("#pcFrontImage"),hero=document.querySelector("#pcHeaderImage");
          const frontFace=front.closest(".pc-card-face-front"),heroBox=document.querySelector(".pc-heading-hero");
          const item=img=>({
            natural:[img.naturalWidth,img.naturalHeight],
            frame:[Math.round(img.getBoundingClientRect().width),Math.round(img.getBoundingClientRect().height)],
            objectFit:getComputedStyle(img).objectFit,
            objectPosition:getComputedStyle(img).objectPosition,
            loaded:img.complete&&img.naturalWidth>0
          });
          return {
            front:item(front),hero:item(hero),
            frontBackdrop:getComputedStyle(frontFace,"::after").backgroundImage,
            heroBackdrop:getComputedStyle(heroBox,"::before").backgroundImage,
            gradientPointer:getComputedStyle(heroBox,"::after").pointerEvents,
            backdropPointer:getComputedStyle(heroBox,"::before").pointerEvents,
            currentPlace:document.querySelector("#placeCard").dataset.currentPlaceId
          };
        });
        assert.equal(media.currentPlace,id);
        assert.equal(media.front.objectFit,"contain",id+" front must not crop");
        assert.equal(media.hero.objectFit,"contain",id+" heading must not crop");
        assert.ok(media.front.loaded&&media.hero.loaded,id+" images must load");
        assert.match(media.frontBackdrop,/url\(/i,id+" front margins need a photo backdrop");
        assert.match(media.heroBackdrop,/url\(/i,id+" heading margins need a photo backdrop");
        assert.equal(media.gradientPointer,"none","photo gradient cannot block clicks");
        assert.equal(media.backdropPointer,"none","blurred backdrop cannot block clicks");
        await page.screenshot({path:"artifacts/placecard-overview-framing/"+device+"-"+id+".png"});
        if(id==="tinghuset"){
          await page.waitForFunction(()=>document.querySelector("#pcFrontCardFlip")?.classList.contains("has-quiz-card"),null,{timeout:70000});
          const card=page.locator("#pcFrontCardFlip");
          await card.click();
          assert.equal(await card.evaluate(el=>el.classList.contains("is-flipped")),true,"QuizCard front/back flip intact");
          await card.click();
          assert.equal(await card.evaluate(el=>el.classList.contains("is-flipped")),false);
        }
        assert.deepEqual(errors,[],device+" "+id+" unexpected JS errors");
        console.log(device+" "+id+" overview image framing PASS "+JSON.stringify(media));
      }
    } finally { await context.close(); }
  }
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
