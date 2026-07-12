#!/usr/bin/env node
// Life Story -> skallets psyke: énveis konsekvensbro.
// Verifiserer mappingen (integritet/synlighet/handlingsrom -> CivicationPsyche-
// deltaer), at umappede målere aldri skrives, at testmodus aldri skriver,
// at manglende psyke-motor er stille no-op, og at UI-en kaller broen etter
// applyChoice med faktiske deltaer.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const Bridge = require("../js/Civication/lifestory/lifestoryShellBridge.js");

function withMockPsyche(fn) {
  const calls = [];
  const mock = {
    updateIntegrity: (d) => calls.push(["integrity", d]),
    updateVisibility: (d) => calls.push(["visibility", d]),
    updateEconomicRoom: (d) => calls.push(["economicRoom", d])
  };
  globalThis.CivicationPsyche = mock;
  try { return fn(calls); } finally { delete globalThis.CivicationPsyche; }
}

// --- 1. Mapping: kun 1:1-målere broes, med riktige deltaer ---
withMockPsyche((calls) => {
  const result = Bridge.applyMeterDeltasToShell({
    integritet: 5, synlighet: -3, handlingsrom: 2,
    psyke: 4, energi: -6, penger: -40 // skal IKKE broes
  });
  assert.deepStrictEqual(result.applied, { integritet: 5, synlighet: -3, handlingsrom: 2 });
  assert.strictEqual(result.skipped, null);
  assert.deepStrictEqual(calls.sort(), [
    ["economicRoom", 2], ["integrity", 5], ["visibility", -3]
  ].sort());
});

// --- 2. Nulldeltaer og ugyldige verdier skrives aldri ---
withMockPsyche((calls) => {
  const result = Bridge.applyMeterDeltasToShell({ integritet: 0, synlighet: NaN, handlingsrom: "x" });
  assert.deepStrictEqual(result.applied, {});
  assert.strictEqual(calls.length, 0, "ingen psyke-kall for null/ugyldige deltaer");
});

// --- 3. Testmodus skriver ALDRI (test er fullt isolert) ---
withMockPsyche((calls) => {
  globalThis.CIVICATION_TEST_MODE = true;
  try {
    const result = Bridge.applyMeterDeltasToShell({ integritet: 5 });
    assert.strictEqual(result.skipped, "test_mode");
    assert.strictEqual(calls.length, 0, "testmodus skal aldri skrive psyke");
  } finally { delete globalThis.CIVICATION_TEST_MODE; }
});
withMockPsyche((calls) => {
  globalThis.CivicationState = { getActivePosition: () => ({ is_test_session: true }) };
  try {
    const result = Bridge.applyMeterDeltasToShell({ integritet: 5 });
    assert.strictEqual(result.skipped, "test_mode", "test-startet rolle (is_test_session) skriver aldri");
    assert.strictEqual(calls.length, 0);
  } finally { delete globalThis.CivicationState; }
});

// --- 4. Uten psyke-motor (ren Min dag-flate): stille no-op ---
{
  const result = Bridge.applyMeterDeltasToShell({ integritet: 5 });
  assert.strictEqual(result.skipped, "psyche_unavailable");
  assert.deepStrictEqual(result.applied, {});
}

// --- 5. Én psyke-akse som kaster stopper ikke de andre ---
{
  const calls = [];
  globalThis.CivicationPsyche = {
    updateIntegrity: () => { throw new Error("boom"); },
    updateVisibility: (d) => calls.push(["visibility", d]),
    updateEconomicRoom: (d) => calls.push(["economicRoom", d])
  };
  try {
    const result = Bridge.applyMeterDeltasToShell({ integritet: 5, synlighet: 3, handlingsrom: 1 });
    assert.deepStrictEqual(result.applied, { synlighet: 3, handlingsrom: 1 });
    assert.strictEqual(calls.length, 2, "de andre aksene skrives selv om én kaster");
  } finally { delete globalThis.CivicationPsyche; }
}

// --- 6. UI-kontrakten: onChoose kaller broen med faktiske deltaer ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes("CivicationLifestoryShellBridge?.applyMeterDeltasToShell"),
  "Min dag-UI-en skal kalle broen etter applyChoice");
const applyIdx = uiSource.indexOf("Runner.applyChoice(state, content, sceneId, choiceId)");
const bridgeIdx = uiSource.indexOf("applyMeterDeltasToShell");
assert.ok(applyIdx !== -1 && bridgeIdx > applyIdx,
  "broen kalles ETTER applyChoice (faktiske, clampede deltaer)");

// --- 7. Statisk kjede: broen lastes av Civication.html før UI-en ---
const html = fs.readFileSync(path.join(ROOT, "Civication.html"), "utf8");
const bridgeTag = html.indexOf("js/Civication/lifestory/lifestoryShellBridge.js");
const uiTag = html.indexOf("js/Civication/ui/CivicationLifestoryUI.js");
assert.ok(bridgeTag !== -1 && uiTag !== -1 && bridgeTag < uiTag,
  "lifestoryShellBridge.js skal lastes før CivicationLifestoryUI.js");

console.log("civication lifestory shell psyche bridge ok (mapping, testmodus-gate, no-op uten skall)");
