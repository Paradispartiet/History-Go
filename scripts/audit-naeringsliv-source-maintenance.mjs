#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const REPORT = 'reports/fagverk/naeringsliv-source-maintenance-audit.json';
export const DEFAULT_MAX_AGE_DAYS = 365;

const abs = (relative) => path.join(ROOT, relative);
const json = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value) => String(value ?? '').trim();
const DAY_MS = 24 * 60 * 60 * 1000;

function parseCalendarDate(value, label) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value), `${label}: verified_at must use YYYY-MM-DD`);
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  assert(
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day,
    `${label}: verified_at is not a real calendar date`
  );
  return date;
}

function utcDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  assert(!Number.isNaN(date.getTime()), 'Source maintenance audit received an invalid current date');
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function shadowSourceId(source) {
  return text(source?.source_id || source?.id);
}

export function auditClaimsSourceDocument({
  chapterId,
  claimsDocument,
  modules = [],
  today = new Date(),
  maxAgeDays = DEFAULT_MAX_AGE_DAYS
}) {
  const label = text(chapterId || claimsDocument?.chapter_id);
  assert(label, 'Claims source audit requires a chapter ID');
  assert(claimsDocument?.schema === 'history_go_fagverk_claims_v1', `${label}: wrong claims schema`);
  assert(claimsDocument?.subject_id === 'naeringsliv', `${label}: wrong subject ID`);
  assert(claimsDocument?.chapter_id === label, `${label}: claims chapter ID mismatch`);
  assert(claimsDocument?.verification_status === 'verified', `${label}: claims document is not verified`);

  const verifiedDate = parseCalendarDate(text(claimsDocument.verified_at), label);
  const currentDate = utcDate(today);
  const ageDays = Math.floor((currentDate.getTime() - verifiedDate.getTime()) / DAY_MS);
  assert(ageDays >= 0, `${label}: verified_at cannot be in the future`);
  assert(ageDays <= maxAgeDays, `${label}: source verification is older than ${maxAgeDays} days`);

  const sources = claimsDocument.sources || [];
  const claims = claimsDocument.claims || [];
  assert(sources.length > 0, `${label}: source registry is empty`);
  assert(claims.length > 0, `${label}: claims registry is empty`);

  const sourceById = new Map();
  const sourceUrls = new Set();
  for (const source of sources) {
    const id = text(source.id);
    assert(id, `${label}: source is missing id`);
    assert(!sourceById.has(id), `${label}: duplicate source ID ${id}`);
    for (const field of ['label', 'publisher', 'type', 'source_location']) {
      assert(text(source[field]), `${label}/${id}: source is missing ${field}`);
    }
    const url = text(source.url);
    assert(/^https:\/\//.test(url), `${label}/${id}: source URL must use HTTPS`);
    assert(!sourceUrls.has(url), `${label}: duplicate source URL ${url}`);
    sourceUrls.add(url);
    sourceById.set(id, source);
  }

  const claimIds = new Set();
  const usedSourceIds = new Set();
  for (const claim of claims) {
    const claimId = text(claim.id);
    assert(claimId, `${label}: claim is missing id`);
    assert(!claimIds.has(claimId), `${label}: duplicate claim ID ${claimId}`);
    claimIds.add(claimId);
    assert(claim.status === 'verified', `${label}/${claimId}: claim is not verified`);
    assert(Array.isArray(claim.source_ids) && claim.source_ids.length > 0, `${label}/${claimId}: claim has no source IDs`);
    for (const sourceId of claim.source_ids) {
      assert(sourceById.has(sourceId), `${label}/${claimId}: unknown source ID ${sourceId}`);
      usedSourceIds.add(sourceId);
    }
  }
  for (const sourceId of sourceById.keys()) {
    assert(usedSourceIds.has(sourceId), `${label}: source ${sourceId} is not used by any claim`);
  }

  let shadowSourceEntries = 0;
  for (const [moduleIndex, module] of modules.entries()) {
    if (!Array.isArray(module?.sources)) continue;
    const localIds = new Set();
    for (const shadow of module.sources) {
      const id = shadowSourceId(shadow);
      assert(id, `${label}/module-${moduleIndex + 1}: shadow source is missing an ID`);
      assert(!localIds.has(id), `${label}/module-${moduleIndex + 1}: duplicate shadow source ID ${id}`);
      localIds.add(id);
      const canonical = sourceById.get(id);
      assert(canonical, `${label}/module-${moduleIndex + 1}: unknown shadow source ID ${id}`);
      for (const field of ['label', 'url', 'type']) {
        assert(text(shadow[field]) === text(canonical[field]), `${label}/module-${moduleIndex + 1}/${id}: shadow ${field} differs from canonical source`);
      }
      shadowSourceEntries += 1;
    }
  }

  return {
    id: label,
    verifiedAt: claimsDocument.verified_at,
    counts: { claims: claims.length, sources: sources.length, shadowSourceEntries }
  };
}

export function auditNaeringslivSourceMaintenance({
  writeReport = false,
  checkReport = true,
  today = new Date(),
  maxAgeDays = DEFAULT_MAX_AGE_DAYS
} = {}) {
  const registry = json(REGISTRY);
  const chapters = registry.subjects?.naeringsliv?.chapters || [];
  assert(chapters.length === 12, 'Næringsliv source maintenance expects 12 registered chapters');

  const chapterReports = chapters.map((entry) => {
    assert(text(entry.claimsFile) && fs.existsSync(abs(entry.claimsFile)), `${entry.id}: claims file is missing`);
    const modules = (entry.moduleFiles || []).map((file) => json(file));
    return auditClaimsSourceDocument({
      chapterId: entry.id,
      claimsDocument: json(entry.claimsFile),
      modules,
      today,
      maxAgeDays
    });
  });

  const verifiedDates = chapterReports.map((chapter) => chapter.verifiedAt).sort();
  const totals = chapterReports.reduce((sum, chapter) => ({
    claims: sum.claims + chapter.counts.claims,
    sources: sum.sources + chapter.counts.sources,
    shadowSourceEntries: sum.shadowSourceEntries + chapter.counts.shadowSourceEntries
  }), { claims: 0, sources: 0, shadowSourceEntries: 0 });

  const report = {
    schema: 'history_go_naeringsliv_source_maintenance_audit_v1',
    version: '1.0.0',
    status: 'PASSED',
    policy: { maxVerificationAgeDays: maxAgeDays },
    summary: {
      chapterCount: chapterReports.length,
      claimCount: totals.claims,
      sourceCount: totals.sources,
      shadowSourceEntryCount: totals.shadowSourceEntries,
      oldestVerificationDate: verifiedDates[0],
      newestVerificationDate: verifiedDates.at(-1)
    },
    chapters: chapterReports,
    gates: {
      allClaimsDocumentsVerifiedAndFresh: true,
      allSourcesInspectableAndUnique: true,
      allClaimsUseKnownSources: true,
      everyCanonicalSourceUsed: true,
      legacySourceCopiesMatchCanonicalMetadata: true
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    assert(isDeepStrictEqual(json(REPORT), report), `${REPORT} is stale; run node scripts/audit-naeringsliv-source-maintenance.mjs --write-report`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditNaeringslivSourceMaintenance({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report')
    });
    console.log(`PASS Næringsliv source maintenance: ${report.summary.chapterCount} chapters, ${report.summary.claimCount} claims, ${report.summary.sourceCount} sources`);
  } catch (error) {
    console.error(`FAIL Næringsliv source maintenance: ${error.message}`);
    process.exitCode = 1;
  }
}
