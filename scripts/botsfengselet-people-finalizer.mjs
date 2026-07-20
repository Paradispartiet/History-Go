#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PEOPLE_ROOT = path.join(ROOT, 'data/people');
const MANIFEST_FILE = path.join(PEOPLE_ROOT, 'manifest.json');
const SELF = path.join(ROOT, 'scripts/botsfengselet-people-finalizer.mjs');
const REPORT_FILE = path.join(ROOT, 'reports/people-botsfengselet-batch1-validation.md');
const PLACE_ID = 'botsfengselet';

const candidates = [
  {
    id: 'heinrich_ernst_schirmer',
    aliases: ['Heinrich Ernst Schirmer', 'Heinrich Schirmer', 'H. E. Schirmer'],
    name: 'Heinrich Ernst Schirmer',
    initials: 'HES',
    category: 'by',
    year: 1851,
    rel: 'people/by/oslo/botsfengselet/heinrich_ernst_schirmer.json',
    desc: 'Arkitekten bak Botsfengselet, det monumentale cellefengselet som åpnet på Grønland i 1851.',
    tags: ['by', 'arkitektur', 'fengselsarkitektur', 'botsfengselet', 'straffehistorie', '1800_tallet'],
    popupDesc: 'Heinrich Ernst Schirmer er et direkte personanker for Botsfengselet fordi han tegnet hovedanlegget som ble oppført på Åkebergløkka i 1840-årene og åpnet i 1851. Fengselets cellefløyer, sentralhall og isolasjonslogikk gjorde Philadelphia-systemets straffeideologi fysisk. Koblingen gjelder dermed et konkret arkitekturverk, ikke en generell tilknytning til Grønland eller norsk fengselshistorie.',
    relationSentence: 'Botsfengselet legges til som en direkte stedstilknytning fordi Schirmer tegnet hovedanlegget som ble oppført i 1840-årene og åpnet i 1851.',
    sourceUrls: ['https://snl.no/Botsfengselet', 'https://snl.no/Heinrich_Ernst_Schirmer']
  },
  {
    id: 'jacob_wilhelm_nordan',
    aliases: ['Jacob Wilhelm Nordan', 'J. W. Nordan', 'Jacob Nordan'],
    name: 'Jacob Wilhelm Nordan',
    initials: 'JWN',
    category: 'by',
    year: 1886,
    rel: 'people/by/oslo/botsfengselet/jacob_wilhelm_nordan.json',
    desc: 'Arkitekt bak Botsfengselets fengselskirke, et kirkerom tilpasset isolasjonssystemet i 1880-årene.',
    tags: ['by', 'arkitektur', 'fengselsarkitektur', 'kirkearkitektur', 'botsfengselet', '1800_tallet'],
    popupDesc: 'Jacob Wilhelm Nordan er et direkte personanker for Botsfengselet gjennom fengselskirken han tegnet i 1880-årene. Kirkerommet var utformet slik at de innsatte kunne holdes adskilt også under gudstjenesten. Nordans arbeid er derfor et konkret arkitektonisk spor etter hvordan isolasjonsregimet formet institusjonens fysiske rom.',
    relationSentence: 'Botsfengselet legges til som en direkte stedstilknytning fordi Nordan tegnet fengselskirken som ble oppført i 1880-årene.',
    sourceUrls: ['https://snl.no/Botsfengselet', 'https://snl.no/Jacob_Wilhelm_Nordan']
  },
  {
    id: 'paul_magnus_norum',
    aliases: ['Paul Magnus Norum', 'Poul Magnus Norum', 'P.M. Norum', 'P. M. Norum'],
    name: 'Paul Magnus Norum',
    initials: 'PMN',
    category: 'historie',
    year: 1851,
    rel: 'people/historie/oslo/botsfengselet/paul_magnus_norum.json',
    desc: 'Botsfengselets første direktør, som senere kritiserte den strenge isolasjonen som ble gjennomført under etterfølgeren.',
    tags: ['historie', 'fengselshistorie', 'straffehistorie', 'botsfengselet', 'institusjonshistorie', '1800_tallet'],
    popupDesc: 'Paul Magnus Norum er et direkte personanker for Botsfengselet som anstaltens første direktør. Han tillot blant annet former for fellesskap som senere ble strammet kraftig inn, og tok avstand fra den strengere isolasjonspraksisen under etterfølgeren Richard Petersen. Koblingen gjør Botsfengselet lesbart som en institusjon der ledelsesvalg fikk direkte betydning for de innsattes hverdag.',
    relationSentence: 'Botsfengselet legges til som en direkte stedstilknytning fordi Norum var anstaltens første direktør og senere kritiserte den strenge isolasjonspraksisen.',
    sourceUrls: ['https://snl.no/Botsfengselet']
  },
  {
    id: 'richard_petersen_fengselsdirektor',
    aliases: ['Richard Petersen'],
    name: 'Richard Petersen',
    initials: 'RP',
    category: 'historie',
    year: 1858,
    rel: 'people/historie/oslo/botsfengselet/richard_petersen_fengselsdirektor.json',
    desc: 'Fengselsdirektør ved Botsfengselet 1858–1892, kjent for en svært streng gjennomføring av isolasjonssystemet.',
    tags: ['historie', 'fengselshistorie', 'straffehistorie', 'botsfengselet', 'institusjonshistorie', 'isolasjon', '1800_tallet'],
    popupDesc: 'Richard Petersen er et direkte personanker for Botsfengselet fordi han var direktør fra 1858 til 1892 og gjennomførte Philadelphia-systemets isolasjonsprinsipper svært strengt. I History Go brukes Petersen som en kritisk inngang til hvordan institusjonsledelse kunne gjøre fengselsarkitekturen til et system for omfattende sosial isolasjon.',
    relationSentence: 'Botsfengselet legges til som en direkte stedstilknytning fordi Petersen var fengselsdirektør der fra 1858 til 1892.',
    sourceUrls: ['https://snl.no/Botsfengselet', 'https://rhd.uit.no/folketellinger/ftliste.aspx?bnr=1392&ft=1865&kenr=1467&knr=0301']
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
    if (!currentPopup.toLowerCase().includes('botsfengselet')) {
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
  ? preExistingAnchors.map(({ person, file }) => `- \`${person.id}\` — eksisterende Botsfengselet-anker i \`${path.relative(ROOT, file)}\``).join('\n')
  : '- Ingen eksisterende ankere funnet ved kjøring.';
const actionLines = actions.map((row) => `- \`${row.id}\` — **${row.action}** — \`${row.file}\``).join('\n');
const report = `# Botsfengselet people batch 1 validation\n\nDato: 2026-07-20\n\n## Eksisterende dekning før batchen\n\n${existingLines}\n\nKarl «Sving Deg» Rognstad-koblingen beholdes dersom den er til stede. Den er dokumentert som fysisk opptreden i Botsfengselets luftegård og gjør denne jobben til en coverage-utvidelse.\n\n## Canonical audit og handlinger\n\n${actionLines}\n\n## Streng stedsgate\n\n- Heinrich Ernst Schirmer: arkitekt for hovedanlegget som åpnet i 1851.\n- Jacob Wilhelm Nordan: arkitekt for fengselskirken i 1880-årene.\n- Paul Magnus Norum: Botsfengselets første direktør.\n- Richard Petersen: direktør fra 1858 til 1892.\n\nAlle nye koblinger gjelder konkret bygging eller ledelse i Botsfengselet. Ingen generell norsk straffereform-assosiasjon er nok.\n\n## Kilder\n\n- Store norske leksikon: Botsfengselet.\n- Store norske leksikon / Norsk biografisk leksikon: Heinrich Ernst Schirmer og Jacob Wilhelm Nordan.\n- Historisk befolkningsregister: Richard Petersen ved Bodsfængslet i 1865.\n\n## Runtime-gater\n\nMaterializeren registrerer eksisterende Botsfengselet-ankere uten å slette dem og stopper ved tvetydig canonical match. Nye personer opprettes bare når ingen canonical match finnes; ellers oppdateres eksisterende person. Etter materialisering skal repoets ordinære People- og Places-gater passere.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

fs.unlinkSync(SELF);
console.log(JSON.stringify({
  placeId: PLACE_ID,
  preExistingAnchors: preExistingAnchors.map(({ person, file }) => ({ id: person.id, file: path.relative(ROOT, file) })),
  actions
}, null, 2));
