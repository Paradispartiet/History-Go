#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkMode = process.argv.includes('--check');
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;
const reportDir = path.join(root, 'reports/historie-geographic-profiles');
const profilesRoot = path.join(root, 'data/fag/profiles');

const h = path.join(root, 'data/fag/historie');
const emner = readJson(path.join(h, 'emner_historie_canonical_v4_5.json'));
const claims = A(readJson(path.join(h, 'claims_historie_canonical_v1.json')).claims);
const sources = A(readJson(path.join(h, 'sources_historie_canonical_v1.json')).sources);
const evidence = A(readJson(path.join(h, 'place_evidence_historie_v1.json')).evidence_links);
const manifest = readJson(path.join(profilesRoot, 'manifest.json'));
const historyEntries = A(manifest.profiles).filter((item) => item.subject_id === 'historie');

function reportSlug(entry) {
  if (entry.report_slug) return entry.report_slug;
  return path.basename(path.dirname(entry.profile_file)).replaceAll('_', '-');
}

function buildReport(entry, profile) {
  const cases = A(profile.cases);
  const mappings = A(profile.emne_case_mappings);
  const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
  const mappedEmneIds = new Set(mappings.map((item) => item.emne_id));
  const profileEvidence = evidence.filter((item) => item.profile_id === profile.profile_id);
  const profileClaimIds = new Set(profileEvidence.map((item) => item.claim_id));
  const profileSourceIds = new Set(profileEvidence.flatMap((item) => A(item.source_ids)));
  const profileClaims = claims.filter((item) => profileClaimIds.has(item.claim_id));
  const profileSources = sources.filter((item) => profileSourceIds.has(item.source_id));
  const claimsWithMultipleSources = profileClaims.filter((item) => A(item.source_ids).length >= 2);
  const linksByCase = new Map();
  for (const link of profileEvidence) {
    const links = linksByCase.get(link.case_id) ?? [];
    links.push(link);
    linksByCase.set(link.case_id, links);
  }
  const casesWithTwoEvidenceLinks = verifiedCases.filter((item) => (linksByCase.get(item.case_id) ?? []).length >= 2);
  const minimumVerifiedCases = Number(profile.production_coverage?.minimum_verified_cases ?? 10);
  const minimumEvidenceLinks = Number(profile.production_coverage?.minimum_evidence_links ?? 20);
  const minimumMappings = Number(profile.production_coverage?.minimum_mappings ?? 190);
  const thresholdComplete = verifiedCases.length >= minimumVerifiedCases
    && profileEvidence.length >= minimumEvidenceLinks
    && casesWithTwoEvidenceLinks.length === verifiedCases.length;

  const geographyLabel = profile.geography?.labels?.nb ?? profile.geography?.geography_id;
  const openGaps = [
    ...(verifiedCases.length < minimumVerifiedCases
      ? [`Færre enn ${minimumVerifiedCases} profilcaser har validert claim–source–evidence-kjede.`]
      : []),
    ...(profileEvidence.length < minimumEvidenceLinks
      ? [`Profilen har færre enn ${minimumEvidenceLinks} validerte sted–emne–claim–kildekoblinger.`]
      : []),
    ...(casesWithTwoEvidenceLinks.length !== verifiedCases.length
      ? ['Minst ett validert case har færre enn to evidenskoblinger.']
      : []),
  ];
  const productionBacklog = [
    ...(mappedEmneIds.size < emner.length
      ? [`${emner.length - mappedEmneIds.size} universelle emner mangler fortsatt en casekandidat i profilen.`]
      : []),
    `${cases.length - verifiedCases.length} profilcaser er fortsatt kandidater uten full claim–source–evidence-kjede.`,
    'Videre produksjon skal bruke canonical place- og person-ID-er og utvide periodisk, sosial og geografisk representasjon uten å gjøre pilotgeografien universell.',
  ];

  return {
    schema_version: '3.0',
    report_id: `historie_geographic_profile_${entry.report_slug || entry.geography_id}_v3`,
    profile_id: profile.profile_id,
    subject_id: 'historie',
    geography_id: profile.geography.geography_id,
    geography_label: geographyLabel,
    status: thresholdComplete ? 'COMPLETE' : 'INCOMPLETE',
    completion_scope: profile.production_coverage?.completion_scope ?? 'minimum_representative_evidence_foundation',
    structural_foundation: {
      status: mappings.length >= minimumMappings ? 'PASS' : 'GAP',
      total_subject_emner: emner.length,
      mapped_emners: mappings.length,
      unique_mapped_emners: mappedEmneIds.size,
      mapped_ratio: emner.length ? Math.round((mappedEmneIds.size / emner.length) * 1000) / 1000 : 0,
      case_candidates: cases.length,
      minimum_mappings: minimumMappings,
    },
    evidence_foundation: {
      status: thresholdComplete ? 'PASS' : 'GAP',
      claims: profileClaims.length,
      sources: profileSources.length,
      evidence_links: profileEvidence.length,
      verified_cases: verifiedCases.length,
      cases_with_two_evidence_links: casesWithTwoEvidenceLinks.length,
      claims_with_multiple_sources: claimsWithMultipleSources.length,
      minimum_verified_cases: minimumVerifiedCases,
      minimum_evidence_links: minimumEvidenceLinks,
    },
    verified_case_ids: verifiedCases.map((item) => item.case_id).sort(),
    open_gaps: openGaps,
    production_backlog: productionBacklog,
  };
}

function renderMarkdown(report) {
  return [
    `# Historie — geografisk produksjonsprofil for ${report.geography_label}`,
    '',
    `Status: **${report.status}**`,
    '',
    `Fullføringsomfang: **${report.completion_scope}**`,
    '',
    'Rapporten måler geografisk produksjonsdekning separat fra den universelle fagmodellen. `COMPLETE` betyr at profilens eksplisitte evidensterskel er nådd; det betyr ikke at alle lokale cases er ferdig produsert eller at funnene er universelle.',
    '',
    '## Struktur',
    '',
    `- Universelle emner: **${report.structural_foundation.total_subject_emner}**`,
    `- Unike emner med profilkoblinger: **${report.structural_foundation.unique_mapped_emners}**`,
    `- Mappingrecords: **${report.structural_foundation.mapped_emners}**`,
    `- Casekandidater: **${report.structural_foundation.case_candidates}**`,
    '',
    '## Evidensgrunnlag',
    '',
    `- Claims: **${report.evidence_foundation.claims}**`,
    `- Kilder: **${report.evidence_foundation.sources}**`,
    `- Sted–emne–claim–kildekoblinger: **${report.evidence_foundation.evidence_links}**`,
    `- Validerte caser: **${report.evidence_foundation.verified_cases}**`,
    `- Validerte caser med minst to evidenskoblinger: **${report.evidence_foundation.cases_with_two_evidence_links}**`,
    '',
    '## Validerte caser',
    '',
    ...report.verified_case_ids.map((item) => `- \`${item}\``),
    '',
    '## Åpne terskelgap',
    '',
    ...(report.open_gaps.length ? report.open_gaps.map((item) => `- ${item}`) : ['Ingen åpne terskelgap.']),
    '',
    '## Videre produksjonskø',
    '',
    ...report.production_backlog.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

if (!historyEntries.length) throw new Error('No active Historie profiles found in data/fag/profiles/manifest.json');
fs.mkdirSync(reportDir, { recursive: true });
const stale = [];
const summaries = [];
for (const entry of historyEntries) {
  const profilePath = path.join(profilesRoot, entry.profile_file);
  if (!fs.existsSync(profilePath)) throw new Error(`Missing profile: ${entry.profile_file}`);
  const profile = readJson(profilePath);
  const report = buildReport(entry, profile);
  const slug = reportSlug(entry);
  const jsonPath = path.join(reportDir, `${slug}-profile.json`);
  const mdPath = path.join(reportDir, `${slug}-profile.md`);
  const jsonOutput = stable(report);
  const markdownOutput = renderMarkdown(report);
  if (checkMode) {
    if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== jsonOutput) stale.push(jsonPath);
    if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8') !== markdownOutput) stale.push(mdPath);
  } else {
    fs.writeFileSync(jsonPath, jsonOutput);
    fs.writeFileSync(mdPath, markdownOutput);
  }
  summaries.push(`${profile.profile_id}: ${report.status}; mappings=${report.structural_foundation.mapped_emners}, cases=${report.structural_foundation.case_candidates}, verified=${report.evidence_foundation.verified_cases}, evidence=${report.evidence_foundation.evidence_links}`);
}

if (stale.length) {
  console.error('Historie geographic profile reports are missing or stale:');
  stale.forEach((file) => console.error(`- ${path.relative(root, file)}`));
  process.exit(1);
}
for (const summary of summaries) console.log(`Historie profile ${summary}`);
