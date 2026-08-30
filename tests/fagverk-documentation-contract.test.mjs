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
const PLACE_DESIGN = 'docs/FAGVERK_PLACE_DESIGN.md';
const DOCUMENTATION_REGISTRY = 'docs/documentation_registry.json';
const THEORY_QUALITY_CONTRACT = 'data/fag/fagverk_theory_quality_contract_v1.json';

const requiredReferences = [
  DOCUMENTATION_REGISTRY,
  'docs/FACTUALITY_CONTRACT.md',
  'docs/DOMAIN_CONTRACT.md',
  'data/categories/category_contract.json',
  'docs/SUBJECT_FILE_CONTRACT.md',
  THEORY_QUALITY_CONTRACT,
  NAVIGATION,
  'README/README.pensum.md',
  'README/fagstrukturREADME.md',
  'docs/DATA_PRODUCTION_CONTRACT.md',
  'docs/KNOWLEDGE_ARCHITECTURE.md',
  'data/knowledge/knowledge_system_policy_v1.json',
  'data/knowledge/knowledge_unit_schema_v1.json',
  'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md',
  'data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json',
  'data/quiz/quiz_knowledge_delivery_contract_v1.json',
  'docs/PROGRESSION_MODEL.md',
  PLACE_DESIGN,
  'docs/PLACE_PRODUCTION_CHECKLIST.md',
  'docs/PLACE_STANDARD.md',
  'docs/COMPLETION_DEFINITIONS.md',
  'docs/HISTORY_GO_PRODUCT_MAP.md',
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

  assert.match(master, /canonical og bindende fagverkskontrakt v10/i);
  assert.match(master, /eneste samlede kontrakten/i);
  assert.match(master, /én felles fagsidemotor/i);
  assert.match(master, /fagverk\.html\?subject=<subject_id>/);
  assert.match(master, /Navigasjonsstatus/);
  assert.match(master, /Redaksjonell status/);
  assert.match(master, /Krav til `structure_ready`/);
  assert.match(master, /Krav til `complete`/);
  assert.match(master, /Fase 1 — generell fagsidemotor/);
  assert.match(master, /Fase 2 — fire representativt ulike piloter/);
  assert.match(master, /Teori-, teoretiker- og modellintegritet/);
  assert.match(master, /Theory-quality programchecklist/);
  assert.match(master, /strictCompletionGateReady=true/);
  assert.doesNotMatch(master, /Status: canonical politikk-integrasjon/i);
});

test('master contract follows the v3 integrated badge and progression role', () => {
  const master = read(MASTER);

  assert.match(master, /Oversikt · Emner · Lærestoff · Utforsk · Progresjon/);
  assert.match(master, /Merket er integrert gameplay- og progresjonsidentitet/i);
  assert.match(master, /compatibility-ruter/i);
  assert.match(master, /personlig, tverrfaglig \*\*Min læring\*\*-/i);
  assert.doesNotMatch(master, /Fagverket består av fire forskjellige produktflater/i);
  assert.doesNotMatch(master, /skiller eksplisitt mellom \*\*Åpne merket\*\* og \*\*Åpne faget\*\*/i);
  assert.doesNotMatch(master, /merkeside og fagside er forskjellige mål/i);
});

test('editorial completeness follows relevant subject matter rather than fixed quotas', () => {
  const master = read(MASTER);
  const subjectContract = read('docs/SUBJECT_FILE_CONTRACT.md');
  const pensum = read('README/README.pensum.md');

  assert.match(master, /alle faglig relevante emner/i);
  assert.match(master, /ingen felles redaksjonell kvote/i);
  assert.match(master, /gap-, overlapps- og fyllstoffaudit/i);
  assert.match(master, /tall som inventar, ikke som målkvoter/i);
  assert.match(subjectContract, /faglig relevans, ikke mot et forhåndsbestemt antall/i);
  assert.match(pensum, /ingen fast emne-, område- eller kapittelkvote/i);
  assert.doesNotMatch(master, /hvert canonicalt fagområde har minst ett fullverdig/i);
});

test('theory quality is qualitative per major field and cannot pass on aggregate name counts', () => {
  const master = read(MASTER);
  const subjectContract = read('docs/SUBJECT_FILE_CONTRACT.md');
  const theoryContract = readJson(THEORY_QUALITY_CONTRACT);

  assert.equal(theoryContract.version, '1.2.0');
  assert.equal(theoryContract.status, 'integrity_gate_contract');
  assert.equal(theoryContract.final_gate?.mode, 'per_major_field_not_aggregate');
  assert.equal(theoryContract.programme_checklist?.length, 10);
  assert.match(master, /per canonicalt hovedfelt/i);
  assert.match(master, /proof-gap og content-gap/i);
  assert.match(master, /metadata-only/i);
  assert.match(master, /person→verk\/forskningsbidrag/i);
  assert.match(subjectContract, /kvalitativt per canonicalt hovedfelt/i);
  assert.match(subjectContract, /aggregerte tellergrenser/i);
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
  const masterLines = new Set(read(MASTER).split(/\r?\n/).map((line) => line.trim()));
  const categoryContract = readJson('data/categories/category_contract.json');
  const fagManifest = readJson('data/fag/fag_manifest.json');

  assert.deepEqual(categoryContract.runtimeCategories, categoryContract.fagSubjects);

  for (const subjectId of categoryContract.fagSubjects) {
    assert.ok(fagManifest[subjectId], `Missing fag manifest entry for ${subjectId}`);
    assert.ok(masterLines.has(subjectId), `FAGVERK.md baseline must list ${subjectId}`);
  }
});

test('documentation registry gives the fagverk contracts explicit and unique roles', () => {
  const registry = readJson(DOCUMENTATION_REGISTRY);
  const byPath = new Map(registry.documents.map((entry) => [entry.path, entry]));
  const master = byPath.get(MASTER);
  const navigation = byPath.get(NAVIGATION);
  const placeDesign = byPath.get(PLACE_DESIGN);

  assert.equal(master?.status, 'canonical');
  assert.ok(master?.owns.includes('fagverk_subject_page_architecture'));
  assert.ok(master?.owns.includes('fagverk_subject_page_production'));
  assert.equal(navigation?.status, 'canonical');
  assert.ok(navigation?.owns.includes('fagverk_navigation_contract'));
  assert.equal(placeDesign?.status, 'canonical');
  assert.ok(placeDesign?.owns.includes('fagverk_place_design_contract'));

  const subjectIndex = registry.priority_order.indexOf('docs/SUBJECT_FILE_CONTRACT.md');
  const fagverkIndex = registry.priority_order.indexOf(MASTER);
  assert.ok(subjectIndex >= 0);
  assert.equal(fagverkIndex, subjectIndex + 1);
});

test('navigation remains narrow and delegates production architecture to FAGVERK.md', () => {
  const navigation = read(NAVIGATION);

  assert.match(navigation, /eier bare navigasjon, adresser og sideroller/i);
  assert.ok(navigation.includes('(./FAGVERK.md)'), 'Navigation must link to FAGVERK.md');
  assert.match(navigation, /fagverk-forside\.html/);
  assert.match(navigation, /fagverk\.html\?subject=<subject_id>/);
  assert.match(navigation, /fagverk-sted\.html\?place=<place_id>/);
  assert.match(navigation, /planned/);
  assert.match(navigation, /materialized/);
});


test('the place checklist makes a working fagverk page mandatory for every canonical place', () => {
  const checklist = read('docs/PLACE_PRODUCTION_CHECKLIST.md');

  assert.match(checklist, /Alle canonicale steder skal ha sin egen fungerende fagverkside/);
  assert.match(checklist, /Kravet gjelder hvert sted, kan ikke settes til N\/A og er en egen ferdigport/);
  assert.match(checklist, /FAGVERK-STED-STATUS:/);
  assert.match(checklist, /`?fagverk-sted`? er aldri N\/A/);
  assert.match(checklist, /fagverk-sted — obligatorisk, fungerende og aldri N\/A/);
});

test('repository and subject documentation point to the canonical master contract', () => {
  const docsEntry = read('DOCS.md');
  const docsMap = read('docs/README.md');
  const subjectContract = read('docs/SUBJECT_FILE_CONTRACT.md');
  const pensum = read('README/README.pensum.md');

  assert.match(docsEntry, /docs\/FAGVERK\.md/);
  assert.ok(subjectContract.includes('(./FAGVERK.md)'), 'Subject contract must link to FAGVERK.md');
  assert.match(subjectContract, /skal ikke brukes som konkurrerende fagsidekontrakt/i);
  assert.match(subjectContract, /fagverk_theory_quality_contract_v1\.json/);
  assert.ok(docsMap.includes('(./FAGVERK.md)'));
  assert.ok(docsMap.includes('(./FAGVERK_NAVIGATION.md)'));
  assert.ok(docsMap.includes('(./FAGVERK_PLACE_DESIGN.md)'));
  assert.match(pensum, /docs\/FAGVERK\.md/);
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
