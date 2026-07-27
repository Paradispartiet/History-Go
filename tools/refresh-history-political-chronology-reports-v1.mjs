#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const reportJsonPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.json');
const reportMarkdownPath = path.join(root, 'reports/historie-profile-evidence/history-profile-evidence-foundation.md');
const universalReportPath = path.join(root, 'reports/historie-universal-coverage/historie-universal-coverage.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const A = (value) => Array.isArray(value) ? value : [];
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));

const profile = readJson(profilePath);
const emner = readJson(path.join(historyDir, 'emner_historie_canonical_v4_5.json'));
const requirements = readJson(path.join(historyDir, 'case_requirements_historie_canonical_v1.json'));
const claimsFile = readJson(path.join(historyDir, 'claims_historie_canonical_v1.json'));
const sourcesFile = readJson(path.join(historyDir, 'sources_historie_canonical_v1.json'));
const evidenceFile = readJson(path.join(historyDir, 'place_evidence_historie_v1.json'));
const theoryRegistry = readJson(path.join(historyDir, 'theory_evidence_historie_canonical_v1.json'));
const universal = readJson(universalReportPath);
const previous = readJson(reportJsonPath);

const claims = A(claimsFile.claims);
const sources = A(sourcesFile.sources);
const evidence = A(evidenceFile.evidence_links);
const cases = A(profile.cases);
const mappings = A(profile.emne_case_mappings);
const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
const claimById = new Map(claims.map((item) => [item.claim_id, item]));
const evidenceByCase = new Map();
for (const item of evidence) {
  const list = evidenceByCase.get(item.case_id) ?? [];
  list.push(item);
  evidenceByCase.set(item.case_id, list);
}

const phaseCaseIds = ['case_his_stortinget', 'case_his_eidsvolls_plass'];
const phaseClaimIds = [
  'claim_his_eidsvollsbygningen_limited_franchise_1814',
  'claim_his_stortinget_building_first_used_1866',
  'claim_his_stortinget_parliamentarism_breakthrough_1884',
  'claim_his_stortinget_universal_male_suffrage_1898',
  'claim_his_stortinget_union_dissolved_1905_06_07',
  'claim_his_stortinget_union_referendum_1905_08_13',
  'claim_his_stortinget_womens_petition_1905',
  'claim_his_stortinget_haakon_elected_1905_11_18',
  'claim_his_stortinget_women_suffrage_1913_06_11',
  'claim_his_eidsvolls_plass_haakon_oath_crowds_1905_11_27',
  'claim_his_eidsvolls_plass_demonstration_arena_postwar',
  'claim_his_stortinget_consular_conflict_foreign_service_1905',
  'claim_his_stortinget_interparliamentary_peace_conference_1899',
];
const phaseSourceIds = [
  'src_his_storting_building_history',
  'src_his_storting_parliamentarism_history',
  'src_his_snl_parliamentarism',
  'src_his_storting_democratic_milestones',
  'src_his_storting_suffrage_history',
  'src_his_snl_stemmerett_history',
  'src_his_storting_union_out',
  'src_his_snl_norway_1905_1939',
  'src_his_storting_womens_petition_1905',
  'src_his_storting_republican_monarchy',
  'src_his_storting_eidsvolls_plass',
];
const qualifiedTheoryIds = [
  'theory_his_1814_statsdannelse_stemmerett_partier_og_parlamentarisme',
  'theory_his_1814_statsdannelse_union_selvstendighet_og_1905',
  'theory_his_1814_statsdannelse_1905_unionsopplosning_og_ny_utenrikspolitisk_orientering',
];

for (const id of phaseClaimIds) if (!claimById.has(id)) throw new Error(`Missing phase claim ${id}`);
for (const id of phaseSourceIds) if (!sources.some((item) => item.source_id === id)) throw new Error(`Missing phase source ${id}`);
for (const id of phaseCaseIds) if (!verifiedCases.some((item) => item.case_id === id)) throw new Error(`Missing verified phase case ${id}`);
for (const id of qualifiedTheoryIds) if (!A(theoryRegistry.entries).some((item) => item.theory_id === id)) throw new Error(`Missing qualified phase theory ${id}`);

const phaseCases = phaseCaseIds.map((caseId) => {
  const profileCase = cases.find((item) => item.case_id === caseId);
  const links = A(evidenceByCase.get(caseId));
  return {
    case_id: caseId,
    place_ids: A(profileCase?.place_ids),
    claim_ids: sorted(links.map((item) => item.claim_id)),
    evidence_ids: sorted(links.map((item) => item.evidence_id)),
    source_ids: sorted(links.flatMap((item) => A(item.source_ids))),
  };
});

const remainingGap = A(universal.production?.checks).find((item) => item.status === 'GAP')?.id ?? null;
const report = {
  schema_version: '3.0',
  report_id: 'historie_profile_evidence_foundation_v3',
  status: 'COMPLETE',
  completion_scope: 'minimum_representative_evidence_foundation',
  subject_id: 'historie',
  canonical_subject_version: profile.canonical_subject_version,
  migration: profile.migration_summary,
  inventory: {
    emner: emner.length,
    case_requirements: A(requirements.requirements).length,
    profile_cases: cases.length,
    profile_mappings: mappings.length,
    claims: claims.length,
    sources: sources.length,
    evidence_links: evidence.length,
    verified_cases: verifiedCases.length,
  },
  batch_v2: previous.batch_v2,
  political_chronology_v1: {
    phase_id: 'history_political_chronology_evidence_v1',
    produced_cases: phaseCaseIds.length,
    produced_claims: phaseClaimIds.length,
    produced_sources: phaseSourceIds.length,
    produced_evidence_links: phaseClaimIds.length,
    qualified_theories: qualifiedTheoryIds.length,
    qualified_theory_ids: qualifiedTheoryIds,
    cases: phaseCases,
  },
  theory_evidence: {
    qualifying_entries: theoryRegistry.completion?.qualifying_entries,
    total_theories: theoryRegistry.completion?.total_theories,
    ratio: theoryRegistry.completion?.ratio,
    universal_status: theoryRegistry.completion?.universal_status,
  },
  expected_universal_coverage_after_audit: {
    covered_cells: universal.summary?.covered_cells,
    partial_cells: universal.summary?.partial_cells,
    missing_cells: universal.summary?.missing_cells,
    production_passes: universal.summary?.production_passes,
    production_gaps: universal.summary?.production_gaps,
    remaining_gap: remainingGap,
  },
};
writeJson(reportJsonPath, report);

const markdown = [
  '# Historie profil- og evidensgrunnlag V3',
  '',
  `- Status: **${report.status}**`,
  `- Fullføringsomfang: **${report.completion_scope}**`,
  `- Profilcaser: **${report.inventory.profile_cases}**`,
  `- Validerte caser: **${report.inventory.verified_cases}**`,
  `- Claims: **${report.inventory.claims}**`,
  `- Kilder: **${report.inventory.sources}**`,
  `- Evidenskoblinger: **${report.inventory.evidence_links}**`,
  `- Kvalifiserte teoriobjekter: **${report.theory_evidence.qualifying_entries} av ${report.theory_evidence.total_theories}**`,
  '',
  '## Produksjonsfaser',
  '',
  `- Oslo/Akershus evidensbatch V2: **${report.batch_v2.produced_cases}** nye caser, **${report.batch_v2.produced_claims}** claims og **${report.batch_v2.produced_evidence_links}** evidenskoblinger.`,
  `- Politisk kronologi evidens V1: **${report.political_chronology_v1.produced_cases}** nyvaliderte caser, **${report.political_chronology_v1.produced_claims}** claims, **${report.political_chronology_v1.produced_sources}** kilder og **${report.political_chronology_v1.qualified_theories}** teoriobjekter.`,
  '',
  `- Gjenværende universelt produksjonsgap: **${report.expected_universal_coverage_after_audit.remaining_gap}**`,
  '',
].join('\n');
fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);

console.log(JSON.stringify({
  status: report.status,
  profile_cases: report.inventory.profile_cases,
  verified_cases: report.inventory.verified_cases,
  claims: report.inventory.claims,
  sources: report.inventory.sources,
  evidence_links: report.inventory.evidence_links,
  qualifying_theories: report.theory_evidence.qualifying_entries,
  remaining_gap: report.expected_universal_coverage_after_audit.remaining_gap,
}, null, 2));
