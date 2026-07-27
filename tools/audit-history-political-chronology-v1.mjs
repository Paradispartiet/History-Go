#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/historie-theory-evidence/political-chronology-audit-v1');
const targetPlaceIds = new Set(['stortinget', 'eidsvolls_plass', 'slottet', 'nobelinstituttet', 'eidsvollsbygningen']);
const targetTokens = ['storting', 'eidsvoll', 'slott', 'nobel', 'stemmerett', 'parlament', 'union', '1905', 'statsdannelse'];

function listJsonFiles(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) listJsonFiles(absolute, result);
    else if (entry.isFile() && entry.name.endsWith('.json')) result.push(absolute);
  }
  return result;
}

function walk(value, file, found) {
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, file, found));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const id = typeof value.id === 'string' ? value.id : null;
  if (id && targetPlaceIds.has(id)) {
    found.push({ file: path.relative(root, file).replaceAll('\\', '/'), object: value });
  }
  for (const child of Object.values(value)) walk(child, file, found);
}

const placeMatches = [];
const parseErrors = [];
for (const file of listJsonFiles(path.join(root, 'data/places'))) {
  try {
    walk(JSON.parse(fs.readFileSync(file, 'utf8')), file, placeMatches);
  } catch (error) {
    parseErrors.push({ file: path.relative(root, file), error: String(error.message || error) });
  }
}

const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
const caseMatches = (profile.cases || []).filter((item) => {
  const haystack = JSON.stringify(item).toLowerCase();
  return targetTokens.some((token) => haystack.includes(token));
});

const emnerPath = path.join(root, 'data/fag/historie/emner_historie_canonical_v4_5.json');
const emner = JSON.parse(fs.readFileSync(emnerPath, 'utf8'));
const emneMatches = emner.filter((item) => {
  const haystack = `${item.emne_id || ''} ${item.label || ''} ${item.title || ''}`.toLowerCase();
  return targetTokens.some((token) => haystack.includes(token));
}).map((item) => ({ emne_id: item.emne_id, label: item.label, title: item.title, case_requirement_ids: item.case_requirement_ids }));

const theoriesPath = path.join(root, 'data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const theories = JSON.parse(fs.readFileSync(theoriesPath, 'utf8'));
const theoryMatches = theories.filter((item) => {
  const haystack = `${item.theory_id || ''} ${item.label || ''} ${item.definition || ''}`.toLowerCase();
  return targetTokens.some((token) => haystack.includes(token));
}).map((item) => ({ theory_id: item.theory_id, label: item.label, definition: item.definition, evidence_ready: item.evidence_ready }));

const leksikonMatches = listJsonFiles(path.join(root, 'data/leksikon')).filter((file) => {
  const relative = path.relative(root, file).replaceAll('\\', '/').toLowerCase();
  return targetTokens.some((token) => relative.includes(token));
}).map((file) => path.relative(root, file).replaceAll('\\', '/'));

const report = {
  schema_version: '1.0',
  report_id: 'history_political_chronology_audit_v1',
  target_place_ids: [...targetPlaceIds],
  place_matches: placeMatches,
  profile_case_matches: caseMatches,
  relevant_emner: emneMatches,
  relevant_theories: theoryMatches,
  matching_leksikon_files: leksikonMatches,
  parse_errors: parseErrors,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'audit.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'audit.md'), [
  '# Historie — politisk kronologi repository-audit V1',
  '',
  `- Place-treff: **${placeMatches.length}**`,
  `- Profilcase-treff: **${caseMatches.length}**`,
  `- Emne-treff: **${emneMatches.length}**`,
  `- Teori-treff: **${theoryMatches.length}**`,
  `- Leksikonfil-treff: **${leksikonMatches.length}**`,
  `- Parsefeil: **${parseErrors.length}**`,
  '',
].join('\n'));
console.log(JSON.stringify({
  status: parseErrors.length ? 'WARN' : 'PASS',
  place_matches: placeMatches.length,
  profile_case_matches: caseMatches.length,
  relevant_emner: emneMatches.length,
  relevant_theories: theoryMatches.length,
  matching_leksikon_files: leksikonMatches.length,
}, null, 2));
