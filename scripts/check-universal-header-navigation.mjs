import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
const source = readFileSync(new URL("../js/ui/universal-header-nav.js", import.meta.url), "utf8");
const root = "https://paradispartiet.github.io/History-Go/";

function node() {
  const x = {
    children: [], parentElement: null, listeners: {}, href: "", attrs: {},
    classList: { add() {}, remove() {} },
    setAttribute(k, v) { x.attrs[k] = v; },
    removeAttribute(k) { delete x.attrs[k]; },
    replaceChildren() { x.children = []; },
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
  const location = new URL(root + page), host = node(), events = {};
  const history = { length: 2, calls: 0, back() { this.calls++; } };
  const document = {
    currentScript: { src: root + "js/ui/universal-header-nav.js" }, referrer,
    createElement: node, addEventListener(name, cb) { events["doc:" + name] = cb; },
    querySelector(selector) { return selector.startsWith("body.hg-app >") ? host : null; }
  };
  const sessionStorage = { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) };
  const window = { addEventListener(name, cb) { events[name] = cb; } };
  runInNewContext(source, { URL, document, sessionStorage, window, location, history, Date });
  return {
    history, location, storage,
    get link() { return host.children[0] || null; },
    get label() { return host.children[0]?.children[1]?.textContent || null; },
    route(hash) { const oldURL = location.href; location.hash = hash; events.hashchange?.({ oldURL, newURL: location.href }); },
    follow(href) {
      events["doc:click"]?.({
        button: 0, defaultPrevented: false,
        target: { closest: () => ({ href, target: "", hasAttribute: () => false, matches: () => false }) }
      });
    }
  };
}
const map = boot("index.html#/map");
assert.equal(map.link, null);
map.route("#/place/101");
assert.equal(map.label, "Til kartet");
assert.equal(map.link.href, root + "index.html#/map");
map.route("#/quiz/101");
assert.equal(map.label, "Til stedet");
assert.equal(map.link.href, root + "index.html#/place/101");
map.route("#/map");
assert.equal(map.link, null);

const profile = boot("profile.html", root + "index.html#/map");
assert.equal(profile.label, "Til kartet");
assert.equal(profile.link.click().defaultPrevented, true);
assert.equal(profile.history.calls, 1);

const knowledge = boot("knowledge.html");
assert.equal(knowledge.link.href, root + "profile.html");
assert.equal(knowledge.link.click().defaultPrevented, false);
assert.equal(boot("notater.html", "https://external.example/").link.href, root + "profile.html");

const store = new Map();
boot("profile.html#spill", "", store).follow(root + "Civication.html");
const civi = boot("Civication.html", root + "profile.html", store);
assert.equal(civi.link.href, root + "profile.html#spill");
assert.equal(civi.label, "Til min samling");
assert.equal(boot("sprakatlas.html", root + "index.html").label, "Til kartet");
process.stdout.write("9/9 History Go header navigation checks passed\n");