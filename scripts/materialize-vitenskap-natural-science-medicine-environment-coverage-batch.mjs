#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  module: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/08-natur-medisin-miljo.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/08-natur-medisin-miljo-brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  batch4Audit: 'scripts/audit-fagverk-vitenskap-digital-science-data-infrastructure-coverage.mjs'
});
const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
const uniq = (items) => [...new Set(items)];

const EMNES = [
  'em_vit_biologi_klassifikasjon','em_vit_epidemiologi','em_vit_feltarbeid','em_vit_geologi_tid','em_vit_klima_maling',
  'em_vit_miljokunnskap_politikk','em_vit_miljoovervaking','em_vit_okologi_system','em_vit_prover_materialer','em_vit_systemtenkning',
  'em_vit_feltarbeid_observasjon','em_vit_medisin_helse','em_vit_miljo_okologi_system'
];
const METHODS = [
  'met_vit_biologihistorisk_analyse','met_vit_klassifikasjonsanalyse','met_vit_epidemiologisk_analyse','met_vit_statistisk_analyse',
  'met_vit_feltarbeidsanalyse','met_vit_observasjonsanalyse','met_vit_geologisk_analyse','met_vit_tidsskalaanalyse','met_vit_klimaanalyse',
  'met_vit_miljopolitisk_kunnskapsanalyse','met_vit_tillitsanalyse','met_vit_miljoanalyse','met_vit_sensoranalyse','met_vit_okologisk_analyse',
  'met_vit_systemanalyse','met_vit_materialanalyse','met_vit_laboratorieanalyse','met_vit_kildekritisk_analyse','met_vit_evidensanalyse','met_vit_institusjonsanalyse'
];
const SUPPLEMENT = {
  id: 'natur_medisin_miljo',
  domain_id: 'natur_medisin_miljo',
  moduleFile: P.module,
  briefFile: P.brief,
  emne_ids: EMNES,
  explicitFulltextTreatment: true,
  claimTraceRequired: true,
  boundary: 'Natur retains organism-near biology, ecology, geology and environmental subject-matter depth; this Vitenskap supplement owns classification, observation, sampling, measurement, inference and evidence-chain methods.'
};

const SOURCES = [
  {
    id:'vit1-41-cdc-principles-epi', label:'CDC – Principles of Epidemiology, Lesson 1',
    url:'https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson1/section1.html', publisher:'Centers for Disease Control and Prevention',
    type:'official-public-health-training-reference',
    source_location:'Lesson 1 definition and methodological framing of epidemiology as systematic, data-driven study of distribution and determinants in specified populations and application of findings to control of health problems.'
  },
  {
    id:'vit1-42-cdc-field-epi', label:'CDC Field Epidemiology Manual – Analyzing and Interpreting Data',
    url:'https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html', publisher:'Centers for Disease Control and Prevention',
    type:'official-public-health-methods-manual',
    source_location:'Interpretation guidance covering confounding, chance, selection bias, information bias, statistical versus public-health significance and criteria relevant to causal interpretation.'
  },
  {
    id:'vit1-43-usgs-geologic-time', label:'USGS – Radiometric Time Scale',
    url:'https://pubs.usgs.gov/gip/geotime/radiometric.html', publisher:'U.S. Geological Survey',
    type:'official-geoscience-reference',
    source_location:'Radiometric time-scale material on radioactive decay, parent/daughter isotope systems, material suitability, laboratory measurement, relative versus numerical age and cross-checking geologic ages.'
  },
  {
    id:'vit1-44-wmo-imop', label:'WMO – Instruments and Methods of Observation Programme',
    url:'https://wmo.int/activities/instruments-and-methods-of-observation-programme-imop', publisher:'World Meteorological Organization',
    type:'international-observation-standards-programme',
    source_location:'Programme overview on technical standards, documentation, intercomparison and quality control for meteorological and environmental observing instruments and methods under differing conditions.'
  },
  {
    id:'vit1-45-wmo-gcos', label:'WMO – Global Climate Observing System (GCOS)',
    url:'https://wmo.int/activities/global-climate-observing-system-gcos', publisher:'World Meteorological Organization',
    type:'international-climate-observing-system',
    source_location:'GCOS overview describing systematic long-term observations across atmosphere, land and ocean and the Essential Climate Variables required to characterize the climate system.'
  },
  {
    id:'vit1-46-epa-field-sampling', label:'EPA – Field Sampling and Measurement Procedures and Procedure Validation',
    url:'https://www.epa.gov/quality/field-sampling-and-measurement-procedures-and-procedure-validation', publisher:'U.S. Environmental Protection Agency',
    type:'official-environmental-quality-guidance',
    source_location:'EPA quality-system guidance for documented field sampling and measurement procedures, validation and quality-control practices that make field-generated data interpretable and defensible.'
  },
  {
    id:'vit1-47-gbif-occurrence-quality', label:'GBIF – Handling data quality',
    url:'https://docs.gbif.org/course-introduction-to-gbif/en/handling-data-quality.html', publisher:'Global Biodiversity Information Facility',
    type:'official-biodiversity-data-guidance',
    source_location:'GBIF training guidance on fitness for use, uneven sampling across geography and taxonomic groups, taxonomic misidentification and the need to assess occurrence-data quality for the intended analysis.'
  },
  {
    id:'vit1-48-epa-ecological-risk', label:'EPA – Conducting an Ecological Risk Assessment',
    url:'https://www.epa.gov/risk/conducting-ecological-risk-assessment', publisher:'U.S. Environmental Protection Agency',
    type:'official-ecological-risk-framework',
    source_location:'EPA framework describing planning and problem formulation, assessment endpoints, conceptual models, analysis plans, exposure/effects analysis, risk characterization and explicit treatment of assumptions and uncertainties before risk-management decisions.'
  }
];

const CLAIMS = [
  {
    id:'vit1-73',
    claim:'NCBI Taxonomy and zoological nomenclature provide stable identifiers and classification lineages for linking biological records, but nomenclatural stability is not identical to a final hypothesis about species boundaries or phylogeny; GBIF additionally warns that occurrence records can contain taxonomic misidentification and uneven sampling, so classification and occurrence data must be assessed for fitness for the intended inference.',
    source_ids:['vit1-17-ncbi-taxonomy-help','vit1-18-iczn-preamble','vit1-47-gbif-occurrence-quality'], classification:'classification-occurrence-boundary', status:'verified', used_in:['vit1-natur-1']
  },
  {
    id:'vit1-74',
    claim:'CDC defines epidemiology as systematic, data-driven study of distribution and determinants in specified populations and its Field Epidemiology Manual requires interpretation to consider confounding, chance, selection bias and information bias; an observed population association therefore requires design-based evaluation before causal interpretation.',
    source_ids:['vit1-41-cdc-principles-epi','vit1-42-cdc-field-epi'], classification:'epidemiologic-inference-boundary', status:'verified', used_in:['vit1-natur-2']
  },
  {
    id:'vit1-75',
    claim:'NIH guidance on clinical studies distinguishes strengths and weaknesses of study designs and notes that randomized trials are powerful for particular intervention questions but are not always possible or sufficient, while NIH scientific-rigor guidance requires unbiased design, methodology, analysis, interpretation and reporting; evidential strength therefore depends on question, population, bias structure and context of use rather than a universal design hierarchy.',
    source_ids:['vit1-22-nih-clinical-studies','vit1-07-nih-rigor'], classification:'medical-evidence-context', status:'verified', used_in:['vit1-natur-2']
  },
  {
    id:'vit1-76',
    claim:'EPA field-sampling quality guidance treats documented sampling and measurement procedures, procedure validation and quality controls as part of the evidence chain, so field observations must be interpreted together with where, when and how the observation or sample was generated rather than as context-free values.',
    source_ids:['vit1-46-epa-field-sampling'], classification:'fieldwork-design-and-documentation', status:'verified', used_in:['vit1-natur-3']
  },
  {
    id:'vit1-77',
    claim:'GBIF identifies uneven sampling and taxonomic misidentification as important limitations of biodiversity occurrence data, while EPA requires documented field procedures; a non-record or sparse record cannot therefore be treated as demonstrated absence unless sampling effort, detection process and identification quality support that inference.',
    source_ids:['vit1-47-gbif-occurrence-quality','vit1-46-epa-field-sampling'], classification:'field-observation-detection-limit', status:'verified', used_in:['vit1-natur-3']
  },
  {
    id:'vit1-78',
    claim:'EPA field-sampling guidance and NIST Research Data Framework both make procedure, quality control and provenance relevant to interpretation of samples and derived data; sample identity must therefore include collection context, handling and transformation history, while analytical precision alone cannot establish that a sample represents the intended site or population.',
    source_ids:['vit1-46-epa-field-sampling','vit1-15-nist-rdaf'], classification:'sample-provenance-representativeness', status:'verified', used_in:['vit1-natur-3']
  },
  {
    id:'vit1-79',
    claim:'USGS explains geologic time through complementary relative relationships and radiometric dating, where suitable minerals and isotope systems provide numerical ages under material-specific assumptions; a reported age must therefore be tied to the dated material, method and geologic context rather than treated as a direct reading of the event of interest.',
    source_ids:['vit1-43-usgs-geologic-time'], classification:'geologic-time-evidence-chain', status:'verified', used_in:['vit1-natur-4']
  },
  {
    id:'vit1-80',
    claim:'WMO observation programmes use standards, documented methods and quality control across instruments and observing conditions, GCOS coordinates systematic long-term observations of Essential Climate Variables, and NIST metrological traceability ties measurement results to documented reference chains and uncertainty; climate measurement therefore depends on observation-system continuity and metadata as well as instrument output.',
    source_ids:['vit1-44-wmo-imop','vit1-45-wmo-gcos','vit1-04-nist-traceability-policy'], classification:'climate-observation-system', status:'verified', used_in:['vit1-natur-5']
  },
  {
    id:'vit1-81',
    claim:'WMO climate-observing frameworks require systematic long-term observations and quality-controlled methods, while IPCC uncertainty guidance uses calibrated evidence/confidence language; environmental monitoring must therefore evaluate network design, representativeness, methodological changes and uncertainty rather than equating a precise sensor reading with a validated spatial or temporal trend.',
    source_ids:['vit1-44-wmo-imop','vit1-45-wmo-gcos','vit1-32-ipcc-uncertainty'], classification:'environmental-monitoring-inference', status:'verified', used_in:['vit1-natur-5']
  },
  {
    id:'vit1-82',
    claim:'EPA ecological risk assessment begins with problem formulation that defines assessment endpoints, stressors, exposure pathways and conceptual models before analysis; ecological system analysis therefore requires an explicit system boundary and stated endpoints rather than an unrestricted claim that all components are equally relevant.',
    source_ids:['vit1-48-epa-ecological-risk'], classification:'ecological-system-scope', status:'verified', used_in:['vit1-natur-6']
  },
  {
    id:'vit1-83',
    claim:'In EPA ecological risk assessment, conceptual models organize hypothesized relationships among sources, stressors, pathways and ecological receptors and guide an analysis plan; system thinking is therefore scientifically useful when it generates explicit, testable relations and data needs, not when complexity itself is treated as evidence.',
    source_ids:['vit1-48-epa-ecological-risk'], classification:'system-thinking-conceptual-model', status:'verified', used_in:['vit1-natur-6']
  },
  {
    id:'vit1-84',
    claim:'EPA ecological risk assessment requires assessment endpoints and exposure/effects analysis at defined ecological entities and attributes, with uncertainties carried into risk characterization; effects observed at one biological level cannot therefore be transferred automatically to population, community or ecosystem conclusions without an explicit mechanism and appropriate evidence.',
    source_ids:['vit1-48-epa-ecological-risk'], classification:'multi-level-ecological-inference', status:'verified', used_in:['vit1-natur-6']
  },
  {
    id:'vit1-85',
    claim:'EPA separates scientific ecological risk assessment and risk characterization from subsequent risk-management decisions, while IPCC uncertainty guidance supports calibrated communication of evidential confidence; environmental science can characterize effects, exposure and uncertainty without by itself determining the normative priorities or acceptable-risk rule used for policy.',
    source_ids:['vit1-48-epa-ecological-risk','vit1-32-ipcc-uncertainty'], classification:'environmental-science-policy-boundary', status:'verified', used_in:['vit1-natur-7']
  }
];

function upsert(rows, newRows) {
  const byId = new Map(rows.map((row, i) => [row.id, i]));
  for (const row of newRows) {
    if (byId.has(row.id)) rows[byId.get(row.id)] = row;
    else { byId.set(row.id, rows.length); rows.push(row); }
  }
}

function makeBatch4Monotone() {
  const file = abs(P.batch4Audit);
  let text = fs.readFileSync(file, 'utf8');
  const replacements = [
    [
      "assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount === 89, 'Holistic owned-count skal være 89 etter batch 4');",
      "assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 89, 'Holistic owned-count kan ikke regressere under 89 etter batch 4');"
    ],
    [
      "assert(holistic.canonicalInventory.explicitUncoveredEmneCount === 28, 'Holistic uncovered-count skal være 28 etter batch 4');",
      "assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 28, 'Holistic uncovered-count kan ikke regressere over 28 etter batch 4');"
    ],
    [
      "assert(holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap')?.count === 28, 'Holistic coverage blocker skal være 28');",
      "assert(holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap')?.count <= 28, 'Holistic coverage blocker kan ikke regressere over 28 etter batch 4');"
    ]
  ];
  for (const [before, after] of replacements) {
    if (text.includes(after)) continue;
    if (!text.includes(before)) throw new Error(`Batch 4 monotonic patch target not found: ${before}`);
    text = text.replace(before, after);
  }
  fs.writeFileSync(file, text);
}

const chapter = read(P.chapter);
const module = read(P.module);
const brief = read(P.brief);
const claims = read(P.claims);
const registry = read(P.registry);

if (module.domain_id !== 'natur_medisin_miljo' || brief.domain_id !== 'natur_medisin_miljo') throw new Error('Batch 5 static files have wrong domain');
if (module.coverageTreatments?.length !== 13 || brief.requiredEmneIds?.length !== 13) throw new Error('Batch 5 static files must cover 13 emner');
makeBatch4Monotone();

chapter.version = '1.6.0';
chapter.emne_ids = uniq([...(chapter.emne_ids || []), ...EMNES]);
chapter.method_ids = uniq([...(chapter.method_ids || []), ...METHODS]);
chapter.moduleFiles = uniq([...(chapter.moduleFiles || []), P.module]);
chapter.editorialCoverageSupplements = [
  ...(chapter.editorialCoverageSupplements || []).filter((row) => row.id !== SUPPLEMENT.id),
  SUPPLEMENT
];

claims.version = '1.5.0';
claims.verified_at = '2026-08-18';
claims.sources ||= [];
claims.claims ||= [];
upsert(claims.sources, SOURCES);
upsert(claims.claims, CLAIMS);

const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
if (!registryChapter) throw new Error('Unit 1 missing in registry');
registry.version = '3.11.0';
registry.updatedAt = '2026-08-18';
registryChapter.emne_ids = [...chapter.emne_ids];
registryChapter.editorialCoverageSupplements = [
  ...(registryChapter.editorialCoverageSupplements || []).filter((row) => row.id !== SUPPLEMENT.id),
  SUPPLEMENT
];

write(P.chapter, chapter);
write(P.claims, claims);
write(P.registry, registry);
console.log(JSON.stringify({
  chapterVersion: chapter.version,
  registryVersion: registry.version,
  chapterEmneCount: chapter.emne_ids.length,
  addedBatchEmnes: EMNES.length,
  sources: claims.sources.length,
  claims: claims.claims.length
}));
