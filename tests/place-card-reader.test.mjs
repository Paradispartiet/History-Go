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
  const observers = [];
  const handlers = {};
  let sheetState = null;
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
    addEventListener(type, handler) { (handlers[type] ||= []).push(handler); },
    HGPlaceSheetState: { snapshot: () => sheetState },
    getSelection: () => ({ toString: () => "" }),
  };
  const document = {
    documentElement: { lang: "nb" },
    getElementById: id => ({ placeCard: card, pcFavorite: favourite, pcTitle: title, pcDesc: description })[id] || null,
    createElement: tag => new FakeElement(tag),
    addEventListener() {},
  };
  class Observer {
    constructor(callback) { observers.push(callback); }
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
    notifyMutation: () => observers[0](),
    notifyContent: () => observers[1](),
    setSheetState: state => { sheetState = state; },
    dispatchWindow: type => handlers[type]?.forEach(fn => fn()),
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

test("async History and Fagverk are narrated when added after playback began", () => {
  const f = fixture();
  f.setSheetState({ placeId: "akerselva", phase: "rendering-full" });
  f.dispatch(f.toggle);
  f.spoken[0].onend();
  f.spoken[1].onend();
  f.spoken[2].onend();
  assert.equal(f.spoken.length, 3, "reader waits for late sections");
  assert.equal(f.playPause.textContent, "⏸", "loading must not finish playback");

  const history = new FakeElement("section");
  const heading = new FakeElement("h3", "Historiske lag");
  const timeline = new FakeElement("article");
  const period = new FakeElement("span", "1850–1900");
  const title = new FakeElement("strong", "Industrialiseringen");
  const summary = new FakeElement("p", "Fabrikkene endret byen.");
  history.appendChild(heading);
  history.appendChild(timeline);
  timeline.appendChild(period);
  timeline.appendChild(title);
  timeline.appendChild(summary);
  f.body.appendChild(history);
  f.notifyContent();
  assert.equal(f.spoken[3].text, "Historiske lag");
  f.spoken[3].onend();
  assert.equal(f.spoken[4].text, "1850–1900");
  f.spoken[4].onend();
  assert.equal(f.spoken[5].text, "Industrialiseringen");
  f.spoken[5].onend();
  assert.equal(f.spoken[6].text, "Fabrikkene endret byen.");
});

test("div-based stories, inline text, source lists and later Fagverk are read without buttons", () => {
  const f = fixture();
  f.setSheetState({ placeId: "akerselva", phase: "rendering-full" });
  const stories = new FakeElement("section");
  const heading = new FakeElement("h3", "Fortellinger");
  const story = new FakeElement("div", "Historien fra verkstedet.");
  const link = new FakeElement("a", "Åpne historien");
  stories.appendChild(heading);
  stories.appendChild(story);
  stories.appendChild(link);
  f.body.appendChild(stories);
  f.dispatch(f.toggle);
  for (let i = 0; i < 5; i++) f.spoken[i].onend();
  assert.deepEqual(f.spoken.slice(0, 5).map(s => s.text),
    ["Akerselva", "Akerselva har industrihistorie.", "Her finner vi gamle fabrikker.", "Fortellinger", "Historien fra verkstedet."]);
  assert.equal(f.spoken.length, 5, "navigational link is excluded");

  const learning = new FakeElement("section");
  learning.appendChild(new FakeElement("h3", "Fagverk"));
  learning.appendChild(new FakeElement("div", "Faglig analyse av industrihistorien."));
  const sources = new FakeElement("section");
  sources.appendChild(new FakeElement("h3", "Kilder"));
  sources.appendChild(new FakeElement("li", "Oslo byarkiv, 1904"));
  f.body.appendChild(learning);
  f.body.appendChild(sources);
  f.notifyContent();
  assert.equal(f.spoken[5].text, "Fagverk");
  f.spoken[5].onend();
  assert.equal(f.spoken[6].text, "Faglig analyse av industrihistorien.");
  f.spoken[6].onend();
  assert.equal(f.spoken[7].text, "Kilder");
  f.spoken[7].onend();
  assert.equal(f.spoken[8].text, "Oslo byarkiv, 1904");
});

test("late sections after full-ready are read instead of silently missed", () => {
  const f = fixture();
  f.setSheetState({ placeId: "akerselva", phase: "rendering-full" });
  f.dispatch(f.toggle);
  f.spoken[0].onend();
  f.spoken[1].onend();
  f.spoken[2].onend();
  f.setSheetState({ placeId: "akerselva", phase: "full-ready" });
  f.dispatchWindow("hg:place-sheet-full-ready");
  assert.equal(f.playPause.textContent, "▶", "all currently available prose is complete");

  const extra = new FakeElement("p", "Ny fagtekst ble lastet inn.");
  f.body.appendChild(extra);
  f.notifyContent();
  assert.equal(f.spoken[3].text, "Ny fagtekst ble lastet inn.");
  assert.equal(f.playPause.textContent, "⏸");
});

test("clicking prose seeks forward while delayed updates never reactivate a manually paused reader", () => {
  const f = fixture();
  f.setSheetState({ placeId: "akerselva", phase: "rendering-full" });
  f.dispatch(f.toggle);
  f.dispatch(f.body, f.description);
  assert.equal(f.spoken[1].text, "Akerselva har industrihistorie.");
  f.dispatch(f.playPause);
  const later = new FakeElement("div", "Forsinket fortellertekst.");
  f.body.appendChild(later);
  f.notifyContent();
  assert.equal(f.spoken.length, 2, "manual pause holds despite content updates");
  f.dispatch(f.playPause);
  f.spoken[1].onend();
  assert.equal(f.spoken[2].text, "Her finner vi gamle fabrikker.");
  f.spoken[2].onend();
  assert.equal(f.spoken[3].text, "Forsinket fortellertekst.");
});


test("Place Sheet narration uses its editorial shell and excludes outside collection text", () => {
  const f = fixture();
  const outsideCollection = new FakeElement("div", "Samlekort for gjenstand.");
  f.body.appendChild(outsideCollection);
  const shell = new FakeElement("section");
  shell.setAttribute("data-hg-place-sheet-shell", "1");
  const about = new FakeElement("section");
  about.appendChild(new FakeElement("h3", "Om stedet"));
  about.appendChild(new FakeElement("p", "Lang stedsbeskrivelse."));
  shell.appendChild(about);
  f.body.appendChild(shell);

  f.dispatch(f.toggle);
  assert.equal(f.spoken[0].text, "Akerselva");
  f.spoken[0].onend();
  assert.equal(f.spoken[1].text, "Akerselva har industrihistorie.");
  f.spoken[1].onend();
  assert.equal(f.spoken[2].text, "Om stedet");
  f.spoken[2].onend();
  assert.equal(f.spoken[3].text, "Lang stedsbeskrivelse.");
  f.spoken[3].onend();
  assert.equal(f.spoken.length, 4, "neither old legacy copy nor collection UI is repeated");
});

test("tapping a nested inline span seeks to its enclosing paragraph", () => {
  const f = fixture();
  const emphasis = new FakeElement("span", "Historie");
  f.description.appendChild(emphasis);
  f.dispatch(f.toggle);
  const event = f.dispatch(f.body, emphasis);
  assert.equal(event.propagationStopped, true);
  assert.equal(f.spoken[1].text, "Akerselva har industrihistorie.");
  f.spoken[1].onend();
  assert.equal(f.spoken[2].text, "Her finner vi gamle fabrikker.");
});

test("source titles are narrated while external source links remain clickable", () => {
  const f = fixture();
  const sources = new FakeElement("section");
  sources.setAttribute("data-hg-place-sheet-section", "sources");
  sources.appendChild(new FakeElement("h3", "Kilder"));
  const reference = new FakeElement("a", "Digitalarkivet 1890");
  sources.appendChild(reference);
  f.body.appendChild(sources);
  f.dispatch(f.toggle);
  f.spoken[0].onend();
  f.spoken[1].onend();
  f.spoken[2].onend();
  assert.equal(f.spoken[3].text, "Kilder");
  f.spoken[3].onend();
  assert.equal(f.spoken[4].text, "Digitalarkivet 1890");
  const click = f.dispatch(f.body, reference);
  assert.equal(click.propagationStopped, false, "source links must keep their navigation");
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
