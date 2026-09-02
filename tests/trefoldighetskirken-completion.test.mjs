import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = (file) => fs.existsSync(path.join(root, file));
const placeFile = "data/places/religion/oslo/trefoldighetskirken/trefoldighetskirken.json";
const place = read(placeFile);

test("Trefoldighetskirken is a complete Religion Place with preserved identity and coordinate", () => {
  assert.equal(exists("data/places/by/oslo/trefoldighetskirken/trefoldighetskirken.json"), false);
  assert.equal(place.id, "trefoldighetskirken");
  assert.equal(place.category, "religion");
  assert.equal(place.lat, 59.91672903151453);
  assert.equal(place.lon, 10.744766562559661);
  assert.equal(place.production_status, "complete");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(place.place_card_profile.category_collection_label, "Ritualer og tradisjoner");
  assert.deepEqual(place.related_people_ids, ["alexis_de_chateauneuf"]);
  assert.deepEqual(place.related_place_ids, ["hammersborg_torg", "mollergata_19", "regjeringskvartalet", "oslo_domkirke"]);
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level, "standard");
  assert.equal(place.module_audit.stories.status, "not_applicable");
  for (const file of [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage]) assert.equal(exists(file), true, file);
});

test("category migration updates manifests, override and coordinate evidence", () => {
  const manifest = read("data/places/manifest.json");
  assert.ok(manifest.files.includes("places/religion/oslo/trefoldighetskirken/trefoldighetskirken.json"));
  assert.ok(!manifest.files.includes("places/by/oslo/trefoldighetskirken/trefoldighetskirken.json"));
  const overrides = read("data/places/category_overrides.json");
  const rows = Array.isArray(overrides) ? overrides : overrides.overrides;
  assert.ok(!rows.some((row) => row.id === place.id));
  assert.equal(exists("data/coordinate-evidence/oslo/by/trefoldighetskirken.json"), false);
  const evidence = read("data/coordinate-evidence/oslo/religion/trefoldighetskirken.json");
  assert.equal(evidence.placeFile, placeFile);
  assert.equal(evidence.currentCoordinate.lat, place.lat);
  assert.equal(evidence.currentCoordinate.lon, place.lon);
});

test("all four PlaceCard collections are image-ready and source-backed", () => {
  assert.equal(place.objects.length, 2);
  assert.deepEqual(place.objects.map((item) => item.id), ["trefoldighetskirken_dapsengel", "trefoldighetskirken_lysekrone"]);
  assert.equal(place.productions.length, 3);
  assert.deepEqual(place.productions.map((item) => item.id), ["trefoldighetskirken_kveldsmesser", "trefoldighetskirken_fredsbonn", "trefoldighetskirken_okumeniske_gudstjenester"]);
  for (const item of [...place.objects, ...place.productions]) {
    assert.equal(exists(item.image), true, item.image);
    assert.ok(item.imageMeta.sourcePage.startsWith("https://"), item.id);
    assert.ok(item.source_urls.length > 0, item.id);
  }
  const brand = read("data/brands/brands_master.json").find((item) => item.id === "den_norske_kirke");
  assert.ok(brand);
  assert.ok(brand.place_ids.includes(place.id));
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.reconstructed, false);
  assert.equal(brand.imageMeta.noEndorsement, true);
  assert.equal(exists(brand.logo), true);
  assert.deepEqual(read("data/brands/brands_by_place.json")[place.id], [brand.id]);
});

test("Alexis de Chateauneuf has a People v1 profile, portrait and direct relation", () => {
  const peopleFile = "data/people/historie/oslo/people_historie_oslo.json";
  const person = read(peopleFile).find((item) => item.id === "alexis_de_chateauneuf");
  assert.ok(person);
  assert.equal(person.profileStatus, "ready_people_v1");
  assert.equal(person.placeId, place.id);
  assert.ok(person.places.includes(place.id));
  assert.equal(exists(person.image), true);
  const claims = read(person.claimsFile);
  assert.equal(claims.person_id, person.id);
  assert.equal(claims.completion.current_status, "ready_people_v1");
  const relation = read("data/relations.json").find((item) => item.type === "person_place" && item.personId === person.id && item.placeId === place.id);
  assert.ok(relation);
});

test("Religion quiz is rich 5x7 with a normal opening and late method/theory", () => {
  const quiz = read("data/quiz/religion/trefoldighetskirken_sets.json");
  assert.equal(quiz.categoryId, "religion");
  assert.equal(quiz.size_class, "rich_5x7");
  assert.equal(quiz.sets.length, 5);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  const all = quiz.sets.flatMap((set) => set.questions);
  assert.equal(all.length, 35);
  assert.ok(all.slice(0, 14).every((question) => !question.method_id && !question.thinker_id && !question.topic_hook_id));
  assert.ok(all.slice(28).some((question) => question.method_id));
  assert.ok(all.slice(28).some((question) => question.thinker_id === "emile_durkheim"));
  assert.equal(quiz.production_context.profile_decision.profile, "rich");
  assert.equal(read("data/quiz/manifest.json").religion[place.id], "religion/trefoldighetskirken_sets.json");
});

test("conditional modules, leksikon and completion packet are governed", () => {
  const leksikon = read("data/leksikon/places/oslo/religion/leksikon_trefoldighetskirken.json")[0];
  assert.equal(leksikon.chronology.length, 10);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/trefoldighetskirken.json");
  assert.equal(language.entries.length, 6);
  const readings = read("data/lesespor/oslo/lesespor_oslo_religion.json").items.filter((item) => item.place_ids.includes(place.id));
  assert.ok(readings.length >= 3);
  assert.equal(exists("data/stories/stories_trefoldighetskirken.json"), false);
  const packet = read("data/places/production/trefoldighetskirken.json");
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.reviews.factual.status, "passed");
  assert.equal(packet.reviews.editorial.status, "passed");
  assert.equal(packet.quizReadiness.totalQuestions, 35);
  assert.equal(packet.source_conflicts.length, 2);
  const audit = read("reports/place-production/trefoldighetskirken-phase1-24-gate-audit-v1.json");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
  const workcard = read("reports/place-production/trefoldighetskirken-workcard-current.json");
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.rule_preflight.status, "PASS");
  assert.equal(workcard.quality_gate, "30/30");
});
