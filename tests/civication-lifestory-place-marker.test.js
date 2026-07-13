#!/usr/bin/env node
// «Min dag»-markøren på Civication-kartet: verifiserer den rene
// stedsoppløsnings-ladderen (arbeidsliv -> arbeidsplass, privatliv -> hjem,
// dagen over -> hjemme), at ukjente steder gir dokket visning i stedet for
// gjettet posisjon, og at UI-/loader-kontraktene holder.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const Marker = require("../js/Civication/ui/CivicationLifestoryPlaceMarker.js");

// --- 1. Arbeidsliv-scene: arbeidsplassen, med bydel når skallet har den ---
{
  const info = { threadType: "arbeidsliv", dagFerdig: false, fase: "formiddag", rolleNavn: "Ekspeditør" };
  const withZone = Marker.resolveSceneMapLoc(info, {
    activePosition: { brand_name: "Narvesen", title: "Ekspeditør", employer_context: { district: "sentrum" } }
  });
  assert.deepStrictEqual(withZone, { kind: "jobb", label: "På jobb: Narvesen", mapZone: "sentrum" });

  // Jobb uten employer-bydel: merkelapp, men INGEN påstått kartposisjon.
  const noZone = Marker.resolveSceneMapLoc(info, { activePosition: { title: "Renholder" } });
  assert.strictEqual(noZone.kind, "jobb");
  assert.strictEqual(noZone.mapZone, null, "uten bydel skal markøren ikke påstå posisjon");
  assert.ok(noZone.label.includes("Renholder"));

  // Ingen skall-jobb i det hele tatt: rollenavnet bærer merkelappen.
  const noJob = Marker.resolveSceneMapLoc(info, {});
  assert.strictEqual(noJob.mapZone, null);
  assert.ok(noJob.label.includes("ekspeditør"), "rollenavnet brukes når skallet ikke har jobb: " + noJob.label);
}

// --- 2. Privatliv-scene: hjemme, med valgt bydel når den finnes ---
{
  const info = { threadType: "privatliv", dagFerdig: false, fase: "kveld", rolleNavn: "Renholder" };
  const withHome = Marker.resolveSceneMapLoc(info, { homeDistrictId: "gronland", homeDistrictName: "Grønland" });
  assert.deepStrictEqual(withHome, { kind: "hjem", label: "Hjemme i Grønland", mapZone: "gronland" });

  const noHome = Marker.resolveSceneMapLoc(info, {});
  assert.strictEqual(noHome.kind, "hjem");
  assert.strictEqual(noHome.mapZone, null, "uten valgt nabolag ingen påstått posisjon");
  assert.strictEqual(noHome.label, "Hjemme");
}

// --- 3. Dagen er over: hjem, uansett hva siste tråd var ---
{
  const done = Marker.resolveSceneMapLoc(
    { threadType: "arbeidsliv", dagFerdig: true, fase: "kveld", rolleNavn: "Ekspeditør" },
    { homeDistrictId: "gronland", homeDistrictName: "Grønland" }
  );
  assert.strictEqual(done.kind, "hjem", "dagen er over => hjemme, ikke på jobb");
  assert.ok(done.label.includes("Dagen er over"));
}

// --- 4. Ingen scene-info ennå: null (markøren skjules) ---
assert.strictEqual(Marker.resolveSceneMapLoc(null, {}), null);

// --- 5. employerZone godtar bare skallets faktiske feltnavn ---
assert.strictEqual(Marker.employerZone({ employer_context: { district: "sentrum" } }), "sentrum");
assert.strictEqual(Marker.employerZone({ employer_context: { mapZone: "frogner" } }), "frogner");
assert.strictEqual(Marker.employerZone({ employer_context: {} }), null);
assert.strictEqual(Marker.employerZone(null), null);

// --- 6. UI-kontrakten: getCurrentSceneInfo finnes og eksponeres ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes("function getCurrentSceneInfo"), "UI-en har scene-info-viewmodel");
assert.ok(/window\.CivicationLifestoryUI = \{[^}]*getCurrentSceneInfo/.test(uiSource),
  "getCurrentSceneInfo er eksponert på window.CivicationLifestoryUI");
// Første render vekker lytterne — markøren skal ikke trenge polling.
const startIdx = uiSource.indexOf("async function start()");
const dispatchIdx = uiSource.indexOf('new Event("civi:lifestoryChanged")', startIdx);
assert.ok(startIdx !== -1 && dispatchIdx !== -1 && dispatchIdx < uiSource.indexOf("function getCurrentSceneInfo"),
  "start() dispatcher civi:lifestoryChanged etter første render");

// --- 7. Registrering: markøren ligger i SHELL_SCRIPTS (etter CityLayer) og sw ---
const loader = require("../js/Civication/civicationShellLoader.js");
const markerIdx = loader.SHELL_SCRIPTS.indexOf("js/Civication/ui/CivicationLifestoryPlaceMarker.js");
const cityIdx = loader.SHELL_SCRIPTS.indexOf("js/Civication/ui/CivicationCityLayer.js");
assert.ok(markerIdx !== -1, "markøren ligger i shell-kjeden");
assert.ok(cityIdx !== -1 && markerIdx > cityIdx, "markøren lastes etter CityLayer (bruker anker-API-et)");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
assert.ok(sw.includes("js/Civication/ui/CivicationLifestoryPlaceMarker.js"), "markøren er i sw-precache");

console.log("civication lifestory place marker ok (steds-ladder, dokket fallback, kontrakter)");
