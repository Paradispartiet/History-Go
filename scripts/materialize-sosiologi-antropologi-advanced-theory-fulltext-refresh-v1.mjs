#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  canon: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json',
  contract: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  outputRoot: 'data/fagverk/politikk/sosiologi_antropologi/advanced_theory',
  report: 'reports/fagverk/sosiologi-antropologi-advanced-theory-fulltext-refresh-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};

const uniq = (xs) => new Set(xs).size === xs.length;
const chapterIdFromPath = (file) => path.basename(file, '.json');
const claimId = (unitId) => `advclaim-${unitId}`;
const questionId = (unitId) => `advq-${unitId}`;

export function buildOverlays(canon, contract) {
  const works = Array.isArray(canon?.works) ? canon.works : [];
  const rows = Array.isArray(contract?.work_refreshes) ? contract.work_refreshes : [];
  const workById = new Map(works.map((work) => [work.id, work]));
  if (rows.length === 0) throw new Error('Advanced theory refresh contract has no work mappings');
  if (!uniq(rows.map((row) => row.work_id))) throw new Error('Duplicate advanced theory work mapping');

  const groups = new Map();
  for (const row of rows) {
    const work = workById.get(row.work_id);
    if (!work) throw new Error(`Unknown advanced theory work: ${row.work_id}`);
    const units = Array.isArray(work.theory_units) ? work.theory_units : [];
    const unitById = new Map(units.map((unit) => [unit.id, unit]));
    const mappedIds = row.theory_unit_ids ?? [];
    if (mappedIds.length !== units.length || !mappedIds.every((id) => unitById.has(id)) || !uniq(mappedIds)) {
      throw new Error(`Theory-unit mapping mismatch for ${row.work_id}`);
    }
    if (typeof row.primary_domain_id !== 'string' || !row.primary_domain_id) {
      throw new Error(`Missing primary domain for ${row.work_id}`);
    }
    if (!groups.has(row.primary_domain_id)) groups.set(row.primary_domain_id, []);
    groups.get(row.primary_domain_id).push({
      id: work.id,
      author: work.author,
      title: work.title,
      first_published: work.first_published,
      source_url: work.source_url,
      source_type: work.source_type,
      existing_coverage: work.existing_coverage,
      theory_units: mappedIds.map((id) => {
        const unit = unitById.get(id);
        return {
          id: unit.id,
          name: unit.name,
          summary: unit.summary,
          analytic_question: unit.analytic_question,
          misuse_guardrail: unit.misuse_guardrail,
        };
      }),
    });
  }

  return [...groups.entries()].map(([domain_id, domainWorks]) => ({
    schema: 'history_go_sosiologi_antropologi_advanced_theory_domain_overlay_v1',
    version: '1.0.0',
    subject_id: contract.subject_id,
    canonical_subcategory_id: contract.canonical_subcategory_id,
    domain_id,
    status: 'advanced_theory_mapping_ready_fulltext_verification_pending',
    source_canon: contract.canon_file,
    refresh_contract: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json',
    works: domainWorks,
    counts: {
      works: domainWorks.length,
      theory_units: domainWorks.reduce((sum, work) => sum + work.theory_units.length, 0),
    },
  }));
}

export function buildDomainPackages(overlays, production) {
  const materializedByDomain = new Map((production?.materialized ?? []).map((row) => [row.domain_id, row]));
  return overlays.map((overlay) => {
    const owner = materializedByDomain.get(overlay.domain_id);
    if (!owner || typeof owner.chapter !== 'string') throw new Error(`Missing materialized owner for ${overlay.domain_id}`);
    const base = `${P.outputRoot}/${overlay.domain_id}`;
    const target = {
      chapter: owner.chapter,
      reuse_overlay: owner.reuse_overlay ?? null,
      chapter_id: chapterIdFromPath(owner.chapter),
    };
    const module = {
      schema: 'history_go_fagverk_module_v1',
      version: '1.0.0',
      subject_id: overlay.subject_id,
      canonical_subcategory_id: overlay.canonical_subcategory_id,
      chapter_id: target.chapter_id,
      id: `advanced-theory-${overlay.domain_id}`,
      title: `Avansert teori — ${overlay.domain_id.replaceAll('_', ' ')}`,
      maintenanceOverlay: true,
      runtimeReady: false,
      sections: overlay.works.map((work) => ({
        id: work.id,
        title: `${work.author}: ${work.title}`,
        method_ids: [],
        boundary: 'Teorien er materialisert for læring og analyse, men runtime-claimet forblir sperret til fulltekstverifisering er dokumentert.',
        paragraphs: work.theory_units.map((unit) => `${unit.name} behandles her som en analyseenhet fra ${work.author}, ${work.title}. ${unit.summary} Analyseinngang: ${unit.analytic_question} Avgrensning: ${unit.misuse_guardrail}`),
        paragraphClaimIds: work.theory_units.map((unit) => [claimId(unit.id)]),
      })),
    };
    const sources = overlay.works.map((work) => ({
      id: work.id,
      author: work.author,
      title: work.title,
      first_published: work.first_published,
      url: work.source_url,
      type: work.source_type,
      retrieval_status: 'canonical_source_registered_fulltext_verification_pending',
    }));
    const claims = {
      schema: 'history_go_fagverk_claims_v1',
      version: '1.0.0',
      subject_id: overlay.subject_id,
      canonical_subcategory_id: overlay.canonical_subcategory_id,
      chapter_id: target.chapter_id,
      status: 'fulltext_verification_pending',
      sources,
      claims: overlay.works.flatMap((work) => work.theory_units.map((unit) => ({
        id: claimId(unit.id),
        claim: `${unit.name}: ${unit.summary}`,
        source_ids: [work.id],
        classification: 'canonical_theory_summary_pending_fulltext_verification',
        status: 'planned_requires_fulltext_verification',
      }))),
    };
    const assessment = {
      schema: 'history_go_fagverk_assessment_v1',
      version: '1.0.0',
      subject_id: overlay.subject_id,
      canonical_subcategory_id: overlay.canonical_subcategory_id,
      chapter_id: target.chapter_id,
      status: 'claim_verification_pending',
      questions: overlay.works.flatMap((work) => work.theory_units.map((unit) => ({
        id: questionId(unit.id),
        type: 'multiple_choice',
        question: `Hvilket analysespørsmål er mest i tråd med «${unit.name}»?`,
        options: [
          unit.analytic_question,
          'Hvilken personlighetstype har aktøren?',
          'Hvilken teori gjelder alltid uavhengig av kontekst?',
        ],
        answerIndex: 0,
        answer: unit.analytic_question,
        claim_id: claimId(unit.id),
        source: [work.id],
        guardrail: unit.misuse_guardrail,
        learner_typing: false,
      }))),
      caseTasks: [],
    };
    return {
      domain_id: overlay.domain_id,
      target,
      paths: {
        module: `${base}/module.json`,
        claims: `${base}/claims.json`,
        assessment: `${base}/assessment.json`,
      },
      module,
      claims,
      assessment,
    };
  });
}

export function materialize() {
  const canon = read(P.canon);
  const contract = read(P.contract);
  const production = read(P.production);
  const overlays = buildOverlays(canon, contract);
  const packages = buildDomainPackages(overlays, production);
  const packageByDomain = new Map(packages.map((pkg) => [pkg.domain_id, pkg]));
  const workCount = overlays.reduce((sum, overlay) => sum + overlay.counts.works, 0);
  const theoryCount = overlays.reduce((sum, overlay) => sum + overlay.counts.theory_units, 0);
  const paragraphCount = packages.reduce((sum, pkg) => sum + pkg.module.sections.reduce((n, section) => n + section.paragraphs.length, 0), 0);
  const claimCount = packages.reduce((sum, pkg) => sum + pkg.claims.claims.length, 0);
  const assessmentCount = packages.reduce((sum, pkg) => sum + pkg.assessment.questions.length, 0);
  if (workCount !== contract.expected_work_count || theoryCount !== contract.expected_theory_unit_count) {
    throw new Error(`Advanced theory count mismatch: ${workCount} works / ${theoryCount} theory units`);
  }
  if (paragraphCount !== theoryCount || claimCount !== theoryCount || assessmentCount !== theoryCount) {
    throw new Error(`Advanced theory phase 3 trace mismatch: ${paragraphCount} paragraphs / ${claimCount} claims / ${assessmentCount} assessments`);
  }

  for (const overlay of overlays) {
    const pkg = packageByDomain.get(overlay.domain_id);
    const materializedOverlay = {
      ...overlay,
      status: 'advanced_theory_phase3_materialized_runtime_pending',
      target: pkg.target,
      moduleFile: pkg.paths.module,
      claimsFile: pkg.paths.claims,
      assessmentFile: pkg.paths.assessment,
    };
    write(`${P.outputRoot}/${overlay.domain_id}.json`, materializedOverlay);
    write(pkg.paths.module, pkg.module);
    write(pkg.paths.claims, pkg.claims);
    write(pkg.paths.assessment, pkg.assessment);
  }

  const allClaims = packages.flatMap((pkg) => pkg.claims.claims);
  const allQuestions = packages.flatMap((pkg) => pkg.assessment.questions);
  const report = {
    schema: 'history_go_sosiologi_antropologi_advanced_theory_fulltext_refresh_audit_v1',
    version: '1.0.0',
    updated_at: '2026-09-15',
    status: 'pass_phase3_runtime_pending',
    subject_id: contract.subject_id,
    canonical_subcategory_id: contract.canonical_subcategory_id,
    runtime_ready: false,
    next_gate: 'fulltext_source_verification_and_phase4_runtime_release',
    counts: {
      domains: overlays.length,
      works: workCount,
      theory_units: theoryCount,
      sections: workCount,
      paragraphs: paragraphCount,
      claims: claimCount,
      assessment_items: assessmentCount,
    },
    gates: {
      existing_domains_only: contract.policy?.existing_domains_only === true,
      strict_completion_preserved: contract.policy?.preserve_strict_completion === true,
      generator_owned_fulltext: contract.policy?.generator_owned_fulltext_only === true,
      every_work_has_traceable_source: overlays.every((overlay) => overlay.works.every((work) => typeof work.source_url === 'string' && work.source_url.startsWith('https://'))),
      every_theory_has_explanation_question_and_guardrail: overlays.every((overlay) => overlay.works.every((work) => work.theory_units.every((unit) => unit.summary && unit.analytic_question && unit.misuse_guardrail))),
      every_primary_domain_has_materialized_owner: packages.every((pkg) => typeof pkg.target.chapter === 'string' && pkg.target.chapter.endsWith('.json')),
      phase3_paragraph_claim_trace_complete: paragraphCount === theoryCount && claimCount === theoryCount && uniq(allClaims.map((claim) => claim.id)),
      phase3_assessment_trace_complete: assessmentCount === theoryCount && allQuestions.every((question) => allClaims.some((claim) => claim.id === question.claim_id)),
      runtime_claims_remain_pending: allClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification'),
    },
  };
  if (overlays.length !== 7 || !Object.values(report.gates).every(Boolean)) throw new Error('Advanced theory phase 3 audit failed');
  write(P.report, report);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = materialize();
  console.log(`Advanced theory phase 3: ${report.counts.domains} domains, ${report.counts.works} works, ${report.counts.theory_units} theory units, runtime=${report.runtime_ready}.`);
}
