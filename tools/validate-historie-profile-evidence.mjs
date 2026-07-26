#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const A = (value) => Array.isArray(value) ? value : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (message) => { throw new Error(message); };
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item[key]);
  if (ids.some((id) => !id)) fail(`${label} has missing ${key}`);
  if (new Set(ids).size !== ids.length) fail(`${label} has duplicate ${key}`);
  return new Set(ids);
};

const h = path.join(root, 'data/fag/historie');
const emner = readJson(path.join(h, 'emner_historie_canonical_v4_5.json'));
const requirementsFile = readJson(path.join(h, 'case_requirements_historie_canonical_v1.json'));
const claimsFile = readJson(path.join(h, 'claims_historie_canonical_v1.json'));
const sourcesFile = readJson(path.join(h, 'sources_historie_canonical_v1.json'));
const evidenceFile = readJson(path.join(h, 'place_evidence_historie_v1.json'));
const profile = readJson(path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json'));
const profilesManifest = readJson(path.join(root, 'data/fag/profiles/manifest.json'));

const requirements = A(requirementsFile.requirements);
const claims = A(claimsFile.claims);
const sources = A(sourcesFile.sources);
const evidence = A(evidenceFile.evidence_links);
const cases = A(profile.cases);
const mappings = A(profile.emne_case_mappings);

const emneIds = uniqueIds(emner, 'emne_id', 'emner');
const requirementIds = uniqueIds(requirements, 'requirement_id', 'case requirements');
const claimIds = uniqueIds(claims, 'claim_id', 'claims');
const sourceIds = uniqueIds(sources, 'source_id', 'sources');
const evidenceIds = uniqueIds(evidence, 'evidence_id', 'evidence');
const caseIds = uniqueIds(cases, 'case_id', 'profile cases');

if (requirements.length !== 4) fail(`Expected 4 case requirements, got ${requirements.length}`);
if (emnersWithLegacyField().length) fail('recommended_oslo_cases remains in universal emner');
for (const emne of emner) {
  const ids = A(emne.case_requirement_ids);
  if (ids.length !== 4) fail(`${emne.emne_id} must reference 4 case requirements`);
  for (const id of ids) if (!requirementIds.has(id)) fail(`${emne.emne_id} references unknown case requirement ${id}`);
}
if (profile.subject_id !== 'historie' || profile.canonical_subject_version !== 'v5.8') fail('Profile subject/version mismatch');
if (profile.geography?.geography_id !== 'geo_no_oslo_akershus') fail('Profile geography mismatch');
if (!A(profilesManifest.profiles).some((item) => item.profile_id === profile.profile_id)) fail('Profile missing from profiles manifest');
if (mappings.length < 190) fail(`Expected at least 190 migrated Oslo/Akershus emne mappings, got ${mappings.length}`);
if (cases.length < 20) fail(`Expected preserved legacy case candidates, got only ${cases.length}`);

for (const mapping of mappings) {
  if (!emneIds.has(mapping.emne_id)) fail(`Profile mapping references unknown emne ${mapping.emne_id}`);
  for (const id of A(mapping.case_ids)) if (!caseIds.has(id)) fail(`Profile mapping references unknown case ${id}`);
  for (const id of A(mapping.case_requirement_ids)) if (!requirementIds.has(id)) fail(`Profile mapping references unknown requirement ${id}`);
}
for (const source of sources) {
  if (!/^https:\/\//.test(source.url || '')) fail(`${source.source_id} lacks HTTPS URL`);
  if (!source.source_type || !source.publisher || !source.provenance?.accessed_at) fail(`${source.source_id} lacks source type, publisher or provenance`);
  if (A(source.limitations).length < 2) fail(`${source.source_id} needs at least two limitations`);
  if (!source.quality?.tier || !source.quality?.rationale) fail(`${source.source_id} lacks quality assessment`);
}
for (const claim of claims) {
  if (!claim.statement || !claim.claim_type || !claim.scope) fail(`${claim.claim_id} lacks statement/type/scope`);
  if (!A(claim.source_ids).length) fail(`${claim.claim_id} lacks sources`);
  for (const id of A(claim.source_ids)) if (!sourceIds.has(id)) fail(`${claim.claim_id} references unknown source ${id}`);
  for (const id of A(claim.emne_ids)) if (!emneIds.has(id)) fail(`${claim.claim_id} references unknown emne ${id}`);
  for (const id of A(claim.scope.case_ids)) if (!caseIds.has(id)) fail(`${claim.claim_id} references unknown case ${id}`);
  if (!claim.uncertainty?.level || !claim.uncertainty?.note) fail(`${claim.claim_id} lacks uncertainty assessment`);
  if (!A(claim.alternative_interpretations).length) fail(`${claim.claim_id} lacks alternative interpretation or caveat`);
}
for (const link of evidence) {
  if (!claimIds.has(link.claim_id)) fail(`${link.evidence_id} references unknown claim ${link.claim_id}`);
  if (!caseIds.has(link.case_id)) fail(`${link.evidence_id} references unknown case ${link.case_id}`);
  for (const id of A(link.source_ids)) if (!sourceIds.has(id)) fail(`${link.evidence_id} references unknown source ${id}`);
  for (const id of A(link.emne_ids)) if (!emneIds.has(id)) fail(`${link.evidence_id} references unknown emne ${id}`);
}
if (!fs.existsSync(path.join(root, 'data/places/politikk/oslo/places_politikk/oslo_radhus.json'))) {
  fail('Pilot place oslo_radhus does not exist in canonical place data');
}
if (!claims.length || !sources.length || !evidence.length) fail('Evidence foundation registries must not be empty');

function emnersWithLegacyField() {
  return emner.filter((emne) => Object.prototype.hasOwnProperty.call(emne, 'recommended_oslo_cases'));
}

console.log(JSON.stringify({
  status: 'PASS',
  emner: emner.length,
  case_requirements: requirements.length,
  profile_mappings: mappings.length,
  cases: cases.length,
  claims: claims.length,
  sources: sources.length,
  evidence_links: evidence.length,
}, null, 2));
