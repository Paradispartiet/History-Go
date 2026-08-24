import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const schema = JSON.parse(fs.readFileSync("data/places/regler/place_card_profile_v2.schema.json", "utf8"));
const runtime = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const types = fs.readFileSync("schemas/place.ts", "utf8");

test("PlaceCard profile schema locks the canonical full four-collection contract", () => {
  const collections = schema.properties.collection_ids;
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.schema.const, "history_go_place_card_profile_v2");
  assert.equal(collections.minItems, 4);
  assert.equal(collections.maxItems, 4);
  assert.equal(collections.uniqueItems, true);
  assert.ok(!collections.items.enum.includes("images"));
  assert.ok(!collections.items.enum.includes("badges"));
  assert.equal(collections.maxContains, 1, "bare én kategori-eid samling kan bruke den delte runtime-plassen");
  assert.equal(schema.oneOf.length, 2);
  assert.deepEqual(schema.oneOf[0].properties.collection_ids.prefixItems.slice(0, 3).map(item => item.const), ["people", "objects", "brands"]);
  assert.deepEqual(schema.oneOf[1].properties.collection_ids.prefixItems.slice(0, 3).map(item => item.const), ["flora", "fauna", "map"]);
});

test("schema, TypeScript and runtime use the same v2 identity", () => {
  for (const source of [runtime, types]) assert.match(source, /history_go_place_card_profile_v2/);
  assert.match(types, /place_card_profile\?: PlaceCardProfileV2/);
  assert.match(types, /round_profile\?: LegacyPlaceRoundProfileV1/);
});

test("runtime exposes the compatibility adapter without restoring Images", () => {
  assert.match(runtime, /round_profile_v1_adapter/);
  assert.match(runtime, /id === "images"/);
  assert.doesNotMatch(runtime, /id:"images"/);
});
