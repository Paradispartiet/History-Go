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
const completedAreaStatuses = new Set(['chapter_and_overview_text_materialized', 'expanded_contract_fulfilled']);
const requiredFulfillmentFields = ['topicId', 'sectionIds', 'conceptIds', 'claimIds', 'sourceIds', 'appliedTheoryTraditions', 'appliedMethods', 'namedAnalysisObjects', 'historicalCoverage', 'geographicalCoverage', 'boundaryAreaIds', 'subcoverageEvidence', 'theoryEvidence', 'methodEvidence', 'namedObjectEvidence'];
const uniqueStrings = (value, minimum, message) => {
  check(Array.isArray(value) && value.length >= minimum, message);
  check(value.every((item) => typeof item === 'string' && words(item) >= 1), `${message}: krever ikke-tomme strenger`);
  check(new Set(value).size === value.length, `${message}: duplikater er ikke tillatt`);
};

export function validateFullFieldContract(area, contract, allAreaIds) {
  check(contract.schema === 'history_go_literature_full_field_contract_v1', `${area.id}: feil fullfeltkontraktschema`);
  check(contract.version === '1.0.0' && contract.subjectId === 'litteratur' && contract.areaId === area.id, `${area.id}: fullfeltkontrakten peker feil`);
  check(['scope_locked_materialization_pending', 'fulfilled'].includes(contract.status), `${area.id}: ugyldig fullfeltstatus`);
  check(words(contract.purpose) >= 18, `${area.id}: fullfeltkontrakten mangler presist formål`);
  const dimensions = contract.requiredDimensions || {};
  uniqueStrings(dimensions.theoryTraditions, 8, `${area.id}: mangler teoribredde`);
  uniqueStrings(dimensions.methods, 8, `${area.id}: mangler metodebredde`);
  uniqueStrings(dimensions.historicalPeriods, 7, `${area.id}: mangler historisk spenn`);
  uniqueStrings(dimensions.geographicalTraditions, 7, `${area.id}: mangler geografisk og tradisjonelt spenn`);
  uniqueStrings(dimensions.mediaAndInstitutions, 8, `${area.id}: mangler medie- og institusjonsbredde`);
  uniqueStrings(dimensions.boundaryAreaIds, 6, `${area.id}: mangler bindende grenseflater`);
  check(dimensions.boundaryAreaIds.every((id) => allAreaIds.has(id) && id !== area.id), `${area.id}: fullfeltkontrakten peker til ukjent grenseområde`);
  uniqueStrings(contract.completionRules, 10, `${area.id}: mangler bindende ferdigregler`);
  check(contract.fulfillmentSchema?.requiredFile && contract.fulfillmentSchema?.statusWhenComplete === 'expanded_contract_fulfilled', `${area.id}: mangler fulfillment-port`);
  check(JSON.stringify(contract.fulfillmentSchema.requiredTopicEvidenceFields) === JSON.stringify(requiredFulfillmentFields), `${area.id}: fulfillment-skjemaet mangler bindende evidensfelt`);
  check(contract.topicRequirements?.length === 6, `${area.id}: fullfeltkontrakten skal ha seks temakrav`);
  check(JSON.stringify(contract.topicRequirements.map((topic) => topic.id)) === JSON.stringify(area.topics), `${area.id}: fullfeltkravene må følge temaene i kontraktrekkefølge`);
  for (const topic of contract.topicRequirements) {
    uniqueStrings(topic.requiredSubcoverage, 7, `${area.id}/${topic.id}: mangler bindende underdekning`);
    uniqueStrings(topic.requiredConcepts, 8, `${area.id}/${topic.id}: mangler komplett begrepskrav`);
    uniqueStrings(topic.theoryTraditions, 4, `${area.id}/${topic.id}: mangler teorikrav`);
    uniqueStrings(topic.methods, 4, `${area.id}/${topic.id}: mangler metodekrav`);
    uniqueStrings(topic.namedAnalysisObjects, 4, `${area.id}/${topic.id}: mangler navngitte analyseobjekter`);
    uniqueStrings(topic.historicalCoverage, 4, `${area.id}/${topic.id}: mangler historisk dekning`);
    uniqueStrings(topic.geographicalCoverage, 4, `${area.id}/${topic.id}: mangler geografisk dekning`);
    uniqueStrings(topic.boundaryAreaIds, 3, `${area.id}/${topic.id}: mangler grenseflater`);
    check(topic.boundaryAreaIds.every((id) => allAreaIds.has(id) && id !== area.id), `${area.id}/${topic.id}: ukjent grenseområde`);
    uniqueStrings(topic.completionEvidence, 6, `${area.id}/${topic.id}: mangler evidenskrav`);
  }
}

function validateFullFieldFulfillment(area, contract, chapter, sections, registry, claims) {
  const file = contract.fulfillmentSchema.requiredFile;
  const fulfillment = read(`data/fag/litteratur/litteraturvitenskap_canonical_v1/${file}`);
  check(fulfillment.schema === 'history_go_literature_full_field_fulfillment_v1' && fulfillment.areaId === area.id, `${area.id}: ugyldig fullfelt-fulfillment`);
  check(fulfillment.status === 'verified' && fulfillment.topicEvidence?.length === 6, `${area.id}: fullfelt-fulfillment er ikke verifisert`);
  check(JSON.stringify(fulfillment.topicEvidence.map((row) => row.topicId)) === JSON.stringify(area.topics), `${area.id}: fulfillment følger ikke kontraktrekkefølgen`);
  const conceptIds = new Set(registry.concepts.map((row) => row.id));
  const claimIds = new Set(claims.claims.map((row) => row.id));
  const sourceIds = new Set(claims.sources.map((row) => row.id));
  const sectionIds = new Set(sections.map((row) => row.id));
  const evidencePointer = (pointer, label) => {
    check(pointer && sectionIds.has(pointer.sectionId) && Number.isInteger(pointer.paragraphIndex), `${area.id}: ugyldig avsnittspeker for ${label}`);
    const section = sections.find((row) => row.id === pointer.sectionId);
    check(pointer.paragraphIndex >= 0 && pointer.paragraphIndex < section.paragraphs.length, `${area.id}: avsnittsindeks utenfor artikkelen for ${label}`);
    check(Array.isArray(pointer.claimIds) && pointer.claimIds.length > 0 && pointer.claimIds.every((id) => claimIds.has(id) && section.paragraphClaimIds[pointer.paragraphIndex].includes(id)), `${area.id}: avsnittspeker mangler gyldig claim-spor for ${label}`);
    return section.paragraphs[pointer.paragraphIndex];
  };
  for (const requirement of contract.topicRequirements) {
    const evidence = fulfillment.topicEvidence.find((row) => row.topicId === requirement.id);
    for (const field of requiredFulfillmentFields) check(field === 'topicId' ? evidence?.topicId : ['subcoverageEvidence', 'theoryEvidence', 'methodEvidence', 'namedObjectEvidence'].includes(field) ? evidence?.[field] && typeof evidence[field] === 'object' && !Array.isArray(evidence[field]) : Array.isArray(evidence?.[field]), `${area.id}/${requirement.id}: fulfillment mangler ${field}`);
    check(evidence.sectionIds.length >= 1 && evidence.sectionIds.every((id) => sectionIds.has(id)), `${area.id}/${requirement.id}: ugyldig artikkelbevis`);
    check(requirement.requiredConcepts.every((id) => evidence.conceptIds.includes(id) && conceptIds.has(id)), `${area.id}/${requirement.id}: begrepskravet er ikke oppfylt`);
    check(evidence.claimIds.length >= 4 && evidence.claimIds.every((id) => claimIds.has(id)), `${area.id}/${requirement.id}: mangler påstandsspor`);
    check(evidence.sourceIds.length >= 3 && evidence.sourceIds.every((id) => sourceIds.has(id)), `${area.id}/${requirement.id}: mangler kildespor`);
    check(evidence.appliedTheoryTraditions.length >= 2 && evidence.appliedTheoryTraditions.every((item) => requirement.theoryTraditions.includes(item)), `${area.id}/${requirement.id}: teoriene er ikke anvendt`);
    check(evidence.appliedMethods.length >= 2 && evidence.appliedMethods.every((item) => requirement.methods.includes(item)), `${area.id}/${requirement.id}: metodene er ikke anvendt`);
    check(evidence.namedAnalysisObjects.length >= 3 && evidence.namedAnalysisObjects.every((item) => requirement.namedAnalysisObjects.includes(item)), `${area.id}/${requirement.id}: analyseobjektene er ikke dokumentert`);
    check(evidence.historicalCoverage.length >= 3 && evidence.historicalCoverage.every((item) => requirement.historicalCoverage.includes(item)), `${area.id}/${requirement.id}: historisk spenn er ikke dokumentert`);
    check(evidence.geographicalCoverage.length >= 3 && evidence.geographicalCoverage.every((item) => requirement.geographicalCoverage.includes(item)), `${area.id}/${requirement.id}: geografisk spenn er ikke dokumentert`);
    check(requirement.boundaryAreaIds.every((id) => evidence.boundaryAreaIds.includes(id)), `${area.id}/${requirement.id}: grenseflatene er ikke dokumentert`);
    check(JSON.stringify(Object.keys(evidence.subcoverageEvidence)) === JSON.stringify(requirement.requiredSubcoverage), `${area.id}/${requirement.id}: ikke alle underkrav har avsnittsevidens`);
    for (const item of requirement.requiredSubcoverage) evidencePointer(evidence.subcoverageEvidence[item], `${requirement.id}/${item}`);
    for (const theory of evidence.appliedTheoryTraditions) evidencePointer(evidence.theoryEvidence[theory], `${requirement.id}/${theory}`);
    for (const method of evidence.appliedMethods) evidencePointer(evidence.methodEvidence[method], `${requirement.id}/${method}`);
    for (const object of evidence.namedAnalysisObjects) {
      const paragraph = evidencePointer(evidence.namedObjectEvidence[object], `${requirement.id}/${object}`);
      const title = object.includes(':') ? object.split(':').slice(1).join(':').trim() : object;
      check(paragraph.includes(title), `${area.id}/${requirement.id}: analyseobjektet ${object} finnes ikke i evidensavsnittet`);
    }
  }
  check(chapter.expandedContractFulfillment === file, `${area.id}: kapittelet peker ikke til validert fulfillment`);
}

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
  check(coverage.completion_definition.requirements_per_area.includes('områder med full_field_contract må ha en validert fulfillment-fil før komplettstatus'), 'Global ferdigdefinisjon mangler fullfelt-port');
  check(coverage.completion_definition.forbidden_shortcuts.includes('seks brede temaoverskrifter brukt som erstatning for bindende underdekning'), 'Global ferdigdefinisjon tillater fortsatt bredde-juks');
  check(index.summary.coverage_area_count === requiredAreaCount && index.summary.required_topic_count === requiredTopicCount, 'Index har feil dekningsmål');
  check(coverage.coverage_areas.length === requiredAreaCount, `Dekningskontrakten skal ha ${requiredAreaCount} områder`);
  check(foundations.areas.length === requiredAreaCount, `Tekstlaget skal ha ${requiredAreaCount} områdesynteser`);

  const requiredAreaIds = coverage.coverage_areas.map((area) => area.id);
  const requiredAreaIdSet = new Set(requiredAreaIds);
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

  const fullFieldContractFiles = coverage.coverage_areas.map((area) => area.full_field_contract).filter(Boolean);
  check(fullFieldContractFiles.length >= 2 && new Set(fullFieldContractFiles).size === fullFieldContractFiles.length, 'Litteratur skal ha unike låste utvidede fullfeltkontrakter');
  check(JSON.stringify(index.files.full_field_contracts) === JSON.stringify(fullFieldContractFiles), 'Index og utvidede fullfeltkontrakter er usynkronisert');
  const fullFieldContracts = new Map();
  for (const area of coverage.coverage_areas.filter((row) => row.full_field_contract)) {
    const contract = read(`data/fag/litteratur/litteraturvitenskap_canonical_v1/${area.full_field_contract}`);
    validateFullFieldContract(area, contract, requiredAreaIdSet);
    fullFieldContracts.set(area.id, contract);
    if (contract.status === 'scope_locked_materialization_pending') check(area.status === 'expanded_contract_scope_locked_materialization_pending', `${area.id}: pending fullfeltkontrakt kan ikke stå som komplett`);
    if (contract.status === 'fulfilled') check(area.status === 'expanded_contract_fulfilled', `${area.id}: fullført fullfeltkontrakt har feil områdestatus`);
  }
  check(index.summary.expanded_contract_count === fullFieldContracts.size, 'Index har feil antall utvidede kontrakter');
  check(index.summary.expanded_contract_fulfilled_count === [...fullFieldContracts.values()].filter((contract) => contract.status === 'fulfilled').length, 'Index har feil antall oppfylte utvidede kontrakter');

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
    const fullFieldContract = fullFieldContracts.get(chapter.id);
    if (fullFieldContract?.status === 'fulfilled') validateFullFieldFulfillment(contractArea, fullFieldContract, chapter, sections, registry, claims);
    if (completedAreaStatuses.has(contractArea.status)) completeAreaIds.add(chapter.id);
  }

  check(index.summary.materialized_module_count === moduleCount, 'Index har feil modulantall');
  check(index.summary.defined_concept_count === conceptCount, 'Index har feil antall definerte begreper');
  check(index.summary.verified_source_count === sourceCount, 'Index har feil kildeantall');
  check(index.summary.verified_claim_count === claimCount, 'Index har feil claim-antall');
  check(coverage.progress.areas_complete === completeAreaIds.size, 'Dekningskontrakten har feil antall ferdige områder');
  check(coverage.progress.topics_complete === [...completeAreaIds].reduce((sum, id) => sum + coverage.coverage_areas.find((area) => area.id === id).topics.length, 0), 'Dekningskontrakten har feil antall ferdige temaer');

  return { areaCount: requiredAreaCount, topicCount: requiredTopicCount, completeAreaCount: completeAreaIds.size, fullDepthChapterCount, expandedContractCount: fullFieldContracts.size, expandedContractFulfilledCount: [...fullFieldContracts.values()].filter((contract) => contract.status === 'fulfilled').length, conceptCount, moduleCount, sourceCount, claimCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditLitteraturScientificPackage();
    console.log(`Litteraturpakke OK: ${result.areaCount} områder, ${result.topicCount} emnetekster, ${result.completeAreaCount} komplette områder, ${result.expandedContractCount} utvidede kontrakter (${result.expandedContractFulfilledCount} oppfylt), ${result.conceptCount} definerte begreper, ${result.moduleCount} moduler, ${result.sourceCount} kilder og ${result.claimCount} claims.`);
  } catch (error) {
    console.error(`Litteraturpakke FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
