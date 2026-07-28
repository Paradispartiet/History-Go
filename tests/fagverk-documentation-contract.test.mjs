import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const contractPath = 'docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md';

test('canonical fagsidekontrakt finnes og er omfattende', () => {
  const contract = read(contractPath);
  assert.ok(contract.length > 15000);
  assert.ok(contract.includes('fagverk.html?subject=<subject_id>'));
  assert.ok(contract.includes('data/fagverk/fagverk_subject_status.json'));
  assert.ok(contract.includes('blocked'));
});

test('kontrakten viser til de sentrale autoritetene', () => {
  const contract = read(contractPath);
  for (const reference of [
    'documentation_registry.json', 'FACTUALITY_CONTRACT.md', 'HISTORY_GO_TECHNICAL_ARCHITECTURE.md',
    'DOMAIN_CONTRACT.md', 'category_contract.json', 'SUBJECT_FILE_CONTRACT.md', 'README.pensum.md',
    'fagstrukturREADME.md', 'FAGVERK_NAVIGATION.md', 'FAGVERK.md', 'DATA_PRODUCTION_CONTRACT.md',
    'KNOWLEDGE_ARCHITECTURE.md', 'QUIZ_PRODUCTION_CANONICAL.md', 'QUIZ_TEMPLATE_REGISTRY_V2.json',
    'PLACE_PRODUCTION_CHECKLIST.md', 'PLACE_STANDARD.md', 'FAGVERK_PLACE_DESIGN.md',
    'COMPLETION_DEFINITIONS.md', 'HISTORY_GO_PRODUCT_MAP.md', 'TYPESCRIPT_FIRST_POLICY.md',
    'TEAM_WORKFLOW.md', 'data/fag/fag_manifest.json', 'data/fagverk/fagverk_portal.json',
    'data/fagverk/fagverk_registry.json'
  ]) assert.ok(contract.includes(reference), reference);
});

test('alle canonicale fag er eksplisitt omtalt', () => {
  const contract = read(contractPath);
  const categories = json('data/categories/category_contract.json');
  assert.equal(categories.fagSubjects.length, 18);
  for (const subjectId of categories.fagSubjects) assert.ok(contract.includes(`\`${subjectId}\``), subjectId);
});

test('dokumentasjonsregisteret har entydige fagverksroller', () => {
  const registry = json('docs/documentation_registry.json');
  const byPath = new Map(registry.documents.map((entry) => [entry.path, entry]));
  const canonical = byPath.get(contractPath);
  assert.equal(canonical?.status, 'canonical');
  assert.ok(canonical?.owns.includes('fagverk_subject_page_contract'));
  assert.equal(byPath.get('docs/FAGVERK_NAVIGATION.md')?.status, 'canonical');
  assert.equal(byPath.get('docs/FAGVERK.md')?.status, 'operational');
  assert.equal(byPath.get('docs/FAGVERK_PLACE_DESIGN.md')?.status, 'canonical');
  assert.ok(registry.priority_order.includes(contractPath));
});

test('dokumentasjonsinngangene peker til fagsidekontrakten', () => {
  for (const file of [
    'DOCS.md', 'docs/README.md', 'docs/FAGVERK.md', 'docs/FAGVERK_NAVIGATION.md',
    'docs/FAGVERK_PLACE_DESIGN.md', 'docs/SUBJECT_FILE_CONTRACT.md',
    'docs/DATA_PRODUCTION_CONTRACT.md', 'README/README.pensum.md'
  ]) assert.ok(read(file).includes('FAGVERK_SUBJECT_PAGE_CONTRACT.md'), file);
});

test('fagverk-workflowen håndhever dokumentasjonskontrakten', () => {
  const workflow = read('.github/workflows/fagverk.yml');
  assert.ok(workflow.includes('docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md'));
  assert.ok(workflow.includes('tests/fagverk-documentation-contract.test.mjs'));
  assert.ok(workflow.includes('node --test tests/fagverk-documentation-contract.test.mjs'));
});
