#!/usr/bin/env node
// tests/civication-place-menu-city-map-role.test.js
//
// End-to-end (JSDOM) test av UI-koblingen: at History Go-stedmenyen
// (CivicationHistoryGoPlaceLayer) faktisk konsumerer read-modellen
// (CivicationCityMap) og viser stedets curerte Civication-kartidentitet
// (mapRole, sosiale funksjoner, groundhopper-merke).
//
// Read-modellen mates fra de EKTE committede mappingfilene via en fetch-stub
// som leser filene fra disk, så testen speiler faktisk runtime-flyt.
//
// Kjør:  node tests/civication-place-menu-city-map-role.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { JSDOM } = require("jsdom");

const repoRoot = path.resolve(__dirname, "..");

let failures = 0;
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log("  ok  -", name))
    .catch((e) => {
      failures += 1;
      console.error("FAIL  -", name);
      console.error("       ", e && e.message);
    });
}

function readSource(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), "utf8");
}

// Bygg et jsdom-vindu med begge modulene lastet og read-modellen ferdig lastet
// fra de ekte filene (via fetch-stub mot disk).
async function bootWindow() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    runScripts: "outside-only",
    url: "https://example.test/"
  });
  const { window } = dom;

  // Nettleser-API-er jsdom ikke gir, men som kartlaget bruker ved boot.
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);

  // fetch-stub: serverer repo-filer fra disk (relative stier fra read-modellen).
  window.fetch = function (urlPath) {
    return new Promise((resolve, reject) => {
      try {
        const abs = path.join(repoRoot, String(urlPath));
        const text = fs.readFileSync(abs, "utf8");
        resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(JSON.parse(text)),
          text: () => Promise.resolve(text)
        });
      } catch (err) {
        resolve({ ok: false, status: 404, json: () => Promise.reject(err), text: () => Promise.resolve("") });
      }
    });
  };

  window.eval(readSource("js/Civication/map/CivicationCityMap.js"));
  window.eval(readSource("js/Civication/ui/CivicationHistoryGoPlaceLayer.js"));

  const model = await window.CivicationCityMap.load();
  return { window, model };
}

(async () => {
  console.log("Civication stedmeny – kartidentitet fra read-modellen");

  const { window, model } = await bootWindow();

  await check("read-modellen lastes i vinduet og har groundhopper-steder", () => {
    assert.ok(window.CivicationCityMap.isLoaded(), "read-modellen skal være lastet");
    const groundhopper = model.entries.filter((e) => e.groundhopperRelevant);
    assert.ok(groundhopper.length > 0, "forventet minst ett groundhopper-sted i grunnlaget");
  });

  await check("meny for et groundhopper-sted viser mapRole, tags og groundhopper-merke", () => {
    const entry = model.entries.find((e) => e.groundhopperRelevant && e.mapRole &&
      Array.isArray(e.socialFunctions) && e.socialFunctions.length > 0);
    assert.ok(entry, "fant ikke et egnet groundhopper-sted");

    window.CivicationHistoryGoPlaceLayer.openPlaceMenu({
      id: entry.historyGoPlaceId, name: entry.name, category: entry.category
    });

    const roleEl = window.document.querySelector('[data-place-section="role"]');
    assert.ok(roleEl, "rolleseksjonen skal finnes i DOM");
    assert.strictEqual(roleEl.hidden, false, "rolleseksjonen skal være synlig for kartlagt sted");

    const badge = roleEl.querySelector('[data-civi-groundhopper="true"]');
    assert.ok(badge, "groundhopper-merket skal vises");

    const nameEl = roleEl.querySelector(".civi-hg-place-menu-role-name");
    assert.ok(nameEl, "mapRole-navn skal vises");
    assert.strictEqual(nameEl.textContent, entry.mapRole.replace(/_/g, " "),
      "mapRole skal vises humanisert (uten understrek)");

    const tags = roleEl.querySelectorAll(".civi-hg-place-menu-role-tags li");
    assert.ok(tags.length >= 1 && tags.length <= 4, "1-4 sosiale funksjoner skal vises");
  });

  await check("meny for et ikke-groundhopper kartlagt sted viser rolle uten merke", () => {
    const entry = model.entries.find((e) => !e.groundhopperRelevant && e.mapRole);
    assert.ok(entry, "fant ikke et egnet ikke-groundhopper-sted");

    window.CivicationHistoryGoPlaceLayer.openPlaceMenu({
      id: entry.historyGoPlaceId, name: entry.name, category: entry.category
    });

    const roleEl = window.document.querySelector('[data-place-section="role"]');
    assert.strictEqual(roleEl.hidden, false, "rolleseksjonen skal være synlig");
    assert.strictEqual(roleEl.querySelector('[data-civi-groundhopper="true"]'), null,
      "ikke-groundhopper-sted skal ikke ha merke");
    assert.ok(roleEl.querySelector(".civi-hg-place-menu-role-name"), "mapRole-navn skal vises");
  });

  await check("meny for et ukjent/ikke-kartlagt sted skjuler rolleseksjonen", () => {
    window.CivicationHistoryGoPlaceLayer.openPlaceMenu({
      id: "dette_stedet_finnes_ikke_i_kartet", name: "Ukjent", category: "by"
    });
    const roleEl = window.document.querySelector('[data-place-section="role"]');
    assert.strictEqual(roleEl.hidden, true, "rolleseksjonen skal være skjult for ukartlagt sted");
    assert.strictEqual(roleEl.innerHTML, "", "rolleseksjonen skal være tom for ukartlagt sted");
  });

  if (failures > 0) {
    console.error("\n" + failures + " sjekk(er) feilet.");
    process.exit(1);
  }
  console.log("\nAlle sjekker bestod.");
})().catch((err) => {
  console.error("Uventet feil:", err && err.stack || err);
  process.exit(1);
});
