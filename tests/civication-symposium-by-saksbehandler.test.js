#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readText = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = rel => JSON.parse(readText(rel));
const profilePath = 'docs/civication-symposium/by-saksbehandler.md';
const profile = readText(profilePath);
const index = readText('docs/CIVICATION_JOBBGRUNNLAG.md');
const planner = readText('docs/civication-symposium/arealplanlegger.md');
const grammar = readJson('data/Civication/workGrammars/by/by_saksbehandler.json');
const world = readJson('data/Civication/roleWorlds/by/by_saksbehandler.json');
const role = readJson('data/Civication/roles/by_saksbehandler.json');
const model = readJson('data/Civication/roleModels/by/by_saksbehandler.json');
const plan = readJson('data/Civication/mailPlans/by/by_saksbehandler_plan.json');

for (const data of [grammar, world, model, plan]) {
  assert.equal(data.role_scope, 'by_saksbehandler', 'one canonical role scope across the existing production layers');
}
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14, 'documentation does not invent an extra season');
assert.equal(role.role_id, 'by_saksbehandler');
assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.equal(grammar.practice_stories.length, 5, 'use existing tasks instead of inventing new cases');

for (const task of grammar.practice_stories) {
  assert.match(task.id, /^s[1-5]$/);
  assert.ok(profile.includes('**' + task.id + ':'), 'canonical work story is indexed in source-based task matrix: ' + task.id);
}
assert.equal((profile.match(/\| \*\*s[1-5]:/g) || []).length, 5, 'all five situations appear in the profile exactly once');

for (const section of [
  'Rolle, oppdrag og beslutningsmyndighet',
  'Ordliste: synonymer, nabotitler, fag og dokumenter',
  'Verktøy, klær, steder og dokumentkrav',
  'Klasse, arbeidsvilkår, frister og makt',
  'Arbeidsmatrise: fem etablerte praksisfortellinger',
  'Hendelser, konflikt og realistiske valg',
  'Dokumentnett, rollegrense og kontinuitet'
]) assert.ok(profile.includes('## ' + section), 'missing required practical Symposium layer: ' + section);

assert.ok(index.includes('(civication-symposium/by-saksbehandler.md)'), 'new profile registered in the established Symposium index');
assert.ok(planner.includes('(by-saksbehandler.md)'), 'cross-role reference must be bidirectional');
assert.match(profile, /Lillebekks eksisterende plansak|Lillebekk-plansaken/, 'canonical planning case remains owned by plan adviser');
assert.match(profile, /by_radgiver_plan/, 'planning and caseworker authority scopes must stay distinct');
assert.match(profile, /ikke.*vedtak|ikke.*avgjørelse|fiktivt vedtak/i, 'cannot claim an unrecorded formal decision');

const sourceDomains = ['www.dibk.no', 'www.regjeringen.no'];
for (const domain of sourceDomains) assert.ok(profile.includes('https://' + domain + '/'), 'source class missing: ' + domain);
assert.ok((profile.match(/https:\/\/www\.dibk\.no\//g) || []).length >= 6, 'procedural claims should be traceable to primary regulatory guidance');

const localRefs = [...profile.matchAll(/\]\((\.\.\/[^)#]+)\)/g)].map(match => match[1]);
assert.ok(localRefs.length >= 8, 'profile must bind to existing role, world, plan and Symposium sources');
for (const href of localRefs) {
  const resolved = path.resolve(root, 'docs/civication-symposium', href);
  assert.ok(fs.existsSync(resolved), 'broken local source reference: ' + href);
}

console.log('Civication Symposium by_saksbehandler: role, five practices, sources, mandate and links verified');
