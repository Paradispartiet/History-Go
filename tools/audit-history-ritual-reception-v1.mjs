#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/ritual-reception-audit-v1');
const A = (value) => Array.isArray(value) ? value : [];
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (file) => path.relative(root, file).split(path.sep).join('/');

const targetTheoryIds = [
  'theory_his_minnested_ritual_offentlig_sorg',
  'theory_his_krig_okkupasjon_krigsminne_veteraner_og_ettervirkninger',
  'theory_his_taushet_fravaer',
];
const terms = [
  '22. juli', '22 juli', 'utoya', 'regjeringskvartalet', 'akershus festning', 'villa grande', 'hl-senter',
  'minnested', 'minnesmerke', 'minnemarkering', 'minnedag', 'minneseremoni', 'minnegudstjeneste',
  'kransenedleggelse', 'krans', 'blomsterhav', 'rosetog', 'ettarsmarkering', 'arsmarkering',
  'offentlig sorg', 'sorgpraksis', 'spontant minne', 'sorgsted', 'ritual', 'seremoni', 'markering',
  'veteran', 'veteraner', 'veterandag', '8. mai', '9. april', 'frigjoringsdag', 'falne', 'henrettet',
  'publikum', 'besokende', 'mottakelse', 'resepsjon', 'brukerundersokelse', 'vitnesbyrd', 'overlevende',
  'taushet', 'fravaer', 'utelatelse', 'glemt', 'glemsel', 'navn', 'navneliste', 'ikke nevnt',
];

function matches(value) {
  const text = normalize(typeof value === 'string' ? value : JSON.stringify(value));
  return terms.filter((term) => text.includes(normalize(term)));
}
function listFiles(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(absolute, result);
    else if (entry.isFile() && ['.json', '.md', '.txt', '.html'].includes(path.extname(entry.name))) result.push(absolute);
  }
  return result;
}
function collectObjects(value, file, result = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, file, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  const hitTerms = matches(value);
  const id = value.place_id || value.case_id || value.claim_id || value.source_id || value.theory_id || value.emne_id || value.id || null;
  const label = value.label || value.title || value.name || value.statement || null;
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
const targetEmneIds = [...new Set(targetTheories.flatMap((item) => [
  ...A(item.emne_ids), ...A(item.source_emne_ids), ...A(item.related_emne_ids),
]).filter(Boolean))];
const profileCases = A(profile.cases).filter((item) => matches(item).length || A(item.emne_ids).some((id) => targetEmneIds.includes(id)))
  .map((item) => ({
    case_id: item.case_id,
    label: item.label,
    status: item.status,
    evidence_status: item.evidence_status,
    place_ids: A(item.place_ids),
    emne_ids: A(item.emne_ids),
    matched_terms: matches(item),
  }));

const relevantClaims = claims.filter((item) => matches(item).length || A(item.emne_ids).some((id) => targetEmneIds.includes(id)))
  .map((item) => ({
    claim_id: item.claim_id,
    statement: item.statement,
    claim_type: item.claim_type,
    place_ids: A(item.scope?.place_ids),
    case_ids: A(item.scope?.case_ids),
    source_ids: A(item.source_ids),
    emne_ids: A(item.emne_ids),
    matched_terms: matches(item),
  }));
const relevantSourceIds = new Set(relevantClaims.flatMap((item) => item.source_ids));
const relevantSources = sources.filter((item) => relevantSourceIds.has(item.source_id) || matches(item).length)
  .map((item) => ({
    source_id: item.source_id,
    title: item.title,
    publisher: item.publisher,
    source_type: item.source_type,
    url: item.url,
    repository_source: item.provenance?.repository_source,
    limitations: A(item.limitations),
    matched_terms: matches(item),
  }));
const evidenceByClaim = new Map(evidence.map((item) => [item.claim_id, item]));

const candidateFiles = [];
const scanRoots = ['data', 'docs', 'reports'].map((name) => path.join(root, name));
for (const scanRoot of scanRoots) {
  for (const file of listFiles(scanRoot)) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const hitTerms = matches(text);
    if (!hitTerms.length) continue;
    let sampleObjects = [];
    if (file.endsWith('.json')) {
      try { sampleObjects = collectObjects(JSON.parse(text), file).slice(0, 30); } catch { /* ignore */ }
    }
    candidateFiles.push({ file: rel(file), matched_terms: hitTerms, sample_objects: sampleObjects });
  }
}

const likelyPlaceIds = new Set();
for (const item of [...profileCases, ...relevantClaims]) for (const id of A(item.place_ids)) likelyPlaceIds.add(id);
for (const file of candidateFiles) {
  if (!file.file.includes('/places/') && !file.file.startsWith('data/places')) continue;
  for (const object of file.sample_objects) if (object.id) likelyPlaceIds.add(object.id);
}

const participantSignals = relevantClaims.filter((item) => item.matched_terms.some((term) => ['publikum', 'besokende', 'vitnesbyrd', 'overlevende', 'veteran', 'veteraner', 'offentlig sorg', 'blomsterhav', 'rosetog'].includes(term)));
const ritualSignals = relevantClaims.filter((item) => item.matched_terms.some((term) => ['ritual', 'seremoni', 'markering', 'minnemarkering', 'kransenedleggelse', 'minnedag', '8. mai', '9. april'].includes(term)));
const absenceSignals = relevantClaims.filter((item) => item.matched_terms.some((term) => ['taushet', 'fravaer', 'utelatelse', 'glemt', 'glemsel', 'ikke nevnt'].includes(term)));

const report = {
  schema_version: '1.0',
  report_id: 'history_ritual_reception_audit_v1',
  target_category: 'ritual_reception_and_experience',
  target_theory_ids: targetTheoryIds,
  target_theories: targetTheories,
  target_emne_ids: targetEmneIds,
  profile_case_candidates: profileCases,
  existing_relevant_claims: relevantClaims.map((item) => ({ ...item, evidence_id: evidenceByClaim.get(item.claim_id)?.evidence_id || null })),
  existing_relevant_sources: relevantSources,
  signal_counts: {
    participant_or_experience_claims: participantSignals.length,
    ritual_or_ceremony_claims: ritualSignals.length,
    documented_absence_claims: absenceSignals.length,
  },
  likely_canonical_place_ids: [...likelyPlaceIds].sort(),
  candidate_repository_files: candidateFiles.sort((a, b) => a.file.localeCompare(b.file, 'nb')),
  production_guard: 'Audit only. Official memorial status, museum mandate or place symbolism cannot substitute for claims about participants, ritual practice, reception, veteran experience or documented absence.',
};

const md = [
  '# Historie — ritual, resepsjon og erfaring audit V1', '',
  `- Teoriobjekter: **${targetTheories.length}**`,
  `- Relevante profilcaser: **${profileCases.length}**`,
  `- Relevante eksisterende claims: **${relevantClaims.length}**`,
  `- Relevante kilder: **${relevantSources.length}**`,
  `- Claims med deltaker-/erfaringssignal: **${participantSignals.length}**`,
  `- Claims med ritual-/seremonisignal: **${ritualSignals.length}**`,
  `- Claims med dokumentert fravær: **${absenceSignals.length}**`,
  `- Candidate repository-filer: **${candidateFiles.length}**`, '',
  '## Profilcasekandidater', '',
  ...profileCases.map((item) => `- \`${item.case_id}\` — ${item.label}; ${item.evidence_status}; places=${item.place_ids.join(', ') || 'ingen'}`), '',
  '## Sannsynlige canonical steder', '',
  ...[...likelyPlaceIds].sort().map((id) => `- \`${id}\``), '',
  '## Produksjonsregel', '', report.production_guard, '',
].join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'audit.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'audit.md'), `${md}\n`);
console.log(JSON.stringify({
  status: 'PASS',
  theories: targetTheories.length,
  profile_cases: profileCases.length,
  claims: relevantClaims.length,
  sources: relevantSources.length,
  participant_signals: participantSignals.length,
  ritual_signals: ritualSignals.length,
  absence_signals: absenceSignals.length,
  candidate_files: candidateFiles.length,
  likely_place_ids: likelyPlaceIds.size,
}, null, 2));
