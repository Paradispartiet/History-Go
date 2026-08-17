#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label}: mangler forventet snapshot`);
  return source.replace(before, after);
}

const breadthFile = 'scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs';
let breadth = fs.readFileSync(breadthFile, 'utf8');
breadth = replaceOnce(
  breadth,
  "  assert(readiness.version === '1.2.0', 'Readiness har feil post-reconciliation-versjon');",
  "  assert(['1.2.0', '1.3.0'].includes(readiness.version), 'Readiness har ukjent post-reconciliation-versjon');",
  'breadth version'
);
breadth = replaceOnce(
  breadth,
  `  assert(isDeepStrictEqual(readiness.current_inventory.vitenskap, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    hook_count: 64,
    registered_chapter_count: 1
  }), 'Readiness har feil v4.6-inventar');`,
  `  assert(readiness.current_inventory.vitenskap?.domain_count === 6, 'Readiness har feil domain count');
  assert(readiness.current_inventory.vitenskap?.emne_count === 117, 'Readiness har feil emne count');
  assert(readiness.current_inventory.vitenskap?.method_count === 84, 'Readiness har feil method count');
  assert(readiness.current_inventory.vitenskap?.mapping_count === 117, 'Readiness har feil mapping count');
  assert(readiness.current_inventory.vitenskap?.hook_count === 64, 'Readiness har feil hook count');
  assert(readiness.current_inventory.vitenskap?.registered_chapter_count === registry.subjects?.vitenskap?.chapters?.length, 'Readiness og registry har ulik chapter count');`,
  'breadth inventory'
);
breadth = replaceOnce(
  breadth,
  "  assert(isDeepStrictEqual(sorted(readiness.editorial_blockers || []), sorted(EXPECTED_FAMILIES)), 'Fire breadth-familier skal forbli editorial blockers');",
  `  const editorialBlockers = readiness.editorial_blockers || [];
  assert(editorialBlockers.length >= 1, 'Minst én breadth-family må blokkere mens Vitenskap ikke er complete');
  assert(editorialBlockers.every((id) => EXPECTED_FAMILIES.includes(id)), 'Readiness har ukjent breadth editorial blocker');`,
  'breadth blockers'
);
breadth = replaceOnce(
  breadth,
  "    assert(family?.status === 'inventory_reconciled', `${id} er ikke inventory_reconciled`);",
  `    if (editorialBlockers.includes(id)) {
      assert(family?.status === 'inventory_reconciled', \`${'${id}'} må være inventory_reconciled mens den blokkerer\`);
    } else {
      assert(family?.status === 'chapter_materialized', \`${'${id}'} kan bare lukkes etter materialisert kapittel\`);
      assert(typeof family?.materialized_chapter_id === 'string' && registry.subjects.vitenskap.chapters.some((row) => row.id === family.materialized_chapter_id), \`${'${id}'} mangler registrert materialized chapter\`);
    }`,
  'breadth family status'
);
breadth = replaceOnce(
  breadth,
  `  assert(registry.subjects?.vitenskap?.chapters?.length === 1, 'Registry må beholde nøyaktig Unit 1 som registrert kapittel');
  assert(registry.subjects.vitenskap.chapters[0].id === 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap', 'Registry har feil Vitenskap-kapittel');`,
  `  assert(registry.subjects?.vitenskap?.chapters?.some((row) => row.id === 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap'), 'Registry må bevare Unit 1');
  assert(registry.subjects.vitenskap.chapters.length === readiness.current_inventory.vitenskap.registered_chapter_count, 'Registry og readiness har ulik chapter count');`,
  'breadth registry'
);
fs.writeFileSync(breadthFile, breadth);

const breadthTestFile = 'tests/fagverk-vitenskap-breadth-reconciliation.test.mjs';
let breadthTest = fs.readFileSync(breadthTestFile, 'utf8');
breadthTest = replaceOnce(breadthTest, 'assert.equal(report.editorialState.editorialBlockerCount, 4);', 'assert.equal(report.editorialState.editorialBlockerCount, 3);', 'breadth test blockers');
breadthTest = replaceOnce(breadthTest, 'assert.equal(report.editorialState.registeredChapterCount, 1);', 'assert.equal(report.editorialState.registeredChapterCount, 2);', 'breadth test chapters');
fs.writeFileSync(breadthTestFile, breadthTest);

const generalEngineTestFile = 'tests/fagverk-general-engine.test.mjs';
let generalEngineTest = fs.readFileSync(generalEngineTestFile, 'utf8');
generalEngineTest = replaceOnce(
  generalEngineTest,
  '  assert.equal(vitenskap.chapterCount, 1);',
  '  assert.equal(vitenskap.chapterCount, 2);',
  'general engine Vitenskap chapter count'
);
fs.writeFileSync(generalEngineTestFile, generalEngineTest);

const chapterPath = 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell.json';
const claimsPath = 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell/claims.json';
const briefPath = 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell/brief.json';
const chapter = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const subject = registry.subjects?.vitenskap;
if (!subject?.chapters || subject.chapters.length !== 1 || subject.chapters[0].id !== 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap') {
  throw new Error('Vitenskap registry er ikke på forventet pre-Unit2 state');
}
subject.chapters.push({
  id: chapter.chapter_id,
  title: chapter.title,
  subtitle: chapter.subtitle,
  file: chapterPath,
  primary_domain_id: chapter.primary_domain_id,
  chapter_role: 'core',
  emne_ids: chapter.emne_ids,
  claimsFile: claimsPath,
  briefFile: briefPath
});
registry.version = '3.06.0';
registry.updatedAt = '2026-08-17';
subject.canonicalModel.note = 'Vitenskapsfagets seks fagområder eier toppstrukturen. Canonical inventory v4.6 har 117 emner, 84 metoder, 117 mappinger og 64 hooks. Matematikk/formelle fag er nå fulltekstmaterialisert og registrert som andre Vitenskap-kapittel; fysikk/astronomi, kjemi/materialvitenskap og medisin/biomedisin/folkehelse gjenstår som redaksjonelle breadth-blockers. Teknologi forblir nested technology_scientific_v2_4-spesialisering under samme fag og badge. Inventory-bredde og ett materialisert breadth-kapittel er fortsatt ikke subject completion.';
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

const readinessPath = 'data/fag/vitenskap/vitenskap_university_readiness_v1.json';
const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));
if (readiness.version !== '1.2.0' || readiness.current_inventory?.vitenskap?.registered_chapter_count !== 1) {
  throw new Error('Readiness er ikke på forventet pre-Unit2 state');
}
const expected = ['mathematics_formal_sciences', 'physics_astronomy', 'chemistry_material_science', 'medicine_biomedicine_public_health'];
if (JSON.stringify(readiness.editorial_blockers) !== JSON.stringify(expected)) throw new Error('Readiness har uventet blocker-rekkefølge før Unit2');
const math = readiness.coverage_families.find((row) => row.id === 'mathematics_formal_sciences');
if (!math || math.status !== 'inventory_reconciled') throw new Error('Matematikkfamilien er ikke inventory_reconciled før Unit2');
readiness.version = '1.3.0';
readiness.current_inventory.vitenskap.registered_chapter_count = 2;
readiness.editorial_blockers = readiness.editorial_blockers.filter((id) => id !== 'mathematics_formal_sciences');
math.status = 'chapter_materialized';
math.reason = 'Canonical inventory v4.6 dekker bevis og deduksjon, algebraiske strukturer, analyse og kontinuitet, geometri og symmetri samt diskret matematikk og kombinatorikk. Familien er nå fulltekstmaterialisert i tre redigerte moduler med claimsporing, worked examples, anvendelsesoppgaver og eksplisitt skille mellom formell gyldighet og empirisk modellvalidering. Dette lukker matematikk som editorial blocker, men gjør ikke Vitenskap complete fordi tre andre breadth-familier fortsatt gjenstår.';
math.materialized_chapter_id = chapter.chapter_id;
math.materialized_evidence = {
  method_count: chapter.method_ids.length,
  module_count: chapter.moduleFiles.length,
  section_count: 9,
  paragraph_count: 27,
  source_count: 10,
  claim_count: 18
};
fs.writeFileSync(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`);

console.log('Prepared Vitenskap Unit 2 canonical state: 2 chapters, 3 breadth editorial blockers.');
