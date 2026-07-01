// Verifies the interactive CBT-tool completion in Psykologrommet has a concrete
// player effect: it logs a session, adds insight points, and adds (anti-farmed)
// psychology competence via CivicationPsyche. Runs headless with a null-DOM stub
// and a fetch mock over the real data files (no jsdom needed).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

// --- fake localStorage ---
const store = new Map();
global.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};

// --- fake window / events ---
global.window = global;
global.Event = class { constructor(type) { this.type = type; } };
global.CustomEvent = class extends global.Event { constructor(type, init) { super(type); this.detail = init && init.detail; } };
global.dispatchEvent = () => true;
global.showToast = () => {};

// --- fake CivicationState backing CivicationPsyche ---
const civiState = {};
global.CivicationState = {
  getState: () => JSON.parse(JSON.stringify(civiState)),
  setState: (patch) => {
    const merge = (target, source) => {
      for (const [key, value] of Object.entries(source || {})) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          target[key] = merge(target[key] && typeof target[key] === 'object' ? target[key] : {}, value);
        } else {
          target[key] = value;
        }
      }
      return target;
    };
    merge(civiState, patch);
    return civiState;
  }
};

// --- null-DOM stub: swallows all rendering, so UI code runs without throwing ---
function stubNode() {
  return {
    innerHTML: '',
    value: '',
    dataset: {},
    style: {},
    elements: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    appendChild() {}, addEventListener() {}, removeEventListener() {},
    querySelector() { return stubNode(); }, querySelectorAll() { return []; },
    closest() { return null; }, focus() {}, click() {}, remove() {}
  };
}
global.document = {
  getElementById() { return stubNode(); },
  createElement() { return stubNode(); },
  querySelector() { return stubNode(); },
  querySelectorAll() { return []; },
  body: stubNode(),
  addEventListener() {},
  readyState: 'complete'
};

// --- fetch mock over the real repo data files ---
global.fetch = async (url) => {
  const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
  const full = path.resolve(repoRoot, clean);
  const body = await fs.promises.readFile(full, 'utf8');
  return { ok: true, status: 200, async json() { return JSON.parse(body); } };
};

// --- load engine + room ---
vm.runInThisContext(fs.readFileSync(path.join(repoRoot, 'js/Civication/core/CivicationPsyche.js'), 'utf8'), { filename: 'CivicationPsyche.js' });
vm.runInThisContext(fs.readFileSync(path.join(repoRoot, 'js/psychologyRoom.js'), 'utf8'), { filename: 'psychologyRoom.js' });

async function run() {
  assert.ok(window.PsychologyRoom, 'PsychologyRoom global should exist');
  assert.strictEqual(typeof window.PsychologyRoom.completeTool, 'function', 'completeTool should be exposed');

  // open() loads the data (via fetch mock) and renders into the null DOM.
  await window.PsychologyRoom.open();

  const toolId = 'tanke_fakta_v1';
  const before = Number(window.CivicationPsyche.getPsychologyCompetence());
  assert.strictEqual(before, 0, 'competence starts at 0');
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 0, 'no completions yet');

  // Empty answers must not complete the tool.
  const empty = window.PsychologyRoom.completeTool(toolId, { steps: [], reflections: [] });
  assert.strictEqual(empty.completed, false, 'empty worksheet does not complete');
  assert.strictEqual(empty.reason, 'empty');
  assert.strictEqual(Number(window.CivicationPsyche.getPsychologyCompetence()), 0, 'no competence from empty');

  // Filling the worksheet completes it and applies the concrete effect.
  const first = window.PsychologyRoom.completeTool(toolId, {
    steps: ['Jeg tenkte at alt går galt', 'Sjefen sa "kan vi ta en prat"', 'Antok at det var kritikk', 'Kanskje det bare er en oppdatering'],
    reflections: ['Jeg ble roligere', 'Lite søvn', 'Spørre hva praten gjelder']
  });
  assert.strictEqual(first.completed, true, 'filled worksheet completes');
  assert.ok(first.insight_points > 0, 'tool awards insight points');

  const afterFirst = Number(window.CivicationPsyche.getPsychologyCompetence());
  assert.ok(afterFirst > before, `completing a tool should add psychology competence (got ${afterFirst})`);
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 1, 'one tool session logged');

  const profile = window.PsychologyRoom.getProfile();
  assert.ok(profile.insight_points >= first.insight_points, 'insight points recorded on profile');

  // Anti-farming: a second completion of the SAME tool logs the session/insight
  // but does NOT grant psychology competence again.
  const second = window.PsychologyRoom.completeTool(toolId, { steps: ['igjen'], reflections: ['igjen'] });
  assert.strictEqual(second.completed, true);
  const afterSecond = Number(window.CivicationPsyche.getPsychologyCompetence());
  assert.strictEqual(afterSecond, afterFirst, 'competence is anti-farmed on repeat completion');
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 2, 'second session still logged');

  // Unknown tool id is handled.
  const unknown = window.PsychologyRoom.completeTool('does_not_exist', { steps: ['x'] });
  assert.strictEqual(unknown.completed, false);
  assert.strictEqual(unknown.reason, 'unknown_tool');

  console.log('civication-psychology-room-tools.test.js passed');
}

run().catch((error) => { console.error(error); process.exit(1); });
