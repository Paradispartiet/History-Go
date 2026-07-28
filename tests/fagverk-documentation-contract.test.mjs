import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

const MASTER = 'docs/FAGVERK.md';
const NAVIGATION = 'docs/FAGVERK_NAVIGATION.md';

const requiredReferences = [
  'docs/FACTUALITY_CONTRACT.md',
  'docs/DOMAIN_CONTRACT.md',
  'data/categories/category_contract.json',
  'docs/SUBJECT_FILE_CONTRACT.md',
  'docs/FAGVERK_NAVIGATION.md',
  'README/README.pensum.md',
  'README/fagstrukturREADME.md',
  'docs/DATA_PRODUCTION_CONTRACT.md',
  'docs/KNOWLEDGE_ARCHITECTURE.md',
  'data/knowledge/knowledge_system_policy_v1.json',
  'data/knowledge/knowledge_unit_schema_v1.json',
  'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md',
  'data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json',
  'data/quiz/quiz_knowledge_delivery_contract_v1.json',
  'docs/FAGVERK_PLACE_DESIGN.md',
  'docs/TYPESCRIPT_FIRST_POLICY.md',
  'docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md',
  'README/README_DEV.md',
  'README/TEAM_WORKFLOW.md',
  'data/fag/fag_manifest.json',
  'data/fagverk/fagverk_portal.json',
  'data/fagverk/fagverk_registry.json'
];

function markdownMentionsPath(markdown, relativePath) {
  const fromDocs = relativePath.startsWith('docs/')
    ? `./${relativePath.slice('docs/'.length)}`
    : `../${relativePath}`;
  return markdown.includes(relativePath) || markdown.includes(fromDocs);
}

test('FAGVERK.md is the explicit canonical all-subject production contract', () => {
  const master = read(MASTER);

  assert.match(master, /canonical og bindende fagverkskontrakt v5/i);
  assert.match(master, /eneste samlede kontrakten/i);
  assert.match(master, /én felles fagsidemotor/i);
  assert.match(master, /fagverk\.html\?subject=<subject_id>/);
  assert.match(master, /Navigasjonsstatus/);
  assert.match(master, /Redaksjonell status/);
  assert.match(master, /Krav til `structure_ready`/);
  assert.match(master, /Krav til `complete`/);
  assert.match(master, /Fase 1 — generell fagsidemotor/);
  assert.match(master, /Fase 2 — fire representativt ulike piloter/);
  assert.doesNotMatch(master, /Status: canonical politikk-integrasjon/i);
});

test('the master contract points to every relevant owning document and source', () => {
  const master = read(MASTER);

  for (const relativePath of requiredReferences) {
    assert.ok(
      fs.existsSync(path.join(root, relativePath)),
      `Required referenced file does not exist: ${relativePath}`
    );
    assert.ok(
      markdownMentionsPath(master, relativePath),
      `FAGVERK.md must reference ${relativePath}`
    );
  }
});

test('the canonical subject baseline matches category contract and fag manifest', () => {
  const master = read(MASTER);
  const categoryContract = readJson('data/categories/category_contract.json');
  const fagManifest = readJson('data/fag/fag_manifest.json');

  assert.deepEqual(categoryContract.runtimeCategories, categoryContract.fagSubjects);

  for (const subjectId of categoryContract.fagSubjects) {
    assert.ok(fagManifest[subjectId], `Missing fag manifest entry for ${subjectId}`);
    assert.match(
      master,
      new RegExp(`(^|\\n)${subjectId.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(\\n|$)`),
      `FAGVERK.md baseline must list ${subjectId}`
    );
  }
});

test('navigation remains narrow and delegates production architecture to FAGVERK.md', () => {
  const navigation = read(NAVIGATION);

  assert.match(navigation, /eier bare navigasjon, adresser og sideroller/i);
  assert.match(navigation, /\[FAGVERK\.md\]\(\.\/FAGVERK\.md\)/);
  assert.match(navigation, /fagverk-forside\.html/);
  assert.match(navigation, /fagverk\.html\?subject=<subject_id>/);
  assert.match(navigation, /fagverk-sted\.html\?place=<place_id>/);
  assert.match(navigation, /planned/);
  assert.match(navigation, /materialized/);
});

test('repository and subject-file documentation point to the canonical master contract', () => {
  const docsEntry = read('DOCS.md');
  const subjectContract = read('docs/SUBJECT_FILE_CONTRACT.md');

  assert.match(docsEntry, /docs\/FAGVERK\.md/);
  assert.match(subjectContract, /\[FAGVERK\.md\]\(\.\/FAGVERK\.md\)/);
  assert.match(subjectContract, /skal ikke brukes som konkurrerende fagsidekontrakt/i);
});

test('portal status remains honest at the documentation baseline', () => {
  const portal = readJson('data/fagverk/fagverk_portal.json');
  const categoryContract = readJson('data/categories/category_contract.json');
  const categories = portal.categories ?? [];

  assert.deepEqual(
    categories.map((item) => item.id),
    categoryContract.fagSubjects,
    'Portal order must match canonical subject order'
  );

  for (const item of categories) {
    assert.ok(item.badgePage, `${item.id} must have a badge page`);
    assert.ok(['planned', 'materialized'].includes(item.subjectStatus));
    if (item.subjectStatus === 'materialized') {
      assert.ok(item.subjectPage, `${item.id} is materialized without subjectPage`);
    } else {
      assert.equal(item.subjectPage, '', `${item.id} is planned but exposes subjectPage`);
    }
  }
});
