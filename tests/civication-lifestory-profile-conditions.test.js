#!/usr/bin/env node
// Profil-conditions: History GO-profilen (ProfileSignalBridge) styrer hvilke
// private scener som tilbys. To spillere med samme rolle men ulik profil får
// ulikt privatliv. Uten profil-snapshot fyrer profilgatede scener ALDRI.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
const Bridge = require("../js/Civication/lifestory/lifestoryShellBridge.js");

const ROOT = path.join(__dirname, "..");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const manifest = read("data/Civication/lifestory/manifest.json");
const e = manifest.roles.arbeidsledig;
const raw = {
  role: read(e.role), phaseDefinitions: read(manifest.shared.phaseDefinitions),
  roleThreads: read(e.threads), roleScenes: read(e.scenes),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
const content = Content.buildContent(raw);

// --- 1. Validatoren: streng form, fail fast ---
for (const [broken, msg] of [
  [{ profil: { tags: [] } }, /ikke-tom/],
  [{ profil: { tags: ["Kultur"] } }, /små bokstaver/],
  [{ profil: { feil: ["x"] } }, /ukjent nøkkel/],
  [{ profil: ["x"] } , /tags/]
]) {
  assert.throws(() => {
    const b = JSON.parse(JSON.stringify(raw));
    b.lifeScenes.scenes[0].conditions = broken;
    Content.buildContent(b);
  }, msg, "ugyldig profil-condition skal kaste: " + JSON.stringify(broken));
}

// --- 2. Uten snapshot: profilgatede scener er aldri kandidater ---
delete globalThis.CivicationLifestoryProfileTags;
let state = State.createInitialState(content);
state.fase = "ettermiddag";
let kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
assert.ok(!kandidater.includes("by_01_kulturell_omvei"), "uten profil: ingen kulturscene");

// --- 3. Med kultur-profil: kulturscenen tilbys, sportsscenen ikke ---
globalThis.CivicationLifestoryProfileTags = ["culture", "historie"];
try {
  kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
  assert.ok(kandidater.includes("by_01_kulturell_omvei"), "kultur-profil => kulturell omvei tilbys");

  const state2 = State.createInitialState(content);
  state2.dag = 2; state2.fase = "ettermiddag";
  state2.threadState.byen_og_deg = { status: "active", step: 0, lastSceneId: null };
  const k2 = Runner.getCandidateScenes(state2, content).map((s) => s.id);
  assert.ok(!k2.includes("by_02_banen_frister"), "kultur-profil har IKKE sport => banen tilbys ikke");

  globalThis.CivicationLifestoryProfileTags = ["sport"];
  const k3 = Runner.getCandidateScenes(state2, content).map((s) => s.id);
  assert.ok(k3.includes("by_02_banen_frister"), "sport-profil => banen frister");
} finally {
  delete globalThis.CivicationLifestoryProfileTags;
}

// --- 4. Snapshot-holderen: async bridge -> synkron global ---
(async () => {
  globalThis.CivicationProfileSignalBridge = { getProfileTags: async () => ["nature", "by"] };
  try {
    const tags = await Bridge.refreshProfileSnapshot();
    assert.deepStrictEqual(tags, ["nature", "by"]);
    assert.deepStrictEqual(globalThis.CivicationLifestoryProfileTags, ["nature", "by"],
      "snapshotet legges synkront tilgjengelig for runneren");
  } finally {
    delete globalThis.CivicationProfileSignalBridge;
    delete globalThis.CivicationLifestoryProfileTags;
  }
  // Uten bridge: null, ingen snapshot.
  assert.strictEqual(await Bridge.refreshProfileSnapshot(), null);

  // --- 5. Batch 2-scenene er profilgatede og følger prioritetskontrakten ---
  const life = read(manifest.life.scenes);
  const batch2 = ["by_01_kulturell_omvei", "by_01_groent_kveldslys", "by_02_banen_frister",
    "by_02_lokalt_moete", "by_02_miljoeet_samles", "venn_01_invitasjon_fra_byen"];
  for (const id of batch2) {
    const sc = life.scenes.find((s) => s.id === id);
    assert.ok(sc && sc.conditions && sc.conditions.profil, `${id} skal være profilgatet`);
  }
  console.log("civication lifestory profile conditions ok (profil styrer privatlivet, aldri uten snapshot)");
})().catch((err) => { console.error(err); process.exit(1); });
