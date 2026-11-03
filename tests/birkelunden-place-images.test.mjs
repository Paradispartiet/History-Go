import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import { validateDistinctPhotoPair } from "../scripts/check-distinct-place-photos.mjs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/by/oslo/places/birkelunden.json");
const index = read("data/places/places_index.json").find(row => row.id === "birkelunden");
const open = read("data/runtime/place-open/birkelunden.json").place;

test("Birkelunden has distinct local main photograph and actual portrait front photograph", () => {
  assert.equal(place.image, "bilder/places/birkelunden_hero_tore_saetre_2015.jpg");
  assert.equal(place.frontImage, "bilder/places/birkelunden_front_oslo_byarkiv_1920.jpg");
  assert.equal(place.cardImage, place.frontImage, "Legacy card alias must not point at missing Wikimedia thumb");
  assert.notEqual(place.image, place.frontImage);
  assert.deepEqual(validateDistinctPhotoPair(place, { requireBoth: true }), []);
  for (const [field, meta] of [["image", place.imageMeta], ["frontImage", place.frontImageMeta]]) {
    const buf = fs.readFileSync(place[field]);
    assert.ok(buf.length > 200000);
    assert.equal(buf[0], 0xff);
    assert.equal(buf[1], 0xd8);
    assert.equal(crypto.createHash("sha256").update(buf).digest("hex"), meta.sourceSha256);
    assert.ok(meta.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:"));
    assert.match(meta.license, /^CC BY-SA /);
  }
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.match(place.frontImageMeta.historicalContext, /ikke dokumentasjon av dagens park/);
});
test("Birkelunden main, index and place-open payload deliver the same two image paths", () => {
  assert.ok(index);
  for (const field of ["image", "frontImage", "cardImage"]) {
    assert.equal(index[field], place[field], "index mismatch: " + field);
    assert.equal(open[field], place[field], "place-open mismatch: " + field);
  }
  assert.equal(open.imageMeta.sourceSha256, place.imageMeta.sourceSha256);
  assert.equal(open.frontImageMeta.sourceSha256, place.frontImageMeta.sourceSha256);
});
test("PlaceCard uses the separate canonical surfaces without accidental substitution", () => {
  const ui = fs.readFileSync("js/ui/place-card.js", "utf8");
  assert.match(ui, /setPlaceCardImgSrcStable\(headerImgEl, place\.image \|\| ""\)/);
  assert.match(ui, /setPlaceCardImgSrcStable\(frontImgEl, place\.frontImage \|\| place\.cardImage \|\| place\.image \|\| ""\)/);
});
