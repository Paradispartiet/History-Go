#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PEOPLE_ROOT = path.join(ROOT, 'data/people');
const MANIFEST_FILE = path.join(PEOPLE_ROOT, 'manifest.json');
const SELF = path.join(ROOT, 'scripts/gamle-aker-kirke-people-finalizer.mjs');
const REPORT_FILE = path.join(ROOT, 'reports/people-gamle-aker-kirke-batch1-validation.md');
const PLACE_ID = 'gamle_aker_kirke';

const candidates = [
  {
    id: 'heinrich_ernst_schirmer',
    aliases: ['Heinrich Ernst Schirmer', 'Heinrich Schirmer', 'H. E. Schirmer'],
    name: 'Heinrich Ernst Schirmer',
    initials: 'HES',
    category: 'by',
    year: 1861,
    rel: 'people/by/oslo/gamle_aker_kirke/heinrich_ernst_schirmer.json',
    desc: 'Arkitekt som sammen med Wilhelm von Hanno restaurerte Gamle Aker kirke og ga kirken nytt eksteriør og tårn i 1861.',
    tags: ['by', 'arkitektur', 'kulturminnevern', 'gamle_aker_kirke', 'restaurering', '1800_tallet'],
    popupDesc: 'Heinrich Ernst Schirmer er et direkte personanker for Gamle Aker kirke gjennom restaureringen som han utførte sammen med Wilhelm von Hanno. Arbeidet ble avsluttet i 1861 og omfattet kirkens eksteriør og tårn. Koblingen gjelder dermed konkret arbeid på den fysiske middelalderkirken, ikke en generell tilknytning til Oslo eller norsk arkitektur.',
    relationSentence: 'Gamle Aker kirke legges til som en direkte stedstilknytning fordi Schirmer sammen med Wilhelm von Hanno restaurerte kirkens eksteriør og tårn fram mot 1861.',
    sourceUrls: ['https://www.pilegrimsleden.no/en/interest-points/gamle-aker-kirke']
  },
  {
    id: 'wilhelm_von_hanno',
    aliases: ['Wilhelm von Hanno', 'W. von Hanno'],
    name: 'Wilhelm von Hanno',
    initials: 'WVH',
    category: 'by',
    year: 1861,
    rel: 'people/by/oslo/gamle_aker_kirke/wilhelm_von_hanno.json',
    desc: 'Arkitekt som sammen med Heinrich Ernst Schirmer restaurerte Gamle Aker kirke og ga kirken nytt eksteriør og tårn i 1861.',
    tags: ['by', 'arkitektur', 'kulturminnevern', 'gamle_aker_kirke', 'restaurering', '1800_tallet'],
    popupDesc: 'Wilhelm von Hanno er et direkte personanker for Gamle Aker kirke gjennom restaureringen som han utførte sammen med Heinrich Ernst Schirmer. Arbeidet ble avsluttet i 1861 og omfattet kirkens eksteriør og tårn. Koblingen gjelder dermed konkret arbeid på den fysiske middelalderkirken, ikke en generell tilknytning til Oslo eller norsk arkitektur.',
    relationSentence: 'Gamle Aker kirke legges til som en direkte stedstilknytning fordi von Hanno sammen med Heinrich Ernst Schirmer restaurerte kirkens eksteriør og tårn fram mot 1861.',
    sourceUrls: ['https://www.pilegrimsleden.no/en/interest-points/gamle-aker-kirke']
  },
  {
    id: 'torvald_moseid',
    aliases: ['Torvald Moseid', 'Thorvald Moseid'],
    name: 'Torvald Moseid',
    initials: 'TM',
    category: 'kunst',
    year: 1955,
    rel: 'people/kunst/oslo/gamle_aker_kirke/torvald_moseid.json',
    desc: 'Billedkunstner og kunsthåndverker som utførte glassmaleriet i Gamle Aker kirke i 1955.',
    tags: ['kunst', 'glassmaleri', 'kirkekunst', 'gamle_aker_kirke', 'etterkrigstid'],
    popupDesc: 'Torvald Moseid er et direkte personanker for Gamle Aker kirke gjennom glassmaleriet han utførte for kirken i 1955. Verket sitter i selve kirkerommet og gjør hans tilknytning fysisk og stedsspesifikk. I History Go brukes han derfor som inngang til etterkrigstidens kunstneriske lag i en middelalderbygning som har blitt endret og utsmykket gjennom mange hundre år.',
    relationSentence: 'Gamle Aker kirke legges til som en direkte stedstilknytning fordi Moseid utførte kirkens glassmaleri i 1955.',
    sourceUrls: ['https://nkl.snl.no/Torvald_Moseid', 'https://snl.no/Gamle_Aker_kirke']
  }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

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
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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
  try {
    parsed = readJson(file);
  } catch {
    continue;
  }
  const list = personList(parsed).filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  states.set(file, { parsed, list, dirty: false });
  for (const person of list) allPeople.push({ file, person });
}

const existingPlaceAnchors = allPeople.filter(({ person }) =>
  person.placeId === PLACE_ID || (Array.isArray(person.places) && person.places.includes(PLACE_ID))
);
if (existingPlaceAnchors.length > 0) {
  throw new Error(`Gamle Aker kirke is no longer zero-coverage: ${existingPlaceAnchors.map(({ person, file }) => `${person.id}@${path.relative(ROOT, file)}`).join(', ')}`);
}

const manifest = readJson(MANIFEST_FILE);
if (!Array.isArray(manifest.files)) throw new Error('data/people/manifest.json must contain files[]');
const actions = [];

for (const candidate of candidates) {
  const normalizedAliases = new Set(candidate.aliases.map(normalizeName));
  const matches = allPeople.filter(({ person }) =>
    person.id === candidate.id || normalizedAliases.has(normalizeName(person.name))
  );
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
    if (!currentPopup.toLowerCase().includes('gamle aker kirke')) {
      person.popupDesc = `${currentPopup}${currentPopup ? ' ' : ''}${candidate.relationSentence}`;
    }
    state.dirty = true;
    actions.push({ id: person.id, name: person.name, action: 'updated_existing', file: path.relative(ROOT, file) });
    continue;
  }

  const outFile = path.join(ROOT, 'data', candidate.rel);
  if (fs.existsSync(outFile)) throw new Error(`${candidate.rel} already exists without a canonical scan match`);
  const record = [{
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
  }];
  writeJson(outFile, record);
  if (manifest.files.includes(candidate.rel)) throw new Error(`${candidate.rel} already registered without a file`);
  manifest.files.push(candidate.rel);
  actions.push({ id: candidate.id, name: candidate.name, action: 'created_new', file: candidate.rel });
}

for (const [file, state] of states) {
  if (state.dirty) writeJson(file, state.parsed);
}
writeJson(MANIFEST_FILE, manifest);

const actionLines = actions.map((row) => `- \`${row.id}\` — **${row.action}** — \`${row.file}\``).join('\n');
const report = `# Gamle Aker kirke people batch 1 validation\n\nDato: 2026-07-20\n\n## Canonical audit og handlinger\n\n${actionLines}\n\n## Streng stedsgate\n\n- Heinrich Ernst Schirmer og Wilhelm von Hanno: dokumentert restaurering av kirkens eksteriør og tårn fram mot 1861.\n- Torvald Moseid: dokumentert glassmaleri i Gamle Aker kirke fra 1955.\n\nAlle tre koblingene gjelder konkret arbeid på eller i den fysiske kirken. Generelle Oslo-, kirkekunst- eller arkitekturassosiasjoner er ikke nok.\n\n## Bevisst utsatt kandidat\n\nThomas Blix er ikke med i denne batchen. Kildene er enige om en direkte inventarkobling, men spriker om dateringen av prekestol/døpefont (1715/1725). Personen kan tas i en senere batch etter en egen kildeavklaring, uten at denne batchen låser inn en usikker datering.\n\n## Kilder\n\n- Pilegrimsleden / St. Hanshaugen sokn: restaureringen ved Schirmer og von Hanno.\n- Norsk kunstnerleksikon / Store norske leksikon: Torvald Moseids glassmaleri fra 1955.\n- St. Hanshaugen sokn og Norsk biografisk leksikon ble sammenlignet for Thomas Blix-dateringen.\n\n## Runtime-gater\n\nMaterializer stopper dersom \`${PLACE_ID}\` allerede har en people-lenke på fersk main, eller dersom en kandidat matcher mer enn én canonical record. Etter materialisering skal repoets ordinære People- og Places-gater passere.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

fs.unlinkSync(SELF);
console.log(JSON.stringify({ placeId: PLACE_ID, actions }, null, 2));
