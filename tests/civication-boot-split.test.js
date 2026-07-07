#!/usr/bin/env node
// Verifiserer ansvarsdelingen etter at CivicationBoot ble delt i to lag:
//   - CivicationShellBoot: selve skallet/produktet (data, økonomi, career
//     resolver, CivicationUI.init, civi:booted). Skal ALLTID kunne starte.
//   - CivicationDayBoot: dag-/life-story-laget (event engine, role model,
//     blocked-job, obligations, onAppOpen). Inert uten dag-DOM, og en feil
//     her skal ALDRI velte skallet.
// CivicationBoot er en tynn koordinator: skall først, dag etterpå, isolert.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const SHELL = fs.readFileSync(path.join(ROOT, "js/Civication/CivicationShellBoot.js"), "utf8");
const DAY = fs.readFileSync(path.join(ROOT, "js/Civication/CivicationDayBoot.js"), "utf8");
const COORD = fs.readFileSync(path.join(ROOT, "js/Civication/CivicationBoot.js"), "utf8");

/**
 * Bygger et JSDOM-miljø med minimale stubs og evaluerer de tre boot-filene.
 * @param {{ withInbox?: boolean, engine?: "ok"|"throwing"|"missing", evalCoord?: boolean }} opts
 */
function makeEnv(opts) {
  const withInbox = !!opts.withInbox;
  const engineMode = opts.engine || "ok";
  const body = `<body class="civi-app">
    <div id="civiMapWorld"><div class="civi-map-layer"></div></div>
    ${withInbox ? '<section id="civiInboxSection"><div id="civiInbox"></div></section>' : ""}
  </body>`;
  const dom = new JSDOM(`<!doctype html><html>${body}</html>`,
    { url: "http://localhost/Civication.html", runScripts: "outside-only" });
  const { window } = dom;

  // Datalasting: badges-index (files) + careers (careers).
  window.fetch = async () => ({
    ok: true, status: 200,
    json: async () => ({ files: [], careers: [] }),
    text: async () => JSON.stringify({ files: [], careers: [] })
  });

  // Skall-avhengigheter: stubbet slik at ingen ekte <script> injiseres (unngår
  // hengende onload i JSDOM) og CivicationUI.init kan spores.
  const calls = { uiInit: 0, economyTick: 0, obligation: 0, onAppOpen: 0 };
  window.CivicationCareerRoleResolver = { resolveCareerRoleScope() { return null; } };
  window.CivicationUI = { init() { calls.uiInit += 1; } };
  window.CivicationEconomyEngine = { tickWeekly() { calls.economyTick += 1; } };
  window.CivicationObligationEngine = { evaluate() { calls.obligation += 1; } };
  window.CivicationRoleModelRuntime = { boot() {} };
  window.CivicationBlockedJobMessages = { enqueueNoUnlockedBrandEmployerMessage() {} };

  if (engineMode === "ok") {
    window.CivicationEventEngine = function EventEngine(cfg) {
      this.cfg = cfg;
      this.onAppOpen = async () => { calls.onAppOpen += 1; };
    };
  } else if (engineMode === "throwing") {
    window.CivicationEventEngine = function EventEngine() { throw new Error("engine boom"); };
  } // "missing" => la CivicationEventEngine være undefined

  window.eval(SHELL);
  window.eval(DAY);
  // Koordinatoren fester en DOMContentLoaded-lytter som JSDOM fyrer av seg
  // selv. Evaluer den KUN i scenarioet som faktisk tester koordinatoren, så
  // de direkte start()-kallene under ikke dobbelkjøres.
  if (opts.evalCoord) window.eval(COORD);
  return { window, calls };
}

async function main() {
  // --- 1. To adskilte, offentlige boot-lag ---
  {
    const { window } = makeEnv({ withInbox: true });
    assert.strictEqual(typeof window.CivicationShellBoot?.start, "function", "CivicationShellBoot.start finnes");
    assert.strictEqual(typeof window.CivicationDayBoot?.start, "function", "CivicationDayBoot.start finnes");
    assert.strictEqual(typeof window.ensureCiviCareerRulesLoaded, "function",
      "shell-boot eksponerer window.ensureCiviCareerRulesLoaded (profile.js/CivicationUI bruker den)");
    assert.strictEqual(typeof window.HG_CiviBoot?.loadScriptOnce, "function",
      "delt script-once-laster er eksponert for dag-laget");
  }

  // --- 2. Skallet starter selv om dag-motoren ville feilet ---
  {
    const { window, calls } = makeEnv({ withInbox: true, engine: "throwing" });
    let booted = 0;
    window.addEventListener("civi:booted", () => { booted += 1; });
    await window.CivicationShellBoot.start();
    assert.strictEqual(calls.uiInit, 1, "skallet kaller CivicationUI.init");
    assert.strictEqual(calls.economyTick, 1, "skallet kjører ukes-økonomitick én gang");
    assert.strictEqual(booted, 1, "skallet dispatcher civi:booted");
    assert.ok(!window.document.getElementById("civiBootError"), "ingen boot-error når skallet er friskt");
  }

  // --- 3. Dag-laget er INERT uten dag-DOM (#civiInboxSection mangler) ---
  {
    const { window } = makeEnv({ withInbox: false, engine: "ok" });
    await window.CivicationDayBoot.start();
    assert.strictEqual(window.HG_CiviEngine, undefined,
      "dag-laget skal ikke bygge HG_CiviEngine når dag-DOM mangler");
  }

  // --- 4. Dag-laget bygger motoren når dag-DOM finnes ---
  {
    const { window, calls } = makeEnv({ withInbox: true, engine: "ok" });
    await window.CivicationDayBoot.start();
    assert.ok(window.HG_CiviEngine, "dag-laget bygger HG_CiviEngine når #civiInboxSection finnes");
    assert.strictEqual(calls.onAppOpen, 1, "dag-laget kaller onAppOpen");
    assert.strictEqual(calls.obligation, 1, "dag-laget evaluerer forpliktelser");
  }

  // --- 5. Manglende motor gir advarsel, ikke kast; skallet upåvirket ---
  {
    const { window } = makeEnv({ withInbox: true, engine: "missing" });
    await window.CivicationDayBoot.start(); // skal ikke kaste
    assert.strictEqual(window.HG_CiviEngine, undefined, "ingen motor => HG_CiviEngine forblir undefined");
  }

  // --- 6. Motor-krasj fanges internt; day.start kaster ikke ---
  {
    const { window } = makeEnv({ withInbox: true, engine: "throwing" });
    await window.CivicationDayBoot.start(); // skal ikke kaste
    assert.strictEqual(window.HG_CiviEngine, undefined, "krasj under bygging => ingen motor, men ingen kast");
  }

  // --- 7. Koordinatoren isolerer dag-feil fra skallet ---
  {
    const { window, calls } = makeEnv({ withInbox: true, engine: "ok", evalCoord: true });
    let booted = 0;
    window.addEventListener("civi:booted", () => { booted += 1; });
    // Tving dag-laget til å kaste — synkront, før JSDOM fyrer DOMContentLoaded
    // (som trigger koordinatoren). Skallet skal likevel kjøre.
    window.CivicationDayBoot = { start: async () => { throw new Error("day boom"); } };
    await new Promise((r) => setTimeout(r, 50));
    assert.strictEqual(calls.uiInit, 1, "koordinatoren kjørte skallet");
    assert.strictEqual(booted, 1, "skallet dispatchet civi:booted selv om dag-laget kastet");
  }

  // --- 8. Koordinatoren er tynn: ingen egen motor-/UI-orkestrering igjen ---
  assert.ok(!/new\s+CivicationEventEngine/.test(COORD),
    "CivicationBoot skal ikke lenger konstruere event-motoren selv");
  assert.ok(COORD.includes("window.CivicationShellBoot") && COORD.includes("window.CivicationDayBoot"),
    "CivicationBoot koordinerer de to boot-lagene");
  assert.ok(/new\s+EventEngineCtor|CivicationEventEngine/.test(DAY),
    "CivicationDayBoot eier event-motoren");
  assert.ok(SHELL.includes("CivicationUI") && SHELL.includes("civi:booted"),
    "CivicationShellBoot eier skall-UI-init og civi:booted");

  console.log("civication boot split ok (skall/dag adskilt, koordinator isolerer dag-feil)");
}

main().catch((error) => { console.error(error); process.exit(1); });
