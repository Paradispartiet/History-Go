import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/ui/place-card-reader.js", import.meta.url), "utf8");

class FakeElement {
  constructor(tag, text = "", classes = []) {
    this.tagName = tag;
    this.innerText = text;
    this.textContent = text;
    this.children = [];
    this.parentElement = null;
    this.dataset = {};
    this.attributes = {};
    this.handlers = {};
    const allClasses = new Set(classes);
    this.classList = {
      contains: value => allClasses.has(value),
      add: value => allClasses.add(value),
      remove: value => allClasses.delete(value),
      toggle: (value, active) => active ? allClasses.add(value) : allClasses.delete(value),
    };
  }
  appendChild(child) { child.parentElement = this; this.children.push(child); }
  insertBefore(child, before) {
    child.parentElement = this;
    const index = this.children.indexOf(before);
    this.children.splice(index < 0 ? this.children.length : index, 0, child);
  }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  addEventListener(type, handler) { this.handlers[type] = handler; }
  matches(selector) {
    return selector.split(",").some(item => {
      const part = item.trim();
      return part === this.tagName || (part.startsWith(".") && this.classList.contains(part.slice(1)));
    });
  }
  closest(selector) {
    for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node;
    return null;
  }
  contains(target) {
    for (let node = target; node; node = node.parentElement) if (node === this) return true;
    return false;
  }
  querySelector(selector) {
    if (selector === ".pc-body" || selector === ".pc-title-row") {
      return this.children.find(child => child.matches(selector)) ?? null;
    }
    return this.children.find(child => child.matches(selector)) ?? null;
  }
}

function fixture({ supported = true } = {}) {
  const card = new FakeElement("div");
  card.dataset.currentPlaceId = "akerselva";
  card.setAttribute("aria-hidden", "false");
  const body = new FakeElement("div", "", ["pc-body"]);
  const row = new FakeElement("div", "", ["pc-title-row"]);
  const title = new FakeElement("h2", "Akerselva");
  const description = new FakeElement("p", "Akerselva har industrihistorie.");
  const link = new FakeElement("a");
  const linkLabel = new FakeElement("span", "Åpne mer");
  const round = new FakeElement("div", "", ["pc-round"]);
  const favourite = new FakeElement("button");
  card.appendChild(body);
  body.appendChild(row);
  row.appendChild(title);
  row.appendChild(favourite);
  body.appendChild(description);
  body.appendChild(link);
  link.appendChild(linkLabel);
  body.appendChild(round);

  const queued = [];
  let cancellations = 0;
  let observer;
  const speech = {
    getVoices: () => [{ lang: "nb-NO", name: "Norsk" }],
    cancel: () => { cancellations += 1; },
    speak: utterance => queued.push(utterance),
  };
  const win = {
    speechSynthesis: supported ? speech : undefined,
    SpeechSynthesisUtterance: supported ? class {
      constructor(text) { this.text = text; }
    } : undefined,
    addEventListener() {},
    getSelection: () => ({ toString: () => "" }),
  };
  const document = {
    documentElement: { lang: "nb" },
    getElementById: id => id === "placeCard" ? card : id === "pcFavorite" ? favourite : null,
    createElement: tag => new FakeElement(tag),
    addEventListener() {},
  };
  class Observer {
    constructor(callback) { observer = callback; }
    observe() {}
  }
  vm.runInNewContext(source, { document, window: win, Element: FakeElement, MutationObserver: Observer });
  const button = row.children.find(child => child.id === "pcReaderToggle");
  const dispatch = (node, target = node) => {
    const event = {
      target,
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.propagationStopped = true; },
    };
    node.handlers.click(event);
    return event;
  };
  return {
    card, body, title, description, linkLabel, round, button, queued, dispatch,
    notifyMutation: () => observer(),
    cancellations: () => cancellations,
  };
}

test("PlaceCard reader toggles on and reads only pressed headings and text", () => {
  const f = fixture();
  assert.ok(f.button);
  assert.equal(f.button.getAttribute("aria-pressed"), "false");
  f.dispatch(f.button);
  assert.equal(f.button.getAttribute("aria-pressed"), "true");
  const heading = f.dispatch(f.body, f.title);
  assert.equal(heading.propagationStopped, true);
  assert.equal(f.queued[0].text, "Akerselva");
  assert.equal(f.queued[0].lang, "nb-NO");
  f.dispatch(f.body, f.description);
  assert.equal(f.queued[1].text, "Akerselva har industrihistorie.");
  assert.equal(f.queued[1].rate, 0.95);
  f.dispatch(f.button);
  assert.equal(f.button.getAttribute("aria-pressed"), "false");
  assert.ok(f.cancellations() >= 2);
});

test("PlaceCard reader does not hijack interactive links or rounds", () => {
  const f = fixture();
  f.dispatch(f.button);
  for (const target of [f.linkLabel, f.round]) {
    const event = f.dispatch(f.body, target);
    assert.equal(event.propagationStopped, false);
  }
  assert.equal(f.queued.length, 0);
});

test("PlaceCard reader cancels on close and prevents stale speech segments", () => {
  const f = fixture();
  f.dispatch(f.button);
  f.description.innerText = "Lang historie ".repeat(90);
  f.dispatch(f.body, f.description);
  const original = f.queued[0];
  assert.ok(original.text.length < 300);
  const beforeCancel = f.cancellations();
  f.card.setAttribute("aria-hidden", "true");
  f.notifyMutation();
  assert.ok(f.cancellations() > beforeCancel);
  original.onend();
  assert.equal(f.queued.length, 1);
});

test("PlaceCard reader cancels when switching places", () => {
  const f = fixture();
  f.dispatch(f.button);
  f.dispatch(f.body, f.title);
  const beforeCancel = f.cancellations();
  f.card.dataset.currentPlaceId = "stortorget";
  f.notifyMutation();
  assert.ok(f.cancellations() > beforeCancel);
});

test("PlaceCard reader disables the button where speech synthesis is unavailable", () => {
  const f = fixture({ supported: false });
  assert.equal(f.button.disabled, true);
  assert.equal(f.button.getAttribute("aria-pressed"), "false");
});
