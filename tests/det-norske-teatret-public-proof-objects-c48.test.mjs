import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const c47 = read("reports/place-production/det-norske-teatret/20261021/foyer-painting-kilder-c47.json");
const c48 = read("reports/place-production/det-norske-teatret/20261021/objects-c48-public-proof-and-stagecraft-leads.json");
const work = read("reports/place-production/det-norske-teatret-workcard-current.json");
const place = read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const c45 = read("reports/place-production/det-norske-teatret/20261021/scene-curtain-c45-research.json");
const c46 = read("reports/place-production/det-norske-teatret/20261021/foyer-paintings-c46-research.json");

test("C48 retains exact public C47 mobile+desktop proof without mistaking it for physical device QA", () => {
  assert.equal(c47.public_deployment_verification.status, "PUBLIC_KILDER_TWO_DOCUMENTARY_IMAGES_MOBILE_DESKTOP_PASS");
  assert.equal(c47.public_deployment_verification.workflow_run_id, 39587062392);
  assert.equal(c47.public_deployment_verification.workflow_conclusion, "success");
  assert.equal(c47.public_deployment_verification.artifact_id, 12340127164);
  assert.equal(c48.public_c47.action_run_id, c47.public_deployment_verification.workflow_run_id);
  assert.equal(c48.public_c47.pages_conclusion, "success");
  assert.deepEqual(c47.public_deployment_verification.cases.map(({ name, width, height, outcome }) => [name, width, height, outcome]), [
    ["mobile", 390, 844, "PASS"],
    ["desktop", 1280, 900, "PASS"]
  ]);
  assert.match(c47.public_deployment_verification.scope, /not a physical phone/);
  assert.equal(c48.public_c47.evidence_artifact_id, 12340127164);
});

test("C48 distinct Object leads preserve original source distinctions and noncommercial re-use boundaries", () => {
  const curtain = c48.stagecraft_leads.find(x => x.id === c45.new_candidate.id);
  assert.ok(curtain);
  assert.equal(curtain.identified_object, true);
  assert.equal(curtain.source, c45.new_candidate.primary_source);
  assert.equal(curtain.photo_reuse, "NO_VERIFIED_OPEN_REUSE_LICENSE");
  assert.equal(curtain.local_member_image, false);
  assert.match(curtain.boundary, /one object|do not copy/i);
  const programme = c48.stagecraft_leads.find(x => x.id === "dnt_les_miserables_1988_programme_sceneweb_149996");
  assert.ok(programme);
  assert.equal(programme.source, "https://sceneweb.no/nb/multimedia/149996");
  assert.equal(programme.source_license, "© Den Nationale Scene");
  assert.equal(programme.licensed_local_member_image, false);
  assert.equal(programme.physical_exemplar_accession, "NOT_VERIFIED");
  assert.equal(c48.previously_verified_candidates.foyer_painting.photo, "bilder/objects/det_norske_teatret/kirkegardsgraveren_foyer_wolfmann_2017.webp");
  assert.equal(c46.evidence[0].photo_license, c48.previously_verified_candidates.foyer_painting.license);
  assert.equal(c48.previously_verified_candidates.foyer_painting.state, "DOCUMENTARY_KILDER_PHOTO_ONLY_NOT_CANONICAL_OBJECT");
});

test("C48 is a source-only checkpoint; no canonical Objects or collection preview", () => {
  assert.equal(work.place_id, c48.place_id);
  assert.equal(work.status, "in_progress");
  assert.equal(work.collections.objects.status, "PASS");
  assert.deepEqual(work.placecard_collections_publishable_now, ["objects"]);
  assert.equal(place.objects?.length ?? 0, 2);
  assert.equal(c48.publication_boundary.canonical_object_members, 0);
  assert.equal(c48.publication_boundary.ready_to_publish_objects_collection, false);
  const cp47 = work.checkpoints.find(x => x.id === "foyer_painting_kilder_c47");
  assert.ok(cp47);
  assert.equal(cp47.report, "reports/place-production/det-norske-teatret/20261021/foyer-painting-kilder-c47.json");
  assert.equal(c48.status, "PUBLIC_C47_CONFIRMED_STAGECRAFT_RESEARCH_NO_OBJECTS_PUBLICATION");
  assert.equal(place.externalLinks.filter(x => x.type === "image_source" && x.previewImage).length, 2);
});
