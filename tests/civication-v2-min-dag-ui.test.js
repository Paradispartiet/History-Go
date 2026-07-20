#!/usr/bin/env node
// Min dag (Life Story) i JSDOM: laster Min dag-modulen fra Civication.html i
// isolasjon — UTEN shell-DOM (ingen #civiMapWorld) — og verifiserer at
//  - Min dag er en uavhengig modul: den rendrer og driver dagen alene,
//  - shell-loaderen holder seg inert når shell-DOM-en ikke finnes
//    (ingen skallkjede injiseres, ingen mailmotor/next-action dukker opp),
//  - Arealplanlegger dag 1 kan spilles fra morgen til kveld i UI-et.
// (Selve skallet + Min dag som standard dekkes av civication-v2-main-flow.test.js.)
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");

async function main() {
  // Bevisst UTEN shell-DOM (#civiMapWorld): dette er en isolert Min dag-flate,
  // så shell-loaderen skal holde seg inert. Rollen velges EKSPLISITT via URL
  // (pilotrollen arealplanlegger) — standard uten valg/jobb er arbeidsledig,
  // og den kontrakten eies av civication-lifestory-arbeidsledig.test.js.
  const dom = new JSDOM(`<!doctype html><html><body class="civi-app">
    <header><div id="civiLifestoryHeaderStatus"></div></header>
    <section id="civiLifestorySection"><h2>Min dag</h2><div id="civiLifestoryPanel"></div></section>
  </body></html>`, { url: "http://localhost/Civication.html?lifestoryRole=arealplanlegger", runScripts: "outside-only" });

  const { window } = dom;
  window.fetch = async (p) => {
    const abs = path.join(ROOT, String(p).replace(/^\.?\//, ""));
    if (!fs.existsSync(abs)) return { ok: false, status: 404, json: async () => null, text: async () => "" };
    const text = fs.readFileSync(abs, "utf8");
    return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
  };

  // Mock av skallets livsstilsmotor: broen skal sende valgets livsstilstags
  // hit, og UI-et skal vise stampen når (og bare når) score > 0.
  const addTagsCalls = [];
  window.HG_Lifestyle = {
    addTags: (tags, source) => { addTagsCalls.push({ tags, source }); },
    getStamp: () => (addTagsCalls.length
      ? { id: "craftsman", name: "Håndverker", icon: "🔨", score: addTagsCalls.length }
      : null)
  };

  // Samme kjede som Civication.html (hentet fra v2-allowlisten i main-flow-testen).
  const V2_CHAIN = [
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
  for (const file of V2_CHAIN) {
    window.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  }

  // Shell-loaderen er inert uten shell-DOM: den skal ikke auto-laste skallet,
  // og canvas/3D-debug er av som standard.
  assert.strictEqual(window.CIVICATION_LEGACY_ENABLED, false, "canvas/3D-debug skal være av som standard");
  assert.strictEqual(window.CivicationShellLoader.shouldAutoLoadShell(), false,
    "shell-loaderen skal ikke auto-laste uten shell-DOM (#civiMapWorld)");
  assert.strictEqual(window.document.querySelectorAll("script[src]").length, 0,
    "ingen skallkjede skal injiseres når shell-DOM-en mangler");
  assert.ok(!window.CivicationNextActionUI, "next-action-UI skal ikke finnes i isolert Min dag");
  assert.ok(!window.CivicationMailEngine && !window.HG_CiviMail, "mailmotor skal ikke finnes i isolert Min dag");

  // Vent på at Min dag laster innhold og rendrer.
  await new Promise((r) => setTimeout(r, 300));
  const panel = window.document.getElementById("civiLifestoryPanel");
  assert.ok(panel.querySelector(".civi-lifestory-scene"), "Min dag skal vise nå-scenen");
  assert.ok(panel.querySelector("button.civi-lifestory-choice[data-lifestory-choice]"), "Min dag skal vise store klikkbare valg");
  assert.ok(panel.querySelector(".civi-lifestory-status-chip"), "Min dag skal vise statuslinje med statuschips");
  // Ingen livsstilschip før noen valg har telt (stamp er null).
  assert.ok(![...panel.querySelectorAll(".civi-lifestory-status-chip")].some((c) => c.textContent.includes("Livsstil")),
    "livsstilschipen skal ikke vises før valgene har bygget en retning");
  assert.ok(panel.textContent.includes("Skoleveien bak parkeringskjelleren"), "trådtittel skal være menneskelig");
  assert.ok(panel.textContent.includes("Aktiv"), "trådstatus skal ha norsk label");
  assert.ok(!panel.textContent.includes("skolevei_parkeringskjeller"), "tekniske tråd-id-er skal ikke dominere UI");

  // v2-headeren viser dag/fase/status, men ingen demo-rolle når canonical aktiv rolle mangler.
  const header = window.document.getElementById("civiLifestoryHeaderStatus").textContent;
  assert.ok(header.includes("Ingen aktiv rolle") && header.includes("Dag 1"), "headerstatus: " + header);
  assert.ok(!header.includes("Arealplanlegger"), "headeren skal ikke vise pilotrollen uten aktiv rolle: " + header);

  // Spill hele dagen: Runner er eneste progresjonskilde.
  let clicks = 0;
  let saaKonsekvens = false;
  while (panel.querySelector("[data-lifestory-choice]")) {
    panel.querySelector("[data-lifestory-choice]").click();
    if (panel.querySelector(".civi-lifestory-konsekvens")) {
      saaKonsekvens = true;
      assert.ok(panel.querySelector(".civi-lifestory-delta"), "konsekvensfeedback viser meter-/relasjonschips");
      assert.ok(!panel.textContent.includes("{") && !panel.textContent.includes("tidligereValg"), "feedback skal ikke vise rå JSON/flagg");
    }
    assert.ok(++clicks < 30, "dagen må terminere");
  }
  assert.ok(panel.innerHTML.includes("Dag 1 er over"), "dagen skal ende i oppsummering");
  assert.ok(clicks >= 8, "hele dagen (morgen->kveld) skal spilles, fikk " + clicks + " scener");

  // Livsstilsbroen fyrte for taggede valg (første valg i kalenderscenen er
  // «sette av en time» => craft), og UI-et viser hvem spilleren drar mot.
  assert.ok(addTagsCalls.length >= 1, "minst ett tagget valg skal ha nådd HG_Lifestyle.addTags");
  assert.ok(addTagsCalls.every((c) => c.source === "lifestory"), "taggene sendes med kilde lifestory");
  assert.ok(addTagsCalls.some((c) => c.tags.includes("craft")), "craft-retningen (egen time) skal være telt");
  assert.ok([...panel.querySelectorAll(".civi-lifestory-status-chip")].some((c) => c.textContent.includes("Livsstil") && c.textContent.includes("Håndverker")),
    "statuslinjen viser livsstilschipen når stampen finnes");
  assert.ok(panel.textContent.includes("Valgene dine drar mot") && panel.textContent.includes("Håndverker"),
    "dagsoppsummeringen viser livsstilslinjen");
  assert.ok(saaKonsekvens, "konsekvensTekst skal vises som feedback etter minst ett valg");
  assert.ok(window.document.getElementById("civiLifestoryHeaderStatus").textContent.includes("Dagen er over"));

  // Oppsummeringen viser tråder og «Start neste dag».
  assert.ok(panel.querySelector("[data-lifestory-next-day]"), "oppsummeringen har Start neste dag");
  assert.ok(panel.innerHTML.includes("Tråder"), "oppsummeringen viser trådstatus");
  assert.ok(panel.textContent.includes("Meter-endringer siden morgenen"), "oppsummeringen viser meter-endringer");
  assert.ok(panel.textContent.includes("Viktige valg i dag"), "oppsummeringen viser viktige valg");

  // Player State er lagret under Min dag-nøkkelen; shell-loaderen forble inert.
  let stored = JSON.parse(window.localStorage.getItem("civication_lifestory_v1"));
  assert.strictEqual(stored.dagFerdig, true, "Player State skal være lagret");
  const arkivFoer = stored.arkiv.length;
  assert.strictEqual(window.document.querySelectorAll("script[src]").length, 0,
    "Min dag skal ha spilt hele dagen uten å laste skallkjeden");

  // Start neste dag: dag 2 starter uten crash og uten å slette arkivet.
  panel.querySelector("[data-lifestory-next-day]").click();
  assert.ok(panel.querySelector("[data-lifestory-choice]"), "dag 2 viser en spillbar scene");
  assert.ok(window.document.getElementById("civiLifestoryHeaderStatus").textContent.includes("Dag 2"), "headeren viser Dag 2");
  stored = JSON.parse(window.localStorage.getItem("civication_lifestory_v1"));
  assert.strictEqual(stored.dag, 2, "state er på dag 2");
  assert.strictEqual(stored.dagFerdig, false, "dag 2 er ikke ferdig");
  assert.ok(stored.arkiv.length >= arkivFoer, "arkivet fra dag 1 er beholdt");

  console.log("civication v2 min dag ui ok (" + clicks + " scener via UI + neste dag)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
