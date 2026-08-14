#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const roleModel = read('data/Civication/roleModels/naeringsliv/avdelingsleder.json');
const plan = read('data/Civication/mailPlans/naeringsliv/avdelingsleder_plan.json');
const matrix = read('data/Civication/careerGameplayMatrix.json');

assert.deepStrictEqual(
  roleModel.related_places.map((place) => place.id),
  ['avdelingsgulv', 'teamrom_og_vaktplan', 'driftskontor', 'ledermoterom'],
  'Avdelingsleder must move through four concrete work surfaces'
);
for (const place of roleModel.related_places) {
  assert(place.name && place.function, `${place.id} must describe a named gameplay surface`);
}
assert(roleModel.career_path.possible_exits.length >= 4, 'Avdelingsleder must support voluntary and involuntary exits');

assert.deepStrictEqual(Object.keys(plan.outcome_rules), ['fired', 'promoted', 'stagnated']);
assert.strictEqual(plan.outcome_rules.fired.strikes_gte, 3);
assert.strictEqual(plan.outcome_rules.promoted.completion_ratio_gte, 1);
assert(plan.outcome_rules.stagnated.add_branch_flags.includes('department_leadership_stalled'));

global.window = global;
global.document = { readyState: 'complete', addEventListener() {} };
global.addEventListener = () => {};
global.dispatchEvent = () => {};
global.Event = class Event { constructor(type) { this.type = type; } };
global.CivicationState = {};
global.CivicationPsyche = {};
global.CivicationEventEngine = class CivicationEventEngine {};
global.CivicationMailRuntime = {};
vm.runInThisContext(
  fs.readFileSync(path.join(root, 'js/Civication/systems/civicationCareerOutcomeRuntime.js'), 'utf8'),
  { filename: 'js/Civication/systems/civicationCareerOutcomeRuntime.js' }
);

const runtime = {
  role_plan_id: plan.id,
  step_index: plan.sequence.length,
  history: plan.sequence.map((step) => ({ id: `step_${step.step}`, source_type: 'planned', choice_id: 'A' }))
};
const active = { career_id: 'naeringsliv', role_id: 'naer_avdelingsleder', role_key: 'avdelingsleder', title: 'Avdelingsleder' };
const decide = (performance) => global.CivicationCareerOutcomeRuntime.decideOutcome(active, plan, runtime, performance).status;
assert.strictEqual(decide({ score: 3, strikes: 0, warning_used: false, stability: 'STABLE' }), 'PROMOTED');
assert.strictEqual(decide({ score: 1, strikes: 0, warning_used: false, stability: 'STABLE' }), 'STAGNATED');
assert.strictEqual(decide({ score: 4, strikes: 3, warning_used: false, stability: 'STABLE' }), 'FIRED');

const world = matrix.worlds.find((item) => item.key === 'naeringsliv/avdelingsleder');
assert(world, 'Avdelingsleder work world must exist');
assert.strictEqual(world.status, 'playable', 'Avdelingsleder must remain a playable pilot');
assert.strictEqual(world.audit.runtime_gate, true);
assert.deepStrictEqual(world.audit.missing_components, []);
for (const component of ['places', 'performance', 'progression', 'exit']) {
  assert.strictEqual(world.audit.components[component].level, 'complete', `${component} must be complete`);
}

console.log('PASS: Avdelingsleder is a playable leadership world with concrete places and tested career outcomes.');
