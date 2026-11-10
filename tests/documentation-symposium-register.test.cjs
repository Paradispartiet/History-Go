#!/usr/bin/env node
'use strict';

// Documentation inventory only. Do NOT place in civication-*.test.js: that
// makes unrelated role names count as proof of career gameplay completion.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const md = read('docs/CIVICATION_SYMPOSIUM_PROFILE_COVERAGE.md');
const index = read('docs/CIVICATION_JOBBGRUNNLAG.md');

const modelManifest = json('data/Civication/roleModels/manifest.json');
const worlds = json('data/Civication/roleWorlds/index.json');
const packs = json('data/Civication/rolePackIndex.json');
const life = json('data/Civication/lifestory/manifest.json');
const positions = json('data/Civication/lifePositionRoleWorldReadiness.json');
const synopsis = json('data/Civication/lifestory/editorial/storyInspirationCoverageV1.json');
const livelihoods = json('data/Civication/livelihoodCatalog.json');
const taxonomy = json('data/Civication/nonCareerRoleTaxonomy.json');

function section(start, end) {
  const begin = md.indexOf(start);
  assert.ok(begin >= 0, 'missing section ' + start);
  const next = end ? md.indexOf(end, begin + start.length) : -1;
  assert.ok(!end || next > begin, 'missing section boundary ' + end);
  return md.slice(begin + start.length, next === -1 ? undefined : next);
}
function rowHas(block, key) {
  return block.split('\n').some(line => line.startsWith('| `' + key + '` |'));
}

const roleBlock = section('## Registrerte oppføringer\n');
const rows = new Map();
let category = '';
for (const line of roleBlock.split('\n')) {
  const h = line.match(/^### (\S+)$/);
  if (h) { category = h[1]; continue; }
  const m = line.match(/^\| `([^`]+)` \|/);
  if (!m) continue;
  assert.ok(category, 'role appears inside a known category');
  const key = category + '/' + m[1];
  assert.ok(!rows.has(key), 'duplicate role key ' + key);
  rows.set(key, line);
}
assert.ok(rows.size >= 446, 'all model/world, system and role-pack identities indexed');

for (const rel of modelManifest.files) {
  assert.ok(fs.existsSync(path.join(ROOT, rel)), 'manifest model missing ' + rel);
  assert.ok(roleBlock.includes('](../' + rel + ')'), 'role-model file not represented in register ' + rel);
}
for (const row of worlds.roles) {
  assert.ok(rows.has(row.category + '/' + row.role_scope), 'world role scope missing ' + row.category + '/' + row.role_scope);
  assert.ok(roleBlock.includes('](../' + row.path + ')'), 'world file missing ' + row.path);
}
for (const row of packs.roles) {
  assert.ok(rows.has(row.category + '/' + row.role_scope), 'role pack not listed ' + row.category + '/' + row.role_scope);
}

// A document with a source profile is not automatically a playable job.
const profiles = fs.readdirSync(path.join(ROOT, 'docs/civication-symposium'))
  .filter(name => name.endsWith('.md'));
const documented = [...rows.values()].filter(line => line.includes('[Profil]('));
assert.ok(documented.length >= 10);
for (const file of profiles) {
  const link = '(civication-symposium/' + file + ')';
  assert.ok(index.includes(link), 'Symposium profile missing from main index ' + file);
  assert.ok(md.includes('[Profil]' + link), 'Symposium role/profile link missing ' + file);
}

// These layers are separate: career scope, voluntary life position, Life
// Story narrative, editorial synopsis, and livelihood are not synonyms.
const lifeBlock = section('## Life Stories – alle 15 aktive rollespor', '## Livsposisjoner');
for (const [name, item] of Object.entries(life.roles)) {
  assert.ok(rowHas(lifeBlock, name), 'Life Story track not indexed ' + name);
  for (const source of [item.role, item.threads, item.scenes].filter(Boolean))
    assert.ok(lifeBlock.includes('](../' + source + ')'), 'Life Story source not linked ' + source);
}
assert.equal(Object.keys(life.roles).length, 15);

const positionsBlock = section('## Livsposisjoner – alle 199 kanoniske valg', '## Leveveier');
assert.equal(positions.positions.length, taxonomy.canonical_counts.selectable_life_positions_total);
const foundPositions = new Set();
for (const line of positionsBlock.split('\n')) {
  const m = line.match(/^\| `([^`]+)` \|/);
  if (!m) continue;
  assert.ok(!foundPositions.has(m[1]), 'duplicate life-position key ' + m[1]);
  foundPositions.add(m[1]);
}
assert.equal(foundPositions.size, positions.positions.length, 'no omitted or extra life positions');
for (const item of positions.positions) {
  assert.ok(foundPositions.has(item.key), 'missing life position ' + item.key);
  assert.ok(['ready', 'not_a_standalone_world'].includes(item.classification));
  if (item.classification === 'ready') {
    assert.ok(item.role_world_path && fs.existsSync(path.join(ROOT, item.role_world_path)),
      'ready life-position must bind to an existing world ' + item.key);
  } else {
    assert.ok(!item.role_world_path, 'non-standalone identity must not invent a world ' + item.key);
  }
}
assert.equal(positions.positions.filter(x => x.classification === 'ready').length, 159);
assert.equal(positions.positions.filter(x => x.classification === 'not_a_standalone_world').length, 40);

const synopsisBlock = section('## Roller og relasjoner i synopsisene', '## Life Stories');
assert.equal(synopsis.entries.length, 24);
for (const entry of synopsis.entries) {
  assert.ok(synopsisBlock.includes('[' + entry.id + ' '), 'missing editorial synopsis ' + entry.id);
  assert.ok(!entry.story_status || entry.story_status === 'editorial_synopsis_not_playable',
    'source must not promote an editorial inspiration to playable history');
}

const livelihoodBlock = section('## Leveveier – ni økonomiske kontekster', '## Registergrenser');
for (const item of livelihoods.kinds) {
  assert.ok(rowHas(livelihoodBlock, item.id), 'livelihood context absent ' + item.id);
}
assert.equal(livelihoods.kinds.length, 9);
assert.match(livelihoodBlock, /ikke automatisk jobb eller identitet/i, 'livelihood classification must not masquerade as employment');

// Broken internal links must fail before merge, even for nonplayable records.
for (const match of md.matchAll(/\]\(([^)]+)\)/g)) {
  const url = match[1].split('#')[0];
  if (!url || /^(https?:|mailto:)/.test(url)) continue;
  const abs = path.resolve(ROOT, 'docs', url);
  assert.ok(fs.existsSync(abs), 'broken Symposium register link ' + match[1]);
}

console.log('Symposium register PASS: ' + rows.size + ' scope/pack identities, '
  + modelManifest.files.length + ' models, ' + worlds.roles.length + ' worlds, '
  + packs.roles.length + ' role packs, ' + positions.positions.length + ' life positions, '
  + Object.keys(life.roles).length + ' Life Stories, ' + synopsis.entries.length
  + ' synopses, ' + livelihoods.kinds.length + ' livelihood contexts, '
  + profiles.length + ' source profiles');
