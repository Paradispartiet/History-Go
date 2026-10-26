import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import sharp from "sharp";
import { JSDOM } from "jsdom";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const prod=read("data/places/production/det_norske_teatret.json");
const runtime=read("data/runtime/place-open/det_norske_teatret.json");
const card=read("reports/place-production/det-norske-teatret-workcard-current.json");
const report=read("reports/place-production/det-norske-teatret/20261020/object-photo-inline-source-c41.json");
const script=fs.readFileSync("js/ui/place-popup-tabs.js","utf8");
function setup(data){
 const dom=new JSDOM('<!doctype html><body><div class="hg-popup place-popup-v2"><article class="hg-place-popup-v2"><div class="hg-place-popup-body"><div class="hg-place-hero"></div></div></article></div></body>',{url:"https://history-go.test/",runScripts:"outside-only"});
 const w=dom.window;w.CSS={escape:value=>String(value)};
 const fn=()=>true;fn.__hgPlacePopupV2=true;w.showPlacePopup=fn;
 w.LEKSIKON_BY_PLACE={[data.id]:[]};w.HGStories={byPlace:{[data.id]:[]}};
 w.LESESPOR=[];w.HG_PLACE_OPEN_LANGUAGE={[data.id]:null};
 w.eval(script);w.showPlacePopup(data);return dom;
}
test("C41 preview matches source-verified 800x800 CC costume, and all Place mirrors",async()=>{
 const entry=place.externalLinks.find(x=>x.previewImage);
 assert.equal(entry.url,report.museum_image.source);
 assert.equal(entry.previewImage,report.museum_image.file);
 assert.equal(entry.credit,report.museum_image.credit);
 assert.equal(entry.license,"CC BY-SA 4.0");
 const bytes=fs.readFileSync(entry.previewImage);
 const meta=await sharp(bytes).metadata();
 assert.equal(meta.format,"webp");assert.equal(meta.width,800);assert.equal(meta.height,800);
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),report.museum_image.sha256);
 assert.deepEqual(place.externalLinks,prod.metadataSnapshot.externalLinks);
 assert.deepEqual(place.externalLinks,runtime.place.externalLinks);
});
test("C41/C47 real Kilder DOM shows two licensed documentary photos; Juleroser stays a link",async()=>{
 const dom=setup(place);
 try{
  await new Promise(done=>setTimeout(done,25));
  const d=dom.window.document;
  d.querySelector('[data-place-tab="sources"]').click();
  const panel=d.querySelector('[data-place-panel="sources"]');
  assert.equal(panel.hidden,false);
  const images=panel.querySelectorAll(".hg-place-source-photo img");
  assert.equal(images.length,2);
  assert.equal(images[0].getAttribute("src"),report.museum_image.file);
  assert.match(images[0].getAttribute("alt"),/Madame de Sade/);
  const c46=read("reports/place-production/det-norske-teatret/20261021/painting-photo-c46-generated.json");
  assert.equal(images[1].getAttribute("src"),c46.asset_path);
  assert.match(images[1].getAttribute("alt"),/Johannessen/);
  assert.match(panel.textContent,/Wolfmann/);
  assert.match(panel.textContent,/Kirkegårdsgraveren/);
  assert.ok([...panel.querySelectorAll("a")].some(x=>x.href===c46.source_page));
  assert.match(panel.textContent,/Lone Lunde/);
  assert.match(panel.textContent,/CC BY-SA 4\.0/);
  assert.match(panel.textContent,/ikke en ferdig Objects-samling/);
  const links=[...panel.querySelectorAll('a[target="_blank"]')];
  assert.ok(links.some(x=>x.href===report.museum_image.source&&x.rel.includes("noopener")));
  assert.ok(links.some(x=>x.href.includes("Hulda-bunaden_OHA-9.jpg")&&x.rel.includes("noreferrer")));
  assert.equal(panel.querySelectorAll('img[src*="detnorsketeatret.imgix.net"]').length,0);
 }finally{dom.window.close();}
});
test("C41 rejects arbitrary preview injection and preserves blocked canonical Objects",async()=>{
 const modified={...place,externalLinks:place.externalLinks.map(x=>x.previewImage?{...x,previewImage:"https://unlicensed.invalid/photo.webp"}:x)};
 const dom=setup(modified);
 try{
  await new Promise(done=>setTimeout(done,25));
  assert.equal(dom.window.document.querySelectorAll(".hg-place-source-photo img").length,0);
  assert.equal(report.restrictions.canonical_objects_published,0);
  assert.equal(card.collections.objects.status,"PASS");
  assert.equal(card.status,"in_progress");
  assert.deepEqual(card.placecard_collections_publishable_now,["objects"]);
  assert.ok(card.checkpoints.some(x=>x.id==="licensed_costume_inline_source_photo_c41"));
 }finally{dom.window.close();}
});
