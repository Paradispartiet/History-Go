import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync("js/leksikon/leksikon_loader.js", "utf8");

function boot({ deferLesespor = false } = {}) {
  const popups = [];
  const handlers = Object.create(null);
  let releaseLesespor;
  const location = { hostname: "localhost", origin: "http://localhost", pathname: "/index.html" };
  const window = {
    location,
    WK_BY_PLACE: {},
    PLACES: [{ id: "example", name: "Eksempelsted" }],
    LEKSIKON_BY_PLACE: { example: [] },
    LESESPOR: deferLesespor ? undefined : [{ id: "reading-one", title: "En historisk tekst", place_ids: ["example"] }],
    makePopup(html, className) { popups.push({ html, className }); },
    DataHub: deferLesespor ? {
      loadLesespor() {
        return new Promise((resolve) => { releaseLesespor = resolve; });
      }
    } : undefined
  };
  const document = {
    readyState: "loading",
    addEventListener(name, callback) { (handlers[name] ||= []).push(callback); },
    querySelector() { return null; },
    getElementById() { return null; }
  };
  vm.runInNewContext(source, {
    window, document, location, URL, console, setTimeout, Element: class Element {}
  }, { filename: "js/leksikon/leksikon_loader.js" });

  const clickBack = (insideLeksikonPopup) => {
    const back = {
      dataset: { leksikonBack: "hub" },
      closest(selector) {
        return selector === ".hg-popup.leksikon-entry-popup" && insideLeksikonPopup ? {} : null;
      }
    };
    const target = {
      closest(selector) {
        return selector === "[data-leksikon-back]" ? back : null;
      }
    };
    const event = { target, preventDefault() {}, stopPropagation() {} };
    for (const callback of handlers.click || []) callback(event);
  };
  return { window, popups, clickBack, releaseLesespor: (...args) => releaseLesespor?.(...args) };
}

test("global Lesespor arrow dismisses only its popup and preserves the previous view", async () => {
  const { window, popups } = boot();
  await window.HGLesespor.openAll();
  assert.equal(popups.length, 1);
  assert.equal(popups[0].className, "lesespor-entry-popup");
  assert.match(popups[0].html, /data-close-popup aria-label="Tilbake til forrige visning"/);
  assert.match(popups[0].html, /class="pc-leksikon-back pc-leksikon-back-icon"/);
  assert.doesNotMatch(popups[0].html, /data-leksikon-back="hub"/);
});

test("place Lesespor goes back to its own Leksikon hub and ignores unrelated popups", async () => {
  const { window, popups, clickBack } = boot();
  await window.HGLeksikon.openPlace("example", 0, "lesespor");
  assert.equal(popups.at(-1).className, "leksikon-entry-popup");
  assert.match(popups.at(-1).html, /data-leksikon-back="hub" aria-label="Tilbake til Leksikon"/);
  assert.doesNotMatch(popups.at(-1).html, /data-close-popup/);
  const before = popups.length;
  clickBack(false);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(popups.length, before, "a back button in another overlay is ignored");
  clickBack(true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(popups.length, before + 1);
  assert.equal(popups.at(-1).className, "leksikon-entry-popup");
  assert.match(popups.at(-1).html, /class="pc-leksikon-kicker">Leksikon/);
});

test("a slow global Lesespor load cannot replace a more recent Leksikon view", async () => {
  const { window, popups, releaseLesespor } = boot({ deferLesespor: true });
  const pending = window.HGLesespor.openAll();
  window.LESESPOR = [];
  await window.HGLeksikon.openPlace("example");
  releaseLesespor({ items: [] });
  await pending;
  assert.equal(popups.length, 1, "outdated asynchronous render is not mounted");
  assert.equal(popups[0].className, "leksikon-entry-popup");
});
