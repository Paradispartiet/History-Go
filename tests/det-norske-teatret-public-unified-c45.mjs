import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium, request } from "playwright";

// C45 validates the REAL public GitHub Pages site with its native app route,
// not a local fixture or the legacy popup from C43.
const base = "https://paradispartiet.github.io/History-Go/";
const placeId = "det_norske_teatret";
const placePath = "data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const localPlace = JSON.parse(fs.readFileSync(placePath, "utf8"));
const c41 = JSON.parse(fs.readFileSync(
  "reports/place-production/det-norske-teatret/20261020/object-photo-inline-source-c41.json", "utf8"));
const out = path.resolve("artifacts/dnt-c45");
fs.mkdirSync(out, { recursive:true });
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const report = {
  schema:"dnt_c45_live_unified_sources_v1", website:base, place_id:placeId,
  outcome:"UNVERIFIED", http:[], cases:[], errors:[],
  scope:"Public GitHub Pages + native app route, automated Chromium at 390px and 1280px. Not physical mobile; map marker itself not pressed."
};
let api, browser;
try {
  api = await request.newContext({timeout:45000});
  const get = async (relative, kind) => {
    const resp = await api.get(new URL(relative,base).href,{maxRedirects:3});
    assert.equal(resp.status(),200,kind+" HTTP "+resp.status());
    const bytes = await resp.body();
    assert.ok(bytes.length,kind+" empty");
    report.http.push({kind,url:resp.url(),bytes:bytes.length,sha256:sha(bytes)});
    return bytes;
  };
  const html = (await get("index.html","app-index")).toString("utf8");
  assert.match(html,/History Go/i);
  assert.doesNotMatch(html,/id="pcInfo"|id="pcSources"/,
    "retired Mer info and duplicate Sources controls must stay absent");
  const js = (await get("dist/web/place-unified-surface.js","C44-unified-renderer")).toString("utf8");
  assert.match(js,/hg-place-source-photo-grid/,"C44 rendered photo must be PUBLIC");
  assert.match(js,/Dokumenterte kildebilder/);
  const css = (await get("css/place-sheet-sources.css","unified-sources-CSS")).toString("utf8");
  assert.match(css,/hg-place-source-photo-grid/);
  assert.match(css,/object-fit:contain/);
  const place = JSON.parse((await get(placePath,"canonical-place-JSON")).toString("utf8"));
  assert.equal(place.id,placeId);
  assert.equal(place.frontImage,localPlace.frontImage);
  const costume = place.externalLinks.find(link => link.previewImage===c41.museum_image.file);
  assert.ok(costume,"deployed Place must contain locally licensed museum photo");
  assert.equal(costume.url,c41.museum_image.source);
  assert.equal(costume.credit,c41.museum_image.credit);
  assert.equal(costume.license,"CC BY-SA 4.0");
  assert.ok(place.externalLinks.some(link => String(link.url||"").includes("Hulda-bunaden_OHA-9.jpg")));
  assert.equal(sha(await get(c41.museum_image.file,"Madame-de-Sade-WebP")),c41.museum_image.sha256);
  assert.equal(sha(await get(place.frontImage,"building-portrait-WebP")),localPlace.frontImageMeta.assetSha256);
  report.parity = {
    compiled_local_sha256:sha(fs.readFileSync("dist/web/place-unified-surface.js")),
    compiled_public_sha256:sha(Buffer.from(js)),
    exact_bundle_match:sha(fs.readFileSync("dist/web/place-unified-surface.js"))===sha(Buffer.from(js)),
    object_collection_members_published:0
  };
  browser = await chromium.launch({headless:true});
  for (const [name,width,height] of [["mobile",390,844],["desktop",1280,900]]) {
    const context = await browser.newContext({
      viewport:{width,height},locale:"nb-NO",serviceWorkers:"block",deviceScaleFactor:1
    });
    const page = await context.newPage();
    const entry = {name,width,height,status:"UNVERIFIED"};
    const errors = [];
    page.on("pageerror",err=>errors.push(String(err.message)));
    try {
      const resp = await page.goto(base+"index.html?dnt-c45=20261021#/map",{
        waitUntil:"domcontentloaded",timeout:60000
      });
      assert.equal(resp?.status(),200);
      await page.waitForFunction(()=>
        window.__HG_APP_READY__===true &&
        window.__HG_ROUTER_STARTED__===true &&
        window.HG_PLACES_READY===true,null,{timeout:60000});
      const modal=page.locator("#hgOnboardingModal");
      await modal.locator(".hg-onb-primary").waitFor({state:"visible",timeout:12000});
      await modal.locator(".hg-onb-primary").click({timeout:12000});
      await page.waitForFunction(()=>{
        const el=document.querySelector("#hgOnboardingModal");
        return el && el.getAttribute("aria-hidden")==="true" &&
          getComputedStyle(el).display==="none";
      },null,{timeout:12000});
      assert.equal(await page.evaluate(()=>localStorage.getItem("hg_onboarding_shown_v1")),"1");
      await page.evaluate(id=>window.HGAppRouter.toPlace(id),placeId);
      await page.waitForFunction(id=>
        document.querySelector("#placeCard")?.dataset?.currentPlaceId===id &&
        document.querySelector("#placeCard")?.classList.contains("is-open"),
        placeId,{timeout:40000});
      assert.equal((await page.locator("#pcTitle").innerText()).trim(),"Det Norske Teatret");
      const jump=page.locator('#placeCard [data-hg-place-sheet-jump="sources"]');
      await jump.waitFor({state:"visible",timeout:25000});
      assert.equal((await jump.innerText()).trim(),"Kilder");
      await jump.click({timeout:20000});
      const panel=page.locator('#placeCard [data-hg-place-sheet-section="sources"]');
      await panel.waitFor({state:"visible",timeout:25000});
      const img=panel.locator(".hg-place-source-photo img");
      assert.equal(await img.count(),1,"one documented source photo, NOT a canonical Object");
      await img.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{
        const x=document.querySelector('#placeCard [data-hg-place-sheet-section="sources"] .hg-place-source-photo img');
        return x?.complete && x.naturalWidth===800 && x.naturalHeight===800;
      },null,{timeout:25000});
      assert.equal(await img.getAttribute("src"),c41.museum_image.file);
      assert.ok((await img.getAttribute("alt"))?.length>15);
      assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
      const b=await img.boundingBox();
      assert.ok(b && b.x>=-2 && b.x+b.width<=width+2,"source photo horizontally clipped");
      const caption=panel.locator(".hg-place-source-photo figcaption");
      await caption.scrollIntoViewIfNeeded();
      assert.match(await caption.innerText(),/Lone Lunde.*Oslo Museum/);
      assert.match(await caption.innerText(),/CC BY-SA 4\.0/);
      const link=caption.locator("a");
      assert.equal(await link.getAttribute("href"),c41.museum_image.source);
      assert.equal(await link.getAttribute("target"),"_blank");
      assert.match(await link.getAttribute("rel"),/noopener/);
      assert.equal(await link.isVisible(),true);
      assert.equal(await panel.locator('a[href*="Hulda-bunaden_OHA-9.jpg"]').count(),1);
      assert.equal(await panel.locator('img[src*="detnorsketeatret.imgix.net"]').count(),0);
      assert.equal(await modal.getAttribute("aria-hidden"),"true");
      const screen=path.join(out,name+"-public-unified.png");
      await page.screenshot({path:screen,fullPage:true,timeout:20000});
      entry.status="PASS";
      entry.screenshot=screen;
      entry.image_natural_size=[800,800];
      entry.source_photo_credited=true;
      entry.juleroser_external_only=true;
      console.log("C45 public "+name+": app route -> unified Kilder -> museum photograph PASS");
    } catch (error) {
      entry.status="BLOCKED";
      entry.error=String(error);
      const screen=path.join(out,name+"-failure.png");
      await page.screenshot({path:screen,fullPage:true,timeout:10000}).catch(()=>{});
      entry.screenshot=screen;
      console.error("C45 public "+name+" FAIL: "+entry.error);
      process.exitCode=1;
    } finally {
      entry.pageerrors=errors.slice(0,10);
      report.cases.push(entry);
      await context.close();
    }
  }
  report.outcome=report.cases.length===2&&report.cases.every(c=>c.status==="PASS") ?
    "PUBLIC_UNIFIED_KILDER_BROWSER_PASS" : "BLOCKED";
  if(report.outcome==="BLOCKED")process.exitCode=1;
} catch (error) {
  report.outcome="BLOCKED";
  report.errors.push(String(error));
  console.error("C45 deployed source QA FAIL: "+String(error));
  process.exitCode=1;
} finally {
  await browser?.close();
  await api?.dispose();
  fs.writeFileSync(path.join(out,"result.json"),JSON.stringify(report,null,2)+"\n");
  console.log("C45 "+report.outcome);
}
