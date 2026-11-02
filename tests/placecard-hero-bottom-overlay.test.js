const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "css", "placeCard.css"), "utf8");
const heroCss = css.slice(css.indexOf("/* PlaceCard landscape hero:"), css.indexOf("/* Direct Place Sheet:"));
assert.ok(heroCss.includes("justify-content: flex-end;"), "Hero content must sit at the bottom");
assert.match(heroCss, /#pcMeta\{\s*order: 0;/, "Category and epoch must precede the heading");
assert.match(heroCss, /\.pc-title-row\{\s*order: 1;/, "Heading must follow category and epoch");
assert.match(heroCss, /#pcStatusBar\{\s*order:2;/, "Action must follow the heading");
assert.match(css, /rgba\(0,0,0,\.90\) 100%/, "Photo bottom must have a contrast gradient");
assert.match(heroCss, /#pcMeta > \*\{[^}]*color: #fff;/s, "Metadata must remain white");

let summary = { status: "unknown", visited: false, quizCompleted: false, nextAction: "quiz" };
const calls = [];
const actions = {
  pcQuiz: { hidden: false, disabled: false, click() { calls.push("quiz"); } },
  pcVisit: { hidden: true, disabled: false, click() { calls.push("visit"); } },
  pcObserve: { hidden: true, disabled: false, click() { calls.push("observe"); } },
  pcRoute: { hidden: true, disabled: false, click() { calls.push("route"); } }
};
const statusHost = {
  row: null,
  querySelector() { return this.row; },
  appendChild(row) { this.row = row; }
};
const doc = {
  querySelector() { return null; },
  getElementById(id) {
    if (id === "pcStatusBar") return statusHost;
    if (id === "placeCard") return { dataset: {} };
    return actions[id] || null;
  },
  createElement(tag) {
    return { tag, dataset: {}, setAttribute(name, value) { this[name] = value; }, addEventListener() {} };
  },
  head: { appendChild() {} },
  body: { appendChild() {} }
};
const win = {
  PLACES: [],
  location: { href: "index.html" },
  getComputedStyle(node) { return { display: node.hidden ? "none" : "block", visibility: "visible" }; },
  HGProfileProgressReader: { getPlaceProgressSummary() { return summary; } },
  addEventListener() {},
  openPlaceCard: async () => {}
};
vm.runInNewContext(
  fs.readFileSync(path.join(root, "js", "ui", "place-card-status-surface.js"), "utf8"),
  { window: win, document: doc, console },
  { filename: "place-card-status-surface.js" }
);
const place = { id: "christiania_seildugsfabrik", category: "historie" };
function clickRow() {
  statusHost.row.onclick({ preventDefault() {}, stopPropagation() {} });
}
let row = win.HGPlaceCardStatusSurface.render(place);
assert.equal(row.textContent, "Ta quiz");
assert.ok(!row.textContent.includes("Status:") && !row.textContent.includes("Gjenstår:"));
clickRow();
assert.equal(calls.pop(), "quiz");

actions.pcVisit.hidden = false;
summary = { status: "unknown", visited: false, quizCompleted: false, nextAction: "visit" };
row = win.HGPlaceCardStatusSurface.render(place);
assert.equal(row.textContent, "Registrer besøk");
clickRow();
assert.equal(calls.pop(), "visit");

summary = { status: "completed", visited: true, quizCompleted: true, nextAction: "completed" };
row = win.HGPlaceCardStatusSurface.render(place);
assert.equal(row.textContent, "Se samling");
clickRow();
assert.equal(win.location.href, "profile.html#collectionCardsSection");
console.log("PlaceCard bottom overlay and next-action labels OK");
