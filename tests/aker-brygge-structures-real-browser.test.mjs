#!/usr/bin/env node
// Real Aker Brygge PlaceCard Structures acceptance: no mocks, no force-click.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const canonical=read("data/places/by/oslo/places/aker_brygge.json");
const runtime=read("data/runtime/place-open/aker_brygge.json");
const release=read("reports/place-production/aker-brygge-two-historical-structures-release-2026-11-19.json");
const expectedIds=["aker_brygge_verkstedhallene_miljo","aker_brygge_torrdokken_historisk_1929"];
assert.deepEqual(canonical.structures.map(x=>x.id),expectedIds);
assert.deepEqual(runtime.place.structures.map(x=>x.id),expectedIds);
assert.deepEqual(canonical.place_card_profile.collection_ids,["people","structures"]);
assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","structures"]);
assert.equal(runtime.brands.length,5);
assert.equal(runtime.people.length,5);
assert.equal(release.structuresCount,2);
assert.equal(release.vFerdig,false);
for(const item of canonical.structures){
  assert.ok(fs.existsSync(path.join(root,item.image)),"Missing actual WebP: "+item.image);
  assert.match(item.image,/^bilder\/kort\/structures\/.*\.webp$/);
  assert.equal(item.imageKind,"photograph");
  assert.equal(item.imageMeta.license,"CC BY-SA 4.0");
  assert.deepEqual(item.imageMeta.outputDimensions,[1200,900]);
  assert.ok(item.imageMeta.editorialLimit);
}
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
 ".json":"application/json",".css":"text/css",".webp":"image/webp",
 ".jpg":"image/jpeg",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}
  catch{res.writeHead(400).end();return;}
  const file=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end("Not found");return;
  }
  res.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const output=path.join(root,"artifacts/aker-brygge-structures-browser");
fs.mkdirSync(output,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  for(const view of [{width:390,height:844,mobile:true},{width:1440,height:960,mobile:false}]){
    const tag=view.mobile?"mobile":"desktop";
    const context=await browser.newContext({viewport:{width:view.width,height:view.height},
      isMobile:view.mobile,hasTouch:view.mobile,locale:"nb-NO"});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e.message)));
    await context.addInitScript(()=>{
      localStorage.setItem("hg_onboarding_shown_v1","1");
      localStorage.setItem("HG_TEST_MODE","1");
      localStorage.setItem("hg_lang","nb");
    });
    try{
      await page.goto(base+"/index.html?hgTest=1#/place/aker_brygge",{waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>window.__HG_APP_READY__===true &&
        window.__HG_ROUTER_STARTED__===true &&
        document.getElementById("placeCard")?.dataset.currentPlaceId==="aker_brygge",null,{timeout:90000});
      await page.waitForFunction(()=>window.PLACES?.find(p=>p.id==="aker_brygge")?.structures?.length===2 &&
        document.getElementById("pcCategoryCollectionIcon")?.dataset.collectionItemCount==="2" &&
        document.getElementById("pcCategoryCollectionIcon")?.dataset.collectionId==="structures",null,{timeout:45000});
      await page.waitForFunction(()=>{
        const card=document.getElementById("placeCard");
        return /^place_card_profile_v2(?:_curated)?$/.test(card?.dataset.collectionProfileSource||"") &&
          card?.dataset.collectionCount==="2" && card?.dataset.collectionGridCount==="1";
      },null,{timeout:30000});
      const stateHandle=await page.waitForFunction(()=>{
        const card=document.getElementById("placeCard");
        const preview=document.querySelector("#pcCategoryCollectionIcon > img.pc-person-img");
        const brands=document.getElementById("pcBrandsIcon");
        const people=document.getElementById("pcPeopleIcon");
        const hero=document.getElementById("pcHeaderImage");
        const front=document.getElementById("pcFrontImage");
        const snapshot = {
          profile:card?.dataset.collectionProfileSource,
          count:card?.dataset.collectionCount,
          gridCount:card?.dataset.collectionGridCount,
          previewSrc:preview?.getAttribute("src"),
          previewLoaded:!!preview?.complete&&preview.naturalWidth>0,
          previewFit:preview?getComputedStyle(preview).objectFit:null,
          brandsVisible:!!brands&&!brands.hidden,
          peopleVisible:!!people&&!people.hidden,
          peopleLoaded:!!people?.querySelector("img")?.complete&&people.querySelector("img").naturalWidth>0,
          heroSrc:hero?.getAttribute("src"),frontSrc:front?.getAttribute("src"),
          heroLoaded:!!hero?.complete&&hero.naturalWidth>0,
          frontLoaded:!!front?.complete&&front.naturalWidth>0
        };
        // Core rendering and curated layout both write these counters during
        // hydration. Capture readiness and values in the same browser turn,
        // after all real member/hero images have decoded.
        return /^place_card_profile_v2(?:_curated)?$/.test(snapshot.profile||"") &&
          snapshot.count==="2" && snapshot.gridCount==="1" &&
          snapshot.peopleVisible && snapshot.peopleLoaded &&
          snapshot.previewLoaded && snapshot.heroLoaded && snapshot.frontLoaded
          ? snapshot : false;
      },null,{timeout:50000});
      const state=await stateHandle.jsonValue();
      await stateHandle.dispose();
      assert.match(state.profile,/^place_card_profile_v2(?:_curated)?$/,tag+": profile");
      assert.equal(state.count,"2",tag+": exactly People and Structures");
      assert.equal(state.gridCount,"1",tag+": gallery shows only Structures beside People");
      assert.equal(state.brandsVisible,false,tag+": unapproved Brands remain hidden");
      assert.equal(state.peopleVisible,true,tag+": existing People remain visible");
      assert.ok(state.heroSrc?.endsWith(canonical.image),tag+": existing hero unchanged");
      assert.ok(state.frontSrc?.endsWith(canonical.frontImage),tag+": existing frontImage unchanged");
      assert.equal(state.previewFit,"contain",tag+": complete Structure preview, not zoomed/cropped");
      await page.waitForFunction(()=>{
        const img=document.querySelector("#pcCategoryCollectionIcon > img.pc-person-img");
        return img?.complete&&img.naturalWidth>0;
      },null,{timeout:30000});
      const preview=await page.locator("#pcCategoryCollectionIcon > img.pc-person-img").getAttribute("src");
      assert.ok(expectedIds.some(id=>canonical.structures.find(s=>s.id===id)?.image===preview),
        tag+": preview is actual Structure member image "+preview);
      const tile=page.locator('button[data-pc-round-gallery-item="pcCategoryCollectionIcon"]');
      await tile.waitFor({state:"visible",timeout:20000});
      await page.evaluate(()=>{
        const original=window.showPlaceCardRoundPopup;
        window.showPlaceCardRoundPopup=payload=>{
          window.__akerBryggeStructuresPopup={kind:payload.kind,title:payload.title,html:payload.html};
          return original?.(payload);
        };
      });
      await tile.click({timeout:20000});
      await page.waitForFunction(()=>window.__akerBryggeStructuresPopup?.kind==="structures",
        null,{timeout:20000});
      const popup=await page.evaluate(()=>window.__akerBryggeStructuresPopup);
      assert.match(String(popup.title),/Bygg|anlegg/i,tag+": correct Structures popup");
      for(const structure of canonical.structures){
        assert.ok(popup.html.includes(structure.name),tag+": missing "+structure.id+" name");
        assert.ok(popup.html.includes(structure.image),tag+": missing "+structure.id+" photo");
        assert.ok(popup.html.includes(structure.imageMeta.credit),tag+": missing photo attribution "+structure.id);
        assert.ok(popup.html.includes(structure.imageMeta.licenseUrl),tag+": missing CC BY-SA link "+structure.id);
        assert.ok(popup.html.includes(structure.imageMeta.sourcePage),tag+": missing source link "+structure.id);
        assert.ok(popup.html.includes(structure.imageMeta.editorialLimit),
          tag+": missing limitation that prevents misidentification "+structure.id);
      }
      assert.equal(await page.locator(".hg-popup.placecard-round-popup .pc-structure-member").count(),2,
        tag+": exactly two real Structure entries");
      assert.equal(await page.locator(".hg-popup.placecard-round-popup .pc-structure-credit").count(),2,
        tag+": two credits");
      assert.equal(await page.locator(".hg-popup.placecard-round-popup [data-visual-round-item]").count(),2,
        tag+": no invented individual halls");
      await page.waitForFunction(()=>{
        const images=[...document.querySelectorAll(".hg-popup.placecard-round-popup .pc-structure-member img.pc-person-img")];
        return images.length===2&&images.every(img=>img.complete&&img.naturalWidth===1200&&img.naturalHeight===900);
      },null,{timeout:30000});
      const rows=await page.evaluate(()=>
        [...document.querySelectorAll(".hg-popup.placecard-round-popup .pc-structure-member")].map(el=>{
          const img=el.querySelector("img.pc-person-img");
          return {src:img?.getAttribute("src"),naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,
            fit:img?getComputedStyle(img).objectFit:null,alt:img?.alt};
        }));
      assert.deepEqual(rows.map(x=>x.src),canonical.structures.map(x=>x.image),
        tag+": canonical image mapping and order");
      for(const row of rows){
        assert.equal(row.fit,"contain",tag+": member photo must preserve full frame "+row.src);
        assert.ok(row.alt?.length>30,tag+": descriptive image alt");
      }
      assert.equal(errors.length,0,tag+": JavaScript errors: "+errors.join(" | "));
      await page.screenshot({path:path.join(output,tag+"-aker-brygge-structures.png"),fullPage:false});
      console.log(tag.toUpperCase()+"_AKER_BRYGGE_STRUCTURES_PASS "+
        JSON.stringify({count:rows.length,preview:preview,rows,profile:state.profile,brandHidden:!state.brandsVisible,jsErrors:errors}));
    } catch(error) {
      await page.screenshot({path:path.join(output,tag+"-failure.png"),fullPage:false}).catch(()=>{});
      throw error;
    } finally {await context.close();}
  }
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
