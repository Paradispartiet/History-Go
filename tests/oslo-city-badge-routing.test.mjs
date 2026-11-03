import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url));
const city = JSON.parse(read("data/cities/oslo/badge.json").toString("utf8"));
const by = JSON.parse(read("data/badges/by.json").toString("utf8"));
const webp = read(city.image);

test("Oslo city badge is a distinct, approved original and never replaces the global By badge", () => {
  assert.equal(city.cityId, "oslo");
  assert.equal(city.categoryId, "by");
  assert.equal(city.scope, "city_only");
  assert.equal(city.sourceFilePrefix, "places/by/oslo/");
  assert.equal(city.mapBadgeKey, "city_oslo_by");
  assert.equal(by.image, "bilder/merker/by-brodert-v6.webp");
  assert.notEqual(city.image, by.image);
  assert.equal(by.color.toUpperCase(), "#808080");
  assert.equal(by.secondaryColor.toUpperCase(), "#404040");
  assert.equal(city.width, 1024);
  assert.equal(city.height, 1024);
  assert.equal(webp.length, city.bytes);
  assert.equal(webp.toString("ascii", 0, 4), "RIFF");
  assert.equal(webp.toString("ascii", 8, 12), "WEBP");
  assert.equal(webp.readUInt32LE(4) + 8, webp.length);
  assert.equal(createHash("sha256").update(webp).digest("hex"), city.sha256);
});

test("Map badge key uses Oslo image only with explicit By/Oslo provenance", () => {
  const script = read("js/map.js").toString("utf8");
  const root = { window: {}, console };
  runInNewContext(script, root, { filename: "js/map.js" });
  const badgeKey = root.window.HGMap.badgeKeyForPlace;
  assert.equal(typeof badgeKey, "function");
  assert.equal(badgeKey({category:"by",sourceFile:"places/by/oslo/places/torggata.json"}), city.mapBadgeKey);
  assert.equal(badgeKey({category:"by",sourceFile:"data/places/by/oslo/places/torggata.json"}), city.mapBadgeKey);
  assert.equal(badgeKey({category:"by",_sourceFile:"places/by/oslo/places/radhusplassen.json"}), city.mapBadgeKey);
  assert.equal(badgeKey({category:"by",sourceFile:"places/by/akershus/places/baerum.json"}), "by");
  assert.equal(badgeKey({category:"by",sourceFile:"places/by/vestland/bergen/places/bryggen.json"}), "by");
  assert.equal(badgeKey({category:"by",sourceFile:"places/by/america/brazil/criciuma/places/praça.json"}), "by");
  assert.equal(badgeKey({category:"by",sourceFile:"places/by/oslofjord/places/other.json"}), "by");
  assert.equal(badgeKey({category:"by",lat:59.91,lon:10.75}), "by");
  assert.equal(badgeKey({category:"historie",sourceFile:"places/by/oslo/places/torggata.json"}), "historie");
  assert.equal(badgeKey({category:"film_tv",sourceFile:"places/film_tv/oslo/places/kino.json"}), "film_tv");
  assert.match(script, /placeBadgeImages.set\(OSLO_CITY_BADGE_KEY, OSLO_CITY_BADGE_IMAGE\)/);
  assert.match(script, /badgeKey: badgeKeyForPlace\(p\)/);
  assert.ok((script.match(/feature.properties.badgeKey/g) || []).length >= 6);
});
