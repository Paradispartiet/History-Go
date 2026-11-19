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
  schema:"history_go_dnt_c51_public_assets_and_auth_gate_v2",
  place_id:placeId,
  website:base,
  scope:"Public Pages asset bytes, Objects image integrity and anonymous AHA login redirect at mobile 390x844 and desktop 1280x900. Authenticated Objects UI remains tested by local C50, not this public gate.",
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
  // A push to main can start C51 before GitHub Pages has published that commit.
  // Matching Object IDs alone is insufficient: unchanged JSON can be served with old JS/CSS.
  // Wait for the exact public release bytes before running the existing strict assertions.
  const releaseFiles=[
    sourceFile,
    "data/runtime/place-open/det_norske_teatret.json",
    "js/ui/place-rounds-visual-collections.js",
    "css/place-rounds-fill-layout.css"
  ];
  let ready=false,pendingFiles=[];
  for(let i=0;i<18;i++){
    report.deployment_attempts=i+1;
    pendingFiles=[];
    try{
      const response=await api.get(urlOf(sourceFile),{timeout:15000,headers:{"cache-control":"no-cache"}});
      if(response.ok()){
        const remote=await response.json();
        ready=remote.objects?.length===2
          && remote.objects[0]?.id===place.objects[0].id
          && remote.objects[1]?.id===place.objects[1].id
          && remote.place_card_profile?.collection_ids?.includes("objects");
        if(ready){
          for(const relative of releaseFiles){
            const liveResponse=await api.get(urlOf(relative),{timeout:15000,headers:{"cache-control":"no-cache"}});
            if(!liveResponse.ok() || hash(await liveResponse.body())!==hash(fs.readFileSync(relative))){
              pendingFiles.push(relative+(!liveResponse.ok()?" HTTP "+liveResponse.status():" checksum mismatch"));
            }
          }
          ready=pendingFiles.length===0;
        }else pendingFiles.push("Objects data and collection profile");
        if(ready)break;
      }else pendingFiles.push(sourceFile+" HTTP "+response.status());
    }catch(error){
      ready=false;
      pendingFiles.push(String(error));
    }
    if(i<17)await new Promise(resolve=>setTimeout(resolve,10000));
  }
  assert.equal(ready,true,"Public site has not yet deployed the exact C51 release bytes: "+pendingFiles.join("; "));
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
  // Production intentionally requires AHA login. This verifies the anonymous
  // redirect without credentials, NOT authenticated Objects UI (covered by C50).
  browser=await chromium.launch({headless:true});
  for(const [name,width,height] of [["mobile",390,844],["desktop",1280,900]]) {
    const context=await browser.newContext({viewport:{width,height},locale:"nb-NO",serviceWorkers:"block",permissions:[],deviceScaleFactor:1});
    const page=await context.newPage();
    const caseResult={name,width,height,outcome:"PENDING",check:"anonymous user redirected to real AHA login"};
    let phase="open-public-app";
    try {
      const res=await page.goto(base+"index.html?dnt-c51=20261021#/map",{waitUntil:"domcontentloaded",timeout:60000});
      assert.equal(res?.status(),200);
      phase="login-redirect";
      await page.waitForURL(url=>url.pathname.endsWith("/History-Go/login.html"),{timeout:30000});
      phase="login-form";
      await page.locator("#hgLoginForm").waitFor({state:"visible",timeout:15000});
      assert.ok((new URL(page.url()).searchParams.get("next")||"").includes("index.html"),"Login must preserve the original deep link");
      const shot=path.join(artifactPath,name+"-login-gate.png");
      await page.screenshot({path:shot,fullPage:true,timeout:15000});
      caseResult.screenshot=shot;
      caseResult.outcome="PASS";
      console.log("C51 PUBLIC "+name+" login gate PASS");
    } catch(error) {
      caseResult.outcome="BLOCKED";
      caseResult.phase=phase;
      caseResult.error=String(error);
      process.exitCode=1;
      console.error("C51 PUBLIC "+name+" phase="+phase+" "+String(error));
    } finally {
      report.cases.push(caseResult);
      await context.close();
    }
  }
  report.status=report.cases.length===2&&report.cases.every(x=>x.outcome==="PASS")?
    "PUBLIC_ASSETS_AND_LOGIN_GATE_PASS":"BLOCKED";
  if(report.status==="BLOCKED")process.exitCode=1;
} catch(error){
  report.status="BLOCKED";report.errors.push(String(error));process.exitCode=1;
} finally{
  await browser?.close();await api?.dispose();
  fs.writeFileSync(path.join(artifactPath,"result.json"),JSON.stringify(report,null,2)+"\n");
  console.log("DNT C51 "+report.status,JSON.stringify({attempts:report.deployment_attempts,errors:report.errors,cases:report.cases.map(x=>({name:x.name,outcome:x.outcome,phase:x.phase,error:x.error}))}));
}
