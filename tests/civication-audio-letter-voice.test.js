const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
const start = source.indexOf("  /** @type {any} */ let voiceSession = null;");
const end = source.indexOf("  function audioControlsHtml()", start);
assert.ok(start > 0 && end > start);

function setup() {
  const clicks = [];
  const buttons = ["A", "B", "C"].map(letter => ({
    disabled: letter === "C",
    textContent: letter + ". Choice",
    hasAttribute(name) { return name === "disabled" && this.disabled; },
    getAttribute(name) {
      if (name === "data-lifestory-letter") return letter;
      if (name === "data-lifestory-scene") return "scene-1";
      if (name === "data-lifestory-choice") return letter;
      return null;
    },
    click() { clicks.push(letter); }
  }));
  const panel = { isConnected: true, getClientRects: () => [1],
    querySelectorAll: () => buttons, querySelector: () => null };
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
