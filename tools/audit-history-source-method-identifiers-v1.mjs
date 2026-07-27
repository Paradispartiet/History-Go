import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/source-method-audit-v1');
fs.mkdirSync(outDir, { recursive: true });

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const flattenStrings = (value) => {
  if (Array.isArray(value)) return value.flatMap(flattenStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(flattenStrings);
  return typeof value === 'string' ? [value] : [];
};
const walkJson = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return walkJson(full);
    return ent.name.endsWith('.json') ? [full] : [];
  });
};

const emner = readJson('data/fag/historie/emner_historie_canonical_v4_5.json');
const allEmneIds = [...new Set(flattenStrings(emner).filter((v) => v.startsWith('em_his_')))];
const patterns = ['munt', 'visuell', 'seriell', 'autent', 'arkeolog', 'kildekritikk', 'arkiv', 'spor', 'erindring', 'kvantif'];
const sourceMethodEmneIds = allEmneIds.filter((id) => patterns.some((p) => id.includes(p))).sort();

const targetPlaceIds = new Set([
  'eidsvolls_plass',
  'youngstorget',
  '22_juli_senteret',
  'norsk_folkemuseum',
  'meteorologisk_institutt',
  'middelalder_oslo',
  'hovedoya_kloster',
  'eidsvollsbygningen',
  'stortinget'
]);
const placeMatches = [];
for (const file of walkJson(path.join(root, 'data/places'))) {
  let doc;
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  const objects = Array.isArray(doc) ? doc : [doc];
  for (const obj of objects) {
    if (obj && targetPlaceIds.has(obj.id)) {
      placeMatches.push({ place_id: obj.id, name: obj.name ?? null, file: path.relative(root, file), lat: obj.lat ?? null, lon: obj.lon ?? null });
    }
  }
}

const profile = readJson('data/fag/profiles/historie/oslo_akershus/profile.json');
const targetCases = new Set([
  'case_his_eidsvolls_plass',
  'case_his_youngstorget',
  'case_his_22_juli_senteret',
  'case_his_norsk_folkemuseum',
  'case_his_meteorologisk_institutt',
  'case_his_middelalderbyen_oslo',
  'case_his_hovedoya_kloster',
  'case_his_eidsvollsbygningen',
  'case_his_stortinget'
]);
const caseMatches = (profile.cases ?? []).filter((c) => targetCases.has(c.case_id)).map((c) => ({
  case_id: c.case_id,
  label: c.label,
  status: c.status,
  evidence_status: c.evidence_status,
  place_ids: c.place_ids ?? [],
  emne_ids: c.emne_ids ?? []
}));

const result = {
  status: 'IDENTIFIERS_COMPLETE',
  source_method_emne_ids: sourceMethodEmneIds,
  place_matches: placeMatches,
  case_matches: caseMatches
};
fs.writeFileSync(path.join(outDir, 'identifiers.json'), JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'identifiers.md'), [
  '# Historie source-method identifiers V1', '',
  '## Emne IDs',
  ...sourceMethodEmneIds.map((id) => `- ${id}`), '',
  '## Places',
  ...placeMatches.map((p) => `- ${p.place_id} — ${p.file}`), '',
  '## Cases',
  ...caseMatches.map((c) => `- ${c.case_id} — ${c.evidence_status ?? c.status} — ${(c.place_ids ?? []).join(', ') || 'no place'}`), ''
].join('\n'));
console.log(JSON.stringify({ status: result.status, emne_ids: sourceMethodEmneIds.length, places: placeMatches.length, cases: caseMatches.length }));
