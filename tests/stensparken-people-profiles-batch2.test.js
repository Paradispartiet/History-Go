const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  {
    id: "jo_visdal",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 6,
    sources: 3,
    expected: ["Korsfestelsen", "1904", "Fagerborg kirke"]
  },
  {
    id: "lars_utne",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Døpefonten i Fagerborg kirke", "hvit marmor", "Gutten med beltet"]
  },
  {
    id: "miksa_roth",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Oppstandelsen", "Pest", "secesjon"]
  },
  {
    id: "jens_bjelke",
    file: "data/people/historie/oslo/people_historie_oslo.json",
    works: 6,
    sources: 3,
    expected: ["Norges rikes kansler", "Sten gård", "1629"]
  }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("Stensparken batch 2 contains four unique canonical people profiles", () => {
  const manifest = readJson("data/people/manifest.json");
  const seen = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    const entries = Array.isArray(data) ? data : [data];
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      if (!TARGETS.some(target => target.id === entry.id)) continue;
      assert.equal(seen.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      seen.set(entry.id, file);
    }
  }
  assert.deepEqual([...seen.keys()].sort(), TARGETS.map(target => target.id).sort());
});

test("each batch 2 profile has rich popup data, works, places and inspectable sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, `${target.id} missing from ${target.file}`);
    assert.ok(person.places.includes("stensparken"));
    assert.ok(String(person.popupDesc || "").split(/\n\s*\n/).length >= 3);
    assert.ok(Array.isArray(person.works) && person.works.length >= target.works);
    assert.ok(Array.isArray(person.themes) && person.themes.length >= 5);
    assert.ok(Array.isArray(person.externalLinks) && person.externalLinks.length >= target.sources);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)));
    const serialized = JSON.stringify(person);
    for (const value of target.expected) assert.match(serialized, new RegExp(value));
  }
});

test("the incorrect Max Roth seed is migrated to canonical Miksa Róth", () => {
  const stensparken = readJson("data/places/by/oslo/places/stensparken.json");
  const seeds = stensparken.people_relations_seed || [];
  assert.equal(seeds.some(seed => seed.person_id === "max_roth"), false);
  assert.equal(seeds.some(seed => seed.person_id === "miksa_roth" && seed.work === "glassmaleri"), true);
  const person = getPerson(TARGETS.find(target => target.id === "miksa_roth"));
  assert.equal(person.name, "Miksa Róth");
  assert.equal(person.initials, "MR");
  assert.equal(person.image, "");
  assert.equal(person.cardImage, "");
});

test("Jens Bjelke keeps Tøyen as primary place while gaining the Sten farm relation", () => {
  const person = getPerson(TARGETS.find(target => target.id === "jens_bjelke"));
  assert.equal(person.placeId, "toyen_torg");
  assert.ok(person.places.includes("den_gamle_krigsskolen"));
  assert.ok(person.places.includes("stensparken"));
  assert.equal(person.birth_date, "1580-02-02");
  assert.equal(person.death_date, "1659-11-07");
});
