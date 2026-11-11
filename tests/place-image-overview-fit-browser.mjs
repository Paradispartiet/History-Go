#!/usr/bin/env node
// Regression: canonical Place.image and Place.frontImage never lose their
// overview to object-fit:cover, at phone/tablet/desktop widths.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
assert.match(index, /css\/place-image-framing\.css\?v=20261111-overview-fit1/);
assert.match(worker, /hg-sw-2026-11-11-place-image-fit1/);
assert.match(worker, /css\/place-image-framing\.css/);

const image = (w, h, color) =>
  'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+
    '" viewBox="0 0 '+w+' '+h+'"><rect width="'+w+'" height="'+h+
    '" fill="'+color+'"/><rect x="18" y="18" width="'+(w-36)+
    '" height="'+(h-36)+'" fill="none" stroke="white" stroke-width="30"/></svg>'
  );
const landscape = image(1200, 675, '#526e8b');
const portrait = image(900, 1200, '#855f6e');
const fixture = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css">
<link rel="stylesheet" href="/css/place-sheet.css">
<link rel="stylesheet" href="/css/place-popup-v2.css">
<link rel="stylesheet" href="/css/place-card-editorial-polish.css">
<link rel="stylesheet" href="/css/place-image-framing.css">
<style>
body{margin:0;background:#0d121a;color:white}
#placeCard{position:relative!important;display:block!important;top:auto!important;left:auto!important;width:100%!important;max-width:900px!important;margin:auto}
.pc-heading-hero{height:200px;min-height:200px!important}
.pc-sheet-hero-media .pc-frontcard{float:none!important;width:240px!important;max-width:240px!important}
.hg-place-popup-v2{position:relative!important;visibility:visible!important;display:block!important;opacity:1!important;width:100%!important;max-width:900px!important}
.hg-place-hero-media{height:200px!important;min-height:200px!important}
.pc-round{width:65px;height:65px}
.pc-sheet-canonical-before-after figure{max-width:300px}
</style>
</head><body class="hg-app">
<div id="placeCard" class="is-unified-place is-place-sheet-phase1 is-place-sheet-direct is-open">
 <div id="pcHeaderHero" class="pc-heading-hero has-photo-source has-image">
  <img id="pcHeaderImage" class="pc-heading-image" src="${landscape}">
  <div class="pc-heading-content">Oversiktsbilde</div>
 </div>
 <div class="pc-sheet-hero-media">
  <div class="pc-frontcard"><div class="pc-card-face pc-card-face-front">
   <img id="pcFrontImage" src="${portrait}">
  </div><div class="pc-card-face pc-card-face-back">
   <img class="pc-quiz-card-image" id="quizArtwork" src="${portrait}">
  </div></div>
 </div>
 <div class="pc-sheet-canonical-before-after"><figure><img id="beforePhoto" src="${landscape}"></figure></div>
 <div class="pc-icons-quad"><div class="pc-round"><img id="roundBadge" src="${portrait}"></div></div>
</div>
<div class="hg-place-popup-v2">
 <div class="hg-place-hero-media"><img id="legacyHero" class="hg-place-hero-image" src="${landscape}"></div>
</div></body></html>`;

const server = http.createServer((request,response)=>{
 const pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
 if(pathname==='/__overview__/test.html'){
   response.writeHead(200,{'content-type':'text/html; charset=utf-8'});
   response.end(fixture);return;
 }
 if(!/^\/css\/[a-zA-Z0-9_.-]+\.css$/.test(pathname)){
   response.writeHead(404);response.end('missing');return;
 }
 const filename=path.resolve(root,'.'+pathname);
 if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)){
   response.writeHead(404);response.end('missing');return;
 }
 response.writeHead(200,{'content-type':'text/css; charset=utf-8'});
 fs.createReadStream(filename).pipe(response);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/__overview__/test.html';
let browser;
try{
 browser=await chromium.launch({
  headless:true,executablePath:process.env.CHROME_BIN||undefined,
  args:['--no-sandbox','--disable-dev-shm-usage']
 });
 for(const width of [320,390,900,1440]){
   const page=await browser.newPage({viewport:{width,height:1000}});
   await page.goto(url,{waitUntil:'load',timeout:30000});
   for(const [selector,expected] of [
     ['#pcHeaderImage','contain'],['#pcFrontImage','contain'],
     ['#legacyHero','contain'],['#beforePhoto','contain'],
     ['#quizArtwork','contain']
   ]){
     const values=await page.locator(selector).evaluate(img=>({
       fit:getComputedStyle(img).objectFit,
       ready:img.complete&&img.naturalWidth>0,
       natural:[img.naturalWidth,img.naturalHeight],
       box:[img.getBoundingClientRect().width,img.getBoundingClientRect().height]
     }));
     assert.equal(values.fit,expected,selector+' fit at '+width);
     assert.ok(values.ready,selector+' should load at '+width);
     assert.ok(values.box[0]>0&&values.box[1]>0,selector+' must occupy real layout at '+width);
   }
   const badgeFit=await page.locator('#roundBadge').evaluate(img=>getComputedStyle(img).objectFit);
   assert.notEqual(badgeFit,'contain','round badges remain independently governed');
   console.log(width+'px: full Place.image, frontImage, popup, comparison and QuizCard fit PASS');
   await page.close();
 }
} finally {
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
