import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifacts=path.join(root,"artifacts","flora-approval");
fs.mkdirSync(artifacts,{recursive:true});
const mime={".html":"text/html",".js":"application/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url||"/","http://127.0.0.1").pathname);
  const filename=path.resolve(root,"."+pathname);
  if(!filename.startsWith(root+path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()){
    res.writeHead(404);res.end();return;
  }
  res.writeHead(200,{"Content-Type":mime[path.extname(filename)]||"application/octet-stream"});
  fs.createReadStream(filename).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
let browser;
const photoStub=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YxxF64AAAAASUVORK5CYII=","base64");
try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const subjects=[
    {name:"hestehov",path:"b03/01_hestehov_var.webp"},
    {name:"hvitveis",path:"b01/01_hvitveis.webp"},
    {name:"blaveis",term:"blåveis",path:"b01/07_blaveis.webp"},
    {name:"engkarse",path:"b04/01_engkarse_v3.webp"},
    {name:"ballblom",path:"b04/02_ballblom_v3.webp"},
    {name:"engsoleie",path:"b04/03_engsoleie_v3.webp"},
    {name:"lovetann",label:"Løvetann",term:"løvetann",path:"b05/01_lovetann_v2.webp"},
    {name:"rodjonsokblom",label:"Rød jonsokblom",term:"jonsok",path:"b05/02_rodjonsokblom_v2.webp"},
    {name:"prestekrage",path:"b05/03_prestekrage_v2.webp"},
    {name:"geitrams",path:"b06/02_geitrams.webp"},
    {name:"groblad",path:"b06/03_groblad.webp"},
    {name:"ryllik",path:"b06/01_ryllik.webp"},
    {name:"hvitklover",label:"Hvitkløver",term:"hvitkløver",path:"b07/03_hvitklover.webp"},
    {name:"blaklokke",label:"Blåklokke",term:"blåklokke",path:"b07/04_blaklokke.webp"},
    {name:"tiriltunge",label:"Tiriltunge",term:"tiriltunge",path:"b07/02_tiriltunge_v2.webp"},
    {name:"rodkløver",label:"Rødkløver",term:"rødkløver",path:"b08/01_rodklover_v4.webp"},
    {name:"bekkeblom",label:"Bekkeblom",term:"bekkeblom",path:"b08/02_bekkeblom_v1.webp"}
  ];
  for(const width of [390,1440]){
    for(const species of subjects){
    const context=await browser.newContext({viewport:{width,height:900}});
    await context.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await context.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await context.route("https://upload.wikimedia.org/**",r=>r.fulfill({contentType:"image/png",body:photoStub}));
    const page=await context.newPage();
    await page.goto("http://127.0.0.1:"+port+"/finn-flora.html",{waitUntil:"domcontentloaded"});
    await page.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
    await page.locator("#natureSearch").fill(species.term||species.name);
    const title=species.label||species.term||species.name;
    const card=page.locator("#natureGrid").getByRole("button",{name:new RegExp("^"+title+",","i")});
    await card.waitFor();
    await card.locator("img").evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
    assert((await card.locator("img").getAttribute("src")).endsWith(species.path));
    assert.equal((await card.locator(".ne-image-label").innerText()).trim(),"Illustrasjon");
    assert.equal(await card.locator("img").evaluate(el=>getComputedStyle(el).objectFit),"contain");
    assert.equal(await card.locator(".ne-photo").evaluate(el=>getComputedStyle(el).backgroundColor),"rgb(8, 9, 8)");
    await card.screenshot({path:path.join(artifacts,species.name+"-kort-"+width+".png")});
    await card.click();
    const dialog=page.locator("#natureDialog");
    await dialog.waitFor({state:"visible"});
    await page.waitForFunction(()=>document.querySelector(".ne-dialog-image")?.naturalWidth>0);
    assert.equal(await dialog.locator(".ne-dialog-image").evaluate(el=>el.classList.contains("ne-transparent-art")),true);
    const bounds=await dialog.boundingBox();
    assert(bounds && bounds.width<=width,"dialog overflow at "+width);
    await dialog.screenshot({path:path.join(artifacts,species.name+"-dialog-"+width+".png")});
    await context.close();

    const failure=await browser.newContext({viewport:{width,height:900}});
    await failure.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await failure.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await failure.route("https://upload.wikimedia.org/**",r=>r.fulfill({contentType:"image/png",body:photoStub}));
    await failure.route("**/bilder/natur/flora/illustrasjonskandidater/"+species.path,r=>r.abort("failed"));
    const test=await failure.newPage();
    await test.goto("http://127.0.0.1:"+port+"/finn-flora.html",{waitUntil:"domcontentloaded"});
    await test.locator("#natureGrid .ne-card").first().waitFor({timeout:20000});
    await test.locator("#natureSearch").fill(species.term||species.name);
    const fallback=test.locator("#natureGrid").getByRole("button",{name:new RegExp("^"+title+",","i")});
    await fallback.locator(".ne-image-label").getByText("Artsfoto").waitFor({timeout:20000});
    assert.match(await fallback.locator("img").getAttribute("src"),/wikimedia\.org/);
    await fallback.click();
    await test.locator("#natureDialog .ne-image-credit").getByText("Viser artsfoto",{exact:false}).waitFor({timeout:20000});
    await failure.close();
    console.log(species.name+" viewport "+width+": illustrated card/dialog and photo failover OK.");
    }
    // Held candidates remain outside Finn Flora; the dedicated review shows all four.
    const held=await browser.newContext({viewport:{width,height:900}});
    await held.route("**/js/aha.js",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await held.route("**/js/auth/require-login.js*",r=>r.fulfill({contentType:"application/javascript",body:'document.documentElement.classList.add("hg-auth-verified");'}));
    await held.route("https://upload.wikimedia.org/**",r=>r.fulfill({contentType:"image/png",body:photoStub}));
    const page=await held.newPage();
    await page.goto("http://127.0.0.1:"+port+"/finn-flora.html",{waitUntil:"domcontentloaded"});
    await page.locator("#natureGrid .ne-card").first().waitFor();
    await page.locator("#natureSearch").fill("tiriltunge");
    const illustrated=page.locator("#natureGrid").getByRole("button",{name:/^Tiriltunge,/i});
    await illustrated.locator(".ne-image-label").getByText("Illustrasjon").waitFor();
    assert((await illustrated.locator("img").getAttribute("src")).endsWith("b07/02_tiriltunge_v2.webp"));
    await page.goto("http://127.0.0.1:"+port+"/flora-illustrasjoner-bolk06.html",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator(".species img").count(),4);
    for(const img of await page.locator(".species img").all()){
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el=>el.complete&&el.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;}));
      assert.equal(await img.evaluate(el=>el.naturalWidth),1024);
    }
    assert(await page.getByText("Artsform vurdert · mangler artsoppføring",{exact:true}).isVisible());
    assert(await page.getByText("Må tegnes om · ikke publisert",{exact:true}).isVisible());
    await page.screenshot({path:path.join(artifacts,"batch06-gallery-"+width+".png"),fullPage:true});
    await held.close();
    console.log("Batch 06 viewport "+width+": historic rejected tiriltunge image preserved alongside new v2.");
  }
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
