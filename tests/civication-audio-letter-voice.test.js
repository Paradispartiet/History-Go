const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
const start = source.indexOf("  /** @type {any} */ let voiceSession = null;");
const end = source.indexOf("  function audioControlsHtml()", start);
assert.ok(start > 0 && end > start);

function setup({ dayActions = false } = {}) {
  const clicks = [];
  const buttons = ["A", "B", "C"].map(letter => ({
    disabled: letter === "C",
    textContent: letter + ". Choice",
    hasAttribute(name) { return name === "disabled" && this.disabled; },
    getAttribute(name) {
      if (name === "data-lifestory-letter") return letter;
      if (name === "data-lifestory-scene") return dayActions ? null : "scene-1";
      if (name === "data-lifestory-choice") return dayActions ? null : letter;
      return null;
    },
    click() { clicks.push(letter); }
  }));
  const panel = { isConnected: true, getClientRects: () => [1],
    querySelectorAll: selector => dayActions && selector.includes(".civi-lifestory-scene") ? [] : buttons, querySelector: () => null };
  let recognition;
  let repeated = 0;
  let aborted = 0;
  let started = 0;
  class Recognition {
    constructor() { recognition = this; }
    start() { started++; }
    abort() { aborted++; }
  }
  const state = { rolle: "worker", dag: 1, fase: "morgen" };
  const context = {
    window: { SpeechRecognition: Recognition, setTimeout: () => 1, clearTimeout() {} },
    document: { visibilityState: "visible", body: { classList: { contains: () => false } } },
    state, getPanel: () => panel, stopStoryAudio() {}, updateAudioControls() {},
    audioEnabled: true, readStoryAudio() { repeated++; }
  };
  const api = vm.runInNewContext("(function() {" + source.slice(start, end) +
    "; return {parseVoiceCommand, audioChoiceLetter, startVoiceInput, openHandsFreeAfterSpeech, voiceSceneKey, setHandsFree: value => { handsFreeEnabled = value; }}; })()", context);
  function listen() { api.startVoiceInput(panel); return recognition; }
  function answer(rec, ...words) {
    const result = words.map(transcript => ({transcript}));
    result.isFinal = true;
    rec.onresult({results: [result], resultIndex: 0});
  }
  return { api, listen, answer, clicks, state, panel, repeated: () => repeated, aborted: () => aborted, started: () => started };
}

test("single letters and exact Norwegian letter names work", () => {
  const { api } = setup();
  for (const [spoken, letter] of [["A","A"],["b.","B"],["C","C"],["be","B"],["se","C"],["alternativ d","D"],["Å","Å"]]) {
    assert.equal(api.parseVoiceCommand(spoken)?.letter, letter);
  }
  for (const spoken of ["B eller C","jeg tror B","", "2", "alternativ to"]) {
    assert.equal(api.parseVoiceCommand(spoken), null);
  }
  assert.equal(api.audioChoiceLetter(0), "A");
  assert.equal(api.audioChoiceLetter(2), "C");
});
test("a single spoken B uses the same click as a touch choice", () => {
  const s = setup();
  const rec = s.listen();
  s.answer(rec, "B", "be");
  assert.deepEqual(s.clicks, ["B"]);
  s.answer(rec, "A");
  assert.deepEqual(s.clicks, ["B"]);
  assert.equal(s.aborted(), 1);
});
test("ambiguous, disabled, missing and stale choices never click", () => {
  for (const words of [["A","B"],["C"],["D"],["jeg velger kanskje A"]]) {
    const s = setup();
    s.answer(s.listen(), ...words);
    assert.deepEqual(s.clicks, []);
  }
  const s = setup();
  const rec = s.listen();
  s.state.dag++;
  s.answer(rec, "A");
  assert.deepEqual(s.clicks, []);
});
test("repeat command is not a game choice", () => {
  const s = setup();
  s.answer(s.listen(), "gjenta");
  assert.equal(s.repeated(), 1);
  assert.deepEqual(s.clicks, []);
});
test("letter attribute and visible label share the same position", () => {
  assert.match(source, /const letter = audioChoiceLetter\(index\)/);
  assert.match(source, /data-lifestory-letter=/);
  assert.match(source, /escapeHtml\(letter\) \+ "\. "/);
});

test("automatic microphone opens only after explicit hands-free opt-in and matching scene", () => {
  const s = setup();
  const key = s.api.voiceSceneKey(s.panel);
  s.api.openHandsFreeAfterSpeech(s.panel, key);
  assert.equal(s.started(), 0);
  s.api.setHandsFree(true);
  s.api.openHandsFreeAfterSpeech(s.panel, key);
  assert.equal(s.started(), 1);
  // An existing listening session cannot be restarted by a second completion.
  s.api.openHandsFreeAfterSpeech(s.panel, key);
  assert.equal(s.started(), 1);
  assert.equal(s.aborted(), 0);
  // Manual press while listening stops and disables hands-free.
  s.api.startVoiceInput(s.panel);
  assert.equal(s.aborted(), 1);
  s.api.openHandsFreeAfterSpeech(s.panel, key);
  assert.equal(s.started(), 1);
  assert.equal(s.aborted(), 1);
});

test("hands-free rejects an outdated scene or hidden surface", () => {
  const s = setup();
  s.api.setHandsFree(true);
  const key = s.api.voiceSceneKey(s.panel);
  s.state.dag++;
  s.api.openHandsFreeAfterSpeech(s.panel, key);
  s.panel.isConnected = false;
  s.api.openHandsFreeAfterSpeech(s.panel, s.api.voiceSceneKey(s.panel));
  assert.equal(s.started(), 0);
  assert.equal(s.aborted(), 0);
  assert.deepEqual(s.clicks, []);
});

test("day action uses existing enabled button and refuses blocked day rollover", () => {
  const s = setup({dayActions: true});
  s.answer(s.listen(), "B");
  assert.deepEqual(s.clicks, ["B"]);
  s.answer(s.listen(), "C");
  assert.deepEqual(s.clicks, ["B"]);
});

test("a changing day action cannot be selected by a stale recognition result", () => {
  const s = setup({dayActions: true});
  const rec = s.listen();
  s.panel.querySelectorAll = selector => [];
  s.answer(rec, "A");
  assert.deepEqual(s.clicks, []);
});

test("inbox audio labels only existing canonical actions, not document work", () => {
  const start = source.indexOf("  function syncInboxAudio(");
  const end = source.indexOf("  /** @param {HTMLElement} panel @param {HTMLElement} target */", start);
  assert.ok(start > 0 && end > start);
  const buttons = ["Svar ja", "Svar nei"].map(textContent => {
    const attrs = new Map();
    return {textContent, getAttribute: name => attrs.get(name) ?? null,
      setAttribute: (name, value) => attrs.set(name, value), hasAttribute: name => attrs.has(name)};
  });
  let selectorUsed = "";
  let controls = false;
  const panel = {
    querySelector(selector) {
      if (selector === ".civi-next-action-card") return {};
      if (selector === "[data-lifestory-audio-controls]") return controls ? {} : null;
      return null;
    },
    insertAdjacentHTML() { controls = true; },
    querySelectorAll(selector) { selectorUsed = selector; return buttons; }
  };
  const context = {audioSupported: () => true, voiceConstructor: () => true,
    audioControlsHtml: () => "controls", audioChoiceLetter: i => "ABC"[i],
    inboxAudioPanel: null, audioOwner: null, audioEnabled: false};
  const sync = vm.runInNewContext("(function() {" + source.slice(start, end) + "; return syncInboxAudio; })()", context);
  sync(panel);
  sync(panel);
  assert.deepEqual(buttons.map(b => b.textContent), ["A. Svar ja", "B. Svar nei"]);
  assert.equal(buttons[1].getAttribute("data-lifestory-letter"), "B");
  assert.match(selectorUsed, /data-civi-next-action-answer/);
  assert.doesNotMatch(selectorUsed, /data-civi-next-action-task/);
});

test("inbox delegates actual responses to the existing mail engine", () => {
  const inbox = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationNextActionUI.js"), "utf8");
  assert.match(inbox, /CivicationAudio\?\.handleInboxAudioClick/);
  assert.match(inbox, /CivicationAudio\?\.syncInboxAudio/);
  assert.match(inbox, /CivicationMailEngine\.answerMail\(mailId, choiceId\)/);
});

test("voice cast prefers Norwegian voices, uses stable assignments and falls back safely", () => {
  const begin = source.indexOf("  function chooseStoryVoice(");
  const end = source.indexOf("  /** @param {HTMLElement} panel @param {HTMLElement} target */", begin);
  assert.ok(begin > 0 && end > begin);
  const pick = vm.runInNewContext("(function() {" + source.slice(begin, end) + "; return chooseStoryVoice; })()");
  const voices = [
    {lang:"en-US",voiceURI:"English",localService:true},
    {lang:"nb-NO",voiceURI:"A",localService:true},
    {lang:"nb-NO",voiceURI:"B",localService:true},
    {lang:"nn-NO",voiceURI:"C",localService:true}
  ];
  assert.equal(pick(voices, "").voiceURI, "A");
  const chosen = pick(voices, "kollega-1");
  assert.notEqual(chosen.voiceURI, "A");
  assert.equal(pick([...voices].reverse(), "kollega-1").voiceURI, chosen.voiceURI);
  assert.equal(pick([voices[1]], "kollega-1").voiceURI, "A");
  assert.equal(pick([voices[0]], "kollega-1"), null);
});
test("rate preference is applied to speech without changing game choices", () => {
  assert.match(source, /const AUDIO_RATES = \[0\.75, 0\.95, 1\.15, 1\.35\]/);
  assert.match(source, /utterance\.rate = AUDIO_RATES\[audioRateIndex\]/);
  assert.match(source, /utterance\.voice = voice/);
});
