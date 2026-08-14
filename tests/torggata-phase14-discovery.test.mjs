import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const readJson = file => JSON.parse(read(file));
const normalize = value => String(value || "").replace(/\\r\\n/g, "\\n").replace(/[ \\t]+/g, " ").trim();
const words = value => normalize(value).split(/\\s+/).filter(Boolean).length;

test("Torggata phase 14 discovery contract", () => {
  const place = readJson("data/places/by/oslo/places/torggata.json");
  const indexData = readJson("data/places/places_index.json");
  const indexRows = Array.isArray(indexData) ? indexData : indexData.places;
  const indexed = indexRows.find(row => row.id === "torggata");
  const storgata = indexRows.find(row => row.id === "storgata");
  const lexicon = readJson("data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json");
  const audit = readJson("reports/place-production/torggata-phase14-discovery-audit-v1.json");

  assert.equal(place.id, "torggata");
  assert.equal(place.name, "Torggata");
  assert.deepEqual(place.aliases, ["Øvre Torvegade", "Torvegaden"]);
  assert.deepEqual(place.related_place_ids, ["storgata"]);
  assert.ok(storgata);
  assert.deepEqual(indexed.aliases, place.aliases);

  assert.equal(lexicon.place_id, "torggata");
  assert.equal(lexicon.title, "Torggata");
  assert.ok(lexicon.facts.length >= 2);
  assert.deepEqual(lexicon.chronology.map(item => item.year), [1846, 1852, 1876, 1929, 1986, 2014]);
  assert.ok(lexicon.chronology.every(item => item.sources?.some(source => /^https:\\/\\//.test(source.url))));
  assert.ok(words(lexicon.popupDesc) < words(place.popupDesc) / 3);

  const payload = { name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc || place.popupdesc) };
  const sourceHash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
  for (const lang of ["en", "es", "pt"]) {
    const translated = readJson("data/i18n/content/places/" + lang + ".json").torggata;
    assert.equal(translated.name, "Torggata");
    assert.equal(translated._sourceHash, sourceHash);
    assert.notEqual(normalize(translated.desc), normalize(translated.popupDesc));
    assert.ok(words(translated.popupDesc) >= 180);
    assert.ok(translated.popupDesc.split(/\\n\\s*\\n/).length >= 5);
  }

  const searchSource = read("js/core/pos.js");
  assert.match(searchSource, /Array\\.isArray\\([^)]*\\.aliases\\)/);
  const nearbySource = read("js/ui/nearbyPlacesList.ts");
  assert.match(nearbySource, /place\\.image\\s*\\|\\|\\s*place\\.cardImage/);
  assert.match(nearbySource, /place\\.category/);
  assert.match(nearbySource, /routeToPlace\\(place\\.id\\)/);
  const nextUpSource = read("js/nextUpProgression.js");
  assert.match(nextUpSource, /function placeLabel\\(place\\)/);
  assert.match(nextUpSource, /QuizEngine/);
  assert.match(nextUpSource, /type:\\s*"quiz"/);
  assert.equal(audit.checks.next_up.quiz_questions, 35);
  assert.equal(audit.checks.public_home.status, "not_applicable");
  assert.equal(audit.status, "approved");
});
