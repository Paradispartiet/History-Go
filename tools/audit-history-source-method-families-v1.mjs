import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/source-method-audit-v1');
fs.mkdirSync(outDir, { recursive: true });

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const theoryFile = 'data/fag/historie/theory_objects_historie_canonical_v5_5.json';
const profileFile = 'data/fag/profiles/historie/oslo_akershus/profile.json';
const claimsFile = 'data/fag/historie/claims_historie_canonical_v1.json';
const sourcesFile = 'data/fag/historie/sources_historie_canonical_v1.json';
const evidenceFile = 'data/fag/historie/place_evidence_historie_v1.json';
const theoryEvidenceFile = 'data/fag/historie/theory_evidence_historie_canonical_v1.json';

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
  const rows = [];
  if (Array.isArray(value)) {
    value.forEach((v, i) => rows.push(...flatten(v, `${prefix}[${i}]`)));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => rows.push(...flatten(v, prefix ? `${prefix}.${k}` : k)));
  } else if (value !== null && value !== undefined) {
    rows.push({ path: prefix, value: String(value) });
  }
  return rows;
}

function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) result.push(...walk(full));
    else if (/\.(json|md|txt|mjs|js)$/i.test(ent.name)) result.push(full);
  }
  return result;
}

const theoriesDoc = readJson(theoryFile);
const profile = readJson(profileFile);
const claimsDoc = readJson(claimsFile);
const sourcesDoc = readJson(sourcesFile);
const evidenceDoc = readJson(evidenceFile);
const theoryEvidence = readJson(theoryEvidenceFile);

const theories = theoriesDoc.theories ?? theoriesDoc.objects ?? theoriesDoc.entries ?? [];
const targetTheories = theories.filter((t) => targetTheoryIds.includes(t.theory_id ?? t.id));
const targetEmneIds = [...new Set(targetTheories.flatMap((t) => flatten(t).filter((r) => r.path.toLowerCase().includes('emne')).map((r) => r.value).filter((v) => v.startsWith('em_his_'))))];

const cases = profile.cases ?? [];
const caseCandidates = cases.filter((c) => {
  const text = JSON.stringify(c).toLowerCase();
  return targetEmneIds.some((id) => (c.emne_ids ?? []).includes(id)) || Object.values(keywordGroups).flat().some((kw) => text.includes(kw));
}).map((c) => ({
  case_id: c.case_id,
  label: c.label,
  status: c.status,
  evidence_status: c.evidence_status,
  place_ids: c.place_ids ?? [],
  matched_emne_ids: (c.emne_ids ?? []).filter((id) => targetEmneIds.includes(id)),
  all_emne_ids: c.emne_ids ?? []
}));

const sourceRows = sourcesDoc.sources ?? sourcesDoc.entries ?? [];
const claimRows = claimsDoc.claims ?? claimsDoc.entries ?? [];
const evidenceRows = evidenceDoc.evidence_links ?? evidenceDoc.entries ?? [];
const qualifyingIds = new Set((theoryEvidence.entries ?? []).map((e) => e.theory_id));

const existingSourceSignals = [];
for (const s of sourceRows) {
  const text = JSON.stringify(s).toLowerCase();
  const groups = Object.entries(keywordGroups).filter(([, kws]) => kws.some((kw) => text.includes(kw))).map(([g]) => g);
  if (groups.length) existingSourceSignals.push({ source_id: s.source_id, title: s.title, source_type: s.source_type, groups, repository_source: s.provenance?.repository_source ?? null });
}

const existingClaimSignals = [];
for (const c of claimRows) {
  const text = JSON.stringify(c).toLowerCase();
  const groups = Object.entries(keywordGroups).filter(([, kws]) => kws.some((kw) => text.includes(kw))).map(([g]) => g);
  if (groups.length) existingClaimSignals.push({ claim_id: c.claim_id, place_ids: c.place_ids ?? [], case_ids: c.case_ids ?? [], claim_type: c.claim_type, groups });
}

const scanRoots = ['data/fag/historie', 'data/leksikon', 'data/places', 'docs', 'reports/historie-profile-evidence', 'reports/historie-geographic-profiles'];
const repoSignals = [];
for (const base of scanRoots) {
  for (const file of walk(path.join(root, base))) {
    let content;
    try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const lower = content.toLowerCase();
    const groups = Object.entries(keywordGroups).filter(([, kws]) => kws.some((kw) => lower.includes(kw))).map(([g]) => g);
    if (groups.length) {
      const rel = path.relative(root, file);
      const snippets = {};
      for (const g of groups) {
        const kw = keywordGroups[g].find((x) => lower.includes(x));
        const idx = lower.indexOf(kw);
        snippets[g] = content.slice(Math.max(0, idx - 120), Math.min(content.length, idx + 260)).replace(/\s+/g, ' ');
      }
      repoSignals.push({ file: rel, groups, snippets });
    }
  }
}

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
const md = [
  '# Historie source-method families audit V1',
  '',
  `- Target theories: ${targetTheoryIds.length}`,
  `- Target theories found: ${targetTheories.length}`,
  `- Target emne IDs: ${targetEmneIds.length}`,
  `- Candidate profile cases: ${caseCandidates.length}`,
  `- Existing source signals: ${existingSourceSignals.length}`,
  `- Existing claim signals: ${existingClaimSignals.length}`,
  `- Repository signal files: ${repoSignals.length}`,
  '',
  '## Theory status',
  ...targetTheoryIds.map((id) => `- ${id}: ${qualifyingIds.has(id) ? 'already evidence_ready' : 'not evidence_ready'}`),
  '',
  '## Candidate cases',
  ...caseCandidates.map((c) => `- ${c.case_id} — ${c.label ?? ''} — ${c.evidence_status ?? c.status ?? ''} — places: ${(c.place_ids ?? []).join(', ') || 'none'}`),
  '',
  '## Method rule',
  audit.production_rule,
  ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'audit.md'), md);
console.log(JSON.stringify({ status: audit.status, theories: targetTheories.length, emners: targetEmneIds.length, cases: caseCandidates.length, sources: existingSourceSignals.length, claims: existingClaimSignals.length, files: repoSignals.length }));
