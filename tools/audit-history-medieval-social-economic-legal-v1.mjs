import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/medieval-social-audit-v1');
fs.mkdirSync(outDir, { recursive: true });
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const theoryFile = 'data/fag/historie/theory_objects_historie_canonical_v5_5.json';
const emneFile = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const profileFile = 'data/fag/profiles/historie/oslo_akershus/profile.json';
const claimsFile = 'data/fag/historie/claims_historie_canonical_v1.json';
const sourcesFile = 'data/fag/historie/sources_historie_canonical_v1.json';
const evidenceFile = 'data/fag/historie/place_evidence_historie_v1.json';
const theoryEvidenceFile = 'data/fag/historie/theory_evidence_historie_canonical_v1.json';

const targetTheoryIds = [
  'theory_his_middelalder_kirke_bondehushold_demografi_og_dagligliv',
  'theory_his_middelalder_kirke_jord_eiendom_og_patronasje',
  'theory_his_middelalder_kirke_lov_ting_og_jurisdiksjon',
  'theory_his_middelalder_kirke_skriftkultur_diplom_og_muntlig_rett',
  'theory_his_middelalder_kirke_svartedauden_og_senmiddelalderens_omforming',
  'theory_his_middelalder_kirke_handel_handverk_og_bydannelse'
];

const groups = {
  household_demography: ['hushold', 'dagligliv', 'befolkning', 'demografi', 'grav', 'kosthold', 'skjelett', 'barn', 'familie'],
  land_patronage: ['jordegods', 'eiendom', 'patronasje', 'gavebrev', 'landskyld', 'jordebok', 'klostergods', 'bispegods'],
  law_jurisdiction: ['lov', 'ting', 'jurisdiksjon', 'rett', 'lagting', 'birk', 'dom', 'kanonisk rett'],
  writing_diploma_oral_law: ['diplom', 'brev', 'segl', 'skriftkultur', 'muntlig rett', 'diplomatarium', 'håndskrift'],
  plague_late_medieval: ['svartedauden', 'pest', '1349', 'senmiddelalder', 'ødegaard', 'ødegård', 'befolkningsfall'],
  trade_craft_urbanization: ['handel', 'håndverk', 'bydannelse', 'havn', 'import', 'eksport', 'verksted', 'marked', 'brygge', 'kaupang'],
  medieval_general: ['middelalder', 'kloster', 'kirke', 'bispegård', 'kongsgård', 'oslo ladegård', 'hovedøya', 'mariakirken', 'clemenskirken']
};

function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) result.push(...walk(full));
    else if (/\.(json|md|txt)$/i.test(ent.name)) result.push(full);
  }
  return result;
}
function arrayFrom(doc, keys) {
  if (Array.isArray(doc)) return doc;
  for (const key of keys) if (Array.isArray(doc?.[key])) return doc[key];
  return [];
}
function idOf(x) { return x?.theory_id ?? x?.emne_id ?? x?.case_id ?? x?.claim_id ?? x?.source_id ?? x?.id ?? null; }
function textOf(x) { return JSON.stringify(x).toLowerCase(); }
function matchedGroups(text) {
  return Object.entries(groups).filter(([, terms]) => terms.some((t) => text.includes(t))).map(([g]) => g);
}

const theories = arrayFrom(readJson(theoryFile), ['theories', 'objects', 'entries']);
const emner = arrayFrom(readJson(emneFile), ['emner', 'entries', 'objects']);
const profile = readJson(profileFile);
const cases = arrayFrom(profile, ['cases']);
const claims = arrayFrom(readJson(claimsFile), ['claims', 'entries']);
const sources = arrayFrom(readJson(sourcesFile), ['sources', 'entries']);
const evidence = arrayFrom(readJson(evidenceFile), ['evidence_links', 'entries']);
const theoryEntries = arrayFrom(readJson(theoryEvidenceFile), ['entries']);
const readyIds = new Set(theoryEntries.map((e) => e.theory_id));

const targetTheories = theories.filter((t) => targetTheoryIds.includes(idOf(t)));
const targetScopeIds = [...new Set(targetTheories.flatMap((t) => t.explanatory_scope ?? []))];
const targetEmner = emner.filter((e) => targetScopeIds.includes(idOf(e)) || matchedGroups(textOf(e)).length >= 2);
const targetEmneIds = [...new Set(targetEmner.map(idOf).filter(Boolean))];

const candidateCases = cases.filter((c) => {
  const text = textOf(c);
  return (c.emne_ids ?? []).some((id) => targetEmneIds.includes(id)) || matchedGroups(text).length >= 2;
}).map((c) => ({
  case_id: c.case_id,
  label: c.label,
  status: c.status,
  evidence_status: c.evidence_status,
  place_ids: c.place_ids ?? [],
  emne_ids: c.emne_ids ?? [],
  matched_groups: matchedGroups(textOf(c))
}));

const candidateClaims = claims.filter((c) => matchedGroups(textOf(c)).length >= 1).map((c) => ({
  claim_id: c.claim_id,
  claim_type: c.claim_type,
  place_ids: c.scope?.place_ids ?? c.place_ids ?? [],
  case_ids: c.scope?.case_ids ?? c.case_ids ?? [],
  emne_ids: c.emne_ids ?? [],
  source_ids: c.source_ids ?? [],
  matched_groups: matchedGroups(textOf(c))
}));
const candidateSources = sources.filter((s) => matchedGroups(textOf(s)).length >= 1).map((s) => ({
  source_id: s.source_id,
  title: s.title,
  publisher: s.publisher,
  source_type: s.source_type,
  repository_source: s.provenance?.repository_source ?? null,
  matched_groups: matchedGroups(textOf(s))
}));

const scanRoots = ['data/places', 'data/leksikon', 'data/fag/historie', 'docs'];
const repoSignals = [];
const canonicalPlaces = [];
for (const base of scanRoots) {
  for (const file of walk(path.join(root, base))) {
    let content;
    try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const lower = content.toLowerCase();
    const matches = matchedGroups(lower);
    if (!matches.length) continue;
    const rel = path.relative(root, file);
    const snippets = {};
    for (const g of matches) {
      const term = groups[g].find((t) => lower.includes(t));
      const i = lower.indexOf(term);
      snippets[g] = content.slice(Math.max(0, i - 140), Math.min(content.length, i + 320)).replace(/\s+/g, ' ');
    }
    repoSignals.push({ file: rel, matched_groups: matches, snippets });
    if (rel.startsWith('data/places/') && file.endsWith('.json')) {
      try {
        const doc = JSON.parse(content);
        if (doc && typeof doc === 'object' && typeof doc.id === 'string' && typeof doc.name === 'string') {
          canonicalPlaces.push({ place_id: doc.id, name: doc.name, file: rel, emne_ids: doc.emne_ids ?? [], matched_groups: matches });
        }
      } catch {}
    }
  }
}

const candidateCaseIds = new Set(candidateCases.map((c) => c.case_id));
const audit = {
  status: 'AUDIT_COMPLETE',
  target_theories: targetTheoryIds.map((id) => ({ theory_id: id, found: targetTheories.some((t) => idOf(t) === id), evidence_ready: readyIds.has(id) })),
  target_scope_ids: targetScopeIds,
  target_emner: targetEmners = targetEmnerIds = targetEmnerIds,
  target_emne_records: targetEmners = targetEmners,
  candidate_cases: candidateCases,
  candidate_claims: candidateClaims,
  candidate_sources: candidateSources,
  evidence_for_candidate_cases: evidence.filter((e) => candidateCaseIds.has(e.case_id)),
  canonical_places: canonicalPlaces,
  repository_signals: repoSignals,
  production_rule: 'Each theory requires source-type-specific claims, at least two cases and places, explicit provenance, temporal anchors, alternative interpretations and limitations. Ruin existence, founding dates or generic medieval labels are insufficient.'
};

// Correct accidental helper assignments above before writing.
audit.target_emners = targetEmneIds;
audit.target_emne_records = targetEmner;
delete audit.target_emner;

fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(audit, null, 2) + '\n');
const md = [
  '# Historie medieval social, economic and legal audit V1', '',
  `- Target theories found: ${targetTheories.length}/${targetTheoryIds.length}`,
  `- Target emner: ${targetEmneIds.length}`,
  `- Candidate cases: ${candidateCases.length}`,
  `- Candidate claims: ${candidateClaims.length}`,
  `- Candidate sources: ${candidateSources.length}`,
  `- Canonical medieval place signals: ${canonicalPlaces.length}`,
  `- Repository signal files: ${repoSignals.length}`,
  '', '## Theory status',
  ...targetTheoryIds.map((id) => `- ${id}: ${readyIds.has(id) ? 'already evidence_ready' : 'not evidence_ready'}`),
  '', '## Candidate cases',
  ...candidateCases.map((c) => `- ${c.case_id} — ${c.label ?? ''} — ${c.evidence_status ?? c.status ?? ''} — ${(c.place_ids ?? []).join(', ') || 'no place'}`),
  '', '## Canonical places',
  ...canonicalPlaces.slice(0, 100).map((p) => `- ${p.place_id} — ${p.name} — ${p.file} — ${p.matched_groups.join(', ')}`),
  '', '## Production rule', audit.production_rule, ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'audit.md'), md);
console.log(JSON.stringify({ status: audit.status, theories: targetTheories.length, emners: targetEmneIds.length, cases: candidateCases.length, claims: candidateClaims.length, sources: candidateSources.length, places: canonicalPlaces.length, files: repoSignals.length }));
