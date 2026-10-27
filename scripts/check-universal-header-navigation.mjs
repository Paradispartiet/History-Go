import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../js/ui/universal-header-nav.js", import.meta.url), "utf8");
const welcome = readFileSync(new URL("../js/ui/onboarding-welcome.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const root = "https://paradispartiet.github.io/History-Go/";

function node() {
  const x = {
    children: [], parentElement: null, listeners: {}, href: "", attrs: {}, hidden: false,
    classList: { add() {}, remove() {} },
    setAttribute(k, v) { x.attrs[k] = v; },
    removeAttribute(k) { delete x.attrs[k]; },
    replaceChildren() { x.children.forEach(y => y.parentElement = null); x.children = []; },
    append(...children) { children.forEach(v => { v.parentElement = x; x.children.push(v); }); },
    prepend(v) { v.remove(); v.parentElement = x; x.children.unshift(v); },
    remove() {
      if (x.parentElement) x.parentElement.children = x.parentElement.children.filter(v => v !== x);
      x.parentElement = null;
    },
    addEventListener(k, cb) { x.listeners[k] = cb; },
    get firstElementChild() { return x.children[0] || null; },
    click() {
      const e = { button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      x.listeners.click?.(e);
      return e;
    }
  };
  return x;
}
function boot(page, referrer = "", storage = new Map()) {
  const location = new URL(root + page), host = node(), events = {}, replacements = [];
  location.replace = url => replacements.push(url);
  const nature = page.startsWith("finn-");
  const natureBack = nature ? node() : null;
  if (natureBack) { natureBack.parentElement = host; host.children.push(natureBack); }
  const document = {
    currentScript: { src: root + "js/ui/universal-header-nav.js" }, referrer,
    createElement: node, createElementNS: () => node(),
    addEventListener(name, cb) { events["doc:" + name] = cb; },
    querySelector(selector) {
      if (nature && selector.includes(".ne-header > .ne-back")) return natureBack;
      return selector.startsWith("body.hg-app >") ? host : null;
    }
  };
  const sessionStorage = {
    getItem: k => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: k => storage.delete(k)
  };
  const window = { addEventListener(name, cb) { events[name] = cb; } };
  runInNewContext(source, { URL, document, sessionStorage, window, location, Date });
  return {
    location, storage, replacements,
    get back() { return host.children.find(el => el.attrs["data-hg-nav-back"] !== undefined) || null; },
    get home() { return host.children.find(el => el.attrs["data-hg-nav-home"] !== undefined) || null; },
    get label() { return this.back?.attrs["aria-label"] || null; },
    route(hash) { const oldURL = location.href; location.hash = hash; events.hashchange?.({ oldURL, newURL: location.href }); },
    follow(href) {
      events["doc:click"]?.({
        button: 0, defaultPrevented: false,
        target: { closest: () => ({ href, target: "", hasAttribute: () => false, matches: () => false }) }
      });
    }
  };
}
function assertHome(page) {
  assert.equal(page.home?.href, root + "index.html#/map");
  assert.equal(page.home?.attrs["aria-label"], "History GO – hjem til kartet");
  assert.equal(page.home?.children[0]?.src, root + "bilder/logo_historygo.PNG");
}
const map = boot("index.html#/map");
assert.equal(map.back, null, "map is terminal screen");
assertHome(map);
map.route("#/place/101");
assert.equal(map.label, "Tilbake til kartet");
assert.equal(map.back.href, root + "index.html#/map");
map.route("#/quiz/101");
assert.equal(map.label, "Tilbake til stedet");
assert.equal(map.back.href, root + "index.html#/place/101");
assert.equal(map.back.click().defaultPrevented, true);
assert.deepEqual(map.replacements, [root + "index.html#/place/101"]);
map.route("#/map");
assert.equal(map.back, null);
assertHome(map);

const loginReferrer = boot("profile.html", root + "login.html?next=profile.html");
assert.equal(loginReferrer.back.href, root + "index.html#/map");
loginReferrer.back.click();
assert.deepEqual(loginReferrer.replacements, [root + "index.html#/map"]);
const loginLanding = boot("index.html#/map", root + "profile.html", loginReferrer.storage);
assert.equal(loginLanding.back, null);
loginLanding.home.click();
assert.deepEqual(loginLanding.replacements, []);

const knowledge = boot("knowledge.html");
assert.equal(knowledge.back.href, root + "profile.html");
knowledge.back.click();
const profileAfterFallback = boot("profile.html", root + "knowledge.html", knowledge.storage);
assert.equal(profileAfterFallback.back.href, root + "index.html#/map");
profileAfterFallback.back.click();
assert.deepEqual(profileAfterFallback.replacements, [root + "index.html#/map"]);

const store = new Map();
boot("profile.html#spill", "", store).follow(root + "Civication.html");
const civi = boot("Civication.html", root + "profile.html", store);
assert.equal(civi.back.href, root + "profile.html#spill", "Civication back arrow returns to the prior screen");
assert.equal(civi.label, "Tilbake til min samling");
assertHome(civi);
civi.home.click();
assert.deepEqual(civi.replacements, [root + "index.html#/map"], "small logo returns to map");
const civiAgain = boot("Civication.html", root + "profile.html", store);
civiAgain.back.click();
const returned = boot("profile.html#spill", root + "Civication.html", store);
assert.equal(returned.back.href, root + "index.html#/map", "no loop back to Civication");
returned.back.click();
const terminal = boot("index.html#/map", root + "profile.html", store);
assert.equal(terminal.back, null, "return journey ends at map");

const fauna = boot("finn-fauna.html");
assert.equal(fauna.back.href, root + "index.html#/map");
assertHome(fauna);
fauna.follow(root + "finn-flora.html");
const flora = boot("finn-flora.html", root + "finn-fauna.html", fauna.storage);
assert.equal(flora.back.href, root + "finn-fauna.html");
flora.back.click();
const faunaReturned = boot("finn-fauna.html", root + "finn-flora.html", fauna.storage);
assert.equal(faunaReturned.back.href, root + "index.html#/map");

assert.match(index, /id="hgHomeLogo"[^>]*aria-label="Åpne History Go-startsiden"/);
assert.match(welcome, /getElementById\("hgHomeLogo"\)\?\.addEventListener\("click"[\s\S]*?open\(\)/);
process.stdout.write("History Go home/logo + safe back navigation checks passed\n");
