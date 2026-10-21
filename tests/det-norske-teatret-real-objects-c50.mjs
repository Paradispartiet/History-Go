import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

// C50 exercises actual index.html boot, the public place route, first-visit
// welcome dismissal and existing unified PlaceCard Objects interaction.
// It verifies the shipping TypeScript-rendered Sources section, not the
// legacy popup nor an invented replacement for the retired Mer info button.
const root = process.cwd();
const placeId = "det_norske_teatret";
const sourceFile = "data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const place = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
assert.equal(place.id, placeId);
assert.equal(place.objects?.length,2);
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
const artifactPath = "artifacts/dnt-c50";
fs.mkdirSync(artifactPath, {recursive:true});
const report = {schema:"history_go_dnt_c50_native_objects_browser_v1",
  mode:"native index.html, router and canonical Objects click; real local photo and SVG",
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
    let phase = "launch";
    page.on("pageerror",error=>errors.push(error.message));
    try {
      phase="load-app";
      const res = await page.goto(base+"index.html#/map",{waitUntil:"domcontentloaded",timeout:40000});
      assert.equal(res?.status(),200);
      phase="app-ready";
      await page.waitForFunction(() =>
        window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true &&
        window.HG_PLACES_READY===true, null,{timeout:45000});
      phase="onboarding-visible";
      await page.locator("#hgOnboardingModal .hg-onb-primary").waitFor({state:"visible",timeout:10000});
      phase="onboarding-click";
      await page.locator("#hgOnboardingModal .hg-onb-primary").click({timeout:10000});
      phase="onboarding-dismissed";
      await page.waitForFunction(() => {
        const el = document.querySelector("#hgOnboardingModal");
        return el && el.getAttribute("aria-hidden")==="true" && getComputedStyle(el).display==="none";
      },null,{timeout:10000});
      assert.equal(await page.evaluate(()=>localStorage.getItem("hg_onboarding_shown_v1")),"1");
      // The normal app route, shared by marker click, Nearby and search.
      phase="route-to-place";
      await page.evaluate(id=>window.HGAppRouter.toPlace(id),placeId);
      phase="wait-place-card";
      await page.waitForFunction(id =>
        document.querySelector("#placeCard")?.dataset?.currentPlaceId === id &&
        document.querySelector("#placeCard")?.classList.contains("is-open"),placeId,{timeout:35000});
      assert.equal(await page.locator("#pcTitle").innerText(),"Det Norske Teatret");
      // C50: the ACTUAL adaptive Objects collection, not the separate Kilder photo grid.
      phase="objects-icon-preview";
      await page.waitForFunction(() => {
        const icon=document.querySelector("#pcObjectsIcon");
        return icon && !icon.hidden && icon.dataset.collectionItemCount==="2"
          && icon.dataset.previewStatus==="member-image";
      },null,{timeout:15000});
      const objectIcon=page.locator("#pcObjectsIcon");
      assert.equal(await objectIcon.getAttribute("data-collection-id"),"objects");
      const cardPreview=objectIcon.locator("img.pc-person-img");
      phase="preview-visible";
      await cardPreview.waitFor({state:"visible",timeout:15000});
      const previewSrc=await cardPreview.getAttribute("src");
      assert.equal(previewSrc,place.objects[0].image);
      phase="preview-decoded";
      await page.waitForFunction(src=>{
        const img=document.querySelector('#pcObjectsIcon img.pc-person-img');
        return img?.getAttribute("src")===src && img.complete && img.naturalWidth===800;
      },place.objects[0].image,{timeout:15000});
      await objectIcon.screenshot({path:artifactPath+"/"+name+"-objects-preview.png"});
      phase="objects-click";
      await objectIcon.click({timeout:15000});
      phase="popup-member-rows";
      await page.waitForFunction(()=>{
        const rows=[...document.querySelectorAll(".pc-object-member")];
        return rows.length>=2 && rows.some(x=>/Illustrasjon – ikke fotografi/.test(x.textContent));
      },null,{timeout:15000});
      const memberImages=page.locator("#pcObjectsList .pc-object-member img");
      assert.equal(await memberImages.count(),2,"the same canonical member data must drive collection rows");
      phase="popup-member-images-decoded";
      await page.waitForFunction(()=>{
        const images=[...document.querySelectorAll(".pc-round-popup-objects .pc-object-member img")];
        return images.length===2 && images.every(el=>el.complete && el.naturalWidth>0 && el.naturalHeight>0);
      },null,{timeout:15000});
      const visibleRows=page.locator(".pc-object-member:visible");
      assert.equal(await visibleRows.count(),2,"both Object rows must actually be visible in the live popup");
      const visibleMemberImages=visibleRows.locator("img.pc-object-member-image");
      assert.equal(await visibleMemberImages.count(),2);
      const minimumMemberImageWidth=width<=520 ? 72 : 90;
      for(let i=0;i<2;i++){
        const box=await visibleMemberImages.nth(i).boundingBox();
        assert.ok(box && box.width>=minimumMemberImageWidth && box.height>=minimumMemberImageWidth,
          "Object member media is rendered too small for "+name+": "+JSON.stringify(box));
      }
      await visibleRows.nth(1).scrollIntoViewIfNeeded();
      await page.screenshot({path:artifactPath+"/"+name+"-illustration-member.png"});
      const rows=page.locator("#pcObjectsList .pc-object-member");
      assert.match(await rows.nth(0).innerText(),/Madame de Sade/);
      assert.match(await rows.nth(0).innerText(),/Lone Lunde/);
      assert.match(await rows.nth(0).innerText(),/CC BY-SA 4.0/);
      assert.match(await rows.nth(1).innerText(),/Jan Groth/);
      assert.match(await rows.nth(1).innerText(),/Illustrasjon – ikke fotografi/);
      assert.equal(await rows.nth(0).locator("a.pc-object-source").getAttribute("href"),place.objects[0].imageMeta.sourceUrl);
      assert.equal(await rows.nth(1).locator("a.pc-object-source").getAttribute("href"),place.objects[1].imageMeta.sourceUrl);
      const photoDimensions=await visibleMemberImages.first().evaluate(el=>[el.naturalWidth,el.naturalHeight]);
      assert.deepEqual(photoDimensions,[800,800]);
      const illustrationDimensions=await visibleMemberImages.nth(1).evaluate(el=>[el.naturalWidth,el.naturalHeight]);
      assert.deepEqual(illustrationDimensions,[1200,760]);
      assert.ok((await page.locator("#pcObjectsList").innerText()).includes("Scene 2"));
      assert.equal(errors.length,0,"unexpected JavaScript page error during Object render");
      const shot = artifactPath+"/"+name+"-real-route.png";
      await page.screenshot({path:shot,fullPage:true});
      caseResult.screenshot=shot;
      caseResult.outcome="PASS";
      caseResult.phase="all-done";
      caseResult.welcome_dismissed=true;
      caseResult.app_route="#/place/"+placeId;
      caseResult.objects_preview_loaded=true;
      caseResult.object_members=2;
      caseResult.photo_and_svg_decoded=true;
      console.log("C50 "+name+" native router -> unified PlaceCard -> Objects PASS");
    }catch(error){
      caseResult.outcome="BLOCKED";
      caseResult.phase=phase;
      caseResult.error=String(error);
      caseResult.dom=await page.evaluate(() => ({
        url:location.href, route:window.location.hash,
        ready:{app:window.__HG_APP_READY__,router:window.__HG_ROUTER_STARTED__,places:window.HG_PLACES_READY},
        onboarding:{hidden:document.querySelector('#hgOnboardingModal')?.getAttribute('aria-hidden'),display:document.querySelector('#hgOnboardingModal') && getComputedStyle(document.querySelector('#hgOnboardingModal')).display},
        place:{id:document.querySelector('#placeCard')?.dataset?.currentPlaceId,open:document.querySelector('#placeCard')?.classList.contains('is-open')},
        objects:{iconHidden:document.querySelector('#pcObjectsIcon')?.hidden,count:document.querySelector('#pcObjectsIcon')?.dataset?.collectionItemCount,preview:document.querySelector('#pcObjectsIcon')?.dataset?.previewStatus,rows:document.querySelectorAll('#pcObjectsList .pc-object-member').length,allRows:document.querySelectorAll('.pc-object-member').length},
        overlay:document.querySelector('.pc-round-popup')?.outerHTML.slice(0,400)
      })).catch(e=>({error:String(e)}));
      const shot=artifactPath+"/"+name+"-failure.png";
      await page.screenshot({path:shot,fullPage:true,timeout:7000}).catch(()=>{});
      caseResult.screenshot=shot;
      console.error("C50 "+name+" phase="+phase+" "+caseResult.error+" DOM="+JSON.stringify(caseResult.dom));
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
  console.log("C50 "+report.status);
}
