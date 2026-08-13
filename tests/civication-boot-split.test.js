#!/usr/bin/env node
// Verifiserer ansvarsdelingen etter at CivicationBoot ble delt i to lag:
//   - CivicationShellBoot: selve skallet/produktet (data, økonomi, career
//     resolver, life position, livelihood, CivicationUI.init, civi:booted).
//     Skal ALLTID kunne starte.
//   - CivicationDayBoot: dag-/life-story-laget (event engine, livelihood
//     opportunity bridge, role model, blocked-job, obligations, onAppOpen).
//     Inert uten dag-DOM, og en feil her skal ALDRI velte skallet.
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

  window.fetch = async () => ({
    ok: true, status: 200,
    json: async () => ({ files: [], careers: [] }),
    text: async () => JSON.stringify({ files: [], careers: [] })
  });

  const calls = {
    uiInit: 0,
    economyTick: 0,
    livelihoodBridge: 0,
    livelihoodOpportunityBridge: 0,
    livelihoodUi: 0,
    lifePositionUi: 0,
    obligation: 0,
    onAppOpen: 0
  };
  window.CivicationCareerRoleResolver = { resolveCareerRoleScope() { return null; } };
  window.CivicationLifePositions = { getLifeContext() { return {}; } };
  window.CivicationLifePositionUI = { init() { calls.lifePositionUi += 1; } };
  window.CivicationLivelihoods = {
    getSnapshot() { return {}; },
    attachEconomyBridge() { calls.livelihoodBridge += 1; return true; }
  };
  window.CivicationLivelihoodUI = { init() { calls.livelihoodUi += 1; } };
  window.CivicationLivelihoodOpportunityBridge = {
    attachToEngine() { return true; },
    init(engine) {
      assert.ok(engine, "opportunity bridge receives day engine");
      calls.livelihoodOpportunityBridge += 1;
    }
  };
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
  }

  window.eval(SHELL);
  window.eval(DAY);
  if (opts.evalCoord) window.eval(COORD);
  return { window, calls };
}

async function main() {
  {
    const { window } = makeEnv({ withInbox: true });
    assert.strictEqual(typeof window.CivicationShellBoot?.start, "function", "CivicationShellBoot.start finnes");
    assert.strictEqual(typeof window.CivicationDayBoot?.start, "function", "CivicationDayBoot.start finnes");
    assert.strictEqual(typeof window.ensureCiviCareerRulesLoaded, "function",
      "shell-boot eksponerer window.ensureCiviCareerRulesLoaded (profile.js/CivicationUI bruker den)");
    assert.strictEqual(typeof window.HG_CiviBoot?.loadScriptOnce, "function",
      "delt script-once-laster er eksponert for dag-laget");
  }

  {
    const { window, calls } = makeEnv({ withInbox: true, engine: "throwing" });
    let booted = 0;
    window.addEventListener("civi:booted", () => { booted += 1; });
    await window.CivicationShellBoot.start();
    assert.strictEqual(calls.uiInit, 1, "skallet kaller CivicationUI.init");
    assert.strictEqual(calls.lifePositionUi, 1, "skallet initierer life-position UI");
    assert.strictEqual(calls.livelihoodUi, 1, "skallet initierer livelihood UI");
    assert.strictEqual(calls.livelihoodBridge, 1, "livelihood kobles til canonical economy før tick");
    assert.strictEqual(calls.economyTick, 1, "skallet kjører ukes-økonomitick én gang");
    assert.strictEqual(booted, 1, "skallet dispatcher civi:booted");
    assert.ok(!window.document.getElementById("civiBootError"), "ingen boot-error når skallet er friskt");
  }

  {
    const { window } = makeEnv({ withInbox: false, engine: "ok" });
    await window.CivicationDayBoot.start();
    assert.strictEqual(window.HG_CiviEngine, undefined,
      "dag-laget skal ikke bygge HG_CiviEngine når dag-DOM mangler");
  }

  {
    const { window, calls } = makeEnv({ withInbox: true, engine: "ok" });
    await window.CivicationDayBoot.start();
    assert.ok(window.HG_CiviEngine, "dag-laget bygger HG_CiviEngine når #civiInboxSection finnes");
    assert.strictEqual(calls.livelihoodOpportunityBridge, 1, "dag-laget fester livelihood opportunity bridge til motoren");
    assert.strictEqual(calls.onAppOpen, 1, "dag-laget kaller onAppOpen");
    assert.strictEqual(calls.obligation, 1, "dag-laget evaluerer forpliktelser");
  }

  {
    const { window } = makeEnv({ withInbox: true, engine: "missing" });
    await window.CivicationDayBoot.start();
    assert.strictEqual(window.HG_CiviEngine, undefined, "ingen motor => HG_CiviEngine forblir undefined");
  }

  {
    const { window } = makeEnv({ withInbox: true, engine: "throwing" });
    await window.CivicationDayBoot.start();
    assert.strictEqual(window.HG_CiviEngine, undefined, "krasj under bygging => ingen motor, men ingen kast");
  }

  {
    const { window, calls } = makeEnv({ withInbox: true, engine: "ok", evalCoord: true });
    let booted = 0;
    window.addEventListener("civi:booted", () => { booted += 1; });
    window.CivicationDayBoot = { start: async () => { throw new Error("day boom"); } };
    await new Promise((r) => setTimeout(r, 50));
    assert.strictEqual(calls.uiInit, 1, "koordinatoren kjørte skallet");
    assert.strictEqual(booted, 1, "skallet dispatchet civi:booted selv om dag-laget kastet");
  }

  assert.ok(!/new\s+CivicationEventEngine/.test(COORD),
    "CivicationBoot skal ikke lenger konstruere event-motoren selv");
  assert.ok(COORD.includes("window.CivicationShellBoot") && COORD.includes("window.CivicationDayBoot"),
    "CivicationBoot koordinerer de to boot-lagene");
  assert.ok(/new\s+EventEngineCtor|CivicationEventEngine/.test(DAY),
    "CivicationDayBoot eier event-motoren");
  assert.ok(DAY.includes("civicationLivelihoodOpportunityBridge.js") && DAY.includes("CivicationLivelihoodOpportunityBridge"),
    "CivicationDayBoot eier livelihood opportunity-broen");
  assert.ok(SHELL.includes("CivicationUI") && SHELL.includes("civi:booted"),
    "CivicationShellBoot eier skall-UI-init og civi:booted");
  assert.ok(SHELL.includes("civicationLivelihoodRuntime.js") && SHELL.includes("CivicationLivelihoodUI"),
    "CivicationShellBoot laster livelihood runtime/UI som del av skallet");

  console.log("civication boot split ok (skall/dag adskilt, livelihood opportunities i daglaget, koordinator isolerer dag-feil)");
}

main().catch((error) => { console.error(error); process.exit(1); });
