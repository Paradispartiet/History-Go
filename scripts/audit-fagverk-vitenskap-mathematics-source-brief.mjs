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
  chapter: 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell.json',
  brief: 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-matematisk-bevis-struktur-og-modell/claims.json'
});

const EXPECTED_EMNES = [
  'em_vit_matematisk_bevis_og_deduksjon',
  'em_vit_algebra_og_strukturer',
  'em_vit_analyse_endring_og_kontinuitet',
  'em_vit_geometri_rom_og_symmetri',
  'em_vit_diskret_matematikk_og_kombinatorikk'
];
const EXPECTED_METHODS = [
  'met_vit_teorianalyse',
  'met_vit_beregningsanalyse',
  'met_vit_modellanalyse',
  'met_vit_statistisk_analyse',
  'met_vit_visualiseringsanalyse',
  'met_vit_algoritmeanalyse'
];
const PLANNED_SECTIONS = [
  'vit2-grunnlag-1',
  'vit2-grunnlag-2',
  'vit2-grunnlag-3',
  'vit2-fordypning-1',
  'vit2-fordypning-2',
  'vit2-fordypning-3',
  'vit2-anvendelse-1',
  'vit2-anvendelse-2',
  'vit2-anvendelse-3'
];

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id) => b.includes(id));

export function auditVitenskapMathematicsSourceBrief() {
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

  const mathCoverage = readiness.coverage_families?.find((row) => row.id === 'mathematics_formal_sciences');
  const mathStillBlocked = (readiness.editorial_blockers || []).includes('mathematics_formal_sciences');
  if (mathStillBlocked) {
    assert(readiness.complete_ready === false, 'Vitenskap kan ikke være complete mens matematikk fortsatt er editorial blocker');
    assert(readiness.next_gate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Readiness har uventet next gate før Unit 2-fulltekst');
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === 1, 'Før fulltekstregistrering skal Vitenskap ha ett kapittel');
    assert(mathCoverage?.status === 'inventory_reconciled', 'Før fulltekstregistrering skal matematikk være inventory_reconciled');
  } else {
    assert(readiness.current_inventory?.vitenskap?.registered_chapter_count >= 2, 'Etter lukket matematikk-blocker må Unit 2 være registrert');
    assert(mathCoverage?.status === 'chapter_materialized', 'Etter fulltekstregistrering skal matematikk være chapter_materialized');
    assert(mathCoverage?.materialized_chapter_id === 'vitenskap-matematisk-bevis-struktur-og-modell', 'Matematikkfamilien mangler chapter-link etter fulltekst');
    assert(fs.existsSync(abs(P.chapter)), 'Matematikk-blocker kan ikke lukkes uten materialisert kapittelroot');
  }

  const family = spec.families?.find((row) => row.coverage_family_id === 'mathematics_formal_sciences');
  assert(family, 'Mangler mathematics_formal_sciences i v4.6 reconciliation-spec');
  assert(family.target_domain_id === 'metoder_maling_modeller', 'Matematikkfamilien har feil target domain');
  assert(family.hook?.id === 'matematikk_formelle_fag', 'Matematikkfamilien har feil canonical hook');
  assert(sameSet(family.topics.map((row) => row.id), EXPECTED_EMNES), 'v4.6-specen har uventet matematikk-emnesett');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  for (const id of EXPECTED_EMNES) {
    const row = emneById.get(id);
    assert(row, `Mangler canonicalt matematikk-emne ${id}`);
    assert(row.domain === 'metoder_maling_modeller', `${id} ligger i feil domain`);
    assert(row.canonical_status === 'canonical', `${id} er ikke canonical`);
  }
  const methodIds = new Set((methodsDocument.methods || []).map((row) => row.method_id));
  for (const id of EXPECTED_METHODS) assert(methodIds.has(id), `Ukjent canonical metode ${id}`);

  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1', 'Matematikk-brief har feil schema');
  assert(brief.chapter_id === 'vitenskap-matematisk-bevis-struktur-og-modell', 'Matematikk-brief har feil chapter_id');
  assert(brief.primary_domain_id === 'metoder_maling_modeller', 'Matematikk-brief har feil primary domain');
  assert(brief.coverage_family_id === 'mathematics_formal_sciences', 'Matematikk-brief har feil coverage family');
  assert(sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Matematikk-brief har feil obligatoriske emner');
  assert(sameSet(brief.requiredMethodIds, EXPECTED_METHODS), 'Matematikk-brief har feil obligatoriske metoder');
  assert((brief.learningArc || []).length >= 8, 'Matematikk-brief har for kort learning arc');
  assert((brief.requiredCriticalDistinctions || []).length >= 14, 'Matematikk-brief mangler kritiske distinksjoner');
  assert((brief.documentedCasesOrScenarios || []).length >= 4, 'Matematikk-brief mangler dokumenterte case/scenarioer');
  assert((brief.localAnchors || []).some((row) => /Blindern|Universitetet i Oslo/.test(row.place || '')), 'Matematikk-brief mangler UiO/Blindern-anker');
  assert(brief.sourceStrategy?.minimumExternalSources >= 10, 'Matematikk-brief krever for få eksterne kilder');
  assert(brief.sourceStrategy?.claimLevelTrace === true, 'Matematikk-brief mangler claim-level trace');
  assert(brief.sourceStrategy?.sourceLocationsRequired === true, 'Matematikk-brief mangler source-locator-krav');
  assert(brief.sourceStrategy?.noDecorativeSources === true, 'Matematikk-brief må blokkere dekorative kilder');
  assert(brief.sourceStrategy?.primaryOrOfficialTechnicalSourcesPreferred === true, 'Matematikk-brief må prioritere primære/officiale tekniske kilder');
  assert(brief.qa?.formalVsEmpiricalBoundaryRequired === true, 'Matematikk-brief må låse formell/empirisk grense');
  assert(brief.qa?.mathematicsEditorialBlockerRemainsOpenUntilFulltextAndRegistration === true, 'Brief-kontrakten må kreve blocker fram til fulltekstregistrering');

  const rejected = (brief.rejectedOrDeferred || []).map((row) => `${row.detail || ''} ${row.reason || ''}`.toLowerCase());
  assert(rejected.some((text) => text.includes('bevis') && text.includes('empir')), 'Brief må avvise bevis = empirisk evidens');
  assert(rejected.some((text) => text.includes('theorem prover') && text.includes('fysisk modell')), 'Brief må avvise theorem prover = empirisk modellvalidering');
  assert(rejected.some((text) => text.includes('symmetri') && text.includes('visuell')), 'Brief må avvise rent visuelt symmetribegrep');

  assert(claimsDocument.schema === 'history_go_fagverk_claim_registry_v1', 'Matematikk-claims har feil schema');
  assert(claimsDocument.chapter_id === brief.chapter_id, 'Matematikk-claims peker til feil kapittel');
  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length === 10, `Forventet 10 kilder, fant ${sources.length}`);
  assert(claims.length === 18, `Forventet 18 claims, fant ${claims.length}`);
  assert(new Set(sources.map((row) => row.id)).size === sources.length, 'Matematikk-brief har dupliserte source-ID-er');
  assert(new Set(claims.map((row) => row.id)).size === claims.length, 'Matematikk-brief har dupliserte claim-ID-er');
  assert(sources.every((row) => /^https:\/\//.test(row.url || '') && row.publisher && row.source_location), 'Alle matematikk-kilder må ha HTTPS, publisher og source_location');

  const sourceIds = new Set(sources.map((row) => row.id));
  const sourceUse = new Map([...sourceIds].map((id) => [id, 0]));
  const sectionUse = new Map(PLANNED_SECTIONS.map((id) => [id, 0]));
  for (const claim of claims) {
    assert(claim.status === 'verified', `${claim.id} er ikke verified`);
    assert(typeof claim.claim === 'string' && claim.claim.trim().length >= 90 && /[.!?]$/.test(claim.claim.trim()), `${claim.id} må være en fullstendig substansiell claim`);
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
  assert([...sourceUse.values()].every((count) => count >= 1), 'Matematikk-brief har dekorativ kilde uten claim-bruk');
  assert([...sectionUse.values()].every((count) => count >= 2), 'En planlagt Unit 2-seksjon har for svakt claim-grunnlag');

  const formalEmpiricalClaims = claims.filter((row) => /empirisk|formell|proof|bevis/i.test(row.claim));
  assert(formalEmpiricalClaims.length >= 6, 'Claimregisteret har for svakt formell/empirisk skille');
  assert(claims.some((row) => row.id === 'vit2-15' && row.classification === 'cross-source-synthesis'), 'Mangler eksplisitt theorem-prover/empirical-boundary claim');

  return {
    schema: 'history_go_fagverk_vitenskap_mathematics_source_brief_audit_v1',
    version: '1.1.0',
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
      canonicalV46MathFamilyLocked: true,
      sourcesInspectableAndUsed: true,
      claimsVerifiedAndTracePlanned: true,
      formalEmpiricalBoundaryLocked: true,
      sourceBriefPhaseConsistentWithReadiness: true,
      prematureCompleteBlocked: true,
      technologyRemainsNested: true
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log(JSON.stringify(auditVitenskapMathematicsSourceBrief(), null, 2));
}
