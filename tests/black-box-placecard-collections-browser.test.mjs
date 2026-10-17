import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const place = JSON.parse(fs.readFileSync(path.join(root, "data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json"), "utf8"));
const runtime = JSON.parse(fs.readFileSync(path.join(root, "data/runtime/place-open/black_box_teater.json"), "utf8"));
const people = JSON.parse(fs.readFileSync(path.join(root, "data/people/scenekunst/oslo/black_box_teater/inger_buresund.json"), "utf8"));
assert.equal(place.productions.length, 2);
assert.equal(runtime.place.productions.length, 2);
assert.deepEqual(runtime.place.productions.map(p => p.image), place.productions.map(p => p.image));
assert.deepEqual(place.place_card_profile.collection_ids, ["people", "productions"]);
assert.equal(people[0].placeId, place.id);

const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
const a = source.indexOf('<div id="placeCard" aria-hidden="true">');
const b = source.indexOf('<footer class="site-footer', a);
assert.ok(a >= 0 && b > a, "Actual PlaceCard DOM is present");
const dom = source.slice(a, b).replace('aria-hidden="true"', 'aria-hidden="false"');
const fixture = `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/placeCard.css">
<link rel="stylesheet" href="/css/place-rounds-fill-layout.css">
<link rel="stylesheet" href="/css/place-sheet.css">
<style>body{margin:0;background:#16181c;color:#fff;font-family:system-ui}#placeCard{display:block;position:relative;inset:auto;max-height:none;overflow:visible}#auditPopup{background:#232832;color:#fff;padding:16px;margin:16px;border-radius:12px}#auditPopup img{max-width:90px;height:auto}</style></head>
<body class="hg-app hg-phone"><main style="max-width:1040px;margin:0 auto">
${dom}<div id="auditPopup" hidden></div></main>
<script>window.PLACES=${JSON.stringify([place])};window.getPeopleForPlace=()=>${JSON.stringify(people)};
window.showPlaceCardRoundPopup=payload=>{window.__lastPopup=payload;const out=document.getElementById('auditPopup');out.hidden=false;out.innerHTML='<h3>'+payload.title+'</h3>'+payload.html};
document.getElementById('placeCard').dataset.currentPlaceId='black_box_teater';
document.getElementById('placeCard').classList.add('is-open');
document.getElementById('pcTitle').textContent='Black Box teater';
document.getElementById('pcDesc').textContent=${JSON.stringify(place.desc)};
document.getElementById('pcFrontImage').hidden=true;
document.getElementById('pcHeaderImage').hidden=true;
</script>
<script src="/js/ui/place-rounds-visual-collections.js"></script>
<script src="/js/ui/place-rounds-fill-layout.js"></script>
<script>addEventListener('DOMContentLoaded',()=>window.HGPlaceCardCollections.apply(window.PLACES[0]).then(()=>{window.HGPlaceRoundsFillLayout.layout();window.__ready=true}).catch(e=>{window.__error=String(e.stack||e)}))</script>
</body></html>`;

const contentType = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".avif":"image/avif", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg" };
const server = http.createServer((req,res) => {
  const u = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if(u === "/__audit__/black-box.html"){ res.writeHead(200,{"content-type":contentType[".html"]}); res.end(fixture); return; }
  const file = path.resolve(root, "." + u);
  if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){res.writeHead(404); res.end(); return;}
  res.writeHead(200,{"content-type":contentType[path.extname(file)]||"application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = "http://127.0.0.1:" + server.address().port;
const out = path.join(root, "reports/visual-qa/black-box-teater/placecard-collections-20261013");
fs.mkdirSync(out,{recursive:true});
const results = [];
let browser;
try {
  browser = await chromium.launch({headless:true});
  for(const width of [390,1440]) {
    const ctx = await browser.newContext({viewport:{width,height:900},serviceWorkers:"block"});
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror",err => errors.push(err.message));
    await page.goto(address+"/__audit__/black-box.html",{waitUntil:"load"});
    await page.waitForFunction(()=>window.__ready||window.__error,{timeout:30000});
    assert.equal(await page.evaluate(()=>window.__error||null),null);
    console.log("BB_DIAG "+JSON.stringify(await page.evaluate(()=>({count:document.getElementById("placeCard").dataset.collectionCount,profile:window.PLACES[0].place_card_profile,productions:window.PLACES[0].productions?.map(x=>({name:x.name,image:x.image})),configured:window.HGPlaceCardCollections.getConfigured(window.PLACES[0]),categoryHtml:document.getElementById("pcCategoryCollectionIcon")?.outerHTML?.slice(0,900),peopleHtml:document.getElementById("pcPeopleIcon")?.outerHTML?.slice(0,900),categoryList:document.getElementById("pcCategoryCollectionList")?.innerHTML?.slice(0,600)}))));
    assert.equal(await page.locator("#placeCard").getAttribute("data-collection-count"),"2");
    assert.equal(await page.locator("#pcCategoryCollectionIcon").getAttribute("data-collection-item-count"),"2");
    assert.equal(await page.locator("#pcCategoryCollectionIcon").getAttribute("data-collection-profile-source"),null);
    assert.equal(await page.locator("#pcPeopleIcon").isVisible(),true);
    assert.equal(await page.locator("#pcCategoryCollectionIcon").isVisible(),true);
    assert.equal(await page.locator("#pcObjectsIcon").isVisible(),false);
    assert.equal(await page.locator("#pcBrandsIcon").isVisible(),false);
    const icons = await page.locator("#pcCategoryCollectionIcon img").count();
    assert.equal(icons,1);
    await page.locator("#pcCategoryCollectionIcon img").evaluate(image=>image.decode());
    const image = await page.locator("#pcCategoryCollectionIcon img").evaluate(el=>({width:el.naturalWidth,height:el.naturalHeight,src:el.getAttribute("src")}));
    assert.ok(image.width>=800&&image.height>=400,"Actual AVIF production image decoded at "+width);
    assert.ok(image.src.endsWith(".avif"));
    await page.locator("#pcPeopleIcon img").evaluate(image=>image.decode());
    const bounds = await page.evaluate(()=>{
      const dim = id => {const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,width:r.width,height:r.height}};
      return {grid:dim("placeCard"),people:dim("pcPeopleIcon"),production:dim("pcCategoryCollectionIcon")};
    });
    assert.ok(bounds.people.width>0&&bounds.production.width>0);
    await page.screenshot({path:path.join(out,"chromium-"+width+"-collections.png"),fullPage:true});
    await page.locator("#pcCategoryCollectionIcon").click();
    await page.waitForFunction(()=>window.__lastPopup?.kind==="productions");
    assert.equal(await page.locator("#auditPopup [data-visual-round-item]").count(),2);
    const copy=await page.locator("#auditPopup").innerText();
    assert.match(copy,/Konsert for Grønland/);
    assert.match(copy,/Ways of Seeing/);
    const imagePaths=await page.locator("#auditPopup [data-visual-round-item] img").evaluateAll(els=>els.map(el=>el.getAttribute("src")));
    assert.equal(imagePaths.length,2);
    assert.ok(imagePaths.every(s=>s.endsWith(".avif")));
    await page.locator("#auditPopup [data-visual-round-item] img").evaluateAll(async els=>{await Promise.all(els.map(el=>el.decode()));return true;});
    assert.deepEqual(errors,[]);
    await page.screenshot({path:path.join(out,"chromium-"+width+"-productions.png"),fullPage:true});
    results.push({width,engine:"chromium",status:"PASS",collections:2,productions:2,firstImage:image,errors,frontImage:"not_yet_integrated_license_pending",scope:"canonical_PlaceCard_DOM_collection_runtime_in_local_fixture"});
    await ctx.close();
    console.log("Black Box canonical PlaceCard collections "+width+"px PASS");
  }
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(out,"browser-results.json"),JSON.stringify({scope:"Black Box actual place and People JSON + canonical PlaceCard DOM and collections renderer; not complete production map-app E2E",results},null,2)+"\n");
}
