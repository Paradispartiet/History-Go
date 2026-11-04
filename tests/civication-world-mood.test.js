// The visual period is derived from Civication's canonical calendar only.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationWorldMood.js"), "utf8");
function setup(initialPhase = "morning") {
  const listeners = new Map();
  const attributes = new Map();
  const clock = { phase: initialPhase };
  const changes = [];
  const phaseText = { textContent: "" };
  const browser = {
    CivicationCalendar: {
      getPhase: () => clock.phase,
      getClock: () => ({ phase: clock.phase })
    },
    document: {
      readyState: "complete",
      body: { setAttribute: (k, v) => attributes.set(k, v) },
      querySelector: (selector) => selector === ".civi-day-miniature-period" ? phaseText : null
    },
    addEventListener: (name, cb) => {
      listeners.set(name, cb);
    },
    dispatchEvent: (event) => changes.push(event.detail?.period),
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  };
  vm.runInNewContext(source, { window: browser });
  return { browser, clock, listeners, attributes, changes, phaseText };
}

test("åtte kanoniske faser bruker fire dempede visuelle perioder", () => {
  const { browser } = setup();
  const classify = browser.CivicationWorldMood.classify;
  const values = {
    morning: "morning",
    forenoon: "day", workday: "day", lunch: "day", afternoon: "day",
    dinner: "evening", evening: "evening", day_end: "night",
    morgen: "morning", middag: "evening", kveld: "evening", natt: "night"
  };
  for (const [phase, expected] of Object.entries(values)) {
    assert.equal(classify(phase), expected, phase);
  }
  assert.equal(classify("unknown"), "morning");
});

test("følger spillklokken, oppdaterer kun DOM og sender ett signal per overgang", () => {
  const { browser, clock, listeners, attributes, changes, phaseText } = setup("morning");
  assert.equal(attributes.get("data-civi-visual-period"), "morning");
  assert.equal(phaseText.textContent, "Morgen");
  assert.deepEqual(changes, ["morning"]);
  clock.phase = "lunch";
  listeners.get("civi:dayPhaseChanged")();
  assert.equal(attributes.get("data-civi-visual-period"), "day");
  assert.equal(phaseText.textContent, "Dag");
  assert.deepEqual(changes, ["morning", "day"]);
  clock.phase = "workday"; // same visual bucket: no redundant scene updates
  browser.CivicationWorldMood.sync();
  assert.deepEqual(changes, ["morning", "day"]);
  clock.phase = "day_end";
  listeners.get("storage")({ key: "hg_civi_calendar_v1" });
  assert.equal(attributes.get("data-civi-visual-period"), "night");
  assert.equal(phaseText.textContent, "Natt");
  assert.deepEqual(changes, ["morning", "day", "night"]);
  assert.equal(clock.phase, "day_end", "calendar is never mutated");
});

test("scene lighting and Min dag illustration are wired without changing game choices", () => {
  const root = path.join(__dirname, "..");
  const three = fs.readFileSync(path.join(root, "js/Civication/ui/CivicationThreeMap.js"), "utf8");
  const loader = fs.readFileSync(path.join(root, "js/Civication/civicationShellLoader.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "Civication.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "css/civi-world-mood.css"), "utf8");
  const sprite = fs.readFileSync(path.join(root, "assets/civication/day-cycle-mini.svg"), "utf8");
  assert.match(loader, /CivicationWorldMood\.js/);
  assert.match(three, /civi:visualPeriodChanged/);
  assert.match(three, /function applyWorldMood/);
  assert.match(html, /css\/civi-world-mood\.css/);
  const miniCss = fs.readFileSync(path.join(root, "css/civi-miniature-world.css"), "utf8");
  assert.match(html, /civi-day-miniature-header/);
  assert.match(html, /css\/civi-miniature-world\.css/);
  assert.match(miniCss, /\.civi-day-miniature-art/);
  assert.doesNotMatch(css, /#civiLifestorySection > h2::after/);
  assert.match(css, /data-civi-visual-period/);
  assert.match(sprite, /<svg/);
  assert.match(sprite, /<\/svg>/);
  assert.doesNotMatch(source, /localStorage\.setItem|\.setPhase\(|\.advancePhase\(/);
});
