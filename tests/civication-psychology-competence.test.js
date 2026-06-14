const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const store = new Map();
const listeners = [];
const state = {};

global.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};
global.window = global;
global.document = { addEventListener() {}, readyState: 'complete' };
global.Event = class { constructor(type) { this.type = type; } };
global.CustomEvent = class extends Event { constructor(type, init) { super(type); this.detail = init && init.detail; } };
global.dispatchEvent = (event) => { listeners.push(event); return true; };
global.showToast = () => {};
global.CivicationState = {
  getState: () => JSON.parse(JSON.stringify(state)),
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
    merge(state, patch);
    return state;
  }
};

vm.runInThisContext(fs.readFileSync('js/Civication/core/CivicationPsyche.js', 'utf8'), { filename: 'CivicationPsyche.js' });

let result = CivicationPsyche.addPsychologyCompetence({ type: 'screening', sourceId: 'stress_test', title: 'Stress' }, 10);
assert.strictEqual(result.awarded, true);
assert.strictEqual(result.delta, 5);
assert.strictEqual(CivicationPsyche.getPsychologyCompetence(), 5);

result = CivicationPsyche.addPsychologyCompetence({ type: 'screening', sourceId: 'stress_test', title: 'Stress' }, 10);
assert.strictEqual(result.awarded, false);
assert.strictEqual(result.delta, 0);
assert.strictEqual(CivicationPsyche.getPsychologyCompetence(), 5);

state.player.competence.psychology = 80;
const negative = CivicationPsyche.applyPsycheResilienceModifier(-10, state, { metric: 'integrity' });
assert.strictEqual(negative.applied, true);
assert.ok(negative.adjustedDelta > -10, 'negative delta should be dampened');
assert.ok(negative.adjustedDelta < 0, 'negative delta should not be fully prevented');
assert.strictEqual(negative.message, 'Psykologisk kompetanse dempet belastningen.');

const positive = CivicationPsyche.applyPsycheResilienceModifier(10, state, { metric: 'integrity' });
assert.strictEqual(positive.applied, false);
assert.strictEqual(positive.adjustedDelta, 10);

console.log('civication psychology competence tests passed');
