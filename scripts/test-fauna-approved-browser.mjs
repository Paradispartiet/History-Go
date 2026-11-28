import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const artifacts=path.join(root,"artifacts","fauna-approval");
fs.mkdirSync(artifacts,{recursive:true});
const mime={".html":"text/html",".js":"application/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url||"/","http://127.0.0.1").pathname),filename=path.resolve(root,"."+pathname);
 if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream"});fs.createReadStream(filename).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
let browser;
try {
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const width of [390,1440]){
  for(const broken of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(broken)await context.route("**/bilder/natur/fauna/godkjent/01_graaspurv_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Gråspurv");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Gråspurv,/i}).first();
   await card.waitFor();
   if(broken){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Never substitute photographs for a failed original");
   } else {
    await card.locator("img").evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await card.locator("img").getAttribute("src")).endsWith("01_graaspurv_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await card.locator("img").evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"graaspurv-card-"+width+".png")});
   }
   await card.click();
   await page.locator("#natureDialog").waitFor({state:"visible"});
   if(broken)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds && bounds.width<=width);
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"graaspurv-detail-"+width+".png")});
   }
   await context.close();
  }
  // Kråke #2: approved transparent original, full image on black, fallback on failure.
  for(const brokenCrow of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenCrow)await context.route("**/bilder/natur/fauna/godkjent/02_kraake_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Kråke");
   const crow=page.locator("#natureGrid").getByRole("button",{name:/^Kråke,/i}).first();
   await crow.waitFor();
   if(brokenCrow){
    await crow.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await crow.locator("img").count(),0,"Kråke: never substitute photos");
   }else{
    const img=crow.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("02_kraake_v1.webp"));
    assert.equal(await crow.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await crow.screenshot({path:path.join(artifacts,"kraake-card-"+width+".png")});
   }
   await crow.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenCrow)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Kråke: dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"kraake-detail-"+width+".png")});
   }
   await context.close();
  }
  // Skjære #3: approved transparent original, full image on black, fallback on failure.
  for(const brokenMagpie of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenMagpie)await context.route("**/bilder/natur/fauna/godkjent/03_skjaere_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Skjære");
   const magpie=page.locator("#natureGrid").getByRole("button",{name:/^Skjære,/i}).first();
   await magpie.waitFor();
   if(brokenMagpie){
    await magpie.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await magpie.locator("img").count(),0,"Skjære: never substitute photos");
   }else{
    const img=magpie.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("03_skjaere_v1.webp"));
    assert.equal(await magpie.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await magpie.screenshot({path:path.join(artifacts,"skjaere-card-"+width+".png")});
   }
   await magpie.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenMagpie)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Skjære: dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"skjaere-detail-"+width+".png")});
   }
   await context.close();
  }

  // Svarttrost #4: male and female original on black background; failure shows no photo.
  for(const brokenBlackbird of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenBlackbird)await context.route("**/bilder/natur/fauna/godkjent/04_svarttrost_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Svarttrost");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Svarttrost,/i}).first();
   await card.waitFor();
   if(brokenBlackbird){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Svarttrost: never substitute photographs");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("04_svarttrost_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"svarttrost-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenBlackbird)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Svarttrost detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"svarttrost-detail-"+width+".png")});
   }
   await context.close();
  }
  // Blåmeis #5: approved original on black at mobile/desktop; broken image never substitutes a photo.
  for(const brokenBlueTit of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenBlueTit)await context.route("**/bilder/natur/fauna/godkjent/05_blaameis_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Blåmeis");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Blåmeis,/i}).first();
   await card.waitFor();
   if(brokenBlueTit){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Blåmeis: never substitute photo");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("05_blaameis_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"blaameis-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenBlueTit)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else {
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Blåmeis detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"blaameis-detail-"+width+".png")});
   }
   await context.close();
  }
  // Kjøttmeis #6: new transparent original, complete detail and fallback on mobile and desktop.
  for(const brokenGreatTit of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGreatTit)await context.route("**/bilder/natur/fauna/godkjent/06_kjottmeis_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Kjøttmeis");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Kjøttmeis,/i}).first();
   await card.waitFor();
   if(brokenGreatTit){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Kjøttmeis: never substitute photos");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("06_kjottmeis_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"kjottmeis-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGreatTit)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Kjøttmeis detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"kjottmeis-detail-"+width+".png")});
   }
   await context.close();
  }
  // Ringdue #7: individually approved original, full picture on black, mobile/desktop and broken-file fallback.
  for(const brokenWoodPigeon of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenWoodPigeon)await context.route("**/bilder/natur/fauna/godkjent/07_ringdue_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Ringdue");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Ringdue,/i}).first();
   await card.waitFor();
   if(brokenWoodPigeon){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Ringdue: never substitute photographs");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("07_ringdue_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"ringdue-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenWoodPigeon)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Ringdue detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"ringdue-detail-"+width+".png")});
   }
   await context.close();
  }
  // Stokkand #8: original male and female, black background and error fallback at 390/1440px.
  for(const brokenMallard of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenMallard)await context.route("**/bilder/natur/fauna/godkjent/08_stokkand_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Stokkand");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Stokkand,/i}).first();
   await card.waitFor();
   if(brokenMallard){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Stokkand: never substitute photographs");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("08_stokkand_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"stokkand-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenMallard){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   } else {
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Stokkand detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"stokkand-detail-"+width+".png")});
   }
   await context.close();
  }
  // Gråmåke #9: individually approved adult gull, 390/1440px, black background, image-failure fallback.
  for(const brokenHerring of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenHerring)await context.route("**/bilder/natur/fauna/godkjent/09_graamaake_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Gråmåke");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Gråmåke,/i}).first();
   await card.waitFor();
   if(brokenHerring){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Gråmåke: never substitute photographs");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("09_graamaake_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"graamaake-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenHerring){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   } else {
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Gråmåke detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"graamaake-detail-"+width+".png")});
   }
   await context.close();
  }
  // Fiskemåke #10: adult Common Gull and individual alpha original, mobile/desktop and image failure.
  for(const brokenCommon of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenCommon)await context.route("**/bilder/natur/fauna/godkjent/10_fiskemaake_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Fiskemåke");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Fiskemåke,/i}).first();
   await card.waitFor();
   if(brokenCommon){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Fiskemåke: do not substitute photos");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("10_fiskemaake_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"fiskemaake-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenCommon)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Fiskemåke detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"fiskemaake-detail-"+width+".png")});
   }
   await context.close();
  }
  // Knoppsvane #11 (start våtmark/skog): true-alpha WebP, black contain, card/dialog and fallback at 390/1440 px.
  for(const brokenSwan of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenSwan)await context.route("**/bilder/natur/fauna/godkjent/11_knoppsvane_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Knoppsvane");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Knoppsvane,/i}).first();
   await card.waitFor();
   if(brokenSwan){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Knoppsvane must never fall back to photo");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("11_knoppsvane_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"knoppsvane-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenSwan){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Knoppsvane detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"knoppsvane-detail-"+width+".png")});
   }
   await context.close();
  }
  // Grågås #12: first migration from legacy SVG, original alpha WebP, 390/1440px and image-error fallback.
  for(const brokenGoose of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGoose)await context.route("**/bilder/natur/fauna/godkjent/12_graagaas_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Grågås");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Grågås,/i}).first();
   await card.waitFor();
   if(brokenGoose){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Grågås must not fall back to photographs");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("12_graagaas_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"graagaas-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGoose)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Grågås detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"graagaas-detail-"+width+".png")});
   }
   await context.close();
  }
  // Toppand #13: individually approved male and female on water; mobile/desktop with fallback.
  for(const brokenTufted of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenTufted)await context.route("**/bilder/natur/fauna/godkjent/13_toppand_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Toppand");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Toppand,/i}).first();
   await card.waitFor();
   if(brokenTufted){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Toppand: never substitute a photograph");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("13_toppand_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"toppand-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenTufted){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   } else {
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Toppand detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"toppand-detail-"+width+".png")});
   }
   await context.close();
  }
  // Sothøne #14: dark adult bird with white facial shield and lobed toes, responsive views and safe fallback.
  for(const brokenCoot of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenCoot)await context.route("**/bilder/natur/fauna/godkjent/14_sothone_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Sothøne");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Sothøne,/i}).first();
   await card.waitFor();
   if(brokenCoot){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Sothøne: never substitute photographs");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("14_sothone_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"sothone-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenCoot){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   } else {
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Sothøne dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"sothone-detail-"+width+".png")});
   }
   await context.close();
  }
  // Storskarv #15: original on black with full wings, safe fallback and responsive art view.
  for(const brokenCormorant of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenCormorant)await context.route("**/bilder/natur/fauna/godkjent/15_storskarv_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Storskarv");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Storskarv,/i}).first();
   await card.waitFor();
   if(brokenCormorant){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Storskarv: never replace with photographs");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("15_storskarv_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"storskarv-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenCormorant){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Storskarv dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"storskarv-detail-"+width+".png")});
   }
   await context.close();
  }
  // Hettemåke #16: two adults in summer plumage, standing and flying, responsive display and image-error fallback.
  for(const brokenBlackHeadedGull of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenBlackHeadedGull)await context.route("**/bilder/natur/fauna/godkjent/16_hettemaake_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Hettemåke");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Hettemåke,/i}).first();
   await card.waitFor();
   if(brokenBlackHeadedGull){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Hettemåke: never substitute photographs");
   } else {
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("16_hettemaake_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"hettemaake-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenBlackHeadedGull){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   } else {
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Hettemåke dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"hettemaake-detail-"+width+".png")});
   }
   await context.close();
  }
  // Sildemåke #17: original adult standing and flying, both responsive layouts and graceful fallback.
  for(const brokenLesserBlackBackedGull of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenLesserBlackBackedGull)await context.route("**/bilder/natur/fauna/godkjent/17_sildemaake_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Sildemåke");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Sildemåke,/i}).first();
   await card.waitFor();
   if(brokenLesserBlackBackedGull){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Sildemåke: never replace with a photo");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("17_sildemaake_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"sildemaake-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenLesserBlackBackedGull){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Sildemåke detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"sildemaake-detail-"+width+".png")});
   }
   await context.close();
  }
  // Gråhegre #18: original adult standing and flying with retracted neck, both responsive layouts and graceful fallback.
  for(const brokenGreyHeron of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGreyHeron)await context.route("**/bilder/natur/fauna/godkjent/18_graahegre_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Gråhegre");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Gråhegre,/i}).first();
   await card.waitFor();
   if(brokenGreyHeron){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Gråhegre: never replace with a photo");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("18_graahegre_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"graahegre-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGreyHeron){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Gråhegre detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"graahegre-detail-"+width+".png")});
   }
   await context.close();
  }
  // Flaggspett #19: male with red nape, female without, original alpha WebP in mobile and desktop and safe fallback.
  for(const brokenWoodpecker of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenWoodpecker)await context.route("**/bilder/natur/fauna/godkjent/19_flaggspett_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Flaggspett");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Flaggspett,/i}).first();
   await card.waitFor();
   if(brokenWoodpecker){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Flaggspett: do not fall back to photographs");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("19_flaggspett_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"flaggspett-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenWoodpecker){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Flaggspett dialog fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"flaggspett-detail-"+width+".png")});
   }
   await context.close();
  }
  // Grønnfink #20: adult male/female with yellow wing edges; black-background WebP and safe fallback.
  for(const brokenGreenfinch of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGreenfinch)await context.route("**/bilder/natur/fauna/godkjent/20_gronnfink_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Grønnfink");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Grønnfink,/i}).first();
   await card.waitFor();
   if(brokenGreenfinch){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Grønnfink: never substitute photographs");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("20_gronnfink_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"gronnfink-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGreenfinch)await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Grønnfink detail must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"gronnfink-detail-"+width+".png")});
   }
   await context.close();
  }
  // Rødstrupe #21: individually approved original; mobile/desktop black contain, dialog, and missing-image fallback.
  for(const brokenRobin of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenRobin)await context.route("**/bilder/natur/fauna/godkjent/21_rodstrupe_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Rødstrupe");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Rødstrupe,/i}).first();
   await card.waitFor();
   if(brokenRobin){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Rødstrupe: missing original must never fall back to a photograph");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("21_rodstrupe_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"rodstrupe-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenRobin){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Rødstrupe dialog fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"rodstrupe-detail-"+width+".png")});
   }
   await context.close();
  }
  // Gråtrost #22: adult fieldfare on branch; black-background WebP and safe fallback on mobile/desktop.
  for(const brokenFieldfare of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenFieldfare)await context.route("**/bilder/natur/fauna/godkjent/22_graatrost_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Gråtrost");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Gråtrost,/i}).first();
   await card.waitFor();
   if(brokenFieldfare){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Gråtrost: never replace a broken original with a photo");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("22_graatrost_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"graatrost-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenFieldfare){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Gråtrost detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"graatrost-detail-"+width+".png")});
   }
   await context.close();
  }
  // Linerle #23: original Norwegian white wagtail, mobile/desktop, black background and safe fallback.
  for(const brokenWagtail of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenWagtail)await context.route("**/bilder/natur/fauna/godkjent/23_linerle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Linerle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Linerle,/i}).first();
   await card.waitFor();
   if(brokenWagtail){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Linerle: no photo fallback");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("23_linerle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"linerle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenWagtail){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Linerle dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"linerle-detail-"+width+".png")});
   }
   await context.close();
  }
  // Spettmeis #24: head-first tree-climbing original, responsive preview and error fallback.
  for(const brokenNuthatch of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenNuthatch)await context.route("**/bilder/natur/fauna/godkjent/24_spettmeis_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Spettmeis");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Spettmeis,/i}).first();
   await card.waitFor();
   if(brokenNuthatch){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Spettmeis: no photo substitution");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("24_spettmeis_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"spettmeis-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenNuthatch){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Spettmeis detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"spettmeis-detail-"+width+".png")});
   }
   await context.close();
  }
  // Måltrost #25: head-first tree-climbing original, responsive preview and error fallback.
  for(const brokenSongThrush of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenSongThrush)await context.route("**/bilder/natur/fauna/godkjent/25_maaltrost_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Måltrost");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Måltrost,/i}).first();
   await card.waitFor();
   if(brokenSongThrush){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Måltrost: no photo substitution");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("25_maaltrost_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"maaltrost-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenSongThrush){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Måltrost detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"maaltrost-detail-"+width+".png")});
   }
   await context.close();
  }
  // Nøtteskrike #26: final approved WebP, black presentation, mobile/desktop and safe fallback.
  for(const brokenJay of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenJay)await context.route("**/bilder/natur/fauna/godkjent/26_notteskrike_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Nøtteskrike");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Nøtteskrike,/i}).first();
   await card.waitFor();
   if(brokenJay){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Nøtteskrike must not substitute a photograph");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("26_notteskrike_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"notteskrike-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenJay){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Nøtteskrike detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"notteskrike-detail-"+width+".png")});
   }
   await context.close();
  }
  // Pilfink #27: distinct black cheek spot, chestnut crown, true-alpha black background, safe fallback.
  for(const brokenTreeSparrow of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenTreeSparrow)await context.route("**/bilder/natur/fauna/godkjent/27_pilfink_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Pilfink");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Pilfink,/i}).first();
   await card.waitFor();
   if(brokenTreeSparrow){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Pilfink: no photo substitution");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("27_pilfink_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"pilfink-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenTreeSparrow){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Pilfink detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"pilfink-detail-"+width+".png")});
   }
   await context.close();
  }
  // Stillits #28: red mask and yellow wing bar on thistle, true-alpha black background, safe fallback.
  for(const brokenGoldfinch of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGoldfinch)await context.route("**/bilder/natur/fauna/godkjent/28_stillits_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Stillits");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Stillits,/i}).first();
   await card.waitFor();
   if(brokenGoldfinch){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Stillits: no photo substitution");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("28_stillits_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"stillits-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGoldfinch){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Stillits detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"stillits-detail-"+width+".png")});
   }
   await context.close();
  }
  // Kaie #29: authentic pale iris and silver nape, black contain and safe failure fallback.
  for(const brokenJackdaw of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenJackdaw)await context.route("**/bilder/natur/fauna/godkjent/29_kaie_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Kaie");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Kaie,/i}).first();
   await card.waitFor({timeout:15000});
   if(brokenJackdaw){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Kaie: do not substitute a photo");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("29_kaie_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"kaie-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenJackdaw){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Kaie dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"kaie-detail-"+width+".png")});
   }
   await context.close();
  }
  // Stær #30: yellow bill, iridescent purple/green spotted adult, correct black contain and fallback.
  for(const brokenStarling of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenStarling)await context.route("**/bilder/natur/fauna/godkjent/30_staer_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Stær");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Stær,/i}).first();
   await card.waitFor();
   if(brokenStarling){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Stær: no photo substitution when WebP fails");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("30_staer_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"staer-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenStarling){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Stær modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"staer-detail-"+width+".png")});
   }
   await context.close();
  }
  // Bokfink #31: adult male blue-grey head, rose-orange breast and two white wing bars.
  for(const brokenChaffinch of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenChaffinch)await context.route("**/bilder/natur/fauna/godkjent/31_bokfink_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Bokfink");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Bokfink,/i}).first();
   await card.waitFor();
   if(brokenChaffinch){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Bokfink: no photo substitution when WebP fails");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("31_bokfink_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"bokfink-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenChaffinch){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Bokfink modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"bokfink-detail-"+width+".png")});
   }
   await context.close();
  }
  // Tårnseiler #32: adult in flight, pointed scythe-wings, sooty plumage and pale throat.
  for(const brokenSwift of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenSwift)await context.route("**/bilder/natur/fauna/godkjent/32_taarnseiler_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Tårnseiler");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Tårnseiler,/i}).first();
   await card.waitFor();
   if(brokenSwift){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Tårnseiler: no photo substitution when WebP fails");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("32_taarnseiler_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"taarnseiler-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenSwift){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Tårnseiler modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"taarnseiler-detail-"+width+".png")});
   }
   await context.close();
  }
  // Hvitkinngås #33: adult Barnacle Goose with cream face, black neck and grey barred wings.
  for(const brokenGoose of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGoose)await context.route("**/bilder/natur/fauna/godkjent/33_hvitkinngaas_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Hvitkinngås");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Hvitkinngås,/i}).first();
   await card.waitFor();
   if(brokenGoose){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Hvitkinngås: no photo substitution when WebP fails");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("33_hvitkinngaas_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"hvitkinngaas-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGoose){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Hvitkinngås modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"hvitkinngaas-detail-"+width+".png")});
   }
   await context.close();
  }
  // Tjeld #33: adult Barnacle Oystercatcher with cream face, black neck and grey barred wings.
  for(const brokenOystercatcher of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenOystercatcher)await context.route("**/bilder/natur/fauna/godkjent/34_tjeld_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Tjeld");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Tjeld,/i}).first();
   await card.waitFor();
   if(brokenOystercatcher){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Tjeld: no photo substitution when WebP fails");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("34_tjeld_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"tjeld-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenOystercatcher){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Tjeld modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"tjeld-detail-"+width+".png")});
   }
   await context.close();
  }

  // Kvinand #35: verified adult male Goldeneye WebP, full image, black contain, dialog, and missing-file fallback.
  for(const brokenGoldeneye of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGoldeneye)await context.route("**/bilder/natur/fauna/godkjent/35_kvinand_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Kvinand");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Kvinand,/i}).first();
   await card.waitFor();
   if(brokenGoldeneye){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Kvinand: do not silently substitute a photograph for broken WebP");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("35_kvinand_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"kvinand-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGoldeneye){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Kvinand dialog must fit viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"kvinand-detail-"+width+".png")});
   }
   await context.close();
  }

  // Sjøorre #36: adult male Velvet Scoter on dark water, preserve full outline and broken-WebP fallback.
  for(const brokenScoter of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenScoter)await context.route("**/bilder/natur/fauna/godkjent/36_sjoorre_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();
   await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Sjøorre");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Sjøorre,/i}).first();
   await card.waitFor();
   if(brokenScoter){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Sjøorre: no photograph substituted for WebP error");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("36_sjoorre_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"sjoorre-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenScoter){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Sjøorre modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"sjoorre-detail-"+width+".png")});
   }
   await context.close();
  }
  // Løvsanger #37: whole bird on lichen branch, black contain, detail and missing-WebP fallback.
  for(const brokenWillowWarbler of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenWillowWarbler)await context.route("**/bilder/natur/fauna/godkjent/37_lovsanger_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Løvsanger");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Løvsanger,/i}).first();
   await card.waitFor();
   if(brokenWillowWarbler){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Løvsanger: no unapproved photograph if WebP fails");
   }else{
    const img=card.locator("img");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await img.getAttribute("src")).endsWith("37_lovsanger_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"lovsanger-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenWillowWarbler){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const img=page.locator("#natureDialog .ne-dialog-image");
    await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Løvsanger dialog fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"lovsanger-detail-"+width+".png")});
   }
   await context.close();
  }


  // Svarthvit fluesnapper #38: black background, object-fit contain, modal, broken image fallback.
  for(const brokenPiedFlycatcher of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenPiedFlycatcher)await context.route("**/bilder/natur/fauna/godkjent/38_svarthvit_fluesnapper_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Svarthvit fluesnapper");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Svarthvit fluesnapper,/i}).first();
   await card.waitFor();
   if(brokenPiedFlycatcher){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Svarthvit fluesnapper: no photo substitution");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("38_svarthvit_fluesnapper_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"svarthvit-fluesnapper-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenPiedFlycatcher){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Svarthvit fluesnapper modal fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"svarthvit-fluesnapper-detail-"+width+".png")});
   }
   await context.close();
  }

  // Gulsanger #39: accurate bright yellow underparts, uncut silhouette, black contain, modal, and failed-WebP fallback.
  for(const brokenIcterineWarbler of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenIcterineWarbler)await context.route("**/bilder/natur/fauna/godkjent/39_gulsanger_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Gulsanger");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Gulsanger,/i}).first();
   await card.waitFor();
   if(brokenIcterineWarbler){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Gulsanger: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("39_gulsanger_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"gulsanger-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenIcterineWarbler){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Gulsanger detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"gulsanger-detail-"+width+".png")});
   }
   await context.close();
  }

  // Rødvingetrost #40: diagnostic rust-red flanks, uncut silhouette, black contain, modal, and failed-WebP fallback.
  for(const brokenRedwing of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenRedwing)await context.route("**/bilder/natur/fauna/godkjent/40_rodvingetrost_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Rødvingetrost");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Rødvingetrost,/i}).first();
   await card.waitFor();
   if(brokenRedwing){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Rødvingetrost: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("40_rodvingetrost_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"rodvingetrost-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenRedwing){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Rødvingetrost detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"rodvingetrost-detail-"+width+".png")});
   }
   await context.close();
  }

  // Jernspurv #41: grey head and breast, thin bill, uncut silhouette, black contain, modal, and failed-WebP fallback.
  for(const brokenDunnock of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenDunnock)await context.route("**/bilder/natur/fauna/godkjent/41_jernspurv_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Jernspurv");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Jernspurv,/i}).first();
   await card.waitFor();
   if(brokenDunnock){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Jernspurv: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("41_jernspurv_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"jernspurv-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenDunnock){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Jernspurv detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"jernspurv-detail-"+width+".png")});
   }
   await context.close();
  }

  // Hvitryggspett #42: adult male, white lower back and barred wings, uncut silhouette, black contain, modal, and failed-WebP fallback.
  for(const brokenWhiteBacked of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenWhiteBacked)await context.route("**/bilder/natur/fauna/godkjent/42_hvitryggspett_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Hvitryggspett");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Hvitryggspett,/i}).first();
   await card.waitFor();
   if(brokenWhiteBacked){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Hvitryggspett: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("42_hvitryggspett_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"hvitryggspett-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenWhiteBacked){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Hvitryggspett detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"hvitryggspett-detail-"+width+".png")});
   }
   await context.close();
  }

  // Dvergspett #43: adult male, red crown and barred wings, uncut silhouette, black contain, modal, and failed-WebP fallback.
  for(const brokenLesserSpotted of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenLesserSpotted)await context.route("**/bilder/natur/fauna/godkjent/43_dvergspett_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Dvergspett");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Dvergspett,/i}).first();
   await card.waitFor();
   if(brokenLesserSpotted){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Dvergspett: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("43_dvergspett_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"dvergspett-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenLesserSpotted){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Dvergspett detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"dvergspett-detail-"+width+".png")});
   }
   await context.close();
  }

  // Kattugle #44: adult brown morph, rounded head and dark eyes, uncut silhouette, black contain, modal, and failed-WebP fallback.
  for(const brokenTawnyOwl of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenTawnyOwl)await context.route("**/bilder/natur/fauna/godkjent/44_kattugle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Kattugle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Kattugle,/i}).first();
   await card.waitFor();
   if(brokenTawnyOwl){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Kattugle: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("44_kattugle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"kattugle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenTawnyOwl){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Kattugle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"kattugle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Munk #45: male black cap, grey face, brown-grey upperparts; uncut silhouette, black contain, modal and failed-WebP fallback.
  for(const brokenBlackcap of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenBlackcap)await context.route("**/bilder/natur/fauna/godkjent/45_munk_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Munk");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Munk,/i}).first();
   await card.waitFor();
   if(brokenBlackcap){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Munk: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("45_munk_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"munk-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenBlackcap){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Munk detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"munk-detail-"+width+".png")});
   }
   await context.close();
  }

  // Fossekall #46: white breast, short tail, slate-brown wings on river stone; uncut silhouette, black contain, modal and failed-WebP fallback.
  for(const brokenDipper of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenDipper)await context.route("**/bilder/natur/fauna/godkjent/46_fossekall_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Fossekall");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Fossekall,/i}).first();
   await card.waitFor();
   if(brokenDipper){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Fossekall: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("46_fossekall_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"fossekall-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenDipper){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Fossekall detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"fossekall-detail-"+width+".png")});
   }
   await context.close();
  }

  // Ærfugl #47: adult male breeding plumage, green nape and wedge-shaped bill; black contain, modal and failed-WebP fallback.
  for(const brokenEider of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenEider)await context.route("**/bilder/natur/fauna/godkjent/47_aerfugl_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Ærfugl");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Ærfugl,/i}).first();
   await card.waitFor();
   if(brokenEider){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Ærfugl: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("47_aerfugl_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"aerfugl-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenEider){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Ærfugl detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"aerfugl-detail-"+width+".png")});
   }
   await context.close();
  }

  // Ekorn #48: red-brown fur, pale underside, ear tufts and bushy tail; black contain, modal and failed-WebP fallback.
  for(const brokenSquirrel of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenSquirrel)await context.route("**/bilder/natur/fauna/godkjent/48_ekorn_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Ekorn");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Ekorn,/i}).first();
   await card.waitFor();
   if(brokenSquirrel){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Ekorn: no photo substitution on WebP load failure");
   }else{
    const bird=card.locator("img");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bird.getAttribute("src")).endsWith("48_ekorn_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"ekorn-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenSquirrel){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bird=page.locator("#natureDialog .ne-dialog-image");
    await bird.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bird.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Ekorn detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"ekorn-detail-"+width+".png")});
   }
   await context.close();
  }

  // Honningbie #49: worker on white clover, pollen basket and veined wings; black contain, modal and failed-WebP fallback.
  for(const brokenHoneybee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenHoneybee)await context.route("**/bilder/natur/fauna/godkjent/49_honningbie_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Honningbie");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Honningbie,/i}).first();
   await card.waitFor();
   if(brokenHoneybee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Honningbie: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("49_honningbie_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"honningbie-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenHoneybee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Honningbie detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"honningbie-detail-"+width+".png")});
   }
   await context.close();
  }

  // Jordhumle #50: queen, two yellow bands and buff tail on red clover; black contain, modal and failed-WebP fallback.
  for(const brokenBumblebee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenBumblebee)await context.route("**/bilder/natur/fauna/godkjent/50_jordhumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Jordhumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Jordhumle,/i}).first();
   await card.waitFor();
   if(brokenBumblebee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Jordhumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("50_jordhumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"jordhumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenBumblebee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Jordhumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"jordhumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Åkerhumle #51: ginger thorax and mixed abdominal hairs on a purple flower; black contain, modal and failed-WebP fallback.
  for(const brokenCarderBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenCarderBee)await context.route("**/bilder/natur/fauna/godkjent/51_aakerhumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Åkerhumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Åkerhumle,/i}).first();
   await card.waitFor();
   if(brokenCarderBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Åkerhumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("51_aakerhumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"aakerhumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenCarderBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Åkerhumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"aakerhumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Steinhumle #52: black body, red-orange tail and veined wings; black contain, modal and failed-WebP fallback.
  for(const brokenRedTailedBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenRedTailedBee)await context.route("**/bilder/natur/fauna/godkjent/52_steinhumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Steinhumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Steinhumle,/i}).first();
   await card.waitFor();
   if(brokenRedTailedBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Steinhumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("52_steinhumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"steinhumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenRedTailedBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Steinhumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"steinhumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Hagehumle #53: three yellow bands, white tail and long tongue; black contain, modal and failed-WebP fallback.
  for(const brokenGardenBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGardenBee)await context.route("**/bilder/natur/fauna/godkjent/53_hagehumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Hagehumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Hagehumle,/i}).first();
   await card.waitFor();
   if(brokenGardenBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Hagehumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("53_hagehumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"hagehumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGardenBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Hagehumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"hagehumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Lys jordhumle #54: two lemon-yellow bands, white tail and short face; black contain, modal and failed-WebP fallback.
  for(const brokenWhiteTailedBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenWhiteTailedBee)await context.route("**/bilder/natur/fauna/godkjent/54_lys_jordhumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Lys jordhumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Lys jordhumle,/i}).first();
   await card.waitFor();
   if(brokenWhiteTailedBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Lys jordhumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("54_lys_jordhumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"lys_jordhumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenWhiteTailedBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Lys jordhumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"lys_jordhumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Markhumle #55: two yellow bands and small orange-red tail; solitary insect without flowers; black contain, modal and failed-WebP fallback.
  for(const brokenEarlyBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenEarlyBee)await context.route("**/bilder/natur/fauna/godkjent/55_markhumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Markhumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Markhumle,/i}).first();
   await card.waitFor();
   if(brokenEarlyBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Markhumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("55_markhumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"markhumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenEarlyBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Markhumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"markhumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Enghumle #56: pale form, dark thoracic band and orange-red tail; black contain, modal and failed-WebP fallback.
  for(const brokenShrillBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenShrillBee)await context.route("**/bilder/natur/fauna/godkjent/56_enghumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Enghumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Enghumle,/i}).first();
   await card.waitFor();
   if(brokenShrillBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Enghumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("56_enghumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"enghumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenShrillBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Enghumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"enghumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Trehumle #57: ginger-brown thorax, black abdomen and white tail; black contain, modal and failed-WebP fallback.
  for(const brokenTreeBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenTreeBee)await context.route("**/bilder/natur/fauna/godkjent/57_trehumle_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Trehumle");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Trehumle,/i}).first();
   await card.waitFor();
   if(brokenTreeBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Trehumle: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("57_trehumle_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"trehumle-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenTreeBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Trehumle detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"trehumle-detail-"+width+".png")});
   }
   await context.close();
  }

  // Murerbie #58: female Osmia bicornis, explicitly labelled as an example of the Osmia group; black contain, modal and failed-WebP fallback.
  for(const brokenMasonBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenMasonBee)await context.route("**/bilder/natur/fauna/godkjent/58_murerbie_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Murerbie");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Murerbie,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Hornmurerbie");
   await card.waitFor();
   assert.equal(await page.locator("#natureGrid .ne-card").count(),1);
   assert(await card.getByText("Bildet viser hornmurerbie (Osmia bicornis), én av flere murerbiearter.").isVisible());
   if(brokenMasonBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Murerbie: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    assert((await bee.getAttribute("alt")).includes("Osmia bicornis"));
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("58_murerbie_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"murerbie-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   assert(await page.locator("#natureDialog").getByText("Bildet viser hornmurerbie (Osmia bicornis), én av flere murerbiearter.").isVisible());
   if(brokenMasonBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Murerbie detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"murerbie-detail-"+width+".png")});
   }
   await context.close();
  }

  // Sandbie #59: female Andrena fulva, explicitly labelled as an example of the Andrena group; black contain, modal and failed-WebP fallback.
  for(const brokenMiningBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenMiningBee)await context.route("**/bilder/natur/fauna/godkjent/59_sandbie_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Sandbie");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Sandbie,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Flammesandbie");
   await card.waitFor();
   assert.equal(await page.locator("#natureGrid .ne-card").count(),1);
   assert(await card.getByText("Bildet viser flammesandbie (Andrena fulva), én av flere sandbiearter.").isVisible());
   if(brokenMiningBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Sandbie: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    assert((await bee.getAttribute("alt")).includes("Andrena fulva"));
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("59_sandbie_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"sandbie-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   assert(await page.locator("#natureDialog").getByText("Bildet viser flammesandbie (Andrena fulva), én av flere sandbiearter.").isVisible());
   if(brokenMiningBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Sandbie detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"sandbie-detail-"+width+".png")});
   }
   await context.close();
  }

  // Bladskjærerbie #60: female Megachile centuncularis, explicitly labelled as an example of the Megachile group; black contain, modal and failed-WebP fallback.
  for(const brokenLeafcutterBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenLeafcutterBee)await context.route("**/bilder/natur/fauna/godkjent/60_bladskjaererbie_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Bladskjærerbie");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Bladskjærerbie,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Rosebladskjærerbie");
   await card.waitFor();
   assert.equal(await page.locator("#natureGrid .ne-card").count(),1);
   assert(await card.getByText("Bildet viser rosebladskjærerbie (Megachile centuncularis), én av flere bladskjærerbiearter.").isVisible());
   if(brokenLeafcutterBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Bladskjærerbie: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    assert((await bee.getAttribute("alt")).includes("Megachile centuncularis"));
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("60_bladskjaererbie_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"bladskjaererbie-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   assert(await page.locator("#natureDialog").getByText("Bildet viser rosebladskjærerbie (Megachile centuncularis), én av flere bladskjærerbiearter.").isVisible());
   if(brokenLeafcutterBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Bladskjærerbie detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"bladskjaererbie-detail-"+width+".png")});
   }
   await context.close();
  }

  // Metalljordbie #61: female Lasioglossum morio, explicitly labelled as an example of the Halictus/Lasioglossum group; black contain, modal and failed-WebP fallback.
  for(const brokenSweatBee of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenSweatBee)await context.route("**/bilder/natur/fauna/godkjent/61_metallbie_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Metalljordbie");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Jordbier og båndbier,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Metalljordbie");
   await card.waitFor();
   assert.equal(await page.locator("#natureGrid .ne-card").count(),1);
   assert(await card.getByText("Bildet viser metalljordbie (Lasioglossum morio), én av flere arter av jordbier og båndbier.").isVisible());
   if(brokenSweatBee){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Metalljordbie: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    assert((await bee.getAttribute("alt")).includes("Lasioglossum morio"));
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("61_metallbie_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"metallbie-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   assert(await page.locator("#natureDialog").getByText("Bildet viser metalljordbie (Lasioglossum morio), én av flere arter av jordbier og båndbier.").isVisible());
   if(brokenSweatBee){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Metalljordbie detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"metallbie-detail-"+width+".png")});
   }
   await context.close();
  }

  // Jordveps #62: yellow/black worker with anchor-shaped face marking; black contain, modal and failed-WebP fallback.
  for(const brokenCommonWasp of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenCommonWasp)await context.route("**/bilder/natur/fauna/godkjent/62_jordveps_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Jordveps");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Jordveps,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Vanlig veps");
   await card.waitFor();
   if(brokenCommonWasp){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Jordveps: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("62_jordveps_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"jordveps-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenCommonWasp){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Jordveps detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"jordveps-detail-"+width+".png")});
   }
   await context.close();
  }

  // Tyskveps #63: yellow/black worker with three separate facial marks; black contain, modal and failed-WebP fallback.
  for(const brokenGermanWasp of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenGermanWasp)await context.route("**/bilder/natur/fauna/godkjent/63_tyskveps_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Tysk veps");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Tysk veps,/i}).first();
   await card.waitFor();
   if(brokenGermanWasp){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Tysk veps: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("63_tyskveps_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"tyskveps-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenGermanWasp){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Tysk veps detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"tyskveps-detail-"+width+".png")});
   }
   await context.close();
  }

  // Rødveps #64: worker with red first two abdominal segments and anchor face mark; black contain, modal and failed-WebP fallback.
  for(const brokenRedWasp of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenRedWasp)await context.route("**/bilder/natur/fauna/godkjent/64_roedveps_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Rødveps");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Rødveps,/i}).first();
   await card.waitFor();
   if(brokenRedWasp){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Rødveps: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("src")).endsWith("64_roedveps_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"roedveps-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   if(brokenRedWasp){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Rødveps detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"roedveps-detail-"+width+".png")});
   }
   await context.close();
  }

  // Murveps #65: explicitly labelled Ancistrocerus parietinus example; black contain, modal and failed-WebP fallback.
  for(const brokenMasonWasp of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenMasonWasp)await context.route("**/bilder/natur/fauna/godkjent/65_murveps_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Murveps");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Murveps,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Veggmurerveps");
   await card.waitFor();
   assert(await card.getByText("Bildet viser veggmurerveps (Ancistrocerus parietinus), én av flere murervepsarter.").isVisible());
   if(brokenMasonWasp){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Murveps: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("alt")).includes("Ancistrocerus parietinus"));
    assert((await bee.getAttribute("src")).endsWith("65_murveps_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"murveps-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   assert(await page.locator("#natureDialog").getByText("Bildet viser veggmurerveps (Ancistrocerus parietinus), én av flere murervepsarter.").isVisible());
   if(brokenMasonWasp){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Murveps detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"murveps-detail-"+width+".png")});
   }
   await context.close();
  }

  // Graveveps #66: explicitly labelled Ammophila sabulosa example; black contain, modal and failed-WebP fallback.
  for(const brokenDiggerWasp of [false,true]){
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
   if(brokenDiggerWasp)await context.route("**/bilder/natur/fauna/godkjent/66_graveveps_v1.webp",r=>r.abort("failed"));
   const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
   await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
   await page.locator("#natureSearch").fill("Graveveps");
   const card=page.locator("#natureGrid").getByRole("button",{name:/^Graveveps,/i}).first();
   await card.waitFor();
   await page.locator("#natureSearch").fill("Nattflylarvegraver");
   await card.waitFor();
   assert(await card.getByText("Bildet viser nattflylarvegraver (Ammophila sabulosa), én av flere gravevepsarter.").isVisible());
   if(brokenDiggerWasp){
    await card.locator(".ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
    assert.equal(await card.locator("img").count(),0,"Graveveps: no photo substitution on WebP load failure");
   }else{
    const bee=card.locator("img");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await bee.getAttribute("alt")).includes("Ammophila sabulosa"));
    assert((await bee.getAttribute("src")).endsWith("66_graveveps_v1.webp"));
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(0, 0, 0)");
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    await card.screenshot({path:path.join(artifacts,"graveveps-card-"+width+".png")});
   }
   await card.click();await page.locator("#natureDialog").waitFor({state:"visible"});
   assert(await page.locator("#natureDialog").getByText("Bildet viser nattflylarvegraver (Ammophila sabulosa), én av flere gravevepsarter.").isVisible());
   if(brokenDiggerWasp){
    await page.locator("#natureDialog .ne-image-fallback").getByText("Illustrasjon utilgjengelig").waitFor({timeout:15000});
   }else{
    const bee=page.locator("#natureDialog .ne-dialog-image");
    await bee.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert.equal(await bee.evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert(await page.getByText("Individuelt kvalitetsgodkjent faunaillustrasjon").isVisible());
    const bounds=await page.locator("#natureDialog").boundingBox();
    assert(bounds&&bounds.width<=width,"Graveveps detail fits viewport");
    await page.locator("#natureDialog").screenshot({path:path.join(artifacts,"graveveps-detail-"+width+".png")});
   }
   await context.close();
  }

  // Unapproved fauna must retain a separate legacy SVG fallback.
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
  await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
  const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
  await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
  await page.locator("#natureSearch").fill("Sandveps");
  const unapproved=page.locator("#natureGrid").getByRole("button",{name:/^Sandveps,/i}).first();
  await unapproved.waitFor();
  assert((await unapproved.locator("img").getAttribute("src")).startsWith("data:image/svg+xml"),"Unapproved Sandveps retains original SVG");
  await context.close();
  console.log("Finn Fauna 66 approved originals "+width+"px: WebP, black contain, fallback, dialog and legacy SVG OK");
 }
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
