#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const list = (value) => Array.isArray(value) ? value : [];
const readJson = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const PATHS = Object.freeze({
  architecture: 'data/fag/politikk/curriculum_architecture_politikk_v1.json',
  concepts: 'data/fag/politikk/concepts_politikk_canonical_v1.json',
  pensum: 'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  emners: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  methods: 'data/fag/politikk/methods_politikk_canonical_v4_5.json',
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
});

function assertOrderedEditorialRows(rows, label) {
  assert(rows.length > 0, `${label}: tom seksjon`);
  const ids = rows.map((row) => row.id);
  assert(ids.every(Boolean) && new Set(ids).size === ids.length, `${label}: mangler eller dupliserer id`);
  for (const row of rows) {
    assert(typeof row.label === 'string' && row.label.length >= 4, `${label}/${row.id}: mangler menneskelig tittel`);
    assert(typeof row.description === 'string' && row.description.length >= 50, `${label}/${row.id}: beskrivelsen er for kort`);
    assert(typeof row.overview === 'string' && row.overview.length >= 300, `${label}/${row.id}: oversiktsteksten er for kort`);
    assert(list(row.learning_outcomes).length === 3, `${label}/${row.id}: må ha tre læringsmål`);
    assert(row.learning_outcomes.every((value) => typeof value === 'string' && value.length >= 45), `${label}/${row.id}: læringsmål er for kort`);
    assert(list(row.key_questions).length === 3, `${label}/${row.id}: må ha tre nøkkelspørsmål`);
    assert(row.key_questions.every((value) => typeof value === 'string' && value.length >= 35 && value.endsWith('?')), `${label}/${row.id}: nøkkelspørsmål er ikke fullstendig`);
  }
}

function chapterWordCount(root, chapterMeta) {
  const manifest = readJson(root, chapterMeta.file);
  const files = list(manifest.moduleFiles).map((file) => file.startsWith('data/') ? file : path.join(path.dirname(chapterMeta.file), file));
  return files.reduce((total, file) => total + JSON.stringify(readJson(root, file)).split(/\s+/).length, 0);
}

export function validatePolitikkCurriculumArchitecture({ root = DEFAULT_ROOT } = {}) {
  const architecture = readJson(root, PATHS.architecture);
  const conceptDocument = readJson(root, PATHS.concepts);
  const pensum = readJson(root, PATHS.pensum);
  const emners = readJson(root, PATHS.emners);
  const methods = list(readJson(root, PATHS.methods).methods);
  const fagkart = readJson(root, PATHS.fagkart);
  const registry = readJson(root, PATHS.registry);
  const status = readJson(root, PATHS.status);

  assert(architecture.schema === 'history_go_politikk_curriculum_architecture_v1', 'Feil schema for Politikk-arkitekturen');
  assert(architecture.subject_id === 'politikk' && architecture.status === 'active_curriculum_navigation', 'Politikk-arkitekturen er ikke aktiv');
  assert(architecture.editorial_status === 'expanded_and_audited', 'Politikk-arkitekturen mangler utvidet redaksjonell status');
  assert(architecture.navigation_policy?.canonical_domain_registry_role === 'secondary_registry', 'Det flate domeneregisteret må være sekundært');
  assert(architecture.navigation_policy?.canonical_ids_remain_stable === true, 'Canonicale id-er skal bevares');
  assert(architecture.curation_policy?.fixed_emne_quotas_forbidden === true, 'Faste emnekvoter må være forbudt');
  assert(architecture.curation_policy?.empirical_normative_distinction_required === true, 'Empirisk og normativ analyse må skilles');
  assert(architecture.curation_policy?.political_opinion_is_not_analysis === true, 'Politisk mening må ikke behandles som analyse');
  assert(list(architecture.editorial_introduction?.paragraphs).length === 3, 'Introduksjonen må ha tre redigerte avsnitt');
  assert(architecture.editorial_introduction.paragraphs.every((paragraph) => paragraph.length >= 220), 'Introduksjonsavsnitt er for kort');

  const sections = {
    progression: list(architecture.progression),
    foundations: list(architecture.foundations),
    disciplinary_fields: list(architecture.disciplinary_fields),
    policy_cycle: list(architecture.policy_cycle),
    method_foundation: list(architecture.method_foundation),
    governance_scales: list(architecture.governance_scales),
    applied_tracks: list(architecture.applied_tracks)
  };
  assert(sections.progression.length === 5, 'Progresjonen må ha fem trinn');
  assert(sections.foundations.length === 5, 'Grunnspørsmålene må ha fem spor');
  assert(sections.disciplinary_fields.length === 7, 'Faget må ha sju disiplinære hovedfelt');
  assert(sections.policy_cycle.length === 6, 'Politikkprosessen må ha seks ledd');
  assert(sections.method_foundation.length === 6, 'Metodegrunnlaget må ha seks moduler');
  assert(sections.governance_scales.length === 5, 'Styringsnivåene må ha fem skalaer');
  assert(sections.applied_tracks.length === 7, 'Anvendelsessporene må ha sju problemfelt');
  for (const [label, rows] of Object.entries(sections)) assertOrderedEditorialRows(rows, label);
  assert(Object.values(sections).flat().length === 41, 'Studieløpet må ha 41 redigerte deler');

  const domains = list(pensum.domains);
  const domainIds = new Set(domains.map((domain) => domain.domain_id));
  const emneIds = new Set(emners.map((emne) => emne.emne_id));
  const methodIds = new Set(methods.map((method) => method.method_id));
  assert(domainIds.size === 13 && emneIds.size === 123 && methodIds.size === 71, 'Canonicalt Politikk-inventar er endret');
  assert(list(fagkart.categories).reduce((sum, category) => sum + list(category.topic_hooks).length, 0) === 152, 'Hook-inventaret er endret');

  const classifiedDomains = new Set(sections.disciplinary_fields.flatMap((field) => list(field.domain_ids)));
  for (const domainId of domainIds) assert(classifiedDomains.has(domainId) || domainId === 'statsvitenskapelig_metode_og_sammenligning', `${domainId}: mangler disiplinær plassering`);
  const classifiedEmners = new Set([
    ...sections.disciplinary_fields.flatMap((field) => list(field.entry_emne_ids)),
    ...sections.method_foundation.flatMap((module) => list(module.entry_emne_ids))
  ]);
  for (const emneId of emneIds) assert(classifiedEmners.has(emneId), `${emneId}: ikke plassert i fagfelt eller metodegrunnlag`);

  const classifiedMethods = sections.method_foundation.flatMap((module) => list(module.core_method_ids));
  assert(classifiedMethods.length === methodIds.size && new Set(classifiedMethods).size === methodIds.size, 'Alle metoder må plasseres nøyaktig én gang');
  for (const methodId of classifiedMethods) assert(methodIds.has(methodId), `Ukjent metode i arkitekturen: ${methodId}`);
  assert(sections.method_foundation.every((module) => module.core_method_ids.length >= 1), 'Alle metodemoduler må ha minst én reell metode');

  for (const rows of Object.values(sections)) for (const row of rows) {
    for (const domainId of list(row.domain_ids)) assert(domainIds.has(domainId), `${row.id}: ukjent domene ${domainId}`);
    for (const emneId of list(row.entry_emne_ids)) assert(emneIds.has(emneId), `${row.id}: ukjent emne ${emneId}`);
  }

  assert(conceptDocument.schema === 'history_go_politikk_concepts_v1' && conceptDocument.status === 'definition_complete', 'Begrepsverket er ikke definisjonskomplett');
  const concepts = list(conceptDocument.concepts);
  const rawConceptLabels = new Set(emners.flatMap((emne) => ['core_concepts', 'key_concepts', 'sub_concepts', 'keywords'].flatMap((field) => list(emne[field]))).map(normalize).filter(Boolean));
  assert(rawConceptLabels.size === 962, 'Det canonicale råbegrepsinventaret er endret');
  assert(concepts.length === rawConceptLabels.size, 'Ikke alle canonicale begrepsoppføringer er materialisert');
  assert(new Set(concepts.map((concept) => concept.concept_id)).size === concepts.length, 'Dupliserte begreps-id-er');
  assert(new Set(concepts.map((concept) => normalize(concept.label))).size === concepts.length, 'Dupliserte begrepsetiketter');
  assert(new Set(concepts.map((concept) => concept.definition)).size === concepts.length, 'Dupliserte begrepsdefinisjoner tyder på maltekst');
  assert(conceptDocument.summary.direct_editorial_or_canonical_definition_count === 143, 'Antallet direkte kilde- og kapitteldefinisjoner er endret');
  assert(conceptDocument.summary.editorial_rule_definition_count === 819, 'Alle tidligere kontekstoppføringer må ha selvstendig fagdefinisjon');
  assert(conceptDocument.summary.contextual_definition_count === 0, 'Kontekstforklaringer skal ikke lenger stå som definisjoner');
  const editorialSeedCount = concepts.filter((concept) => concept.definition_method === 'editorial_seed').length;
  const semanticRuleCount = concepts.filter((concept) => concept.definition_method === 'semantic_editorial_rule').length;
  assert(editorialSeedCount >= 273, 'Antallet særskilt redigerte termdefinisjoner kan ikke reduseres');
  assert(semanticRuleCount <= 546, 'Semantiske regeldefinisjoner kan ikke erstatte særskilt redigerte termer');
  const allowedDefinitionStatuses = new Set(['editorial_chapter', 'canonical_hook', 'canonical_emne', 'canonical_method', 'editorial_rule_definition']);
  for (const concept of concepts) {
    assert(rawConceptLabels.has(normalize(concept.label)), `${concept.label}: finnes ikke i canonicalt emneinventar`);
    assert(typeof concept.definition === 'string' && concept.definition.length >= 85, `${concept.concept_id}: forklaringen er for kort`);
    assert(allowedDefinitionStatuses.has(concept.definition_status), `${concept.concept_id}: ukjent eller foreldet definisjonsstatus`);
    assert(typeof concept.contextual_use === 'string' && concept.contextual_use.length >= 100, `${concept.concept_id}: emnebruken er ikke forklart separat`);
    assert(!/kontekstuelt analysebegrep|koblingen til emnet|innen «|navnet angir|på den måten|med det innholdet|forleddet angir/iu.test(concept.definition), `${concept.concept_id}: definisjonen inneholder selvrefererende maltekst`);
    assert(concept.definition_method !== 'domain_fallback', `${concept.concept_id}: bruker generell domenefallback`);
    assert(typeof concept.scope_note === 'string' && concept.scope_note.length >= 60, `${concept.concept_id}: mangler faglig avgrensning`);
    assert(list(concept.source_emne_ids).length >= 1, `${concept.concept_id}: mangler eieremne`);
    assert(list(concept.domain_ids).length >= 1, `${concept.concept_id}: mangler fagområde`);
    for (const emneId of concept.source_emne_ids) assert(emneIds.has(emneId), `${concept.concept_id}: ukjent eieremne ${emneId}`);
    for (const domainId of concept.domain_ids) assert(domainIds.has(domainId), `${concept.concept_id}: ukjent fagområde ${domainId}`);
    for (const relatedId of list(concept.related_concepts)) assert(concepts.some((row) => row.concept_id === relatedId), `${concept.concept_id}: ukjent relatert begrep ${relatedId}`);
  }
  assert(new Set(concepts.flatMap((concept) => concept.source_emne_ids)).size === emneIds.size, 'Begrepsverket dekker ikke alle emner');
  assert(new Set(concepts.flatMap((concept) => concept.domain_ids)).size === domainIds.size, 'Begrepsverket dekker ikke alle fagområder');
  const conceptByLabel = new Map(concepts.map((concept) => [normalize(concept.label), concept]));
  assert(/avgjør hvem|avgjør hvilke/iu.test(conceptByLabel.get('adgangskontroll').definition), 'adgangskontroll: mangler selvstendig portvaktdefinisjon');
  assert(/handlingsrom/iu.test(conceptByLabel.get('administrativt skjønn').definition), 'administrativt skjønn: mangler skjønnsdefinisjon');
  assert(/beste realistiske alternativ/iu.test(conceptByLabel.get('alternativkostnad').definition), 'alternativkostnad: mangler alternativdefinisjon');
  assert(/utvalg.*populasjon/isu.test(conceptByLabel.get('statistisk inferens').definition), 'statistisk inferens: mangler inferensdefinisjon');
  assert(/normativt prinsipp/iu.test(conceptByLabel.get('rettferdighet').definition), 'rettferdighet: mangler normativ definisjon');
  assert(/sammenligner regimer/iu.test(conceptByLabel.get('komparativ politikk').definition), 'komparativ politikk: mangler fagfeltdefinisjon');

  const politikkRegistry = registry.subjects?.politikk;
  assert(list(politikkRegistry?.chapters).length === 13, 'Politikk må fortsatt ha 13 lærekapitler');
  const chapterEmners = new Set(politikkRegistry.chapters.flatMap((chapter) => list(chapter.emne_ids)));
  for (const emneId of emneIds) assert(chapterEmners.has(emneId), `${emneId}: mangler lærekapittel`);
  const textbookWords = politikkRegistry.chapters.reduce((sum, chapter) => sum + chapterWordCount(root, chapter), 0);
  assert(textbookWords >= 25000, 'Politikk-kapitlene er ikke et reelt fulltekstverk');
  const statusEntry = list(status.subjects).find((entry) => entry.id === 'politikk');
  assert(statusEntry?.editorialStatus === 'expanded_and_audited', 'Politikk mangler utvidet og auditert status i statusregisteret');

  return {
    status: 'passed',
    curriculumParts: Object.values(sections).flat().length,
    domains: domainIds.size,
    emners: emneIds.size,
    methods: methodIds.size,
    concepts: concepts.length,
    chapters: politikkRegistry.chapters.length,
    textbookWords,
    directDefinitions: conceptDocument.summary.direct_editorial_or_canonical_definition_count,
    editorialRuleDefinitions: conceptDocument.summary.editorial_rule_definition_count,
    editorialSeeds: editorialSeedCount,
    semanticRuleDefinitions: semanticRuleCount,
    contextualDefinitions: conceptDocument.summary.contextual_definition_count
  };
}

function main() {
  try {
    const result = validatePolitikkCurriculumArchitecture();
    console.log(`Politikk-pensumarkitektur OK: ${result.curriculumParts} studieløpsdeler, ${result.domains} fagområder, ${result.emners} emner, ${result.methods} metoder, ${result.concepts} begreper og ${result.chapters} kapitler.`);
  } catch (error) {
    console.error(`Politikk-pensumarkitektur FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
