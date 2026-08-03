import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = path => fs.readFileSync(path, 'utf8');
const readJson = path => JSON.parse(read(path));

const brandRules = readJson('data/brands/brand_rules_v1_1.json');
const supersededBrandRules = readJson('data/brands/brand_rules.json');
const brands = readJson('data/brands/brands_master.json');
const registry = readJson('docs/documentation_registry.json');
const rounds = read('data/places/README_place_rounds.md');
const standard = read('docs/PLACE_STANDARD.md');
const dataContract = read('docs/DATA_PRODUCTION_CONTRACT.md');
const checklist = read('docs/PLACE_PRODUCTION_CHECKLIST.md');
const quiz = read('data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md');

test('Brand-reglene er canonical semantisk eier og er rutet fra stedskontraktene', () => {
  assert.equal(brandRules.status, 'canonical_brand_definition');
  assert.equal(brandRules.owner, 'brand_semantics');
  assert.equal(supersededBrandRules.status, 'superseded');
  assert.equal(supersededBrandRules.superseded_by, 'data/brands/brand_rules_v1_1.json');
  assert.equal(supersededBrandRules.canonical, false);
  const entry = registry.documents.find(document => document.path === 'data/brands/brand_rules_v1_1.json');
  assert.equal(entry?.status, 'canonical');
  assert.ok(entry?.owns?.includes('brand_semantics'));
  for (const document of [rounds, standard, dataContract, checklist]) {
    assert.match(document, /data\/brands\/brand_rules_v1_1\.json/);
  }
});

test('Brand-definisjonen omfatter profesjonelle og arkitektoniske identiteter uten å bli restkategori', () => {
  assert.ok(brandRules.inclusion_rules.include.some(value => /Professional brands.*architecture firms/i.test(value)));
  assert.ok(brands.some(brand => brand.brand_type === 'architecture_brand'));
  assert.ok(brands.some(brand => brand.brand_type === 'professional_brand'));
  assert.match(rounds, /aktørtypen er heller ikke et avslag i seg selv/);
  assert.match(checklist, /aktørtype alene brukes verken som godkjenning eller avslag/);
  assert.match(dataContract, /ikke brukes som generell restkategori/);
});

test('Brands-N/A krever kandidatsøk og kan ikke utledes av null registertreff', () => {
  assert.match(brandRules.place_production_gate.na_rule, /Zero hits.*not evidence of N\/A/i);
  assert.match(rounds, /null treff.*ikke.*alene grunnlag for N\/A/is);
  assert.match(checklist, /null treff.*behandles som «må researches», ikke som N\/A/is);
  assert.match(checklist, /kandidatspesifikke avvisningsgrunner/);
});

test('Quizkontrakten krever eksisterende-quiz-audit og eksplisitt settantall', () => {
  assert.match(quiz, /\*\*Versjon:\*\* 3\.3/);
  assert.match(quiz, /Eksisterende quiz skal auditeres før profilvalg/);
  assert.match(quiz, /`narrow` \| 3/);
  assert.match(quiz, /`normal` \| 4/);
  assert.match(quiz, /`rich` \| 5–8/);
  assert.match(quiz, /`major` \| 8–10/);
  assert.match(quiz, /`major`-sted skal ha \*\*10 × 7\*\*/);
  assert.match(quiz, /`profile_hint`.*kan forhåndslåse/s);
  assert.match(checklist, /alle aktive, arkiverte og alternative quizfiler/);
  assert.match(checklist, /`major`-sted bruker 10 sett/);
});
