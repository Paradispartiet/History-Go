const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  {
    id: "sigrid_undset",
    file: "data/people/litteratur/oslo/people_litteratur_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Kristin Lavransdatter", "Nobel Prize"]
  },
  {
    id: "harald_aars",
    file: "data/people/by/oslo/people_by_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Kjærlighetskarusellen", "Royal College of Art"]
  },
  {
    id: "hagbarth_schytte_berg",
    file: "data/people/by/oslo/people_by_oslo.json",
    works: 6,
    sources: 4,
    expected: ["Fagerborg kirke", "Hannover"]
  },
  {
    id: "per_barclay",
    file: "data/people/kunst/oslo/people_kunst_oslo.json",
    works: 5,
    sources: 3,
    expected: ["Kjærlighetskarusellen", "motorolje"]
  }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function getPerson(target) {
  return readJson(target.file).find(entry => entry.id === target.id);
}

test("Stensparken batch contains four unique canonical people profiles", () => {
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

test("each Stensparken profile has rich popup data, works and inspectable sources", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, `${target.id} missing from ${target.file}`);
    assert.equal(person.placeId, "stensparken");
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

test("Per Barclay uses the canonical initial fallback without an invented portrait", () => {
  const person = getPerson(TARGETS.find(target => target.id === "per_barclay"));
  assert.equal(person.initials, "PB");
  assert.equal(person.image, "");
  assert.equal(person.cardImage, "");
  assert.equal(person.birthYear, 1955);
  assert.equal(person.active_place, "Torino og Oslo");
});
