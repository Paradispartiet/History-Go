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
const profiles = read('docs/PLACE_PRODUCTION_PROFILES.md');
const quiz = read('data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md');
const packageSchema = readJson('data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json');
const productionLibrary = read('scripts/quiz-production-lib.mjs');
const productionAudit = read('scripts/audit-quiz-production-context.mjs');

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
  assert.match(brandRules.place_production_gate.project_actor_rule, /not automatically filler.*not automatically a Brand/i);
  assert.match(dataContract, /ikke brukes som generell restkategori/);
  assert.match(checklist, /aldri Brand bare fordi PlaceCard/i);
});

test('Brands-N/A krever kandidatsøk og kan ikke utledes av null registertreff', () => {
  assert.match(brandRules.place_production_gate.na_rule, /Zero hits.*not evidence of N\/A/i);
  assert.match(checklist, /Null treff.*må researches.*ikke automatisk N\/A/is);
  assert.match(checklist, /faktisk kandidatsøk/i);
  assert.match(profiles, /Badge\/underbadge.*kan ikke brukes til å dikte/i);
});

test('Quizkontrakten krever eksisterende-quiz-audit, shuffle og evidensstyrt eksakt settantall', () => {
  assert.match(quiz, /\*\*Versjon:\*\* 3\.4/);
  assert.match(quiz, /Eksisterende quiz skal auditeres før profilvalg/);
  assert.match(quiz, /Svarrekkefølge og posisjonsbias — obligatorisk shuffle/);
  assert.match(quiz, /shuffle dem for hvert vist spørsmål i hvert quizforsøk/);
  assert.match(quiz, /korrekt indeks remappes til den nye visningsrekkefølgen/);
  assert.match(quiz, /Første alternativ skal spesielt aldri brukes som systematisk fasitposisjon/);
  assert.match(quiz, /Å flytte alle riktige svar til en annen fast posisjon er ikke en løsning/);
  assert.match(quiz, /`narrow` \| 3/);
  assert.match(quiz, /`normal` \| 4/);
  assert.match(quiz, /`rich` \| 5–8/);
  assert.match(quiz, /`major` \| 8–10/);
  assert.match(quiz, /`major`-sted skal ha \*\*10 × 7\*\* når kildene bærer ti reelt forskjellige settplaner/);
  assert.match(quiz, /`profile_hint`.*kan forhåndslåse/s);
  assert.match(checklist, /aktive, arkiverte og alternative quizfiler/);
  assert.match(checklist, /Stedsprofil `major` kan ikke alene tvinge 10 sett/);
  assert.match(profiles, /Badge, underbadges.*quizFocus.*planlegge/s);
  assert.match(profiles, /påstandsbank.*bestemmer quizprofil/i);
  for (const field of ['existing_quiz_audit', 'profile_decision', 'held_back_candidates']) {
    assert.ok(packageSchema.production_context.required_fields.includes(field));
    assert.ok(packageSchema.source_brief_contract.required_fields.includes(field));
    assert.match(productionLibrary, new RegExp(field));
    assert.match(productionAudit, new RegExp(field));
  }
  assert.doesNotMatch(productionLibrary, /candidates\.find\(\(\[profileId\]\) => profileId === brief\.profile_hint\)/);
  assert.match(packageSchema.profile_contract.rule, /profile_hint kan ikke velge/);
});