#!/usr/bin/env node
/**
 * Aker Brygge: real (unmocked) PlaceCard Structures acceptance.
 * Tests the current canonical two sourced images, not unrelated places.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import {chromium} from "playwright";

const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const place=read("data/places/by/oslo/places/aker_brygge.json");
const runtime=read("data/runtime/place-open/aker_brygge.json");
const workcard=read("reports/place-production/aker-brygge-workcard-current.json");
const ids=["aker_brygge_verkstedhallene_miljo","aker_brygge_torrdokken_historisk_1929"];
assert.deepEqual(place.structures.map(x=>x.id),ids,"Canonical Structures IDs/order");
assert.deepEqual(runtime.place.structures.map(x=>x.id),ids,"Place-open Structures IDs/order");
assert.deepEqual(place.place_card_profile.collection_ids,["people","structures"]);
assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","structures"]);
assert.equal(workcard.vferdig.status,"NOT_CLAIMED");
assert.equal(runtime.brands.length,9,"Nine registered but hidden Brands must remain intact");
assert.ok(runtime.people.length>=1,"People preserved");
for(const structure of place.structures){
 assert.ok(fs.existsSync(structure.image),"Missing physical image "+structure.image);
 const bytes=fs.readFileSync(structure.image);
 const sha=crypto.createHash("sha256").update(bytes).digest("hex");
 assert.equal(sha,structure.imageMeta.assetSha256,"WebP SHA mismatch: "+structure.id);
 assert.equal(structure.imageMeta.license,"CC BY-SA 4.0");
 assert.ok(structure.imageMeta.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(structure.imageMeta.credit && structure.imageMeta.licenseUrl);
}
assert.match(place.structures[0].desc,/verken Verkstedhallen eller Maskinhallen enkeltvis/i,"Do not identify a specific hall without proof");
assert.match(place.structures[1].desc,/1929/);
assert.match(place.structures[1].imageMeta.editorialLimit,/historisk|1929/i);
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json",".css":"text/css",".webp":"image/webp",".jpg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer((request,response)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);}catch{response.writeHead(400).end();return;}
 const file=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end("Not found");return;}
 response.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
 fs.createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const out=path.join(root,"artifacts","aker-brygge-structures-real-browser");
fs.mkdirSync(out,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const viewport of [{width:390,height:844,mobile:true},{width:1440,height:960,mobile:false}]){
  const tag=viewport.mobile?"mobile":"desktop";
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.mobile,hasTouch:viewport.mobile,locale:"nb-NO"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(String(error.message)));
  await context.addInitScript(()=>{
   localStorage.setItem("hg_onboarding_shown_v1","1");
   localStorage.setItem("HG_TEST_MODE","1");
   localStorage.setItem("hg_lang","nb");
  });
  try{
   await page.goto(base+"/index.html?hgTest=1#/place/aker_brygge",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.__HG_APP_READY__===true&&window.__HG_ROUTER_STARTED__===true&&
     document.getElementById("placeCard")?.dataset.currentPlaceId==="aker_brygge",null,{timeout:90000});
   try {
    await page.waitForFunction(()=>{
      const p=window.PLACES?.find(x=>x.id==="aker_brygge");
      const icon=document.getElementById("pcCategoryCollectionIcon");
      const card=document.getElementById("placeCard");
      return p?.structures?.length===2&&icon?.dataset.collectionItemCount==="2"&&
        icon?.dataset.collectionId==="structures"&&card?.dataset.collectionProfileSource==="place_card_profile_v2";
    },null,{timeout:28000});
   } catch (error) {
    const diagnostic=await page.evaluate(()=>{
      const p=window.PLACES?.find(x=>x.id==="aker_brygge"),card=document.getElementById("placeCard");
      const icon=document.getElementById("pcCategoryCollectionIcon");
      const people=document.getElementById("pcPeopleIcon"),brands=document.getElementById("pcBrandsIcon");
      return {placeReady:!!p,placeStructCount:p?.structures?.length,placeStructures:p?.structures?.map(x=>({id:x.id,img:x.image})),
        configuredProfile:p?.place_card_profile,cardData:{...card?.dataset},
        iconData:{...icon?.dataset},iconHidden:icon?.hidden,iconHtml:icon?.outerHTML.slice(0,1100),
        peopleHidden:people?.hidden,brandsHidden:brands?.hidden,
        collectionAdapterReady:typeof window.HGPlaceCardCollections?.apply,
        collectionConfigured:window.HGPlaceCardCollections?.getConfigured?.(p),
        hasLoadErrors:window.__HG_APP_READY__===false};
    });
    console.error(tag+" AKER_BRYGGE_STRUCTURES_STATE_DIAGNOSTIC",JSON.stringify(diagnostic));
    await page.screenshot({path:path.join(out,tag+"-structures-hydration-diagnostic.png"),fullPage:false}).catch(()=>{});
    throw error;
   }
   const readLayout=()=>page.evaluate(()=>{
    const card=document.getElementById("placeCard"),icon=document.getElementById("pcCategoryCollectionIcon"),people=document.getElementById("pcPeopleIcon");
    const brands=document.getElementById("pcBrandsIcon"),header=document.getElementById("pcHeaderImage"),front=document.getElementById("pcFrontImage");
    const preview=icon?.querySelector("img");
    return {profile:card?.dataset.collectionProfileSource,count:card?.dataset.collectionCount,
      grid:card?.dataset.collectionGridCount,structuresId:icon?.dataset.collectionId,
      structuresCount:icon?.dataset.collectionItemCount,peopleVisible:!!people&&!people.hidden,
      brandsVisible:!!brands&&!brands.hidden,
      headerLoaded:header?.complete&&header.naturalWidth>0,frontLoaded:front?.complete&&front.naturalWidth>0,
      previewLoaded:preview?.complete&&preview.naturalWidth>0,previewSrc:preview?.getAttribute("src"),
      previewVisible:!!icon&&!icon.hidden};
   });
   await page.waitForFunction(()=>{
     const icon=document.getElementById("pcCategoryCollectionIcon"),img=icon?.querySelector("img");
     return img?.complete&&img.naturalWidth>0;
   },null,{timeout:45000});
   const before=await readLayout();
   assert.equal(before.profile,"place_card_profile_v2",tag+": canonical profile");
   assert.equal(before.count,"2",tag+": only People + Structures");
   assert.equal(before.grid,"1",tag+": one Structures gallery slot");
   assert.equal(before.structuresId,"structures");
   assert.equal(before.structuresCount,"2");
   assert.ok(before.peopleVisible&&before.previewVisible&&!before.brandsVisible,tag+": no hidden/empty wrong collections");
   assert.ok(before.headerLoaded&&before.frontLoaded&&before.previewLoaded,tag+": actual images loaded");
   assert.ok(before.previewSrc?.startsWith("bilder/kort/structures/"),tag+": valid Structure photo preview");
   // Real click; neither popup content nor UI event is mocked.
   await page.evaluate(()=>{
    const original=window.showPlaceCardRoundPopup;
    window.showPlaceCardRoundPopup=payload=>{
      window.__akerBryggeStructuresPopup={title:payload.title,kind:payload.kind,html:payload.html};
      return original?.(payload);
    };
   });
   const tile=page.locator('button[data-pc-round-gallery-item="pcCategoryCollectionIcon"]');
   await tile.waitFor({state:"visible",timeout:20000});
   await tile.click({timeout:20000});
   await page.waitForFunction(()=>window.__akerBryggeStructuresPopup?.kind==="structures",null,{timeout:30000});
   const popup=await page.evaluate(()=>window.__akerBryggeStructuresPopup);
   assert.match(String(popup.title),/bygg|byrom|anlegg/i,tag+": Structures title");
   for(const structure of place.structures){
    assert.ok(popup.html.includes(structure.name),tag+": popup missing "+structure.name);
    assert.ok(popup.html.includes(structure.image),tag+": missing original image reference "+structure.id);
    assert.ok(popup.html.includes(structure.imageMeta.credit),tag+": photographer missing "+structure.id);
    assert.ok(popup.html.includes(structure.imageMeta.licenseUrl),tag+": CC license missing "+structure.id);
    assert.ok(popup.html.includes(structure.imageMeta.sourcePage),tag+": original Commons source missing "+structure.id);
    assert.ok(popup.html.includes(structure.id==="aker_brygge_verkstedhallene_miljo"?"enkeltvis":"1929"),tag+": missing historical/identity disclosure "+structure.id);
   }
   assert.equal(await page.locator("#pcCategoryCollectionList [data-visual-round-item]").count(),2,tag+": two actual entries");
   assert.equal(await page.locator("#pcCategoryCollectionList .pc-structure-credit").count(),2,tag+": two visible photo credits");
   await page.waitForFunction(()=>{
    const images=[...document.querySelectorAll("#pcCategoryCollectionList img")];
    return images.length>=2&&images.every(img=>img.complete&&img.naturalWidth>0);
   },null,{timeout:30000});
   assert.equal(errors.length,0,tag+": browser JavaScript errors: "+errors.join(" | "));
   await page.screenshot({path:path.join(out,tag+"-aker-brygge-structures.png"),fullPage:false});
   console.log(tag.toUpperCase()+"_AKER_BRYGGE_STRUCTURES_BROWSER_PASS",JSON.stringify({before,ids,popupTitle:popup.title,popupImages:2,errors}));
  }finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
