#!/usr/bin/env node
// Real full-app Tjuvholmen Structures click and picture acceptance, without mocks or force-click.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const read = relative => JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const canonical = read("data/places/by/oslo/places/tjuvholmen.json");
const runtime = read("data/runtime/place-open/tjuvholmen.json");
const ids = ["tjuvtitten","tjuvholmen_bystrand","skulpturparken_skjaeret"];
assert.deepEqual(canonical.structures.map(row=>row.id),ids);
assert.deepEqual(runtime.place.structures.map(row=>row.id),ids);
assert.deepEqual(canonical.place_card_profile.collection_ids,["people","brands","structures"]);
assert.equal(runtime.brands.length,3);
assert.equal(runtime.people.length,5);
assert.ok(runtime.people.some(person=>person.id==="renzo_piano"));
for(const structure of canonical.structures){
  assert.ok(fs.existsSync(structure.image),"Missing physical WebP: "+structure.image);
  assert.equal(structure.imageMeta.sourceIsFullOriginal,false);
  assert.equal(structure.imageMeta.fullResolutionOriginalPending,true);
}

const mime = {".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
 ".json":"application/json",".css":"text/css",".jpg":"image/jpeg",
 ".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",
 ".woff2":"font/woff2"};
const server = http.createServer((request,response)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname); }
  catch {response.writeHead(400);response.end();return;}
  const file=path.resolve(root,"."+(pathname==="/" ? "/index.html" : pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    response.writeHead(404);response.end("Not found");return;
  }
  response.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream"});
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const out=path.join(root,"artifacts","tjuvholmen-structures-browser");
fs.mkdirSync(out,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  for(const viewport of [{width:390,height:844,mobile:true},{width:1440,height:960,mobile:false}]){
    const tag=viewport.mobile?"mobile":"desktop";
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},
      isMobile:viewport.mobile,hasTouch:viewport.mobile,locale:"nb-NO"});
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",error=>errors.push(String(error.message)));
    await context.addInitScript(()=>{
      localStorage.setItem("hg_onboarding_shown_v1","1");
      localStorage.setItem("HG_TEST_MODE","1");
      localStorage.setItem("hg_lang","nb");
    });
    try{
      await page.goto(base+"/index.html?hgTest=1#/place/tjuvholmen",
        {waitUntil:"domcontentloaded",timeout:90000});
      await page.waitForFunction(()=>window.__HG_APP_READY__===true &&
        window.__HG_ROUTER_STARTED__===true &&
        document.getElementById("placeCard")?.dataset.currentPlaceId==="tjuvholmen",
        null,{timeout:90000});
      await page.waitForFunction(()=>window.PLACES?.find(item=>item.id==="tjuvholmen")?.structures?.length===3 &&
        document.getElementById("pcCategoryCollectionIcon")?.dataset.collectionItemCount==="3" &&
        document.getElementById("pcCategoryCollectionIcon")?.dataset.collectionId==="structures",
        null,{timeout:40000});
      const card=page.locator("#placeCard");
      assert.equal(await card.getAttribute("data-collection-profile-source"),
        "place_card_profile_v2_curated",tag+": curated profile");
      assert.equal(await card.getAttribute("data-collection-requested-count"),"3",tag+": three collections");
      try {
        await page.locator("#pcCategoryCollectionIcon").waitFor({state:"visible",timeout:16000});
      }catch(error){
        const diagnostic=await page.evaluate(()=>{
          const card=document.getElementById("placeCard");
          const icon=document.getElementById("pcCategoryCollectionIcon");
          const grid=card?.querySelector(".pc-icons-quad");
          const place=window.PLACES?.find(p=>p.id==="tjuvholmen");
          const report=el=>el?{hidden:el.hidden,ariaHidden:el.getAttribute("aria-hidden"),
            className:el.className,inlineStyle:el.getAttribute("style"),
            computed:{display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility,opacity:getComputedStyle(el).opacity},
            rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height},
            parent:el.parentElement?.className}:null;
          return {card:report(card),grid:report(grid),icon:report(icon),
            selected:window.HGPlaceCardCollections?.getConfigured?.(place),
            actualProfile:place?.place_card_profile,
            cardData:{...card?.dataset},gridData:{...grid?.dataset},
            html:icon?.outerHTML.slice(0,650)};
        });
        console.error(tag+" STRUCTURES_VISIBILITY_DIAGNOSTIC",JSON.stringify(diagnostic));
        await page.screenshot({path:path.join(out,tag+"-structures-failed-visible.png"),fullPage:false}).catch(()=>{});
        throw error;
      }
      assert.equal(await page.locator("#pcBrandsIcon").isVisible(),true,tag+": Brands card visible");
      assert.equal(await page.locator("#pcPeopleIcon").isVisible(),true,tag+": People card visible");
      assert.equal(await page.locator("#pcObjectsIcon").isVisible(),false,tag+": no filler Objects card");

      await page.waitForFunction(()=>{
        const image=document.querySelector("#pcCategoryCollectionIcon img");
        return image?.complete && image.naturalWidth>0;
      },null,{timeout:30000});
      await page.evaluate(()=>{
        const original=window.showPlaceCardRoundPopup;
        window.showPlaceCardRoundPopup=payload=>{
          window.__tjuvholmenStructuresPopup={title:payload.title,kind:payload.kind,html:payload.html};
          return original?.(payload);
        };
      });
      await page.locator("#pcCategoryCollectionIcon").click({timeout:20000});
      await page.waitForFunction(()=>window.__tjuvholmenStructuresPopup?.kind==="structures",
        null,{timeout:20000});
      const popup=await page.evaluate(()=>window.__tjuvholmenStructuresPopup);
      for(const structure of canonical.structures){
        assert.ok(popup.html.includes(structure.name),tag+": missing "+structure.name);
        assert.ok(popup.html.includes(structure.image),tag+": missing image for "+structure.id);
      }
      assert.equal(await page.locator("#pcCategoryCollectionList [data-visual-round-item]").count(),3,
        tag+": three actual Structures in popup");
      const title=String(popup.title);
      assert.match(title,/Bygg|byrom|anlegg/i,tag+": category title");

      await page.screenshot({path:path.join(out,tag+"-structures-popup.png"),fullPage:false});
      console.log(tag.toUpperCase()+"_TJUVHOLMEN_STRUCTURES_PASS",ids.join(","),JSON.stringify({popup:title,pageErrors:errors}));
    }finally{await context.close();}
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
