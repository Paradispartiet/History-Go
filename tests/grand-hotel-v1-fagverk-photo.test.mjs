import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (path) => readFileSync(new URL("../" + path, import.meta.url));
const json = (path) => JSON.parse(load(path).toString("utf8"));
const place = json("data/places/media/oslo/grand_hotel.json");
const registry = json("data/fagverk/fagverk_registry.json");
const expected = {
  image: ["bilder/places/grand-hotel-20261027/grand_hotel_hero.webp", "CC BY-SA 4.0"],
  frontImage: ["bilder/places/grand-hotel-20261027/grand_hotel_portrait.webp", "CC BY 2.0"],
  cardImage: ["bilder/places/grand-hotel-20261027/grand_hotel_card.webp", "CC BY-SA 4.0"]
};

test("Grand Hotel: three real, separate, licensed WebP variants", () => {
  assert.equal(place.id, "grand_hotel");
  for (const [field, [path, license]] of Object.entries(expected)) {
    assert.equal(place[field], path, field);
    const bytes = load(path);
    assert.ok(bytes.length > 10000, field);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", field);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", field);
    const meta = field === "frontImage" ? place.frontImageMeta : place.imageMeta;
    assert.equal(meta.license, license, field);
    assert.ok(meta.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:"), field);
    assert.match(meta.sourceSha256, /^[a-f0-9]{64}$/, field);
  }
  assert.notEqual(place.image, place.cardImage);
  assert.notEqual(place.image, place.frontImage);
});

test("Grand Hotel: verified Place-owned Fagverk has three distinct learning angles", () => {
  const f = place.fagverk;
  assert.equal(f.schema, "history_go_place_fagverk_v2");
  assert.equal(f.level, "standard");
  assert.equal(f.status, "curated");
  assert.equal(f.article.length, 3);
  assert.equal(f.lenses.length, 3);
  assert.equal(new Set(f.lenses.map((lens) => lens.id)).size, 3);
  assert.ok(f.article.every((para) => para.length > 130));
  assert.ok(f.lenses.every((lens) => lens.prompt && lens.evidence && lens.source_urls?.length));
  assert.ok(f.source_urls.length >= 3);
  assert.ok(f.source_urls.every((url) => /^https:\/\//u.test(url)));
  assert.ok(f.observable_traces.length >= 2);
  assert.ok(f.observable_traces.every((trace) => trace.observation && trace.interpretation_boundary && trace.source_urls?.length));
  assert.ok(f.chapter_ids.includes("presse-redaksjoner-og-avishus"));
  assert.deepEqual(registry.placeLinks.grand_hotel, {
    sourceFile: "places/media/oslo/grand_hotel.json",
    field: "fagverk",
    schema: "history_go_place_fagverk_v2",
    level: "standard",
    status: "curated"
  });
});

test("Grand Hotel: keep canonical identity and building context", () => {
  assert.equal(place.category, "media");
  assert.equal(place.address.street, "Karl Johans gate");
  assert.equal(place.address.number, "31");
  assert.equal(place.sourceProvider, "official_address");
  assert.equal(place.coordStatus, "verified");
  assert.ok(place.desc.includes("Grand Hotel"));
  assert.ok(place.popupDesc.includes("Grand Hotel"));
});
