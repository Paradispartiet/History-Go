import fs from 'node:fs';
import path from 'node:path';

type PersonRecord = Record<string, unknown>;

const candidates = [
  { key: 'jens_bjelke', names: ['Jens Bjelke'] },
  { key: 'caspar_herman_von_storm', names: ['Caspar Herman von Storm', 'Caspar Herman Storm'] },
  { key: 'bernt_anker', names: ['Bernt Anker'] },
  { key: 'diderich_hegermann', names: ['Diderich Hegermann', 'Diderik Hegermann'] },
  { key: 'christian_heinrich_grosch', names: ['Christian Heinrich Grosch', 'Christian H. Grosch', 'Christian Grosch'] },
  { key: 'christian_ancher', names: ['Christian Ancher', 'Christian Anker'] },
  { key: 'christian_frederik', names: ['Christian Frederik'] },
  { key: 'karl_johan', names: ['Karl Johan', 'Carl Johan', 'Jean Baptiste Bernadotte'] },
  { key: 'jacob_wilhelm_nordan', names: ['Jacob Wilhelm Nordan', 'Jacob W. Nordan'] },
  { key: 'otto_kunzli', names: ['Otto Künzli', 'Otto Kunzli'] },
  { key: 'lauritz_hansen', names: ['Lauritz Hansen', 'Laurits Hansen'] },
  { key: 'brynjulf_bergslien', names: ['Brynjulf Bergslien'] },
  { key: 'helge_berntsen', names: ['Helge Berntsen'] },
  { key: 'morten_leuch_eliesen', names: ['Morten Leuch Eliesen', 'Morten Leuch'] },
  { key: 'dorthea_monsen', names: ['Dorthea Monsen', 'Dorothea Monsen'] }
];

const targetPlaceIds = [
  'den_gamle_krigsskolen',
  'kirkeristen_basarene_brannvakten',
  'palehaven_paleet',
  'mustadgarden_kongens_gate_3',
  'radmannsgarden_og_anatomibygget',
  'magistratgarden'
];

const normalize = (value: unknown) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

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
    for (const value of (Array.isArray(parsed) ? parsed : [parsed])) {
      if (value && typeof value === 'object') records.push({ file, record: value as PersonRecord });
    }
  } catch (error) {
    parseErrors.push({ file, error: error instanceof Error ? error.message : String(error) });
  }
}

const candidateResults = candidates.map(candidate => {
  const keys = new Set([candidate.key, ...candidate.names].map(normalize));
  const matches = records.filter(({ record }) => keys.has(normalize(record.id)) || keys.has(normalize(record.name)))
    .map(({ file, record }) => ({
      file,
      id: record.id ?? null,
      name: record.name ?? null,
      placeId: record.placeId ?? null,
      places: Array.isArray(record.places) ? record.places : []
    }));
  return { ...candidate, matches };
});

const placeResults = targetPlaceIds.map(placeId => ({
  placeId,
  matches: records.filter(({ record }) => record.placeId === placeId || (Array.isArray(record.places) && record.places.includes(placeId)))
    .map(({ file, record }) => ({ file, id: record.id ?? null, name: record.name ?? null, placeId: record.placeId ?? null }))
}));

const report = {
  generatedAt: new Date().toISOString(),
  scannedPeopleJsonFiles: files.length,
  scannedRecords: records.length,
  parseErrors,
  candidates: candidateResults,
  targetPlaces: placeResults
};

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/oslo-people-batch6-candidate-audit.json', `${JSON.stringify(report, null, 2)}\n`);
const lines = [
  '# Oslo People zero-gap batch 6 – candidate audit', '',
  `- People JSON-filer skannet: **${files.length}**`,
  `- ID-/navnerecords skannet: **${records.length}**`,
  `- Parsefeil: **${parseErrors.length}**`, '',
  '## Kandidater', '',
  '| Kandidat | Treff | Filer / canonical anker |',
  '|---|---:|---|',
  ...candidateResults.map(result => `| ${result.names[0]} | ${result.matches.length} | ${result.matches.length ? result.matches.map(match => `\`${match.file}\` → \`${String(match.id)}\` / \`${String(match.placeId)}\``).join('<br>') : 'Ingen treff'} |`),
  '', '## Målsteder', '',
  '| Place ID | Eksisterende People-lenker |',
  '|---|---:|',
  ...placeResults.map(result => `| \`${result.placeId}\` | ${result.matches.length}${result.matches.length ? ` – ${result.matches.map(match => `\`${String(match.id)}\``).join(', ')}` : ''} |`), ''
];
fs.writeFileSync('reports/oslo-people-batch6-candidate-audit.md', `${lines.join('\n')}\n`);
if (parseErrors.length) throw new Error(`People candidate audit found ${parseErrors.length} JSON parse errors`);
console.log(JSON.stringify({
  scannedPeopleJsonFiles: files.length,
  scannedRecords: records.length,
  candidates: candidateResults.map(result => ({ key: result.key, matches: result.matches.length })),
  targetPlaces: placeResults.map(result => ({ placeId: result.placeId, matches: result.matches.length }))
}, null, 2));
