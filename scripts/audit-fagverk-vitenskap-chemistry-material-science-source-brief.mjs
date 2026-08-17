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
  chapter: 'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap.json',
  brief: 'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap/claims.json'
});

const CHAPTER_ID = 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap';
const EXPECTED_EMNES = [
  'em_vit_atomstruktur_og_periodesystem',
  'em_vit_kjemiske_bindinger_og_struktur',
  'em_vit_reaksjoner_stokiometri_og_likevekt',
  'em_vit_kjemisk_termodynamikk_og_kinetikk',
  'em_vit_analytisk_kjemi_og_spektroskopi',
  'em_vit_materialkjemi_og_egenskaper'
];
const EXPECTED_METHODS = [
  'met_vit_modellanalyse',
  'met_vit_laboratorieanalyse',
  'met_vit_evidensanalyse',
  'met_vit_materialanalyse',
  'met_vit_maleinstrumentanalyse',
  'met_vit_beregningsanalyse',
  'met_vit_statistisk_analyse',
  'met_vit_kalibreringsanalyse'
];
const PLANNED_SECTIONS = [
  'vit4-grunnlag-1',
  'vit4-grunnlag-2',
  'vit4-grunnlag-3',
  'vit4-fordypning-1',
  'vit4-fordypning-2',
  'vit4-fordypning-3',
  'vit4-anvendelse-1',
  'vit4-anvendelse-2',
  'vit4-anvendelse-3'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id) => b.includes(id));

export function auditVitenskapChemistryMaterialScienceSourceBrief() {
  const readiness = json(P.readiness);
  const spec = json(P.spec);
  const emners = json(P.emners);
  const methodsDocument = json(P.methods);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);

  assert(readiness.subject_id === 'vitenskap', 'Readiness peker ikke til Vitenskap');
  assert(readiness.complete_ready === false, 'Kjemi-arbeid kan ikke gjøre Vitenskap complete');
  assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 0, 'v4.6 structural blocking gaps skal være reconcilet');
  assert(readiness.next_gate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Readiness har uventet next gate');
  assert(readiness.current_inventory?.vitenskap?.emne_count === 117, 'Vitenskap må stå på 117 canonicale emner');
  assert(readiness.current_inventory?.teknologi?.top_level_subject === false, 'Teknologi må forbli nested');
  assert(readiness.current_inventory?.teknologi?.canonical_parent_subject === 'vitenskap', 'Teknologi har feil canonical parent');

  const chemistryCoverage = readiness.coverage_families?.find((row) => row.id === 'chemistry_material_science');
  const chemistryStillBlocked = (readiness.editorial_blockers || []).includes('chemistry_material_science');
  if (chemistryStillBlocked) {
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === 3, 'Før kjemi-fulltekstregistrering skal Vitenskap ha tre kapitler');
    assert(chemistryCoverage?.status === 'inventory_reconciled', 'Før kjemi-fulltekstregistrering skal kjemi være inventory_reconciled');
  } else {
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count >= 4, 'Etter lukket kjemi-blocker må Unit 4 være registrert');
    assert(chemistryCoverage?.status === 'chapter_materialized', 'Etter kjemi-fulltekstregistrering skal familien være chapter_materialized');
    assert(chemistryCoverage?.materialized_chapter_id === CHAPTER_ID, 'Kjemifamilien mangler chapter-link etter fulltekst');
    assert(fs.existsSync(abs(P.chapter)), 'Kjemi-blocker kan ikke lukkes uten materialisert kapittelroot');
  }

  const family = spec.families?.find((row) => row.coverage_family_id === 'chemistry_material_science');
  assert(family, 'Mangler chemistry_material_science i v4.6 reconciliation-spec');
  assert(family.target_domain_id === 'natur_medisin_miljo', 'Kjemifamilien har feil target domain');
  assert(family.hook?.id === 'kjemi_materialvitenskap', 'Kjemifamilien har feil canonical hook');
  assert(sameSet(family.topics.map((row) => row.id), EXPECTED_EMNES), 'v4.6-specen har uventet kjemi-emnesett');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  for (const id of EXPECTED_EMNES) {
    const row = emneById.get(id);
    assert(row, `Mangler canonicalt kjemi-emne ${id}`);
    assert(row.domain === 'natur_medisin_miljo', `${id} ligger i feil domain`);
    assert(row.canonical_status === 'canonical', `${id} er ikke canonical`);
  }
  const methodIds = new Set((methodsDocument.methods || []).map((row) => row.method_id));
  for (const id of EXPECTED_METHODS) assert(methodIds.has(id), `Ukjent canonical metode ${id}`);

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1', 'Kjemi-brief har feil schema');
  assert(brief.chapter_id === CHAPTER_ID, 'Kjemi-brief har feil chapter_id');
  assert(brief.primary_domain_id === 'natur_medisin_miljo', 'Kjemi-brief har feil primary domain');
  assert(brief.coverage_family_id === 'chemistry_material_science', 'Kjemi-brief har feil coverage family');
  assert(sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Kjemi-brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds, EXPECTED_METHODS), 'Kjemi-brief har feil obligatoriske metoder');
  assert((brief.learningArc || []).length >= 8, 'Kjemi-brief har for kort learning arc');
  assert((brief.requiredCriticalDistinctions || []).length >= 20, 'Kjemi-brief mangler kritiske distinksjoner');
  assert((brief.documentedCasesOrScenarios || []).length >= 4, 'Kjemi-brief mangler dokumenterte case/scenarioer');
  assert((brief.localAnchors || []).some((row) => /Universitetet i Oslo|Blindern/.test(row.place || '')), 'Kjemi-brief mangler universitet/Blindern-anker');
  assert(brief.sourceStrategy?.minimumExternalSources >= 12, 'Kjemi-brief krever for få eksterne kilder');
  assert(brief.sourceStrategy?.claimLevelTrace === true, 'Kjemi-brief mangler claim-level trace');
  assert(brief.sourceStrategy?.sourceLocationsRequired === true, 'Kjemi-brief mangler source-locator-krav');
  assert(brief.sourceStrategy?.noDecorativeSources === true, 'Kjemi-brief må blokkere dekorative kilder');
  assert(brief.sourceStrategy?.primaryOrOfficialTechnicalSourcesPreferred === true, 'Kjemi-brief må prioritere primære/officiale tekniske kilder');
  assert(brief.qa?.structureReactionMeasurementBoundaryRequired === true, 'Kjemi-brief må låse struktur/reaksjon/måling-grensen');
  assert(brief.qa?.thermodynamicsVsKineticsBoundaryRequired === true, 'Kjemi-brief må låse termodynamikk/kinetikk-grensen');
  assert(brief.qa?.sampleSignalInferenceChainRequired === true, 'Kjemi-brief må låse prøve/signal/slutning-kjeden');
  assert(brief.qa?.chemistryEditorialBlockerRemainsOpenUntilFulltextAndRegistration === true, 'Brief-kontrakten må kreve blocker fram til fulltekstregistrering');
  assert(brief.qa?.technologyBoundaryRequired === true, 'Kjemi-brief må bevare faggrensen mot nested Teknologi');

  const rejected = (brief.rejectedOrDeferred || []).map((row) => `${row.detail || ''} ${row.reason || ''}`.toLowerCase());
  assert(rejected.some((text) => text.includes('balansert reaksjonslikning') && text.includes('mekanisme')), 'Brief må avvise reaksjonslikning = mekanisme');
  assert(rejected.some((text) => text.includes('termodynamisk') && text.includes('rask')), 'Brief må avvise termodynamisk gunstig = rask');
  assert(rejected.some((text) => text.includes('katalysator') && text.includes('likevekt')), 'Brief må avvise katalysator = flyttet likevekt');
  assert(rejected.some((text) => text.includes('deteksjonsgrense') && text.includes('fravær')), 'Brief må avvise ikke-detektert = fravær');
  assert(rejected.some((text) => text.includes('spek') && text.includes('identifikasjon')), 'Brief må avvise spektralt treff = automatisk identifikasjon');
  assert(rejected.some((text) => text.includes('materialegenskap') && text.includes('mikrostruktur')), 'Brief må avvise sammensetning = full materialforklaring');

  assert(claimsDocument.schema === 'history_go_fagverk_claim_registry_v1', 'Kjemi-claims har feil schema');
  assert(claimsDocument.chapter_id === brief.chapter_id, 'Kjemi-claims peker til feil kapittel');
  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length === 12, `Forventet 12 kilder, fant ${sources.length}`);
  assert(claims.length === 20, `Forventet 20 claims, fant ${claims.length}`);
  assert(new Set(sources.map((row) => row.id)).size === sources.length, 'Kjemi-brief har dupliserte source-ID-er');
  assert(new Set(claims.map((row) => row.id)).size === claims.length, 'Kjemi-brief har dupliserte claim-ID-er');
  assert(sources.every((row) => /^https:\/\//.test(row.url || '') && row.publisher && row.source_location), 'Alle kjemi-kilder må ha HTTPS, publisher og source_location');

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
  assert([...sourceUse.values()].every((count) => count >= 1), 'Kjemi-brief har dekorativ kilde uten claim-bruk');
  assert([...sectionUse.values()].every((count) => count >= 2), 'En planlagt Unit 4-seksjon har for svakt claim-grunnlag');

  assert(claims.some((row) => row.id === 'vit4-14' && /deteksjonsgrense/i.test(row.claim)), 'Mangler eksplisitt deteksjonsgrense/fravær-grense');
  assert(claims.some((row) => row.id === 'vit4-19' && row.classification === 'cross-source-synthesis'), 'Mangler termodynamikk/kinetikk-syntese');
  assert(claims.some((row) => row.id === 'vit4-20' && row.classification === 'cross-source-synthesis'), 'Mangler struktur/materialegenskap/Teknologi-grense');

  return {
    schema: 'history_go_fagverk_vitenskap_chemistry_material_science_source_brief_audit_v1',
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
      canonicalV46ChemistryFamilyLocked: true,
      sourcesInspectableAndUsed: true,
      claimsVerifiedAndTracePlanned: true,
      thermodynamicsKineticsBoundaryLocked: true,
      sampleSignalInferenceBoundaryLocked: true,
      materialScienceTechnologyBoundaryLocked: true,
      sourceBriefPhaseConsistentWithReadiness: true,
      prematureCompleteBlocked: true,
      technologyRemainsNested: true
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log(JSON.stringify(auditVitenskapChemistryMaterialScienceSourceBrief(), null, 2));
}
