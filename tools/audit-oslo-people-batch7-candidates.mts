import fs from 'node:fs';
import path from 'node:path';

type PersonRecord = Record<string, unknown>;
const candidates = [
  { key: 'nils_petter_morland', names: ['Nils Petter Mørland', 'Nils Petter Morland'] },
  { key: 'lars_oyno', names: ['Lars Øyno', 'Lars Oyno'] },
  { key: 'cliff_a_moustache', names: ['Cliff A. Moustache', 'Cliff Moustache'] },
  { key: 'jarl_solberg', names: ['Jarl Solberg'] },
  { key: 'mira_zuckermann', names: ['Mira Zuckermann'] },
  { key: 'harald_otto', names: ['Harald Otto'] },
  { key: 'anne_may_nilsen', names: ['Anne-May Nilsen', 'Anne May Nilsen'] }
];
const targetPlaceIds = ['det_andre_teatret','grusomhetens_teater','nordic_black_theatre_cafeteatret','teater_manu','centralteatret','dramatikkens_hus'];
const normalize = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return walk(full);
  return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
});
const files = walk('data/people').filter(file => file !== 'data/people/manifest.json');
const records: Array<{ file: string; record: PersonRecord }> = [];
const parseErrors: Array<{ file: string; error: string }> = [];
for (const file of files) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const value of (Array.isArray(parsed) ? parsed : [parsed])) if (value && typeof value === 'object') records.push({ file, record: value as PersonRecord });
  } catch (error) { parseErrors.push({ file, error: error instanceof Error ? error.message : String(error) }); }
}
const candidateResults = candidates.map(candidate => {
  const keys = new Set([candidate.key, ...candidate.names].map(normalize));
  const matches = records.filter(({ record }) => keys.has(normalize(record.id)) || keys.has(normalize(record.name))).map(({ file, record }) => ({ file, id: record.id ?? null, name: record.name ?? null, placeId: record.placeId ?? null, places: Array.isArray(record.places) ? record.places : [] }));
  return { ...candidate, matches };
});
const placeResults = targetPlaceIds.map(placeId => ({ placeId, matches: records.filter(({ record }) => record.placeId === placeId || (Array.isArray(record.places) && record.places.includes(placeId))).map(({ file, record }) => ({ file, id: record.id ?? null, name: record.name ?? null, placeId: record.placeId ?? null })) }));
const report = { generatedAt: new Date().toISOString(), policy: { plannedReuse: 0, minimumUniquePersonPerTarget: 1 }, scannedPeopleJsonFiles: files.length, scannedRecords: records.length, parseErrors, candidates: candidateResults, targetPlaces: placeResults };
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/oslo-people-batch7-candidate-audit.json', `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync('reports/oslo-people-batch7-candidate-audit.md', `# Oslo People zero-gap batch 7 – candidate audit\n\n- Policy: **no planned reuse**; every target must receive a new venue-specific person.\n- People JSON files scanned: **${files.length}**\n- ID/name records scanned: **${records.length}**\n- Parse errors: **${parseErrors.length}**\n\n## Candidates\n\n${candidateResults.map(r => `- ${r.names[0]}: ${r.matches.length} match(es)`).join('\n')}\n\n## Target places\n\n${placeResults.map(r => `- \`${r.placeId}\`: ${r.matches.length} existing People link(s)`).join('\n')}\n`);
if (parseErrors.length) throw new Error(`Found ${parseErrors.length} People JSON parse errors`);
console.log(JSON.stringify({ scannedPeopleJsonFiles: files.length, scannedRecords: records.length, candidates: candidateResults.map(r => ({ key: r.key, matches: r.matches.length })), targetPlaces: placeResults.map(r => ({ placeId: r.placeId, matches: r.matches.length })) }, null, 2));
