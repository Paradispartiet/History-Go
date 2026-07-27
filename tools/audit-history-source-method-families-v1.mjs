import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/source-method-audit-v1');
fs.mkdirSync(outDir, { recursive: true });

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const rows = (doc, ...keys) => {
  if (Array.isArray(doc)) return doc;
  for (const key of keys) if (Array.isArray(doc?.[key])) return doc[key];
  return [];
};

const targetTheoryIds = [
  'theory_his_visuelle_kilder',
  'theory_his_muntlige_kilder',
  'theory_his_serielle_kilder',
  'theory_his_dokument_autentisitet',
  'theory_his_arkeologisk_kontekst_formation'
];

const keywordGroups = {
  visual: ['foto', 'fotografi', 'photograph', 'bilde', 'image', 'negativ', 'film', 'motiv', 'kamera', 'oslobilder'],
  oral: ['muntlig', 'oral history', 'intervju', 'interview', 'vitnesbyrd', 'testimony', 'erindring', 'minnefortelling'],
  serial: ['serie', 'serial', 'folketelling', 'census', 'register', 'statistikk', 'dataset', 'protokoll', 'ledger', 'matrikkel', 'manntall'],
  authenticity: ['autentisitet', 'authenticity', 'proveniens', 'provenance', 'forfalskning', 'forged', 'originaldokument', 'arkivsignatur', 'metadata'],
  archaeology: ['arkeolog', 'archaeolog', 'utgravning', 'excavation', 'funnkontekst', 'stratigraf', 'kulturlag', 'formation process', 'depositional']
};

function flatten(value, prefix = '') {
  if (Array.isArray(value)) return value.flatMap((v, i) => flatten(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
  return value === null || value === undefined ? [] : [{ path: prefix, value: String(value) }];
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(ent.name)) return [];
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return walk(full);
    return /\.(json|md|txt|mjs|js)$/i.test(ent.name) ? [full] : [];
  });
}

const theoriesDoc = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const profile = readJson('data/fag/profiles/historie/oslo_akershus/profile.json');
const claimsDoc = readJson('data/fag/historie/claims_historie_canonical_v1.json');
const sourcesDoc = readJson('data/fag/historie/sources_historie_canonical_v1.json');
const evidenceDoc = readJson('data/fag/historie/place_evidence_historie_v1.json');
const theoryEvidence = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');

const theories = rows(theoriesDoc, 'theories', 'objects', 'entries');
const targetTheories = theories.filter((t) => targetTheoryIds.includes(t.theory_id ?? t.id));
const targetEmneIds = [...new Set(targetTheories.flatMap((t) => flatten(t)
  .filter((r) => r.path.toLowerCase().includes('emne'))
  .map((r) => r.value)
  .filter((v) => v.startsWith('em_his_'))))];

const cases = rows(profile, 'cases');
const caseCandidates = cases.filter((c) => {
  const text = JSON.stringify(c).toLowerCase();
  return targetEmneIds.some((id) => (c.emne_ids ?? []).includes(id)) ||
    Object.values(keywordGroups).flat().some((kw) => text.includes(kw));
}).map((c) => ({
  case_id: c.case_id,
  label: c.label,
  status: c.status,
  evidence_status: c.evidence_status,
  place_ids: c.place_ids ?? [],
  matched_emne_ids: (c.emne_ids ?? []).filter((id) => targetEmneIds.includes(id)),
  all_emne_ids: c.emne_ids ?? []
}));

const sourceRows = rows(sourcesDoc, 'sources', 'entries');
const claimRows = rows(claimsDoc, 'claims', 'entries');
const evidenceRows = rows(evidenceDoc, 'evidence_links', 'entries');
const qualifyingIds = new Set(rows(theoryEvidence, 'entries').map((e) => e.theory_id));

const groupMatches = (value) => {
  const text = JSON.stringify(value).toLowerCase();
  return Object.entries(keywordGroups).filter(([, kws]) => kws.some((kw) => text.includes(kw))).map(([group]) => group);
};

const existingSourceSignals = sourceRows.flatMap((s) => {
  const groups = groupMatches(s);
  return groups.length ? [{ source_id: s.source_id, title: s.title, source_type: s.source_type, groups, repository_source: s.provenance?.repository_source ?? null }] : [];
});
const existingClaimSignals = claimRows.flatMap((c) => {
  const groups = groupMatches(c);
  return groups.length ? [{ claim_id: c.claim_id, place_ids: c.place_ids ?? [], case_ids: c.case_ids ?? [], claim_type: c.claim_type, groups }] : [];
});

const scanRoots = ['data/fag/historie', 'data/leksikon', 'data/places', 'docs', 'reports/historie-profile-evidence', 'reports/historie-geographic-profiles'];
const repoSignals = scanRoots.flatMap((base) => walk(path.join(root, base)).flatMap((file) => {
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const lower = content.toLowerCase();
  const groups = Object.entries(keywordGroups).filter(([, kws]) => kws.some((kw) => lower.includes(kw))).map(([group]) => group);
  if (!groups.length) return [];
  const snippets = Object.fromEntries(groups.map((group) => {
    const kw = keywordGroups[group].find((x) => lower.includes(x));
    const idx = lower.indexOf(kw);
    return [group, content.slice(Math.max(0, idx - 120), Math.min(content.length, idx + 260)).replace(/\s+/g, ' ')];
  }));
  return [{ file: path.relative(root, file), groups, snippets }];
}));

const audit = {
  status: 'AUDIT_COMPLETE',
  target_theory_ids: targetTheoryIds,
  target_theories_found: targetTheories.map((t) => ({ theory_id: t.theory_id ?? t.id, label: t.label ?? t.title ?? null, evidence_ready_in_v6: qualifyingIds.has(t.theory_id ?? t.id), flattened: flatten(t) })),
  target_emne_ids: targetEmneIds,
  profile_case_candidates: caseCandidates,
  existing_source_signals: existingSourceSignals,
  existing_claim_signals: existingClaimSignals,
  evidence_links_for_candidate_cases: evidenceRows.filter((e) => caseCandidates.some((c) => c.case_id === e.case_id)),
  repository_signals: repoSignals,
  production_rule: 'A theory may qualify only through claims that explicitly document the source method, its provenance or formation, and method-specific limitations; institutional custody or generic source availability is insufficient.'
};

fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(audit, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'audit.md'), [
  '# Historie source-method families audit V1', '',
  `- Target theories: ${targetTheoryIds.length}`,
  `- Target theories found: ${targetTheories.length}`,
  `- Target emne IDs: ${targetEmneIds.length}`,
  `- Candidate profile cases: ${caseCandidates.length}`,
  `- Existing source signals: ${existingSourceSignals.length}`,
  `- Existing claim signals: ${existingClaimSignals.length}`,
  `- Repository signal files: ${repoSignals.length}`, '',
  '## Theory status',
  ...targetTheoryIds.map((id) => `- ${id}: ${qualifyingIds.has(id) ? 'already evidence_ready' : 'not evidence_ready'}`), '',
  '## Candidate cases',
  ...caseCandidates.map((c) => `- ${c.case_id} — ${c.label ?? ''} — ${c.evidence_status ?? c.status ?? ''} — places: ${(c.place_ids ?? []).join(', ') || 'none'}`), '',
  '## Method rule', audit.production_rule, ''
].join('\n'));

console.log(JSON.stringify({ status: audit.status, theories: targetTheories.length, emners: targetEmneIds.length, cases: caseCandidates.length, sources: existingSourceSignals.length, claims: existingClaimSignals.length, files: repoSignals.length }));
