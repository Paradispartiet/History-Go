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
  chapter: 'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos/claims.json'
});

const CHAPTER_ID = 'vitenskap-fysikk-fra-bevegelse-til-kosmos';
const EXPECTED_EMNES = [
  'em_vit_mekanikk_krefter_bevegelse',
  'em_vit_energi_termodynamikk',
  'em_vit_bolger_og_optikk',
  'em_vit_elektromagnetisme',
  'em_vit_kvantefysikk',
  'em_vit_relativitet',
  'em_vit_atom_og_kjernefysikk',
  'em_vit_astronomi_og_kosmologi'
];
const EXPECTED_METHODS = [
  'met_vit_maleinstrumentanalyse',
  'met_vit_modellanalyse',
  'met_vit_beregningsanalyse',
  'met_vit_eksperimentanalyse',
  'met_vit_systemanalyse',
  'met_vit_sensoranalyse',
  'met_vit_statistisk_analyse',
  'met_vit_observasjonsanalyse'
];
const PLANNED_SECTIONS = [
  'vit3-grunnlag-1',
  'vit3-grunnlag-2',
  'vit3-grunnlag-3',
  'vit3-fordypning-1',
  'vit3-fordypning-2',
  'vit3-fordypning-3',
  'vit3-anvendelse-1',
  'vit3-anvendelse-2',
  'vit3-anvendelse-3'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id) => b.includes(id));

export function auditVitenskapPhysicsAstronomySourceBrief() {
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

  const physicsCoverage = readiness.coverage_families?.find((row) => row.id === 'physics_astronomy');
  const physicsStillBlocked = (readiness.editorial_blockers || []).includes('physics_astronomy');
  if (physicsStillBlocked) {
    assert(readiness.complete_ready === false, 'Vitenskap kan ikke være complete mens fysikk fortsatt er editorial blocker');
    assert(readiness.next_gate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Readiness har uventet next gate før Unit 3-fulltekst');
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === 2, 'Før fysikk-fulltekstregistrering skal Vitenskap ha to kapitler');
    assert(physicsCoverage?.status === 'inventory_reconciled', 'Før fysikk-fulltekstregistrering skal fysikk være inventory_reconciled');
  } else {
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count >= 3, 'Etter lukket fysikk-blocker må Unit 3 være registrert');
    assert(physicsCoverage?.status === 'chapter_materialized', 'Etter fysikk-fulltekstregistrering skal familien være chapter_materialized');
    assert(physicsCoverage?.materialized_chapter_id === CHAPTER_ID, 'Fysikkfamilien mangler chapter-link etter fulltekst');
    assert(fs.existsSync(abs(P.chapter)), 'Fysikk-blocker kan ikke lukkes uten materialisert kapittelroot');
  }

  const family = spec.families?.find((row) => row.coverage_family_id === 'physics_astronomy');
  assert(family, 'Mangler physics_astronomy i v4.6 reconciliation-spec');
  assert(family.target_domain_id === 'natur_medisin_miljo', 'Fysikkfamilien har feil target domain');
  assert(family.hook?.id === 'fysikk_astronomi', 'Fysikkfamilien har feil canonical hook');
  assert(sameSet(family.topics.map((row) => row.id), EXPECTED_EMNES), 'v4.6-specen har uventet fysikk-emnesett');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  for (const id of EXPECTED_EMNES) {
    const row = emneById.get(id);
    assert(row, `Mangler canonicalt fysikk-emne ${id}`);
    assert(row.domain === 'natur_medisin_miljo', `${id} ligger i feil domain`);
    assert(row.canonical_status === 'canonical', `${id} er ikke canonical`);
  }
  const methodIds = new Set((methodsDocument.methods || []).map((row) => row.method_id));
  for (const id of EXPECTED_METHODS) assert(methodIds.has(id), `Ukjent canonical metode ${id}`);

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1', 'Fysikk-brief har feil schema');
  assert(brief.chapter_id === CHAPTER_ID, 'Fysikk-brief har feil chapter_id');
  assert(brief.primary_domain_id === 'natur_medisin_miljo', 'Fysikk-brief har feil primary domain');
  assert(brief.coverage_family_id === 'physics_astronomy', 'Fysikk-brief har feil coverage family');
  assert(sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Fysikk-brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds, EXPECTED_METHODS), 'Fysikk-brief har feil obligatoriske metoder');
  assert((brief.learningArc || []).length >= 8, 'Fysikk-brief har for kort learning arc');
  assert((brief.requiredCriticalDistinctions || []).length >= 20, 'Fysikk-brief mangler kritiske distinksjoner');
  assert((brief.documentedCasesOrScenarios || []).length >= 4, 'Fysikk-brief mangler dokumenterte case/scenarioer');
  assert((brief.localAnchors || []).some((row) => /Observatoriet/.test(row.place || '')), 'Fysikk-brief mangler Observatoriet-anker');
  assert(brief.sourceStrategy?.minimumExternalSources >= 12, 'Fysikk-brief krever for få eksterne kilder');
  assert(brief.sourceStrategy?.claimLevelTrace === true, 'Fysikk-brief mangler claim-level trace');
  assert(brief.sourceStrategy?.sourceLocationsRequired === true, 'Fysikk-brief mangler source-locator-krav');
  assert(brief.sourceStrategy?.noDecorativeSources === true, 'Fysikk-brief må blokkere dekorative kilder');
  assert(brief.sourceStrategy?.primaryOrOfficialTechnicalSourcesPreferred === true, 'Fysikk-brief må prioritere primære/officiale tekniske kilder');
  assert(brief.qa?.measurementModelObservationBoundaryRequired === true, 'Fysikk-brief må låse måling/modell/observasjon-grensen');
  assert(brief.qa?.physicsEditorialBlockerRemainsOpenUntilFulltextAndRegistration === true, 'Brief-kontrakten må kreve blocker fram til fulltekstregistrering');

  const rejected = (brief.rejectedOrDeferred || []).map((row) => `${row.detail || ''} ${row.reason || ''}`.toLowerCase());
  assert(rejected.some((text) => text.includes('varme') && text.includes('temperatur')), 'Brief må avvise varme = temperatur');
  assert(rejected.some((text) => text.includes('kvante') && text.includes('alt er mulig')), 'Brief må avvise kvantemystikk');
  assert(rejected.some((text) => text.includes('standard model') && text.includes('gravitasjon')), 'Brief må avvise Standard Model = komplett gravitasjonsteori');
  assert(rejected.some((text) => text.includes('astronomisk bilde') && text.includes('instrument')), 'Brief må avvise bilde = uformidlet observasjon');

  assert(claimsDocument.schema === 'history_go_fagverk_claim_registry_v1', 'Fysikk-claims har feil schema');
  assert(claimsDocument.chapter_id === brief.chapter_id, 'Fysikk-claims peker til feil kapittel');
  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length === 12, `Forventet 12 kilder, fant ${sources.length}`);
  assert(claims.length === 20, `Forventet 20 claims, fant ${claims.length}`);
  assert(new Set(sources.map((row) => row.id)).size === sources.length, 'Fysikk-brief har dupliserte source-ID-er');
  assert(new Set(claims.map((row) => row.id)).size === claims.length, 'Fysikk-brief har dupliserte claim-ID-er');
  assert(sources.every((row) => /^https:\/\//.test(row.url || '') && row.publisher && row.source_location), 'Alle fysikk-kilder må ha HTTPS, publisher og source_location');

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
  assert([...sourceUse.values()].every((count) => count >= 1), 'Fysikk-brief har dekorativ kilde uten claim-bruk');
  assert([...sectionUse.values()].every((count) => count >= 2), 'En planlagt Unit 3-seksjon har for svakt claim-grunnlag');

  assert(claims.some((row) => row.id === 'vit3-13' && /gravitasjon/i.test(row.claim)), 'Mangler eksplisitt Standard Model/gravitasjon-grense');
  assert(claims.some((row) => row.id === 'vit3-18' && row.classification === 'cross-source-synthesis'), 'Mangler instrumentmediert evidenskjede');
  assert(claims.some((row) => row.id === 'vit3-19' && row.classification === 'cross-source-synthesis'), 'Mangler kvante/kjerne/partikkel model-experiment-grense');

  return {
    schema: 'history_go_fagverk_vitenskap_physics_astronomy_source_brief_audit_v1',
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
      canonicalV46PhysicsFamilyLocked: true,
      sourcesInspectableAndUsed: true,
      claimsVerifiedAndTracePlanned: true,
      measurementModelObservationBoundaryLocked: true,
      sourceBriefPhaseConsistentWithReadiness: true,
      prematureCompleteBlocked: true,
      technologyRemainsNested: true
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log(JSON.stringify(auditVitenskapPhysicsAstronomySourceBrief(), null, 2));
}
