#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  spec: 'data/fag/vitenskap/vitenskap_university_breadth_reconciliation_v1.json',
  emners: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json',
  methods: 'data/fag/vitenskap/methods_vitenskap_canonical_v4_6.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse.json',
  brief: 'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse/claims.json'
});

const CHAPTER_ID = 'vitenskap-medisin-fra-mekanisme-til-folkehelse';
const EXPECTED_EMNES = [
  'em_vit_biomedisinsk_mekanisme_og_modell',
  'em_vit_diagnostikk_biomarkorer_og_testegenskaper',
  'em_vit_kliniske_studier_og_intervensjoner',
  'em_vit_behandlingsevidens_og_effekt',
  'em_vit_folkehelse_arsak_og_forebygging'
];
const EXPECTED_METHODS = [
  'met_vit_modellanalyse',
  'met_vit_laboratorieanalyse',
  'met_vit_evidensanalyse',
  'met_vit_statistisk_analyse',
  'met_vit_maleinstrumentanalyse',
  'met_vit_eksperimentanalyse',
  'met_vit_risikoanalyse',
  'met_vit_epidemiologisk_analyse',
  'met_vit_kausalitetsanalyse'
];
const PLANNED_SECTIONS = [
  'vit5-grunnlag-1',
  'vit5-grunnlag-2',
  'vit5-grunnlag-3',
  'vit5-fordypning-1',
  'vit5-fordypning-2',
  'vit5-fordypning-3',
  'vit5-anvendelse-1',
  'vit5-anvendelse-2',
  'vit5-anvendelse-3'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id) => b.includes(id));

export function auditVitenskapMedicineBiomedicinePublicHealthSourceBrief() {
  const readiness = json(P.readiness);
  const spec = json(P.spec);
  const emners = json(P.emners);
  const methodsDocument = json(P.methods);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);

  assert(readiness.subject_id === 'vitenskap', 'Readiness peker ikke til Vitenskap');
  assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 0, 'v4.6 structural blocking gaps skal være reconcilet');
  assert(readiness.current_inventory?.vitenskap?.emne_count === 117, 'Vitenskap må stå på 117 canonicale emner');
  assert(readiness.current_inventory?.teknologi?.top_level_subject === false, 'Teknologi må forbli nested');
  assert(readiness.current_inventory?.teknologi?.canonical_parent_subject === 'vitenskap', 'Teknologi har feil canonical parent');

  const medicineCoverage = readiness.coverage_families?.find((row) => row.id === 'medicine_biomedicine_public_health');
  const medicineStillBlocked = (readiness.editorial_blockers || []).includes('medicine_biomedicine_public_health');
  if (medicineStillBlocked) {
    assert(readiness.complete_ready === false, 'Vitenskap kan ikke være complete mens medisin fortsatt er editorial blocker');
    assert(readiness.next_gate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Readiness har uventet next gate før Unit 5-fulltekst');
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === 4, 'Før Unit 5-fulltekstregistrering skal Vitenskap ha fire kapitler');
    assert(medicineCoverage?.status === 'inventory_reconciled', 'Før Unit 5-fulltekstregistrering skal medisin være inventory_reconciled');
  } else {
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count >= 5, 'Etter lukket medisin-blocker må Unit 5 være registrert');
    assert(medicineCoverage?.status === 'chapter_materialized', 'Etter Unit 5-fulltekstregistrering skal medisin være chapter_materialized');
    assert(medicineCoverage?.materialized_chapter_id === CHAPTER_ID, 'Medisinfamilien mangler chapter-link etter fulltekst');
    assert(fs.existsSync(abs(P.chapter)), 'Medisin-blocker kan ikke lukkes uten materialisert kapittelroot');
  }

  const family = spec.families?.find((row) => row.coverage_family_id === 'medicine_biomedicine_public_health');
  assert(family, 'Mangler medicine_biomedicine_public_health i v4.6 reconciliation-spec');
  assert(family.target_domain_id === 'natur_medisin_miljo', 'Medisinfamilien har feil target domain');
  assert(family.hook?.id === 'medisin_biomedisin_folkehelse', 'Medisinfamilien har feil canonical hook');
  assert(sameSet(family.topics.map((row) => row.id), EXPECTED_EMNES), 'v4.6-specen har uventet medisin-emnesett');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  for (const id of EXPECTED_EMNES) {
    const row = emneById.get(id);
    assert(row, `Mangler canonicalt medisin-emne ${id}`);
    assert(row.domain === 'natur_medisin_miljo', `${id} ligger i feil domain`);
    assert(row.canonical_status === 'canonical', `${id} er ikke canonical`);
  }
  const methodIds = new Set((methodsDocument.methods || []).map((row) => row.method_id));
  for (const id of EXPECTED_METHODS) assert(methodIds.has(id), `Ukjent canonical metode ${id}`);

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1', 'Medisin-brief har feil schema');
  assert(brief.chapter_id === CHAPTER_ID, 'Medisin-brief har feil chapter_id');
  assert(brief.primary_domain_id === 'natur_medisin_miljo', 'Medisin-brief har feil primary domain');
  assert(brief.coverage_family_id === 'medicine_biomedicine_public_health', 'Medisin-brief har feil coverage family');
  assert(sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Medisin-brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds, EXPECTED_METHODS), 'Medisin-brief har feil obligatoriske metoder');
  assert((brief.learningArc || []).length >= 9, 'Medisin-brief har for kort learning arc');
  assert((brief.requiredCriticalDistinctions || []).length >= 24, 'Medisin-brief mangler kritiske distinksjoner');
  assert((brief.documentedCasesOrScenarios || []).length >= 4, 'Medisin-brief mangler dokumenterte case/scenarioer');
  assert((brief.localAnchors || []).some((row) => /Rikshospitalet|Ullevål/.test(row.place || '')), 'Medisin-brief mangler canonicalt Oslo-sykehusanker');
  assert((brief.localAnchors || []).some((row) => /Universitetet i Oslo|Blindern/.test(row.place || '')), 'Medisin-brief mangler universitet/Blindern-anker');
  assert(brief.sourceStrategy?.minimumExternalSources >= 12, 'Medisin-brief krever for få eksterne kilder');
  assert(brief.sourceStrategy?.claimLevelTrace === true, 'Medisin-brief mangler claim-level trace');
  assert(brief.sourceStrategy?.sourceLocationsRequired === true, 'Medisin-brief mangler source-locator-krav');
  assert(brief.sourceStrategy?.noDecorativeSources === true, 'Medisin-brief må blokkere dekorative kilder');
  assert(brief.sourceStrategy?.primaryOrOfficialTechnicalSourcesPreferred === true, 'Medisin-brief må prioritere primære/officiale tekniske kilder');
  assert(brief.qa?.modelToClinicalTranslationBoundaryRequired === true, 'Medisin-brief må låse modell/translasjonsgrensen');
  assert(brief.qa?.diagnosticMeasurementDecisionChainRequired === true, 'Medisin-brief må låse måling/test/diagnose-kjeden');
  assert(brief.qa?.randomizedTrialPrespecificationBoundaryRequired === true, 'Medisin-brief må låse randomisering/prespesifikasjon-grensen');
  assert(brief.qa?.relativeAbsoluteClinicalImportanceBoundaryRequired === true, 'Medisin-brief må låse relativ/absolutt/klinisk betydning-grensen');
  assert(brief.qa?.epidemiologyCausalityConfoundingBoundaryRequired === true, 'Medisin-brief må låse epidemiologi/kausalitet/confounding-grensen');
  assert(brief.qa?.medicineEditorialBlockerRemainsOpenUntilFulltextAndRegistration === true, 'Brief-kontrakten må kreve blocker fram til fulltekstregistrering');
  assert(brief.qa?.sourceClaimReciprocityRequiredForFulltext === true, 'Medisin-brief må kreve reciprocal claim trace i fulltekst');
  assert(brief.qa?.technologyRemainsNestedRequired === true, 'Medisin-brief må bevare nested Teknologi');
  assert(brief.qa?.noMedicalAdviceOrIndividualDiagnosis === true, 'Medisin-brief må være forskningsmetode, ikke individuell medisinsk rådgivning');

  const rejected = (brief.rejectedOrDeferred || []).map((row) => `${row.detail || ''} ${row.reason || ''}`.toLowerCase());
  assert(rejected.some((text) => text.includes('laboratoriefunn') && text.includes('mennesker')), 'Brief må avvise automatisk modell→menneske-translasjon');
  assert(rejected.some((text) => text.includes('testverdi') && text.includes('diagnose')), 'Brief må avvise testverdi = diagnose');
  assert(rejected.some((text) => text.includes('prediktiv') && text.includes('prevalens')), 'Brief må låse prediktiv verdi til prevalens');
  assert(rejected.some((text) => text.includes('signifikant') && text.includes('klinisk')), 'Brief må avvise statistisk signifikans = klinisk betydning');
  assert(rejected.some((text) => text.includes('relativ') && text.includes('absolutt')), 'Brief må låse relativ vs absolutt effekt');
  assert(rejected.some((text) => text.includes('assosiasjon') && text.includes('kausal')), 'Brief må avvise assosiasjon = kausalitet');
  assert(rejected.some((text) => text.includes('sykdomsrate') && text.includes('tiltak')), 'Brief må avvise enkel før/etter-rate = tiltakets effekt');

  assert(claimsDocument.schema === 'history_go_fagverk_claim_registry_v1', 'Medisin-claims har feil schema');
  assert(claimsDocument.chapter_id === brief.chapter_id, 'Medisin-claims peker til feil kapittel');
  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length === 12, `Forventet 12 kilder, fant ${sources.length}`);
  assert(claims.length === 20, `Forventet 20 claims, fant ${claims.length}`);
  assert(new Set(sources.map((row) => row.id)).size === sources.length, 'Medisin-brief har dupliserte source-ID-er');
  assert(new Set(claims.map((row) => row.id)).size === claims.length, 'Medisin-brief har dupliserte claim-ID-er');
  assert(sources.every((row) => /^https:\/\//.test(row.url || '') && row.publisher && row.source_location), 'Alle medisin-kilder må ha HTTPS, publisher og source_location');

  const sourceIds = new Set(sources.map((row) => row.id));
  const sourceUse = new Map([...sourceIds].map((id) => [id, 0]));
  const sectionUse = new Map(PLANNED_SECTIONS.map((id) => [id, 0]));
  for (const claim of claims) {
    assert(claim.status === 'verified', `${claim.id} er ikke verified`);
    assert(typeof claim.claim === 'string' && claim.claim.trim().length >= 100 && /[.!?]$/.test(claim.claim.trim()), `${claim.id} må være en fullstendig substansiell claim`);
    assert(Array.isArray(claim.source_ids) && claim.source_ids.length >= 1, `${claim.id} mangler source_ids`);
    for (const id of claim.source_ids) {
      assert(sourceIds.has(id), `${claim.id} peker til ukjent kilde ${id}`);
      sourceUse.set(id, sourceUse.get(id) + 1);
    }
    assert(Array.isArray(claim.used_in) && claim.used_in.length >= 1, `${claim.id} mangler planned used_in`);
    for (const sectionId of claim.used_in) {
      assert(sectionUse.has(sectionId), `${claim.id} peker til uventet planlagt seksjon ${sectionId}`);
      sectionUse.set(sectionId, sectionUse.get(sectionId) + 1);
    }
    if (claim.classification === 'cross-source-synthesis') assert(claim.source_ids.length >= 2, `${claim.id} er synthesis uten flere kilder`);
  }
  assert([...sourceUse.values()].every((count) => count >= 1), 'Medisin-brief har dekorativ kilde uten claim-bruk');
  assert([...sectionUse.values()].every((count) => count >= 2), 'En planlagt Unit 5-seksjon har for svakt claim-grunnlag');

  assert(claims.some((row) => row.id === 'vit5-05' && /prediktive verdier/i.test(row.claim) && /prevalens/i.test(row.claim)), 'Mangler eksplisitt prevalens/prediktiv-verdi-grense');
  assert(claims.some((row) => row.id === 'vit5-16' && row.classification === 'cross-source-synthesis'), 'Mangler modell/translasjon-syntese');
  assert(claims.some((row) => row.id === 'vit5-18' && row.classification === 'cross-source-synthesis'), 'Mangler diagnostisk evidenskjede-syntese');
  assert(claims.some((row) => row.id === 'vit5-19' && row.classification === 'cross-source-synthesis'), 'Mangler behandlingseffekt-syntese');
  assert(claims.some((row) => row.id === 'vit5-20' && row.classification === 'cross-source-synthesis'), 'Mangler folkehelse/kausalitet-syntese');

  return {
    schema: 'history_go_fagverk_vitenskap_medicine_biomedicine_public_health_source_brief_audit_v1',
    version: '1.0.0',
    status: 'pass',
    subject: 'vitenskap',
    chapterId: brief.chapter_id,
    coverageFamilyId: brief.coverage_family_id,
    summary: {
      emneCount: brief.requiredEmneIds.length,
      methodCount: brief.requiredMethodIds.length,
      sourceCount: sources.length,
      claimCount: claims.length,
      plannedSectionCount: PLANNED_SECTIONS.length,
      criticalDistinctionCount: brief.requiredCriticalDistinctions.length,
      scenarioCount: brief.documentedCasesOrScenarios.length
    },
    gates: {
      canonicalV46MedicineFamilyLocked: true,
      sourcesInspectableAndUsed: true,
      claimsVerifiedAndTracePlanned: true,
      modelTranslationBoundaryLocked: true,
      diagnosticEvidenceBoundaryLocked: true,
      trialPrespecificationBoundaryLocked: true,
      relativeAbsoluteEffectBoundaryLocked: true,
      epidemiologyCausalityBoundaryLocked: true,
      sourceBriefPhaseConsistentWithReadiness: true,
      prematureCompleteBlockedWhileMedicineOpen: medicineStillBlocked ? readiness.complete_ready === false : true,
      technologyRemainsNested: true,
      noIndividualMedicalAdvice: true
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log(JSON.stringify(auditVitenskapMedicineBiomedicinePublicHealthSourceBrief(), null, 2));
}
