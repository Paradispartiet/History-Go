#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  manifest: 'data/fag/fag_manifest.json',
  index: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/index.json',
  coverage: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',
  topics: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/topic_foundations_v1.json',
  concepts: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/concepts_faggrunnlag_v1.json',
  chapter: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/faggrunnlag_metode_forskningspraksis.json'
};
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const check = (condition, message) => { if (!condition) throw new Error(message); };
const words = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;

export function auditLitteraturScientificPackage() {
  const manifest = read(P.manifest);
  const index = read(P.index);
  const coverage = read(P.coverage);
  const foundations = read(P.topics);
  const concepts = read(P.concepts);
  const chapter = read(P.chapter);

  check(manifest.litteratur.scientificPackage === 'litteratur/litteraturvitenskap_canonical_v1/index.json', 'Manifestet mangler scientificPackage');
  check(manifest.litteratur.coverageContract === 'litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json', 'Manifestet mangler coverageContract');
  check(manifest.litteratur.topicFoundations === 'litteratur/litteraturvitenskap_canonical_v1/topic_foundations_v1.json', 'Manifestet mangler topicFoundations');
  check(index.summary.coverage_area_count === 24 && index.summary.required_topic_count === 144, 'Index har feil dekningsmål');
  check(coverage.coverage_areas.length === 24, 'Dekningskontrakten skal ha 24 områder');
  check(foundations.areas.length === 24, 'Tekstlaget skal ha 24 områdesynteser');

  const requiredAreaIds = coverage.coverage_areas.map((area) => area.id);
  const actualAreaIds = foundations.areas.map((area) => area.id);
  check(new Set(actualAreaIds).size === 24, 'Område-ID-er må være unike');
  check(requiredAreaIds.every((id) => actualAreaIds.includes(id)), 'Tekstlaget mangler et dekningsområde');

  const requiredTopicIds = coverage.coverage_areas.flatMap((area) => area.topics);
  const rows = foundations.areas.flatMap((area) => {
    check(words(area.synthesis) >= 18, `${area.id}: områdesyntesen er for kort`);
    check(area.topics.length === 6, `${area.id}: forventet seks emnetekster`);
    return area.topics;
  });
  check(rows.length === 144 && new Set(rows.map((row) => row.id)).size === 144, 'Tekstlaget skal ha 144 unike emner');
  check(requiredTopicIds.length === 144 && requiredTopicIds.every((id) => rows.some((row) => row.id === id)), 'Tekstlaget og dekningskontrakten er usynkronisert');
  check(new Set(rows.map((row) => row.text)).size === 144, 'Emnetekster kan ikke være dupliserte plassholdere');
  for (const row of rows) {
    check(words(row.text) >= 18, `${row.id}: forklaringsteksten er for kort`);
    check(Array.isArray(row.concepts) && row.concepts.length >= 3 && new Set(row.concepts).size === row.concepts.length, `${row.id}: mangler særskilt begrepssett`);
    check(words(row.example) >= 3, `${row.id}: mangler navngitt analyseobjekt eller case`);
  }

  check(concepts.concepts.length === 24 && new Set(concepts.concepts.map((row) => row.id)).size === 24, 'Faggrunnlaget skal ha 24 unike, utvidede begreper');
  for (const concept of concepts.concepts) {
    check(words(concept.definition) >= 10, `${concept.id}: definisjonen er for kort`);
    check(words(concept.distinguish_from) >= 4, `${concept.id}: mangler grense mot nabobegrep`);
  }

  check(chapter.moduleFiles.length === 3, 'Faggrunnlagskapittelet skal ha tre moduler');
  const modules = chapter.moduleFiles.map(read);
  check(modules.flatMap((module) => module.sections || []).length >= 9, 'Kapittelet skal ha minst ni redigerte seksjoner');
  for (const module of modules) {
    for (const section of module.sections || []) {
      check(section.paragraphs.length >= 3, `${section.id}: forventet minst tre fagavsnitt`);
      check(section.paragraphs.every((paragraph) => words(paragraph) >= 25), `${section.id}: et fagavsnitt er for kort`);
    }
  }
  const claims = read(chapter.claimsFile);
  const sourceIds = new Set(claims.sources.map((source) => source.id));
  const claimIds = new Set(claims.claims.map((claim) => claim.id));
  check(claims.sources.length === 10 && claims.claims.length === 18, 'Faggrunnlaget skal ha 10 kilder og 18 verifiserte påstander');
  for (const claim of claims.claims) check(claim.source_ids.length > 0 && claim.source_ids.every((id) => sourceIds.has(id)), `${claim.id}: ugyldig kildespor`);
  const usedClaimIds = modules.flatMap((module) => (module.sections || []).flatMap((section) => (section.paragraphClaimIds || []).flat()));
  check(usedClaimIds.every((id) => claimIds.has(id)), 'Modultekst peker til ukjent claim');

  return { areaCount: 24, topicCount: 144, conceptCount: 24, moduleCount: 3, sourceCount: 10, claimCount: 18 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditLitteraturScientificPackage();
    console.log(`Litteraturpakke OK: ${result.areaCount} områder, ${result.topicCount} emnetekster, ${result.conceptCount} grunnbegreper, ${result.moduleCount} moduler, ${result.sourceCount} kilder og ${result.claimCount} claims.`);
  } catch (error) {
    console.error(`Litteraturpakke FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
