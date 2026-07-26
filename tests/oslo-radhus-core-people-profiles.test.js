const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  { id: "arnstein_arneberg", file: "data/people/by/oslo/people_by_oslo.json", works: 7, sources: 4, expected: ["Vikingskipshuset", "FNs sikkerhetsrådssal"] },
  { id: "magnus_poulsson", file: "data/people/by/oslo/people_by_oslo.json", works: 7, sources: 5, expected: ["Lille Tøyen hageby", "Vøienvolden"] },
  { id: "alf_rolfsen", file: "data/people/kunst/oslo/people_kunst_oslo.json", works: 7, sources: 4, expected: ["Okkupasjonsfrisen", "St. Hallvard"] },
  { id: "henrik_sorensen", file: "data/people/kunst/oslo/people_kunst_oslo.json", works: 7, sources: 4, expected: ["Drømmen om den evige fred", "Arbeid, administrasjon og fest"] }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}
function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("Oslo rådhus core batch contains four unique canonical profiles", () => {
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

test("each Rådhus profile has rich popup data, works and sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, target.id);
    assert.equal(person.placeId, "oslo_radhus");
    assert.ok(person.places.includes("oslo_radhus"));
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3);
    assert.ok(person.works.length >= target.works);
    assert.ok(person.education.length >= 3);
    assert.ok(person.materials.length >= 6);
    assert.ok(person.themes.length >= 6);
    assert.ok(person.externalLinks.length >= target.sources);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)));
    const serialized = JSON.stringify(person);
    for (const value of target.expected) assert.match(serialized, new RegExp(value));
  }
});

test("existing portraits are preserved and missing portraits remain explicit", () => {
  const arneberg = getPerson(TARGETS[0]);
  const poulsson = getPerson(TARGETS[1]);
  const rolfsen = getPerson(TARGETS[2]);
  const sorensen = getPerson(TARGETS[3]);
  assert.equal(arneberg.image, "bilder/kort/people/arnstein_arneberg.PNG");
  assert.equal(poulsson.image, "bilder/kort/people/magnus_poulsson.PNG");
  assert.equal(rolfsen.image, "");
  assert.equal(sorensen.image, "");
});
