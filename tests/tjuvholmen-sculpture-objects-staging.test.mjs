import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const json = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const staged = json("data/places/object-candidates/tjuvholmen.json");
const live = json("data/places/by/oslo/places/tjuvholmen.json");
const plan = json("reports/place-production/tjuvholmen-illustration-production-plan-20261117.json");

test("eight physical sculpture entries have distinct source-backed IDs and real preview assets", () => {
  assert.equal(staged.placeId, "tjuvholmen");
  assert.equal(staged.status, "EDITORIAL_STAGING_NOT_RUNTIME_INGESTED");
  assert.equal(staged.objects.length, 8);
  const ids = new Set();
  const workIds = new Set();
  for (const object of staged.objects) {
    assert.equal(object.physicalObject, true);
    assert.equal(object.objectType, "public_sculpture");
    assert.equal(object.parentPlaceId, "tjuvholmen");
    assert.equal(object.parentStructureId, "skulpturparken_skjaeret");
    assert.ok(object.title && object.artist && Number.isInteger(object.year));
    assert.ok(object.placeSpecificDetail && object.historicalFunction);
    assert.ok(object.source_urls.length >= 2);
    assert.ok(object.source_urls.every(url => /^https:\/\//.test(url)));
    assert.ok(!ids.has(object.id), "duplicate object ID");
    assert.ok(!workIds.has(object.artworkId), "duplicate work");
    ids.add(object.id);
    workIds.add(object.artworkId);
    assert.equal(object.imageKind, "illustration");
    assert.equal(object.imageMeta.disclosure, "Illustrasjon – ikke fotografi");
    assert.equal(object.imageMeta.reviewStatus, "CANDIDATE_NOT_FINAL_APPROVED");
    assert.equal(object.imageMeta.rightsBasis, "PENDING_UNDERLYING_ARTWORK_REPRODUCTION_REVIEW");
    assert.ok(object.imageAlt.startsWith("Illustrasjon – ikke fotografi:"));
    assert.ok(object.image.startsWith("bilder/kort/objects/candidates/tjuvholmen/"));
    assert.ok(existsSync(resolve(root, object.image)), "missing WebP: " + object.image);
    const matching = plan.artwork_illustrations.find(row => row.id === object.artworkId);
    assert.ok(matching, "no matching production entry");
    assert.equal(object.image, matching.repo_candidate_path);
    assert.equal(object.imageMeta.assetSha256, matching.app_sha256);
    assert.equal(object.publication.active, false);
    assert.equal(object.publication.readyForPromotion, false);
    assert.equal(object.publication.artworkRightsReview, "PENDING");
    assert.equal(object.publication.visualApproval, false);
  }
});

test("staging does not expose the eight objects in the live Tjuvholmen PlaceCard", () => {
  assert.equal(Array.isArray(live.objects) && live.objects.length > 0, false);
  assert.equal(live.place_card_profile.collection_ids.includes("objects"), false);
  assert.ok(live.structures.some(row => row.id === "skulpturparken_skjaeret"));
});
