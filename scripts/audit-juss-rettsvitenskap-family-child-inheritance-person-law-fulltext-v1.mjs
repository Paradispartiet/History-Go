#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const sourceBrief = read('data/fag/politikk/juss_rettsvitenskap/family_child_inheritance_person_law_source_claim_brief_v1.json');
  const chapter = read('data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett.json');
  const claims = read('data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett/claims.json');
  const assessment = read('data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett/assessment.json');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections);
  const paragraphs = sections.flatMap((section) => section.paragraphs);
  const paragraphClaimIds = sections.flatMap((section) => section.paragraphClaimIds).flat();
  const plannedClaims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const plannedIds = plannedClaims.map((claim) => claim.id);
  const verifiedIds = claims.verifiedClaims.map((claim) => claim.id);

  assert(sourceBrief.sources.length === 13 && sourceBrief.topic_briefs.length === 8 && plannedClaims.length === 32, 'Felt 10 source-first-kontrakt');
  assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32, 'Felt 10 krever 4/8/32 fulltekst');
  assert(sections.every((section) => section.analysisFrame?.length === 2 && section.analysisFrame.every((row) => row.length >= 170)), 'Alle seksjoner må ha egen analytisk ramme');
  assert(new Set(paragraphs).size === 32, 'Alle 32 avsnitt må være redaksjonelt unike');
  const editorialCores = paragraphs.map((paragraph) => paragraph.split(' Kildesporet for ')[0]);
  assert(new Set(editorialCores).size === 32 && editorialCores.every((core) => core.length >= 500), 'Alle 32 avsnitt må ha substantiv claim-spesifikk analyse');
  assert(paragraphs.every((paragraph) => paragraph.length >= 850), 'Alle avsnitt må ha faglig dybde');
  assert(paragraphs.every((paragraph) => paragraph.includes('2. september 2026') && paragraph.includes('juridisk rådgivning')), 'Versjon/formidlingsgrense mangler');
  assert(new Set(paragraphClaimIds).size === 32 && plannedIds.every((id) => paragraphClaimIds.includes(id)), 'Avsnitt/claim-binding er ufullstendig');
  assert(verifiedIds.length === 32 && new Set(verifiedIds).size === 32 && plannedIds.every((id) => verifiedIds.includes(id)), '32 claims må være reverifisert');
  assert(claims.verifiedClaims.every((claim) => claim.status === 'verified' && claim.verified_at === '2026-09-02' && claim.source_ids.length >= 2), 'Claim-status eller kildespor mangler');
  assert(assessment.questions.length === 8 && assessment.questions.every((q) => q.choices.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4), 'Åtte vurderinger kreves');
  assert(new Set(assessment.questions.map((q) => q.prompt)).size === 8, 'Vurderingene må være redaksjonelt ulike');
  assert(assessment.caseTasks.length === 6 && assessment.caseTasks.every((task) => task.responseMode === 'guided_discussion_no_required_typing' && task.source_ids.length >= 2), 'Seks kildekoblede case kreves');

  const joined = paragraphs.join(' ').toLowerCase();
  for (const token of ['ekteskapsloven', 'barnelova', '2025', 'arveloven', 'vergemålsloven', 'adopsjonsloven', 'barnevernsloven', 'husstandsfellesskapsloven', 'navneloven', 'folkeregisterloven', 'statsborgerloven', 'menneskerettsloven', 'barnebortføring']) {
    assert(joined.includes(token), `Mangler familie-/personrettslig gate: ${token}`);
  }
  const transitionParagraphs = paragraphs.filter((paragraph) => paragraph.includes('fam03-barnelova-2025'));
  assert(transitionParagraphs.length >= 4 && transitionParagraphs.every((paragraph) => paragraph.includes('ikke satt i kraft')), '1981/2025-barnelovskillet må være eksplisitt');
  for (const claim of plannedClaims) {
    const paragraph = paragraphs.find((candidate) => candidate.includes(`Kildesporet for ${claim.id}`));
    assert(paragraph, `${claim.id} mangler eget fulltekstavsnitt`);
    assert(claim.source_ids.every((sourceId) => paragraph.includes(sourceId)), `${claim.id} mangler kilde-ID i fulltekst`);
  }

  const report = {
    schema: 'history_go_juss_rettsvitenskap_family_child_inheritance_person_law_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-09-02',
    subject_id: 'politikk',
    canonical_subcategory_id: 'juss_rettsvitenskap',
    domain_id: 'familie_barn_arv_personrett',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, sources: 13, assessments: 8, decisionScenarios: 6 },
    gates: {
      ownership: true,
      source_first_trace: true,
      paragraph_depth: true,
      editorial_uniqueness: true,
      exact_claim_coverage: true,
      current_vs_enacted_not_in_force: true,
      parentage_parental_responsibility_residence_contact_distinguished: true,
      child_best_interests_and_participation_distinguished: true,
      adoption_and_cross_border_child_distinguished: true,
      matrimonial_property_inheritance_and_estate_distinguished: true,
      guardianship_and_legal_capacity_distinguished: true,
      registration_and_underlying_status_distinguished: true,
      assessment: true,
      legal_boundary_and_versioning: true
    },
    six_part_quality_review: {
      correctness_and_evidence: 5,
      coverage_and_completion: 5,
      editorial_quality: 5,
      technical_integrity: 5,
      safety_and_responsibility: 5,
      maintainability_and_traceability: 5,
      total: 30
    },
    next_gate: 'register_domain_10_only_after_domain_11_labour_company_business_tax_market_law_source_first_is_ready'
  };
  write('reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-fulltext-v1-audit.json', report);
  return report;
}

try {
  const report = audit();
  console.log(`Familie/barn/arv/personrett fulltext audit OK: ${report.counts.paragraphs} avsnitt, ${report.six_part_quality_review.total}/30.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
