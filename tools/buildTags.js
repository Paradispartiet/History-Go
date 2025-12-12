// tools/buildTags.js
// node tools/buildTags.js > data/tags.json

import fs from "fs";

function readJSON(path) {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

function titleCase(s) {
  return s
    .replace(/^tag\./, "")
    .replace(/^subject\./, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

const places = readJSON("data/places.json");
const people = readJSON("data/people.json");
const placesOvBy = readJSON("data/overlays/by/places_by.json");
const peopleOvBy = readJSON("data/overlays/by/people_by.json");

const legacySubjects = new Set();
const tagIds = new Set();

function addLegacy(arr) {
  (arr || []).forEach(t => {
    if (!t) return;
    // legacy: "historie", "musikk", ...
    if (!String(t).startsWith("tag.")) legacySubjects.add(String(t));
    else tagIds.add(String(t));
  });
}

function addTagIds(arr) {
  (arr || []).forEach(t => {
    if (!t) return;
    if (String(t).startsWith("tag.")) tagIds.add(String(t));
    else legacySubjects.add(String(t));
  });
}

// base (legacy)
places.forEach(p => addLegacy(p.tags));
people.forEach(p => addLegacy(p.tags));

// overlays (tag.*)
placesOvBy.forEach(o => addTagIds(o.tags));
peopleOvBy.forEach(o => addTagIds(o.tags));

const tags = [];

// subjects as first-class too (so UI kan vise dem pent)
const legacy_map = {};
[...legacySubjects].sort().forEach(s => {
  const id = `subject.${s}`;
  legacy_map[s] = id;
  tags.push({ id, label: titleCase(id), type: "subject" });
});

// tag.* (fag-tags)
[...tagIds].sort().forEach(id => {
  tags.push({ id, label: titleCase(id), type: "tag", synonyms: [], parents: [], related_emner: [] });
});

const out = {
  version: 1,
  updatedAt: new Date().toISOString().slice(0, 10),
  tags,
  legacy_map
};

process.stdout.write(JSON.stringify(out, null, 2));
