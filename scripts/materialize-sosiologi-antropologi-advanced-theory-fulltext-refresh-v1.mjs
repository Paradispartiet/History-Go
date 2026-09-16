#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  canon: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json',
  contract: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json',
  evidence: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json',
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
const evidenceKey = (workId, unitId) => `${workId}:${unitId}`;

export function evaluateSourceEvidence(canon, evidence) {
  const canonicalRows = (canon?.works ?? []).flatMap((work) =>
    (work.theory_units ?? []).map((unit) => ({ work_id: work.id, theory_unit_id: unit.id }))
  );
  const canonicalKeys = canonicalRows.map((row) => evidenceKey(row.work_id, row.theory_unit_id));
  const rows = Array.isArray(evidence?.evidence_units) ? evidence.evidence_units : [];
  const rowKeys = rows.map((row) => evidenceKey(row.work_id, row.theory_unit_id));

  if (canonicalKeys.length !== 60) throw new Error(`Advanced theory canon must contain 60 theory units, got ${canonicalKeys.length}`);
  if (rows.length !== canonicalKeys.length) throw new Error(`Advanced theory source evidence must cover all ${canonicalKeys.length} theory units`);
  if (!uniq(rowKeys)) throw new Error('Duplicate advanced theory source evidence row');
  if ([...rowKeys].sort().join('\n') !== [...canonicalKeys].sort().join('\n')) {
    throw new Error('Advanced theory source evidence does not match canonical theory-unit set');
  }
  if (!rows.every((row) => ['mapping_supported', 'fulltext_verified'].includes(row.verification_status))) {
    throw new Error('Unsupported advanced theory source verification status');
  }
  if (!rows.every((row) => row.locator && row.evidence_url?.startsWith('https://') && row.evidence_kind)) {
    throw new Error('Advanced theory source evidence requires locator, https URL and evidence kind');
  }

  const fulltext = rows.filter((row) => row.verification_status === 'fulltext_verified');
  if (!fulltext.every((row) => row.evidence_kind.includes('full') || row.evidence_kind.includes('inspectable_text'))) {
    throw new Error('Fulltext-verified advanced theory evidence must identify inspectable full text');
  }

  const runtimeReleasable = fulltext.length === canonicalKeys.length ? canonicalKeys.length : 0;
  const counts = {
    mapping_supported: rows.length,
    fulltext_verified: fulltext.length,
    runtime_releasable: runtimeReleasable,
  };
  const expectedStatus = fulltext.length === canonicalKeys.length ? 'source_verification_complete' : 'source_verification_in_progress';
  if (evidence?.status !== expectedStatus) throw new Error(`Advanced theory source evidence status mismatch: ${evidence?.status}`);
  if (evidence?.counts?.mapping_supported !== counts.mapping_supported ||
      evidence?.counts?.fulltext_verified !== counts.fulltext_verified ||
      evidence?.counts?.runtime_releasable !== counts.runtime_releasable) {
    throw new Error('Advanced theory source evidence counts are not derived from evidence rows');
  }

  return {
    counts,
    runtime_release_gate_open: runtimeReleasable === canonicalKeys.length,
    rowsByUnitKey: new Map(rows.map((row) => [evidenceKey(row.work_id, row.theory_unit_id), row])),
  };
}

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
    source_evidence: P.evidence,
    works: domainWorks,
    counts: {
      works: domainWorks.length,
      theory_units: domainWorks.reduce((sum, work) => sum + work.theory_units.length, 0),
    },
  }));
}

export function buildDomainPackages(overlays, production, evidenceGate = null) {
  const runtimeReleased = evidenceGate?.runtime_release_gate_open === true;
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
      runtimeReady: runtimeReleased,
      sections: overlay.works.map((work) => ({
        id: work.id,
        title: `${work.author}: ${work.title}`,
        method_ids: [],
        boundary: runtimeReleased
          ? 'Teorien er materialisert for læring og analyse, og runtime-claimet er frigitt etter dokumentert 60/60 fulltekstverifisering.'
          : 'Teorien er materialisert for læring og analyse, men runtime-claimet forblir sperret til fulltekstverifisering er dokumentert.',
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
      retrieval_status: runtimeReleased ? 'canonical_source_fulltext_verified' : 'canonical_source_registered_fulltext_verification_pending',
    }));
    const claims = {
      schema: 'history_go_fagverk_claims_v1',
      version: '1.0.0',
      subject_id: overlay.subject_id,
      canonical_subcategory_id: overlay.canonical_subcategory_id,
      chapter_id: target.chapter_id,
      status: runtimeReleased ? 'runtime_released' : 'fulltext_verification_pending',
      sources,
      claims: overlay.works.flatMap((work) => work.theory_units.map((unit) => {
        const evidence = evidenceGate?.rowsByUnitKey.get(evidenceKey(work.id, unit.id)) ?? null;
        if (evidenceGate && !evidence) throw new Error(`Missing source evidence for ${work.id}:${unit.id}`);
        return {
          id: claimId(unit.id),
          claim: `${unit.name}: ${unit.summary}`,
          source_ids: [work.id],
          classification: runtimeReleased ? 'canonical_theory_summary_fulltext_verified' : 'canonical_theory_summary_pending_fulltext_verification',
          status: runtimeReleased ? 'verified_runtime_released' : 'planned_requires_fulltext_verification',
          source_evidence: evidence ? {
            verification_status: evidence.verification_status,
            locator: evidence.locator,
            evidence_url: evidence.evidence_url,
            evidence_kind: evidence.evidence_kind,
          } : null,
        };
      })),
    };
    const assessment = {
      schema: 'history_go_fagverk_assessment_v1',
      version: '1.0.0',
      subject_id: overlay.subject_id,
      canonical_subcategory_id: overlay.canonical_subcategory_id,
      chapter_id: target.chapter_id,
      status: runtimeReleased ? 'runtime_ready' : 'claim_verification_pending',
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
  const evidence = read(P.evidence);
  const production = read(P.production);
  const evidenceGate = evaluateSourceEvidence(canon, evidence);
  const runtimeReleased = evidenceGate.runtime_release_gate_open;
  const overlays = buildOverlays(canon, contract);
  const packages = buildDomainPackages(overlays, production, evidenceGate);
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
    throw new Error(`Advanced theory phase 4 trace mismatch: ${paragraphCount} paragraphs / ${claimCount} claims / ${assessmentCount} assessments`);
  }

  for (const overlay of overlays) {
    const pkg = packageByDomain.get(overlay.domain_id);
    const materializedOverlay = {
      ...overlay,
      status: runtimeReleased ? 'advanced_theory_phase4_runtime_released' : 'advanced_theory_phase3_materialized_runtime_pending',
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
    version: '1.2.0',
    updated_at: '2026-09-16',
    status: runtimeReleased ? 'pass_phase4_runtime_released' : 'pass_phase3_runtime_pending',
    subject_id: contract.subject_id,
    canonical_subcategory_id: contract.canonical_subcategory_id,
    runtime_ready: runtimeReleased,
    next_gate: runtimeReleased ? null : 'fulltext_source_verification_and_phase4_runtime_release',
    source_evidence: {
      file: P.evidence,
      status: evidence.status,
      mapping_supported: evidenceGate.counts.mapping_supported,
      fulltext_verified: evidenceGate.counts.fulltext_verified,
      runtime_releasable: evidenceGate.counts.runtime_releasable,
      runtime_release_gate_open: evidenceGate.runtime_release_gate_open,
    },
    counts: {
      domains: overlays.length,
      works: workCount,
      theory_units: theoryCount,
      sections: workCount,
      paragraphs: paragraphCount,
      claims: claimCount,
      assessment_items: assessmentCount,
      source_evidence_rows: evidenceGate.counts.mapping_supported,
      fulltext_verified_units: evidenceGate.counts.fulltext_verified,
      runtime_releasable_units: evidenceGate.counts.runtime_releasable,
    },
    gates: {
      existing_domains_only: contract.policy?.existing_domains_only === true,
      strict_completion_preserved: contract.policy?.preserve_strict_completion === true,
      generator_owned_fulltext: contract.policy?.generator_owned_fulltext_only === true,
      every_work_has_traceable_source: overlays.every((overlay) => overlay.works.every((work) => typeof work.source_url === 'string' && work.source_url.startsWith('https://'))),
      every_theory_has_explanation_question_and_guardrail: overlays.every((overlay) => overlay.works.every((work) => work.theory_units.every((unit) => unit.summary && unit.analytic_question && unit.misuse_guardrail))),
      every_primary_domain_has_materialized_owner: packages.every((pkg) => typeof pkg.target.chapter === 'string' && pkg.target.chapter.endsWith('.json')),
      phase4_paragraph_claim_trace_complete: paragraphCount === theoryCount && claimCount === theoryCount && uniq(allClaims.map((claim) => claim.id)),
      phase4_assessment_trace_complete: assessmentCount === theoryCount && allQuestions.every((question) => allClaims.some((claim) => claim.id === question.claim_id)),
      source_evidence_census_complete: evidenceGate.counts.mapping_supported === theoryCount,
      source_evidence_claim_trace_complete: allClaims.every((claim) => claim.source_evidence?.locator && claim.source_evidence?.evidence_url?.startsWith('https://')),
      runtime_release_gate_respects_60_of_60: runtimeReleased
        ? evidenceGate.counts.fulltext_verified === theoryCount && evidenceGate.counts.runtime_releasable === theoryCount
        : evidenceGate.counts.fulltext_verified < theoryCount && evidenceGate.counts.runtime_releasable === 0,
      runtime_claim_status_matches_release_gate: runtimeReleased
        ? allClaims.every((claim) => claim.status === 'verified_runtime_released')
        : allClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification'),
    },
  };
  if (overlays.length !== 7 || !Object.values(report.gates).every(Boolean)) throw new Error('Advanced theory phase 4 audit failed');
  write(P.report, report);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = materialize();
  console.log(`Advanced theory phase 4: ${report.counts.domains} domains, ${report.counts.works} works, ${report.counts.theory_units} theory units, fulltext=${report.counts.fulltext_verified_units}/${report.counts.theory_units}, runtime=${report.runtime_ready}.`);
}
