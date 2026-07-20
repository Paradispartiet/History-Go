#!/usr/bin/env node
// Livsstilsbroen: valg i Min dag (valg.livsstil) mater skallets HG_Lifestyle,
// slik at spillemønsteret over dager drar spilleren mot en av de 13
// livsstilene i data/Civication/lifestyles.json (pub => nightlife =>
// hipster/gjeldsspiral; eget prosjekt => craft => håndverker/teknokrat).
// Kontrakt: énveis, testmodus skriver aldri, vokabularet er låst til
// lifestyles.json (fail fast på ukjente tags).
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const Bridge = require("../js/Civication/lifestory/lifestoryShellBridge.js");

const ROOT = path.join(__dirname, "..");
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

// --- 1. Vokabularet er i sync med lifestyles.json (ingen drift) ---
const lifeData = readJson("data/Civication/lifestyles.json");
const dataTags = new Set();
for (const life of lifeData.lifestyles) {
  for (const key of ["core_tags", "bonus_tags", "anti_tags", "tags", "avoid_tags"]) {
    for (const t of life[key] || []) dataTags.add(t);
  }
}
assert.ok(Array.isArray(Content.LIVSSTIL_TAGS) && Content.LIVSSTIL_TAGS.length,
  "validatoren eksporterer LIVSSTIL_TAGS");
for (const tag of Content.LIVSSTIL_TAGS) {
  assert.ok(dataTags.has(tag),
    `LIVSSTIL_TAGS har "${tag}" som ikke finnes i lifestyles.json — vokabularet har driftet`);
}

// --- 2. Alle tags brukt i innholdet er i vokabularet ---
const manifest = readJson("data/Civication/lifestory/manifest.json");
const usedTags = new Map(); // tag -> antall valg
const sceneFiles = [manifest.life.scenes, ...Object.values(manifest.roles).map((r) => r.scenes)];
for (const file of sceneFiles) {
  for (const sc of readJson(file).scenes) {
    for (const v of sc.valg || []) {
      if (v.livsstil === undefined) continue;
      assert.ok(Array.isArray(v.livsstil) && v.livsstil.length,
        `${file} ${sc.id}/${v.id}: livsstil skal være ikke-tom liste`);
      for (const tag of v.livsstil) {
        assert.ok(Content.LIVSSTIL_TAGS.includes(tag),
          `${file} ${sc.id}/${v.id}: ukjent livsstilstag "${tag}"`);
        usedTags.set(tag, (usedTags.get(tag) || 0) + 1);
      }
    }
  }
}
// Kjerneretningene fra produktkravet er faktisk i bruk.
for (const tag of ["nightlife", "craft", "fitness", "budget", "family", "avoidance"]) {
  assert.ok(usedTags.has(tag), `retningen "${tag}" er ikke brukt i noe valg`);
}

// --- 3. Validatoren feiler hardt på ukjent tag (ingen gjetting) ---
const arbeidsledig = manifest.roles.arbeidsledig;
const raw = {
  role: readJson(arbeidsledig.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(arbeidsledig.threads),
  roleScenes: readJson(arbeidsledig.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};
Content.buildContent(raw); // gyldig som utgangspunkt
assert.throws(() => {
  const broken = JSON.parse(JSON.stringify(raw));
  broken.roleScenes.scenes[0].valg[0].livsstil = ["yolo_tag"];
  Content.buildContent(broken);
}, /ukjent livsstilstag/, "ukjent livsstilstag skal kaste");

// --- 4. Broen: skriver i vanlig økt, aldri i testmodus, no-op uten motor ---
const g = globalThis;
const calls = [];
g.HG_Lifestyle = { addTags: (tags, source) => { calls.push({ tags, source }); } };
try {
  let res = Bridge.applyLifestyleTagsToShell(["nightlife"]);
  assert.deepStrictEqual(res, { applied: ["nightlife"], skipped: null });
  assert.deepStrictEqual(calls, [{ tags: ["nightlife"], source: "lifestory" }],
    "taggene går til HG_Lifestyle.addTags med kilde lifestory");

  res = Bridge.applyLifestyleTagsToShell([]);
  assert.deepStrictEqual(res, { applied: [], skipped: null }, "tomme tags er stille no-op");
  assert.strictEqual(calls.length, 1, "ingen addTags-kall uten tags");

  g.CIVICATION_TEST_MODE = true;
  res = Bridge.applyLifestyleTagsToShell(["craft"]);
  assert.strictEqual(res.skipped, "test_mode", "testmodus skriver ALDRI livsstil");
  assert.strictEqual(calls.length, 1, "testmodus nådde aldri motoren");
  delete g.CIVICATION_TEST_MODE;

  delete g.HG_Lifestyle;
  res = Bridge.applyLifestyleTagsToShell(["craft"]);
  assert.strictEqual(res.skipped, "lifestyle_unavailable", "uten motor: stille no-op");
} finally {
  delete g.HG_Lifestyle;
  delete g.CIVICATION_TEST_MODE;
}

// --- 5. UI-en kaller broen ved valg ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes("applyLifestyleTagsToShell"),
  "CivicationLifestoryUI må sende valgets livsstilstags til broen");

// --- 6. Retningene treffer riktige livsstiler (samme scoring som HG_Lifestyle) ---
function score(life, counts) {
  const s = (arr, w) => (arr || []).reduce((sum, t) => sum + w * (counts[t] || 0), 0);
  return s(life.core_tags, 2) + s(life.bonus_tags || life.tags, 1) - s(life.anti_tags || life.avoid_tags, 1);
}
function topLifestyles(counts, n) {
  return lifeData.lifestyles
    .map((l) => ({ id: l.id, sc: score(l, counts) }))
    .sort((a, b) => b.sc - a.sc)
    .slice(0, n)
    .map((x) => x.id);
}
// En uke med pub-valg drar mot uteliv-livsstilene, ikke friluftstype.
let top = topLifestyles({ nightlife: 5 }, 3);
assert.ok(top.includes("hipster") || top.includes("debt_spiral"),
  `pub-mønster skal dra mot uteliv-livsstiler, fikk: ${top.join(",")}`);
assert.ok(!top.includes("outdoorsy"), "pub-mønster skal ikke toppe friluftstype");
// En uke med egne prosjekter drar mot craft-livsstilene.
top = topLifestyles({ craft: 5 }, 3);
assert.ok(top.includes("craftsman") || top.includes("technocrat"),
  `prosjekt-mønster skal dra mot håndverker/teknokrat, fikk: ${top.join(",")}`);

console.log("civication lifestory livsstilsbro ok (valg -> tags -> HG_Lifestyle, "
  + usedTags.size + " retninger i bruk)");
