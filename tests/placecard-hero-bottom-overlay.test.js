const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "css", "placeCard.css"), "utf8");
const heroCss = css.slice(css.indexOf("/* PlaceCard photo overlay:"), css.indexOf("/* Direct Place Sheet:"));
const stickyCss = fs.readFileSync(path.join(root, "css", "place-card-sticky-header.css"), "utf8");
const stickyJs = fs.readFileSync(path.join(root, "js", "ui", "place-card-sticky-header.js"), "utf8");
const navCss = fs.readFileSync(path.join(root, "css", "place-sheet-phase6.css"), "utf8");
const shellTs = fs.readFileSync(path.join(root, "js", "ui", "place-sheet", "place-sheet-shell.ts"), "utf8");
assert.match(heroCss, /justify-content:flex-end;/, "Hero copy is anchored at photo bottom");
assert.match(heroCss, /\.pc-title-row\{\s*display:contents !important;/, "Title and live controls have independent placements");
assert.match(heroCss, /#pcTitle\{[\s\S]*?text-align:right;/, "Title belongs at bottom right");
assert.match(heroCss, /#pcFavorite\{\s*top:20px;\s*right:136px;/, "Favorite moves to top-right icon row");
assert.match(heroCss, /#pcPeopleIcon\{\s*top:10px;\s*right:72px;/, "People icon stays in upper right");
assert.match(heroCss, /#pcBadgesIcon\{\s*top:10px;\s*right:12px;/, "Merker icon stays in upper right");
assert.match(heroCss, /#pcHeroInfoRow\{\s*order:1;/, "Metadata and action share a row above title");
assert.match(heroCss, /#pcMeta > \*\{[^}]*color:#fff;/s, "Metadata remains white");
assert.match(css, /rgba\(0,0,0,\.90\) 100%/, "Photo bottom retains its contrast gradient");
assert.match(stickyCss, /transform: translate3d\(0, calc\(var\(--pc-visible-hero-height\) - var\(--pc-original-hero-height\)\), 0\)/, "Top of image scrolls off while bottom stays");
assert.match(stickyJs, /naturalHeight \* 0\.54/, "Header keeps about half its image visible");
assert.match(stickyCss, /color:#fff !important;/, "Title stays white in any photo");
assert.match(navCss, /> \.pc-sheet-section-nav\{[\s\S]*?position:relative;/, "Bottom bar is not sticky inside body");
assert.match(shellTs, /host\.appendChild\(nav\)/, "Bottom bar is outside the scrolling body");

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
