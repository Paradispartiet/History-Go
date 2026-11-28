const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
const start = source.indexOf("  /** @type {any} */ let voiceSession = null;");
const end = source.indexOf("  function audioControlsHtml(", start);
assert.ok(start > 0 && end > start);

function setup({ dayActions = false, navigation = [] } = {}) {
  const clicks = [];
  const buttons = ["A", "B", "C"].map(letter => ({
    disabled: letter === "C",
    textContent: letter + ". Choice",
    hasAttribute(name) { return (name === "disabled" && this.disabled) || navigation.some(n => n.letter === letter && n.attribute === name); },
    getAttribute(name) {
      if (name === "data-lifestory-letter") return letter;
      if (name === "data-lifestory-audio-label") return navigation.find(n => n.letter === letter)?.label || null;
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
    audioEnabled: true, audioKey: "active", readStoryAudio() { repeated++; }
  };
  const api = vm.runInNewContext("(function() {" + source.slice(start, end) +
    "; return {parseVoiceCommand, audioChoiceLetter, startVoiceInput, openHandsFreeAfterSpeech, voiceSceneKey, setHandsFree: value => { handsFreeEnabled = value; }}; })()", context);
  function listen() { api.startVoiceInput(panel); return recognition; }
  function answer(rec, ...words) {
    const result = words.map(transcript => ({transcript}));
    result.isFinal = true;
    rec.onresult({results: [result], resultIndex: 0});
  }
  return { api, listen, answer, clicks, state, panel, repeated: () => repeated, aborted: () => aborted, started: () => started, audioEnabled: () => context.audioEnabled };
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
    inboxAudioPanel: null, audioOwner: null, audioEnabled: false, pendingInboxAudio: null};
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

test("ambience uses known scene or calendar context, not invented weather", () => {
  const begin = source.indexOf("  function atmosphereProfile(");
  const end = source.indexOf("  function stopAtmosphere()", begin);
  assert.ok(begin > 0 && end > begin);
  const profile = vm.runInNewContext("(function() {" + source.slice(begin, end) + "; return atmosphereProfile; })()");
  assert.equal(profile("morgen", "").name, "Morgen");
  assert.equal(profile("natt", "").name, "Natt");
  assert.equal(profile("dag", "kafe").name, "Kafé");
  assert.equal(profile("dag", "kontor").name, "Arbeidsmiljø");
  assert.equal(profile("dag", "ukjent").name, "Dag");
});
test("environment sound is opt-in and stops before listening", () => {
  assert.match(source, /let atmosphereEnabled = false/);
  assert.match(source, /function stopStoryAudio\(\) \{\s*stopAtmosphere\(\)/);
  const begin = source.indexOf("  function startVoiceInput(");
  const end = source.indexOf("  const AUDIO_RATES", begin);
  const voiceCode = source.slice(begin, end);
  assert.ok(voiceCode.indexOf("stopStoryAudio();") < voiceCode.indexOf("recognition.start();"));
  assert.match(source, /if \(index >= segments.length\) \{\s*stopAtmosphere\(\)/);
});


test("explicit inbox handoff survives delayed mail loading but not cancellation or a new audio session", () => {
  const start = source.indexOf("  function syncInboxAudio(");
  const end = source.indexOf("  // Popup dismissal", start);
  const code = source.slice(start, end);
  for (const variant of ["normal", "close", "new-session", "hidden", "expired", "no-opt-in"]) {
    let ready = false;
    let visible = true;
    let played = 0;
    let now = 100;
    const panel = {
      querySelector(selector) {
        if (selector === ".civi-next-action-card") return ready ? {} : null;
        if (selector === "[data-lifestory-audio-controls]") return {};
        return null;
      },
      querySelectorAll() { return []; }
    };
    const context = {
      audioSupported: () => true, voiceConstructor: () => true,
      inboxAudioPanel: null, audioOwner: null, pendingInboxAudio: null,
      audioEnabled: variant !== "no-opt-in", voiceSession: null, audioGeneration: 5,
      audioKey: "", handsFreeEnabled: true,
      Date: { now: () => now }, voiceSurfaceActive: () => visible,
      stopVoiceInput() {}, stopStoryAudio() { context.audioGeneration++; },
      updateAudioControls() {}, syncAudioActions() { played++; }
    };
    const api = vm.runInNewContext("(function() {" + code + "; return {syncInboxAudio, closeInboxAudio}; })()", context);
    api.syncInboxAudio(panel, true);
    assert.equal(played, 0);
    if (variant === "close") api.closeInboxAudio();
    if (variant === "new-session") context.audioGeneration++;
    if (variant === "hidden") visible = false;
    if (variant === "expired") now += 16000;
    ready = true;
    api.syncInboxAudio(panel);
    assert.equal(played, variant === "normal" ? 1 : 0, variant);
    assert.equal(context.pendingInboxAudio, null, variant);
  }
});


test("spoken calendar markers follow the actual day, authored phase and role", () => {
  const start = source.indexOf("  function audioDayPhase(");
  const end = source.indexOf("  /** @param {HTMLElement} panel @param {boolean} [force] */", start);
  assert.ok(start > 0 && end > start);
  const marker = vm.runInNewContext("(function() {" + source.slice(start, end) + "; return audioDayPhase; })()");
  const morning = marker(7, "Morgen", "worker", false);
  assert.equal(morning.text, "Dag 7. Morgen.");
  assert.equal(marker(7, "Morgen", "worker", false).key, morning.key);
  assert.notEqual(marker(7, "Dag", "worker", false).key, morning.key);
  assert.notEqual(marker(8, "Morgen", "worker", false).key, morning.key);
  assert.notEqual(marker(7, "Morgen", "student", false).key, morning.key);
  assert.equal(marker(7, "Kveld", "worker", true).text, "Dag 7. Dagens oppsummering.");
  assert.equal(marker(0, "Morgen", "worker", false), null);
  assert.equal(marker(7, "", "worker", false), null);
  assert.match(source, /force \|\| marker\.key !== narratedDayPhaseKey/);
  assert.match(source, /if \(marker && segment === markerSegment\) narratedDayPhaseKey = marker\.key/);
});


test("navigation commands click only unique matching enabled existing actions", () => {
  const navigation = [
    {letter:"A", attribute:"data-lifestory-advance", label:"Fortsett dagen"},
    {letter:"B", attribute:"data-lifestory-next-day", label:"Start neste dag"},
    {letter:"C", attribute:"data-lifestory-next-action", label:"Åpne innboksen"}
  ];
  for (const [words, expected] of [["fortsett",["A"]],["neste dag",["B"]],["åpne innboksen",[]]]) {
    const s = setup({dayActions:true,navigation});
    s.answer(s.listen(), words);
    assert.deepEqual(s.clicks, expected);
  }
  const other = setup({dayActions:true,navigation:[{letter:"B",attribute:"data-lifestory-next-day",label:"Fortsett privatlivet"}]});
  other.answer(other.listen(), "neste dag");
  assert.deepEqual(other.clicks, []);
  const ambiguous = setup({dayActions:true,navigation});
  ambiguous.answer(ambiguous.listen(), "fortsett", "neste dag");
  assert.deepEqual(ambiguous.clicks, []);
  const duplicate = setup({dayActions:true,navigation:[{letter:"A",attribute:"data-lifestory-advance",label:"Fortsett dagen"},{letter:"B",attribute:"data-lifestory-advance",label:"Fortsett dagen"}]});
  duplicate.answer(duplicate.listen(),"fortsett");
  assert.deepEqual(duplicate.clicks, []);
  const scene = setup();
  scene.answer(scene.listen(),"fortsett");
  assert.deepEqual(scene.clicks, []);
});

test("pause disables narration and hands-free without choosing", () => {
  const s = setup();
  s.api.setHandsFree(true);
  s.answer(s.listen(), "pause");
  assert.equal(s.audioEnabled(), false);
  assert.deepEqual(s.clicks, []);
  s.api.openHandsFreeAfterSpeech(s.panel, s.api.voiceSceneKey(s.panel));
  assert.equal(s.started(), 1);
});


test("dedicated player keeps primary controls and microphone status distinct", () => {
  const begin = source.indexOf("  function audioControlsHtml(");
  const end = source.indexOf("  /** @param {HTMLElement} panel @param {string} [message] */", begin);
  const render = vm.runInNewContext("(function() {" + source.slice(begin, end) + "; return audioControlsHtml; })()", {
    audioSupported: () => true, voiceConstructor: () => true, atmosphereConstructor: () => true,
    audioEnabled: true, voiceSession: {}, handsFreeEnabled: true, voiceMessage: "Lytter",
    AUDIO_RATES: [0.95], audioRateIndex: 0, audioCastEnabled: true, atmosphereEnabled: false,
    atmosphereLevel: 1, escapeHtml: value => value
  });
  const html = render();
  assert.match(html, /<section class="civi-audio-player"/);
  assert.match(html, /data-lifestory-player-state>Mikrofon på/);
  assert.match(html, /data-lifestory-voice aria-pressed="true"/);
  assert.ok(html.indexOf("civi-audio-primary") < html.indexOf("civi-audio-settings"));
  assert.ok(html.includes("data-lifestory-voice-status"));
  assert.match(html, /opptil 12 sekunder/);
});


test("listening focus is reversible, view-only and retains a visible exit", () => {
  const start = source.indexOf("  function toggleListeningFocus(");
  const end = source.indexOf("  /** @param {HTMLElement} panel @param {string} [message] */", start);
  assert.ok(start > 0 && end > start);
  const toggle = vm.runInNewContext("(function() {" + source.slice(start, end) + "; return toggleListeningFocus; })()");
  const attributes = new Map();
  const button = {textContent:"Lyttemodus", setAttribute(name,value){ attributes.set(name,value); }};
  const panel = {querySelector: () => button, getAttribute: name => attributes.get(name), setAttribute: (name,value) => attributes.set(name,value)};
  toggle(panel);
  assert.equal(attributes.get("data-lifestory-listening"),"true");
  assert.equal(attributes.get("aria-pressed"),"true");
  assert.equal(button.textContent,"Vis hele Min dag");
  toggle(panel);
  assert.equal(attributes.get("data-lifestory-listening"),"false");
  assert.equal(button.textContent,"Lyttemodus");
  assert.match(source,/audioControlsHtml\(true, panel\.getAttribute\?\.\("data-lifestory-listening"\) === "true"\)/);
  const css = fs.readFileSync(path.join(__dirname,"../css/civi.css"),"utf8");
  assert.match(css,/\[data-lifestory-listening="true"\] > \.civi-lifestory-panels,/);
  assert.doesNotMatch(css,/\[data-lifestory-listening="true"\][^{}]*\.civi-lifestory-choice[^{}]*\{[^}]*display:\s*none/);
});


test("audio preferences restore only bounded presentation settings", () => {
  const start = source.indexOf("  const AUDIO_PREFS_KEY = ");
  const end = source.indexOf("  function atmosphereConstructor()", start);
  assert.ok(start > 0 && end > start);
  const stored = [];
  const context = { AUDIO_RATES: [0.75,0.95,1.15,1.35], ATMOSPHERE_LEVELS:[0.018,0.032,0.05],
    audioRateIndex:1,audioCastEnabled:true,atmosphereLevel:1, audioEnabled:false,handsFreeEnabled:false,
    window: {localStorage:{getItem:()=>JSON.stringify({version:1,rate:3,cast:false,level:2,audioEnabled:true,handsFreeEnabled:true}),setItem:(key,value)=>stored.push([key,JSON.parse(value)])}}
  };
  const api = vm.runInNewContext("(function() {" + source.slice(start,end) + "; return {parseAudioPreferences,saveAudioPreferences}; })()", context);
  assert.equal(context.audioRateIndex,3);
  assert.equal(context.audioCastEnabled,false);
  assert.equal(context.atmosphereLevel,2);
  assert.equal(context.audioEnabled,false);
  assert.equal(context.handsFreeEnabled,false);
  assert.equal(api.parseAudioPreferences("not json"),null);
  assert.equal(api.parseAudioPreferences('{"version":2}'),null);
  const defaults = api.parseAudioPreferences('{"version":1,"rate":-1,"cast":"false","level":99}');
  assert.equal(defaults.rate,1);
  assert.equal(defaults.cast,true);
  assert.equal(defaults.level,1);
  api.saveAudioPreferences();
  assert.deepEqual(stored,[["civication.audio.preferences.v1",{version:1,rate:3,cast:false,level:2}]]);
});
