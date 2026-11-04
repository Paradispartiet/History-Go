import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const read = p => JSON.parse(fs.readFileSync(p,"utf8"));
const path="data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json";
const place=read(path);
const runtime=read("data/runtime/place-open/toyen_trafo.json");

test("Tøyen trafo has exactly two evidence-based and explicitly non-photographic Objects",()=>{
  assert.equal(place.id,"toyen_trafo");
  assert.equal(place.objects?.length,2);
  assert.deepEqual(runtime.objects,place.objects,"Generated Place-open has the same actual Objects");
  assert.deepEqual(runtime.place_card_profile,place.place_card_profile);
  assert.deepEqual(place.place_card_profile.collection_ids,["objects"]);
  assert.deepEqual(place.objects.map(x=>x.id),[
    "toyen_trafo_kobberkledd_tarnhjelm","toyen_trafo_smarutede_vinduer"
  ]);
  for(const item of place.objects){
    assert.equal(item.physicalObject,true,item.id);
    assert.equal(item.kind,"fixed_architectural_detail",item.id);
    assert.equal(item.imageKind,"illustration",item.id);
    assert.ok(item.siteRelation?.includes("Tøyen"),item.id);
    assert.ok(item.historicalFunction?.length>70,item.id);
    assert.ok(item.placeSpecificReason?.length>90,item.id);
    assert.ok(item.description?.length>250,item.id);
    assert.ok(item.source_urls.length>=2 && item.source_urls.every(u=>u.startsWith("https://")),item.id);
    assert.match(item.imageAlt,/Illustrasjon – ikke fotografi/i);
    assert.match(item.imageMeta.disclosure,/ikke fotografi/i);
    assert.match(item.imageMeta.representationLimits,/ikke|rekonstruert|dokumentert/i);
    assert.equal(item.imageMeta.rightsBasis,"original_schematic_not_traced_from_source_photo");
    const data=fs.readFileSync(item.image,"utf8");
    assert.ok(data.length>700,item.id);
    assert.match(data,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(data,/<title id="title">/);
    assert.match(data,/ILLUSTRASJON – IKKE FOTOGRAFI/);
    assert.doesNotMatch(data,/<script\b|<foreignObject\b|\bonload\s*=|\bonerror\s*=/i);
  }
  assert.equal(runtime.people?.length,0);
  assert.equal(runtime.brands?.length,0);
  assert.equal(runtime.stories?.length,1);
  assert.equal(runtime.language?.entries?.length,6);
});
test("Canonical PlaceCard Object renderer shows distinct previews and both source disclosures",async()=>{
  const dom=new JSDOM(`<!doctype html><html><body><section id="placeCard" data-current-place-id="toyen_trafo"><div class="pc-title-row"><span id="pcPeopleIcon"></span><span id="pcBadgesIcon"></span></div><button id="pcQuiz"></button><div class="pc-icons-quad"></div><div class="pc-body"></div></section></body></html>`,
    {url:"https://history-go.test/",runScripts:"outside-only"});
  try{
    const w=dom.window;
    w.PLACES=[place];
    w.showPlaceCardRoundPopup=p=>w.__captured=p;
    w.openPlaceCard=async()=>{};
    w.eval(fs.readFileSync("js/ui/place-rounds-visual-collections.js","utf8"));
    w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
    const items=w.HGVisualPlaceRounds.getItems(place,"objects");
    assert.equal(items.length,2);
    assert.deepEqual(Array.from(items,x=>x.imageKind),["illustration","illustration"]);
    assert.notEqual(items[0].image,items[1].image);
    await w.HGVisualPlaceRounds.apply(place);
    const list=w.document.querySelector("#pcObjectsList");
    assert.ok(list);
    assert.equal(list.querySelectorAll(".pc-object-member").length,2);
    assert.equal(list.querySelectorAll(".pc-object-member img").length,2);
    assert.equal(list.querySelectorAll(".pc-object-source").length,2);
    assert.match(list.textContent,/Illustrasjon – ikke fotografi/);
    assert.equal(w.document.querySelector("#pcObjectsIcon")?.dataset.previewStatus,"member-image");
  }finally{dom.window.close();}
});
