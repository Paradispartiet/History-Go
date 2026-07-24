import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const peopleRoot = path.join(root, 'data/people');
const manifestPath = path.join(peopleRoot, 'manifest.json');
const oldCoveragePath = path.join(root, 'reports/oslo-people-coverage.json');
const reportPath = path.join(root, 'reports/people-oslo-zero-gap-batch1-validation.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}
function norm(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function uniq(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))];
}
function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.people)) return data.people;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}
function walkJson(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(full));
    else if (entry.isFile() && entry.name.endsWith('.json') && full !== manifestPath) out.push(full);
  }
  return out;
}
function relFromData(filePath) {
  return path.relative(path.join(root, 'data'), filePath).replace(/\\/g, '/');
}
function collectRefs(person) {
  return uniq([
    ...(typeof person.placeId === 'string' ? [person.placeId] : []),
    ...(Array.isArray(person.places) ? person.places : []),
  ]);
}
function addSentence(text, sentence) {
  const base = typeof text === 'string' ? text.trim() : '';
  if (base.includes(sentence)) return base;
  return `${base}${base ? ' ' : ''}${sentence}`;
}
function topLevelObjectRanges(text) {
  const ranges = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        ranges.push({ start, end: i + 1 });
        start = -1;
      }
    }
  }
  return ranges;
}
function replaceRecord(filePath, personId, updater) {
  const text = fs.readFileSync(filePath, 'utf8');
  const data = readJson(filePath);
  const rows = toArray(data);
  const index = rows.findIndex((row) => row?.id === personId);
  if (index < 0) throw new Error(`Missing ${personId} in ${filePath}`);
  const ranges = topLevelObjectRanges(text);
  if (ranges.length !== rows.length) throw new Error(`Object range mismatch in ${filePath}`);
  const updated = updater(structuredClone(rows[index]));
  const replacement = JSON.stringify(updated, null, 2).split('\n').map((line, lineIndex) => lineIndex === 0 ? line : `  ${line}`).join('\n');
  const range = ranges[index];
  fs.writeFileSync(filePath, `${text.slice(0, range.start)}${replacement}${text.slice(range.end)}`);
  return updated;
}
function removeRecord(filePath, personId) {
  const data = toArray(readJson(filePath));
  const index = data.findIndex((row) => row?.id === personId);
  if (index < 0) throw new Error(`Missing unlisted ${personId} in ${filePath}`);
  const text = fs.readFileSync(filePath, 'utf8');
  const ranges = topLevelObjectRanges(text);
  if (ranges.length !== data.length) throw new Error(`Object range mismatch while removing from ${filePath}`);
  let start;
  let end;
  if (ranges.length === 1) {
    start = ranges[0].start;
    end = ranges[0].end;
  } else if (index < ranges.length - 1) {
    start = ranges[index].start;
    end = ranges[index + 1].start;
  } else {
    start = ranges[index - 1].end;
    end = ranges[index].end;
  }
  fs.writeFileSync(filePath, `${text.slice(0, start)}${text.slice(end)}`);
}

const manifest = readJson(manifestPath);
const manifestFiles = new Set(manifest.files ?? []);
const allFiles = walkJson(peopleRoot);
const occurrences = [];
for (const filePath of allFiles) {
  let rows;
  try { rows = toArray(readJson(filePath)); } catch { continue; }
  for (const person of rows) {
    if (!person || typeof person.id !== 'string') continue;
    occurrences.push({
      id: person.id,
      name: person.name ?? person.id,
      normName: norm(person.name ?? ''),
      filePath,
      relPath: relFromData(filePath),
      manifested: manifestFiles.has(relFromData(filePath)),
      person,
    });
  }
}
function findById(id) {
  return occurrences.filter((row) => row.id === id);
}
function findByNames(names) {
  const wanted = new Set(names.map(norm));
  return occurrences.filter((row) => wanted.has(row.normName));
}
function exactlyOneManifested(id) {
  const rows = findById(id).filter((row) => row.manifested);
  if (rows.length !== 1) throw new Error(`Expected one manifested ${id}, got ${rows.length}`);
  return rows[0];
}
function ensureManifestPath(relPath) {
  if (!manifest.files.includes(relPath)) manifest.files.push(relPath);
}
function createSingle(relPath, record) {
  const filePath = path.join(root, 'data', relPath);
  if (fs.existsSync(filePath)) throw new Error(`Refusing to overwrite ${relPath}`);
  writeJson(filePath, [record]);
  ensureManifestPath(relPath);
  return filePath;
}
function migrateUnlisted(id, targetRelPath, transform) {
  const rows = findById(id);
  const manifested = rows.filter((row) => row.manifested);
  if (manifested.length > 0) throw new Error(`${id} already manifested`);
  if (rows.length !== 1) throw new Error(`Expected one unlisted ${id}, got ${rows.length}`);
  const source = rows[0];
  const record = transform(structuredClone(source.person));
  removeRecord(source.filePath, id);
  createSingle(targetRelPath, record);
  return { mode: 'migrated', source: source.relPath, target: targetRelPath };
}
function upsertNamed({ id, names, targetRelPath, createRecord, updateRecord }) {
  const idRows = findById(id);
  const nameRows = findByNames(names).filter((row) => row.id !== id);
  if (nameRows.length > 0) throw new Error(`Name collision for ${id}: ${nameRows.map((row) => `${row.id}@${row.relPath}`).join(', ')}`);
  const manifested = idRows.filter((row) => row.manifested);
  const unlisted = idRows.filter((row) => !row.manifested);
  if (manifested.length > 1 || (manifested.length === 1 && unlisted.length > 0) || unlisted.length > 1) {
    throw new Error(`Ambiguous ${id}: ${idRows.map((row) => row.relPath).join(', ')}`);
  }
  if (manifested.length === 1) {
    replaceRecord(manifested[0].filePath, id, updateRecord);
    return { mode: 'reused', source: manifested[0].relPath, target: manifested[0].relPath };
  }
  if (unlisted.length === 1) {
    return migrateUnlisted(id, targetRelPath, updateRecord);
  }
  createSingle(targetRelPath, createRecord());
  return { mode: 'created', source: null, target: targetRelPath };
}

const oldCoverage = readJson(oldCoveragePath);
if (oldCoverage?.totals?.uncoveredRequiredPlaces !== 191) {
  throw new Error(`Expected Oslo baseline 191, got ${oldCoverage?.totals?.uncoveredRequiredPlaces}`);
}
const requiredPlaces = new Set((oldCoverage.uncoveredRequired ?? []).map((row) => row.placeId));
const targetPlaces = [
  'emanuel_vigeland_mausoleum',
  'ibsen_quotes',
  'inger_hagerups_plass',
  'bla_skilt_aud_schonemann_vetlandsveien_69d',
  'house_of_nerds',
  'latter',
];
for (const placeId of targetPlaces) {
  if (!requiredPlaces.has(placeId)) throw new Error(`${placeId} is not an uncovered Oslo target on current main`);
}

const results = [];

const emanuel = exactlyOneManifested('emanuel_vigeland');
replaceRecord(emanuel.filePath, 'emanuel_vigeland', (record) => ({
  ...record,
  tags: uniq([...(record.tags ?? []), 'emanuel_vigeland_mausoleum', 'mausoleum', 'freske', 'tomba_emmanuelle']),
  popupDesc: addSentence(record.popupDesc, 'Emanuel Vigelands mausoleum legges til som et direkte hovedverk og gravsted: han oppførte bygningen som museum, malte freskoverket Vita og omformet rommet til Tomba Emmanuelle, der urnen hans er plassert over inngangen.'),
  places: uniq([...collectRefs(record), 'emanuel_vigeland_mausoleum']),
  source_urls: uniq([...(record.source_urls ?? []), 'https://www.emanuelvigeland.museum.no/museet.htm', 'https://www.emanuelvigeland.museum.no/mausoleet.htm']),
}));
results.push({ placeId: 'emanuel_vigeland_mausoleum', people: ['emanuel_vigeland'], mode: 'reuse' });

const ibsen = exactlyOneManifested('henrik_ibsen');
replaceRecord(ibsen.filePath, 'henrik_ibsen', (record) => ({
  ...record,
  tags: uniq([...(record.tags ?? []), 'ibsen_quotes', 'sitatgaten', 'offentlig_kunst']),
  popupDesc: addSentence(record.popupDesc, 'Sitatgaten legges til som et direkte minne- og verksspor: 69 sitater fra Ibsens skuespill, dikt, brev og taler er felt ned i fortauet langs den daglige ruten hans mellom hjemmet og Grand Café.'),
  places: uniq([...collectRefs(record), 'ibsen_quotes']),
  source_urls: uniq([...(record.source_urls ?? []), 'https://oslobyleksikon.no/side/Sitatgaten']),
}));
results.push({ placeId: 'ibsen_quotes', people: ['henrik_ibsen'], mode: 'reuse' });

for (const artist of [
  {
    id: 'ingrid_falk',
    name: 'Ingrid Falk',
    initials: 'IF',
    desc: 'Kunstner og medskaper av Sitatgaten, der Ibsen-sitater er felt ned i Oslos fortau.',
  },
  {
    id: 'gustavo_aguerre',
    name: 'Gustavo Aguerre',
    initials: 'GA',
    desc: 'Kunstner og medskaper av Sitatgaten, også kjent som Sitat Ibsen eller Ibsenstien.',
  },
]) {
  const outcome = upsertNamed({
    id: artist.id,
    names: [artist.name],
    targetRelPath: `people/kunst/oslo/ibsen_quotes/${artist.id}.json`,
    createRecord: () => ({
      id: artist.id,
      name: artist.name,
      initials: artist.initials,
      desc: artist.desc,
      tags: ['kunst', 'offentlig_kunst', 'sitatkunst', 'ibsen', 'sitatgaten', 'oslo'],
      placeId: 'ibsen_quotes',
      category: 'kunst',
      year: 2008,
      popupDesc: `${artist.name} er et direkte personanker for Sitatgaten. Sammen med den andre halvparten av kunstnerduoen FA+ skapte ${artist.name} kunstverket med 69 Ibsen-sitater i sandblåst stål, nedfelt i fortauene mellom Ibsenmuseet og Grand Café.`,
      places: ['ibsen_quotes'],
      image: '',
      cardImage: '',
      source_urls: ['https://oslobyleksikon.no/side/Sitatgaten'],
    }),
    updateRecord: (record) => ({
      ...record,
      tags: uniq([...(record.tags ?? []), 'offentlig_kunst', 'sitatkunst', 'ibsen', 'sitatgaten']),
      popupDesc: addSentence(record.popupDesc, `${artist.name} var medskaper av Sitatgaten, kunstverket med 69 Ibsen-sitater i fortauet mellom Ibsenmuseet og Grand Café.`),
      places: uniq([...collectRefs(record), 'ibsen_quotes']),
      source_urls: uniq([...(record.source_urls ?? []), 'https://oslobyleksikon.no/side/Sitatgaten']),
    }),
  });
  results.push({ placeId: 'ibsen_quotes', people: [artist.id], mode: outcome.mode });
}

const ingerOutcome = upsertNamed({
  id: 'inger_hagerup',
  names: ['Inger Hagerup'],
  targetRelPath: 'people/litteratur/oslo/inger_hagerups_plass/inger_hagerup.json',
  createRecord: () => ({
    id: 'inger_hagerup',
    name: 'Inger Hagerup',
    initials: 'IH',
    desc: 'Lyriker og forfatter som bodde i Hagapynten og har fått plassen ved snuplassen oppkalt etter seg.',
    tags: ['litteratur', 'lyrikk', 'forfatter', 'inger_hagerups_plass', 'haugerud', 'alna'],
    placeId: 'inger_hagerups_plass',
    category: 'litteratur',
    year: 1999,
    popupDesc: 'Inger Hagerup er det direkte personankeret for Inger Hagerups plass. Plassen fikk navnet hennes i 1999, og Oslo byleksikon dokumenterer at forfatteren bodde i Hagapynten ved stedet.',
    places: ['inger_hagerups_plass'],
    image: '',
    cardImage: '',
    source_urls: ['https://oslobyleksikon.no/side/Inger_Hagerups_plass'],
  }),
  updateRecord: (record) => ({
    ...record,
    tags: uniq([...(record.tags ?? []), 'inger_hagerups_plass', 'haugerud', 'alna']),
    popupDesc: addSentence(record.popupDesc, 'Inger Hagerups plass fikk navnet hennes i 1999; forfatteren bodde i Hagapynten ved plassen.'),
    places: uniq([...collectRefs(record), 'inger_hagerups_plass']),
    source_urls: uniq([...(record.source_urls ?? []), 'https://oslobyleksikon.no/side/Inger_Hagerups_plass']),
  }),
});
results.push({ placeId: 'inger_hagerups_plass', people: ['inger_hagerup'], mode: ingerOutcome.mode });

const audOutcome = migrateUnlisted(
  'aud_schonemann',
  'people/popkultur/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d/aud_schonemann.json',
  (record) => ({
    ...record,
    desc: 'Skuespiller kjent fra norsk TV- og komediehistorie, minnet med blått skilt ved hjemstedet i Vetlandsveien 69D.',
    tags: uniq([...(record.tags ?? []), 'bla_skilt', 'aud_schonemann', 'vetlandsveien', 'minnested']),
    placeId: 'bla_skilt_aud_schonemann_vetlandsveien_69d',
    year: 2026,
    popupDesc: 'Aud Schønemann er det direkte personankeret for det blå skiltet i Vetlandsveien 69D. Oslo Byes Vel registrerte skiltet i mai 2026 som et fysisk minnespor etter skuespilleren på adressen.',
    places: ['bla_skilt_aud_schonemann_vetlandsveien_69d'],
    source_urls: uniq([...(record.source_urls ?? []), 'https://www.oslobyesvel.no/blaa-skilt-i-oslo']),
  }),
);
results.push({ placeId: 'bla_skilt_aud_schonemann_vetlandsveien_69d', people: ['aud_schonemann'], mode: audOutcome.mode });

const houseOutcome = migrateUnlisted(
  'house_of_nerds_miljoet',
  'people/popkultur/oslo/house_of_nerds/house_of_nerds_miljoet.json',
  (record) => ({
    ...record,
    tags: uniq([...(record.tags ?? []), 'kollektivt_miljoanker', 'house_of_nerds']),
    placeId: 'house_of_nerds',
    places: ['house_of_nerds'],
  }),
);
results.push({ placeId: 'house_of_nerds', people: ['house_of_nerds_miljoet'], mode: houseOutcome.mode });

const latterOutcome = migrateUnlisted(
  'latter_standupmiljoet',
  'people/popkultur/oslo/latter/latter_standupmiljoet.json',
  (record) => ({
    ...record,
    tags: uniq([...(record.tags ?? []), 'kollektivt_miljoanker', 'latter']),
    placeId: 'latter',
    places: ['latter'],
  }),
);
results.push({ placeId: 'latter', people: ['latter_standupmiljoet'], mode: latterOutcome.mode });

manifest.files = uniq(manifest.files);
writeJson(manifestPath, manifest);

let md = '# Oslo People zero-gap batch 1\n\n';
md += '## Mål\n\n';
md += 'Lukke seks direkte og dokumenterbare Oslo-hull uten å importere svake, generiske stedstilknytninger fra ulistede legacy-filer.\n\n';
md += '## Resultat\n\n';
for (const result of results) md += `- \`${result.placeId}\` → ${result.people.map((id) => `\`${id}\``).join(', ')} (${result.mode})\n`;
md += '\n## Kvalitetsgate\n\n';
md += '- Emanuel Vigeland og Henrik Ibsen gjenbrukes fra entydige manifest-loaded canonical records.\n';
md += '- Ingrid Falk, Gustavo Aguerre og Inger Hagerup opprettes eller gjenbrukes først etter repo-wide ID- og navneaudit.\n';
md += '- Aud Schønemann, House of Nerds-miljøet og Latter-standupmiljøet migreres enkeltvis ut av en ulistet legacy-fil; resten av den filen forblir ulastet.\n';
md += '- Bård Tufte Johansen, Harald Eia og individuelle Latter-komikere migreres ikke i denne batchen fordi de gamle begrunnelsene ikke dokumenterer en tilstrekkelig presis fysisk stedrolle.\n';
fs.writeFileSync(reportPath, md);

console.log(JSON.stringify({ results, manifestFiles: manifest.files.length }, null, 2));
