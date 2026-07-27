#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/movement-publics-audit-v1');
const targetTheoryIds = [
  'theory_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
  'theory_his_offentlighet_mobilisering_borgerrettighetskamp_antirasisme_og_solidaritetsbevegelser',
  'theory_his_offentlighet_mobilisering_miljobevegelse_og_nye_sosiale_bevegelser',
  'theory_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
];
const termGroups = {
  worker: ['folkets hus', 'youngstorget', 'arbeiderbeveg', 'fagforen', 'streik', '1. mai', 'arbeidersamfunn'],
  women: ['kvinnesak', 'kvinnestemmerett', 'kvinnebeveg'],
  temperance: ['avhold', 'totalavhold', 'blå kors', 'iogt', 'godtemplar'],
  antiracism_solidarity: ['antirasis', 'rasisme', 'apartheid', 'solidaritet', 'palestina', 'chile'],
  environment: ['miljøbeveg', 'naturvern', 'greenpeace', 'bellona', 'framtiden i våre hender', 'alta-aksjon'],
  protest: ['protest', 'demonstrasjon', 'aksjon', 'okkupasjon', 'sultestreik', 'boikott', 'opprop', 'blitz', 'hausmania'],
};
const allTerms = Object.values(termGroups).flat();
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
const A = (v) => Array.isArray(v) ? v : [];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (file) => path.relative(root, file).split(path.sep).join('/');

function listFiles(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(absolute, result);
    else if (entry.isFile() && ['.json', '.md', '.txt'].includes(path.extname(entry.name))) result.push(absolute);
  }
  return result;
}
function termMatches(text) {
  const n = normalize(text);
  return allTerms.filter((term) => n.includes(normalize(term)));
}
function groupMatches(text) {
  const n = normalize(text);
  return Object.fromEntries(Object.entries(termGroups)
    .map(([group, terms]) => [group, terms.filter((term) => n.includes(normalize(term)))])
    .filter(([, terms]) => terms.length));
}
function hasCoordinates(value) {
  if (!value || typeof value !== 'object') return false;
  if (Number.isFinite(value.lat) && Number.isFinite(value.lon ?? value.lng)) return true;
  if (Number.isFinite(value.latitude) && Number.isFinite(value.longitude)) return true;
  if (Array.isArray(value.coordinates) && value.coordinates.length >= 2 && value.coordinates.every(Number.isFinite)) return true;
  if (value.location && typeof value.location === 'object') return hasCoordinates(value.location);
  if (value.geometry && typeof value.geometry === 'object') return hasCoordinates(value.geometry);
  return false;
}
function collectCanonicalPlaces(value, file, result = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectCanonicalPlaces(item, file, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  const id = typeof value.id === 'string' ? value.id : null;
  const label = value.name || value.title || value.label || null;
  const groups = groupMatches(JSON.stringify(value));
  if (id && label && hasCoordinates(value) && Object.keys(groups).length) {
    result.push({ place_id: id, label, file: rel(file), matched_groups: groups });
  }
  for (const child of Object.values(value)) collectCanonicalPlaces(child, file, result);
  return result;
}
function extractUrls(text) {
  return [...new Set(text.match(/https:\/\/[^\s"')\]]+/g) || [])].slice(0, 20);
}

const historyDir = path.join(root, 'data/fag/historie');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const theories = readJson(path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json'));
const emner = readJson(path.join(historyDir, 'emner_historie_canonical_v4_5.json'));
const claims = A(readJson(path.join(historyDir, 'claims_historie_canonical_v1.json')).claims);
const sources = A(readJson(path.join(historyDir, 'sources_historie_canonical_v1.json')).sources);
const evidence = A(readJson(path.join(historyDir, 'place_evidence_historie_v1.json')).evidence_links);
const profile = readJson(profilePath);

const targetTheories = A(theories).filter((item) => targetTheoryIds.includes(item.theory_id));
const targetScopes = [...new Set(targetTheories.flatMap((item) => A(item.explanatory_scope)))];
const targetEmnes = A(emner).filter((item) => targetScopes.includes(item.area_id)
  || targetScopes.some((scope) => item.emne_id === `em_${scope}` || item.emne_id.includes(scope.replace(/^his_/, ''))));
const targetEmneIds = targetEmnes.map((item) => item.emne_id);

const profileCases = A(profile.cases).filter((item) => {
  const text = JSON.stringify(item);
  return Object.keys(groupMatches(text)).length || A(item.emne_ids).some((id) => targetEmneIds.includes(id));
}).map((item) => ({
  case_id: item.case_id,
  label: item.label,
  status: item.status,
  evidence_status: item.evidence_status,
  place_ids: A(item.place_ids),
  target_emne_ids: A(item.emne_ids).filter((id) => targetEmneIds.includes(id)),
  matched_groups: groupMatches(JSON.stringify(item)),
}));

const existingClaims = claims.filter((item) => A(item.emne_ids).some((id) => targetEmneIds.includes(id)) || Object.keys(groupMatches(JSON.stringify(item))).length)
  .map((item) => ({
    claim_id: item.claim_id,
    statement: item.statement,
    claim_type: item.claim_type,
    place_ids: A(item.scope?.place_ids),
    case_ids: A(item.scope?.case_ids),
    source_ids: A(item.source_ids),
    target_emne_ids: A(item.emne_ids).filter((id) => targetEmneIds.includes(id)),
    matched_groups: groupMatches(JSON.stringify(item)),
  }));
const existingSourceIds = new Set(existingClaims.flatMap((item) => item.source_ids));
const existingSources = sources.filter((item) => existingSourceIds.has(item.source_id) || Object.keys(groupMatches(JSON.stringify(item))).length)
  .map((item) => ({ source_id: item.source_id, title: item.title, publisher: item.publisher, source_type: item.source_type, url: item.url, repository_source: item.provenance?.repository_source, matched_groups: groupMatches(JSON.stringify(item)) }));
const evidenceByClaim = new Map(evidence.map((item) => [item.claim_id, item]));

const canonicalPlaces = [];
for (const file of listFiles(path.join(root, 'data/places')).filter((file) => file.endsWith('.json'))) {
  try { collectCanonicalPlaces(readJson(file), file, canonicalPlaces); } catch { /* ignore malformed noncanonical candidates */ }
}
const uniquePlaces = [...new Map(canonicalPlaces.map((item) => [item.place_id, item])).values()]
  .sort((a, b) => a.place_id.localeCompare(b.place_id, 'nb'));

const candidateFiles = [];
for (const base of ['data/leksikon', 'data/stories', 'data/places']) {
  for (const file of listFiles(path.join(root, base))) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const groups = groupMatches(text);
    if (!Object.keys(groups).length) continue;
    candidateFiles.push({ file: rel(file), matched_groups: groups, urls: extractUrls(text) });
  }
}

const report = {
  schema_version: '2.0',
  report_id: 'history_movement_publics_audit_v1',
  target_category: 'movement_specific_publics',
  target_theory_ids: targetTheoryIds,
  target_theories: targetTheories,
  target_explanatory_scopes: targetScopes,
  target_emnes: targetEmnes.map((item) => ({ emne_id: item.emne_id, title: item.title, area_id: item.area_id })),
  profile_case_candidates: profileCases,
  existing_relevant_claims: existingClaims.map((item) => ({ ...item, evidence_id: evidenceByClaim.get(item.claim_id)?.evidence_id || null })),
  existing_relevant_sources: existingSources,
  canonical_place_candidates: uniquePlaces,
  candidate_repository_files: candidateFiles.sort((a, b) => a.file.localeCompare(b.file, 'nb')),
  production_guard: 'Audit only. No theory may qualify without new movement-specific claims, actor provenance, canonical sources, at least two cases and exact place-evidence links. Arbeider- eller kvinneclaims cannot stand in for avholds-, antiracist, solidarity or environmental evidence.',
};

const md = [
  '# Historie — bevegelsesspesifikke offentligheter audit V1', '',
  `- Teoriobjekter: **${targetTheories.length}**`,
  `- Forklaringsområder: **${targetScopes.length}**`,
  `- Mål-emner: **${targetEmnes.length}**`,
  `- Relevante profilcaser: **${profileCases.length}**`,
  `- Eksisterende relevante claims: **${existingClaims.length}**`,
  `- Relevante kilder i registeret: **${existingSources.length}**`,
  `- Canonical stedkandidater: **${uniquePlaces.length}**`,
  `- Candidate repository-filer: **${candidateFiles.length}**`, '',
  '## Teoriobjekter', '',
  ...targetTheories.map((item) => `- \`${item.theory_id}\` — ${item.label}`), '',
  '## Mål-emner', '',
  ...targetEmnes.map((item) => `- \`${item.emne_id}\` — ${item.title}`), '',
  '## Profilcasekandidater', '',
  ...profileCases.map((item) => `- \`${item.case_id}\` — ${item.label}; ${item.evidence_status}; places=${item.place_ids.join(', ') || 'ingen'}`), '',
  '## Canonical stedkandidater', '',
  ...uniquePlaces.map((item) => `- \`${item.place_id}\` — ${item.label}; ${item.file}`), '',
  '## Produksjonsregel', '', report.production_guard, '',
].join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'audit.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'audit.md'), `${md}\n`);
console.log(JSON.stringify({ status: 'PASS', theories: targetTheories.length, scopes: targetScopes.length, emners: targetEmnes.length, profile_cases: profileCases.length, claims: existingClaims.length, sources: existingSources.length, canonical_places: uniquePlaces.length, candidate_files: candidateFiles.length }, null, 2));
