import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/medieval-social-audit-v1');
fs.mkdirSync(outDir, { recursive: true });
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const arr = (doc, keys) => Array.isArray(doc) ? doc : (keys.map((k) => doc?.[k]).find(Array.isArray) ?? []);
const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]) : [];

const theoryIds = [
  'theory_his_middelalder_kirke_bondehushold_demografi_og_dagligliv',
  'theory_his_middelalder_kirke_jord_eiendom_og_patronasje',
  'theory_his_middelalder_kirke_lov_ting_og_jurisdiksjon',
  'theory_his_middelalder_kirke_skriftkultur_diplom_og_muntlig_rett',
  'theory_his_middelalder_kirke_svartedauden_og_senmiddelalderens_omforming',
  'theory_his_middelalder_kirke_handel_handverk_og_bydannelse'
];
const caseIds = [
  'case_his_middelalderbyen_oslo', 'case_his_hovedoya_kloster', 'case_his_hallvardskatedralen',
  'case_his_mariakirkeruinen', 'case_his_gamle_aker_kirke', 'case_his_oslo_bispegard',
  'case_his_bjorvika', 'case_his_oslo_havn', 'case_his_eidsivating'
];
const placeIds = [
  'middelalder_oslo', 'hovedoya_kloster', 'hallvardskirken_oslo', 'mariakirken_ruin_oslo',
  'gamle_aker_kirke', 'bispeborgen', 'oslo_ladegard', 'nonneseter_kloster', 'clemenskirken', 'bjorvika'
];

const theories = arr(read('data/fag/historie/theory_objects_historie_canonical_v5_5.json'), ['theories', 'objects', 'entries']);
const emner = arr(read('data/fag/historie/emner_historie_canonical_v4_5.json'), ['emner', 'entries', 'objects']);
const profile = read('data/fag/profiles/historie/oslo_akershus/profile.json');
const cases = arr(profile, ['cases']);
const claims = arr(read('data/fag/historie/claims_historie_canonical_v1.json'), ['claims', 'entries']);
const sources = arr(read('data/fag/historie/sources_historie_canonical_v1.json'), ['sources', 'entries']);
const evidence = arr(read('data/fag/historie/place_evidence_historie_v1.json'), ['evidence_links', 'entries']);

const theoryRecords = theories.filter((x) => theoryIds.includes(x.theory_id ?? x.id));
const scopeIds = [...new Set(theoryRecords.flatMap((x) => x.explanatory_scope ?? []))];
const emneRecords = emner.filter((x) => scopeIds.includes(x.emne_id ?? x.id));
const caseRecords = cases.filter((x) => caseIds.includes(x.case_id));
const selectedCaseIds = new Set(caseRecords.map((x) => x.case_id));
const selectedPlaceIds = new Set(placeIds);
const claimRecords = claims.filter((x) => (x.scope?.case_ids ?? x.case_ids ?? []).some((id) => selectedCaseIds.has(id)) || (x.scope?.place_ids ?? x.place_ids ?? []).some((id) => selectedPlaceIds.has(id)));
const sourceIds = new Set(claimRecords.flatMap((x) => x.source_ids ?? []));
const sourceRecords = sources.filter((x) => sourceIds.has(x.source_id));
const evidenceRecords = evidence.filter((x) => selectedCaseIds.has(x.case_id) || selectedPlaceIds.has(x.place_id));

const placeRecords = [];
for (const file of walk(path.join(root, 'data/places')).filter((p) => p.endsWith('.json'))) {
  try {
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (doc && selectedPlaceIds.has(doc.id)) placeRecords.push({ file: path.relative(root, file), record: doc });
  } catch {}
}
const repoFiles = [];
for (const file of walk(path.join(root, 'data')).filter((p) => /\.(json|md)$/i.test(p))) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  const lower = text.toLowerCase();
  if (['svartedauden','diplomatarium','jordebok','landskyld','lagting','eidsivating','hallvardskirken','mariakirken','bispeborgen','nonneseter','middelalderbyen oslo','middelalderparken'].some((t) => lower.includes(t))) {
    repoFiles.push(path.relative(root, file));
  }
}

const out = {
  status: 'TARGETED_AUDIT_COMPLETE',
  theory_records: theoryRecords,
  scope_ids: scopeIds,
  emne_records: emneRecords,
  case_records: caseRecords,
  place_records: placeRecords,
  existing_claim_records: claimRecords,
  existing_source_records: sourceRecords,
  existing_evidence_records: evidenceRecords,
  repository_files: repoFiles
};
fs.writeFileSync(path.join(outDir, 'targeted-audit.json'), JSON.stringify(out, null, 2) + '\n');
const md = [
  '# Targeted medieval production audit V1', '',
  `- Theories: ${theoryRecords.length}/${theoryIds.length}`,
  `- Scope emner: ${emneRecords.length}`,
  `- Profile cases found: ${caseRecords.length}/${caseIds.length}`,
  `- Canonical place records found: ${placeRecords.length}/${placeIds.length}`,
  `- Existing related claims: ${claimRecords.length}`,
  `- Existing related sources: ${sourceRecords.length}`,
  `- Existing evidence links: ${evidenceRecords.length}`,
  '', '## Cases',
  ...caseRecords.map((x) => `- ${x.case_id}: ${x.label ?? ''} — ${x.evidence_status ?? x.status ?? ''} — ${(x.place_ids ?? []).join(', ') || 'no place'}`),
  '', '## Places',
  ...placeRecords.map((x) => `- ${x.record.id}: ${x.record.name} — ${x.file}`),
  ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'targeted-audit.md'), md);
console.log(JSON.stringify({ status: out.status, theories: theoryRecords.length, emners: emneRecords.length, cases: caseRecords.length, places: placeRecords.length, claims: claimRecords.length, sources: sourceRecords.length, evidence: evidenceRecords.length, files: repoFiles.length }));
