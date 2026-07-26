const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.join(__dirname, "..");
const TARGETS = [
  ["agnes_mowinckel", "data/people/litteratur/oslo/nationaltheatret/agnes_mowinckel.json", ["R.U.R.", "Tante Ulrikke"]],
  ["ragna_wettergreen", "data/people/litteratur/oslo/nationaltheatret/ragna_wettergreen.json", ["Vildanden", "Eventyret"]],
  ["egil_eide", "data/people/litteratur/oslo/nationaltheatret/egil_eide.json", ["Brand", "Kong Lear"]],
  ["august_oddvar", "data/people/litteratur/oslo/nationaltheatret/august_oddvar.json", ["Sigurd Jorsalfar", "Han som sa nei"]]
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function person(relativePath) {
  const data = readJson(relativePath);
  assert.equal(data.length, 1);
  return data[0];
}

test("Nationaltheatret ensemble batch has four unique canonical identities", () => {
  const manifest = readJson("data/people/manifest.json");
  const found = new Map();
  for (const relative of manifest.files) {
    const file = path.join("data", relative);
    const data = readJson(file);
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (!entry || !TARGETS.some(([id]) => id === entry.id)) continue;
      assert.equal(found.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      found.set(entry.id, file);
    }
  }
  assert.deepEqual([...found.keys()].sort(), TARGETS.map(([id]) => id).sort());
  assert.equal(manifest.files.some(value => value.includes("agnes_mowinckel_det_norske_teatret")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "data/people/musikk/oslo/det_norske_teatret/agnes_mowinckel_det_norske_teatret.json")), false);
});

test("all four profiles satisfy the complete people-popup contract", () => {
  for (const [id, relativePath, expected] of TARGETS) {
    const entry = person(relativePath);
    assert.equal(entry.id, id);
    assert.equal(entry.placeId, "nationaltheatret");
    assert.ok(entry.places.includes("nationaltheatret"));
    assert.ok(entry.kindLabel.length > 12);
    assert.match(entry.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(entry.death_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.popupDesc.split(/\n\s*\n/).length >= 3);
    assert.ok(entry.education.length >= 3);
    assert.ok(entry.materials.length >= 6);
    assert.ok(entry.themes.length >= 6);
    assert.ok(entry.works.length >= 8);
    assert.ok(entry.externalLinks.length >= 4);
    assert.ok(entry.externalLinks.every(source => source.type === "source" && /^https:\/\//.test(source.url)));
    assert.equal(entry.image, "");
    assert.equal(entry.cardImage, "");
    const serialized = JSON.stringify(entry);
    for (const value of expected) assert.match(serialized, new RegExp(value));
  }
});

test("Agnes Mowinckel carries all three documented Oslo theatre anchors", () => {
  const entry = person(TARGETS[0][1]);
  assert.deepEqual(entry.places, ["nationaltheatret", "det_norske_teatret", "folketeateret"]);
  assert.match(JSON.stringify(entry.works), /Myrkemakti/);
  assert.match(JSON.stringify(entry.works), /Tante Ulrikke/);
});
