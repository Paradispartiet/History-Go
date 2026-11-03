#!/usr/bin/env node
// Score header: real 0–100 values, unknown Skills, legacy standings and dialog UX.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const dom = new JSDOM('<!doctype html><html><body class="civi-app"><header><div id="civiLifestoryHeaderStatus"></div></header></body></html>',
  { url: "http://localhost/Civication.html", runScripts: "outside-only" });
const { window } = dom;
const canonical = { social_standing: { by_audience: { "team:local": -100, "public:city": 100 } } };
const life = { dag: 3, fase: "morgen", meters: { psyke: 60, energi: 80, integritet: 100,
  synlighet: 20, handlingsrom: 40, penger: -50000 },
  relasjoner: { venn: 90, familie: 10 } };
window.CivicationState = {
  getState: () => canonical,
  getActivePosition: () => ({ title: "Museumsvert", career_id: "kunst" })
};
window.CivicationSkills = {
  getViewModel: () => ({ skills: [
    { label: "Visdom", score: 100, measured: true },
    { label: "Kreativitet", score: 0, measured: true },
    { label: "Sosial teft", score: null, measured: false },
    { label: "Mestring", score: null, measured: false }
  ] })
};
window.CivicationPsyche = { getSnapshot: () => ({
  integrity: 70, visibility: 50, economicRoom: 40, autonomy: 60,
  psychologyCompetence: 30, trustSummary: { avgPercent: 50, count: 0 }
}) };
window.localStorage.setItem("hg_capital_v1", JSON.stringify({ cultural: 170 }));
const beforeCapital = window.localStorage.getItem("hg_capital_v1");
const beforeCanonical = JSON.stringify(canonical);
const beforeLife = JSON.stringify(life);
for (const filename of ["js/Civication/ui/CivicationScoreUI.js",
  "js/Civication/ui/CivicationDashboardUI.js"]) {
  window.eval(fs.readFileSync(path.join(root, filename), "utf8"));
}
const model = window.CivicationScoreUI.getModel({ state: life });
assert.equal(model.count, 17);
assert.equal(model.score, 56, "the score is the unweighted mean of measured 0–100 indicators");
assert.equal(model.groups.find(g => g.name === "Skills").rows[2].score, null,
  "unmeasured skills are not invented as zero");
// Array.from produces a host-realm array (the model was created in JSDOM).
assert.deepEqual(Array.from(model.groups.find(g => g.name === "Omdømme").rows, x => x.score), [0, 100]);
assert.equal(model.currency, -50000, "unbounded money stays an amount and is excluded");
assert.equal(model.groups.find(g => g.name === "Kapital").rows[0].score, 100,
  "capital above 100 is visually capped without migrating the underlying game state");
assert.equal(window.localStorage.getItem("hg_capital_v1"), beforeCapital,
  "display-only capital cap cannot overwrite saved values");
assert.equal(JSON.stringify(canonical), beforeCanonical, "HUD never mutates canonical state");
assert.equal(JSON.stringify(life), beforeLife, "HUD never mutates life state");

const header = window.document.getElementById("civiLifestoryHeaderStatus");
window.CivicationDashboardUI.updateHeaderStatus({ state: life, view: { fase: { navn: "Morgen" } } });
const btn = header.querySelector("#civiScoreTrigger");
assert.ok(btn && btn.tagName === "BUTTON", "score is an accessible interactive button");
assert.equal(btn.querySelector(".civi-score-trigger-number").textContent, "56");
assert.ok(btn.textContent.includes("Status og verdier"), "the score is part of the status control");
assert.match(btn.getAttribute("aria-label"), /56 av 100/);
assert.ok(header.textContent.includes("Museumsvert") && header.textContent.includes("Dag 3"));
assert.ok(header.textContent.includes("Psyke 60") && header.textContent.includes("Energi 80"));
assert.ok(header.textContent.includes("Fortellingspenger -50000") && !header.textContent.includes("PC"));
window.CivicationCalendar = {
  getClock: () => ({ dayIndex: 8 }),
  getPhase: () => "workday",
  getPhaseLabel: () => "Arbeidsdag"
};
window.CivicationDashboardUI.updateHeaderStatus();
assert.ok(header.textContent.includes("Dag 8") && header.textContent.includes("Arbeidsdag"),
  "header follows the shared calendar after career switch, not the new role's local story day");
assert.equal(life.dag, 3, "HUD did not rewrite the role-specific story counter");
assert.strictEqual(header.querySelector("#civiScoreTrigger"), btn,
  "routine HUD rerenders must retain the score button and focus target");
btn.click();
const dialog = window.document.getElementById("civiScoreDialog");
assert.ok(dialog?.hasAttribute("open"), "score breakdown opens on click");
assert.ok(dialog.textContent.includes("Skills") && dialog.textContent.includes("Ikke målt"));
assert.ok(dialog.textContent.includes("Omdømme") && dialog.textContent.includes("Fortellingspenger"));
assert.ok(dialog.textContent.includes("Livssituasjon") && dialog.textContent.includes("Museumsvert"));
assert.ok(dialog.textContent.includes("Psyke") && dialog.textContent.includes("Energi"));
assert.ok(dialog.textContent.includes("Dag") && dialog.textContent.includes("Fase"));
assert.ok(dialog.textContent.includes("-50000"), "currency remains visible without entering score");
dialog.querySelector(".civi-score-close").click();
assert.equal(dialog.hasAttribute("open"), false, "dialog close works");

// Clear the fixture's capital before asserting the no-measurements state.
// A stored cultural capital score is a legitimate measured value.
window.localStorage.removeItem("hg_capital_v1");
window.CivicationSkills = null;
window.CivicationPsyche = null;
window.CivicationState = { getState: () => ({}), getActivePosition: () => null };
assert.equal(window.CivicationScoreUI.getModel({ state: {}, lifeRole: "Arbeidsledig" }).status[0][1], "Arbeidsledig");
assert.equal(window.CivicationScoreUI.getModel({ state: {} }).score, null,
  "missing capability measurements are not quietly reported as a real zero");
console.log("civication-score-header: PASS");
dom.window.close();
