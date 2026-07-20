#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PEOPLE_ROOT = path.join(ROOT, 'data/people');
const MANIFEST_FILE = path.join(PEOPLE_ROOT, 'manifest.json');
const SELF = path.join(ROOT, 'scripts/st-hallvard-kirke-kloster-people-finalizer.mjs');
const REPORT_FILE = path.join(ROOT, 'reports/people-st-hallvard-kirke-kloster-batch1-validation.md');
const PLACE_ID = 'st_hallvard_kirke_kloster';

const candidates = [
  {
    id: 'kjell_lund',
    aliases: ['Kjell Lund', 'Kjell Arve Lund'],
    name: 'Kjell Lund',
    initials: 'KL',
    category: 'by',
    year: 1966,
    rel: 'people/by/oslo/st_hallvard_kirke_kloster/kjell_lund.json',
    desc: 'Arkitekt og medskaper av St. Hallvard kirke og kloster, et hovedverk i norsk etterkrigsmodernisme.',
    tags: ['by', 'arkitektur', 'modernisme', 'st_hallvard_kirke_kloster', 'kirkearkitektur', 'etterkrigstid'],
    popupDesc: 'Kjell Lund er et direkte personanker for St. Hallvard kirke og kloster fordi han sammen med Nils Slaatto tegnet anlegget på Enerhaugen. Prosjekteringen startet i 1959 og kirken ble innviet i 1966. Den karakteristiske omvendte betongkuppelen og det kompakte teglanlegget gjorde bygget til et hovedverk i norsk etterkrigsarkitektur. Koblingen gjelder derfor et konkret, fysisk hovedverk i Lunds arkitektvirke.',
    relationSentence: 'St. Hallvard kirke og kloster legges til som en direkte stedstilknytning fordi Lund sammen med Nils Slaatto tegnet anlegget som ble innviet i 1966.',
    sourceUrls: ['https://www.riksantikvaren.no/fredninger/st-hallvard-kirke-i-oslo-fredet/', 'https://snl.no/St._Hallvard_kirke_og_kloster', 'https://nbl.snl.no/Kjell_Lund']
  },
  {
    id: 'nils_slaatto',
    aliases: ['Nils Slaatto', 'Nils T. Slaatto'],
    name: 'Nils Slaatto',
    initials: 'NS',
    category: 'by',
    year: 1966,
    rel: 'people/by/oslo/st_hallvard_kirke_kloster/nils_slaatto.json',
    desc: 'Arkitekt og medskaper av St. Hallvard kirke og kloster, et hovedverk i norsk etterkrigsmodernisme.',
    tags: ['by', 'arkitektur', 'modernisme', 'st_hallvard_kirke_kloster', 'kirkearkitektur', 'etterkrigstid'],
    popupDesc: 'Nils Slaatto er et direkte personanker for St. Hallvard kirke og kloster fordi han sammen med Kjell Lund tegnet anlegget på Enerhaugen. Kirken og klosteret ble utviklet som en samlet modernistisk komposisjon og innviet i 1966. Koblingen gjelder dermed et konkret hovedverk i Lund og Slaattos felles arkitektpraksis, ikke en generell tilknytning til norsk modernisme.',
    relationSentence: 'St. Hallvard kirke og kloster legges til som en direkte stedstilknytning fordi Slaatto sammen med Kjell Lund tegnet anlegget som ble innviet i 1966.',
    sourceUrls: ['https://www.riksantikvaren.no/fredninger/st-hallvard-kirke-i-oslo-fredet/', 'https://snl.no/St._Hallvard_kirke_og_kloster', 'https://nkl.snl.no/Nils_Slaatto']
  },
  {
    id: 'johan_castricum',
    aliases: ['Johan Castricum', 'Johan C. H. Castricum', 'pater Johan Castricum', 'pater Castricum'],
    name: 'Johan Castricum',
    initials: 'JC',
    category: 'historie',
    year: 1966,
    rel: 'people/historie/oslo/st_hallvard_kirke_kloster/johan_castricum.json',
    desc: 'Fransiskanerprest, sogneprest og sentral pådriver for oppføringen av St. Hallvard kirke og kloster på Enerhaugen.',
    tags: ['historie', 'katolsk_historie', 'fransiskanere', 'st_hallvard_kirke_kloster', 'institusjonshistorie', 'etterkrigstid'],
    popupDesc: 'Johan Castricum er et direkte personanker for St. Hallvard kirke og kloster som sogneprest og pådriver for prosjektet. Store norske leksikon beskriver hvordan Castricum og arkitekten Kjell Lund møttes gjennom et seminar om sakralarkitektur og inngikk et samarbeid om å bygge klosteret på Enerhaugen. Den katolske kirkes egen menighetshistorie omtaler ham også som sogneprest og pådriver. Koblingen gjelder dermed den konkrete etableringen av anlegget, ikke en generell katolsk tilknytning.',
    relationSentence: 'St. Hallvard kirke og kloster legges til som en direkte stedstilknytning fordi Castricum var sogneprest og dokumentert pådriver for oppføringen av anlegget på Enerhaugen.',
    sourceUrls: ['https://snl.no/St._Hallvard_kirke_og_kloster', 'https://www.katolsk.no/organisasjon/okb/Oslo/Hallvard/broenserie']
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
    if (!currentPopup.toLowerCase().includes('st. hallvard kirke')) {
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

for (const [file, state] of states) {
  if (state.dirty) writeJson(file, state.parsed);
}
writeJson(MANIFEST_FILE, manifest);

const existingLines = preExistingAnchors.length
  ? preExistingAnchors.map(({ person, file }) => `- \`${person.id}\` — eksisterende St. Hallvard-anker i \`${path.relative(ROOT, file)}\``).join('\n')
  : '- Ingen eksisterende people-ankere funnet ved materialisering.';
const actionLines = actions.map((row) => `- \`${row.id}\` — **${row.action}** — \`${row.file}\``).join('\n');
const report = `# St. Hallvard kirke og kloster people batch 1 validation\n\nDato: 2026-07-20\n\n## Eksisterende dekning før batchen\n\n${existingLines}\n\n## Canonical audit og handlinger\n\n${actionLines}\n\n## Streng stedsgate\n\n- Kjell Lund og Nils Slaatto: dokumenterte arkitekter for selve kirke- og klosteranlegget.\n- Johan Castricum: dokumentert sogneprest og pådriver for prosjektet; SNL beskriver det konkrete samarbeidet med Kjell Lund om å bygge klosteret på Enerhaugen.\n\nAlle koblingene gjelder den konkrete etableringen eller utformingen av det fysiske anlegget. Generelle arkitektur- eller katolisismeassosiasjoner er ikke tilstrekkelige.\n\n## Kilder\n\n- Riksantikvaren: fredningen av St. Hallvard kirke og kloster.\n- Store norske leksikon: St. Hallvard kirke og kloster.\n- Den katolske kirke: St. Hallvard menighets historie.\n- Norsk biografisk leksikon / Norsk kunstnerleksikon: Kjell Lund og Nils Slaatto.\n\n## Runtime-gater\n\nMaterializeren stopper ved tvetydig canonical match. Nye personer opprettes bare når ingen canonical match finnes; ellers oppdateres eksisterende person i place-listen. Etter materialisering regenereres Civication history people index og repoets ordinære People- og Places-gater skal passere.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

fs.unlinkSync(SELF);
console.log(JSON.stringify({
  placeId: PLACE_ID,
  preExistingAnchors: preExistingAnchors.map(({ person, file }) => ({ id: person.id, file: path.relative(ROOT, file) })),
  actions
}, null, 2));
