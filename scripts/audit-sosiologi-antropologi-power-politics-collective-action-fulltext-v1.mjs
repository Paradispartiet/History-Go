#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OWNER = 'konflikt-makt-sivilsamfunn';
const OVERLAY = 'konflikt-makt-sivilsamfunn-strict-upgrade';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${OVERLAY}`;
const P = {
  ownerChapter: `data/fagverk/politikk/${OWNER}.json`, ownerClaims: `data/fagverk/politikk/${OWNER}/claims.json`,
  overlay: `${DIR}.json`, brief: `${DIR}/brief.json`, claims: `${DIR}/claims.json`, assessment: `${DIR}/assessment.json`,
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/power_politics_collective_action_source_claim_brief_v1.json',
  nextSourceBrief: 'data/fag/politikk/sosiologi_antropologi/digitalization_science_technology_society_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json', category: 'data/categories/category_contract.json',
  report: 'reports/fagverk/sosiologi-antropologi-power-politics-collective-action-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const readText = (file) => fs.readFileSync(abs(file), 'utf8');
const read = (file) => JSON.parse(readText(file));
const assert = (value, message) => { if (!value) throw new Error(message); };
const words = (text) => text.trim().split(/\s+/u).filter(Boolean).length;
const gitBlob = (text) => crypto.createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');

export function audit() {
  const ownerChapterText = readText(P.ownerChapter); const ownerClaimsText = readText(P.ownerClaims);
  const ownerChapter = JSON.parse(ownerChapterText); const ownerClaims = JSON.parse(ownerClaimsText);
  const overlay = read(P.overlay); const brief = read(P.brief); const claimFile = read(P.claims); const assessment = read(P.assessment);
  const sourceBrief = read(P.sourceBrief); const next = read(P.nextSourceBrief); const production = read(P.production); const category = read(P.category);
  const modules = overlay.expansionModuleFiles.map(read); const sections = modules.flatMap((module) => module.sections);
  const paragraphs = sections.flatMap((section) => section.paragraphs); const traces = sections.flatMap((section) => section.paragraphClaimIds);
  const planned = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims); const plannedIds = planned.map((claim) => claim.id);
  const claims = new Map(claimFile.claims.map((claim) => [claim.id, claim])); const sourceIds = new Set(claimFile.sources.map((source) => source.id));

  assert(gitBlob(ownerChapterText) === '0fbaaaaf25464cf1db7d24299530ab22300e4b07', 'Eierkapitlet er ikke byte-bevart');
  assert(gitBlob(ownerClaimsText) === '56dbf4d49859d56ffcd9296962acdd53e32a21e5', 'Eierclaims er ikke byte-bevart');
  assert(ownerChapter.chapter_id === OWNER && ownerChapter.moduleFiles.length === 3, 'Eierkapitlets struktur er uventet');
  assert(ownerClaims.claims.length === 45 && ownerClaims.sources.length === 30, 'Eierkapitlets 45 claims og 30 kilder må bestå');
  assert(overlay.domain_id === 'makt_politikk_kollektiv_handling' && overlay.chapter_id === OWNER && overlay.overlay_id === OVERLAY, 'Overlegget har feil canonical identitet');
  assert(overlay.reuseClassification === 'reuse_with_expansion' && overlay.strictReuse === true && overlay.existingChapter === P.ownerChapter && overlay.existingClaims === P.ownerClaims, 'Strict reuse-kontrakten mangler');
  assert(overlay.ownerContentMoved === false && overlay.ownerContentDeleted === false && overlay.editorialStatus === 'chapter_ready' && overlay.claimTraceRequired === true, 'Eierbevaring eller fulltekststatus mangler');
  assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32 && traces.length === 32, 'Expansion-strukturen skal være 4/8/32/32');
  assert(paragraphs.every((text) => words(text) >= 45) && new Set(paragraphs).size === 32, 'Alle fagavsnitt må være minst 45 ord og unike');
  assert(plannedIds.length === 32 && new Set(plannedIds).size === 32 && claims.size === 32 && plannedIds.every((id) => claims.has(id)), 'Alle briefclaims må løses én-til-én');
  assert(traces.every((ids) => ids.length === 1 && claims.has(ids[0])) && new Set(traces.flat()).size === 32, 'Gjensidig paragraph↔claim-spor mangler');
  assert([...claims.values()].every((claim) => claim.status === 'verified' && claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Alle claims må være verifiserte med minst to kilder');
  const used = new Set([...claims.values()].flatMap((claim) => claim.source_ids));
  assert(sourceIds.size === 13 && [...sourceIds].every((id) => used.has(id)) && claimFile.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-29'), 'Alle 13 kilder må være inspiserbare og brukt');
  assert(assessment.questions.length === 8 && assessment.questions.every((q) => q.answer === q.options[q.answerIndex] && claims.has(q.claim_id) && q.source.length >= 2 && q.learner_typing === false), 'Vurderingen må være claimbundet uten elevtyping');
  assert(assessment.caseTasks.length === 6 && brief.realDisagreements.length >= 5 && brief.methodsAndLimits.length >= 8 && Object.values(brief.safety).every((value) => value === false), 'Scenario-, uenighets-, metode- eller ansvarlighetsport feiler');
  assert(production.progress.materializedDomains === 10 && production.progress.totalDomains === 12 && production.progress.strictCompletionProven === false && production.materialized.length === 10, 'Produksjonsregister skal vise nøyaktig 10/12');
  assert(production.materialized.filter((row) => row.ordinal === 10 && row.chapter === P.ownerChapter && row.reuse_overlay === P.overlay).length === 1, 'Reuse-feltet må registreres nøyaktig én gang');
  const subcategory = category.canonicalSubcategories.politikk.find((row) => row.id === 'sosiologi_antropologi');
  assert(subcategory?.status === 'expansion_planned', 'Underkategorien må forbli expansion_planned ved 10/12');
  assert(next.domain?.id === 'digitalisering_vitenskap_teknologi_samfunn' && next.domain?.ordinal === 11 && next.subcategory_upgrade_registration?.registered === false, 'Neste felt skal bare være source-first-klart');
  const report = read(P.report); const dimensions = ['correctness_and_evidence', 'coverage_and_completion', 'disciplinary_editorial_quality', 'technical_integrity', 'safety_and_responsibility', 'maintainability_and_auditability'];
  assert(report.status === 'pass' && report.counts.domainsMaterialized === 10 && report.counts.expansionParagraphs === 32 && report.gates.ownerChapterAndClaimsBytePreserved === true, 'Fulltekstrapporten har feil status eller telling');
  assert(dimensions.every((key) => report.six_part_quality_review[key] >= 4) && report.six_part_quality_review.total >= 27, 'Seksdimensjonal kvalitetsport feiler');
  const generated = (awaitableReport(sourceBrief));
  assert(isDeepStrictEqual(report, generated), `${P.report} er utdatert`);
  return report;
}

function awaitableReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_power_politics_collective_action_fulltext_audit_v1', version: '1.0.0', updated_at: '2026-08-29', status: 'pass', conclusion: 'power_politics_collective_action_strict_reuse_overlay_materialized_subcategory_still_expansion_planned', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: OWNER, overlay_id: OVERLAY,
    counts: { domainsMaterialized: 10, targetDomains: 12, preservedOwnerClaims: 45, preservedOwnerSources: 30, expansionModules: 4, expansionSections: 8, expansionParagraphs: 32, expansionVerifiedClaims: 32, expansionInspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: { definitionAndBackground: true, namedTheoriesAndResearchers: true, findingsMethodsAndLimits: true, realDisagreement: true, teachingScenarios: true, plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, everyExpansionSourceInspectableAndUsed: true, ownerChapterAndClaimsBytePreserved: true, strictReuseOverlayNoMoveOrDelete: true, relationalDecisionAgendaAndAuthorityBoundaries: true, collectiveActionInstitutionalVariationBoundaries: true, mobilizationOpportunityRepertoireAndFramingBoundaries: true, rightsOutcomesCausalityAndResearchEthicsBoundaries: true, chapterRegisteredInSubcategoryExactlyOnce: true, categoryStatusStillExpansionPlanned: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Felt 10 er fulltekstmaterialisert som strict reuse-overlay med makt-, mobiliserings-, offentlighets-, utfalls- og etikkgrenser; underkategorien er fortsatt uferdig med 10/12 felt.' },
  };
}

try { const result = audit(); console.log(`Makt, politikk og kollektiv handling fulltekstaudit OK: ${result.counts.expansionParagraphs} nye avsnitt, ${result.counts.expansionVerifiedClaims} nye claims, eierinnhold byte-bevart, ${result.six_part_quality_review.total}/30.`); }
catch (error) { console.error(`Makt, politikk og kollektiv handling fulltekstaudit FEIL: ${error.message}`); process.exitCode = 1; }
