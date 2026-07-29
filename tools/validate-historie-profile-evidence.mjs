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
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

function listJsonFiles(directory, result = []) {
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) listJsonFiles(absolute, result);
    else if (entry.isFile() && entry.name.endsWith('.json')) result.push(absolute);
  }
  return result;
}

function collectIds(value, result = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectIds(item, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  if (typeof value.id === 'string' && value.id) result.add(value.id);
  for (const child of Object.values(value)) collectIds(child, result);
  return result;
}

const h = path.join(root, 'data/fag/historie');
const emner = readJson(path.join(h, 'emner_historie_canonical_v4_5.json'));
const requirementsFile = readJson(path.join(h, 'case_requirements_historie_canonical_v1.json'));
const claimsFile = readJson(path.join(h, 'claims_historie_canonical_v1.json'));
const sourcesFile = readJson(path.join(h, 'sources_historie_canonical_v1.json'));
const evidenceFile = readJson(path.join(h, 'place_evidence_historie_v1.json'));
const profilesRoot = path.join(root, 'data/fag/profiles');
const profilesManifest = readJson(path.join(profilesRoot, 'manifest.json'));
const profileEntries = A(profilesManifest.profiles).filter((item) => item.subject_id === 'historie');
const profiles = profileEntries.map((entry) => {
  const file = path.join(profilesRoot, entry.profile_file);
  if (!fs.existsSync(file)) fail(`Profile manifest file does not resolve: ${entry.profile_file}`);
  return { entry, file, profile: readJson(file) };
});

const requirements = A(requirementsFile.requirements);
const claims = A(claimsFile.claims);
const sources = A(sourcesFile.sources);
const evidence = A(evidenceFile.evidence_links);
const cases = profiles.flatMap(({ profile }) => A(profile.cases));
const mappings = profiles.flatMap(({ profile }) => A(profile.emne_case_mappings));

const emneIds = uniqueIds(emner, 'emne_id', 'emner');
const requirementIds = uniqueIds(requirements, 'requirement_id', 'case requirements');
const claimIds = uniqueIds(claims, 'claim_id', 'claims');
const sourceIds = uniqueIds(sources, 'source_id', 'sources');
uniqueIds(evidence, 'evidence_id', 'evidence');
const caseIds = uniqueIds(cases, 'case_id', 'profile cases');
const profileById = new Map(profiles.map(({ profile }) => [profile.profile_id, profile]));
const profileByCaseId = new Map();

if (requirements.length !== 4) fail(`Expected 4 case requirements, got ${requirements.length}`);
if (emner.some((emne) => Object.prototype.hasOwnProperty.call(emne, 'recommended_oslo_cases'))) {
  fail('recommended_oslo_cases remains in universal emner');
}
for (const emne of emner) {
  const ids = A(emne.case_requirement_ids);
  if (ids.length !== 4) fail(`${emne.emne_id} must reference 4 case requirements`);
  for (const id of ids) if (!requirementIds.has(id)) fail(`${emne.emne_id} references unknown case requirement ${id}`);
}

if (!profiles.length) fail('No active Historie profiles found in profiles manifest');
for (const { entry, profile } of profiles) {
  if (profile.subject_id !== 'historie' || profile.canonical_subject_version !== 'v5.8') {
    fail(`${profile.profile_id}: profile subject/version mismatch`);
  }
  if (entry.profile_id !== profile.profile_id) fail(`${profile.profile_id}: manifest profile_id mismatch`);
  if (entry.geography_id !== profile.geography?.geography_id) fail(`${profile.profile_id}: manifest geography mismatch`);
  const architecturePath = String(profile.contract?.architecture_contract || '').split('#')[0];
  if (!architecturePath || !fs.existsSync(path.join(root, architecturePath))) {
    fail(`${profile.profile_id}: architecture contract does not resolve: ${profile.contract?.architecture_contract}`);
  }
  const profileMappings = A(profile.emne_case_mappings);
  const profileCases = A(profile.cases);
  const ownedCaseIds = new Set(profileCases.map((item) => item.case_id));
  const minimumMappings = Number(profile.production_coverage?.minimum_mappings ?? 1);
  const minimumCases = Number(profile.production_coverage?.minimum_cases_total ?? 2);
  if (profileMappings.length < minimumMappings) {
    fail(`${profile.profile_id}: expected at least ${minimumMappings} emne mappings, got ${profileMappings.length}`);
  }
  if (profileCases.length < minimumCases) {
    fail(`${profile.profile_id}: expected at least ${minimumCases} cases, got ${profileCases.length}`);
  }
  for (const mapping of profileMappings) {
    for (const caseId of A(mapping.case_ids)) {
      if (!ownedCaseIds.has(caseId)) {
        fail(`${profile.profile_id}: mapping ${mapping.emne_id} references case ${caseId} owned by another profile`);
      }
    }
  }
  for (const profileCase of profileCases) {
    if (profileCase.geography_id !== profile.geography.geography_id) {
      fail(`${profileCase.case_id}: case geography does not match ${profile.profile_id}`);
    }
    profileByCaseId.set(profileCase.case_id, profile);
  }
}

for (const mapping of mappings) {
  if (!emneIds.has(mapping.emne_id)) fail(`Profile mapping references unknown emne ${mapping.emne_id}`);
  for (const id of A(mapping.case_ids)) if (!caseIds.has(id)) fail(`Profile mapping references unknown case ${id}`);
  for (const id of A(mapping.case_requirement_ids)) if (!requirementIds.has(id)) {
    fail(`Profile mapping references unknown requirement ${id}`);
  }
}

const canonicalPlaceIds = new Set();
const placeParseFailures = [];
for (const file of listJsonFiles(path.join(root, 'data/places'))) {
  try {
    collectIds(readJson(file), canonicalPlaceIds);
  } catch (error) {
    placeParseFailures.push(`${relative(file)}: ${String(error.message || error)}`);
  }
}
if (placeParseFailures.length) fail(`Place JSON parse failures:\n${placeParseFailures.join('\n')}`);
if (!canonicalPlaceIds.size) fail('No canonical place IDs found');

for (const source of sources) {
  if (!/^https:\/\//.test(source.url || '')) fail(`${source.source_id} lacks HTTPS URL`);
  if (!source.source_type || !source.publisher || !source.provenance?.accessed_at) {
    fail(`${source.source_id} lacks source type, publisher or provenance`);
  }
  if (A(source.limitations).length < 2) fail(`${source.source_id} needs at least two limitations`);
  if (!source.quality?.tier || !source.quality?.rationale) fail(`${source.source_id} lacks quality assessment`);
  const repositorySource = String(source.provenance?.repository_source || '').split('#')[0];
  if (!repositorySource || !fs.existsSync(path.join(root, repositorySource))) {
    fail(`${source.source_id} repository_source does not exist: ${source.provenance?.repository_source}`);
  }
}

for (const claim of claims) {
  if (!claim.statement || !claim.claim_type || !claim.scope) fail(`${claim.claim_id} lacks statement/type/scope`);
  if (!A(claim.source_ids).length) fail(`${claim.claim_id} lacks sources`);
  for (const id of A(claim.source_ids)) if (!sourceIds.has(id)) fail(`${claim.claim_id} references unknown source ${id}`);
  for (const id of A(claim.emne_ids)) if (!emneIds.has(id)) fail(`${claim.claim_id} references unknown emne ${id}`);
  for (const id of A(claim.scope.case_ids)) if (!caseIds.has(id)) fail(`${claim.claim_id} references unknown case ${id}`);
  for (const id of A(claim.scope.case_ids)) {
    const owner = profileByCaseId.get(id);
    if (owner && !A(claim.scope.geography_ids).includes(owner.geography.geography_id)) {
      fail(`${claim.claim_id} does not declare geography ${owner.geography.geography_id} for case ${id}`);
    }
  }
  for (const id of A(claim.scope.place_ids)) if (!canonicalPlaceIds.has(id)) {
    fail(`${claim.claim_id} references non-canonical place ${id}`);
  }
  if (!claim.uncertainty?.level || !claim.uncertainty?.note) fail(`${claim.claim_id} lacks uncertainty assessment`);
  if (!A(claim.alternative_interpretations).length) fail(`${claim.claim_id} lacks alternative interpretation or caveat`);
}

const evidenceByCase = new Map();
for (const link of evidence) {
  if (!claimIds.has(link.claim_id)) fail(`${link.evidence_id} references unknown claim ${link.claim_id}`);
  if (!caseIds.has(link.case_id)) fail(`${link.evidence_id} references unknown case ${link.case_id}`);
  const owner = profileByCaseId.get(link.case_id);
  if (!profileById.has(link.profile_id)) fail(`${link.evidence_id} references unknown profile ${link.profile_id}`);
  if (owner?.profile_id !== link.profile_id) fail(`${link.evidence_id} profile does not own case ${link.case_id}`);
  if (owner?.geography?.geography_id !== link.geography_id) fail(`${link.evidence_id} geography does not match its profile`);
  if (!canonicalPlaceIds.has(link.place_id)) fail(`${link.evidence_id} references non-canonical place ${link.place_id}`);
  for (const id of A(link.source_ids)) if (!sourceIds.has(id)) fail(`${link.evidence_id} references unknown source ${id}`);
  for (const id of A(link.emne_ids)) if (!emneIds.has(id)) fail(`${link.evidence_id} references unknown emne ${id}`);
  const list = evidenceByCase.get(link.case_id) ?? [];
  list.push(link);
  evidenceByCase.set(link.case_id, list);
}

const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
if (verifiedCases.length < 10) fail(`Expected at least 10 claim-source-linked cases across active profiles, got ${verifiedCases.length}`);
if (evidence.length < 20) fail(`Expected at least 20 evidence links across active profiles, got ${evidence.length}`);

for (const profileCase of verifiedCases) {
  const placeIds = A(profileCase.place_ids);
  if (!placeIds.length) fail(`${profileCase.case_id} is verified without canonical place_ids`);
  for (const placeId of placeIds) if (!canonicalPlaceIds.has(placeId)) {
    fail(`${profileCase.case_id} references non-canonical place ${placeId}`);
  }
  const links = evidenceByCase.get(profileCase.case_id) ?? [];
  if (links.length < 2) fail(`${profileCase.case_id} needs at least two evidence links, got ${links.length}`);
  for (const link of links) {
    if (!placeIds.includes(link.place_id)) {
      fail(`${link.evidence_id} place ${link.place_id} is not declared on ${profileCase.case_id}`);
    }
  }
}

for (const { profile } of profiles) {
  const profileCases = A(profile.cases);
  const profileCaseIds = new Set(profileCases.map((item) => item.case_id));
  const profileEvidence = evidence.filter((item) => item.profile_id === profile.profile_id);
  const profileClaimIds = new Set(profileEvidence.map((item) => item.claim_id));
  const profileSourceIds = new Set(profileEvidence.flatMap((item) => A(item.source_ids)));
  const profileVerifiedCases = profileCases.filter((item) => item.evidence_status === 'claim_source_linked');
  const counts = profile.production_coverage ?? {};
  const expectedCounts = {
    cases_total: profileCases.length,
    verified_cases_total: profileVerifiedCases.length,
    claims_total: profileClaimIds.size,
    sources_total: profileSourceIds.size,
    evidence_links_total: profileEvidence.length,
  };
  for (const [key, expected] of Object.entries(expectedCounts)) {
    if (counts[key] !== expected) fail(`${profile.profile_id}.production_coverage.${key}: expected ${expected}, got ${counts[key]}`);
  }
  if (profileEvidence.some((item) => !profileCaseIds.has(item.case_id))) {
    fail(`${profile.profile_id}: evidence contains a case owned by another profile`);
  }
  const minimumVerifiedCases = Number(counts.minimum_verified_cases ?? 10);
  const minimumEvidenceLinks = Number(counts.minimum_evidence_links ?? 20);
  const thresholdComplete = profileVerifiedCases.length >= minimumVerifiedCases
    && profileEvidence.length >= minimumEvidenceLinks;
  if (thresholdComplete !== (counts.status === 'COMPLETE')) {
    fail(`${profile.profile_id}: threshold completion=${thresholdComplete} but production_coverage.status=${counts.status}`);
  }
}

console.log(JSON.stringify({
  status: 'PASS',
  emner: emner.length,
  case_requirements: requirements.length,
  profiles: profiles.length,
  profile_mappings: mappings.length,
  cases: cases.length,
  verified_cases: verifiedCases.length,
  claims: claims.length,
  sources: sources.length,
  evidence_links: evidence.length,
  canonical_place_ids: canonicalPlaceIds.size,
}, null, 2));
