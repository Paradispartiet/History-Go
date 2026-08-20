#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const repoRoot = path.resolve(__dirname, "..");
const read = relativePath => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

const dom = new JSDOM(read("profile.html"), {
  url: "http://localhost/profile.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
window.console = console;
window.CSS ||= {};
window.CSS.escape ||= value => String(value).replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`);
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

const context = dom.getInternalVMContext();
const run = relativePath => vm.runInContext(read(relativePath), context, { filename: relativePath });
const click = selector => {
  const element = window.document.querySelector(selector);
  assert(element, `Missing clickable element: ${selector}`);
  element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  return element;
};

const polishLink = window.document.getElementById("hgProfilePolishStyles");
const collectionLink = window.document.querySelector('link[href="css/personal-collection-v1.css"]');
assert(polishLink && collectionLink, "profile loads both polish and collection styles");
assert(
  polishLink.compareDocumentPosition(collectionLink) & window.Node.DOCUMENT_POSITION_FOLLOWING,
  "personal collection CSS loads after the legacy polish layer"
);

const tablist = window.document.querySelector(".profile-tabs");
const header = window.document.querySelector(".site-header");
assert(tablist && header, "profile header and tablist exist");
assert.strictEqual(tablist.previousElementSibling, header, "tablist is edge-to-edge directly below the header");
assert(!window.document.querySelector("#profileMain .profile-tabs"), "tablist no longer floats inside the collection content");

const style = window.document.createElement("style");
style.textContent = `${read("css/profile-polish.css")}\n${read("css/personal-collection-v1.css")}`;
window.document.head.appendChild(style);
const tablistStyle = window.getComputedStyle(tablist);
assert.strictEqual(tablistStyle.display, "flex", "collection CSS wins the tab layout cascade");
assert.strictEqual(tablistStyle.borderRadius, "0px", "tablist is a flush bar rather than a floating pill");

run("js/profile.js");
window.initProfileTabs?.();
run("js/ui/personal-collection-v1.js");
window.HGPersonalCollectionV1.renderAll();

click(".profile-more-trigger");
click('[data-secondary-panel="spill"]');

const spillTab = window.document.querySelector('.profile-tab[data-tab="spill"]');
const spillPanel = window.document.querySelector('.profile-tab-panel[data-panel="spill"]');
assert(spillTab?.classList.contains("is-active"), "Mer → Spill activates the canonical Spill tab");
assert(spillPanel?.classList.contains("is-active"), "Mer → Spill activates the canonical Spill panel");
assert(spillPanel.querySelectorAll(".profile-games-grid .profile-game-card").length >= 3, "Spill has a visible static fallback before registry hydration");

run("js/historyGoGameRegistry.js");
const registry = JSON.parse(read("data/historygo/shared/game_registry.json"));
window.HGGameRegistry.renderGameRegistry(registry);
assert.strictEqual(spillPanel.querySelectorAll(".profile-games-grid .profile-game-card").length, registry.games.length, "Spill renders every canonical registered game");

dom.window.close();
console.log("Min samling browser smoke passed: flush tabs and Mer → Spill work.");
