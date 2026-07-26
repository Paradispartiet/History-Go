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

const report = {
  schema_version: '1.0',
  report_id: 'historie_geographic_profile_oslo_akershus_v1',
  profile_id: profile.profile_id,
  subject_id: 'historie',
  geography_id: profile.geography.geography_id,
  status: verifiedCases.length >= 10 && evidence.length >= 20 ? 'COMPLETE' : 'INCOMPLETE',
  structural_foundation: {
    status: mappings.length >= 190 ? 'PASS' : 'GAP',
    total_subject_emner: emner.length,
    mapped_emner: mappings.length,
    mapped_ratio: emner.length ? Math.round((mappings.length / emner.length) * 1000) / 1000 : 0,
    preserved_case_candidates: cases.length,
  },
  evidence_foundation: {
    status: claims.length >= 4 && sources.length >= 4 && evidence.length >= 4 ? 'PASS' : 'GAP',
    claims: claims.length,
    sources: sources.length,
    evidence_links: evidence.length,
    verified_cases: verifiedCases.length,
    claims_with_multiple_sources: claimsWithMultipleSources.length,
  },
  open_gaps: [
    ...(mappedEmneIds.size < emner.length ? ['Ikke alle universelle emner har en Oslo/Akershus-casekandidat.'] : []),
    ...(verifiedCases.length < 10 ? ['Færre enn ti profilcaser har validert claim–source–evidence-kjede.'] : []),
    ...(evidence.length < 20 ? ['Evidensregisteret er fortsatt en pilot og dekker ikke et bredt utvalg steder og perioder.'] : []),
    'Legacy-casekandidater må normaliseres mot canonical place- og person-ID-er før de kan regnes som produksjonsklare.',
  ],
};

const markdown = [
  '# Historie — geografisk produksjonsprofil for Oslo og Akershus',
  '',
  `Status: **${report.status}**`,
  '',
  'Denne rapporten måler geografisk produksjonsdekning separat fra den universelle fagmodellen.',
  '',
  '## Struktur',
  '',
  `- Universelle emner: **${report.structural_foundation.total_subject_emner}**`,
  `- Emner med migrerte profilkoblinger: **${report.structural_foundation.mapped_emner}**`,
  `- Bevarte lokale casekandidater: **${report.structural_foundation.preserved_case_candidates}**`,
  '',
  '## Evidensgrunnlag',
  '',
  `- Claims: **${report.evidence_foundation.claims}**`,
  `- Kilder: **${report.evidence_foundation.sources}**`,
  `- Sted–emne–claim–kildekoblinger: **${report.evidence_foundation.evidence_links}**`,
  `- Validerte pilotcaser: **${report.evidence_foundation.verified_cases}**`,
  '',
  '## Åpne gap',
  '',
  ...report.open_gaps.map((item) => `- ${item}`),
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
console.log(`Historie Oslo/Akershus profile: ${report.status}; mappings=${mappings.length}, cases=${cases.length}, evidence=${evidence.length}`);
