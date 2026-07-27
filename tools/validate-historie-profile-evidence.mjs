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
uniqueIds(evidence, 'evidence_id', 'evidence');
const caseIds = uniqueIds(cases, 'case_id', 'profile cases');

if (requirements.length !== 4) fail(`Expected 4 case requirements, got ${requirements.length}`);
if (emner.some((emne) => Object.prototype.hasOwnProperty.call(emne, 'recommended_oslo_cases'))) {
  fail('recommended_oslo_cases remains in universal emner');
}
for (const emne of emner) {
  const ids = A(emne.case_requirement_ids);
  if (ids.length !== 4) fail(`${emne.emne_id} must reference 4 case requirements`);
  for (const id of ids) if (!requirementIds.has(id)) fail(`${emne.emne_id} references unknown case requirement ${id}`);
}

if (profile.subject_id !== 'historie' || profile.canonical_subject_version !== 'v5.8') {
  fail('Profile subject/version mismatch');
}
if (profile.geography?.geography_id !== 'geo_no_oslo_akershus') fail('Profile geography mismatch');
if (!A(profilesManifest.profiles).some((item) => item.profile_id === profile.profile_id)) {
  fail('Profile missing from profiles manifest');
}
const architecturePath = String(profile.contract?.architecture_contract || '').split('#')[0];
if (!architecturePath || !fs.existsSync(path.join(root, architecturePath))) {
  fail(`Profile architecture contract does not resolve: ${profile.contract?.architecture_contract}`);
}
if (mappings.length < 190) fail(`Expected at least 190 migrated Oslo/Akershus emne mappings, got ${mappings.length}`);
if (cases.length < 20) fail(`Expected preserved legacy case candidates, got only ${cases.length}`);

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
  if (!canonicalPlaceIds.has(link.place_id)) fail(`${link.evidence_id} references non-canonical place ${link.place_id}`);
  for (const id of A(link.source_ids)) if (!sourceIds.has(id)) fail(`${link.evidence_id} references unknown source ${id}`);
  for (const id of A(link.emne_ids)) if (!emneIds.has(id)) fail(`${link.evidence_id} references unknown emne ${id}`);
  const list = evidenceByCase.get(link.case_id) ?? [];
  list.push(link);
  evidenceByCase.set(link.case_id, list);
}

const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
if (verifiedCases.length < 10) fail(`Expected at least 10 claim-source-linked cases, got ${verifiedCases.length}`);
if (evidence.length < 20) fail(`Expected at least 20 evidence links, got ${evidence.length}`);

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

const counts = profile.production_coverage ?? {};
const expectedCounts = {
  cases_total: cases.length,
  verified_cases_total: verifiedCases.length,
  claims_total: claims.length,
  sources_total: sources.length,
  evidence_links_total: evidence.length,
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) fail(`profile.production_coverage.${key}: expected ${expected}, got ${counts[key]}`);
}
if (verifiedCases.length >= 10 && evidence.length >= 20 && counts.status !== 'COMPLETE') {
  fail(`Profile threshold is complete but production_coverage.status=${counts.status}`);
}

console.log(JSON.stringify({
  status: 'PASS',
  emner: emner.length,
  case_requirements: requirements.length,
  profile_mappings: mappings.length,
  cases: cases.length,
  verified_cases: verifiedCases.length,
  claims: claims.length,
  sources: sources.length,
  evidence_links: evidence.length,
  canonical_place_ids: canonicalPlaceIds.size,
}, null, 2));
