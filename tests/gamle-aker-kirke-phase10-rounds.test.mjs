import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const readJson = path => JSON.parse(fs.readFileSync(path, "utf8"));
const place = readJson("data/places/historie/oslo/places_historie/gamle_aker_kirke.json");
const production = readJson("data/places/production/gamle_aker_kirke.json");
const placeIndex = readJson("data/places/places_index.json");
const peopleManifest = readJson("data/people/manifest.json");
const brands = readJson("data/brands/brands_master.json");
const brandsByPlace = readJson("data/brands/brands_by_place.json");
const historyBadges = readJson("data/badges/historie.json");
const audit = readJson("reports/place-production/gamle-aker-kirke-phase10-rounds-audit-v1.json");
const roundsSource = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function loadManifestPeople() {
  return peopleManifest.files.flatMap(file => {
    const data = readJson(`data/${file}`);
    return Array.isArray(data) ? data : Array.isArray(data.people) ? data.people : [data];
  });
}

function runtime(extraPlaces) {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="gamle_aker_kirke"><div class="pc-body"><div class="pc-title-row"><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div></div></div></body>', { url:"https://history-go.test/", runScripts:"outside-only" });
  windows.add(dom.window);
  dom.window.PLACES = [place, ...extraPlaces];
  dom.window.eval(roundsSource);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles:true }));
  return dom.window;
}

test("Gamle Aker uses the standard 4+1 round contract without a local runtime variant", () => {
  assert.equal(Object.hasOwn(place, "round_profile"), false);
  assert.deepEqual(audit.rounds.content_round_ids, ["people", "objects", "brands", "related"]);
  assert.equal(audit.rounds.round_profile_override, false);
  const related = placeIndex.filter(row => place.related_place_ids.includes(row.id));
  const window = runtime(related);
  assert.deepEqual(Array.from(window.HGPlaceRounds.get(place)).map(def => def.id), ["people", "objects", "brands", "related"]);
  assert.equal(window.HGPlaceRounds.getItems(place, "objects").length, 3);
  assert.equal(window.HGPlaceRounds.getItems(place, "related").length, 4);
  assert.equal(window.HGPlaceRounds.badge.id, "badges");
});

test("People round has four direct, manifest-loaded place relations and no weak founder filler", () => {
  const people = loadManifestPeople();
  const here = people.filter(person => [person.placeId, ...(person.places || [])].includes(place.id));
  const ids = new Set(here.map(person => person.id));
  for (const id of ["heinrich_ernst_schirmer", "wilhelm_von_hanno", "torvald_moseid", "dronning_maud"]) {
    assert.ok(ids.has(id), `missing People relation ${id}`);
  }
  assert.equal(ids.has("olav_kyrre"), false);
  assert.equal(here.filter(person => person.cardImage || person.imageCard || person.image).length, 1);
  assert.equal(here.filter(person => person.visual?.designCode).length >= 3, true);
  assert.equal(audit.people.broken_image_paths, 0);
});

test("Objects are physical, place-specific and have complete local image provenance", () => {
  assert.equal(place.objects.length, 3);
  assert.equal(new Set(place.objects.map(object => object.id)).size, 3);
  for (const object of place.objects) {
    assert.equal(object.physicalObject, true);
    assert.equal(object.placeSpecific, true);
    assert.ok(object.desc.length >= 70);
    assert.ok(object.whereToFind);
    assert.ok(object.why_here);
    assert.ok(fs.existsSync(object.image), `missing object image ${object.id}`);
    assert.equal(object.imageMeta.reviewStatus, "manually_approved");
    assert.equal(object.imageMeta.license, "CC BY-SA 4.0");
    assert.ok(object.source_urls.length >= 2);
  }
  assert.deepEqual(audit.objects.local_image_coverage, { required:3, reviewed:3, missing:0, percent:100 });
});

test("Brands candidate pass closes with two direct project actors and 100 percent logo coverage", () => {
  const ids = brandsByPlace.gamle_aker_kirke;
  assert.deepEqual(ids, ["zenisk", "traad_as"]);
  const byId = new Map(brands.map(brand => [brand.id, brand]));
  for (const id of ids) {
    const brand = byId.get(id);
    assert.ok(brand);
    assert.equal(brand.state, "catalog");
    assert.equal(brand.brand_kind, "professional");
    assert.ok(brand.place_ids.includes(place.id));
    assert.ok(brand.source_urls.length >= 2);
    assert.ok(fs.existsSync(brand.logo), `missing Brand logo ${id}`);
    assert.equal(brand.imageMeta.reviewStatus, "manually_approved");
    assert.equal(brand.imageMeta.generated, false);
    assert.equal(brand.imageMeta.reconstructed, false);
  }
  assert.deepEqual(audit.brands.logo_coverage, { required:2, reviewed:2, missing:0, percent:100 });
  assert.deepEqual(audit.brands.candidates.filter(candidate => candidate.decision === "INCLUDE").map(candidate => candidate.id), ids);
});

test("Related and Badges resolve only to canonical registries", () => {
  assert.deepEqual(place.related_place_ids, ["damstredet_telthusbakken", "var_frelsers_gravlund", "st_hanshaugen_park", "stensparken"]);
  const indexed = new Set(placeIndex.map(row => row.id));
  assert.ok(place.related_place_ids.every(id => indexed.has(id)));
  const badges = new Set(historyBadges.sub);
  assert.ok(place.underbadge_ids.every(id => badges.has(id)));
  assert.deepEqual(place.underbadge_ids, ["middelalder", "kulturminner_og_bevaring"]);
});

test("production package records final readiness while the phase 10 quality gate remains inspectable", () => {
  assert.equal(production.roundsReadiness.status, "production_ready");
  assert.deepEqual(production.roundsReadiness.contentRoundIds, ["people", "objects", "brands", "related"]);
  const dimensions = audit.quality_score;
  for (const key of ["correctness_and_evidence", "coverage_and_completion", "editorial_quality", "technical_integrity", "safety_and_responsibility", "maintainability_and_verifiability"]) {
    assert.ok(dimensions[key] >= 4, `${key} below 4`);
  }
  assert.ok(dimensions.total >= 27);
  assert.equal(dimensions.critical_findings, 0);
});
