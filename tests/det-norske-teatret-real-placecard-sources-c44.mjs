import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

// C44 exercises actual index.html boot, the public place route, first-visit
// welcome dismissal and existing unified PlaceCard Kilder navigation.
// It verifies the shipping TypeScript-rendered Sources section, not the
// legacy popup nor an invented replacement for the retired Mer info button.
const root = process.cwd();
const placeId = "det_norske_teatret";
const sourceFile = "data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const place = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const c41 = JSON.parse(fs.readFileSync(
  "reports/place-production/det-norske-teatret/20261020/object-photo-inline-source-c41.json", "utf8"));
const c47 = JSON.parse(fs.readFileSync(
  "reports/place-production/det-norske-teatret/20261021/foyer-painting-kilder-c47.json", "utf8"));
assert.equal(place.id, placeId);
const markup = fs.readFileSync("index.html", "utf8");
const placeCard = fs.readFileSync("js/ui/place-card.js", "utf8");
assert.doesNotMatch(markup, /id="pcInfo"/, "intentionally retired Mer info remains absent");
assert.doesNotMatch(markup, /id="pcSources"/, "do not introduce duplicate Sources buttons");
const compiled = fs.readFileSync("dist/web/place-unified-surface.js","utf8");
assert.match(compiled,/hg-place-source-photo-grid/,"canonical TypeScript must be rebuilt into deployed bundle");
const mime = {".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript",
  ".css":"text/css", ".json":"application/json", ".webp":"image/webp",
  ".jpg":"image/jpeg", ".png":"image/png", ".woff2":"font/woff2",
  ".svg":"image/svg+xml", ".wasm":"application/wasm"};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end("Not found"); return;
  }
  res.writeHead(200, {"content-type":mime[path.extname(file).toLowerCase()] || "application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/";
const artifactPath = "artifacts/dnt-c44";
fs.mkdirSync(artifactPath, {recursive:true});
const report = {schema:"history_go_dnt_c44_native_route_browser_v1",
  mode:"native index.html, router and PlaceCard click; real local source assets",
  target:"local PR-head app, NOT deployed production or physical phone",
  place_id:placeId, cases:[], status:"PENDING"};
let browser;
try {
  browser = await chromium.launch({headless:true});
  for(const [name,width,height] of [["mobile",390,844],["desktop",1280,900]]) {
    const context = await browser.newContext({
      viewport:{width,height},locale:"nb-NO",serviceWorkers:"block",
      permissions:[],deviceScaleFactor:1
    });
    const page = await context.newPage();
    const errors = [], caseResult = {name,width,height,outcome:"PENDING"};
    page.on("pageerror",error=>errors.push(error.message));
    try {
      const res = await page.goto(base+"index.html#/map",{waitUntil:"domcontentloaded",timeout:40000});
      assert.equal(res?.status(),200);
      await page.waitForFunction(() =>
        window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true &&
        window.HG_PLACES_READY===true, null,{timeout:45000});
      await page.locator("#hgOnboardingModal .hg-onb-primary").waitFor({state:"visible",timeout:10000});
      await page.locator("#hgOnboardingModal .hg-onb-primary").click({timeout:10000});
      await page.waitForFunction(() => {
        const el = document.querySelector("#hgOnboardingModal");
        return el && el.getAttribute("aria-hidden")==="true" && getComputedStyle(el).display==="none";
      },null,{timeout:10000});
      assert.equal(await page.evaluate(()=>localStorage.getItem("hg_onboarding_shown_v1")),"1");
      // The normal app route, shared by marker click, Nearby and search.
      await page.evaluate(id=>window.HGAppRouter.toPlace(id),placeId);
      await page.waitForFunction(id =>
        document.querySelector("#placeCard")?.dataset?.currentPlaceId === id &&
        document.querySelector("#placeCard")?.classList.contains("is-open"),placeId,{timeout:35000});
      assert.equal(await page.locator("#pcTitle").innerText(),"Det Norske Teatret");
      // This is the existing unified PlaceCard nav, visible in the real UI.
      const sourceNav = page.locator('#placeCard [data-hg-place-sheet-jump="sources"]');
      await sourceNav.waitFor({state:"visible",timeout:20000});
      assert.equal(await sourceNav.innerText(),"Kilder");
      await sourceNav.click({timeout:15000});
      const panel = page.locator('#placeCard [data-hg-place-sheet-section="sources"]');
      await panel.waitFor({state:"visible",timeout:15000});
      assert.match(await panel.innerText(),/Kilder/);
      const image = panel.locator(".hg-place-source-photo img");
      assert.equal(await image.count(),2,"two documented images must not create a canonical Object");
      await image.first().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const img = document.querySelector('#placeCard [data-hg-place-sheet-section="sources"] .hg-place-source-photo img');
        return img?.complete && img.naturalWidth === 800 && img.naturalHeight === 800;
      },null,{timeout:15000});
      assert.equal(await image.first().getAttribute("src"),c41.museum_image.file);
      const fit = await image.first().evaluate(el=>getComputedStyle(el).objectFit);
      assert.equal(fit,"contain","physical costume may not be cropped");
      const box = await image.first().boundingBox();
      assert.ok(box && box.x >= -1 && box.x+box.width <= width+1,
        "museum image must fit mobile/desktop viewport");
      const caption = panel.locator(".hg-place-source-photo figcaption");
      await caption.first().scrollIntoViewIfNeeded();
      assert.match(await caption.first().innerText(),/Lone Lunde.*Oslo Museum/);
      assert.match(await caption.first().innerText(),/CC BY-SA 4\.0/);
      assert.equal(await caption.first().locator("a").getAttribute("href"),c41.museum_image.source);
      // C47 new licensed photo; both remain documentary sources, not Objects.
      const painting = image.nth(1);
      await painting.scrollIntoViewIfNeeded();
      await page.waitForFunction(src => {
        const imgs = [...document.querySelectorAll('#placeCard [data-hg-place-sheet-section="sources"] .hg-place-source-photo img')];
        const target = imgs[1];
        return target?.getAttribute("src") === src && target.complete &&
          target.naturalWidth === 800 && target.naturalHeight === 800;
      }, c47.new_photo.asset,{timeout:15000});
      assert.equal(await painting.getAttribute("src"),c47.new_photo.asset);
      assert.match(await painting.getAttribute("alt"),/Johannessen/);
      assert.equal(await painting.evaluate(el=>getComputedStyle(el).objectFit),"contain");
      const paintingBox = await painting.boundingBox();
      assert.ok(paintingBox && paintingBox.x>=-2 && paintingBox.x+paintingBox.width<=width+2,
        "painting image horizontally clipped");
      const caption2 = caption.nth(1);
      await caption2.scrollIntoViewIfNeeded();
      const captionText = await caption2.innerText();
      assert.match(captionText,/Wolfmann.*Wikimedia Commons/);
      assert.match(captionText,/CC BY-SA 4\.0/);
      assert.match(captionText,/Kirkegårdsgravere/);
      assert.match(captionText,/Kirkegårdsgraveren/);
      assert.equal(await caption2.locator("a").getAttribute("href"),c47.new_photo.source);
      assert.equal(await panel.locator('a[href*="utstillingsopning-aksel-waldemar-johannessen"]').count(),1);
      assert.equal(await panel.locator('a[href*="Hulda-bunaden_OHA-9.jpg"]').count(),1);
      assert.equal(await panel.locator('img[src*="detnorsketeatret.imgix.net"]').count(),0);
      const overlayIsOpen = await page.locator("#hgOnboardingModal").evaluate(
        el=>el.getAttribute("aria-hidden")==="false" && getComputedStyle(el).display!=="none");
      assert.equal(overlayIsOpen,false,"Welcome modal must not obstruct Sources");
      const shot = artifactPath+"/"+name+"-real-route.png";
      await page.screenshot({path:shot,fullPage:true});
      caseResult.screenshot=shot;
      caseResult.outcome="PASS";
      caseResult.welcome_dismissed=true;
      caseResult.app_route="#/place/"+placeId;
      caseResult.unified_sources_nav_clicked=true;
      caseResult.kilder_clicked=true;
      caseResult.image_decoded=true;
      console.log("C44 "+name+" native router -> unified PlaceCard -> Kilder PASS");
    }catch(error){
      caseResult.outcome="BLOCKED";
      caseResult.error=String(error);
      const shot=artifactPath+"/"+name+"-failure.png";
      await page.screenshot({path:shot,fullPage:true,timeout:7000}).catch(()=>{});
      caseResult.screenshot=shot;
      console.error("C44 "+name+" "+caseResult.error);
      process.exitCode=1;
    }finally{
      caseResult.page_errors=errors.slice(0,8);
      report.cases.push(caseResult);
      await context.close();
    }
  }
}finally{
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  report.status=report.cases.every(x=>x.outcome==="PASS") ? "NATIVE_ROUTE_PASS_NOT_DEPLOYED" : "BLOCKED";
  fs.writeFileSync(artifactPath+"/report.json",JSON.stringify(report,null,2)+"\n");
  console.log("C44 "+report.status);
}
