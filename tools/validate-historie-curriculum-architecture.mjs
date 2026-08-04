#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PATHS = Object.freeze({
  architecture: 'data/fag/historie/curriculum_architecture_historie_v1.json',
  pensum: 'data/fag/historie/historiepensum_canonical_v4_5.json',
  emner: 'data/fag/historie/emner_historie_canonical_v4_5.json',
  methods: 'data/fag/historie/methods_historie_canonical_v4_5.json',
  coverageContract: 'data/fag/historie/historie_universal_coverage_contract_v1.json',
  profilesManifest: 'data/fag/profiles/manifest.json',
  periodGuides: 'data/fag/historie/period_guides_historie_v1.json',
  periodModules: 'data/fag/historie/period_modules_historie_v1.json'
});

const readJson = (root, relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertUniqueOrdered(rows, label) {
  const ids = rows.map((row) => row.id);
  assert(ids.every(Boolean), `${label}: alle rader må ha id`);
  assert(new Set(ids).size === ids.length, `${label}: dupliserte id-er`);
  assert(rows.every((row, index) => row.order === index + 1), `${label}: order må være sammenhengende fra 1`);
  assert(rows.every((row) => row.label && row.description), `${label}: alle rader må ha menneskelig tittel og beskrivelse`);
}

function assertEditorialDepth(rows, label) {
  for (const row of rows) {
    assert(typeof row.overview === 'string' && row.overview.length >= 300, `${label}/${row.id}: mangler en reell faglig oversiktstekst`);
    assert(list(row.learning_outcomes).length === 3, `${label}/${row.id}: må ha tre konkrete læringsmål`);
    assert(row.learning_outcomes.every((outcome) => typeof outcome === 'string' && outcome.length >= 45), `${label}/${row.id}: læringsmålene er for korte`);
    assert(list(row.key_questions).length === 3, `${label}/${row.id}: må ha tre faglige nøkkelspørsmål`);
    assert(row.key_questions.every((question) => typeof question === 'string' && question.length >= 35 && question.endsWith('?')), `${label}/${row.id}: nøkkelspørsmålene må være fullstendige spørsmål`);
  }
}

function findForbiddenQuotaKeys(value, trail = '$', hits = []) {
  if (!value || typeof value !== 'object') return hits;
  for (const [key, child] of Object.entries(value)) {
    const nextTrail = `${trail}.${key}`;
    if (/^(exact|target|fixed)_.*(emne|hook|method).*count$/i.test(key) || /^exact_(emner|hooks|methods)$/i.test(key)) hits.push(nextTrail);
    findForbiddenQuotaKeys(child, nextTrail, hits);
  }
  return hits;
}

export function validateHistoryCurriculumArchitecture({ root = DEFAULT_ROOT } = {}) {
  const architecture = readJson(root, PATHS.architecture);
  const pensum = readJson(root, PATHS.pensum);
  const emner = readJson(root, PATHS.emner);
  const methodsDocument = readJson(root, PATHS.methods);
  const coverageContract = readJson(root, PATHS.coverageContract);
  const profilesManifest = readJson(root, PATHS.profilesManifest);
  const periodGuides = readJson(root, PATHS.periodGuides);
  const periodModules = readJson(root, PATHS.periodModules);

  assert(architecture.schema === 'history_go_history_curriculum_architecture_v1', 'Arkitekturen har feil schema');
  assert(architecture.version === '1.2.0', 'Arkitekturen mangler de kilde- og casebundne periodemodulene');
  assert(architecture.subject_id === 'historie', 'Arkitekturen gjelder ikke Historie');
  assert(architecture.status === 'active_curriculum_navigation', 'Arkitekturen er ikke aktiv navigasjon');
  assert(architecture.navigation_policy?.canonical_domain_registry_role === 'secondary_registry', '23×10-registeret må være sekundært');
  assert(architecture.navigation_policy?.canonical_ids_remain_stable === true, 'Canonicale id-er må bevares i migreringen');
  assert(architecture.curation_policy?.fixed_emne_quotas_forbidden === true, 'Faste emnekvoter må være eksplisitt forbudt');
  assert(architecture.curation_policy?.track_size_follows_subject_matter === true, 'Faglig behov må styre størrelsen på læringsspor');
  assert(architecture.curation_policy?.coverage_is_not_equivalent_to_pedagogical_completion === true, 'Dekning og pedagogisk fullføring må skilles');

  const periods = list(architecture.chronological_spine);
  const themes = list(architecture.thematic_fields);
  const methodModules = list(architecture.method_foundation);
  const geographies = list(architecture.geographic_paths);
  const progression = list(architecture.progression);
  assert(periods.length === 9, 'Den kronologiske grunnstammen må ha de ni vedtatte hovedperiodene');
  assert(themes.length === 14, 'Arkitekturen må ha de fjorten vedtatte tematiske fagretningene');
  assert(methodModules.length === 6, 'Metodegrunnlaget må ha seks forståelige hovedmoduler');
  assert(geographies.length === 6, 'Geografi må vises som seks læringsstier');
  assert(progression.length === 5, 'Studieløpet må forklare fem progresjonstrinn');
  assertUniqueOrdered(periods, 'Kronologisk grunnstamme');
  assertUniqueOrdered(themes, 'Tematiske fagretninger');
  assertUniqueOrdered(methodModules, 'Metodegrunnlag');
  assertUniqueOrdered(geographies, 'Geografiske læringsstier');
  assertUniqueOrdered(progression, 'Progresjon');
  const introduction = architecture.editorial_introduction;
  assert(introduction?.heading, 'Arkitekturen mangler en redaksjonell introduksjon');
  assert(list(introduction?.paragraphs).length >= 3, 'Den redaksjonelle introduksjonen må forklare faget i minst tre avsnitt');
  assert(introduction.paragraphs.every((paragraph) => typeof paragraph === 'string' && paragraph.length >= 180), 'Introduksjonsavsnittene er for korte');
  assert(typeof introduction.reading_guide === 'string' && introduction.reading_guide.length >= 120, 'Arkitekturen mangler en reell leseguide');
  assertEditorialDepth(progression, 'Progresjon');
  assertEditorialDepth(periods, 'Kronologisk grunnstamme');
  assertEditorialDepth(themes, 'Tematiske fagretninger');
  assertEditorialDepth(methodModules, 'Metodegrunnlag');
  assertEditorialDepth(geographies, 'Geografiske læringsstier');
  assert(periodGuides.schema === 'history_go_history_period_guides_v1' && periodGuides.status === 'editorially_complete', 'Periodeguidene er ikke et komplett redaksjonelt lag');
  const guides = list(periodGuides.guides);
  assert(guides.length === periods.length, 'Alle kronologiske perioder må ha en periodeguide');
  const guideById = new Map(guides.map((guide) => [guide.period_id, guide]));
  for (const period of periods) {
    const guide = guideById.get(period.id);
    assert(guide?.editorial_status === 'complete', `${period.id}: periodeguiden er ikke redaksjonelt komplett`);
    assert(typeof guide.introduction === 'string' && guide.introduction.length >= 180, `${period.id}: mangler en reell periodeintroduksjon`);
    assert(list(guide.sections).length >= 3, `${period.id}: trenger minst tre sammenhengende hoveddeler`);
    for (const section of guide.sections) {
      assert(section.title && list(section.paragraphs).length >= 2, `${period.id}: periodedel mangler tittel eller avsnitt`);
      assert(section.paragraphs.every((paragraph) => typeof paragraph === 'string' && paragraph.length >= 250), `${period.id}/${section.title}: avsnittene er for korte`);
    }
    assert(list(guide.core_concepts).length >= 8, `${period.id}: mangler sentrale begreper`);
    assert(list(guide.connections).length >= 5, `${period.id}: mangler tverrfaglige forbindelser`);
  }
  assert(list(periodGuides.orientation_sources).length >= 4, 'Periodeguidene mangler orienteringskilder');
  assert(periodModules.schema === 'history_go_history_period_modules_v1' && periodModules.status === 'evidence_ready', 'De tre tidligere periodgapene mangler evidensklare moduler');
  const periodModuleById = new Map(list(periodModules.modules).map((module) => [module.module_id, module]));

  const domainsById = new Map(list(pensum.domains).map((domain) => [domain.domain_id, domain]));
  const emnersById = new Map(list(emner).map((emne) => [emne.emne_id, emne]));
  const methodsById = new Map(list(methodsDocument.methods).map((method) => [method.method_id, method]));
  assert(domainsById.size === 23 && emnersById.size === 230 && methodsById.size === 105, 'Compatibility-inventaret er endret under navigasjonsmigreringen');

  const coverageStatuses = new Set(['covered', 'partial', 'missing']);
  for (const period of periods) {
    assert(period.date_label, `${period.id}: mangler datointervall`);
    assert(coverageStatuses.has(period.coverage_status), `${period.id}: ugyldig coverage_status`);
    for (const domainId of list(period.domain_ids)) assert(domainsById.has(domainId), `${period.id}: ukjent domene ${domainId}`);
    for (const emneId of list(period.entry_emne_ids)) assert(emnersById.has(emneId), `${period.id}: ukjent emne ${emneId}`);
    if (period.coverage_status === 'covered') {
      const module = periodModuleById.get(period.period_module_id);
      assert(list(period.entry_emne_ids).length >= 5 || module?.period_id === period.id, `${period.id}: dekket periode trenger kuraterte inngangsemner eller en dedikert periodemodul`);
    }
    if (period.coverage_status === 'partial') {
      assert(list(period.entry_emne_ids).length >= 2, `${period.id}: delvis periode trenger reelle inngangsemner`);
      assert(period.gap_action, `${period.id}: delvis periode må forklare neste faglige handling`);
    }
    if (period.coverage_status === 'missing') {
      assert(list(period.domain_ids).length === 0 && list(period.entry_emne_ids).length === 0, `${period.id}: manglende periode må ikke fylles med løse treff`);
      assert(period.gap_action, `${period.id}: manglende periode må ha gap_action`);
    }
  }

  for (const periodId of ['antikken_eldre_sivilisasjoner', 'tidlig_moderne_1500_1814', 'samtid_etter_1991']) {
    const period = periods.find((row) => row.id === periodId);
    const module = periodModuleById.get(period?.period_module_id);
    assert(period?.coverage_status === 'covered', `${periodId}: det tidligere gapet er ikke lukket`);
    assert(module?.period_id === periodId && list(module.units).length >= 6, `${periodId}: mangler dedikert periodemodul`);
  }

  for (const theme of themes) {
    assert(list(theme.domain_ids).length > 0, `${theme.id}: tematisk fagretning mangler canonicale innganger`);
    for (const domainId of theme.domain_ids) assert(domainsById.has(domainId), `${theme.id}: ukjent domene ${domainId}`);
  }
  const classifiedDomainIds = new Set([
    ...periods.flatMap((period) => list(period.domain_ids)),
    ...themes.flatMap((theme) => list(theme.domain_ids)),
    ...methodModules.flatMap((module) => list(module.foundation_domain_ids))
  ]);
  for (const domainId of domainsById.keys()) assert(classifiedDomainIds.has(domainId), `${domainId}: ikke plassert i kronologi eller tematisk fagretning`);

  const usedCoreMethods = new Set();
  for (const module of methodModules) {
    for (const domainId of list(module.foundation_domain_ids)) assert(domainsById.has(domainId), `${module.id}: ukjent grunnlagsdomene ${domainId}`);
    assert(list(module.core_method_ids).length >= 5, `${module.id}: trenger minst fem kuraterte kjernemetoder`);
    for (const methodId of module.core_method_ids) {
      assert(methodsById.has(methodId), `${module.id}: ukjent metode ${methodId}`);
      usedCoreMethods.add(methodId);
    }
  }
  assert(usedCoreMethods.size >= 30, 'Metodegrunnlaget er for smalt til å fungere som reell inngang');

  const geographyCells = new Set(list(coverageContract.axes?.geography?.cells).map((cell) => cell.id));
  const profileIds = new Set(list(profilesManifest.profiles).filter((profile) => profile.subject_id === 'historie').map((profile) => profile.profile_id));
  for (const geography of geographies) {
    assert(list(geography.coverage_cell_ids).length > 0, `${geography.id}: mangler geograficelle`);
    for (const cellId of geography.coverage_cell_ids) assert(geographyCells.has(cellId), `${geography.id}: ukjent geograficelle ${cellId}`);
    for (const profileId of list(geography.active_profile_ids)) assert(profileIds.has(profileId), `${geography.id}: ukjent aktiv profil ${profileId}`);
  }

  const knownGapPeriods = new Set(list(architecture.known_curriculum_gaps).map((gap) => gap.period_id));
  for (const period of periods.filter((row) => row.coverage_status !== 'covered')) {
    assert(knownGapPeriods.has(period.id), `${period.id}: synlig gap mangler i known_curriculum_gaps`);
  }
  assert(knownGapPeriods.size === 0, 'Lukkede periodgap står igjen i arkitekturen');
  const forbiddenQuotaKeys = findForbiddenQuotaKeys(architecture);
  assert(forbiddenQuotaKeys.length === 0, `Arkitekturen gjeninnfører faste innholdskvoter: ${forbiddenQuotaKeys.join(', ')}`);

  return {
    schema: architecture.schema,
    status: architecture.status,
    periods: periods.length,
    coveredPeriods: periods.filter((period) => period.coverage_status === 'covered').length,
    partialPeriods: periods.filter((period) => period.coverage_status === 'partial').length,
    missingPeriods: periods.filter((period) => period.coverage_status === 'missing').length,
    thematicFields: themes.length,
    methodModules: methodModules.length,
    geographicPaths: geographies.length,
    periodGuides: guides.length,
    canonicalDomainsPreserved: domainsById.size,
    canonicalEmnerPreserved: emnersById.size,
    canonicalMethodsPreserved: methodsById.size
  };
}

function main() {
  try {
    const result = validateHistoryCurriculumArchitecture();
    console.log(`Historie-pensumarkitektur OK: ${result.periods} perioder (${result.coveredPeriods} dekket, ${result.partialPeriods} delvise, ${result.missingPeriods} mangler), ${result.thematicFields} tematiske spor, ${result.methodModules} metodemoduler og ${result.geographicPaths} geografiske stier.`);
  } catch (error) {
    console.error(`Historie-pensumarkitektur FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
