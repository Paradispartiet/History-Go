import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/ui/place-card-reader.js", import.meta.url), "utf8");

class FakeElement {
  constructor(tag, text = "", classes = []) {
    this.tagName = tag.toLowerCase();
    this.innerText = text;
    this.textContent = text;
    this.children = [];
    this.parentElement = null;
    this.dataset = {};
    this.attributes = {};
    this.handlers = {};
    this.hidden = false;
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
      if (part === this.tagName) return true;
      if (part.startsWith("#")) return this.id === part.slice(1);
      if (part.startsWith(".")) return this.classList.contains(part.slice(1));
      if (part.startsWith("[") && part.endsWith("]")) {
        const key = part.slice(1, -1).split("=")[0];
        return this.getAttribute(key) !== null;
      }
      return false;
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
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  querySelectorAll(selector) {
    const result = [];
    for (const child of this.children) {
      if (child.matches(selector)) result.push(child);
      result.push(...child.querySelectorAll(selector));
    }
    return result;
  }
}

function fixture({ supported = true } = {}) {
  const card = new FakeElement("div");
  card.id = "placeCard";
  card.dataset.currentPlaceId = "akerselva";
  card.setAttribute("aria-hidden", "false");
  const body = new FakeElement("div", "", ["pc-body"]);
  const row = new FakeElement("div", "", ["pc-title-row"]);
  const title = new FakeElement("h2", "Akerselva");
  title.id = "pcTitle";
  const description = new FakeElement("p", "Akerselva har industrihistorie.");
  description.id = "pcDesc";
  const second = new FakeElement("p", "Her finner vi gamle fabrikker.");
  const hiddenSection = new FakeElement("div");
  hiddenSection.hidden = true;
  const hiddenText = new FakeElement("p", "Dette skal ikke leses.");
  const link = new FakeElement("a");
  const linkLabel = new FakeElement("span", "Åpne mer");
  const round = new FakeElement("div", "", ["pc-round"]);
  const favourite = new FakeElement("button");
  card.appendChild(body);
  body.appendChild(row);
  row.appendChild(title);
  row.appendChild(favourite);
  body.appendChild(description);
  body.appendChild(second);
  body.appendChild(hiddenSection);
  hiddenSection.appendChild(hiddenText);
  body.appendChild(link);
  link.appendChild(linkLabel);
  body.appendChild(round);

  const spoken = [];
  let cancellations = 0;
  let pauses = 0;
  let resumes = 0;
  let observer;
  const speech = {
    getVoices: () => [{ lang: "nb-NO", name: "Norsk" }],
    cancel: () => { cancellations++; },
    pause: () => { pauses++; },
    resume: () => { resumes++; },
    speak: utterance => spoken.push(utterance),
  };
  const win = {
    speechSynthesis: supported ? speech : undefined,
    SpeechSynthesisUtterance: supported ? class {
      constructor(text) { this.text = text; }
    } : undefined,
    getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    addEventListener() {},
    getSelection: () => ({ toString: () => "" }),
  };
  const document = {
    documentElement: { lang: "nb" },
    getElementById: id => ({ placeCard: card, pcFavorite: favourite, pcTitle: title, pcDesc: description })[id] || null,
    createElement: tag => new FakeElement(tag),
    addEventListener() {},
  };
  class Observer {
    constructor(callback) { observer = callback; }
    observe() {}
  }
  vm.runInNewContext(source, { document, window: win, Element: FakeElement, MutationObserver: Observer });
  const toggle = row.children.find(child => child.id === "pcReaderToggle");
  const controls = card.children.find(child => child.id === "pcReaderControls");
  const [playPause, speed] = controls.children;
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
    card, body, title, description, second, hiddenText, linkLabel, round, toggle,
    controls, playPause, speed, spoken, dispatch,
    notifyMutation: () => observer(),
    cancellations: () => cancellations,
    pauses: () => pauses,
    resumes: () => resumes,
  };
}

test("speaker icon immediately reads heading, then every visible text block in order", () => {
  const f = fixture();
  assert.equal(f.toggle.getAttribute("aria-pressed"), "false");
  f.dispatch(f.toggle);
  assert.equal(f.toggle.getAttribute("aria-pressed"), "true");
  assert.equal(f.controls.hidden, false);
  assert.equal(f.spoken[0].text, "Akerselva");
  assert.equal(f.spoken[0].lang, "nb-NO");
  f.spoken[0].onend();
  assert.equal(f.spoken[1].text, "Akerselva har industrihistorie.");
  f.spoken[1].onend();
  assert.equal(f.spoken[2].text, "Her finner vi gamle fabrikker.");
  f.spoken[2].onend();
  assert.equal(f.spoken.length, 3, "hidden text and links are excluded");
  assert.equal(f.playPause.textContent, "▶");
  f.dispatch(f.playPause);
  assert.equal(f.spoken[3].text, "Akerselva", "play after completion restarts");
});

test("tapping a paragraph jumps there and continues automatically to the end", () => {
  const f = fixture();
  f.dispatch(f.toggle);
  const started = f.dispatch(f.body, f.description);
  assert.equal(started.propagationStopped, true);
  assert.equal(f.spoken[1].text, "Akerselva har industrihistorie.");
  f.spoken[1].onend();
  assert.equal(f.spoken[2].text, "Her finner vi gamle fabrikker.");
  f.spoken[0].onend(); // canceled previous utterance cannot restart the old queue
  assert.equal(f.spoken.length, 3);
});

test("play/pause pauses and resumes the active speech sequence", () => {
  const f = fixture();
  f.dispatch(f.toggle);
  f.dispatch(f.playPause);
  assert.equal(f.playPause.textContent, "▶");
  assert.equal(f.pauses(), 1);
  f.dispatch(f.playPause);
  assert.equal(f.resumes(), 1);
  assert.equal(f.playPause.textContent, "⏸");
  assert.equal(f.spoken.length, 1, "resume does not queue duplicate utterances");
});

test("speed button changes rate and restarts only the current chunk", () => {
  const f = fixture();
  f.dispatch(f.toggle);
  assert.equal(f.spoken[0].rate, 1);
  f.spoken[0].onend();
  f.dispatch(f.speed);
  assert.equal(f.speed.textContent, "1,2×");
  assert.equal(f.spoken[2].rate, 1.2);
  assert.equal(f.spoken[2].text, f.spoken[1].text);
  f.spoken[1].onend();
  assert.equal(f.spoken.length, 3, "old voice's completion cannot duplicate");
});

test("links and circular actions still work normally", () => {
  const f = fixture();
  f.dispatch(f.toggle);
  for (const target of [f.linkLabel, f.round]) {
    const event = f.dispatch(f.body, target);
    assert.equal(event.propagationStopped, false);
  }
  assert.equal(f.spoken.length, 1);
});

test("turning off, closing and switching places cancel speech and hide the panel", () => {
  for (const closeMode of ["toggle", "close", "place"]) {
    const f = fixture();
    f.dispatch(f.toggle);
    if (closeMode === "toggle") f.dispatch(f.toggle);
    if (closeMode === "close") {
      f.card.setAttribute("aria-hidden", "true");
      f.notifyMutation();
    }
    if (closeMode === "place") {
      f.card.dataset.currentPlaceId = "stortorget";
      f.notifyMutation();
    }
    assert.equal(f.cancellations(), 1, "only the active utterance is canceled");
    assert.equal(f.toggle.getAttribute("aria-pressed"), "false");
    assert.equal(f.controls.hidden, true);
    f.spoken[0].onend();
    assert.equal(f.spoken.length, 1);
  }
});

test("long paragraphs chunk without skipping the following paragraphs", () => {
  const f = fixture();
  f.description.innerText = "Industrihistorie ".repeat(75);
  f.dispatch(f.toggle);
  f.spoken[0].onend();
  let next = 1;
  while (f.spoken[next]?.text !== "Her finner vi gamle fabrikker." && next < 80) {
    assert.ok(f.spoken[next].text.length <= 275);
    f.spoken[next].onend();
    next++;
  }
  assert.equal(f.spoken[next].text, "Her finner vi gamle fabrikker.");
});

test("unsupported speech API disables the speaker toggle", () => {
  const f = fixture({ supported: false });
  assert.equal(f.toggle.disabled, true);
  assert.equal(f.toggle.getAttribute("aria-pressed"), "false");
});

test("canonical title and description are read before Om stedet even under aria-live wrappers", () => {
  const f = fixture();
  f.title.parentElement.setAttribute("aria-live", "polite");
  f.description.setAttribute("aria-live", "polite");
  const about = new FakeElement("h3", "Om stedet");
  const popupDesc = new FakeElement("p", "Den fullstendige historien om stedet.");
  f.body.appendChild(about);
  f.body.appendChild(popupDesc);

  f.dispatch(f.toggle);
  assert.equal(f.spoken[0].text, "Akerselva");
  f.spoken[0].onend();
  assert.equal(f.spoken[1].text, "Akerselva har industrihistorie.");
  f.spoken[1].onend();
  assert.equal(f.spoken[2].text, "Her finner vi gamle fabrikker.");
  f.spoken[2].onend();
  assert.equal(f.spoken[3].text, "Om stedet");
  f.spoken[3].onend();
  assert.equal(f.spoken[4].text, "Den fullstendige historien om stedet.");

  f.dispatch(f.body, f.description);
  assert.equal(f.spoken[5].text, "Akerselva har industrihistorie.",
    "tapping the canonical intro restarts there, before Om stedet");
  f.spoken[5].onend();
  assert.equal(f.spoken[6].text, "Her finner vi gamle fabrikker.");
});

test("initial play does not cancel idle Safari speech before the first heading", () => {
  const f = fixture();
  f.dispatch(f.toggle);
  assert.equal(f.cancellations(), 0, "no cancel should race the first heading utterance");
  assert.equal(f.spoken[0].text, "Akerselva");
  f.dispatch(f.body, f.description);
  assert.equal(f.cancellations(), 1, "jumping to a new paragraph cancels active voice");
});
