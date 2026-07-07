#!/usr/bin/env node
// Civication hovedflate: Civication.html laster HELE skallet som standard
// (kart, dashboard, nabolag, kapital, psyke, folk, rolle/arbeidsdag, innboks,
// CivicationBoot) MED «Min dag» (Life Story) som primærpanelet øverst.
// Min dag er ÉN modul i skallet, ikke hele appen. Skallet er ikke legacy.
//
// Den eneste egentlige debug-bryteren som er igjen er de tunge canvas/3D-
// kartene: av som standard, på med Civication.html?civicationLegacy=1.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "Civication.html"), "utf8");

// --- 1. Statiske script-tags: Min dag-modulen + shell-loaderen ---
// Min dag-scriptene rendrer primærpanelet raskt og uavhengig; shell-loaderen
// injiserer resten av skallkjeden og vekker boot.
const STATIC_SCRIPTS = [
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
  STATIC_SCRIPTS,
  "Civication.html skal laste Min dag-modulen + shell-loaderen, i denne rekkefølgen"
);

// config står først (setter flagget), shell-loaderen sist.
assert.strictEqual(loadedScripts[0], "js/Civication/civicationV2Config.js");
assert.strictEqual(loadedScripts[loadedScripts.length - 1], "js/Civication/civicationLegacyLoader.js");

// --- 2. Skallet er SYNLIG som standard (ikke skjult, ikke merket legacy) ---
// Dette er kjernen i reparasjonen: kart, dashboard, innboks, arbeidsdag, rolle
// og track-HUD er aktivt Civication-produkt, ikke legacy-bur.
const SHELL_SECTION_IDS = [
  "civiMapWorld",
  "civiDashboardSection",
  "civiHomeStatus",
  "civiPsyche",
  "civiIdentitySection",
  "civiPeopleSection",
  "activeJobSection",
  "civiWorkdaySection",
  "civiPublicFeedSection",
  "civiStoreSection",
  "civiTrackHUD",
  "civiInboxSection"
];
for (const id of SHELL_SECTION_IDS) {
  const tag = new RegExp(`<[^>]*id="${id}"[^>]*>`).exec(html);
  assert.ok(tag, `${id} skal finnes i Civication.html`);
  assert.ok(!/data-civi-legacy/.test(tag[0]), `${id} skal IKKE være merket data-civi-legacy`);
  assert.ok(!/\shidden(\s|>|=)/.test(tag[0]), `${id} skal IKKE være hidden som standard`);
}

// Ingen produktseksjon skal være igjen bak data-civi-legacy.
assert.ok(!/data-civi-legacy/.test(html),
  "ingen seksjon i Civication.html skal fortsatt være merket data-civi-legacy");

// --- 3. Min dag finnes som modul og er primærpanelet (først) ---
const lifestoryPos = html.indexOf('id="civiLifestorySection"');
assert.ok(lifestoryPos !== -1, "Min dag-seksjonen (civiLifestorySection) finnes");
assert.ok(html.includes('id="civiLifestoryPanel"'), "Min dag-panelet finnes");
assert.ok(html.includes('id="civiLifestoryHeaderStatus"'), "Min dag-headerstatus finnes i toppfeltet");

// Min dag skal ligge FØR de øvrige skallpanelene — den er primærpanelet,
// men eier ikke siden alene.
for (const laterId of ["civiDashboardSection", "civiInboxSection", "civiWorkdaySection", "activeJobSection"]) {
  const pos = html.indexOf(`id="${laterId}"`);
  assert.ok(pos > lifestoryPos, `${laterId} skal ligge etter Min dag (Min dag er primærpanelet)`);
}

// --- 4. Mailmotorene skal ikke dominere standardflaten ---
// Innboksen er ett panel blant mange, og ligger etter Min dag. Ingen ren
// mailmotor-/next-action-/day-progression-fil er statisk script-tag.
const inboxPos = html.indexOf('id="civiInboxSection"');
assert.ok(inboxPos > lifestoryPos, "innboksen skal ligge etter Min dag, ikke dominere");
const NON_SHELL_ENGINES = [
  "civicationMailEngine.js",
  "civicationDailyMailBuilder.js",
  "civicationNextActionSelector.js",
  "CivicationNextActionUI.js",
  "dayProgressionController.js",
  "CivicationBoot.js"
];
for (const file of NON_SHELL_ENGINES) {
  assert.ok(
    !loadedScripts.some((s) => s.endsWith("/" + file)),
    `${file} skal ikke være statisk script-tag i hovedflyten (den injiseres av shell-loaderen)`
  );
}

// --- 5. Shell-loaderen finnes fortsatt og bærer hele skallkjeden ---
const loader = require("../js/Civication/civicationLegacyLoader.js");
assert.ok(Array.isArray(loader.LEGACY_SCRIPTS) && loader.LEGACY_SCRIPTS.length >= 100,
  "shell-loaderen skal bære hele skallkjeden");
for (const src of loader.LEGACY_SCRIPTS) {
  assert.ok(fs.existsSync(path.join(ROOT, src)), `skall-script mangler på disk: ${src}`);
}
assert.strictEqual(loader.LEGACY_SCRIPTS[loader.LEGACY_SCRIPTS.length - 1],
  "js/Civication/CivicationBoot.js", "CivicationBoot skal lastes sist i skallkjeden");

// Ingen dobbeltlasting: intet script i både statiske tags og shell-kjeden.
for (const src of loader.LEGACY_SCRIPTS) {
  assert.ok(STATIC_SCRIPTS.indexOf(src) === -1, `${src} kan ikke være både statisk tag og shell-kjede`);
}

// De tunge canvas/3D-kartene er den eneste egentlige debug-gaten.
assert.ok(loader.LEGACY_FLAGS.CIVICATION_CANVAS_MAP_ENABLED === true &&
  loader.LEGACY_FLAGS.CIVICATION_THREE_MAP_ENABLED === true,
  "debug-flaggene styrer canvas/3D-kartene");

// --- 6. Debug-bryteren er av som standard (Node har verken URL eller storage) ---
const config = require("../js/Civication/civicationV2Config.js");
assert.strictEqual(config.resolveLegacyEnabled(), false, "canvas/3D-debug skal være av uten eksplisitt flagg");
assert.strictEqual(loader.isEnabled(), false, "loaderen skal se at debug-flagget er av");

console.log("civication main flow ok (skall + Min dag som standard, " + loader.LEGACY_SCRIPTS.length + " scripts i skallkjeden)");
