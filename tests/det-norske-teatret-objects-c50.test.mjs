import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const load = path => JSON.parse(fs.readFileSync(path,"utf8"));
const place = load("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const runtime = load("data/runtime/place-open/det_norske_teatret.json").place;
const work = load("reports/place-production/det-norske-teatret-workcard-current.json");
const c49 = load("reports/place-production/det-norske-teatret/20261021/objects-c49-illustration-fallback.json");
const museum = load("reports/place-production/det-norske-teatret/20261020/object-image-c32-generated.json");
const readBytes = path => fs.readFileSync(path);
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

test("C50 registers two distinct and physically sourced, venue-specific Objects",()=>{
  assert.equal(place.id,"det_norske_teatret");
  assert.equal(place.objects?.length,2);
  assert.deepEqual(runtime.objects,place.objects,"Place-open must have exactly the current canonical members");
  assert.deepEqual(runtime.place_card_profile,place.place_card_profile);
  assert.deepEqual(place.place_card_profile.collection_ids,["objects"]);
  assert.equal(place.place_card_profile.schema,"history_go_place_card_profile_v2");
  assert.equal(work.collections.objects.status,"PASS");
  assert.deepEqual(work.placecard_collections_publishable_now,["objects"]);
  assert.equal(work.status,"in_progress","The theatre cannot close out before People, Brands and Productions");
  assert.equal(work.collections.people.status,"BLOCKED");
  assert.equal(work.collections.brands.status,"BLOCKED");
  assert.equal(work.collections.productions.status,"BLOCKED");
  const ids=place.objects.map(item=>item.id);
  assert.deepEqual(ids,["dnt_costume_madame_de_sade_1989_tm01641","dnt_jan_groth_strekkomposisjon_sceneteppe_1985"]);
  for(const item of place.objects){
    assert.ok(item.title.length>8);
    assert.ok(item.description.length>130);
    assert.ok(item.siteRelation.includes("Kristian IVs gate 8") || item.siteRelation.includes("teaterhuset"));
    assert.ok(item.historicalFunction);
    assert.ok(item.datePrecision);
    assert.ok(item.image.startsWith("bilder/objects/det_norske_teatret/"));
    assert.ok(readBytes(item.image).length>300);
    assert.ok(item.source_urls.every(url=>url.startsWith("https://")));
    assert.ok(item.imageMeta.sourceUrl.startsWith("https://"));
  }
});

test("C50 museum costume keeps its original photo, correct provenance and stage distinction",()=>{
  const item=place.objects[0];
  assert.equal(item.imageKind,"photo");
  assert.equal(item.image,museum.asset_path);
  assert.equal(item.imageMeta.credit,"Lone Lunde / Oslo Museum / Wikimedia Commons");
  assert.equal(item.imageMeta.license,"CC BY-SA 4.0");
  assert.equal(item.imageMeta.licenseUrl,"https://creativecommons.org/licenses/by-sa/4.0/");
  assert.equal(item.imageMeta.sourceUrl,museum.source_page);
  assert.equal(item.date,"1989-01-05");
  assert.match(item.datePrecision,/premieredate_not_manufacture_date/);
  assert.match(item.siteRelation,/Ragnhild Hilt/);
  assert.match(item.description,/Scene 2/);
  assert.match(item.imageMeta.disclosure,/ikke sceneopptak/i);
  assert.equal(sha(readBytes(item.image)),museum.asset_sha256);
});

test("C50 stage curtain remains one Object and source-grounded illustration is unmistakably disclosed",()=>{
  const item=place.objects[1];
  assert.equal(item.id,c49.candidate.id);
  assert.equal(item.imageKind,"illustration");
  assert.equal(item.image,c49.candidate.image.path);
  assert.equal(item.imageMeta.sourceUrl,c49.candidate.source);
  assert.match(item.description,/tolv sammenføyde tekstilpaneler/);
  assert.match(item.imageAlt,/Illustrasjon – ikke fotografi/);
  assert.match(item.imageMeta.disclosure,/skjematisk/);
  assert.match(item.imageMeta.disclosure,/ikke fotografi/);
  const svg=readBytes(item.image).toString("utf8");
  assert.match(svg,/ILLUSTRASJON – IKKE FOTOGRAFI/);
  assert.match(svg,/<title id="title">/);
  assert.doesNotMatch(svg.replace('xmlns="http://www.w3.org/2000/svg"',''),/<script\b|<foreignObject\b|\bonload\s*=|\bonerror\s*=|https?:\/\//i);
  assert.equal(item.source_urls.length,1);
});

test("C50 canonical renderer shows both evidence cards, licensed source and visible illustration labels",async()=>{
  const dom=new JSDOM(`<!doctype html><html><body>
    <section id="placeCard" data-current-place-id="det_norske_teatret">
      <div class="pc-title-row"><span id="pcPeopleIcon"></span><span id="pcBadgesIcon"></span></div>
      <button id="pcQuiz"></button><div class="pc-icons-quad"></div><div class="pc-body"></div>
    </section>
  </body></html>`,{url:"https://history-go.test/",runScripts:"outside-only"});
  try {
    const w=dom.window;
    w.PLACES=[place];
    w.showPlaceCardRoundPopup=params=>{w.__capturedPopup=params};
    w.openPlaceCard=async()=>{};
    w.eval(fs.readFileSync("js/ui/place-rounds-visual-collections.js","utf8"));
    w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
    const normalized=w.HGVisualPlaceRounds.getItems(place,"objects");
    assert.equal(normalized.length,2);
    assert.deepEqual(Array.from(normalized, item=>item.imageKind),["photo","illustration"]);
    assert.ok(normalized[0].imageCredit.includes("Lone Lunde"));
    assert.ok(normalized[1].imageDisclosure.includes("skjematisk"));
    await w.HGVisualPlaceRounds.apply(place);
    const list=w.document.querySelector("#pcObjectsList");
    assert.equal(list.querySelectorAll(".pc-object-member").length,2);
    assert.equal(list.querySelectorAll(".pc-object-member img").length,2);
    assert.equal(list.querySelectorAll(".pc-object-source").length,2);
    assert.match(list.textContent,/Illustrasjon – ikke fotografi/);
    assert.match(list.textContent,/CC BY-SA 4.0/);
    assert.match(list.textContent,/Strekkomposisjon/);
    assert.equal(w.document.querySelector("#pcObjectsIcon").dataset.previewStatus,"member-image");
    const reversed={...place,objects:[place.objects[1],place.objects[0]]};
    await w.HGVisualPlaceRounds.apply(reversed);
    assert.equal(w.document.querySelectorAll("#pcObjectsIcon .pc-object-preview-disclosure").length,1);
    assert.match(w.document.querySelector("#pcObjectsIcon .pc-object-preview-disclosure").textContent,/ikke fotografi/);
  } finally {dom.window.close()}
});
