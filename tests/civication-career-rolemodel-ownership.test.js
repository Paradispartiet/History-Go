'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));

const auditSource = read('scripts/audit-civication-career-gameplay.mjs');
const model = readJson('data/Civication/roleModels/naeringsliv/fagarbeider.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const bridge = read('js/Civication/mailPlanBridge.js');
const report = read('reports/civication-career-gameplay-matrix.md');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');

assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'fagarbeider');
assert.equal(model.title, 'Fagarbeider');
assert.equal(mappings.careers?.naeringsliv?.roles?.arbeider?.role_type, 'gulv_og_drift');
assert.equal(mappings.careers?.naeringsliv?.roles?.fagarbeider?.role_type, 'fag_og_kvalitet');
assert.equal(mappings.careers?.naeringsliv?.title_to_role_scope?.Fagarbeider, 'fagarbeider');
assert.notEqual(mappings.careers?.naeringsliv?.roles?.arbeider?.role_id, mappings.careers?.naeringsliv?.roles?.fagarbeider?.role_id);

assert.ok(bridge.includes('arbeider: "data/Civication/mailPlans/naeringsliv/arbeider_plan.json"'));
assert.ok(bridge.includes('fagarbeider: "data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json"'));
assert.ok(!auditSource.includes("['naeringsliv/fagarbeider', 'arbeider']"), 'Career audit must not loan the Fagarbeider role model to Arbeider');

const rows = report.split(/\r?\n/).filter((line) => line.startsWith('| naeringsliv | '));
const parse = (line) => line.split('|').slice(1, -1).map((cell) => cell.trim());
const fagarbeider = parse(rows.find((line) => line.startsWith('| naeringsliv | fagarbeider |')) || '');
const arbeiderWorld = matrix.worlds.find((world) => world.key === 'naeringsliv/arbeider');
const arbeiderExclusion = (matrix.noncareer_worlds || []).find((world) => world.key === 'naeringsliv/arbeider');
assert.ok(arbeiderWorld, 'Arbeider remains discoverable as canonical-category content');
assert.equal(arbeiderWorld.status, 'not_applicable', 'Arbeider must not inherit a fabricated career status');
assert.deepEqual(arbeiderWorld.artifacts.role_models, [], 'Arbeider must not receive Fagarbeider roleModel evidence');
assert.ok(arbeiderExclusion, 'Arbeider must be explicitly career-excluded after ownership reconciliation');
assert.equal(arbeiderExclusion.classification, 'unbound_legacy_role');
assert.ok(!rows.some((line) => line.startsWith('| naeringsliv | arbeider |')), 'Arbeider must not remain in the career rollout table');
assert.equal(fagarbeider[1], 'fagarbeider');
assert.equal(fagarbeider[4], 'ja', 'Fagarbeider must own its own roleModel evidence');

console.log('✓ Arbeider and Fagarbeider have distinct canonical roleModel ownership');
