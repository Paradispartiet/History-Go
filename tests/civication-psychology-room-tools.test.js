// Psykologrommet stores reflection locally without automatically changing
// Civication Psyke's gameplay competence. Civication's own engine tests remain
// separate. Runs headless over the real data files (no jsdom needed).
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

  // Filling the worksheet logs a local reflection without altering game state.
  const first = window.PsychologyRoom.completeTool(toolId, {
    steps: ['Jeg tenkte at alt går galt', 'Sjefen sa "kan vi ta en prat"', 'Antok at det var kritikk', 'Kanskje det bare er en oppdatering'],
    reflections: ['Jeg ble roligere', 'Lite søvn', 'Spørre hva praten gjelder']
  });
  assert.strictEqual(first.completed, true, 'filled worksheet completes');
  assert.ok(first.insight_points > 0, 'tool awards insight points');

  const afterFirst = Number(window.CivicationPsyche.getPsychologyCompetence());
  assert.strictEqual(afterFirst, before, 'completing a reflection tool does not award Civication competence');
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 1, 'one tool session logged');

  const profile = window.PsychologyRoom.getProfile();
  assert.ok(profile.insight_points >= first.insight_points, 'insight points recorded on profile');

  // A second completion logs local activity without affecting Civication.
  const second = window.PsychologyRoom.completeTool(toolId, { steps: ['igjen'], reflections: ['igjen'] });
  assert.strictEqual(second.completed, true);
  const afterSecond = Number(window.CivicationPsyche.getPsychologyCompetence());
  assert.strictEqual(afterSecond, before, 'neither first nor repeated reflection changes game competence');
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 2, 'second session still logged');

  // Structured first-person reflections are voluntary, local and non-diagnostic.
  assert.strictEqual(typeof window.PsychologyRoom.saveWorkbench, 'function');
  const emptySituation = window.PsychologyRoom.saveWorkbench({ thoughts: 'Jeg utsetter' });
  assert.strictEqual(emptySituation.saved, false);
  assert.strictEqual(emptySituation.reason, 'situation_required');
  const work = window.PsychologyRoom.saveWorkbench({
    situation: 'Jeg utsatte en arbeidsoppgave i går.',
    thoughts: 'Dette blir vanskelig.',
    feelings: 'Uro',
    body: 'Stram i skuldrene',
    actions: 'La oppgaven bort',
    next_step: 'Prøve fem minutter'
  });
  assert.strictEqual(work.saved, true);
  assert.strictEqual(window.PsychologyRoom.getWorkbenchEntries().length, 1);
  assert.strictEqual(window.PsychologyRoom.getWorkbenchEntries()[0].situation, 'Jeg utsatte en arbeidsoppgave i går.');
  assert.strictEqual(Number(window.CivicationPsyche.getPsychologyCompetence()), before,
    'saving personal reflections never changes Civication competence');
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 2,
    'workbench reflections are not disguised tool completions');


  // A previous situation can receive multiple experiences without rewriting it.
  assert.strictEqual(typeof window.PsychologyRoom.saveWorkbenchFollowUp, 'function');
  assert.strictEqual(window.PsychologyRoom.saveWorkbenchFollowUp(work.entry.id, {}).reason, 'required_fields');
  assert.strictEqual(window.PsychologyRoom.saveWorkbenchFollowUp('missing-note', {
    tried: 'Test', outcome: 'Test'
  }).reason, 'not_found');
  const followed = window.PsychologyRoom.saveWorkbenchFollowUp(work.entry.id, {
    tried: 'Jeg jobbet med oppgaven i fem minutter',
    outcome: 'Jeg fikk begynt',
    new_view: 'Oppgaven var mer håndterlig enn jeg trodde',
    next_step: 'Fortsette i morgen'
  });
  assert.strictEqual(followed.saved, true);
  assert.strictEqual(window.PsychologyRoom.getWorkbenchEntries().length, 1, 'follow-up updates same note');
  assert.strictEqual(window.PsychologyRoom.getWorkbenchEntries()[0].thoughts, 'Dette blir vanskelig.',
    'original reflection is untouched');
  assert.strictEqual(window.PsychologyRoom.getWorkbenchEntries()[0].follow_ups.length, 1);
  const again = window.PsychologyRoom.saveWorkbenchFollowUp(work.entry.id, {
    tried: 'Nytt forsøk', outcome: 'Ny erfaring'
  });
  assert.strictEqual(again.saved, true);
  assert.strictEqual(window.PsychologyRoom.getWorkbenchEntries()[0].follow_ups.length, 2,
    'history of experiences is preserved');
  assert.strictEqual(window.PsychologyRoom.getToolCompletions(toolId).length, 2,
    'follow-ups do not complete tools');
  assert.strictEqual(Number(window.CivicationPsyche.getPsychologyCompetence()), before,
    'follow-ups never increase Civication competence');
  assert.strictEqual(window.PsychologyRoom.getProfile().completed_sessions, profile.completed_sessions,
    'follow-ups do not grant sessions or insight points');

  // Unknown tool id is handled.
  const unknown = window.PsychologyRoom.completeTool('does_not_exist', { steps: ['x'] });
  assert.strictEqual(unknown.completed, false);
  assert.strictEqual(unknown.reason, 'unknown_tool');

  console.log('civication-psychology-room-tools.test.js passed');
}

run().catch((error) => { console.error(error); process.exit(1); });
