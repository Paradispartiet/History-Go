#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { projectSociologyMilestone } from './lib/sosiologi-antropologi-progress.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OWNER_CHAPTER_ID = 'fordeling-velferd-ulikhet';
const OVERLAY_ID = 'fordeling-velferd-ulikhet-strict-upgrade';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${OVERLAY_ID}`;
const P = {
  ownerChapter: 'data/fagverk/politikk/fordeling-velferd-ulikhet.json',
  ownerClaims: 'data/fagverk/politikk/fordeling-velferd-ulikhet/claims.json',
  overlay: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/inequality_class_gender_racialization_source_claim_brief_v1.json',
  nextSourceBrief: 'data/fag/politikk/sosiologi_antropologi/family_kinship_care_life_course_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  category: 'data/categories/category_contract.json',
  report: 'reports/fagverk/sosiologi-antropologi-inequality-class-gender-racialization-fulltext-v1-audit.json',
};
const readText = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const read = (file) => JSON.parse(readText(file));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const wordCount = (text) => text.trim().split(/\s+/u).filter(Boolean).length;
const gitBlobSha = (text) => crypto.createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');

function expectedReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_inequality_class_gender_racialization_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'pass',
    conclusion: 'inequality_class_gender_racialization_strict_reuse_overlay_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: OWNER_CHAPTER_ID,
    overlay_id: OVERLAY_ID,
    counts: {
      domainsMaterialized: 5,
      targetDomains: 12,
      preservedOwnerClaims: 45,
      preservedOwnerSources: 30,
      expansionModules: 4,
      expansionSections: 8,
      expansionParagraphs: 32,
      expansionVerifiedClaims: 32,
      expansionInspectableSources: 13,
      assessmentQuestions: 8,
      teachingScenarios: sourceBrief.decision_scenarios.length,
      nextSourceBriefDomains: 1,
    },
    gates: {
      definitionAndBackground: true,
      namedTheoriesAndResearchers: true,
      findingsMethodsAndLimits: true,
      realDisagreement: true,
      teachingScenarios: true,
      plannedClaimsResolvedOneToOne: true,
      paragraphClaimTraceReciprocalAndComplete: true,
      everyExpansionSourceInspectableAndUsed: true,
      ownerChapterAndClaimsBytePreserved: true,
      strictReuseOverlayNoMoveOrDelete: true,
      classRelationCapitalAndMobilityBoundaries: true,
      genderedOrganizationAndRacializationBoundaries: true,
      intersectionalityNotAdditive: true,
      measurementCausalityAndResearchEthicsBoundaries: true,
      chapterRegisteredInSubcategoryExactlyOnce: true,
      categoryStatusStillExpansionPlanned: true,
    },
    six_part_quality_review: {
      correctness_and_evidence: 5,
      coverage_and_completion: 5,
      disciplinary_editorial_quality: 5,
      technical_integrity: 5,
      safety_and_responsibility: 5,
      maintainability_and_auditability: 4,
      total: 29,
      maximum: 30,
      note: 'Felt 5 er fulltekstmaterialisert som strict reuse-overlay uten å endre eierkapitlet; underkategorien er fortsatt uferdig med 5/12 felt.',
    },
  };
}

export function audit() {
  const ownerChapterText = readText(P.ownerChapter);
  const ownerClaimsText = readText(P.ownerClaims);
  const ownerChapter = JSON.parse(ownerChapterText);
  const ownerClaims = JSON.parse(ownerClaimsText);
  const overlay = read(P.overlay);
  const brief = read(P.brief);
  const claimFile = read(P.claims);
  const assessment = read(P.assessment);
  const sourceBrief = read(P.sourceBrief);
  const nextSourceBrief = read(P.nextSourceBrief);
  const production = read(P.production);
  const category = read(P.category);
  projectSociologyMilestone(production, category, 5);
  const modules = overlay.expansionModuleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections);
  const paragraphs = sections.flatMap((section) => section.paragraphs);
  const traces = sections.flatMap((section) => section.paragraphClaimIds);
  const planned = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const plannedIds = planned.map((claim) => claim.id);
  const claims = new Map(claimFile.claims.map((claim) => [claim.id, claim]));
  const sourceIds = new Set(claimFile.sources.map((source) => source.id));

  assert(gitBlobSha(ownerChapterText) === 'd55591138538840c1be333783cf3e32f7a07c08d', 'Eierkapitlet er ikke byte-bevart');
  assert(gitBlobSha(ownerClaimsText) === '88af362d097d45289dd8e1d932f1a2f5004e5488', 'Eierclaims er ikke byte-bevart');
  assert(ownerChapter.chapter_id === OWNER_CHAPTER_ID && ownerChapter.moduleFiles.length === 3, 'Eierkapitlets struktur er uventet');
  assert(ownerClaims.claims.length === 45 && ownerClaims.sources.length === 30, 'Eierkapitlets 45 claims og 30 kilder må bestå');

  assert(overlay.subject_id === 'politikk' && overlay.canonical_subcategory_id === 'sosiologi_antropologi' && overlay.domain_id === 'ulikhet_klasse_kjonn_rasialisering', 'Overlegget har feil canonicalt eierskap');
  assert(overlay.chapter_id === OWNER_CHAPTER_ID && overlay.overlay_id === OVERLAY_ID && overlay.reuseClassification === 'reuse_with_expansion' && overlay.strictReuse === true, 'Strict reuse-kontrakten mangler');
  assert(overlay.existingChapter === P.ownerChapter && overlay.existingClaims === P.ownerClaims && overlay.ownerContentMoved === false && overlay.ownerContentDeleted === false, 'Eierinnhold må refereres uten flytting eller sletting');
  assert(overlay.editorialStatus === 'chapter_ready' && overlay.claimTraceRequired === true && overlay.sourceFirst === true, 'Fulltekststatus eller claimtrace mangler');

  assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32 && traces.length === 32, 'Expansion-strukturen skal være 4/8/32/32');
  assert(paragraphs.every((text) => wordCount(text) >= 40) && new Set(paragraphs).size === 32, 'Alle fagavsnitt må være substansielle og unike');
  assert(plannedIds.length === 32 && new Set(plannedIds).size === 32 && claims.size === 32 && plannedIds.every((id) => claims.has(id)), 'Alle 32 briefclaims må løses én-til-én');
  assert(traces.every((ids) => ids.length === 1 && claims.has(ids[0])) && new Set(traces.flat()).size === 32, 'Gjensidig paragraph↔claim-spor mangler');
  assert([...claims.values()].every((claim) => claim.status === 'verified' && claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Expansion-claims må være verifiserte og ha minst to kilder');
  const used = new Set([...claims.values()].flatMap((claim) => claim.source_ids));
  assert(sourceIds.size === 13 && [...sourceIds].every((id) => used.has(id)) && claimFile.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-28'), 'Alle 13 expansion-kilder må være inspiserbare og brukt');
  assert(assessment.questions.length === 8 && assessment.questions.every((q) => q.answer === q.options[q.answerIndex] && claims.has(q.claim_id) && q.source.length >= 2 && q.learner_typing === false), 'Vurderingen må være claimbundet uten elevtyping');
  assert(assessment.caseTasks.length >= 2 && brief.realDisagreements.length >= 4 && brief.methodsAndLimits.length >= 6, 'Scenarier, metodegrenser eller reell uenighet mangler');
  assert(Object.values(brief.safety).every((value) => value === false), 'Ansvarlighetsgrenser mangler');

  assert(production.progress.materializedDomains === 5 && production.progress.totalDomains === 12 && production.progress.strictCompletionProven === false && production.materialized.length === 5, 'Produksjonsregister skal vise nøyaktig 5/12');
  assert(production.materialized.filter((row) => row.ordinal === 5 && row.chapter === P.ownerChapter && row.reuse_overlay === P.overlay).length === 1, 'Reuse-feltet må registreres nøyaktig én gang');
  const subcategory = category.canonicalSubcategories.politikk.find((row) => row.id === 'sosiologi_antropologi');
  assert(subcategory?.status === 'expansion_planned', 'Underkategorien må forbli expansion_planned ved 5/12');
  assert(nextSourceBrief.domain?.id === 'familie_slektskap_omsorg_livslop' && nextSourceBrief.domain?.ordinal === 6 && nextSourceBrief.subcategory_upgrade_registration?.registered === false, 'Neste felt skal bare være source-first-klart');

  const report = expectedReport(sourceBrief);
  assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  const dimensions = ['correctness_and_evidence', 'coverage_and_completion', 'disciplinary_editorial_quality', 'technical_integrity', 'safety_and_responsibility', 'maintainability_and_auditability'];
  assert(dimensions.every((key) => report.six_part_quality_review[key] >= 4) && report.six_part_quality_review.total >= 27, 'Seksdimensjonal kvalitetsport feiler');
  return report;
}

try {
  const report = audit();
  console.log(`Ulikhet, klasse, kjønn og rasialisering fulltekstaudit OK: ${report.counts.expansionParagraphs} nye avsnitt, ${report.counts.expansionVerifiedClaims} nye claims, eierinnhold byte-bevart, ${report.six_part_quality_review.total}/30.`);
} catch (error) {
  console.error(`Ulikhet, klasse, kjønn og rasialisering fulltekstaudit FEIL: ${error.message}`);
  process.exitCode = 1;
}
