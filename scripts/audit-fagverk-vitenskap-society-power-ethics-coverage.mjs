#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditVitenskapHolisticUniversityBreadthCompletion } from './audit-fagverk-vitenskap-holistic-university-breadth-completion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  emners: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json',
  mappings: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  module: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/06-samfunn-makt-etikk.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/06-samfunn-makt-etikk-brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/vitenskap-society-power-ethics-coverage-audit.json'
});

const EXPECTED_EMNES = [
  'em_vit_ekspertmakt',
  'em_vit_forskning_politikk',
  'em_vit_forskningsansvar',
  'em_vit_forskningsfinansiering',
  'em_vit_interessekonflikt',
  'em_vit_marginaliserte_felt',
  'em_vit_offentlig_tillit',
  'em_vit_risiko_usikkerhet',
  'em_vit_samfunnsendring',
  'em_vit_standarder_styring',
  'em_vit_vitenskapelige_kontroverser',
  'em_vit_vitenskapsetikk',
  'em_vit_vitenskapsformidling',
  'em_vit_samfunnsrolle',
  'em_vit_kunnskap_formidling_utdanning'
];
const EXPECTED_NEW_CLAIMS = Array.from({ length: 15 }, (_, i) => `vit1-${47 + i}`);
const EXPECTED_NEW_SOURCES = [
  'vit1-28-nent-2024',
  'vit1-29-nasem-science-communication',
  'vit1-30-oecd-frascati-funding',
  'vit1-31-nih-fcoi',
  'vit1-32-ipcc-uncertainty',
  'vit1-33-nist-standardization',
  'vit1-34-nist-conformity',
  'vit1-35-who-risk-trust',
  'vit1-36-unesco-science-researchers',
  'vit1-37-norway-general-research-ethics'
];
const EXPECTED_CLAIM_USAGE = Object.freeze({
  'vit1-47': ['vit1-samfunn-1','vit1-samfunn-3','vit1-samfunn-7'],
  'vit1-48': ['vit1-samfunn-1'],
  'vit1-49': ['vit1-samfunn-6'],
  'vit1-50': ['vit1-samfunn-2'],
  'vit1-51': ['vit1-samfunn-2'],
  'vit1-52': ['vit1-samfunn-2'],
  'vit1-53': ['vit1-samfunn-3'],
  'vit1-54': ['vit1-samfunn-3'],
  'vit1-55': ['vit1-samfunn-4'],
  'vit1-56': ['vit1-samfunn-4','vit1-samfunn-6'],
  'vit1-57': ['vit1-samfunn-5'],
  'vit1-58': ['vit1-samfunn-6','vit1-samfunn-7'],
  'vit1-59': ['vit1-samfunn-6'],
  'vit1-60': ['vit1-samfunn-1','vit1-samfunn-3','vit1-samfunn-5','vit1-samfunn-7'],
  'vit1-61': ['vit1-samfunn-7']
});

const abs = (rel) => path.join(ROOT, rel);
const json = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && new Set(a).size === a.length && isDeepStrictEqual(sorted(a), sorted(b));
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapSocietyPowerEthicsCoverage({ writeReport = false, checkReport = true } = {}) {
  const readiness = json(P.readiness);
  const emners = json(P.emners);
  const mappings = json(P.mappings);
  const chapter = json(P.chapter);
  const module = json(P.module);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);
  const registry = json(P.registry);
  const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
  const canonicalIds = new Set(emners.map((row) => row.emne_id));
  const mappingById = new Map(mappings.map((row) => [row.emne_id, row]));

  assert(readiness.subject_id === 'vitenskap', 'Coverage audit fikk feil readiness subject');
  assert(readiness.complete_ready === false, 'Samfunn/makt/etikk-batchen kan ikke gjøre Vitenskap complete');
  assert(readiness.status === 'breadth_chapters_materialized_final_audit_pending', 'Batch 3 må forbli i final-audit-pending fase');
  assert(readiness.next_gate === 'final_holistic_university_breadth_completion_audit', 'Batch 3 må bevare holistic next gate');
  assert(module.schema === 'history_go_fagverk_editorial_coverage_supplement_v1', 'Samfunn/makt/etikk-supplement har feil schema');
  assert(module.chapter_id === chapter.chapter_id && module.domain_id === 'samfunn_makt_etikk', 'Batch 3-supplement har feil eier eller domene');
  assert(brief.schema === 'history_go_fagverk_editorial_coverage_supplement_brief_v1', 'Batch 3-brief har feil schema');
  assert(sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Batch 3-brief har feil canonical emnesett');
  assert(brief.qualityContract?.holisticOwnedCountAfterMaterialization === 78, 'Brief må låse holistic owned til 78 etter batch 3');
  assert(brief.qualityContract?.holisticUncoveredCountAfterMaterialization === 39, 'Brief må låse holistic blockers til 39 etter batch 3');

  for (const id of EXPECTED_EMNES) {
    assert(canonicalIds.has(id), `${id} finnes ikke i canonical inventory`);
    const mapping = mappingById.get(id);
    const primary = mapping?.mappings?.find((row) => row.mapping_tier === 'primary');
    assert(primary?.fagkart_kategori === 'samfunn_makt_etikk', `${id} er ikke primary-mapped til samfunn_makt_etikk`);
  }

  const treatments = module.coverageTreatments || [];
  assert(treatments.length === 15 && sameSet(treatments.map((row) => row.emne_id), EXPECTED_EMNES), 'Supplementet må ha nøyaktig én treatment per canonical batch-emne');
  assert(treatments.every((row) => typeof row.focus === 'string' && row.focus.length >= 75), 'Coverage treatment mangler substansielt faglig fokus');
  const sections = module.sections || [];
  assert(sections.length === 7, 'Batch 3-supplementet skal ha syv redigerte seksjoner');
  assert(new Set(sections.map((row) => row.id)).size === 7, 'Batch 3-supplementet har dupliserte seksjons-ID-er');
  const sectionById = new Map(sections.map((row) => [row.id, row]));
  for (const treatment of treatments) {
    const section = sectionById.get(treatment.section_id);
    assert(section, `${treatment.emne_id} peker til ukjent treatment section`);
    assert(section.emne_ids?.includes(treatment.emne_id), `${treatment.emne_id} er ikke eksplisitt behandlet i angitt seksjon`);
  }
  assert(sameSet(sections.flatMap((row) => row.emne_ids || []), EXPECTED_EMNES), 'Seksjonenes emne-eierskap matcher ikke batch 3');
  assert(sections.every((row) => row.methodLimits?.length >= 2), 'Hver batch 3-seksjon må lære minst to metodebegrensninger');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(paragraphs.length === 21, 'Batch 3-supplementet skal ha 21 redigerte fagavsnitt');
  assert(paragraphs.every((text) => typeof text === 'string' && text.length >= 300), 'Alle batch 3-avsnitt må være substansielle');
  assert(new Set(paragraphs).size === paragraphs.length, 'Batch 3-supplementet gjenbruker identiske avsnitt');
  assert(sections.every((row) => row.paragraphClaimIds?.length === row.paragraphs?.length), 'Hvert batch 3-avsnitt må ha claim-sporing');

  assert(module.qualityGuard?.noExpertAuthorityTruthShortcut === true, 'Batch 3 må blokkere expert-authority-as-truth shortcut');
  assert(module.qualityGuard?.noFundingEqualsBiasShortcut === true, 'Batch 3 må skille finansiering fra bevist bias');
  assert(module.qualityGuard?.noUncertaintyEqualsIgnoranceShortcut === true, 'Batch 3 må skille usikkerhet fra uvitenhet');
  assert(module.qualityGuard?.noStandardEqualsTruthShortcut === true, 'Batch 3 må skille standard fra sannhetsgaranti');
  assert(module.qualityGuard?.noDeficitModelCommunicationShortcut === true, 'Batch 3 må blokkere ren deficit-model formidling');
  assert(module.qualityGuard?.philosophyBoundaryPreserved === true && module.qualityGuard?.politicsBoundaryPreserved === true, 'Batch 3 må bevare Filosofi/Politikk-grenser');
  assert(module.qualityGuard?.technologyRemainsNested === true, 'Batch 3 må bevare nested Teknologi');
  assert(module.qualityGuard?.doesNotClaimSubjectComplete === true, 'Batch 3 må blokkere premature complete');

  const sourceById = new Map((claimsDocument.sources || []).map((row) => [row.id, row]));
  const claimById = new Map((claimsDocument.claims || []).map((row) => [row.id, row]));
  for (const id of EXPECTED_NEW_SOURCES) {
    const source = sourceById.get(id);
    assert(source, `Mangler ny batch 3-kilde ${id}`);
    assert(/^https:\/\//.test(source.url || '') && source.publisher && source.source_location, `${id} er ikke inspiserbar`);
  }
  const refsBySection = new Map(sections.map((section) => [section.id, new Set([...flatten(section.paragraphClaimIds), ...flatten(section.keyPointClaimIds)])]));
  for (const id of EXPECTED_NEW_CLAIMS) {
    const claim = claimById.get(id);
    assert(claim?.status === 'verified' && claim.source_ids?.length, `${id} er ikke verified/kildekoblet`);
    assert(claim.source_ids.every((sourceId) => sourceById.has(sourceId)), `${id} peker til ukjent kilde`);
    const actualUsage = [...refsBySection.entries()].filter(([, refs]) => refs.has(id)).map(([sectionId]) => sectionId);
    assert(isDeepStrictEqual(sorted(actualUsage), sorted(EXPECTED_CLAIM_USAGE[id])), `${id} har feil faktisk section-usage`);
    assert(isDeepStrictEqual(sorted(claim.used_in || []), sorted(EXPECTED_CLAIM_USAGE[id])), `${id} har stale used_in`);
  }
  for (const section of sections) assert([...refsBySection.get(section.id)].every((id) => claimById.has(id)), `${section.id} peker til ukjent claim`);

  assert(module.workedExamples?.length === 2 && module.workedExamples.every((row) => row.analysis?.length >= 5), 'Batch 3 skal ha to substansielle worked examples');
  assert(module.applicationTasks?.length === 3 && module.applicationTasks.every((row) => row.prompts?.length >= 4), 'Batch 3 skal ha tre anvendelsesoppgaver');
  assert(module.misconceptions?.length === 5 && module.misconceptions.every((row) => row.claim && row.correction), 'Batch 3 skal ha fem eksplisitte misoppfatninger');
  assert(module.selfCheck?.length === 6 && module.selfCheck.every((row) => row.question && row.answer), 'Batch 3 skal ha seks self-checks');

  assert(chapter.moduleFiles?.includes(P.module), 'Chapter root er ikke koblet til batch 3-supplementet');
  assert(EXPECTED_EMNES.every((id) => chapter.emne_ids?.includes(id)), 'Chapter root eier ikke hele batch 3');
  const supplementMeta = chapter.editorialCoverageSupplements?.find((row) => row.id === 'samfunn_makt_etikk');
  assert(supplementMeta?.moduleFile === P.module && supplementMeta?.briefFile === P.brief && sameSet(supplementMeta.emne_ids, EXPECTED_EMNES), 'Chapter root mangler eksplisitt batch 3-supplementmetadata');
  assert(supplementMeta?.explicitFulltextTreatment === true && supplementMeta?.claimTraceRequired === true, 'Chapter root mangler fulltext/claim-sporingsflagg for batch 3');
  assert(registryChapter && sameSet(registryChapter.emne_ids, chapter.emne_ids), 'Registry/root emne-sett mismatch etter batch 3-materialisering');
  const registrySupplement = registryChapter.editorialCoverageSupplements?.find((row) => row.id === 'samfunn_makt_etikk');
  assert(registrySupplement?.explicitFulltextTreatment === true && sameSet(registrySupplement.emne_ids, EXPECTED_EMNES), 'Registry mangler eksplisitt fulltext-treatment metadata for batch 3');

  const holistic = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport: false, checkReport: false });
  assert(holistic.subject.completeReady === false && ['blocked','eligible_for_completion'].includes(holistic.status), 'Holistic audit må fortsatt blokkere completion etter batch 3');
  assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 78, 'Holistic owned-count kan ikke regressere under 78 etter batch 3');
  assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 39, 'Holistic uncovered-count kan ikke regressere over 39 etter batch 3');
  const coverageBlocker = holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap');
  assert(!coverageBlocker || coverageBlocker.count <= 39, 'Holistic coverage blocker kan ikke regressere over 39 etter batch 3');
  assert(['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status), 'Holistic quality review skal fortsatt være deferred');
  assert(holistic.evidence.allClaimsResolve === true, 'Holistic claim/source-spor må forbli grønt');
  assert(holistic.evidence.methodsWithLimitsChapterCount === holistic.evidence.chapterCount, 'Alle kapitler må fortsatt lære metodebegrensninger');
  assert(holistic.originality.exactDuplicateParagraphCount === 0, 'Batch 3 må ikke introdusere duplikatavsnitt');
  assert(holistic.originality.maxCrossChapterFiveGramJaccard < holistic.originality.threshold, 'Batch 3 må bevare cross-chapter originalitet');
  assert(holistic.technology.passes === true && holistic.technology.topLevelSubject === false, 'Nested Teknologi må forbli grønn og ikke-top-level');

  const report = {
    schema: 'history_go_fagverk_vitenskap_society_power_ethics_coverage_audit_v1',
    version: '1.0.0',
    status: 'pass',
    subject: 'vitenskap',
    domain: 'samfunn_makt_etikk',
    coverage: {
      explicitTreatmentCount: treatments.length,
      sectionCount: sections.length,
      paragraphCount: paragraphs.length,
      newClaimCount: EXPECTED_NEW_CLAIMS.length,
      newInspectableSourceCount: EXPECTED_NEW_SOURCES.length,
      holisticOwnedAfterBatch: 78,
      holisticUncoveredAfterBatch: 39
    },
    guards: {
      subjectCompleteRemainsFalse: readiness.complete_ready === false,
      allClaimsResolve: holistic.evidence.allClaimsResolve,
      fillerClean: holistic.evidence.fillerClean,
      exactDuplicateParagraphCount: holistic.originality.exactDuplicateParagraphCount,
      technologyRemainsNested: holistic.technology.passes && holistic.technology.topLevelSubject === false,
      qualityReviewDeferred:['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status)
    }
  };

  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), serialized);
  }
  if (checkReport && fs.existsSync(abs(P.report))) {
    assert(fs.readFileSync(abs(P.report), 'utf8') === serialized, 'Batch 3 audit-report er stale; regenerer rapporten');
  }
  return report;
}

const args = new Set(process.argv.slice(2));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditVitenskapSocietyPowerEthicsCoverage({
    writeReport: args.has('--write-report'),
    checkReport: !args.has('--no-check-report')
  });
  console.log(JSON.stringify(report, null, 2));
}
