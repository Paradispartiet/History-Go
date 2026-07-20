#!/usr/bin/env node
// Civication hovedflate: Civication.html laster HELE skallet som standard
// (kart, dashboard, nabolag, kapital, psyke, folk, rolle/arbeidsdag, innboks,
// CivicationBoot) MED «Min dag» (Life Story) som primærpanelet øverst.
// Min dag er ÉN modul i skallet, ikke hele appen. Skallet er ikke legacy.
//
// Den eneste egentlige debug-bryteren som er igjen er de tunge canvas/3D-
// kartene: på som standard i normal runtime, av bare i test/fallback/lite-modus.
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
  "js/Civication/lifestory/lifestoryEndings.js",
  "js/Civication/lifestory/lifestoryShellBridge.js",
  "js/Civication/ui/CivicationLifestoryActions.js",
  "js/Civication/ui/CivicationLifestoryUI.js",
  "js/Civication/civicationShellLoader.js"
];

const loadedScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
assert.deepStrictEqual(
  loadedScripts,
  STATIC_SCRIPTS,
  "Civication.html skal laste Min dag-modulen + shell-loaderen, i denne rekkefølgen"
);

// config står først (setter flagget), shell-loaderen sist.
assert.strictEqual(loadedScripts[0], "js/Civication/civicationV2Config.js");
assert.strictEqual(loadedScripts[loadedScripts.length - 1], "js/Civication/civicationShellLoader.js");

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

// --- 5. Shell-loaderen deler produkt-skall, day/mail og legacy/debug ---
const loader = require("../js/Civication/civicationShellLoader.js");
assert.ok(Array.isArray(loader.SHELL_SCRIPTS) && loader.SHELL_SCRIPTS.length >= 40,
  "shell-loaderen skal bære produkt-skallet");
assert.ok(Array.isArray(loader.DAY_SCRIPTS) && loader.DAY_SCRIPTS.length >= 20,
  "day/mail-scripts skal ligge i egen liste");
assert.ok(Array.isArray(loader.LEGACY_DEBUG_SCRIPTS) && loader.LEGACY_DEBUG_SCRIPTS.length >= 1,
  "legacy/debug-scripts skal ligge i egen eksplisitt liste");
for (const src of [...loader.SHELL_SCRIPTS, ...loader.DAY_SCRIPTS, ...loader.RICH_MAP_SCRIPTS, ...loader.LEGACY_DEBUG_SCRIPTS]) {
  assert.ok(fs.existsSync(path.join(ROOT, src)), `Civication-script mangler på disk: ${src}`);
}
assert.ok(loader.SHELL_SCRIPTS.includes("js/Civication/CivicationShellBoot.js"), "shell boot ligger i shell-listen");
assert.ok(loader.SHELL_SCRIPTS.includes("js/Civication/CivicationBoot.js"), "tynn koordinator ligger i shell-listen");
assert.ok(loader.DAY_SCRIPTS.includes("js/Civication/CivicationDayBoot.js"), "day boot ligger i day-listen");

assert.ok(!loader.DAY_SCRIPTS.includes("js/Civication/ui/CivicationDayPhaseUI.js"),
  "gammel DayPhaseUI skal ikke ligge i standard DAY_SCRIPTS");
assert.ok(loader.LEGACY_DEBUG_SCRIPTS.includes("js/Civication/ui/CivicationDayPhaseUI.js"),
  "gammel DayPhaseUI kan bare lastes via eksplisitt legacy/debug-liste");

for (const file of ["civicationMailEngine.js", "civicationDailyMailBuilder.js", "dayProgressionController.js", "civicationWorkdayRuntime.js"]) {
  assert.ok(!loader.SHELL_SCRIPTS.some((src) => src.endsWith(file)), `${file} skal ikke ligge i shell-listen`);
  assert.ok(loader.DAY_SCRIPTS.some((src) => src.endsWith(file)), `${file} skal ligge i day-listen`);
}
assert.ok(!loader.SHELL_SCRIPTS.some((src) => src.includes("CivicationCanvasMap") || src.includes("CivicationThreeMap")),
  "rich map-script ligger i egen runtime-liste, ikke i shell-listen");
assert.ok(loader.RICH_MAP_SCRIPTS.includes("js/Civication/ui/CivicationCanvasMap.js"),
  "Canvas-kartet skal lastes som standard rich runtime-kart");
assert.ok(loader.RICH_MAP_SCRIPTS.includes("js/Civication/ui/CivicationThreeMap.js"),
  "Three/WebGL-kartet skal prøves som standard rich runtime-kart");

// Ingen dobbeltlasting: intet script i både statiske tags og loader-listene.
for (const src of [...loader.SHELL_SCRIPTS, ...loader.DAY_SCRIPTS, ...loader.RICH_MAP_SCRIPTS, ...loader.LEGACY_DEBUG_SCRIPTS]) {
  assert.ok(STATIC_SCRIPTS.indexOf(src) === -1, `${src} kan ikke være både statisk tag og loader-liste`);
}

// Rich map er standard; legacy-flagget er bare bakoverkompatibelt alias.
assert.ok(loader.RICH_MAP_FLAGS.CIVICATION_CANVAS_MAP_ENABLED === true &&
  loader.RICH_MAP_FLAGS.CIVICATION_THREE_MAP_ENABLED === true,
  "rich map-flaggene styrer canvas/3D-kartene");
assert.strictEqual(loader.shouldLoadRichMap(), true, "normal runtime skal laste rich map som default");
global.__ECHO_DISABLE_CANVAS_MAP__ = true;
assert.strictEqual(loader.shouldLoadRichMap(), true, "__ECHO_DISABLE_CANVAS_MAP__ ignoreres uten test/mock-runtime");
global.CIVICATION_TEST_MODE = true;
assert.strictEqual(loader.shouldLoadRichMap(), false, "test/mock-runtime kan deaktivere canvas/WebGL trygt");
delete global.__ECHO_DISABLE_CANVAS_MAP__;
delete global.CIVICATION_TEST_MODE;

// --- 6. Debug-bryteren er av som standard (Node har verken URL eller storage) ---
const config = require("../js/Civication/civicationV2Config.js");
assert.strictEqual(config.resolveLegacyEnabled(), false, "canvas/3D-debug skal være av uten eksplisitt flagg");
assert.strictEqual(loader.isEnabled(), false, "loaderen skal se at debug-flagget er av");

// --- 7. Rich-map DOM-signaler og subpage-entry ---
const mapSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationMap.js"), "utf8");
assert.ok(mapSource.includes("civi-map-landmark") && mapSource.includes("civi-map-urban-texture") && mapSource.includes("civi-map-hg-places") === false,
  "standardkartet skal ha rike landemerke-/bystruktur-lag, ikke bare en forenklet listevisning");
assert.ok(mapSource.includes("civi:mapRendered"), "standardkartet skal sende DOM-event når rich SVG-fallback er rendret");
const subpageHtml = fs.readFileSync(path.join(ROOT, "subpages/civication.html"), "utf8");
assert.ok(subpageHtml.includes("../Civication.html"), "/subpages/civication.html skal rute normal runtime til hoved-Civication");
assert.ok(subpageHtml.includes("window.location.search") && subpageHtml.includes("window.location.hash"),
  "subpage-entry skal bevare query/hash, inkludert civicationLite og debug-flagg");

console.log("civication main flow ok (rich map + skall + Min dag som standard, " + loader.SHELL_SCRIPTS.length + " shell-scripts, " + loader.DAY_SCRIPTS.length + " day-scripts)");
