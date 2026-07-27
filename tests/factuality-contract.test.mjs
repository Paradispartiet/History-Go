import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));

test('canonical factuality contract forbids invention and guessing', () => {
  const contract = read('docs/FACTUALITY_CONTRACT.md');
  assert.match(contract, /Status: \*\*canonical\*\*/);
  assert.match(contract, /aldri fylle inn, publisere eller presentere en opplysning fordi den virker sannsynlig/i);
  assert.match(contract, /En språkmodell er aldri en faktakilde/i);
  assert.match(contract, /Hver brukerrettet faktapåstand skal kunne spores/i);
  assert.match(contract, /Et tomt eller utelatt felt er alltid bedre/i);
  assert.match(contract, /Readiness er ikke faktaverifikasjon/i);
  assert.match(contract, /En batch skal stoppes når kildedekningen er utilstrekkelig/i);
});

test('all active people and data contracts defer to factuality contract', () => {
  for (const relative of [
    'docs/PEOPLE_POPUP_SYSTEM.md',
    'docs/people-of-places-method.md',
    'docs/DATA_PRODUCTION_CONTRACT.md',
    'docs/README.md',
  ]) {
    assert.match(read(relative), /FACTUALITY_CONTRACT\.md/);
  }
  const people = read('docs/PEOPLE_POPUP_SYSTEM.md');
  assert.match(people, /complete.*betyr ikke.*source_verified/is);
  assert.match(people, /En språkmodell er aldri en faktakilde/i);
  assert.match(people, /påstand-for-påstand/i);
});

test('documentation registry gives factuality one canonical owner and high priority', () => {
  const registry = readJson('docs/documentation_registry.json');
  const entries = registry.documents.filter((item) => item.path === 'docs/FACTUALITY_CONTRACT.md');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].status, 'canonical');
  assert.deepEqual(entries[0].owns, ['factuality_and_source_verification_contract']);
  assert.ok(registry.priority_order.includes('docs/FACTUALITY_CONTRACT.md'));
  assert.ok(registry.priority_order.indexOf('docs/FACTUALITY_CONTRACT.md') < registry.priority_order.indexOf('docs/DATA_PRODUCTION_CONTRACT.md'));
});
