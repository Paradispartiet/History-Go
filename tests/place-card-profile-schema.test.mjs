import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const schema = JSON.parse(fs.readFileSync("data/places/regler/place_card_profile_v2.schema.json", "utf8"));
const runtime = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const adaptive = fs.readFileSync("js/ui/place-rounds-fill-layout.js", "utf8");
const layout = fs.readFileSync("css/place-rounds-fill-layout.css", "utf8");
const subcategoryRuntime = fs.readFileSync("js/ui/place-subcategory-collections.js", "utf8");
const types = fs.readFileSync("schemas/place.ts", "utf8");

test("PlaceCard profile schema allows one-to-four curated collections", () => {
  const collections = schema.properties.collection_ids;
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.schema.const, "history_go_place_card_profile_v2");
  assert.equal(collections.minItems, 1);
  assert.equal(collections.maxItems, 4);
  assert.equal(collections.uniqueItems, true);
  assert.ok(!collections.items.enum.includes("images"));
  assert.ok(!collections.items.enum.includes("badges"));
  assert.ok(collections.items.enum.includes("historical_events"));
  assert.equal(collections.maxContains, 1, "bare én kategori-eid samling kan bruke den delte runtime-plassen");
  assert.equal(schema.oneOf, undefined, "schemaet skal ikke tvinge People/Objects/Brands eller Natur-fullness");
});

test("adaptive layout supports curated 1, 2, 3 and 4 collection compositions", () => {
  assert.match(adaptive, /collection_ids/);
  assert.match(adaptive, /ids\.length < 1 \|\| ids\.length > 4/);
  assert.match(adaptive, /hasRealPreview/);
  assert.match(adaptive, /place_card_profile_v2_curated/);
  for (const count of [1, 2, 3, 4]) {
    assert.match(layout, new RegExp(`data-collection-count=\\"${count}\\"`));
  }
  assert.match(layout, /data-collection-position=\"2\"/);
});

test("schema, TypeScript and runtime use the same v2 identity", () => {
  for (const source of [runtime, adaptive, types]) assert.match(source, /history_go_place_card_profile_v2/);
  assert.match(types, /place_card_profile\?: PlaceCardProfileV2/);
  assert.match(types, /round_profile\?: LegacyPlaceRoundProfileV1/);
  assert.match(types, /historical_events\?: PlaceVisualRoundItem\[\]/);
});

test("runtime exposes the compatibility adapter without restoring Images", () => {
  assert.match(runtime, /round_profile_v1_adapter/);
  assert.match(runtime, /id === "images"/);
  assert.doesNotMatch(runtime, /id:"images"/);
});

test("Miljø & gjenbruk keeps its scoped renderer", () => {
  assert.match(subcategoryRuntime, /TARGET_CATEGORY = "natur"/);
  assert.match(subcategoryRuntime, /TARGET_SUBCATEGORY = "miljo_gjenbruk"/);
  for (const id of ["reuse", "materials", "environment", "systems"]) assert.match(subcategoryRuntime, new RegExp(`id:\\"${id}\\"`));
  assert.match(subcategoryRuntime, /dataset\.collectionShape = "rectangle"/);
  assert.match(subcategoryRuntime, /if \(!isTarget\(place\)\)/);
});
