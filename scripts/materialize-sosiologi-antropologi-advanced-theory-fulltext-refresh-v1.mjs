#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  canon: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json',
  contract: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json',
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
          teaching_text: {
            explanation: unit.summary,
            analytic_prompt: unit.analytic_question,
            scope_guardrail: unit.misuse_guardrail,
          },
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
    status: 'advanced_theory_fulltext_materialized',
    source_canon: contract.canon_file,
    refresh_contract: 'data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json',
    works: domainWorks,
    counts: {
      works: domainWorks.length,
      theory_units: domainWorks.reduce((sum, work) => sum + work.theory_units.length, 0),
    },
  }));
}

export function materialize() {
  const canon = read(P.canon);
  const contract = read(P.contract);
  const overlays = buildOverlays(canon, contract);
  const workCount = overlays.reduce((sum, overlay) => sum + overlay.counts.works, 0);
  const theoryCount = overlays.reduce((sum, overlay) => sum + overlay.counts.theory_units, 0);
  if (workCount !== contract.expected_work_count || theoryCount !== contract.expected_theory_unit_count) {
    throw new Error(`Advanced theory count mismatch: ${workCount} works / ${theoryCount} theory units`);
  }
  for (const overlay of overlays) write(`${P.outputRoot}/${overlay.domain_id}.json`, overlay);
  const report = {
    schema: 'history_go_sosiologi_antropologi_advanced_theory_fulltext_refresh_audit_v1',
    version: '1.0.0',
    updated_at: '2026-09-15',
    status: 'pass',
    subject_id: contract.subject_id,
    canonical_subcategory_id: contract.canonical_subcategory_id,
    counts: { domains: overlays.length, works: workCount, theory_units: theoryCount },
    gates: {
      existing_domains_only: contract.policy?.existing_domains_only === true,
      strict_completion_preserved: contract.policy?.preserve_strict_completion === true,
      generator_owned_fulltext: contract.policy?.generator_owned_fulltext_only === true,
      every_work_has_traceable_source: overlays.every((overlay) => overlay.works.every((work) => typeof work.source_url === 'string' && work.source_url.startsWith('https://'))),
      every_theory_has_explanation_question_and_guardrail: overlays.every((overlay) => overlay.works.every((work) => work.theory_units.every((unit) => unit.summary && unit.analytic_question && unit.misuse_guardrail))),
    },
  };
  if (overlays.length !== 7 || !Object.values(report.gates).every(Boolean)) throw new Error('Advanced theory fulltext refresh audit failed');
  write(P.report, report);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = materialize();
  console.log(`Advanced theory fulltext refresh: ${report.counts.domains} domains, ${report.counts.works} works, ${report.counts.theory_units} theory units.`);
}
