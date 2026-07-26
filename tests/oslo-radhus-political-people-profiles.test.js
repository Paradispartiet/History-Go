const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  { id: "albert_nordengen", file: "data/people/by/oslo/people_by_oslo.json", minWorks: 7, minSources: 3 },
  { id: "rolf_stranger", file: "data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", minWorks: 8, minSources: 4 },
  { id: "kirsten_sand", file: "data/people/by/oslo/people_by_oslo.json", minWorks: 8, minSources: 4 },
  { id: "haakon_vii", file: "data/people/politikk/oslo/people_politikk_oslo.json", minWorks: 9, minSources: 4 },
  { id: "halvdan_eyvind_stokke", file: "data/people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json", minWorks: 8, minSources: 4 }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}
function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("political and municipal batch contains five unique canonical profiles", () => {
  const manifest = readJson("data/people/manifest.json");
  const seen = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (!entry || !TARGETS.some(target => target.id === entry.id)) continue;
      assert.equal(seen.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      seen.set(entry.id, file);
    }
  }
  assert.deepEqual([...seen.keys()].sort(), TARGETS.map(target => target.id).sort());
});

test("each profile has rich biography, education, contributions and inspectable sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, target.id);
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3, target.id);
    assert.ok(person.works.length >= target.minWorks, target.id);
    assert.ok(person.education.length >= 3, target.id);
    assert.ok(person.themes.length >= 6, target.id);
    assert.ok(person.externalLinks.length >= target.minSources, target.id);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)), target.id);
    assert.match(person.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(person.death_date, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("Rådhus profiles use direct place evidence", () => {
  for (const id of ["albert_nordengen", "rolf_stranger", "haakon_vii", "halvdan_eyvind_stokke"]) {
    const person = getPerson(TARGETS.find(target => target.id === id));
    assert.ok(person.placeId === "oslo_radhus" || person.places.includes("oslo_radhus"), id);
  }
  const haakon = getPerson(TARGETS.find(target => target.id === "haakon_vii"));
  assert.deepEqual(haakon.places, ["slottet", "oslo_radhus", "akershus_festning"]);
});

test("Kirsten Sand no longer has invented Oslo rådhus or Universitetsplassen links", () => {
  const person = getPerson(TARGETS.find(target => target.id === "kirsten_sand"));
  assert.equal(Object.hasOwn(person, "placeId"), false);
  assert.deepEqual(person.places, []);
  assert.equal(person.placeLinkStatus, "awaiting_direct_canonical_place");
  assert.doesNotMatch(JSON.stringify({ placeId: person.placeId, places: person.places }), /oslo_radhus|universitetsplassen/);
  assert.equal(person.image, "bilder/kort/people/kirsten_sand.PNG");
});

test("Halvdan Stokke is the documented opening mayor, not a duplicate seed", () => {
  const person = getPerson(TARGETS.find(target => target.id === "halvdan_eyvind_stokke"));
  assert.equal(person.placeId, "oslo_radhus");
  assert.match(JSON.stringify(person), /Det første ordførerkjedet|ordførerkjede|St\. Hallvardkjedet/);
  assert.match(JSON.stringify(person), /15\. mai 1950/);
});
