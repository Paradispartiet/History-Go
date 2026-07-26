const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data/people/manifest.json"), "utf8"));
const targets = ["albert_nordengen", "rolf_stranger", "haakon_vii", "kirsten_sand"];

function allPeople() {
  const result = [];
  for (const relative of manifest.files) {
    const file = path.join(ROOT, "data", relative);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const entry of Array.isArray(data) ? data : [data]) result.push({ entry, file });
  }
  return result;
}

function byId(id) {
  return allPeople().filter(item => item.entry?.id === id);
}
function byName(name) {
  return allPeople().filter(item => item.entry?.name === name);
}

test("political and municipal batch remains canonical and unique", () => {
  for (const id of targets) assert.equal(byId(id).length, 1, id);
  assert.equal(byName("Halvdan Eyvind Stokke").length, 1);
});

test("four documented Rådhus profiles expose rich popup data", () => {
  const people = [
    byId("albert_nordengen")[0].entry,
    byId("rolf_stranger")[0].entry,
    byName("Halvdan Eyvind Stokke")[0].entry,
    byId("haakon_vii")[0].entry
  ];
  for (const person of people) {
    assert.ok(person.places.includes("oslo_radhus"), person.name);
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3, person.name);
    assert.ok(person.works.length >= 7, person.name);
    assert.ok(person.education.length >= 3, person.name);
    assert.ok(person.themes.length >= 6, person.name);
    assert.ok(person.externalLinks.length >= 4, person.name);
    assert.ok(person.externalLinks.every(source => /^https:\/\//.test(source.url)), person.name);
  }
});

test("Kirsten Sand is corrected to documented work rather than a false Rådhus relation", () => {
  const person = byId("kirsten_sand")[0].entry;
  assert.equal(person.places.includes("oslo_radhus"), false);
  assert.equal(person.placeId, "universitetsplassen");
  assert.equal(person.birth_date, "1895-11-27");
  assert.ok(person.works.length >= 8);
  assert.match(JSON.stringify(person), /Gjenreisingen av Nord-Troms/);
  assert.match(JSON.stringify(person), /Mellomveien 130/);
  assert.ok(person.materials.length >= 6);
  assert.ok(person.externalLinks.length >= 4);
});

test("existing person-image identities are preserved", () => {
  assert.equal(byId("kirsten_sand")[0].entry.image, "bilder/kort/people/kirsten_sand.PNG");
  assert.equal(byId("haakon_vii")[0].entry.image, "bilder/kort/people/haakon_vii.PNG");
});
