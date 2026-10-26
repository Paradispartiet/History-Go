import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium, request } from "playwright";

const base="https://paradispartiet.github.io/History-Go/";
const placeId="det_norske_teatret";
const sourceFile="data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const place=JSON.parse(fs.readFileSync(sourceFile,"utf8"));
const runtimeLocal=JSON.parse(fs.readFileSync("data/runtime/place-open/det_norske_teatret.json","utf8"));
const museum=JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261020/object-image-c32-generated.json","utf8"));
const painting=JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261021/foyer-painting-kilder-c47.json","utf8"));
assert.equal(place.id,placeId);
assert.equal(place.objects?.length,2);
const hash=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const artifactPath="artifacts/dnt-c51-public";
fs.mkdirSync(artifactPath,{recursive:true});
const report={
  schema:"history_go_dnt_c51_public_objects_verified_v1",
  place_id:placeId,
  website:base,
  scope:"Real deployed GitHub Pages native route and actual Objects popup, Chromium mobile 390x844 and desktop 1280x900; not physical device or literal map marker tap.",
  status:"PENDING",deployment_attempts:0,http:[],cases:[],errors:[]
};
let api,browser;
const urlOf=relative=>{
  const url=new URL(relative,base);
  url.searchParams.set("c51-proof","20261021");
  url.searchParams.set("cache-bust",Date.now().toString());
  return url.href;
};
const get=async(relative,kind)=>{
  const response=await api.get(urlOf(relative),{headers:{"cache-control":"no-cache"},timeout:45000,maxRedirects:3});
  assert.equal(response.status(),200,kind+" HTTP "+response.status());
  const bytes=await response.body();
  assert.ok(bytes.length>0,kind+" empty");
  report.http.push({kind,path:relative,sha256:hash(bytes),bytes:bytes.length,status:response.status()});
  return bytes;
};
const requireExactMedia=async(relative,label)=>{
  const live=await get(relative,label);
  const local=fs.readFileSync(relative);
  assert.equal(hash(live),hash(local),label+" public bytes differ from canonical source");
  return live;
};
try {
  api=await request.newContext({timeout:45000,ignoreHTTPSErrors:false});
  let ready=false;
  for(let i=0;i<18;i++){
    report.deployment_attempts=i+1;
    try{
      const response=await api.get(urlOf(sourceFile),{timeout:15000,headers:{"cache-control":"no-cache"}});
      if(response.ok()){
        const remote=await response.json();
        ready=remote.objects?.length===2
          && remote.objects[0]?.id===place.objects[0].id
          && remote.objects[1]?.id===place.objects[1].id
          && remote.place_card_profile?.collection_ids?.includes("objects");
        if(ready)break;
      }
    }catch(error){report.errors.push("Deploy attempt "+(i+1)+": "+String(error));}
    if(i<17)await new Promise(resolve=>setTimeout(resolve,10000));
  }
  assert.equal(ready,true,"Public site has not deployed C50 canonical Objects");
  const published=JSON.parse((await get(sourceFile,"public-canonical-place")).toString("utf8"));
  assert.deepEqual(published.objects,place.objects,"public Objects differ from main branch");
  assert.deepEqual(published.place_card_profile,place.place_card_profile,"public PlaceCard profile differs");
  const runtime=JSON.parse((await get("data/runtime/place-open/det_norske_teatret.json","public-place-open")).toString("utf8"));
  assert.deepEqual(runtime.place.objects,place.objects,"public Place-open Object members unsynced");
  assert.deepEqual(runtime.place.place_card_profile,place.place_card_profile);
  assert.deepEqual(runtimeLocal.place.objects,place.objects);
  assert.equal(hash(await requireExactMedia(museum.asset_path,"licensed-costume-webp")),museum.asset_sha256);
  await requireExactMedia(place.objects[1].image,"curtain-illustration-svg");
  await requireExactMedia(painting.new_photo.asset,"foyer-documentary-photo");
  const runtimeJs=await requireExactMedia("js/ui/place-rounds-visual-collections.js","live-Objects-renderer");
  assert.match(runtimeJs.toString("utf8"),/pc-object-preview-disclosure/);
  const css=await requireExactMedia("css/place-rounds-fill-layout.css","live-Objects-css");
  assert.match(css.toString("utf8"),/pc-object-member-image/);
  const index=await get("index.html","public-index");
  assert.match(index.toString("utf8"),/History Go/i);
  browser=await chromium.launch({headless:true});
  for(const [name,width,height] of [["mobile",390,844],["desktop",1280,900]]) {
    const context=await browser.newContext({viewport:{width,height},locale:"nb-NO",serviceWorkers:"block",permissions:[],deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[],caseResult={name,width,height,outcome:"PENDING"};
    let phase="launch";
    page.on("pageerror",error=>errors.push(error.message));
    try {
      phase="open-public-app";
      const res=await page.goto(base+"index.html?dnt-c51=20261021#/map",{waitUntil:"domcontentloaded",timeout:60000});
      assert.equal(res?.status(),200);
      phase="app-ready";
      await page.waitForFunction(()=>window.__HG_APP_READY__===true && window.__HG_ROUTER_STARTED__===true && window.HG_PLACES_READY===true,null,{timeout:60000});
      // On a fresh public browser profile onboarding appears asynchronously;
      // an immediate isVisible() check can race the overlay and invalidate mobile QA.
      phase="onboarding-visible";
      const onboarding=page.locator("#hgOnboardingModal");
      const intro=onboarding.locator(".hg-onb-primary");
      await intro.waitFor({state:"visible",timeout:18000});
      phase="dismiss-onboarding";
      await intro.click({timeout:15000});
      await page.waitForFunction(()=>{
        const modal=document.querySelector("#hgOnboardingModal");
        return modal?.getAttribute("aria-hidden")==="true" && getComputedStyle(modal).display==="none";
      },null,{timeout:15000});
      assert.equal(await page.evaluate(()=>localStorage.getItem("hg_onboarding_shown_v1")),"1");
      phase="route-to-place";
      await page.evaluate(id=>window.HGAppRouter.toPlace(id),placeId);
      phase="wait-for-place";
      await page.waitForFunction(id=>
        document.querySelector("#placeCard")?.dataset?.currentPlaceId===id
        && document.querySelector("#placeCard")?.classList.contains("is-open"),placeId,{timeout:45000});
      assert.equal((await page.locator("#pcTitle").innerText()).trim(),"Det Norske Teatret");
      phase="objects-preview";
      await page.waitForFunction(()=>{
        const icon=document.querySelector("#pcObjectsIcon");
        return icon && !icon.hidden && icon.dataset.collectionItemCount==="2" && icon.dataset.previewStatus==="member-image";
      },null,{timeout:30000});
      const icon=page.locator("#pcObjectsIcon");
      assert.equal(await icon.getAttribute("data-collection-id"),"objects");
      const preview=icon.locator("img.pc-person-img");
      await preview.waitFor({state:"visible",timeout:15000});
      assert.equal(await preview.getAttribute("src"),place.objects[0].image);
      await page.waitForFunction(src=>{
        const img=document.querySelector("#pcObjectsIcon img.pc-person-img");
        return img?.complete && img.naturalWidth===800 && img.getAttribute("src")===src;
      },place.objects[0].image,{timeout:15000});
      const previewShot=path.join(artifactPath,name+"-public-objects-preview.png");
      await icon.screenshot({path:previewShot,timeout:20000});
      phase="click-objects";
      await icon.click({timeout:15000});
      phase="objects-members";
      await page.waitForFunction(()=>{
        const visible=[...document.querySelectorAll(".pc-round-popup-objects .pc-object-member")];
        return visible.length===2 && visible.some(row=>/Illustrasjon – ikke fotografi/.test(row.textContent));
      },null,{timeout:25000});
      const rows=page.locator(".pc-round-popup-objects .pc-object-member:visible");
      assert.equal(await rows.count(),2);
      const images=rows.locator("img.pc-object-member-image");
      assert.equal(await images.count(),2);
      phase="images-decoded";
      await page.waitForFunction(()=>{
        const imgs=[...document.querySelectorAll(".pc-round-popup-objects .pc-object-member img")];
        return imgs.length===2 && imgs.every(x=>x.complete && x.naturalWidth>0 && x.naturalHeight>0);
      },null,{timeout:18000});
      const minimum=width<=520?72:90;
      for(let i=0;i<2;i++){
        const box=await images.nth(i).boundingBox();
        assert.ok(box&&box.width>=minimum&&box.height>=minimum,"member image too small: "+name+" "+JSON.stringify(box));
        assert.ok(box.x>=-2&&box.x+box.width<=width+2,"image clipped horizontally: "+name);
      }
      const photoDims=await images.first().evaluate(img=>[img.naturalWidth,img.naturalHeight]);
      const svgDims=await images.nth(1).evaluate(img=>[img.naturalWidth,img.naturalHeight]);
      assert.deepEqual(photoDims,[800,800]);
      assert.deepEqual(svgDims,[1200,760]);
      assert.match(await rows.first().innerText(),/Madame de Sade/);
      assert.match(await rows.first().innerText(),/Lone Lunde.*Oslo Museum/s);
      assert.match(await rows.first().innerText(),/CC BY-SA 4\.0/);
      assert.match(await rows.nth(1).innerText(),/Jan Groth/);
      assert.match(await rows.nth(1).innerText(),/Illustrasjon – ikke fotografi/);
      assert.equal(await rows.first().locator("a.pc-object-source").getAttribute("href"),place.objects[0].imageMeta.sourceUrl);
      assert.equal(await rows.nth(1).locator("a.pc-object-source").getAttribute("href"),place.objects[1].imageMeta.sourceUrl);
      assert.equal(errors.length,0,"public app JavaScript exceptions");
      await rows.nth(1).scrollIntoViewIfNeeded();
      const shot=path.join(artifactPath,name+"-public-objects-members.png");
      await page.screenshot({path:shot,fullPage:true,timeout:20000});
      caseResult.outcome="PASS";
      caseResult.screenshot=shot;
      caseResult.preview=previewShot;
      caseResult.members=2;
      caseResult.images_decoded=true;
      caseResult.media_sizes=[photoDims,svgDims];
      console.log("C51 PUBLIC "+name+" Objects PASS");
    }catch(error){
      caseResult.outcome="BLOCKED";caseResult.phase=phase;caseResult.error=String(error);
      const failure=path.join(artifactPath,name+"-failure.png");
      await page.screenshot({path:failure,fullPage:true,timeout:10000}).catch(()=>{});
      caseResult.screenshot=failure;
      process.exitCode=1;
      console.error("C51 PUBLIC "+name+" phase="+phase+" "+String(error));
    }finally{
      caseResult.page_errors=errors.slice(0,10);
      report.cases.push(caseResult);
      await context.close();
    }
  }
  report.status=report.cases.length===2&&report.cases.every(x=>x.outcome==="PASS")?
    "PUBLIC_OBJECTS_MOBILE_DESKTOP_PASS":"BLOCKED";
  if(report.status==="BLOCKED")process.exitCode=1;
} catch(error){
  report.status="BLOCKED";report.errors.push(String(error));process.exitCode=1;
} finally{
  await browser?.close();await api?.dispose();
  fs.writeFileSync(path.join(artifactPath,"result.json"),JSON.stringify(report,null,2)+"\n");
  console.log("DNT C51 "+report.status,JSON.stringify({attempts:report.deployment_attempts,cases:report.cases.map(x=>({name:x.name,outcome:x.outcome,phase:x.phase,error:x.error}))}));
}
