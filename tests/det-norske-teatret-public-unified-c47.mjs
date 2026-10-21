import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium, request } from "playwright";

// C47 verifies the actual PUBLIC deployed GitHub Pages application after merge;
// PR-head mobile/desktop QA is separately covered by native C44 route tests.
const base="https://paradispartiet.github.io/History-Go/";
const placeId="det_norske_teatret";
const placePath="data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const localPlace=JSON.parse(fs.readFileSync(placePath,"utf8"));
const c47=JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261021/foyer-painting-kilder-c47.json","utf8"));
const museum=JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261020/object-photo-inline-source-c41.json","utf8")).museum_image;
const out=path.resolve("artifacts/dnt-c47-public");
fs.mkdirSync(out,{recursive:true});
const sha256=data=>crypto.createHash("sha256").update(data).digest("hex");
const report={schema:"dnt_c47_public_native_sources_v1",place_id:placeId,website:base,
  status:"PENDING",attempts_to_find_deployed_source:0,http:[],cases:[],errors:[],
  scope:"Real GitHub Pages, app route and unified Kilder on Chromium 390x844 and 1280x900; not physical mobile or literal map marker tap."};
let api,browser;
try{
  api=await request.newContext({timeout:50000,ignoreHTTPSErrors:false});
  const urlOf=relative=>{
    const url=new URL(relative,base);
    url.searchParams.set("dnt-c47-proof","20261021");
    url.searchParams.set("cache-bust",Date.now().toString());
    return url.href;
  };
  const get=async(relative,kind)=>{
    const response=await api.get(urlOf(relative),{maxRedirects:3,headers:{"cache-control":"no-cache"}});
    assert.equal(response.status(),200,kind+" HTTP "+response.status());
    const bytes=await response.body();
    assert.ok(bytes.length>0,kind+" empty");
    report.http.push({kind,url:response.url(),bytes:bytes.length,sha256:sha256(bytes)});
    return bytes;
  };
  // A main push may race Pages deployment: do not misreport old pages as a regression.
  let deployed=false;
  for(let i=0;i<30;i++){
    report.attempts_to_find_deployed_source=i+1;
    try{
      const response=await api.get(urlOf(placePath),{maxRedirects:3,headers:{"cache-control":"no-cache"}});
      if(response.ok()){
        const data=await response.json();
        const hasLink=(data.externalLinks||[]).some(x=>x.previewImage===c47.new_photo.asset && x.url===c47.new_photo.source && x.credit==="Wolfmann / Wikimedia Commons");
        if(hasLink){deployed=true;break;}
      }
    }catch(error){report.errors.push("Wait attempt "+(i+1)+": "+String(error));}
    if(i<29)await new Promise(resolve=>setTimeout(resolve,20000));
  }
  assert.equal(deployed,true,"C47 documentary photo not yet published by GitHub Pages; after 10 minute wait");
  const place=JSON.parse((await get(placePath,"canonical-public-Place")).toString("utf8"));
  assert.equal(place.id,placeId);
  const previews=place.externalLinks.filter(x=>x.type==="image_source"&&x.previewImage);
  assert.equal(previews.length,2);
  const painting=previews.find(x=>x.previewImage===c47.new_photo.asset);
  assert.ok(painting);
  assert.equal(painting.credit,"Wolfmann / Wikimedia Commons");
  assert.equal(painting.license,"CC BY-SA 4.0");
  assert.equal(painting.url,c47.new_photo.source);
  assert.deepEqual(place.externalLinks,localPlace.externalLinks);
  assert.equal(sha256(await get(museum.file,"public-Madame-de-Sade-WebP")),museum.sha256);
  assert.equal(sha256(await get(c47.new_photo.asset,"public-kirkegardsmaleri-WebP")),c47.new_photo.asset_sha256);
  const js=(await get("dist/web/place-unified-surface.js","published-TypeScript-renderer")).toString("utf8");
  assert.match(js,/Dokumenterte kildebilder/);
  const css=(await get("css/place-sheet-sources.css","published-source-grid-CSS")).toString("utf8");
  assert.match(css,/object-fit:contain/);
  assert.match((await get("index.html","public-index")).toString("utf8"),/History Go/i);
  browser=await chromium.launch({headless:true});
  for(const [name,width,height] of [["mobile",390,844],["desktop",1280,900]]){
    const context=await browser.newContext({viewport:{width,height},locale:"nb-NO",serviceWorkers:"block",deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[],entry={name,width,height,outcome:"UNVERIFIED"};
    page.on("pageerror",e=>errors.push(e.message));
    try{
      const response=await page.goto(base+"index.html?dnt-c47=20261021#/map",{waitUntil:"domcontentloaded",timeout:60000});
      assert.equal(response?.status(),200);
      await page.waitForFunction(()=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true && window.HG_PLACES_READY===true,null,{timeout:60000});
      const onboarding=page.locator("#hgOnboardingModal");
      await onboarding.locator(".hg-onb-primary").waitFor({state:"visible",timeout:12000});
      await onboarding.locator(".hg-onb-primary").click({timeout:12000});
      await page.waitForFunction(()=>{
        const element=document.querySelector("#hgOnboardingModal");
        return element && element.getAttribute("aria-hidden")==="true" && getComputedStyle(element).display==="none";
      },null,{timeout:12000});
      await page.evaluate(id=>window.HGAppRouter.toPlace(id),placeId);
      await page.waitForFunction(id=>document.querySelector("#placeCard")?.dataset?.currentPlaceId===id &&
          document.querySelector("#placeCard")?.classList.contains("is-open"),placeId,{timeout:40000});
      assert.equal((await page.locator("#pcTitle").innerText()).trim(),"Det Norske Teatret");
      const nav=page.locator('#placeCard [data-hg-place-sheet-jump="sources"]');
      await nav.waitFor({state:"visible",timeout:25000});
      assert.equal((await nav.innerText()).trim(),"Kilder");
      await nav.click({timeout:20000});
      const panel=page.locator('#placeCard [data-hg-place-sheet-section="sources"]');
      await panel.waitFor({state:"visible",timeout:25000});
      const imgs=panel.locator(".hg-place-source-photo img");
      assert.equal(await imgs.count(),2,"expected exactly two documentary source photos");
      const expected=[
       {src:museum.file,credit:/Lone Lunde.*Oslo Museum/,url:museum.source},
       {src:c47.new_photo.asset,credit:/Wolfmann.*Wikimedia Commons/,url:c47.new_photo.source}
      ];
      for(let i=0;i<expected.length;i++){
        const img=imgs.nth(i);
        await img.scrollIntoViewIfNeeded();
        await page.waitForFunction(index=>{
          const x=document.querySelectorAll('#placeCard [data-hg-place-sheet-section="sources"] .hg-place-source-photo img')[index];
          return x?.complete && x.naturalWidth===800 && x.naturalHeight===800;
        },i,{timeout:25000});
        assert.equal(await img.getAttribute("src"),expected[i].src);
        assert.equal(await img.evaluate(el=>getComputedStyle(el).objectFit),"contain");
        const box=await img.boundingBox();
        assert.ok(box && box.x>=-2 && box.x+box.width<=width+2,"source photo horizontally clipped");
        const caption=panel.locator(".hg-place-source-photo figcaption").nth(i);
        assert.match(await caption.innerText(),expected[i].credit);
        assert.match(await caption.innerText(),/CC BY-SA 4\.0/);
        assert.equal(await caption.locator("a").getAttribute("href"),expected[i].url);
      }
      assert.equal(await panel.locator('img[src*="detnorsketeatret.imgix.net"]').count(),0);
      assert.equal(await panel.locator('a[href*="Hulda-bunaden_OHA-9.jpg"]').count(),1);
      assert.equal(await panel.locator('a[href*="utstillingsopning-aksel-waldemar-johannessen"]').count(),1);
      assert.equal(errors.length,0,"browser page errors");
      const shot=path.join(out,name+"-public-kilder.png");
      await page.screenshot({path:shot,fullPage:true,timeout:20000});
      entry.outcome="PASS";entry.screenshot=shot;
    }catch(error){
      entry.outcome="BLOCKED";entry.error=String(error);
      await page.screenshot({path:path.join(out,name+"-failure.png"),fullPage:true,timeout:12000}).catch(()=>{});
      process.exitCode=1;
    }finally{
      entry.pageerrors=errors;report.cases.push(entry);
      await context.close();
    }
  }
  report.status=report.cases.length===2 && report.cases.every(c=>c.outcome==="PASS")?
    "PUBLIC_KILDER_TWO_DOCUMENTARY_IMAGES_MOBILE_DESKTOP_PASS":"BLOCKED";
  if(report.status==="BLOCKED")process.exitCode=1;
}catch(error){
 report.status="BLOCKED";report.errors.push(String(error));process.exitCode=1;
}finally{
 await browser?.close();await api?.dispose();
 fs.writeFileSync(path.join(out,"result.json"),JSON.stringify(report,null,2)+"\n");
 console.log("DNT C47 "+report.status,JSON.stringify({attempts:report.attempts_to_find_deployed_source,cases:report.cases.map(x=>({name:x.name,outcome:x.outcome,error:x.error}))}));
}
