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
  concepts: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/concepts_faggrunnlag_v1.json'
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

  check(manifest.litteratur.scientificPackage === 'litteratur/litteraturvitenskap_canonical_v1/index.json', 'Manifestet mangler scientificPackage');
  check(manifest.litteratur.coverageContract === 'litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json', 'Manifestet mangler coverageContract');
  check(manifest.litteratur.topicFoundations === 'litteratur/litteraturvitenskap_canonical_v1/topic_foundations_v1.json', 'Manifestet mangler topicFoundations');
  const requiredAreaCount = coverage.completion_definition.required_area_count;
  const requiredTopicCount = coverage.completion_definition.required_topic_count;
  check(index.summary.coverage_area_count === requiredAreaCount && index.summary.required_topic_count === requiredTopicCount, 'Index har feil dekningsmål');
  check(coverage.coverage_areas.length === requiredAreaCount, `Dekningskontrakten skal ha ${requiredAreaCount} områder`);
  check(foundations.areas.length === requiredAreaCount, `Tekstlaget skal ha ${requiredAreaCount} områdesynteser`);

  const requiredAreaIds = coverage.coverage_areas.map((area) => area.id);
  const actualAreaIds = foundations.areas.map((area) => area.id);
  check(new Set(actualAreaIds).size === requiredAreaCount, 'Område-ID-er må være unike');
  check(JSON.stringify(requiredAreaIds) === JSON.stringify(actualAreaIds), 'Tekstlaget må følge dekningskontraktens rekkefølge nøyaktig');

  const requiredTopicIds = coverage.coverage_areas.flatMap((area) => area.topics);
  const rows = foundations.areas.flatMap((area) => {
    check(words(area.synthesis) >= 18, `${area.id}: områdesyntesen er for kort`);
    check(area.topics.length === 6, `${area.id}: forventet seks emnetekster`);
    return area.topics;
  });
  check(rows.length === requiredTopicCount && new Set(rows.map((row) => row.id)).size === requiredTopicCount, `Tekstlaget skal ha ${requiredTopicCount} unike emner`);
  check(requiredTopicIds.length === requiredTopicCount && requiredTopicIds.every((id) => rows.some((row) => row.id === id)), 'Tekstlaget og dekningskontrakten er usynkronisert');
  check(new Set(rows.map((row) => row.text)).size === requiredTopicCount, 'Emnetekster kan ikke være dupliserte plassholdere');
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

  const chapterFiles = index.files.foundation_chapters || [];
  check(chapterFiles.length === index.summary.materialized_foundation_chapter_count, 'Index og kapittelliste har ulikt kapittelantall');
  let moduleCount = 0;
  let conceptCount = 0;
  let sourceCount = 0;
  let claimCount = 0;
  let fullDepthChapterCount = 0;
  const completeAreaIds = new Set();

  for (const relativeChapterFile of chapterFiles) {
    const chapter = read(`data/fag/litteratur/litteraturvitenskap_canonical_v1/${relativeChapterFile}`);
    const contractArea = coverage.coverage_areas.find((area) => area.id === chapter.id);
    check(Boolean(contractArea), `${chapter.id}: kapittelet finnes ikke i dekningskontrakten`);
    check(JSON.stringify(chapter.coverage_topics) === JSON.stringify(contractArea.topics), `${chapter.id}: kapittelets temaer avviker fra kontrakten`);
    check(chapter.moduleFiles.length === 3, `${chapter.id}: kapittelet skal ha tre moduler`);
    const modules = chapter.moduleFiles.map(read);
    moduleCount += modules.length;
    const sections = modules.flatMap((module) => module.sections || []);
    const strict = chapter.qualityProfile === 'full_depth_v2';
    if (strict) {
      fullDepthChapterCount += 1;
      check(sections.length === 6, `${chapter.id}: full-dybde-kapittelet skal ha én hovedartikkel per tema`);
      check(sections.every((section) => section.coverageTopic), `${chapter.id}: alle artikler må peke til et kontraktstema`);
      check(JSON.stringify(sections.map((section) => section.coverageTopic)) === JSON.stringify(chapter.coverage_topics), `${chapter.id}: artiklene må dekke alle temaer i kontraktrekkefølge`);
      check(modules.every((module) => module.qualityProfile === 'full_depth_v2'), `${chapter.id}: alle moduler må ha full_depth_v2`);
      check(modules.every((module) => (module.workedExamples || []).length >= 2), `${chapter.id}: hver modul må ha minst to arbeidseksempler`);
      for (const module of modules) {
        for (const example of module.workedExamples) {
          check(words(example.object) >= 5, `${chapter.id}: arbeidseksempel mangler navngitt objekt`);
          check((example.steps || []).length >= 4, `${chapter.id}: arbeidseksempel mangler analyseprotokoll`);
        }
      }
    } else {
      check(sections.length >= 9, `${chapter.id}: kapittelet skal ha minst ni redigerte seksjoner`);
    }
    for (const section of sections) {
      check(section.paragraphs.length >= 3, `${section.id}: forventet minst tre fagavsnitt`);
      check(section.paragraphClaimIds?.length === section.paragraphs.length, `${section.id}: hvert avsnitt må ha eksplisitt claim-spor, også når listen er tom`);
      const minimumWords = strict ? 55 : 25;
      check(section.paragraphs.every((paragraph) => words(paragraph) >= minimumWords), `${section.id}: et fagavsnitt er kortere enn ${minimumWords} ord`);
      check((section.keyPoints || []).length >= 2, `${section.id}: mangler faglige hovedpunkter`);
    }

    const registry = read(chapter.conceptRegistry);
    check(registry.coverage_area_id === chapter.id, `${chapter.id}: begrepsregisteret peker til feil område`);
    check(registry.concepts.length >= 24, `${chapter.id}: kapittelet skal ha minst 24 definerte begreper`);
    check(new Set(registry.concepts.map((row) => row.id)).size === registry.concepts.length, `${chapter.id}: begreps-ID-er må være unike`);
    for (const concept of registry.concepts) {
      check(words(concept.definition) >= 10, `${chapter.id}/${concept.id}: definisjonen er for kort`);
      check(words(concept.distinguish_from) >= 4, `${chapter.id}/${concept.id}: mangler grense mot nabobegrep`);
    }
    conceptCount += registry.concepts.length;

    const claims = read(chapter.claimsFile);
    const sourceIds = new Set(claims.sources.map((source) => source.id));
    const claimIds = new Set(claims.claims.map((claim) => claim.id));
    check(claims.sources.length >= 10 && claims.claims.length >= 18, `${chapter.id}: krever minst 10 kilder og 18 verifiserte påstander`);
    check(claims.sources.every((source) => /^https:\/\//u.test(source.url)), `${chapter.id}: alle kilder må ha HTTPS-lenke`);
    for (const claim of claims.claims) check(claim.source_ids.length > 0 && claim.source_ids.every((id) => sourceIds.has(id)), `${claim.id}: ugyldig kildespor`);
    const usedClaimIds = sections.flatMap((section) => (section.paragraphClaimIds || []).flat());
    check(usedClaimIds.every((id) => claimIds.has(id)), `${chapter.id}: modultekst peker til ukjent claim`);
    check(new Set(usedClaimIds).size / claims.claims.length >= 0.7, `${chapter.id}: mindre enn 70 prosent av påstandene er koblet til avsnitt`);
    sourceCount += claims.sources.length;
    claimCount += claims.claims.length;
    completeAreaIds.add(chapter.id);
  }

  check(index.summary.materialized_module_count === moduleCount, 'Index har feil modulantall');
  check(index.summary.defined_concept_count === conceptCount, 'Index har feil antall definerte begreper');
  check(index.summary.verified_source_count === sourceCount, 'Index har feil kildeantall');
  check(index.summary.verified_claim_count === claimCount, 'Index har feil claim-antall');
  check(coverage.progress.areas_complete === completeAreaIds.size, 'Dekningskontrakten har feil antall ferdige områder');
  check(coverage.progress.topics_complete === [...completeAreaIds].reduce((sum, id) => sum + coverage.coverage_areas.find((area) => area.id === id).topics.length, 0), 'Dekningskontrakten har feil antall ferdige temaer');

  return { areaCount: requiredAreaCount, topicCount: requiredTopicCount, completeAreaCount: completeAreaIds.size, fullDepthChapterCount, conceptCount, moduleCount, sourceCount, claimCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditLitteraturScientificPackage();
    console.log(`Litteraturpakke OK: ${result.areaCount} områder, ${result.topicCount} emnetekster, ${result.completeAreaCount} komplette områder, ${result.conceptCount} definerte begreper, ${result.moduleCount} moduler, ${result.sourceCount} kilder og ${result.claimCount} claims.`);
  } catch (error) {
    console.error(`Litteraturpakke FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
