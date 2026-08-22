import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const readJson = path => JSON.parse(fs.readFileSync(path, "utf8"));
const place = readJson("data/places/historie/oslo/places_historie/var_frelsers_gravlund.json");
const production = readJson("data/places/production/var_frelsers_gravlund.json");
const placeIndex = readJson("data/places/places_index.json");
const peopleManifest = readJson("data/people/manifest.json");
const brands = readJson("data/brands/brands_master.json");
const brandsByPlace = readJson("data/brands/brands_by_place.json");
const routes = readJson("data/routes_walks.json");
const audit = readJson("reports/place-production/var-frelsers-gravlund-phase4-rounds-audit-v1.json");
const roundsSource = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const routeRuntime = fs.readFileSync("js/routes.js", "utf8");
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
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="var_frelsers_gravlund"><div class="pc-body"><div class="pc-title-row"><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcObjectsIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div><div id="pcCategoryCollectionIcon" class="pc-round"></div></div><div id="pcPeopleList"></div><div id="pcObjectsList"></div><div id="pcBrandsList"></div><div id="pcCategoryCollectionList"></div></div></div></body>', { url:"https://history-go.test/", runScripts:"outside-only" });
  windows.add(dom.window);
  dom.window.PLACES = [place, ...extraPlaces];
  dom.window.eval(roundsSource);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles:true }));
  return dom.window;
}

test("Vår Frelsers uses the standard 4+1 round contract without a local runtime variant", () => {
  assert.equal(Object.hasOwn(place, "round_profile"), false);
  assert.deepEqual(production.roundsReadiness.contentRoundIds, ["people", "objects", "brands", "related"]);
  assert.equal(production.roundsReadiness.roundProfileOverride, false);
  const related = placeIndex.filter(row => place.related_place_ids.includes(row.id));
  const window = runtime(related);
  assert.deepEqual(Array.from(window.HGPlaceRounds.get(place)).map(def => def.id), ["people", "objects", "brands", "related"]);
  assert.equal(window.HGPlaceRounds.getItems(place, "objects").length, 3);
  assert.equal(window.HGPlaceRounds.getItems(place, "related").length, 4);
  assert.equal(window.HGPlaceRounds.badge.id, "badges");
});

test("People round resolves sixteen sourced profiles with no broken image paths", () => {
  const people = loadManifestPeople();
  const here = people.filter(person => [person.placeId, ...(person.places || [])].includes(place.id));
  assert.equal(here.length, 16);
  assert.deepEqual(new Set(here.map(person => person.id)), new Set(production.roundsReadiness.peopleIds));
  assert.equal(here.filter(person => (person.source_urls || []).length >= 2).length, 16);

  const withImage = here.filter(person => person.cardImage || person.imageCard || person.image);
  const withFallback = here.filter(person => !(person.cardImage || person.imageCard || person.image) && person.visual?.designCode);
  assert.equal(withImage.length, 13);
  assert.equal(withFallback.length, 3);
  assert.equal(withImage.every(person => fs.existsSync(person.cardImage || person.imageCard || person.image)), true);
  assert.equal(audit.people.broken_image_paths, 0);
});

test("Objects are physical, place-specific and have complete local image provenance", () => {
  assert.equal(place.objects.length, 3);
  assert.equal(new Set(place.objects.map(object => object.id)).size, 3);
  for (const object of place.objects) {
    assert.equal(object.physicalObject, true);
    assert.equal(object.placeSpecific, true);
    assert.ok(object.desc.length >= 120);
    assert.ok(object.whereToFind.length >= 40);
    assert.ok(object.why_here.length >= 80);
    assert.ok(fs.existsSync(object.image), `missing object image ${object.id}`);
    assert.equal(object.imageMeta.reviewStatus, "manually_approved");
    assert.ok(object.source_urls.length >= 3);
  }
  assert.deepEqual(audit.objects.local_image_coverage, { required:3, reviewed:3, missing:0, percent:100 });
});

test("Brands round contains the documented operator and European network with reviewed marks", () => {
  const ids = brandsByPlace.var_frelsers_gravlund;
  assert.deepEqual(ids, ["oslo_kommune_gravplassetaten", "asce_european_cemeteries_network"]);
  const byId = new Map(brands.map(brand => [brand.id, brand]));
  for (const id of ids) {
    const brand = byId.get(id);
    assert.ok(brand, `missing Brand ${id}`);
    assert.equal(brand.state, "catalog");
    assert.ok(brand.place_ids.includes(place.id));
    assert.ok(brand.source_urls.length >= 3);
    assert.ok(fs.existsSync(brand.logo), `missing Brand mark ${id}`);
    assert.equal(brand.imageMeta.reviewStatus, "manually_approved");
    assert.equal(brand.imageMeta.generated, false);
    assert.equal(brand.imageMeta.reconstructed, false);
    assert.equal(brand.imageMeta.noEndorsement, true);
  }
  assert.deepEqual(audit.brands.logo_coverage, { required:2, reviewed:2, missing:0, percent:100 });
});

test("Related places and the Akersryggen walk resolve to canonical places", () => {
  assert.deepEqual(place.related_place_ids, ["gamle_aker_kirke", "damstredet_telthusbakken", "st_hanshaugen_park", "stensparken"]);
  const indexed = new Set(placeIndex.map(row => row.id));
  assert.ok(place.related_place_ids.every(id => indexed.has(id)));

  const route = routes.find(row => row.id === "akersryggen_stein_minne_park");
  assert.ok(route);
  assert.equal(route.kind, "walk");
  assert.equal(route.stops.length, 4);
  assert.deepEqual(route.stops.map(stop => stop.placeId), ["damstredet_telthusbakken", "gamle_aker_kirke", "var_frelsers_gravlund", "st_hanshaugen_park"]);
  assert.ok(route.stops.every(stop => indexed.has(stop.placeId)));
  assert.match(route.experienceNote, /gravlunden[\s\S]*gangveier[\s\S]*fred/i);
  assert.match(routeRuntime, /data\/routes\.json["'],\s*["']data\/routes_walks\.json/);
});

test("phase 4 records a blocker-free six-dimension gate", () => {
  assert.equal(production.roundsReadiness.status, "phase_4_ready");
  assert.equal(production.roundsReadiness.auditFile, "reports/place-production/var-frelsers-gravlund-phase4-rounds-audit-v1.json");
  assert.equal(audit.status, "PASS");
  assert.equal(audit.blockers.length, 0);
  for (const key of ["correctness_and_evidence", "coverage_and_completion", "editorial_quality", "technical_integrity", "safety_and_responsibility", "maintainability_and_verifiability"]) {
    assert.ok(audit.quality_score[key] >= 4, `${key} below 4`);
  }
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
});
