#!/usr/bin/env node
// Skall-jobb -> Life Story-rolle: tar spilleren en jobb i skallet, spiller
// Min dag rollen som matcher — via canonical CivicationCareerRoleResolver
// (role_scope) + role_scope-binding i lifestory-manifestet.
// Kun URL-parameteren ?lifestoryRole= overstyrer jobbrollen ved denne lasting.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const Resolver = require("../js/Civication/systems/civicationCareerRoleResolver.js");

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data/Civication/lifestory/manifest.json"), "utf8"));

// --- 1. Manifest-bindingene er gyldige og unike ---
const scopes = [];
for (const [roleId, entry] of Object.entries(manifest.roles)) {
  if (roleId === "arbeidsledig") {
    // Startrollen: ingen jobb mapper til arbeidsledighet — bevisst uten binding.
    assert.strictEqual(entry.role_scope, undefined, "arbeidsledig skal ikke ha role_scope");
    continue;
  }
  assert.ok(typeof entry.role_scope === "string" && entry.role_scope.trim(),
    `rollen ${roleId} mangler role_scope-binding`);
  scopes.push(entry.role_scope);
}
assert.strictEqual(new Set(scopes).size, scopes.length, "role_scope-bindinger må være unike");
assert.strictEqual(manifest.roles.renholder.role_scope, "renholder");
assert.strictEqual(manifest.roles.arealplanlegger.role_scope, "by_radgiver_plan");

// --- 2. Ren mapping: role_scope -> lifestory-rolle ---
assert.strictEqual(Content.resolveRoleIdForRoleScope(manifest, "renholder"), "renholder");
assert.strictEqual(Content.resolveRoleIdForRoleScope(manifest, "by_radgiver_plan"), "arealplanlegger");
assert.strictEqual(Content.resolveRoleIdForRoleScope(manifest, "ekspeditor"), "ekspeditor");
assert.strictEqual(Content.resolveRoleIdForRoleScope(manifest, "lager_og_driftsmedarbeider"), null,
  "scope uten Life Story-pakke gir null — ingen fallback");
assert.strictEqual(Content.resolveRoleIdForRoleScope(manifest, "unknown"), null);
assert.strictEqual(Content.resolveRoleIdForRoleScope(manifest, ""), null);
assert.strictEqual(Content.resolveRoleIdForRoleScope(null, "renholder"), null);

// --- 3. Ende-til-ende med den EKTE resolveren: aktiv posisjon -> rolle ---
// Formene under speiler hva CivicationJobs.acceptOffer faktisk lagrer.
const renholderPos = { career_id: "naeringsliv", role_key: "renholder", title: "Renholder" };
const planPos = { career_id: "by", role_key: "by_radgiver_plan", title: "Arealplanlegger" };
const ekspeditorPos = { career_id: "naeringsliv", role_key: "ekspeditor", title: "Ekspeditør" };
const lagerPos = { career_id: "naeringsliv", role_key: "lager_og_driftsmedarbeider", title: "Lager- og driftsmedarbeider" };
assert.strictEqual(Resolver.resolveCareerRoleScope(renholderPos), "renholder");
assert.strictEqual(
  Content.resolveRoleIdForRoleScope(manifest, Resolver.resolveCareerRoleScope(renholderPos)),
  "renholder", "renholder-jobb i skallet gir renholder i Life Story");
assert.strictEqual(
  Content.resolveRoleIdForRoleScope(manifest, Resolver.resolveCareerRoleScope(planPos)),
  "arealplanlegger", "arealplanlegger-jobb gir arealplanlegger");
assert.strictEqual(
  Content.resolveRoleIdForRoleScope(manifest, Resolver.resolveCareerRoleScope(ekspeditorPos)),
  "ekspeditor", "ekspeditør-jobb i skallet gir ekspeditør i Life Story");
assert.strictEqual(
  Content.resolveRoleIdForRoleScope(manifest, Resolver.resolveCareerRoleScope(lagerPos)),
  null, "lager har ingen Life Story-pakke ennå — Min dag bytter ikke");

// --- 4. JSDOM: Min dag adopterer skall-jobben ved civi:booted ---
async function jsdomAdoption() {
  const dom = new JSDOM(`<!doctype html><html><body class="civi-app">
    <header><div id="civiLifestoryHeaderStatus"></div></header>
    <section id="civiLifestorySection"><h2>Min dag</h2><div id="civiLifestoryPanel"></div></section>
  </body></html>`, { url: "http://localhost/Civication.html", runScripts: "outside-only" });
  const { window } = dom;
  // A debug override from an earlier visit must not pin the actual job role.
  window.localStorage.setItem("civication_lifestory_role_v1", "arealplanlegger");
  window.fetch = async (p) => {
    const abs = path.join(ROOT, String(p).replace(/^\.?\//, ""));
    if (!fs.existsSync(abs)) return { ok: false, status: 404, json: async () => null, text: async () => "" };
    const text = fs.readFileSync(abs, "utf8");
    return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
  };

  // Skallet: aktiv renholder-jobb + den ekte resolveren.
  window.CivicationState = { getActivePosition: () => renholderPos };

  const CHAIN = [
    "js/Civication/systems/civicationCareerRoleResolver.js",
    "js/Civication/core/CivicationStorageAdapter.js",
    "js/Civication/core/civicationJsonStore.js",
    "js/Civication/lifestory/lifestoryContent.js",
    "js/Civication/lifestory/lifestoryState.js",
    "js/Civication/lifestory/lifestoryRunner.js",
    "js/Civication/ui/CivicationLifestoryUI.js"
  ];
  for (const file of CHAIN) {
    window.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  }

  // Min dag laster standardrollen først (ingen eksplisitt valg).
  await new Promise((r) => setTimeout(r, 300));
  let panel = window.document.getElementById("civiLifestoryPanel");
  assert.ok(panel.textContent.includes("Skoleveien") || panel.textContent.length > 0,
    "Min dag rendrer standardrollen først");

  // Skallet booter -> Min dag følger jobben og bytter til renholder.
  window.dispatchEvent(new window.Event("civi:booted"));
  await new Promise((r) => setTimeout(r, 400));
  panel = window.document.getElementById("civiLifestoryPanel");
  assert.ok(panel.textContent.includes("Rommet som så rent ut"),
    "etter civi:booted spiller Min dag renholder (fikk: " + panel.textContent.slice(0, 120) + ")");
  const stored = JSON.parse(window.localStorage.getItem("civication_lifestory_v1"));
  assert.strictEqual(stored.rolle, "renholder", "Player State byttet til renholder");
  assert.strictEqual(window.localStorage.getItem("civication_lifestory_role_v1"), null,
    "adopsjon fra skallet skrives ALDRI som eksplisitt valg");

  // --- 5. Eksplisitt valg vinner over skall-jobben ---
  const dom2 = new JSDOM(`<!doctype html><html><body class="civi-app">
    <section id="civiLifestorySection"><div id="civiLifestoryPanel"></div></section>
  </body></html>`, { url: "http://localhost/Civication.html?lifestoryRole=arealplanlegger", runScripts: "outside-only" });
  const w2 = dom2.window;
  w2.fetch = window.fetch;
  w2.CivicationState = { getActivePosition: () => renholderPos };
  for (const file of CHAIN) {
    w2.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  }
  await new Promise((r) => setTimeout(r, 300));
  w2.dispatchEvent(new w2.Event("civi:booted"));
  await new Promise((r) => setTimeout(r, 400));
  const stored2 = JSON.parse(w2.localStorage.getItem("civication_lifestory_v1"));
  assert.strictEqual(stored2.rolle, "arealplanlegger",
    "eksplisitt ?lifestoryRole= vinner over skall-jobben");
  assert.strictEqual(w2.localStorage.getItem("civication_lifestory_role_v1"), null,
    "test-URL må ikke lagre varig overstyring av spillerrollen");

  // --- 6. Real job without a dedicated author pack must not stop private life ---
  const dom3 = new JSDOM(`<!doctype html><html><body class="civi-app">
    <section id="civiLifestorySection"><div id="civiLifestoryPanel"></div></section>
  </body></html>`, { url: "http://localhost/Civication.html", runScripts: "outside-only" });
  const w3 = dom3.window;
  w3.fetch = window.fetch;
  let job = { career_id: "kunst", role_key: "kunst_publikum_og_formidling", title: "Museumsvert" };
  w3.CivicationState = { getActivePosition: () => job };
  for (const file of CHAIN) w3.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  await new Promise(resolve => setTimeout(resolve, 400));
  w3.dispatchEvent(new w3.Event("civi:booted"));
  await new Promise(resolve => setTimeout(resolve, 550));
  const privatePanel = w3.document.getElementById("civiLifestoryPanel");
  assert.ok(privatePanel.querySelector("[data-lifestory-personal-only]"),
    "an earned art job without a dedicated work story still shows private life");
  assert.ok(!privatePanel.textContent.includes("Meldekort må sendes"),
    "working at the museum must never produce stale NAV unemployment mail");
  const info = w3.CivicationLifestoryUI.getCurrentSceneInfo();
  assert.ok(info?.sceneId, "personal story remains playable with unmapped formal work");
  const sharedLife = JSON.parse(fs.readFileSync(
    path.join(ROOT, "data/Civication/lifestory/life/scenes.json"), "utf8"));
  assert.ok(sharedLife.scenes.some(scene => scene.id === info.sceneId),
    "the playable event comes from real shared private authorship");
  const choice = privatePanel.querySelector("[data-lifestory-choice]:not([disabled])");
  assert.ok(choice, "a real choice is accessible in personal-only mode");
  choice.click();
  await new Promise(resolve => setTimeout(resolve, 120));
  let personalSave = JSON.parse(w3.localStorage.getItem("civication_lifestory_v1"));
  assert.ok(personalSave.arkiv.some(entry => entry.sceneId === info.sceneId),
    "personal choice is played and archived even with art employment");
  assert.ok(personalSave.privatHistorie?.arkiv?.some(entry => entry.sceneId === info.sceneId),
    "the shared personal archive receives the played event");
  job = renholderPos;
  w3.dispatchEvent(new w3.Event("updateProfile"));
  await new Promise(resolve => setTimeout(resolve, 700));
  personalSave = JSON.parse(w3.localStorage.getItem("civication_lifestory_v1"));
  assert.strictEqual(personalSave.rolle, "renholder", "mapped job role can resume from private mode");
  assert.ok(personalSave.arkiv.some(entry => entry.sceneId === info.sceneId),
    "shared personal choice and history survive a subsequent mapped job");
  assert.strictEqual(privatePanel.querySelector("[data-lifestory-personal-only]"), null,
    "mapped work pack restores its own authored story");
  dom3.window.close();
}

// --- 6. Konto-backup med gammel testrolle må migreres, også i skyen ---
// Dette reproduserer rekkefølgen som tidligere var feil:
// UI starter, kontoskyen gjenoppretter legacy-nøkkelen ASYNKRONT,
// og neste innlogging må ikke gjenopprette den på nytt.
async function jsdomCloudRestoredLegacyRole() {
  const dom = new JSDOM(`<!doctype html><html><body class="civi-app">
    <section id="civiLifestorySection"><div id="civiLifestoryPanel"></div></section>
  </body></html>`, { url: "http://localhost/Civication.html", runScripts: "outside-only" });
  const { window } = dom;
  let remote = {
    payload: { state: { civication_lifestory_role_v1: "arealplanlegger" } },
    created_at: "2026-10-20T10:00:00Z"
  };
  let writes = 0;
  let releaseAuth;
  const authGate = new Promise(resolve => { releaseAuth = resolve; });
  const supabase = {
    from(table) {
      assert.strictEqual(table, "aha_imports");
      return {
        select() { return this; },
        eq() { return this; },
        async maybeSingle() { return { data: remote, error: null }; },
        async upsert(record) { writes++; remote = record; return { error: null }; }
      };
    }
  };
  window.HistoryGoAHAAuth = {
    async getSession() {
      await authGate;
      return { user: { id: "legacy-account" } };
    },
    async getClient() { return supabase; }
  };
  window.CivicationState = { getActivePosition: () => renholderPos };
  window.fetch = async p => {
    const file = path.join(ROOT, String(p).replace(/^\.?\//, ""));
    if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => null, text: async () => "" };
    const text = fs.readFileSync(file, "utf8");
    return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
  };
  try {
    window.eval(fs.readFileSync(path.join(ROOT, "js/Civication/core/CivicationCloudSave.js"), "utf8"));
    for (const file of [
      "js/Civication/systems/civicationCareerRoleResolver.js",
      "js/Civication/core/CivicationStorageAdapter.js",
      "js/Civication/core/civicationJsonStore.js",
      "js/Civication/lifestory/lifestoryContent.js",
      "js/Civication/lifestory/lifestoryState.js",
      "js/Civication/lifestory/lifestoryRunner.js",
      "js/Civication/ui/CivicationLifestoryUI.js"
    ]) window.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));

    assert.strictEqual(window.localStorage.getItem("civication_lifestory_role_v1"), null,
      "ingen lokal nøkkel før den forsinkede sky-gjenopprettingen");
    releaseAuth();
    await window.CivicationCloudSave.ready;
    window.dispatchEvent(new window.Event("civi:booted"));
    await new Promise(resolve => setTimeout(resolve, 750));

    const saved = JSON.parse(window.localStorage.getItem("civication_lifestory_v1"));
    assert.strictEqual(saved.rolle, "renholder", "skallets reelle jobb vinner over testrollen");
    assert.strictEqual(window.localStorage.getItem("civication_lifestory_role_v1"), null,
      "testnøkkelen fjernes ETTER sky-gjenoppretting");

    await window.CivicationCloudSave.flush();
    assert.ok(writes >= 1, "migreringen blir sendt til kontoskyen");
    assert.strictEqual(remote.payload.state.civication_lifestory_role_v1, undefined,
      "sky-backupen må heller ikke inneholde gammel testrolle");
    assert.ok(remote.payload.state.civication_lifestory_v1,
      "ekte Life Story-progresjon bevares i skyen");
  } finally {
    dom.window.close();
  }
}

jsdomAdoption()
  .then(() => jsdomCloudRestoredLegacyRole())
  .then(() => {
    console.log("civication lifestory shell role bridge ok (jobb->rolle, gammel sky-testrolle ryddet)");
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
