const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "css", "placeCard.css"), "utf8");
const heroCss = css.slice(css.indexOf("/* PlaceCard landscape hero:"), css.indexOf("/* Direct Place Sheet:"));
assert.match(heroCss, /has-photo-source \.pc-heading-content\{\s*display:grid;/, "The photograph hero must use the two-column layout");
assert.match(heroCss, /\.pc-title-row\{\s*order:1;\s*grid-column:2;/, "Title column must be on the right");
assert.match(heroCss, /\.pc-title-row #pcTitle\{[^}]*text-align:right;/s, "Title must align right");
assert.match(heroCss, /#pcMeta\{\s*order:0;\s*grid-column:1;/, "Category/epoch must be bottom left");
assert.match(heroCss, /#pcStatusBar\{\s*order:2;\s*grid-column:1;\s*grid-row:3;/, "Next action must follow epoke at lower left");
for (const selector of ["#pcFavorite", "#pcPeopleIcon", "#pcBadgesIcon"]) {
  assert.ok(heroCss.includes("> " + selector + "{"), selector + " stays in the upper-right control group");
}
assert.match(css, /rgba\(0,0,0,\.90\) 100%/, "Photo bottom must have a contrast gradient");
assert.match(heroCss, /#pcMeta > \*\{[^}]*color:#fff;/s, "Metadata must remain white");
assert.match(heroCss, /--pc-hero-collapse-offset/, "Title must follow the shrinking photo");
const sticky = fs.readFileSync(path.join(root, "js", "ui", "place-card-sticky-header.js"), "utf8");
assert.match(sticky, /naturalHeight \* 0\.53/, "The hero must contract toward half-height");
assert.match(sticky, /--pc-hero-collapse-offset/, "The title must travel upward with scroll");
const navCss = fs.readFileSync(path.join(root, "css", "place-sheet-phase6.css"), "utf8");
assert.match(navCss, /\.pc-sheet-section-nav\{[^}]*position:sticky;[^}]*top:auto;[^}]*bottom:0;/s, "Section navigation must be pinned to the bottom");
assert.match(navCss, /\.pc-sheet-section-nav\{[^}]*order:999;/s, "Section navigation must follow editorial sections");
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
