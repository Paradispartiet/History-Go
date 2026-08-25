import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
const place = read("data/places/by/oslo/places/olaf_ryes_plass.json");

test("Olaf Ryes plass preserves verified geometry and owns only the square", () => {
  assert.deepEqual([place.lat, place.lon, place.r], [59.9231, 10.7589, 170]);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.match(place.spatial_profile.canonical_scope, /Selve den navngitte/);
  assert.match(place.spatial_profile.canonical_scope, /ikke omkringliggende/);
  assert.equal(place.spatial_profile.measurement_status, "no_area_claim");
});

test("place has source-grounded chronology, interpretation and image rights", () => {
  assert.equal(place.history_layers.length, 4);
  assert.deepEqual(place.temporal_profile, {
    municipal_purchase_year: 1863, naming_year: 1864, park_laid_out_year: 1890,
    eilert_sundt_bust_year: 1892, parkteatret_cinema_origin_year: 1907, fountain_year: 1927
  });
  assert.equal(place.for_na.beforeImageMeta.objectId, "OB.Y1272");
  assert.equal(place.for_na.nowImageMeta.license, "CC BY-SA 3.0");
  assert.match(place.for_na.change, /ikke dokumentert som identiske/);
  assert.ok(place.externalLinks.filter(link => link.type === "source").length >= 6);
  assert.equal(place.interpretation.counterpoints.length, 3);
});

test("main leksikon, dated news, language and reading trails are registered", () => {
  const manifest = read("data/leksikon/manifest.json");
  assert.ok(manifest.files.includes("data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass.json"));
  assert.ok(manifest.files.includes("data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass_news.json"));
  const main = read("data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass.json");
  assert.equal(main.chronology.length, 7);
  const news = read("data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass_news.json");
  assert.equal(news.length, 2);
  assert.ok(news.every(item => item.status === "scheduled" && item.valid_through && item.verifiedAt === "2026-08-25"));
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/olaf_ryes_plass.json");
  assert.equal(language.entries.length, 3);
  assert.equal(language.dialect_status, "not_applicable_place_level");
  assert.equal(read("data/leksikon/sprak/manifest.json").place_files.olaf_ryes_plass, "data/leksikon/sprak/places/europe/norway/oslo/olaf_ryes_plass.json");
  const readings = read("data/lesespor/lesespor_oslo_batch2.json").items.filter(item => item.place_ids?.includes("olaf_ryes_plass"));
  assert.equal(readings.length, 3);
});

test("three source-bearing episode stories are registered", () => {
  const stories = read("data/stories/stories_olaf_ryes_plass.json");
  assert.equal(stories.length, 3);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.sources.length >= 2 && story.episode && story.arc));
  assert.ok(read("data/stories/stories_episode_v1_manifest.json").files.includes("data/stories/stories_olaf_ryes_plass.json"));
  assert.ok(read("data/stories/stories_manifest.json").files.some(item => item.entity_id === "olaf_ryes_plass" && item.category === "by"));
});

test("source registry and translations close the phase 4-7 gates", () => {
  const source = read("data/fag/by/source_registry_by_v1.json").places.find(item => item.place_id === "olaf_ryes_plass");
  assert.equal(source.source_status, "externally_reviewed");
  assert.ok(source.source_refs.length >= 10);
  assert.match(source.editorial_note, /1849/);
  for (const lang of ["en", "es", "pt"]) {
    const translation = read(`data/i18n/content/places/${lang}.json`).olaf_ryes_plass;
    assert.equal(translation._status, "machine_translated");
    assert.match(translation._sourceHash, /^[a-f0-9]{16}$/);
    assert.ok(translation.desc.length > 100 && translation.popupDesc.length > 400);
  }
});
