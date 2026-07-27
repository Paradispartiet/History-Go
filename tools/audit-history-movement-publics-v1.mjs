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
const terms = [
  'folkets hus', 'youngstorget', 'eidsvolls plass', 'arbeiderbeveg', 'fagforen', 'streik', '1. mai',
  'kvinnesak', 'kvinnestemmerett', 'kvinnebeveg', 'avhold', 'totalavhold', 'blå kors',
  'antirasis', 'rasisme', 'solidaritet', 'apartheid', 'palestina', 'chile', 'sahel',
  'miljøbeveg', 'naturvern', 'greenpeace', 'bellona', 'framtiden i våre hender',
  'protest', 'demonstrasjon', 'aksjon', 'okkupasjon', 'sultestreik', 'boikott', 'opprop',
  'blitz', 'hausmania', 'samfundet', 'arbeidersamfunn', 'fredsbeveg', 'atomvåpen',
];
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
function matches(text) {
  const n = normalize(text);
  return terms.filter((term) => n.includes(normalize(term)));
}
function collectObjects(value, file, result = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, file, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  const text = JSON.stringify(value);
  const hitTerms = matches(text);
  const id = value.id || value.place_id || value.case_id || value.claim_id || value.source_id || value.theory_id || value.emne_id || null;
  const label = value.name || value.title || value.label || value.statement || null;
  if (hitTerms.length && (id || label)) result.push({ file: rel(file), id, label, matched_terms: hitTerms });
  for (const child of Object.values(value)) collectObjects(child, file, result);
  return result;
}

const historyDir = path.join(root, 'data/fag/historie');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const theories = readJson(path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json'));
const claims = A(readJson(path.join(historyDir, 'claims_historie_canonical_v1.json')).claims);
const sources = A(readJson(path.join(historyDir, 'sources_historie_canonical_v1.json')).sources);
const evidence = A(readJson(path.join(historyDir, 'place_evidence_historie_v1.json')).evidence_links);
const profile = readJson(profilePath);

const targetTheories = A(theories).filter((item) => targetTheoryIds.includes(item.theory_id));
const targetEmneIds = [...new Set(targetTheories.flatMap((item) => A(item.source_emne_ids)))];
const profileCases = A(profile.cases).filter((item) => {
  const text = JSON.stringify(item);
  return matches(text).length || A(item.emne_ids).some((id) => targetEmneIds.includes(id));
}).map((item) => ({
  case_id: item.case_id,
  label: item.label,
  status: item.status,
  evidence_status: item.evidence_status,
  place_ids: A(item.place_ids),
  target_emne_ids: A(item.emne_ids).filter((id) => targetEmneIds.includes(id)),
  matched_terms: matches(JSON.stringify(item)),
}));

const existingClaims = claims.filter((item) => A(item.emne_ids).some((id) => targetEmneIds.includes(id)) || matches(JSON.stringify(item)).length)
  .map((item) => ({ claim_id: item.claim_id, statement: item.statement, claim_type: item.claim_type, place_ids: A(item.scope?.place_ids), case_ids: A(item.scope?.case_ids), source_ids: A(item.source_ids), target_emne_ids: A(item.emne_ids).filter((id) => targetEmneIds.includes(id)), matched_terms: matches(JSON.stringify(item)) }));
const existingSourceIds = new Set(existingClaims.flatMap((item) => item.source_ids));
const existingSources = sources.filter((item) => existingSourceIds.has(item.source_id) || matches(JSON.stringify(item)).length)
  .map((item) => ({ source_id: item.source_id, title: item.title, publisher: item.publisher, source_type: item.source_type, url: item.url, repository_source: item.provenance?.repository_source, matched_terms: matches(JSON.stringify(item)) }));
const evidenceByClaim = new Map(evidence.map((item) => [item.claim_id, item]));

const candidateFiles = [];
for (const file of listFiles(path.join(root, 'data'))) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  const hitTerms = matches(text);
  if (!hitTerms.length) continue;
  let objects = [];
  if (file.endsWith('.json')) {
    try { objects = collectObjects(JSON.parse(text), file).slice(0, 50); } catch { /* ignore parse */ }
  }
  candidateFiles.push({ file: rel(file), matched_terms: hitTerms, sample_objects: objects.slice(0, 15) });
}

const likelyPlaceIds = new Set();
for (const candidate of candidateFiles) {
  for (const object of candidate.sample_objects) {
    if (object.id && candidate.file.includes('/places/')) likelyPlaceIds.add(object.id);
  }
}

const report = {
  schema_version: '1.0',
  report_id: 'history_movement_publics_audit_v1',
  target_category: 'movement_specific_publics',
  target_theory_ids: targetTheoryIds,
  target_theories: targetTheories,
  target_emne_ids: targetEmneIds,
  profile_case_candidates: profileCases,
  existing_relevant_claims: existingClaims.map((item) => ({ ...item, evidence_id: evidenceByClaim.get(item.claim_id)?.evidence_id || null })),
  existing_relevant_sources: existingSources,
  likely_canonical_place_ids: [...likelyPlaceIds].sort(),
  candidate_repository_files: candidateFiles.sort((a, b) => a.file.localeCompare(b.file, 'nb')),
  production_guard: 'Audit only. No theory may qualify without new movement-specific claims, actor provenance, canonical sources, at least two cases and exact place-evidence links.',
};

const md = [
  '# Historie — bevegelsesspesifikke offentligheter audit V1', '',
  `- Teoriobjekter: **${targetTheories.length}**`,
  `- Mål-emner: **${targetEmneIds.length}**`,
  `- Relevante profilcaser: **${profileCases.length}**`,
  `- Eksisterende relevante claims: **${existingClaims.length}**`,
  `- Relevante kilder i registeret: **${existingSources.length}**`,
  `- Candidate repository-filer: **${candidateFiles.length}**`, '',
  '## Teoriobjekter', '',
  ...targetTheories.map((item) => `- \`${item.theory_id}\` — ${item.label}`), '',
  '## Profilcasekandidater', '',
  ...profileCases.map((item) => `- \`${item.case_id}\` — ${item.label}; ${item.evidence_status}; places=${item.place_ids.join(', ') || 'ingen'}`), '',
  '## Sannsynlige canonical place-ID-er', '',
  ...[...likelyPlaceIds].sort().map((id) => `- \`${id}\``), '',
  '## Produksjonsregel', '',
  report.production_guard, '',
].join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'audit.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'audit.md'), `${md}\n`);
console.log(JSON.stringify({ status: 'PASS', theories: targetTheories.length, emner: targetEmneIds.length, profile_cases: profileCases.length, claims: existingClaims.length, sources: existingSources.length, candidate_files: candidateFiles.length, likely_place_ids: likelyPlaceIds.size }, null, 2));
