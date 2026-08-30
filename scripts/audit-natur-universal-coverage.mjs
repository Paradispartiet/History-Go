#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { composeNaturFinal, readNaturFinalOverlay, NATUR_FINAL_OVERLAY_PATH } from './natur-final-phase-compose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/natur/naturpensum_canonical_v4_5.json',
  contractBase: 'data/fag/natur/natur_universal_coverage_contract_v1.json',
  emner: 'data/fag/natur/emner_natur_canonical_v4_5.json',
  methods: 'data/fag/natur/methods_natur_canonical_v4_5.json',
  fagkart: 'data/fag/natur/fagkart_natur_canonical_v4_5.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  overlay: NATUR_FINAL_OVERLAY_PATH,
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  badge: 'data/fag/natur/archive/merke_natur_full_teori_legacy_20260829.html',
  report: 'reports/fagverk/natur-universal-coverage-audit.json'
});

const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const unique = (values) => new Set(values).size === values.length;

export function auditNaturUniversalCoverage({ writeReport = false, checkReport = true } = {}) {
  const basePensum = json(P.pensum);
  const baseContract = json(P.contractBase);
  const baseEmners = json(P.emner);
  const baseMethods = json(P.methods);
  const baseFagkart = json(P.fagkart);
  const baseMappings = json(P.mappings);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = read(P.badge);
  const overlay = readNaturFinalOverlay();
  const baseStatusEntry = (status.subjects || []).find((subject) => subject.id === 'natur');

  assert(basePensum.version === 'v5.2-canonical-biology-phase-2', 'Sluttfasen skal bygge på den frosne Natur fase-2-basisen');
  assert(baseEmners.length === 65 && (baseMethods.methods || []).length === 45 && baseMappings.length === 65, 'Fase-2-basisen er endret før overlay-komponering');
  assert(baseContract.completion_rule?.required_domain_count === 12, 'Fase-2-kontrakten låser ikke tolvdelsmodellen');
  assert(overlay.status === 'canonical_final_phase_overlay', 'Mangler canonical sluttfase-overlay');
  assert(overlay.base_version === basePensum.version, 'Sluttfase-overlayet peker til feil Natur-baseline');

  const composed = composeNaturFinal({
    pensum: basePensum,
    emners: baseEmners,
    methodsDoc: baseMethods,
    fagkart: baseFagkart,
    mappings: baseMappings,
    registry,
    statusEntry: baseStatusEntry,
    overlay
  });
  const { pensum, emners, methodsDoc, fagkart, mappings, statusEntry: naturStatus } = composed;
  const chapters = composed.registry.subjects?.natur?.chapters || [];
  const domains = pensum.domains || [];
  const domainIds = domains.map((domain) => domain.domain_id);
  const domainById = new Map(domains.map((domain) => [domain.domain_id, domain]));
  const emneIds = new Set(emners.map((emne) => emne.emne_id));
  const mappingIds = new Set(mappings.map((mapping) => mapping.emne_id));

  assert(pensum.subject_id === 'natur' && pensum.scope === 'universal', 'Naturpensum har feil subject eller scope');
  assert(domains.length === 12, `Natur skal ha 12 canonicale fagområder, fikk ${domains.length}`);
  assert(unique(domainIds), 'Naturpensum har dupliserte fagområde-ID-er');

  const requiredLabels = [
    'Økologi og økosystemer', 'Artskunnskap og systematikk', 'Evolusjon og biologisk mangfold',
    'Botanikk og vegetasjon', 'Zoologi og dyreliv', 'Sopp, lav og mikroorganismer',
    'Organismebiologi og fysiologi', 'Vann og hydrologi', 'Klima og atmosfære',
    'Geologi og naturhistorie', 'Urban økologi', 'Miljøpåvirkning og forvaltning'
  ];
  assert(requiredLabels.every((label) => domains.some((domain) => domain.label === label)), 'Naturpensum mangler ett eller flere bindende fagområder');
  assert(requiredLabels.every((label) => badge.includes(label)), 'Det byte-bevarte Natur-arkivet viser ikke alle tolv fagområder');

  const biologyIds = [
    'artskunnskap_systematikk', 'evolusjon_biologisk_mangfold', 'botanikk_vegetasjon',
    'zoologi_dyreliv', 'sopp_lav_mikroorganismer', 'organismebiologi_fysiologi'
  ];
  for (const id of biologyIds) {
    const domain = domainById.get(id);
    assert(domain?.coverage_status === 'materialized_biology_layer', `${id}: er ikke materialisert biologilag`);
    assert((domain.emne_ids || []).length === 6, `${id}: skal ha seks materialiserte emner`);
    assert((domain.method_ids || []).length === 3, `${id}: skal ha tre egne materialiserte metoder`);
    assert((domain.hook_ids || []).length === 10, `${id}: skal ha ti egne hooks`);
    assert(domain?.chapter_status === 'complete_for_current_biology_layer', `${id}: mangler ferdig kapittelstatus`);
  }

  const geology = domainById.get('geologi_landskap_tid');
  assert(geology?.coverage_status === 'materialized_geology_layer', 'Geologi er ikke fullt materialisert');
  assert(geology?.status === 'strong', 'Geologi har ikke strong-status');
  assert((geology?.emne_ids || []).length === 10, `Geologi skal dekke ti emner, fikk ${(geology?.emne_ids || []).length}`);
  assert((geology?.method_ids || []).length === 15, `Geologi skal ha femten tilgjengelige metoder, fikk ${(geology?.method_ids || []).length}`);
  assert((geology?.hook_ids || []).length === 26, `Geologi skal bevare ti hooks og legge til seksten, fikk ${(geology?.hook_ids || []).length}`);
  assert(geology?.chapter_status === 'complete_for_current_geology_layer', 'Geologi mangler komplett kapittelstatus');

  const allPensumEmneIds = domains.flatMap((domain) => domain.emne_ids || []);
  assert(allPensumEmneIds.length === 77, `Forventet 77 materialiserte Natur-emner, fikk ${allPensumEmneIds.length}`);
  assert(unique(allPensumEmneIds), 'Samme Natur-emne ligger i flere fagområder');
  assert(allPensumEmneIds.every((id) => emneIds.has(id)), 'Pensum peker til ukjent Natur-emne');
  assert([...emneIds].every((id) => mappingIds.has(id)), 'Ikke alle materialiserte Natur-emner har mapping');
  assert((methodsDoc.methods || []).length === 51, 'Natur skal ha 51 metoder etter sluttfasen');
  assert(mappings.length === 77, 'Natur skal ha 77 canonicale mappingrader etter sluttfasen');
  assert((fagkart.categories || []).length === 12, 'Natur skal ha tolv materialiserte fagkartkategorier');
  assert((fagkart.categories || []).reduce((sum, category) => sum + (category.topic_hooks || []).length, 0) === 136, 'Natur skal ha 136 hooks etter sluttfasen');

  assert(overlay.completion.canonical_domain_count === 12 && overlay.completion.materialized_domain_count === 12, 'Overlayets completion-metadata er ikke 12/12');
  assert(overlay.completion.partial_domain_count === 0 && overlay.completion.required_gap_domain_count === 0, 'Overlayet har fortsatt åpne hull');
  assert(overlay.completion.emne_count === 77 && overlay.completion.method_count === 51 && overlay.completion.hook_count === 136, 'Overlayets sluttall er usynkrone');
  assert(naturStatus?.navigationStatus === 'materialized', 'Natur skal være teknisk materialisert');
  assert(naturStatus?.assessmentStatus === 'audited', 'Natur skal være individuelt auditert');
  assert(naturStatus?.editorialStatus === 'complete', 'Natur må stå som complete i komponert status');
  assert(naturStatus?.nextGate === 'complete', 'Natur har feil sluttport');
  assert(chapters.length === 12, `Forventet tolv registrerte Natur-kapitler, fikk ${chapters.length}`);
  assert(pensum.summary?.editorial_complete === true, 'Pensumets komponerte summary er ikke complete');
  assert(badge.includes('77 materialiserte emner, 51 metoder og tolv redigerte kapitler'), 'Det byte-bevarte Natur-arkivet viser ikke sluttfasens produksjonstall');

  const report = {
    schema: 'history_go_natur_universal_coverage_audit_v1',
    version: '1.2.0',
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
      materializedHookCount: (fagkart.categories || []).reduce((sum, category) => sum + (category.topic_hooks || []).length, 0),
      registeredChapterCount: chapters.length,
      assessmentStatus: naturStatus.assessmentStatus,
      editorialStatus: naturStatus.editorialStatus
    },
    requiredGapDomains: [],
    gates: {
      frozenPhaseTwoBasePreserved: true,
      canonicalFinalOverlayLoaded: true,
      twelveDomainTargetLocked: true,
      biologyPhaseOneMaterialized: true,
      biologyPhaseTwoMaterialized: true,
      microbiologyMaterialized: true,
      innerGeologyAndNaturalHistoryMaterialized: true,
      allCanonicalDomainsMaterialized: true,
      allCanonicalEmnersMapped: true,
      badgeExplainsCompleteStatus: true,
      completionRuleSatisfied: true,
      assessmentStatusAudited: true,
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
    const report = auditNaturUniversalCoverage({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Natur-dekning OK: ${report.summary.materializedDomainCount}/12 områder, ${report.summary.materializedEmneCount} emner, ${report.summary.materializedHookCount} hooks og status ${report.summary.editorialStatus}.`);
  } catch (error) {
    console.error(`Natur-dekning FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
