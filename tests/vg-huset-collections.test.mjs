import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(file,"utf8"));
const place = read("data/places/media/oslo/places_oslo_media/vg_huset.json");
const brands = read("data/brands/brands_master.json");
const byPlace = read("data/brands/brands_by_place.json");
const people = read("data/people/media/oslo/people_media_oslo.json");

test("VG-huset has an actual source-attributed 2011 display object", () => {
  assert.equal(place.id,"vg_huset");
  assert.equal(place.objects?.length,1);
  const obj=place.objects[0];
  assert.equal(obj.id,"vg_avismonter_22_juli_2011");
  assert.equal(obj.kind,"physical_object");
  assert.equal(obj.physicalObject,true);
  assert.equal(obj.placeSpecific,true);
  assert.ok(obj.source_urls.some(url=>url.includes("koro.no/")));
  assert.equal(obj.image,"bilder/kort/objects/vg_avismonter_2011.jpg");
  assert.equal(obj.imageMeta.creator,"Ulflarsen");
  assert.equal(obj.imageMeta.license,"CC BY-SA 3.0");
  assert.equal(obj.imageMeta.transformation,"Original unchanged; no crop or reconstruction.");
  const data=fs.readFileSync(obj.image);
  assert.ok(data.length>100_000);
  assert.deepEqual([...data.subarray(0,3)],[255,216,255],"real local JPEG");
});

test("VG brand reuses canonical id and licensed authentic visual identity", () => {
  const vg=brands.filter(row=>row.id==="vg");
  assert.equal(vg.length,1,"no duplicate Brand entity");
  assert.equal(vg[0].state,"catalog");
  assert.deepEqual(vg[0].place_ids,["vg_huset"]);
  assert.deepEqual(byPlace.vg_huset,["vg"]);
  assert.equal(vg[0].logo,"bilder/kort/brands/vg_logo.svg");
  assert.equal(vg[0].imageMeta.assetKind,"logo");
  assert.equal(vg[0].imageMeta.noEndorsement,true);
  const svg=fs.readFileSync(vg[0].logo,"utf8");
  assert.match(svg,/<svg[\s>]/);
  assert.match(svg,/<path[\s>]/);
  assert.doesNotMatch(svg,/<script\b|onload\s*=|javascript:/i);
});

test("five ready People profiles remain distinct from the invalid 1980 VG building anchor", () => {
  const expected=["bernt_olufsen","gard_steiro","hanne_skartveit","torry_pedersen","trine_eilertsen"];
  for (const id of expected){
    const person=people.find(x=>x.id===id);
    assert.equal(person?.profileStatus,"ready_people_v1",id);
    assert.equal(person.placeId,"vg_huset",id);
    assert.ok(fs.existsSync(person.image),"portrait exists: "+id);
  }
  const valebrokk=people.find(x=>x.id==="kare_valebrokk");
  assert.equal(valebrokk?.year,1980);
  assert.equal(valebrokk?.placeId,"vg_huset");
  assert.equal(place.place_card_profile,undefined,"the full collection profile is intentionally not certified");
});

test("generated full place-open payload matches canonical Object and Brand", () => {
  const runtime=read("data/runtime/place-open/vg_huset.json");
  assert.equal(runtime.place?.id,"vg_huset");
  assert.ok(runtime.place.objects?.some(x=>x.id==="vg_avismonter_22_juli_2011"));
  assert.ok(runtime.brands?.some(x=>x.id==="vg" && x.logo==="bilder/kort/brands/vg_logo.svg"));
});
