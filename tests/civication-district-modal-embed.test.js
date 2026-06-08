// Verifiserer at nabolagsvelgeren (#districtModal) embeddes inni en åpen
// seksjons-popup i stedet for å vises som et eget overlegg som havner bak
// popupen, og at den ryddes tilbake til verdenslaget når den lukkes.
//
// Repoet har ingen jsdom, så vi laster den faktiske CivicationUI.js i en
// vm-sandbox med en minimal DOM-stub og kaller de eksporterte funksjonene.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

// ---------------------------------------------------------------------------
// Minimal DOM-stub
// ---------------------------------------------------------------------------
class El {
  constructor(tag) {
    this.tagName = String(tag || "div").toUpperCase();
    this.id = "";
    this.className = "";
    this.style = {};
    this.children = [];
    this.parentElement = null;
    this._html = "";
    this.classList = {
      _el: this,
      _tokens: () => (this._el.className ? this._el.className.split(/\s+/).filter(Boolean) : []),
      add: (t) => { const s = new Set(El.tokens(this)); s.add(t); this.className = [...s].join(" "); },
      remove: (t) => { const s = new Set(El.tokens(this)); s.delete(t); this.className = [...s].join(" "); },
      contains: (t) => El.tokens(this).includes(t),
      toggle: (t, on) => { (on === undefined ? !this.classList.contains(t) : on) ? this.classList.add(t) : this.classList.remove(t); }
    };
  }
  static tokens(el) {
    return el.className ? el.className.split(/\s+/).filter(Boolean) : [];
  }
  set innerHTML(v) { this._html = String(v); if (v === "") this.children = []; }
  get innerHTML() { return this._html; }
  appendChild(child) {
    if (child.parentElement) {
      const idx = child.parentElement.children.indexOf(child);
      if (idx >= 0) child.parentElement.children.splice(idx, 1);
    }
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  querySelector(sel) {
    if (sel === "button") return new El("button"); // brukes kun for onclick-binding
    return null;
  }
  setAttribute() {}
  getAttribute() { return null; }
  addEventListener() {}
  scrollIntoView() {}
}

const registry = new Map();
function reg(el) { if (el.id) registry.set(el.id, el); return el; }

const body = new El("body");
const document = {
  getElementById: (id) => registry.get(id) || null,
  createElement: (tag) => new El(tag),
  querySelector: (sel) => {
    if (sel === ".civi-world") return registry.get("__world__") || null;
    return null;
  },
  addEventListener: () => {},
  body
};

const window = {
  addEventListener: () => {},
  CivicationHome: {
    DISTRICTS: {
      a: { id: "a", name: "Alpha", baseCost: 10, modifiers: { x: 1 }, quizRequirements: {} },
      b: { id: "b", name: "Beta", baseCost: 99, modifiers: { y: -2 }, quizRequirements: { q: 1 } }
    },
    canPurchaseDistrict: (id) => id === "a",
    purchaseDistrict: () => {}
  }
};

// ---------------------------------------------------------------------------
// Bygg scenens DOM
// ---------------------------------------------------------------------------
const world = new El("main"); world.className = "civi-world"; registry.set("__world__", world);
const districtModal = reg(Object.assign(new El("div"), { id: "districtModal", className: "civi-modal" }));
const districtList = reg(Object.assign(new El("div"), { id: "districtList", className: "district-grid" }));
const closeBtn = reg(Object.assign(new El("button"), { id: "closeDistrictModal" }));
const popup = reg(Object.assign(new El("div"), { id: "civiSectionPopup", className: "civi-section-popup" }));
const popupBody = reg(Object.assign(new El("div"), { id: "civiSectionPopupBody" }));

world.appendChild(districtModal);
districtModal.appendChild(districtList);
districtModal.appendChild(closeBtn);
body.appendChild(popup);
popup.appendChild(popupBody);

// ---------------------------------------------------------------------------
// Last CivicationUI.js i sandbox
// ---------------------------------------------------------------------------
const src = fs.readFileSync(path.join(__dirname, "..", "js", "Civication", "ui", "CivicationUI.js"), "utf8");
const sandbox = { window, document, console, setTimeout, clearTimeout };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: "CivicationUI.js" });

assert.strictEqual(typeof window.openDistrictSelector, "function", "openDistrictSelector eksporteres");
assert.strictEqual(typeof window.closeDistrictSelector, "function", "closeDistrictSelector eksporteres");

// ---------------------------------------------------------------------------
// Case 1: popup åpen -> districtModal embeddes inni popupen
// ---------------------------------------------------------------------------
popup.classList.add("is-open");
window.openDistrictSelector();

assert.strictEqual(districtModal.parentElement, popupBody, "districtModal flyttes inn i popupens body");
assert.ok(districtModal.classList.contains("is-embedded"), "districtModal får is-embedded");
assert.notStrictEqual(districtModal.style.display, "flex", "embedded skal ikke bruke fixed flex-overlay");
assert.strictEqual(districtList.children.length, 2, "alle nabolag rendres som kort");

// ---------------------------------------------------------------------------
// Case 2: lukk -> districtModal ryddes tilbake til verdenslaget og skjules
// ---------------------------------------------------------------------------
window.closeDistrictSelector();

assert.strictEqual(districtModal.parentElement, world, "districtModal flyttes tilbake til .civi-world");
assert.ok(!districtModal.classList.contains("is-embedded"), "is-embedded fjernes ved lukking");
assert.strictEqual(districtModal.style.display, "none", "districtModal skjules ved lukking");

// ---------------------------------------------------------------------------
// Case 3: ingen popup åpen -> klassisk overlay-oppførsel beholdes
// ---------------------------------------------------------------------------
popup.classList.remove("is-open");
window.openDistrictSelector();

assert.strictEqual(districtModal.parentElement, world, "uten popup forblir districtModal i verdenslaget");
assert.ok(!districtModal.classList.contains("is-embedded"), "uten popup ingen is-embedded");
assert.strictEqual(districtModal.style.display, "flex", "uten popup vises districtModal som overlay (flex)");

console.log("civication-district-modal-embed: OK");
