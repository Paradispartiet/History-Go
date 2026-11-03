#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const Content = require(path.join(root, 'js/Civication/lifestory/lifestoryContent.js'));
const State = require(path.join(root, 'js/Civication/lifestory/lifestoryState.js'));
const Runner = require(path.join(root, 'js/Civication/lifestory/lifestoryRunner.js'));

const manifest = read('data/Civication/lifestory/manifest.json');
function contentFor(id) {
  const entry = manifest.roles[id];
  assert.ok(entry, 'existing manifest role ' + id);
  return Content.buildContent({
    role: read(entry.role),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    roleThreads: read(entry.threads),
    roleScenes: read(entry.scenes),
    lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes)
  });
}

// Every existing Life Story role may now read its actual persisted memory.
// A bare fallback never upgrades available future scenes to confirmed meetings.
for (const roleId of Object.keys(manifest.roles)) {
  const content = contentFor(roleId);
  const state = State.createInitialState(content);
  const book = Runner.getSymposium(state, content);
  assert.ok(book, roleId + ' has a readable archive');
  assert.equal(typeof book.tittel, 'string');
  assert.deepEqual(book.tidslinje, [], roleId + ' has no fabricated events at start');
  assert.deepEqual(book.tidligereRoller, []);
  assert.deepEqual(book.rolleBytter, []);
  assert.deepEqual(book.moter, [], roleId + ' has no invented meetings');
  if (!content.role.symposium) assert.deepEqual(book.avtaler, [], roleId + ' has no invented bookings');
}

// Real choices, not seeded story flags, must remain in the book across roles.
const firstRole = contentFor('renholder');
const secondRole = contentFor('arealplanlegger');
const active = State.createInitialState(firstRole);
for (let i = 0; i < 2; i += 1) {
  const next = Runner.selectNextScene(active, firstRole);
  assert.ok(next?.valg?.length, 'real playable scene #' + i);
  Runner.applyChoice(active, firstRole, next.id, next.valg[0].id);
}
const saved = JSON.parse(JSON.stringify(active));
const firstArchive = saved.arkiv.map(x => x.sceneId + ':' + x.valgId);
assert.ok(firstArchive.length >= 2);
const switched = State.selectRole(saved, secondRole);
assert.equal(switched.rolle, 'arealplanlegger');
const otherBook = Runner.getSymposium(switched, secondRole);
assert.equal(otherBook.rolleBytter.length, 1);
assert.equal(otherBook.rolleBytter[0].fra, 'renholder');
assert.equal(otherBook.rolleBytter[0].til, 'arealplanlegger');
const previous = otherBook.tidligereRoller.find(x => x.rolle === 'renholder');
assert.ok(previous, 'earlier role has played work-specific events');
assert.ok(previous.tidslinje.some(x => x.sceneId === 'rommet_01_melding'));
assert.ok(previous.tidslinje.every(x => firstArchive.includes(x.sceneId + ':' + x.valgId)));
const currentKeys = new Set(otherBook.tidslinje.map(x => x.sceneId + ':' + x.valgId));
assert.ok(previous.tidslinje.every(x => !currentKeys.has(x.sceneId + ':' + x.valgId)),
  'shared private memories are not displayed twice');
assert.deepEqual(otherBook.avtaler, [], 'unconfigured role never invents a meeting');

const returned = State.selectRole(JSON.parse(JSON.stringify(switched)), firstRole);
const restored = Runner.getSymposium(returned, firstRole);
assert.equal(restored.rolleBytter.length, 2);
assert.ok(restored.tidslinje.some(x => x.sceneId === 'rommet_01_melding'),
  'prior work is not erased when the player returns to the role');
assert.deepEqual(restored.tidslinje.map(x => x.sceneId + ':' + x.valgId),
  returned.arkiv.map(x => x.sceneId + ':' + x.valgId));

console.log('Civication Symposium: all ' + Object.keys(manifest.roles).length +
  ' roles have a read-only book; real memories survive role switches.');
