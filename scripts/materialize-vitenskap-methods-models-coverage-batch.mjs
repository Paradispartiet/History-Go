#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(p(rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(p(rel), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const replaceOnce = (text, before, after, label) => {
  if (text.includes(after)) return text;
  const count = text.split(before).length - 1;
  assert(count === 1, `${label}: expected exactly one old fragment, found ${count}`);
  return text.replace(before, after);
};

const CHAPTER = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json';
const MODULE = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/04-metoder-maling-modeller.json';
const SUPPLEMENT_BRIEF = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/04-metoder-maling-modeller-brief.json';
const CLAIMS = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const EMNERS = 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json';
const UNIT1_AUDIT = 'scripts/audit-fagverk-vitenskap-unit1.mjs';
const UNIT1_TEST = 'tests/fagverk-vitenskap-unit1.test.mjs';

const EXPECTED_BATCH = [
  'em_vit_abstraksjon_forenkling',
  'em_vit_algoritmer_data',
  'em_vit_eksperiment_variabler',
  'em_vit_empiri_evidens',
  'em_vit_hypotese_observasjon',
  'em_vit_kalibrering_presisjon',
  'em_vit_kategorisering',
  'em_vit_klassifikasjon_taksonomi',
  'em_vit_konsensus_uenighet',
  'em_vit_kontroll_replikasjon',
  'em_vit_metodekritikk',
  'em_vit_modeller_simulering',
  'em_vit_standardisering',
  'em_vit_statistikk_sannsynlighet',
  'em_vit_usikkerhet_feilkilder',
  'em_vit_eksperiment_maling',
  'em_vit_matematikk_modellering'
];

const chapter = read(CHAPTER);
const module = read(MODULE);
const supplementBrief = read(SUPPLEMENT_BRIEF);
const emners = read(EMNERS);
const registry = read(REGISTRY);
const claimsDocument = read(CLAIMS);
const emneById = new Map(emners.map((row) => [row.emne_id, row]));

assert(module.coverageTreatments?.length === 17, 'Supplement must contain 17 coverage treatments');
assert(new Set(module.coverageTreatments.map((row) => row.emne_id)).size === 17, 'Supplement has duplicate coverage treatment IDs');
assert(EXPECTED_BATCH.every((id) => module.coverageTreatments.some((row) => row.emne_id === id)), 'Supplement does not cover exact batch');
assert(supplementBrief.requiredEmneIds?.length === 17 && EXPECTED_BATCH.every((id) => supplementBrief.requiredEmneIds.includes(id)), 'Supplement brief has wrong emne set');
for (const id of EXPECTED_BATCH) assert(emneById.has(id), `Unknown canonical emne ${id}`);

const oldCoreEmnes = [...chapter.emne_ids];
for (const id of EXPECTED_BATCH) if (!chapter.emne_ids.includes(id)) chapter.emne_ids.push(id);
assert(chapter.emne_ids.length === oldCoreEmnes.length + EXPECTED_BATCH.length, 'Chapter emne extension has unexpected size');
assert(new Set(chapter.emne_ids).size === chapter.emne_ids.length, 'Chapter emne IDs are not unique');

const supplementMethods = EXPECTED_BATCH.flatMap((id) => emneById.get(id).methods || []);
for (const id of supplementMethods) if (!chapter.method_ids.includes(id)) chapter.method_ids.push(id);
chapter.method_ids = [...new Set(chapter.method_ids)];
if (!chapter.moduleFiles.includes(MODULE)) chapter.moduleFiles.push(MODULE);
chapter.editorialCoverageSupplements ||= [];
const supplementMeta = {
  id: 'metoder_maling_modeller',
  domain_id: 'metoder_maling_modeller',
  moduleFile: MODULE,
  briefFile: SUPPLEMENT_BRIEF,
  emne_ids: EXPECTED_BATCH,
  explicitFulltextTreatment: true,
  claimTraceRequired: true
};
const existingSupplementIndex = chapter.editorialCoverageSupplements.findIndex((row) => row.id === supplementMeta.id);
if (existingSupplementIndex >= 0) chapter.editorialCoverageSupplements[existingSupplementIndex] = supplementMeta;
else chapter.editorialCoverageSupplements.push(supplementMeta);
chapter.version = '1.2.0';
write(CHAPTER, chapter);

const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
assert(registryChapter, 'Registry is missing Unit 1 chapter');
registryChapter.emne_ids = [...chapter.emne_ids];
registryChapter.editorialCoverageSupplements ||= [];
const registrySupplementIndex = registryChapter.editorialCoverageSupplements.findIndex((row) => row.id === supplementMeta.id);
if (registrySupplementIndex >= 0) registryChapter.editorialCoverageSupplements[registrySupplementIndex] = supplementMeta;
else registryChapter.editorialCoverageSupplements.push(supplementMeta);
registry.version = '3.07.0';
registry.updatedAt = '2026-08-18';
write(REGISTRY, registry);

const newSources = [
  {
    id: 'vit1-11-nist-stat-handbook',
    label: 'NIST/SEMATECH – e-Handbook of Statistical Methods',
    url: 'https://www.itl.nist.gov/div898/handbook/',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-statistical-methods-handbook',
    source_location: 'Handbook index and the Process Modeling and Process Improvement chapters covering exploratory analysis, statistical modelling, experimental design and diagnostics'
  },
  {
    id: 'vit1-12-nist-experimental-design',
    label: 'NIST/SEMATECH – What is experimental design?',
    url: 'https://www.itl.nist.gov/div898/handbook/pri/section1/pri11.htm',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-experimental-design-guidance',
    source_location: 'Process Improvement section 5.1.1 defining experimental design through deliberate changes to process factors and observation of response variables for valid and objective conclusions'
  },
  {
    id: 'vit1-13-nist-model-validation',
    label: 'NIST/SEMATECH – Model Validation',
    url: 'https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-statistical-model-validation-guidance',
    source_location: 'Process Modeling section 4.4 on model validation, especially residual analysis and the warning that summary statistics such as R-squared are not sufficient by themselves'
  },
  {
    id: 'vit1-14-nist-model-building',
    label: 'NIST/SEMATECH – Model Building',
    url: 'https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd41.htm',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-statistical-model-building-guidance',
    source_location: 'Process Modeling section 4.1 describing iterative model selection, parameter estimation and assessment/validation using data, assumptions and subject-matter knowledge'
  },
  {
    id: 'vit1-15-nist-rdaf',
    label: 'NIST – Research Data Framework (RDaF), version 2.0',
    url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/1500-18/NIST.SP.1500-18r2.html',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-research-data-framework',
    source_location: 'Research Data Lifecycle and documentation material covering data provenance and documentation of instruments, software, methods, parameters, calibration and processing context'
  },
  {
    id: 'vit1-16-nist-numerical-reproducibility',
    label: 'NIST – Numerical Reproducibility',
    url: 'https://www.nist.gov/programs-projects/numerical-reproducibility',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-computational-reproducibility-project',
    source_location: 'Project overview identifying numerical differences associated with library versions, floating-point precision, compiler choices and CPU/GPU architectures'
  },
  {
    id: 'vit1-17-ncbi-taxonomy-help',
    label: 'NCBI – Taxonomy Help',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK53758/',
    publisher: 'National Center for Biotechnology Information',
    type: 'official-scientific-taxonomy-documentation',
    source_location: 'NCBI Taxonomy documentation describing curated organism names, classifications/lineages and their use with molecular sequence data'
  },
  {
    id: 'vit1-18-iczn-preamble',
    label: 'International Code of Zoological Nomenclature – Preamble',
    url: 'https://code.iczn.org/preamble/',
    publisher: 'International Commission on Zoological Nomenclature',
    type: 'international-nomenclature-code',
    source_location: 'Preamble explaining the objective of stability and universality in scientific animal names while stating that the Code does not restrict freedom of taxonomic thought or actions'
  }
];

for (const source of newSources) {
  const index = claimsDocument.sources.findIndex((row) => row.id === source.id);
  if (index >= 0) claimsDocument.sources[index] = source;
  else claimsDocument.sources.push(source);
}

const newClaims = [
  {id:'vit1-19',claim:'NIST beskriver eksperimentdesign som planlagt endring av én eller flere faktorer og observasjon av virkningen på responsvariabler for å trekke gyldige og objektive konklusjoner om prosessen eller systemet som studeres.',source_ids:['vit1-12-nist-experimental-design'],classification:'experimental-design',status:'verified',used_in:['vit1-metoder-1']},
  {id:'vit1-20',claim:'Styrken i empirisk evidens avhenger av hvordan design, måling og analyse knytter observerte data til den konkrete påstanden og til relevante alternative forklaringer; rigor krever derfor mer enn at data eksisterer.',source_ids:['vit1-12-nist-experimental-design','vit1-07-nih-rigor'],classification:'methodological-synthesis',status:'verified',used_in:['vit1-metoder-1']},
  {id:'vit1-21',claim:'NISTs metrologiveiledning skiller den dokumenterte sporbarheten til et konkret måleresultat fra instrumentets kalibreringsstatus og krever at referansekjede og måleusikkerhet følger resultatet.',source_ids:['vit1-04-nist-traceability-policy','vit1-05-nist-traceability-faq'],classification:'metrology-distinction',status:'verified',used_in:['vit1-metoder-2']},
  {id:'vit1-22',claim:'Måleusikkerhet og identifiserte feilkilder må vurderes i forhold til størrelsen på effekten eller forskjellen som skal tolkes; flere desimaler alene etablerer ikke sterkere evidens.',source_ids:['vit1-05-nist-traceability-faq','vit1-11-nist-stat-handbook'],classification:'measurement-uncertainty',status:'verified',used_in:['vit1-metoder-2']},
  {id:'vit1-23',claim:'NISTs statistikkhåndbok organiserer statistisk analyse rundt dataenes struktur, prosessmodellering og eksperimentdesign, slik at estimater og sannsynlighetsutsagn må leses sammen med datagenererende prosess og modellforutsetninger.',source_ids:['vit1-11-nist-stat-handbook'],classification:'statistical-inference',status:'verified',used_in:['vit1-metoder-3']},
  {id:'vit1-24',claim:'NISTs modellvalideringsveiledning understreker at høy R-squared eller andre sammendragsmål ikke alene er tilstrekkelig til å validere en modell; residualer og andre diagnostiske kontroller må undersøkes.',source_ids:['vit1-13-nist-model-validation'],classification:'model-validation',status:'verified',used_in:['vit1-metoder-3']},
  {id:'vit1-25',claim:'NIST beskriver statistisk modellbygging som en iterativ prosess der modellvalg, tilpasning og validering kombinerer data, antakelser og fagkunnskap; modellen må derfor vurderes som en formålsbundet representasjon.',source_ids:['vit1-14-nist-model-building','vit1-13-nist-model-validation'],classification:'model-building',status:'verified',used_in:['vit1-metoder-4']},
  {id:'vit1-26',claim:'At en beregning eller simulering er numerisk eller implementasjonsmessig konsistent etablerer ikke alene empirisk modelladekvathet; modellens antakelser, validering mot relevante data og følsomhet for implementasjonsvalg må vurderes separat.',source_ids:['vit1-13-nist-model-validation','vit1-16-nist-numerical-reproducibility'],classification:'verification-validation-synthesis',status:'verified',used_in:['vit1-metoder-4']},
  {id:'vit1-27',claim:'NCBI Taxonomy er et kuratert operasjonelt system der organismenavn og klassifikasjoner brukes til å organisere og koble biologiske sekvensdata, og illustrerer hvordan kategorier fungerer som vitenskapelig datainfrastruktur.',source_ids:['vit1-17-ncbi-taxonomy-help'],classification:'classification-infrastructure',status:'verified',used_in:['vit1-metoder-5']},
  {id:'vit1-28',claim:'ICZN skiller nomenklaturens mål om stabile og universelle zoologiske navn fra selve taksonomiske tenkningen ved uttrykkelig å ikke begrense forskeres frihet til taxonomic thought or actions.',source_ids:['vit1-17-ncbi-taxonomy-help','vit1-18-iczn-preamble'],classification:'nomenclature-taxonomy-boundary',status:'verified',used_in:['vit1-metoder-5']},
  {id:'vit1-29',claim:'NIST Research Data Framework behandler dokumentasjon av dataenes proveniens sammen med instrumenter, programvare, metoder, parametre, kalibrering og prosesseringskontekst som deler av en granskbar forskningsdata-livssyklus.',source_ids:['vit1-15-nist-rdaf'],classification:'research-data-provenance',status:'verified',used_in:['vit1-metoder-6']},
  {id:'vit1-30',claim:'NISTs Numerical Reproducibility-prosjekt dokumenterer at bibliotekversjoner, flyttallspresisjon, kompilatorvalg og CPU/GPU-arkitektur kan påvirke numerisk reproducerbarhet, slik at kjøremiljøet kan være et materiell metodetrinn.',source_ids:['vit1-16-nist-numerical-reproducibility'],classification:'numerical-reproducibility',status:'verified',used_in:['vit1-metoder-6']},
  {id:'vit1-31',claim:'Uavhengig kontroll, reanalyse og replikasjon kan gi konvergerende støtte til et kunnskapsgrunnlag uten å kreve identiske resultater eller enstemmighet; avvik må lokaliseres i design, data, måling, analyse eller fortolkning.',source_ids:['vit1-06-nasem-reproducibility','vit1-08-nih-peer-review'],classification:'consensus-and-critical-control-synthesis',status:'verified',used_in:['vit1-metoder-1','vit1-metoder-7']},
  {id:'vit1-32',claim:'Standardiserte metoder og vitenskapelig rigor skal gjøre arbeid mer sammenlignbart og kontrollert, men gyldigheten av en konkret slutning krever fortsatt kritikk av design, måling, analyse, feilkilder og bruksområde.',source_ids:['vit1-11-nist-stat-handbook','vit1-07-nih-rigor'],classification:'standardization-method-critique-synthesis',status:'verified',used_in:['vit1-metoder-7']}
];
for (const claim of newClaims) {
  const index = claimsDocument.claims.findIndex((row) => row.id === claim.id);
  if (index >= 0) claimsDocument.claims[index] = claim;
  else claimsDocument.claims.push(claim);
}
claimsDocument.version = '1.1.0';
claimsDocument.verified_at = '2026-08-18';
write(CLAIMS, claimsDocument);

let auditText = fs.readFileSync(p(UNIT1_AUDIT), 'utf8');
auditText = replaceOnce(
  auditText,
  "const EXPECTED_METHODS = [\n  'met_vit_institusjonsanalyse',\n  'met_vit_kalibreringsanalyse',\n  'met_vit_usikkerhetsanalyse',\n  'met_vit_fagfelleanalyse',\n  'met_vit_feilkildeanalyse'\n];",
  "const EXPECTED_METHODS = [\n  'met_vit_institusjonsanalyse',\n  'met_vit_kalibreringsanalyse',\n  'met_vit_usikkerhetsanalyse',\n  'met_vit_fagfelleanalyse',\n  'met_vit_feilkildeanalyse'\n];\nconst CORE_MODULE_FILES = [\n  'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/01-grunnlag.json',\n  'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/02-fordypning.json',\n  'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/03-anvendelse.json'\n];",
  'add Unit1 core module contract'
);
auditText = replaceOnce(
  auditText,
  "  assert(sameSet(chapter.emne_ids || [], EXPECTED_EMNES), 'Kapittelroot har feil emnesett');\n  assert(sameSet(chapter.method_ids || [], EXPECTED_METHODS), 'Kapittelroot har feil metodesett');\n  assert(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length === 3, 'Unit 1 skal ha tre redigerte moduler');",
  "  assert(EXPECTED_EMNES.every((id) => chapter.emne_ids?.includes(id)), 'Kapittelroot mangler historisk Unit 1-emnekjerne');\n  assert(new Set(chapter.emne_ids || []).size === (chapter.emne_ids || []).length, 'Kapittelroot har dupliserte emne-ID-er');\n  assert((chapter.emne_ids || []).every((id) => emneById.has(id)), 'Kapittelroot peker til ukjent canonicalt emne');\n  assert(EXPECTED_METHODS.every((id) => chapter.method_ids?.includes(id)), 'Kapittelroot mangler historisk Unit 1-metodekjerne');\n  assert(new Set(chapter.method_ids || []).size === (chapter.method_ids || []).length, 'Kapittelroot har dupliserte metode-ID-er');\n  assert((chapter.method_ids || []).every((id) => methodIds.has(id)), 'Kapittelroot peker til ukjent canonical metode');\n  assert(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length >= 3, 'Unit 1 må bevare minst tre redigerte kjernemoduler');\n  assert(CORE_MODULE_FILES.every((file) => chapter.moduleFiles.includes(file)), 'Unit 1 mangler en historisk kjernemodul');",
  'make Unit1 root contract monotone'
);
auditText = replaceOnce(
  auditText,
  "  const modules = chapter.moduleFiles.map(json);\n  const sections = modules.flatMap((module) => module.sections || []);\n  assert(sections.length === 9, 'Unit 1 skal ha ni redigerte seksjoner');\n  assert(new Set(sections.map((s) => s.id)).size === sections.length, 'Unit 1 har dupliserte seksjons-ID-er');\n  const paragraphs = sections.flatMap((section) => section.paragraphs || []);\n  assert(paragraphs.length === 27, 'Unit 1 skal ha 27 redigerte fagavsnitt');",
  "  const modules = chapter.moduleFiles.map(json);\n  const coreModules = CORE_MODULE_FILES.map(json);\n  const coreSections = coreModules.flatMap((module) => module.sections || []);\n  assert(coreSections.length === 9, 'Unit 1 skal bevare ni historiske kjerneseksjoner');\n  const coreParagraphs = coreSections.flatMap((section) => section.paragraphs || []);\n  assert(coreParagraphs.length === 27, 'Unit 1 skal bevare 27 historiske kjerneavsnitt');\n  const sections = modules.flatMap((module) => module.sections || []);\n  assert(sections.length >= 9, 'Unit 1 kan ikke miste redigerte seksjoner ved senere coverage-utvidelser');\n  assert(new Set(sections.map((s) => s.id)).size === sections.length, 'Unit 1 har dupliserte seksjons-ID-er');\n  const paragraphs = sections.flatMap((section) => section.paragraphs || []);\n  assert(paragraphs.length >= 27, 'Unit 1 kan ikke miste redigerte fagavsnitt ved senere coverage-utvidelser');",
  'make Unit1 section totals monotone'
);
auditText = replaceOnce(auditText, "  assert(sources.length === 10, 'Unit 1 skal ha ti inspiserbare eksterne kilder');", "  assert(sources.length >= 10, 'Unit 1 kan ikke miste de ti inspiserbare eksterne kjernekildene');", 'make Unit1 sources monotone');
auditText = replaceOnce(auditText, "  assert(claims.length === 18, 'Unit 1 skal ha atten verifiserte claims');", "  assert(claims.length >= 18, 'Unit 1 kan ikke miste de atten verifiserte kjerneclaimsene');", 'make Unit1 claims monotone');
auditText = replaceOnce(
  auditText,
  "  assert(workedExamples.length === 2 && workedExamples.every((row) => row.analysis?.length >= 4), 'Unit 1 skal ha to substansielle worked examples');\n  assert(applicationTasks.length === 4 && applicationTasks.every((row) => row.prompts?.length >= 3), 'Unit 1 skal ha fire anvendelsesoppgaver');\n  assert(selfCheck.length === 6 && selfCheck.every((row) => row.question && row.answer), 'Unit 1 skal ha seks self-check-spørsmål');\n  assert(misconceptions.length === 4 && misconceptions.every((row) => row.claim && row.correction), 'Unit 1 skal ha fire eksplisitte misoppfatninger');",
  "  assert(workedExamples.length >= 2 && workedExamples.every((row) => row.analysis?.length >= 4), 'Unit 1 skal bevare minst to substansielle worked examples');\n  assert(applicationTasks.length >= 4 && applicationTasks.every((row) => row.prompts?.length >= 3), 'Unit 1 skal bevare minst fire anvendelsesoppgaver');\n  assert(selfCheck.length >= 6 && selfCheck.every((row) => row.question && row.answer), 'Unit 1 skal bevare minst seks self-check-spørsmål');\n  assert(misconceptions.length >= 4 && misconceptions.every((row) => row.claim && row.correction), 'Unit 1 skal bevare minst fire eksplisitte misoppfatninger');",
  'make Unit1 pedagogy totals monotone'
);
auditText = replaceOnce(
  auditText,
  "      reproducibilityReplicationDistinctionPresent: true\n    }",
  "      reproducibilityReplicationDistinctionPresent: true,\n      originalCoreContractPreserved: true,\n      laterEditorialCoverageExtensionsAllowed: true\n    }",
  'add Unit1 monotone gates'
);
fs.writeFileSync(p(UNIT1_AUDIT), auditText);

let testText = fs.readFileSync(p(UNIT1_TEST), 'utf8');
testText = replaceOnce(
  testText,
  "  assert.deepEqual(report.summary, {\n    emneCount: 8,\n    methodCount: 5,\n    moduleCount: 3,\n    sectionCount: 9,\n    paragraphCount: 27,\n    sourceCount: 10,\n    claimCount: 18,\n    workedExampleCount: 2,\n    applicationTaskCount: 4,\n    selfCheckCount: 6\n  });",
  "  assert.ok(report.summary.emneCount >= 8);\n  assert.ok(report.summary.methodCount >= 5);\n  assert.ok(report.summary.moduleCount >= 3);\n  assert.ok(report.summary.sectionCount >= 9);\n  assert.ok(report.summary.paragraphCount >= 27);\n  assert.ok(report.summary.sourceCount >= 10);\n  assert.ok(report.summary.claimCount >= 18);\n  assert.ok(report.summary.workedExampleCount >= 2);\n  assert.ok(report.summary.applicationTaskCount >= 4);\n  assert.ok(report.summary.selfCheckCount >= 6);",
  'make Unit1 test summary monotone'
);
testText = replaceOnce(
  testText,
  "  assert.equal(report.gates.technologyRemainsNested, true);",
  "  assert.equal(report.gates.technologyRemainsNested, true);\n  assert.equal(report.gates.originalCoreContractPreserved, true);\n  assert.equal(report.gates.laterEditorialCoverageExtensionsAllowed, true);",
  'assert Unit1 monotone extension gates'
);
fs.writeFileSync(p(UNIT1_TEST), testText);

console.log(JSON.stringify({
  chapterEmneCount: chapter.emne_ids.length,
  chapterMethodCount: chapter.method_ids.length,
  moduleCount: chapter.moduleFiles.length,
  sourceCount: claimsDocument.sources.length,
  claimCount: claimsDocument.claims.length,
  addedCoverageCount: EXPECTED_BATCH.length
}, null, 2));
