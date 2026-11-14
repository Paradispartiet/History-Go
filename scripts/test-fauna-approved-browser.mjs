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
  // Unapproved fauna must retain a separate legacy SVG fallback.
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
  await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
  const page=await context.newPage();await page.goto("http://127.0.0.1:"+port+"/finn-fauna.html",{waitUntil:"domcontentloaded"});
  await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
  await page.locator("#natureSearch").fill("Rødstrupe");
  const unapproved=page.locator("#natureGrid").getByRole("button",{name:/^Rødstrupe,/i}).first();
  await unapproved.waitFor();
  assert((await unapproved.locator("img").getAttribute("src")).startsWith("data:image/svg+xml"),"Unapproved Rødstrupe retains original SVG");
  await context.close();
  console.log("Finn Fauna 11 approved birds "+width+"px: WebP, black contain, fallback, dialog and legacy SVG OK");
 }
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
