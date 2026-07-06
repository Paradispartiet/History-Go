#!/usr/bin/env node
// Civication v2: Civication.html skal KUN laste Life Story-flyten som
// primærspill. Hele v1-maskineriet (mailmotorer, next-action, workday,
// day progression, kart, boot) skal ligge i legacy-loaderen og aldri
// som script-tags i hovedflyten.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "Civication.html"), "utf8");

// --- 1. Hovedflyten laster bare v2-scriptene, i riktig rekkefølge ---
const V2_ALLOWLIST = [
  "js/Civication/civicationV2Config.js",
  "js/Civication/core/CivicationStorageAdapter.js",
  "js/Civication/core/civicationJsonStore.js",
  "js/Civication/lifestory/lifestoryContent.js",
  "js/Civication/lifestory/lifestoryState.js",
  "js/Civication/lifestory/lifestoryRunner.js",
  "js/Civication/ui/CivicationLifestoryUI.js",
  "js/Civication/civicationLegacyLoader.js"
];

const loadedScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
assert.deepStrictEqual(
  loadedScripts,
  V2_ALLOWLIST,
  "Civication.html skal laste nøyaktig v2-kjeden, i denne rekkefølgen"
);

// v2-config må stå først (setter legacy-flagget), legacy-loaderen sist.
assert.strictEqual(loadedScripts[0], "js/Civication/civicationV2Config.js");
assert.strictEqual(loadedScripts[loadedScripts.length - 1], "js/Civication/civicationLegacyLoader.js");

// --- 2. Gamle hovedmotorer er ute av hovedflyten ---
const RETIRED_FROM_MAIN_FLOW = [
  "civicationMailEngine.js",
  "civicationMailRuntime.js",
  "civicationDailyMailBuilder.js",
  "civicationWorkdayMailBuilder.js",
  "civicationPrivatePhaseMailBuilder.js",
  "civicationLifeMailRuntime.js",
  "civicationMailPlanDebug.js",
  "civicationNextActionSelector.js",
  "CivicationNextActionUI.js",
  "dayProgressionController.js",
  "civicationWorkdayRuntime.js",
  "CivicationInboxTopActionUI.js",
  "CivicationBoot.js"
];
for (const file of RETIRED_FROM_MAIN_FLOW) {
  assert.ok(
    !html.includes(`<script src="js/Civication`) || !loadedScripts.some((s) => s.endsWith("/" + file)),
    `${file} skal ikke lastes i hovedflyten`
  );
}

// --- 3. Alt som ble tatt ut finnes i legacy-loaderen, og filene eksisterer ---
const loader = require("../js/Civication/civicationLegacyLoader.js");
assert.ok(Array.isArray(loader.LEGACY_SCRIPTS) && loader.LEGACY_SCRIPTS.length >= 100,
  "legacy-loaderen skal bære hele v1-kjeden");
for (const file of RETIRED_FROM_MAIN_FLOW) {
  assert.ok(loader.LEGACY_SCRIPTS.some((s) => s.endsWith("/" + file)),
    `${file} skal ligge i legacy-loaderen (ikke slettet, bare deaktivert)`);
}
for (const src of loader.LEGACY_SCRIPTS) {
  assert.ok(fs.existsSync(path.join(ROOT, src)), `legacy-script mangler på disk: ${src}`);
}
assert.strictEqual(loader.LEGACY_SCRIPTS[loader.LEGACY_SCRIPTS.length - 1],
  "js/Civication/CivicationBoot.js", "legacy-boot skal lastes sist i legacy-kjeden");

// Ingen dobbeltlasting: intet script i både hovedflyt og legacy-kjede.
for (const src of loader.LEGACY_SCRIPTS) {
  assert.ok(V2_ALLOWLIST.indexOf(src) === -1, `${src} kan ikke være både v2 og legacy`);
}

// --- 4. Legacy er av som standard (Node har verken URL-param eller localStorage) ---
const config = require("../js/Civication/civicationV2Config.js");
assert.strictEqual(config.resolveLegacyEnabled(), false, "legacy skal være av uten eksplisitt flagg");
assert.strictEqual(loader.isEnabled(), false, "loaderen skal se at legacy er av");

// --- 5. Layout: Min dag er første panel, gamle flater er merket legacy ---
const lifestoryPos = html.indexOf('id="civiLifestorySection"');
assert.ok(lifestoryPos !== -1, "Min dag-seksjonen finnes");
for (const legacySectionId of ["civiDashboardSection", "civiInboxSection", "civiWorkdaySection", "activeJobSection"]) {
  const pos = html.indexOf(`id="${legacySectionId}"`);
  assert.ok(pos > lifestoryPos, `${legacySectionId} skal ligge etter Min dag`);
}
for (const legacyId of ["civiInboxSection", "civiWorkdaySection", "civiDashboardSection", "civiMapWorld", "civiTrackHUD"]) {
  const tag = new RegExp(`<[^>]*id="${legacyId}"[^>]*data-civi-legacy[^>]*hidden`, "s");
  assert.ok(tag.test(html), `${legacyId} skal være merket data-civi-legacy og hidden`);
}
assert.ok(html.includes('id="civiLifestoryHeaderStatus"'), "v2-headerstatus finnes i toppfeltet");

console.log("civication v2 main flow ok (" + loader.LEGACY_SCRIPTS.length + " scripts i legacy-kjeden)");
