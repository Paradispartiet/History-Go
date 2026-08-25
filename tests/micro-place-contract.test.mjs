import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateMicroPlace } from "../scripts/lib/micro-place-contract.mjs";

const categories = JSON.parse(fs.readFileSync("data/categories/category_contract.json", "utf8"));
const microSource = fs.readFileSync("js/ui/micro-place-card.js", "utf8");
const indexSource = fs.readFileSync("tools/build_places_index.mts", "utf8");
const placeTypes = fs.readFileSync("schemas/place.ts", "utf8");

const valid = {
  id: "lesekiosk_test",
  name: "Lesekiosk test",
  lat: 59.91,
  lon: 10.75,
  category: "litteratur",
  subcategory_id: "lesekiosker",
  placeTier: "micro",
  desc: "En kildebelagt bokkiosk som har sin egen litteraturprikk på kartet.",
  locatorType: "poi",
  sourceProvider: "manual_research",
  sourceObjectId: "official:test",
  geocodeAccuracy: "geometric_center",
  coordRole: "display_marker",
  coordType: "documented_place_coordinate",
  coordStatus: "verified",
  coordNote: "Testpunkt med eksplisitt kildeidentitet.",
  micro_place_profile: {
    schema: "history_go_micro_place_profile_v1",
    kind: "lesekiosk",
    currentStatus: "active",
    sourceUrl: "https://example.org/kiosk",
    sourceLocation: "Kiosk listing",
    verifiedAt: "2026-08-25",
    quizMode: "none"
  }
};

test("canonical micro subcategories are active", () => {
  const litteratur = categories.canonicalSubcategories.litteratur.find((row) => row.id === "lesekiosker");
  const miljostasjon = categories.canonicalSubcategories.natur.find((row) => row.id === "miljostasjoner");
  const ombruk = categories.canonicalSubcategories.natur.find((row) => row.id === "ombruk_og_gratis");
  assert.equal(litteratur?.status, "active");
  assert.equal(miljostasjon?.status, "active");
  assert.equal(ombruk?.status, "active");
});

test("valid micro place passes the contract validator", () => {
  assert.deepEqual(validateMicroPlace(valid, categories), []);
});

test("micro place rejects a fake full PlaceCard profile and inactive/unknown subcategory", () => {
  const broken = {
    ...valid,
    subcategory_id: "does_not_exist",
    place_card_profile: { schema: "history_go_place_card_profile_v2", collection_ids: ["people", "objects", "brands", "productions"] }
  };
  const fields = validateMicroPlace(broken, categories).map((error) => error.field);
  assert.ok(fields.includes("subcategory_id"));
  assert.ok(fields.includes("place_card_profile"));
});

test("micro runtime hides ordinary collections, badge and quiz-by-default", () => {
  assert.match(microSource, /placeTier === "micro"/);
  assert.match(microSource, /hideOwned\(grid\)/);
  assert.match(microSource, /hideOwned\(badge\)/);
  assert.match(microSource, /quizMode === "place"/);
  assert.match(microSource, /else hideOwned\(quiz\)/);
});

test("place schema and light map index preserve micro identity", () => {
  for (const field of ["placeTier", "subcategory_id", "micro_place_profile"]) {
    assert.ok(placeTypes.includes(field), `schemas/place.ts missing ${field}`);
    assert.ok(indexSource.includes(`'${field}'`), `build_places_index.mts missing ${field}`);
  }
});
