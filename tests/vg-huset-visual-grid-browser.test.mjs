import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, webkit } from "playwright";

const root=process.cwd();
const payload=JSON.parse(fs.readFileSync("data/runtime/place-open/vg_huset.json","utf8"));
assert.equal(payload.place.id,"vg_huset");
const stylePaths=["/css/placeCard.css","/css/place-unified-surface.css","/css/place-sheet.css","/css/place-sheet-phase6.css","/css/place-onsite-surface.css","/css/place-rounds-fill-layout.css"];
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 if(name==="/"){res.writeHead(200,{"content-type":mime[".html"]});res.end("<!doctype html><html lang='nb'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body></body></html>");return;}
 const resolved=path.resolve(root,"."+name);
 if(!resolved.startsWith(root+path.sep)||!fs.existsSync(resolved)||fs.statSync(resolved).isDirectory()){res.writeHead(404);res.end("not found");return;}
 res.writeHead(200,{"content-type":mime[path.extname(resolved)]||"application/octet-stream"});
 res.end(fs.readFileSync(resolved));
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await (process.env.HG_BROWSER_ENGINE === "webkit" ? webkit : chromium).launch({headless:true});
 for(const [width,height] of [[390,844],[768,1024],[1280,900]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errs=[];page.on("pageerror",x=>errs.push(x.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/");
  for(const url of stylePaths)await page.addStyleTag({url});
  await page.evaluate(({place,people})=>{
   document.body.className="hg-app"+(innerWidth<=720?" hg-phone":"");
   document.body.innerHTML=`
    <div id="placeCard" class="is-open is-unified-place is-place-sheet-phase1 is-place-sheet-direct" data-current-place-id="vg_huset">
      <div class="pc-body"><section class="pc-sheet-shell">
       <div class="pc-sheet-hero"><div class="pc-sheet-hero-copy"><div class="pc-text">
        <div id="pcStatusBar"></div>
        <div id="pcHeaderHero" class="pc-heading-hero has-photo-source has-image">
         <img id="pcHeaderImage" class="pc-heading-image" alt=""><div class="pc-heading-content"><div class="pc-title-row">
          <h2 id="pcTitle">VG-huset</h2><div id="pcBadgesIcon" class="pc-round">Merker</div>
         </div></div>
        </div><p id="pcDesc">VG-huset i Akersgata 55, fra 1994.</p>
       </div></div>
       <div class="pc-sheet-hero-media">
        <div class="pc-frontcard" id="pcFrontCardFlip" role="button" tabindex="0"><div class="pc-card-flip-inner">
          <div class="pc-card-face pc-card-face-front"><img id="pcFrontImage" alt="VG-huset"></div>
          <div class="pc-card-face pc-card-face-back"><div id="pcQuizCardContent" hidden></div></div>
        </div></div>
        <div class="pc-sheet-explore-grid">
         <div class="pc-side-stack"><div class="pc-icons-quad">
          <div id="pcPeopleIcon" class="pc-round"></div>
          <div id="pcBrandsIcon" class="pc-round"></div>
         </div></div>
         <div id="pcEventsBox" class="pc-quad pc-events-quad"></div>
        </div>
       </div></div>
      </section><div id="pcPeopleList"></div><div id="pcObjectsList"></div><div id="pcBrandsList"></div></div>
    </div><button id="pcQuiz" type="button">Ta quiz</button>`;
   window.PLACES=[place];
   window.getPeopleForPlace=()=>people;
   window.showPlaceCardRoundPopup=payload=>{window.__lastPopup=payload};
   document.getElementById("pcFrontImage").src=String(place.frontImage);
   const header=String(place.image);
   document.getElementById("pcHeaderImage").src=header;
  },{place:payload.place,people:payload.people});
  await page.addScriptTag({url:"/js/brands/brands_loader.js"});
  await page.addScriptTag({url:"/js/ui/place-rounds-visual-collections.js"});
  await page.evaluate(async()=>{await window.HGBrands.init();await window.HGPlaceCardCollections.apply(window.PLACES[0]);});
  const ids=["objects","brands","productions"];
  const items=await page.locator(".pc-icons-quad .pc-collection:not([hidden])").evaluateAll(nodes=>nodes.map(n=>({kind:n.dataset.collectionId,preview:n.querySelector("img")?.getAttribute("src"),box:(()=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom}})()})));
  assert.deepEqual(items.map(x=>x.kind).sort(),ids.slice().sort(),"three canonical media-grid previews at "+width);
  // People is a fourth collection placed beside the heading badge by the real runtime.
  const person=await page.locator("#pcPeopleIcon").evaluate(n=>({inTitle:!!n.closest(".pc-title-row"),hidden:n.hidden,count:n.dataset.collectionItemCount,preview:n.querySelector("img")?.getAttribute("src")}));
  assert.equal(person.inTitle,true,"People collection remains beside title badges at "+width);
  assert.equal(person.hidden,false,"Five VG people are visible in title at "+width);
  assert.ok(Number(person.count)>=5,"Canonical people preview count at "+width);
  assert.ok(person.preview,"Actual VG portrait selected at "+width);
  await page.waitForFunction(()=>[...document.querySelectorAll(".pc-icons-quad .pc-collection:not([hidden]) img, #pcPeopleIcon img, #pcFrontImage, #pcHeaderImage")].every(img=>img.complete));
  const layout=await page.evaluate(()=>{
   const rect=s=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom,naturalWidth:e?.naturalWidth,naturalHeight:e?.naturalHeight}};
   const previews=[...document.querySelectorAll(".pc-icons-quad .pc-collection:not([hidden]) img, #pcPeopleIcon img")];
   return {front:rect(".pc-frontcard"),frontImage:rect("#pcFrontImage"),header:rect("#pcHeaderImage"),grid:rect(".pc-sheet-explore-grid"),rounds:rect(".pc-icons-quad"),previews:previews.map(e=>({src:e.getAttribute("src"),naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,box:(()=>{const b=e.getBoundingClientRect();return {x:b.x,right:b.right,width:b.width}})()})),horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2};
  });
  assert.ok(layout.frontImage.naturalHeight>layout.frontImage.naturalWidth,"VG frontImage truly portrait at "+width);
  assert.ok(layout.header.naturalWidth>layout.header.naturalHeight,"VG banner photo truly landscape at "+width);
  assert.ok(layout.previews.every(x=>x.naturalWidth>0&&x.naturalHeight>0),"All four canonical member photos decode at "+width+" "+JSON.stringify(layout.previews));
  assert.equal(layout.horizontalOverflow,false,"No document horizontal overflow at "+width);
  assert.ok(layout.previews.every(x=>x.box.width>16),"No empty collection preview at "+width);
  assert.ok(layout.grid.width>0&&layout.front.width>0,"Visible real Place Sheet media grid at "+width);
  // Pixel-perfect Place Sheet frontImage baseline is owned by the full-DOM
  // browser QA in tests/placecard-onsite-under-landscape-browser.test.mjs.
  // This isolated, source-data preview fixture intentionally does not boot
  // the full Place Sheet layout controller, so its frame bottom is not authoritative.
  assert.deepEqual(errs,[],"No browser exceptions at "+width);
  console.log("VG-huset full Place Sheet media and four collections OK",width,items.map(x=>x.kind));
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
