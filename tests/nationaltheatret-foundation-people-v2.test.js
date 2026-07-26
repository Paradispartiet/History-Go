const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  { id: "henrik_bull", file: "data/people/by/oslo/people_by_oslo.json", works: 8, sources: 6, expected: ["Nationaltheatret", "Lohengrin-sjokoladen"] },
  { id: "bjorn_bjornson", file: "data/people/litteratur/oslo/nationaltheatret/bjorn_bjornson.json", works: 8, sources: 4, expected: ["Nationaltheatrets reisning", "En tørst kamel"] },
  { id: "johanne_dybwad", file: "data/people/litteratur/oslo/nationaltheatret/johanne_dybwad.json", works: 8, sources: 4, expected: ["Medea", "Mor Aase"] },
  { id: "halfdan_christensen", file: "data/people/litteratur/oslo/nationaltheatret/halfdan_christensen.json", works: 8, sources: 4, expected: ["dreiescenen", "Fri Norsk Scene"] }
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function getPerson(target) {
  const data = readJson(target.file);
  return (Array.isArray(data) ? data : [data]).find(entry => entry.id === target.id);
}

test("Nationaltheatret foundation batch uses four unique canonical identities", () => {
  const manifest = readJson("data/people/manifest.json");
  assert.equal(manifest.files.includes("people/litteratur/oslo/nationaltheatret/henrik_bull.json"), false);
  assert.equal(fs.existsSync(path.join(ROOT, "data/people/litteratur/oslo/nationaltheatret/henrik_bull.json")), false);

  const targetIds = new Set(TARGETS.map(target => target.id));
  const occurrences = new Map();
  for (const relative of manifest.files) {
    const data = readJson(path.join("data", relative));
    for (const person of Array.isArray(data) ? data : [data]) {
      if (!person || !targetIds.has(person.id)) continue;
      if (!occurrences.has(person.id)) occurrences.set(person.id, []);
      occurrences.get(person.id).push(relative);
    }
  }

  for (const target of TARGETS) {
    assert.deepEqual(occurrences.get(target.id), [target.file.replace(/^data\//, "")], target.id);
  }

  const allNames = [];
  for (const relative of manifest.files) {
    const data = readJson(path.join("data", relative));
    for (const person of Array.isArray(data) ? data : [data]) {
      if (person?.name === "Henrik Bull") allNames.push({ id: person.id, file: relative });
    }
  }
  assert.deepEqual(allNames, [{ id: "henrik_bull", file: "people/by/oslo/people_by_oslo.json" }]);
});

test("each foundation profile satisfies the rich people-popup contract", () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, target.id);
    assert.equal(person.placeId, "nationaltheatret");
    assert.ok(person.places.includes("nationaltheatret"));
    assert.match(person.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(person.death_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3);
    assert.ok(person.works.length >= target.works);
    assert.ok(person.education.length >= 3);
    assert.ok(person.materials.length >= 6);
    assert.ok(person.themes.length >= 6);
    assert.ok(person.externalLinks.length >= target.sources);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)));
    assert.equal(person.verifiedAt, "2026-07-26");
    const serialized = JSON.stringify(person);
    for (const value of target.expected) assert.match(serialized, new RegExp(value));
  }
});

test("existing portrait policy is preserved", () => {
  const henrik = getPerson(TARGETS[0]);
  assert.equal(henrik.image, "bilder/kort/people/henrik_bull.PNG");
  assert.equal(henrik.cardImage, "bilder/kort/people/henrik_bull.PNG");
  for (const target of TARGETS.slice(1)) {
    const person = getPerson(target);
    assert.equal(person.image, "");
    assert.equal(person.cardImage, "");
    assert.ok(person.initials);
  }
});
