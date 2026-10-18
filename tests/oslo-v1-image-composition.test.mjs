import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const batch = read("data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json");
const reviewed = ["groruddammen","svartdalen","alnaparken","alna_bryn",
  "kvaernerbyen_alna","alna_utlop_bjorvika","voienfossen","myralokka",
  "vaterland_historisk_elvelop","vulkan_industriomrade","glads_molle","salt",
  "blaa","rockefeller","john_dee","sentrum_scene"];

test("sixteen Oslo candidates have distinct, real card, portrait and landscape media", () => {
  assert.equal(reviewed.length,16);
  for (const id of reviewed) {
    const row = batch.places.find(p => p.place_id === id);
    assert.ok(row, id+" missing from batch");
    const place = read(row.place_file);
    assert.equal(place.id,id);
    const names = [place.image,place.frontImage,place.cardImage];
    assert.equal(new Set(names).size,3,id+" needs three distinct assets");
    for (const p of names) {
      assert.match(p,/^bilder\/.+\.webp$/u);
      const content = fs.readFileSync(path.join(root,p));
      assert.equal(content.toString("ascii",0,4),"RIFF",p);
      assert.equal(content.toString("ascii",8,12),"WEBP",p);
      assert.ok(content.length>7000,p+" is implausibly small");
    }
    assert.deepEqual(place.imageComposition?.portraitRatio,"3:4");
    assert.equal(place.imageComposition?.quizCardBehavior,"contain_never_crop");
    for (const k of ["portraitPosition","heroPosition"]) {
      assert.match(place.imageComposition[k],/^(?:100|[1-9]?\d)% (?:100|[1-9]?\d)%$/u);
    }
    assert.equal(row.content_level,"v1_candidate","visual-only audit cannot grant v1");
    assert.equal(row.runtime_binding_status,"not_verified_in_app");
  }
});

test("PlaceCard keeps artwork uncut and applies focal positions only to place photographs",()=>{
  const css = fs.readFileSync("css/place-sheet.css","utf8");
  const js = fs.readFileSync("js/ui/place-card.js","utf8");
  assert.match(css,/\.pc-frontcard \.pc-card-face-front > img\s*\{\s*object-fit: cover/u);
  assert.match(css,/\.pc-frontcard \.pc-quiz-card-image\s*\{\s*object-fit: contain/u);
  assert.match(js,/frontImgEl\.style\.objectPosition = mediaPosition\(imageComposition\.portraitPosition\)/u);
  assert.match(js,/headerImgEl\.style\.objectPosition = mediaPosition\(imageComposition\.heroPosition\)/u);
});

test("Contact sheet is an image preview, not a fabricated on-device v1 approval",()=>{
  const report = read("data/places/production-tiers/v1-oslo-image-design-review-20261018.json");
  assert.equal(report.reviewedPlaces,16);
  assert.equal(report.v1Approved,0);
  assert.equal(report.visualAppVerification,"pending");
  assert.ok(fs.statSync(report.preview).size>10000);
});
