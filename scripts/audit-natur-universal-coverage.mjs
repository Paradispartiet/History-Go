#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/natur/naturpensum_canonical_v4_5.json',
  contract: 'data/fag/natur/natur_universal_coverage_contract_v1.json',
  emner: 'data/fag/natur/emner_natur_canonical_v4_5.json',
  methods: 'data/fag/natur/methods_natur_canonical_v4_5.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  badge: 'data/fag/natur/merke_natur (1).html',
  report: 'reports/fagverk/natur-universal-coverage-audit.json'
});

const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const unique = (values) => new Set(values).size === values.length;

export function auditNaturUniversalCoverage({ writeReport = false, checkReport = true } = {}) {
  const pensum = json(P.pensum);
  const contract = json(P.contract);
  const emner = json(P.emner);
  const methodsDoc = json(P.methods);
  const mappings = json(P.mappings);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = read(P.badge);

  const domains = pensum.domains || [];
  const domainIds = domains.map((domain) => domain.domain_id);
  const domainById = new Map(domains.map((domain) => [domain.domain_id, domain]));
  const contractDomains = contract.required_domains || [];
  const contractDomainById = new Map(contractDomains.map((domain) => [domain.domain_id, domain]));
  const emneIds = new Set(emner.map((emne) => emne.emne_id));
  const mappingIds = new Set(mappings.map((mapping) => mapping.emne_id));
  const naturStatus = (status.subjects || []).find((subject) => subject.id === 'natur');
  const chapters = registry.subjects?.natur?.chapters || [];

  assert(pensum.subject_id === 'natur', 'Naturpensum bruker feil subject_id');
  assert(pensum.scope === 'universal', 'Naturpensum må ha universelt omfang');
  assert(domains.length === 12, `Natur skal ha 12 canonicale fagområder, fikk ${domains.length}`);
  assert(unique(domainIds), 'Naturpensum har dupliserte fagområde-ID-er');
  assert(contract.completion_rule?.required_domain_count === 12, 'Dekningskontrakten krever ikke 12 fagområder');
  assert(contract.current_state?.editorial_status === 'complete', 'Dekningskontrakten er ikke satt til complete');
  assert(contractDomains.length === domains.length, 'Pensum og dekningskontrakt har ulikt antall fagområder');
  assert(domainIds.every((id) => contractDomainById.has(id)), 'Et pensumområde mangler i dekningskontrakten');

  const requiredLabels = [
    'Økologi og økosystemer',
    'Artskunnskap og systematikk',
    'Evolusjon og biologisk mangfold',
    'Botanikk og vegetasjon',
    'Zoologi og dyreliv',
    'Sopp, lav og mikroorganismer',
    'Organismebiologi og fysiologi',
    'Vann og hydrologi',
    'Klima og atmosfære',
    'Geologi og naturhistorie',
    'Urban økologi',
    'Miljøpåvirkning og forvaltning'
  ];
  assert(requiredLabels.every((label) => domains.some((domain) => domain.label === label)), 'Naturpensum mangler ett eller flere bindende fagområder');
  assert(requiredLabels.every((label) => badge.includes(label)), 'Merkesiden viser ikke alle tolv fagområder');

  const materializedBiologyIds = [
    'artskunnskap_systematikk',
    'evolusjon_biologisk_mangfold',
    'botanikk_vegetasjon',
    'zoologi_dyreliv',
    'sopp_lav_mikroorganismer',
    'organismebiologi_fysiologi'
  ];
  for (const id of materializedBiologyIds) {
    const domain = domainById.get(id);
    const contractDomain = contractDomainById.get(id);
    assert(domain?.coverage_status === 'materialized_biology_layer', `${id}: er ikke materialisert biologilag`);
    assert((domain.emne_ids || []).length === 6, `${id}: skal ha seks materialiserte emner`);
    assert((domain.method_ids || []).length === 3, `${id}: skal ha tre egne materialiserte metoder`);
    assert((domain.hook_ids || []).length === 10, `${id}: skal ha ti egne hooks`);
    assert(contractDomain?.chapter_status === 'complete_for_current_biology_layer', `${id}: mangler ferdig biologikapittel`);
    assert(contractDomain?.current_emne_count === 6, `${id}: dekningskontrakten har feil current_emne_count`);
  }

  const geology = domainById.get('geologi_landskap_tid');
  const geologyContract = contractDomainById.get('geologi_landskap_tid');
  assert(geology?.coverage_status === 'materialized_geology_layer', 'Geologi er ikke fullt materialisert');
  assert(geology?.status === 'strong', 'Geologi har ikke strong-status');
  assert((geology?.emne_ids || []).length === 10, `Geologi skal dekke ti emner, fikk ${(geology?.emne_ids || []).length}`);
  assert((geology?.method_ids || []).length === 15, `Geologi skal ha femten tilgjengelige metoder, fikk ${(geology?.method_ids || []).length}`);
  assert((geology?.hook_ids || []).length === 26, `Geologi skal bevare ti hooks og legge til seksten, fikk ${(geology?.hook_ids || []).length}`);
  assert(geology?.chapter_status === 'complete_for_current_geology_layer', 'Geologi mangler komplett kapittelstatus');
  assert(geologyContract?.chapter_status === 'complete_for_current_geology_layer', 'Dekningskontrakten mangler komplett geologistatus');
  for (const topic of ['platetektonikk', 'vulkanisme', 'jordskjelv', 'fossiler']) {
    assert((geology.required_topics || []).some((entry) => String(entry).includes(topic)), `Geologi mangler obligatorisk tema: ${topic}`);
  }

  const allPensumEmneIds = domains.flatMap((domain) => domain.emne_ids || []);
  assert(allPensumEmneIds.length === 77, `Forventet 77 materialiserte Natur-emner, fikk ${allPensumEmneIds.length}`);
  assert(unique(allPensumEmneIds), 'Samme Natur-emne ligger i flere fagområder');
  assert(allPensumEmneIds.every((id) => emneIds.has(id)), 'Pensum peker til ukjent Natur-emne');
  assert([...emneIds].every((id) => mappingIds.has(id)), 'Ikke alle materialiserte Natur-emner har mapping');
  assert((methodsDoc.methods || []).length === 51, 'Natur skal ha 51 metoder etter sluttfasen');
  assert(mappings.length === 77, 'Natur skal ha 77 canonicale mappingrader etter sluttfasen');

  assert(isDeepStrictEqual(contract.current_state?.preserved_environment_layer_counts, {
    emner: 35, methods: 30, mappings: 35, hooks: 60, chapters: 6
  }), 'Det bevarte miljølagets baseline er endret');
  assert(isDeepStrictEqual(contract.current_state?.phase_1_biology_layer_counts, {
    emner: 18, methods: 9, mappings: 18, hooks: 30, chapters: 3
  }), 'Fase-1-biologilagets baseline er endret');
  assert(isDeepStrictEqual(contract.current_state?.phase_2_biology_layer_counts, {
    emner: 12, methods: 6, mappings: 12, hooks: 20, chapters: 2
  }), 'Fase-2-biologilagets baseline er endret');
  assert(isDeepStrictEqual(contract.current_state?.final_phase_layer_counts, {
    emner: 12, methods: 6, mappings: 12, hooks: 26, chapters_added: 1, chapters_rewritten: 1
  }), 'Sluttfasens baseline er endret');

  assert(naturStatus?.navigationStatus === 'materialized', 'Natur skal være teknisk materialisert');
  assert(naturStatus?.assessmentStatus === 'audited', 'Natur skal være individuelt auditert');
  assert(naturStatus?.editorialStatus === 'complete', 'Natur må stå som complete');
  assert(naturStatus?.nextGate === 'complete', 'Natur har feil sluttport');
  assert(chapters.length === 12, `Forventet tolv registrerte Natur-kapitler, fikk ${chapters.length}`);
  assert(contract.completion_rule?.all_domains_must_have_chapter === true, 'Complete-regelen krever ikke kapittel per fagområde');
  assert(contract.completion_rule?.no_required_gap_domains === true, 'Complete-regelen tillater required_gap');
  assert(contract.completion_rule?.current_result === 'complete', 'Dekningskontrakten er ikke complete');
  assert(pensum.summary?.editorial_complete === true, 'Pensumets summary er ikke complete');
  assert((contract.current_state?.partial_domains || []).length === 0, 'Sluttfasen har fortsatt partial_domains');
  assert((contract.current_state?.required_gap_domains || []).length === 0, 'Sluttfasen har fortsatt required_gap_domains');

  const report = {
    schema: 'history_go_natur_universal_coverage_audit_v1',
    version: '1.1.0',
    status: 'passed_complete',
    generatedFrom: P,
    summary: {
      canonicalDomainCount: domains.length,
      materializedDomainCount: domains.filter((domain) => String(domain.coverage_status).startsWith('materialized_')).length,
      partialDomainCount: domains.filter((domain) => domain.coverage_status === 'partial_materialized').length,
      requiredGapDomainCount: domains.filter((domain) => domain.coverage_status === 'required_gap').length,
      materializedEmneCount: allPensumEmneIds.length,
      materializedMethodCount: (methodsDoc.methods || []).length,
      materializedMappingCount: mappings.length,
      registeredChapterCount: chapters.length,
      editorialStatus: naturStatus.editorialStatus
    },
    requiredGapDomains: [],
    gates: {
      twelveDomainTargetLocked: true,
      biologyPhaseOneMaterialized: true,
      biologyPhaseTwoMaterialized: true,
      microbiologyMaterialized: true,
      innerGeologyAndNaturalHistoryMaterialized: true,
      allCanonicalDomainsMaterialized: true,
      allCanonicalEmnersMapped: true,
      existingEnvironmentLayerPreserved: true,
      badgeExplainsCompleteStatus: true,
      completionRuleSatisfied: true,
      editorialStatusComplete: true
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditNaturUniversalCoverage({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report')
    });
    console.log(`Natur-dekning OK: ${report.summary.canonicalDomainCount}/12 områder, ${report.summary.materializedEmneCount} emner og status ${report.summary.editorialStatus}.`);
  } catch (error) {
    console.error(`Natur-dekning FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
