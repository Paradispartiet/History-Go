#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  policy: 'data/fag/TV_og_Film/film_tv_source_authority_policy_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  holisticReport: 'reports/fagverk/film-tv-holistic-completion-v1-audit.json'
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const unique = (items) => [...new Set(items)];
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const normalize = (value) => String(value || '').toLowerCase();
const sourceText = (source) => [
  source.type,
  source.publisher,
  source.title,
  source.evidence_role,
  source.source_location,
  source.url
].map(normalize).join(' ');

export const AUTHORITY_CLASSES = Object.freeze([
  'peer_reviewed_scholarship',
  'scholarly_book',
  'primary_source',
  'official_statistics',
  'law_regulation',
  'archive_institution',
  'professional_secondary'
]);

export function classifyFilmTvSourceAuthority(source) {
  const type = normalize(source.type);
  const text = sourceText(source);

  if (/peer[-_ ]?reviewed|refereed/.test(type)) return 'peer_reviewed_scholarship';

  if (/scholarly|academic[-_ ]?(book|chapter|handbook|monograph)|university[-_ ]?press|book[-_ ]?chapter|handbook[-_ ]?chapter|research[-_ ]?monograph/.test(type)
    || /oxford university press|cambridge university press|routledge|palgrave macmillan|bloomsbury academic|mit press|harvard university press|university of california press/.test(text)) {
    return 'scholarly_book';
  }

  if (/national[-_ ]?regulator.*(research|survey|data|report)|official[-_ ]?(statistics|data|research)|government[-_ ]?(statistics|data|research)|census|administrative[-_ ]?data|audience[-_ ]?measurement|industry[-_ ]?data[-_ ]?(inventory|report)|survey[-_ ]?methodology|independent[-_ ]?national[-_ ]?survey|cross[-_ ]?platform[-_ ]?industry[-_ ]?and[-_ ]?audience[-_ ]?report/.test(type)
    || (/ofcom|statistics norway|statistisk sentralbyrå|eurostat|pew research center|european audiovisual observatory/.test(text)
      && /(research|survey|data|statistics|methodology|report|inventory)/.test(text))) {
    return 'official_statistics';
  }

  if (/directive|regulation|legislation|statute|\blaw\b|legal[-_ ]|court|jurisprud|treaty|convention|human[-_ ]?rights|regulatory[-_ ]?(framework|rule|guidance)|statutory|official[-_ ]?policy|public[-_ ]?service[-_ ]?(remit|charter)|classification[-_ ]?law/.test(type)
    || /eur-lex|lovdata|european court of human rights|echr|council of europe.*article|legislation\.gov/.test(text)) {
    return 'law_regulation';
  }

  if (/archive|archival|catalog|catalogue|collection|film[-_ ]?registry|museum|library|cinemathe|cinémath|preservation|restoration[-_ ]?(record|guidance)|legal[-_ ]?deposit|filmography|object[-_ ]?record|finding[-_ ]?aid/.test(type)
    || /library of congress|nasjonalbiblioteket|national film registry|fiaf|cinemate|cinémath|museum collection|archive catalogue/.test(text)) {
    return 'archive_institution';
  }

  if (/primary[-_ ]|first[-_ ]?party|interview|oral[-_ ]?history|press[-_ ]?release|speech|transcript|production[-_ ]?(record|document|case|note)|programme[-_ ]?(record|document)|program[-_ ]?(record|document)|contract|manifesto|contemporaneous|trade[-_ ]?periodical|fan[-_ ]?periodical|broadcast[-_ ]?record|corporate[-_ ]?(filing|report)|official[-_ ]?statement/.test(type)) {
    return 'primary_source';
  }

  if (source.type || source.publisher || source.title || source.url) return 'professional_secondary';
  return null;
}

function matchesAny(value, patterns) {
  const text = normalize(value);
  return patterns.some((pattern) => text.includes(normalize(pattern)));
}

function claimAcademicRequirement(claim, policy) {
  return matchesAny(claim.evidence_mode, policy.research_required_evidence_mode_patterns || []);
}

function claimPeerReviewedRequirement(claim, policy) {
  return matchesAny(claim.evidence_mode, policy.empirical_effect_evidence_mode_patterns || []);
}

export function buildFilmTvSourceAuthorityAudit() {
  const policy = read(P.policy);
  const registry = read(P.registry);
  const status = read(P.status);
  const holistic = read(P.holisticReport);
  const filmRegistry = registry.subjects?.film_tv;
  const chapters = filmRegistry?.chapters || [];
  const filmStatus = status.subjects?.find((row) => row.id === 'film_tv');
  const allowedClasses = new Set(Object.keys(policy.authority_classes || {}));
  const academicClasses = new Set(policy.academic_secondary_classes || []);

  const sourceRegistrations = [];
  const claimRows = [];
  const classCounts = Object.fromEntries(AUTHORITY_CLASSES.map((id) => [id, 0]));
  const unknownSources = [];
  const weakResearchClaims = [];
  const weakEffectClaims = [];

  for (const chapter of chapters) {
    assert(chapter.id, 'Film & TV registry chapter mangler id');
    assert(chapter.claimsFile, `${chapter.id}: mangler claimsFile i registry`);
    assert(fs.existsSync(abs(chapter.claimsFile)), `${chapter.id}: claimsFile finnes ikke: ${chapter.claimsFile}`);
    const ledger = read(chapter.claimsFile);
    const sources = ledger.sources || [];
    const claims = ledger.claims || [];
    const sourceMap = new Map();

    for (const source of sources) {
      const authorityClass = classifyFilmTvSourceAuthority(source);
      const row = {
        chapter_id: chapter.id,
        source_id: source.id,
        authority_class: authorityClass,
        type: source.type || null,
        publisher: source.publisher || null,
        title: source.title || null,
        url: source.url || null,
        source_location: source.source_location || null
      };
      sourceRegistrations.push(row);
      if (!authorityClass || !allowedClasses.has(authorityClass)) unknownSources.push(row);
      else classCounts[authorityClass] = (classCounts[authorityClass] || 0) + 1;
      sourceMap.set(source.id, { ...source, authorityClass });
    }

    for (const claim of claims) {
      const linked = (claim.source_ids || []).map((id) => sourceMap.get(id)).filter(Boolean);
      const linkedClasses = unique(linked.map((source) => source.authorityClass).filter(Boolean));
      const requiresAcademicSecondary = claimAcademicRequirement(claim, policy);
      const requiresPeerReviewed = claimPeerReviewedRequirement(claim, policy);
      const hasAcademicSecondary = linkedClasses.some((id) => academicClasses.has(id));
      const hasPeerReviewed = linkedClasses.includes(policy.empirical_effect_required_class);

      const row = {
        chapter_id: chapter.id,
        claim_id: claim.id,
        evidence_mode: claim.evidence_mode || null,
        source_ids: claim.source_ids || [],
        authority_classes: linkedClasses,
        requires_academic_secondary: requiresAcademicSecondary,
        requires_peer_reviewed: requiresPeerReviewed,
        has_academic_secondary: hasAcademicSecondary,
        has_peer_reviewed: hasPeerReviewed
      };
      claimRows.push(row);
      if (requiresAcademicSecondary && !hasAcademicSecondary) weakResearchClaims.push(row);
      if (requiresPeerReviewed && !hasPeerReviewed) weakEffectClaims.push(row);
    }
  }

  const sourceRegistrationCount = sourceRegistrations.length;
  const verifiedClaimCount = claimRows.length;
  const required = policy.completion_invariants;
  const holisticSummary = holistic.summary || {};

  const gates = {
    canonical_completion_remains_closed: filmStatus?.editorialStatus === 'complete'
      && filmStatus?.nextGate === required.terminal_gate,
    exact_registered_chapter_count: chapters.length === required.registered_chapter_count
      && chapters.length === holisticSummary.registered_chapter_count,
    exact_source_registration_count: sourceRegistrationCount === required.source_registration_count
      && sourceRegistrationCount === holisticSummary.inspectable_source_registration_count,
    exact_verified_claim_count: verifiedClaimCount === required.verified_claim_count
      && verifiedClaimCount === holisticSummary.verified_claim_count,
    every_source_has_identity_and_inspectable_location: sourceRegistrations.every((row) => row.source_id
      && typeof row.url === 'string' && /^https?:\/\//.test(row.url)
      && typeof row.source_location === 'string' && row.source_location.trim().length > 0),
    every_source_registration_is_authority_classified: unknownSources.length === 0
      && sourceRegistrations.every((row) => allowedClasses.has(row.authority_class)),
    research_claims_have_academic_secondary_evidence: weakResearchClaims.length === 0,
    empirical_effect_claims_have_peer_reviewed_evidence: weakEffectClaims.length === 0,
    authority_class_policy_is_exact: AUTHORITY_CLASSES.length === allowedClasses.size
      && AUTHORITY_CLASSES.every((id) => allowedClasses.has(id)),
    no_completion_reopen_side_effect: policy.policy?.do_not_reopen_canonical_completion === true
  };

  return {
    schema: 'history_go_film_tv_source_authority_quality_audit_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    status: Object.values(gates).every(Boolean) ? 'pass' : 'fail',
    summary: {
      registered_chapter_count: chapters.length,
      source_registration_count: sourceRegistrationCount,
      verified_claim_count: verifiedClaimCount,
      academic_requirement_claim_count: claimRows.filter((row) => row.requires_academic_secondary).length,
      empirical_effect_requirement_claim_count: claimRows.filter((row) => row.requires_peer_reviewed).length,
      authority_class_counts: classCounts,
      unknown_source_count: unknownSources.length,
      research_claim_gap_count: weakResearchClaims.length,
      empirical_effect_gap_count: weakEffectClaims.length,
      terminal_gate: filmStatus?.nextGate || null
    },
    gates,
    failures: {
      unknown_sources: unknownSources,
      research_claims_without_academic_secondary: weakResearchClaims,
      empirical_effect_claims_without_peer_reviewed_evidence: weakEffectClaims
    },
    source_registrations: sourceRegistrations,
    claim_authority_checks: claimRows
  };
}

export function auditFilmTvSourceAuthorityQualityV1() {
  const report = buildFilmTvSourceAuthorityAudit();
  const failed = Object.entries(report.gates).filter(([, ok]) => !ok).map(([id]) => id);
  if (failed.length) {
    const details = JSON.stringify({ summary: report.summary, failed_gates: failed, failures: report.failures }, null, 2);
    throw new Error(`Film & TV source authority quality audit failed:\n${details}`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditFilmTvSourceAuthorityQualityV1();
  console.log(JSON.stringify({ status: report.status, summary: report.summary, gates: report.gates }, null, 2));
}
