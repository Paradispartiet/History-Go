import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root=process.cwd();
const payload=JSON.parse(fs.readFileSync("data/runtime/place-open/vg_huset.json","utf8"));
assert.equal(payload.place?.id,"vg_huset");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".jpg":"image/jpeg",".webp":"image/webp",".css":"text/css; charset=utf-8"};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(pathname==="/"){res.writeHead(200,{"content-type":mime[".html"]});res.end("<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body></body></html>");return;}
  const file=path.resolve(root,"."+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end("Not found");return;}
  res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream"});
  res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try {
  browser=await chromium.launch({headless:true});
  const port=server.address().port;
  for(const width of [390,768,1280]){
    const page=await browser.newPage({viewport:{width,height:width===390?844:width===768?1024:900}});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded"});
    await page.evaluate(({place,people})=>{
      document.body.innerHTML='<div id="placeCard" data-current-place-id="vg_huset"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle">VG-huset</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcObjectsList"></div></div></div><button type="button" id="pcQuiz" hidden>Ta quiz</button>';
      window.PLACES=[place];
      window.getPeopleForPlace=()=>people;
      window.showPlaceCardRoundPopup=(args)=>{window.__lastPopup=args};
    },{place:payload.place,people:payload.people});
    await page.addScriptTag({url:"/js/brands/brands_loader.js"});
    await page.addScriptTag({url:"/js/ui/place-rounds-visual-collections.js"});
    await page.evaluate(async()=>{
      await window.HGBrands.init();
      await window.HGPlaceCardCollections.apply(window.PLACES[0]);
    });
    const object=page.locator("#pcObjectsIcon > img");
    const brand=page.locator("#pcBrandsIcon > img");
    const production=page.locator("#pcCategoryCollectionIcon > img");
    assert.equal(await object.count(),1,"Object has real member preview at "+width);
    assert.equal(await brand.count(),1,"Brand has real logo preview at "+width);
    assert.equal(await production.count(),1,"Production has real publication preview at "+width);
    assert.equal(await object.getAttribute("src"),"bilder/kort/objects/vg_avismonter_2011.jpg");
    assert.equal(await brand.getAttribute("src"),"bilder/kort/brands/vg_logo.svg");
    assert.equal(await production.getAttribute("src"),"bilder/kort/productions/vg_papiravis_2011_i_monter_2013.jpg");
    await page.waitForFunction(()=>{
      const a=document.querySelector("#pcObjectsIcon > img");
      const b=document.querySelector("#pcBrandsIcon > img");
      const c=document.querySelector("#pcCategoryCollectionIcon > img");
      return a?.complete&&b?.complete&&c?.complete;
    });
    const media=await page.evaluate(()=>{
      const obj=document.querySelector("#pcObjectsIcon > img"),logo=document.querySelector("#pcBrandsIcon > img");
      const pub=document.querySelector("#pcCategoryCollectionIcon > img");
      return {objectWidth:obj.naturalWidth,objectHeight:obj.naturalHeight,brandWidth:logo.naturalWidth,brandHeight:logo.naturalHeight,publicationWidth:pub.naturalWidth,publicationHeight:pub.naturalHeight,publicationStatus:document.querySelector("#pcCategoryCollectionIcon").dataset.previewStatus,
        objectStatus:document.querySelector("#pcObjectsIcon").dataset.previewStatus,
        brandStatus:document.querySelector("#pcBrandsIcon").dataset.previewStatus,
        objectCount:document.querySelector("#pcObjectsIcon").dataset.collectionItemCount,
        brandCount:document.querySelector("#pcBrandsIcon").dataset.collectionItemCount};
    });
    assert.ok(media.objectWidth>100 && media.objectHeight>100,"Object image decoded "+width);
    assert.ok(media.brandWidth>0 && media.brandHeight>0,"VG logo decoded "+width);
    assert.equal(media.objectStatus,"member-image");
    assert.equal(media.brandStatus,"member-image");
    assert.ok(media.publicationWidth>100 && media.publicationHeight>100,"Publication photo decoded at "+width);
    assert.equal(media.publicationStatus,"member-image");
    assert.equal(media.objectCount,"1");
    assert.equal(media.brandCount,"1");
    await page.locator("#pcObjectsIcon").click();
    const popup=await page.evaluate(()=>window.__lastPopup);
    assert.equal(popup?.kind,"objects");
    assert.match(popup?.html||"",/Avismonteren|avismonter/);
    assert.deepEqual(errors,[],"no JavaScript page errors at "+width);
    console.log("VG-huset browser preview OK at "+width+"px",media);
    await page.close();
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
