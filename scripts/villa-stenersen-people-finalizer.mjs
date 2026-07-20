#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PEOPLE_ROOT = path.join(ROOT, 'data/people');
const MANIFEST_FILE = path.join(PEOPLE_ROOT, 'manifest.json');
const SELF = path.join(ROOT, 'scripts/villa-stenersen-people-finalizer.mjs');
const REPORT_FILE = path.join(ROOT, 'reports/people-villa-stenersen-batch1-validation.md');
const PLACE_ID = 'villa_stenersen';

const candidates = [
  {
    id: 'arne_korsmo',
    aliases: ['Arne Korsmo'],
    name: 'Arne Korsmo',
    initials: 'AK',
    category: 'by',
    year: 1939,
    rel: 'people/by/oslo/villa_stenersen/arne_korsmo.json',
    desc: 'Arkitekten bak Villa Stenersen, et hovedverk i norsk funksjonalisme og internasjonal modernisme.',
    tags: ['by', 'arkitektur', 'modernisme', 'funksjonalisme', 'villa_stenersen', '1930_tallet'],
    popupDesc: 'Arne Korsmo er et direkte personanker for Villa Stenersen fordi han tegnet huset på oppdrag fra Rolf Stenersen og familien. Villaen stod ferdig i 1939 og regnes som et av Korsmos hovedverk og et sentralt eksempel på internasjonal modernisme i Norge. Koblingen gjelder dermed et konkret arkitekturverk, ikke en generell tilknytning til norsk funksjonalisme.',
    relationSentence: 'Villa Stenersen legges til som en direkte stedstilknytning fordi Korsmo tegnet huset for Rolf Stenersen og familien, ferdigstilt i 1939.',
    sourceUrls: ['https://www.riksantikvaren.no/fredninger/villa-stenersen-pa-vindern-i-oslo-er-fredet/', 'https://www.nasjonalmuseet.no/samlingen/objekt/NMK.2016.0063.002.077']
  },
  {
    id: 'rolf_stenersen',
    aliases: ['Rolf Stenersen', 'Rolf E. Stenersen', 'Rolf Erling Stenersen'],
    name: 'Rolf Stenersen',
    initials: 'RS',
    category: 'kunst',
    year: 1939,
    rel: 'people/kunst/oslo/villa_stenersen/rolf_stenersen.json',
    desc: 'Finansmann, forfatter og kunstsamler som bestilte Villa Stenersen og lot huset utformes i samspill med kunstsamlingen sin.',
    tags: ['kunst', 'kunstsamling', 'modernisme', 'villa_stenersen', 'oppdragsgiver', '1930_tallet'],
    popupDesc: 'Rolf Stenersen er et direkte personanker for Villa Stenersen som husets oppdragsgiver, eier og kunstsamler. Nasjonalmuseet registrerer ham som oppdragsgiver for Korsmos tegninger, og Riksantikvaren beskriver villaen som tegnet for Stenersen og familien. Husets rom og lyssetting ble utviklet i tett samspill med den store kunstsamlingen hans. Koblingen gjelder derfor selve huset og dets opprinnelige funksjon som bolig og kunstsamlerhjem.',
    relationSentence: 'Villa Stenersen legges til som en direkte stedstilknytning fordi Stenersen bestilte huset, bodde der med familien og lot arkitekturen utformes i samspill med kunstsamlingen sin.',
    sourceUrls: ['https://www.riksantikvaren.no/fredninger/villa-stenersen-pa-vindern-i-oslo-er-fredet/', 'https://www.nasjonalmuseet.no/samlingen/objekt/NMK.2016.0063.002.077']
  }
];

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
function normalizeName(value = '') {
  return String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function personList(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string') return [parsed];
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.people)) return parsed.people;
  return [];
}

const jsonFiles = walk(PEOPLE_ROOT).filter((file) => file.endsWith('.json') && file !== MANIFEST_FILE);
const states = new Map();
const allPeople = [];
for (const file of jsonFiles) {
  let parsed;
  try { parsed = readJson(file); } catch { continue; }
  const list = personList(parsed).filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  states.set(file, { parsed, dirty: false });
  for (const person of list) allPeople.push({ file, person });
}

const preExistingAnchors = allPeople.filter(({ person }) =>
  person.placeId === PLACE_ID || (Array.isArray(person.places) && person.places.includes(PLACE_ID))
);
const manifest = readJson(MANIFEST_FILE);
if (!Array.isArray(manifest.files)) throw new Error('data/people/manifest.json must contain files[]');
const actions = [];

for (const candidate of candidates) {
  const normalizedAliases = new Set(candidate.aliases.map(normalizeName));
  const matches = allPeople.filter(({ person }) => person.id === candidate.id || normalizedAliases.has(normalizeName(person.name)));
  const uniqueMatches = Array.from(new Map(matches.map((match) => [`${match.file}::${match.person.id}`, match])).values());
  if (uniqueMatches.length > 1) {
    throw new Error(`Ambiguous canonical match for ${candidate.name}: ${uniqueMatches.map(({ person, file }) => `${person.id}@${path.relative(ROOT, file)}`).join(', ')}`);
  }
  if (uniqueMatches.length === 1) {
    const { file, person } = uniqueMatches[0];
    const state = states.get(file);
    person.places = Array.from(new Set([...(person.places ?? []), PLACE_ID]));
    person.tags = Array.from(new Set([...(person.tags ?? []), ...candidate.tags]));
    person.source_urls = Array.from(new Set([...(person.source_urls ?? []), ...candidate.sourceUrls]));
    const currentPopup = String(person.popupDesc ?? '').trim();
    if (!currentPopup.toLowerCase().includes('villa stenersen')) {
      person.popupDesc = `${currentPopup}${currentPopup ? ' ' : ''}${candidate.relationSentence}`;
    }
    state.dirty = true;
    actions.push({ id: person.id, name: person.name, action: 'updated_existing', file: path.relative(ROOT, file) });
    continue;
  }
  const outFile = path.join(ROOT, 'data', candidate.rel);
  if (fs.existsSync(outFile)) throw new Error(`${candidate.rel} already exists without a canonical scan match`);
  writeJson(outFile, [{
    id: candidate.id,
    name: candidate.name,
    initials: candidate.initials,
    desc: candidate.desc,
    tags: candidate.tags,
    placeId: PLACE_ID,
    category: candidate.category,
    year: candidate.year,
    popupDesc: candidate.popupDesc,
    places: [PLACE_ID],
    image: '',
    cardImage: '',
    source_urls: candidate.sourceUrls
  }]);
  if (manifest.files.includes(candidate.rel)) throw new Error(`${candidate.rel} already registered without a file`);
  manifest.files.push(candidate.rel);
  actions.push({ id: candidate.id, name: candidate.name, action: 'created_new', file: candidate.rel });
}

for (const [file, state] of states) if (state.dirty) writeJson(file, state.parsed);
writeJson(MANIFEST_FILE, manifest);

const existingLines = preExistingAnchors.length
  ? preExistingAnchors.map(({ person, file }) => `- \`${person.id}\` — eksisterende Villa Stenersen-anker i \`${path.relative(ROOT, file)}\``).join('\n')
  : '- Ingen eksisterende people-ankere funnet ved materialisering.';
const actionLines = actions.map((row) => `- \`${row.id}\` — **${row.action}** — \`${row.file}\``).join('\n');
const report = `# Villa Stenersen people batch 1 validation\n\nDato: 2026-07-20\n\n## Eksisterende dekning før batchen\n\n${existingLines}\n\n## Canonical audit og handlinger\n\n${actionLines}\n\n## Streng stedsgate\n\n- Arne Korsmo: dokumentert arkitekt for selve Villa Stenersen.\n- Rolf Stenersen: dokumentert oppdragsgiver, eier og kunstsamler; huset ble tegnet for ham og familien.\n\nBegge koblingene gjelder selve huset. Odvar Nordlis korte botid er bevisst ikke tatt inn i denne kjernebatches første pass.\n\n## Kilder\n\n- Riksantikvaren: fredningen av Villa Stenersen.\n- Nasjonalmuseet: Villa Stenersen-tegninger med Arne Korsmo som arkitekt og Rolf Stenersen som oppdragsgiver.\n\n## Runtime-gater\n\nMaterializeren stopper ved tvetydig canonical match. Nye personer opprettes bare når ingen canonical match finnes; ellers oppdateres eksisterende person. Etter materialisering regenereres Civication history people index og repoets ordinære People- og Places-gater skal passere.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');
fs.unlinkSync(SELF);
console.log(JSON.stringify({ placeId: PLACE_ID, preExistingAnchors: preExistingAnchors.map(({ person, file }) => ({ id: person.id, file: path.relative(ROOT, file) })), actions }, null, 2));
