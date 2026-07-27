#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkMode = process.argv.includes('--check');
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;
const reportDir = path.join(root, 'reports/historie-geographic-profiles');
const jsonPath = path.join(reportDir, 'oslo-akershus-profile.json');
const mdPath = path.join(reportDir, 'oslo-akershus-profile.md');

const h = path.join(root, 'data/fag/historie');
const emner = readJson(path.join(h, 'emner_historie_canonical_v4_5.json'));
const claims = A(readJson(path.join(h, 'claims_historie_canonical_v1.json')).claims);
const sources = A(readJson(path.join(h, 'sources_historie_canonical_v1.json')).sources);
const evidence = A(readJson(path.join(h, 'place_evidence_historie_v1.json')).evidence_links);
const profile = readJson(path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json'));
const cases = A(profile.cases);
const mappings = A(profile.emne_case_mappings);
const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
const mappedEmneIds = new Set(mappings.map((item) => item.emne_id));
const claimsWithMultipleSources = claims.filter((item) => A(item.source_ids).length >= 2);
const linksByCase = new Map();
for (const link of evidence) {
  const links = linksByCase.get(link.case_id) ?? [];
  links.push(link);
  linksByCase.set(link.case_id, links);
}
const casesWithTwoEvidenceLinks = verifiedCases.filter((item) => (linksByCase.get(item.case_id) ?? []).length >= 2);
const thresholdComplete = verifiedCases.length >= 10 && evidence.length >= 20 && casesWithTwoEvidenceLinks.length === verifiedCases.length;

const openGaps = [
  ...(verifiedCases.length < 10 ? ['Færre enn ti profilcaser har validert claim–source–evidence-kjede.'] : []),
  ...(evidence.length < 20 ? ['Profilen har færre enn 20 validerte sted–emne–claim–kildekoblinger.'] : []),
  ...(casesWithTwoEvidenceLinks.length !== verifiedCases.length ? ['Minst ett validert case har færre enn to evidenskoblinger.'] : []),
];
const productionBacklog = [
  ...(mappedEmneIds.size < emner.length
    ? [`${emner.length - mappedEmneIds.size} universelle emner mangler fortsatt en Oslo/Akershus-casekandidat.`]
    : []),
  `${cases.length - verifiedCases.length} bevarte profilcaser er fortsatt kandidater uten full claim–source–evidence-kjede.`,
  'Videre produksjon skal normalisere legacy-kandidater mot canonical place- og person-ID-er og utvide periodisk, sosial og geografisk representasjon.',
];

const report = {
  schema_version: '2.0',
  report_id: 'historie_geographic_profile_oslo_akershus_v2',
  profile_id: profile.profile_id,
  subject_id: 'historie',
  geography_id: profile.geography.geography_id,
  status: thresholdComplete ? 'COMPLETE' : 'INCOMPLETE',
  completion_scope: 'minimum_representative_evidence_foundation',
  structural_foundation: {
    status: mappings.length >= 190 ? 'PASS' : 'GAP',
    total_subject_emner: emner.length,
    mapped_emner: mappings.length,
    unique_mapped_emner: mappedEmneIds.size,
    mapped_ratio: emner.length ? Math.round((mappedEmneIds.size / emner.length) * 1000) / 1000 : 0,
    preserved_case_candidates: cases.length,
  },
  evidence_foundation: {
    status: thresholdComplete ? 'PASS' : 'GAP',
    claims: claims.length,
    sources: sources.length,
    evidence_links: evidence.length,
    verified_cases: verifiedCases.length,
    cases_with_two_evidence_links: casesWithTwoEvidenceLinks.length,
    claims_with_multiple_sources: claimsWithMultipleSources.length,
    minimum_verified_cases: 10,
    minimum_evidence_links: 20,
  },
  verified_case_ids: verifiedCases.map((item) => item.case_id).sort(),
  open_gaps: openGaps,
  production_backlog: productionBacklog,
};

const markdown = [
  '# Historie — geografisk produksjonsprofil for Oslo og Akershus',
  '',
  `Status: **${report.status}**`,
  '',
  `Fullføringsomfang: **${report.completion_scope}**`,
  '',
  'Rapporten måler geografisk produksjonsdekning separat fra den universelle fagmodellen. `COMPLETE` betyr at minimumsgrunnlaget for representativ, auditerbar produksjon er nådd; det betyr ikke at alle lokale cases er ferdig produsert.',
  '',
  '## Struktur',
  '',
  `- Universelle emner: **${report.structural_foundation.total_subject_emner}**`,
  `- Unike emner med profilkoblinger: **${report.structural_foundation.unique_mapped_emner}**`,
  `- Migrerte mappingrecords: **${report.structural_foundation.mapped_emner}**`,
  `- Bevarte lokale casekandidater: **${report.structural_foundation.preserved_case_candidates}**`,
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

fs.mkdirSync(reportDir, { recursive: true });
if (checkMode) {
  const stale = [];
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== stable(report)) stale.push(jsonPath);
  if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8') !== markdown) stale.push(mdPath);
  if (stale.length) {
    console.error('Historie geographic profile reports are missing or stale:');
    stale.forEach((file) => console.error(`- ${path.relative(root, file)}`));
    process.exit(1);
  }
} else {
  fs.writeFileSync(jsonPath, stable(report));
  fs.writeFileSync(mdPath, markdown);
}
console.log(`Historie Oslo/Akershus profile: ${report.status}; mappings=${mappings.length}, cases=${cases.length}, verified=${verifiedCases.length}, evidence=${evidence.length}`);
