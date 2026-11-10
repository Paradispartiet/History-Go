const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const dom = new JSDOM(`<!doctype html><body>
  <section id="civiLifestorySection"><h2>Min dag</h2>
    <button id="opener">Åpne innboksen</button></section>
  <section id="civiInboxSection"><div class="civi-section-body">
    <button id="first">Første svar</button><button id="last">Siste svar</button>
    <button disabled tabindex="0">Sperret</button><button hidden>Skjult</button>
  </div></section>
  <section id="otherSection"><div class="civi-section-body"><button>Annet innhold</button></div></section>
  <button id="outside">Annen navigasjon</button>
</body>`, { url: "https://example.test/Civication.html", runScripts: "outside-only" });
const { window } = dom;
const { document } = window;
// jsdom has no layout engine. Give visible controls a rectangle so the real
// visibility guard can still exclude hidden controls in this DOM regression.
window.HTMLElement.prototype.getClientRects = function () {
  return this.closest("[hidden]") ? [] : [{ width: 100, height: 44 }];
};
window.setTimeout = () => 0;
window.eval(fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationMiniSectionsUI.js"), "utf8"));
const api = window.CivicationMiniSectionsUI;
api.refresh = () => {};
const opener = document.getElementById("opener");
const inbox = document.getElementById("civiInboxSection");
const config = { label: "Innkommende", category: "personlig" };
const key = (name, shiftKey = false) => {
  const event = new window.KeyboardEvent("keydown", { key: name, shiftKey, bubbles: true, cancelable: true });
  document.activeElement.dispatchEvent(event);
  return event;
};

opener.focus();
api.openPopup(inbox, config);
const modal = document.getElementById("civiSectionPopup");
const title = document.getElementById("civiSectionPopupTitle");
const close = modal.querySelector("button[data-civi-popup-close]");
assert.equal(close.getAttribute("aria-label"), "Lukk", "close control has a readable accessible name");
const first = document.getElementById("first");
const last = document.getElementById("last");
assert.equal(document.activeElement, title, "opening inbox puts reading focus inside the dialog");
assert.equal(modal.getAttribute("aria-hidden"), "false");
assert.equal(key("Tab", true).defaultPrevented, true);
assert.equal(document.activeElement, last, "Shift+Tab from the title reaches the last visible control");
assert.equal(key("Tab").defaultPrevented, true);
assert.equal(document.activeElement, close, "Tab wraps from the last control to close");
assert.equal(key("Tab", true).defaultPrevented, true);
assert.equal(document.activeElement, last, "Shift+Tab wraps to the last visible enabled control");
first.focus();
assert.equal(key("Tab").defaultPrevented, false, "interior tab movement remains native");
const scrollY = window.scrollY;
assert.equal(key("Escape").defaultPrevented, true);
assert.equal(document.activeElement, opener, "Escape returns focus to the Min dag shortcut");
assert.equal(modal.getAttribute("aria-hidden"), "true");
assert.equal(window.scrollY, scrollY, "closing does not move the reading position");
assert.equal(inbox.querySelector(":scope > .civi-section-body").classList.contains("is-in-popup"), false);

api.openPopup(inbox, config);
close.click();
assert.equal(document.activeElement, opener, "close button also returns focus to the opener");

api.openPopup(inbox, config);
api.openPopup(document.getElementById("otherSection"), { label: "Annen seksjon" });
api.closePopup();
assert.equal(document.activeElement, opener, "replacing a dialog retains the original external return point");

api.openPopup(inbox, config);
opener.disabled = true;
api.closePopup();
assert.equal(document.activeElement, document.querySelector("#civiLifestorySection h2"),
  "a newly disabled trigger uses the section heading instead");
opener.disabled = false;
opener.focus();
api.openPopup(inbox, config);
opener.remove();
api.closePopup();
assert.equal(document.activeElement, document.querySelector("#civiLifestorySection h2"),
  "if a live update removes the shortcut, return to the current section heading");

document.getElementById("outside").focus();
api.openPopup(inbox, config);
document.getElementById("outside").focus();
api.closePopup();
assert.equal(document.activeElement, document.getElementById("outside"),
  "closing never steals focus after another surface has explicitly taken it");

dom.window.close();
console.log("Mini section popup focus: entry, Tab boundaries, Escape, close, removed opener, external focus passed");
