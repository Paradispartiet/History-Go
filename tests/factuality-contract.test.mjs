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
    'docs/PEOPLE_PROFILE_CANONICAL.md',
    'docs/PEOPLE_POPUP_SYSTEM.md',
    'docs/people-of-places-method.md',
    'docs/DATA_PRODUCTION_CONTRACT.md',
    'docs/README.md',
  ]) {
    assert.match(read(relative), /FACTUALITY_CONTRACT\.md/);
  }
  const people = read('docs/PEOPLE_POPUP_SYSTEM.md');
  assert.match(people, /presentasjonsstatusene[\s\S]*complete[\s\S]*strong[\s\S]*partial[\s\S]*sparse/i);
  assert.match(people, /Profiler uten v1-claims er `legacy_unreviewed`/i);
  const production = read('docs/PEOPLE_PROFILE_CANONICAL.md');
  assert.match(production, /En språkmodell er aldri en faktakilde/i);
  assert.match(production, /påstand-for-påstand/i);
});

test('documentation map preserves exact ordered lists', () => {
  const docs = read('docs/README.md');
  assert.match(docs, /### Dagens runtime og arbeidsflyt[\s\S]*?1\. .*SYSTEM_REGISTRY\.md[\s\S]*?2\. .*SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS\.md[\s\S]*?3\. .*SYSTEM_MAP\.md/);
  assert.match(docs, /### People-produksjon, stedskobling og bilder[\s\S]*?1\. .*FACTUALITY_CONTRACT\.md[\s\S]*?2\. .*PEOPLE_PROFILE_CANONICAL\.md[\s\S]*?3\. .*people_profile_templates_v1\.json[\s\S]*?4\. .*people_claims_schema_v1\.json[\s\S]*?5\. .*audit-people-profile-canonical\.mjs[\s\S]*?6\. .*people-of-places-method\.md[\s\S]*?7\. .*PEOPLE_POPUP_SYSTEM\.md[\s\S]*?15\. .*people-images\.test\.mjs/);
  assert.doesNotMatch(docs, /### Dagens runtime og arbeidsflyt[\s\S]*?10\. .*SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS\.md/);
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
