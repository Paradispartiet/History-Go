import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file: string, value: unknown) => {
  const slash = file.lastIndexOf('/');
  if (slash !== -1) fs.mkdirSync(file.slice(0, slash), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const run = (command: string, args: string[]) => execFileSync(command, args, { stdio: 'inherit' });
const unique = <T>(values: T[]) => [...new Set(values)];

run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
const baseline = readJson('reports/oslo-people-coverage.json');
const before = baseline.totals;

const targetPlaceIds = [
  'tullin',
  'alexander_kiellands_plass',
  'honse_lovisas_hus',
  'framtidsbiblioteket_nordmarka',
  'roseslottet',
  'frammuseet'
];
const baselineUncovered = new Set((baseline.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (!baselineUncovered.has(placeId)) throw new Error(`Target place is not uncovered at baseline: ${placeId}`);
}

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };
const newManifestEntries = [
  'people/by/oslo/tullin/claus_tullin.json',
  'people/litteratur/oslo/alexander_kiellands_plass/alexander_lange_kielland.json',
  'people/kunst/oslo/framtidsbiblioteket_nordmarka/katie_paterson.json',
  'people/kunst/oslo/roseslottet/vebjorn_sand.json',
  'people/kunst/oslo/roseslottet/eimund_sand.json',
  'people/historie/oslo/frammuseet/otto_sverdrup.json',
  'people/historie/oslo/frammuseet/colin_archer.json'
];
for (const entry of newManifestEntries) {
  if (manifest.files.includes(entry)) throw new Error(`Manifest entry already exists: ${entry}`);
  manifest.files.push(entry);
}
writeJson(manifestPath, manifest);

writeJson('data/people/by/oslo/tullin/claus_tullin.json', [
  {
    id: 'claus_tullin',
    name: 'Claus Tullin',
    initials: 'CT',
    desc: 'Kjøpmannen og hoffintendanten som Tullinløkka har navn etter.',
    tags: ['by', 'eponym', 'tullin', 'tullinlokka', 'ruselokka', '1800_tallet'],
    placeId: 'tullin',
    category: 'by',
    year: 1807,
    popupDesc: 'Claus Tullin er det direkte personankeret for History Go-stedet Tullin, som er geografisk forankret i Tullinløkka. Han ble eier av Ruseløkken i 1807, og løkka som senere ble skilt ut fikk navn etter ham. Faren Christian Braunmann Tullin knyttes ikke til dette stedet: det er Tullins gate som er oppkalt etter dikteren.',
    places: ['tullin'],
    image: '',
    cardImage: '',
    source_urls: ['https://oslobyleksikon.no/side/Tullinl%C3%B8kka'],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/litteratur/oslo/alexander_kiellands_plass/alexander_lange_kielland.json', [
  {
    id: 'alexander_lange_kielland',
    name: 'Alexander Lange Kielland',
    initials: 'ALK',
    desc: 'Forfatteren som Alexander Kiellands plass ble oppkalt etter i 1914.',
    tags: ['litteratur', 'forfatter', 'realisme', 'eponym', 'alexander_kiellands_plass', 'minnekultur'],
    placeId: 'alexander_kiellands_plass',
    category: 'litteratur',
    year: 1914,
    popupDesc: 'Alexander Lange Kielland er det direkte litterære personankeret for plassen som fikk hans navn i 1914. Den konkrete byparken gjør forfatterens navn til en del av Oslos offentlige minnekultur, selv om Kiellands eget liv og hovedvirke ikke var knyttet til denne parken.',
    places: ['alexander_kiellands_plass'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://oslobyleksikon.no/side/Alexander_Kiellands_plass',
      'https://snl.no/Alexander_L._Kielland'
    ],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/kunst/oslo/framtidsbiblioteket_nordmarka/katie_paterson.json', [
  {
    id: 'katie_paterson',
    name: 'Katie Paterson',
    initials: 'KP',
    desc: 'Kunstneren som skapte Framtidsbiblioteket i Nordmarka.',
    tags: ['kunst', 'konseptkunst', 'framtidsbiblioteket', 'nordmarka', 'tid', 'skog', 'litteratur'],
    placeId: 'framtidsbiblioteket_nordmarka',
    category: 'kunst',
    year: 2014,
    popupDesc: 'Katie Paterson utviklet Framtidsbiblioteket som et hundreårig offentlig kunstverk i Oslo. I 2014 ble tusen grantrær plantet i Nordmarka; hvert år leverer en forfatter et hemmelig manuskript, og tekstene skal først trykkes i 2114 på papir fra skogen. Koblingen gjelder Patersons konkrete verk og den fysiske skogen som er canonical place.',
    places: ['framtidsbiblioteket_nordmarka'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://katiepaterson.org/now/future-library/',
      'https://www.oslo.kommune.no/get-file/1055127/'
    ],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/kunst/oslo/roseslottet/vebjorn_sand.json', [
  {
    id: 'vebjorn_sand',
    name: 'Vebjørn Sand',
    initials: 'VS',
    desc: 'Kunstner og medskaper av Roseslottet ved Frognerseteren.',
    tags: ['kunst', 'maleri', 'installasjon', 'roseslottet', 'andre_verdenskrig', 'demokrati', 'minnekultur'],
    placeId: 'roseslottet',
    category: 'kunst',
    year: 2020,
    popupDesc: 'Vebjørn Sand skapte Roseslottet sammen med broren Eimund Sand. Han står særlig bak en stor del av maleriene og møtene med tidsvitner som danner kunstinstallasjonens fortelling om okkupasjon, motstand, frihet og menneskeverd. Koblingen gjelder både kunstverkene og hans kunstneriske ansvar på det konkrete stedet.',
    places: ['roseslottet'],
    image: '',
    cardImage: '',
    source_urls: ['https://roseslottet.no/kort-om-roseslottet/'],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/kunst/oslo/roseslottet/eimund_sand.json', [
  {
    id: 'eimund_sand',
    name: 'Eimund Sand',
    initials: 'ES',
    desc: 'Kunstner og medskaper av Roseslottet ved Frognerseteren.',
    tags: ['kunst', 'geometri', 'installasjon', 'roseslottet', 'andre_verdenskrig', 'demokrati', 'minnekultur'],
    placeId: 'roseslottet',
    category: 'kunst',
    year: 2020,
    popupDesc: 'Eimund Sand skapte Roseslottet sammen med broren Vebjørn Sand. Hans geometriske installasjoner og monumentale former er en fysisk hoveddel av anlegget, blant annet i samspillet mellom gullseilene, stjernene og landskapet. Koblingen gjelder hans dokumenterte medskapende og kunstneriske rolle på stedet.',
    places: ['roseslottet'],
    image: '',
    cardImage: '',
    source_urls: ['https://roseslottet.no/kort-om-roseslottet/'],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/historie/oslo/frammuseet/otto_sverdrup.json', [
  {
    id: 'otto_sverdrup',
    name: 'Otto Sverdrup',
    initials: 'OS',
    desc: 'Polfarer, Fram-kaptein og den sterkeste forkjemperen for å bevare skipet og etablere museet.',
    tags: ['historie', 'polarhistorie', 'fram', 'frammuseet', 'ekspedisjon', 'bevaring', 'museum'],
    placeId: 'frammuseet',
    category: 'historie',
    year: 1925,
    popupDesc: 'Otto Sverdrup førte Fram på den andre Fram-ekspedisjonen og ble i 1925 formann i komiteen som arbeidet for å redde skipet. Frammuseet beskriver ham som prosjektets sterkeste forkjemper; skipet ble restaurert til den tilstanden det hadde under hans kommando. Han er derfor både ekspedisjonsanker og institusjonsbygger for museet.',
    places: ['frammuseet'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://frammuseum.no/nb/om_museet/museets-historie/',
      'https://frammuseum.no/nb/vare-utstillinger/fram/'
    ],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/historie/oslo/frammuseet/colin_archer.json', [
  {
    id: 'colin_archer',
    name: 'Colin Archer',
    initials: 'CA',
    desc: 'Skipskonstruktøren som designet og bygde polarskipet Fram.',
    tags: ['historie', 'skipsbygging', 'arkitektur', 'fram', 'frammuseet', 'polarhistorie', 'konstruksjon'],
    placeId: 'frammuseet',
    category: 'historie',
    year: 1892,
    popupDesc: 'Colin Archer designet og bygde Fram på bestilling fra Fridtjof Nansen. Skipets avrundede og svært sterke skrog skulle løftes av skruisen i stedet for å knuses av den. Fordi selve Fram er museets fremste og fysisk bevarte utstillingsobjekt, er Archer et direkte skaperanker for Frammuseet.',
    places: ['frammuseet'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://frammuseum.no/nb/om_museet/museets-historie/',
      'https://frammuseum.no/nb/polarhistorie/polarskip/'
    ],
    verifiedAt: '2026-07-25'
  }
]);

const oskarPath = 'data/people/litteratur/oslo/people_litteratur_oslo.json';
const oskarRecords = readJson(oskarPath) as Array<Record<string, unknown>>;
const oskar = oskarRecords.find(record => record.id === 'oskar_braaten');
if (!oskar) throw new Error('Missing canonical Oskar Braaten record');
oskar.tags = unique([...(Array.isArray(oskar.tags) ? oskar.tags : []), 'honse_lovisas_hus', 'ungen', 'sagene']);
oskar.places = unique([...(Array.isArray(oskar.places) ? oskar.places : []), 'honse_lovisas_hus']);
oskar.popupDesc = `${String(oskar.popupDesc)} Hønse-Lovisas hus legges til som et direkte litterært minneanker: huset har navn etter Hønse-Lovisa, den sentrale omsorgsfiguren i Braatens skuespill Ungen fra 1911, og ligger i industrimiljøet langs Akerselva som preget forfatterskapet hans.`;
oskar.source_urls = unique([...(Array.isArray(oskar.source_urls) ? oskar.source_urls : []), 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/honse-lovisas-hus', 'https://oslobyleksikon.no/side/H%C3%B8nse-Lovisas_hus']);
oskar.verifiedAt = '2026-07-25';
writeJson(oskarPath, oskarRecords);

const historyPath = 'data/people/historie/oslo/people_historie_oslo.json';
const historyRecords = readJson(historyPath) as Array<Record<string, unknown>>;
for (const id of ['fridtjof_nansen', 'roald_amundsen']) {
  const person = historyRecords.find(record => record.id === id);
  if (!person) throw new Error(`Missing canonical ${id} record`);
  person.tags = unique([...(Array.isArray(person.tags) ? person.tags : []), 'frammuseet', 'fram', 'polarhistorie']);
  person.places = unique([...(Array.isArray(person.places) ? person.places : []), 'frammuseet']);
  const addition = id === 'fridtjof_nansen'
    ? ' Frammuseet legges til som et direkte fysisk anker fordi Nansen bestilte Fram, utviklet skipets ekspedisjonsidé og ledet den første Fram-ferden.'
    : ' Frammuseet legges til som et direkte fysisk anker fordi Amundsen brukte Fram på den tredje ekspedisjonen og ombygde skipet for ferden mot Antarktis.';
  person.popupDesc = `${String(person.popupDesc)}${addition}`;
  person.source_urls = unique([...(Array.isArray(person.source_urls) ? person.source_urls : []), 'https://frammuseum.no/nb/om_museet/museets-historie/', 'https://frammuseum.no/nb/vare-utstillinger/fram/']);
  person.verifiedAt = '2026-07-25';
}
writeJson(historyPath, historyRecords);

fs.writeFileSync('reports/people-oslo-zero-gap-batch3-validation.md', `# Oslo People zero-gap batch 3 – validation\n\n## Target places\n\n- \`tullin\` → new \`claus_tullin\`\n- \`alexander_kiellands_plass\` → new \`alexander_lange_kielland\`\n- \`honse_lovisas_hus\` → reused \`oskar_braaten\`\n- \`framtidsbiblioteket_nordmarka\` → new \`katie_paterson\`\n- \`roseslottet\` → new \`vebjorn_sand\` and \`eimund_sand\`\n- \`frammuseet\` → new \`otto_sverdrup\` and \`colin_archer\`; reused \`fridtjof_nansen\` and \`roald_amundsen\`\n\n## Repository audit\n\nThe candidate audit scanned 683 People JSON files and 1,351 id/name records. Oskar Braaten, Fridtjof Nansen and Roald Amundsen had unique canonical records and are reused. Claus Tullin, Alexander Lange Kielland, Katie Paterson, Vebjørn Sand, Eimund Sand, Otto Sverdrup and Colin Archer had no canonical or legacy id/name matches and are added as new People. None of the six target place IDs had an existing People link.\n\n## Research gate\n\n- Canonical \`tullin\` is anchored at Tullinløkka, which is named after Claus Tullin. Christian Braunmann Tullin is rejected because Tullins gate, not Tullinløkka, is named after the poet.\n- Alexander Kiellands plass received its name in 1914 after Alexander Lange Kielland.\n- Hønse-Lovisas hus takes its name from the literary figure in Oskar Braaten's \`Ungen\`.\n- Future Library is Katie Paterson's 100-year public artwork in Nordmarka.\n- Roseslottet identifies Vebjørn Sand and Eimund Sand as its two creators.\n- Frammuseet identifies Fram as its central physical object: Nansen, Sverdrup and Amundsen led the three Fram expeditions, Colin Archer designed and built the ship, and Sverdrup led the preservation campaign that made the museum possible.\n`);

run('npx', ['tsx', 'scripts/build-civication-history-people-index.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-latent-people-coverage.mts']);

const coverage = readJson('reports/oslo-people-coverage.json');
const after = coverage.totals;
if (after.requiredNonNaturePlaces !== before.requiredNonNaturePlaces) {
  throw new Error(`Required Oslo place total changed during batch: ${before.requiredNonNaturePlaces} -> ${after.requiredNonNaturePlaces}`);
}
if (after.coveredRequiredPlaces !== before.coveredRequiredPlaces + 6) {
  throw new Error(`Expected exactly 6 newly covered Oslo places: ${before.coveredRequiredPlaces} -> ${after.coveredRequiredPlaces}`);
}
if (after.uncoveredRequiredPlaces !== before.uncoveredRequiredPlaces - 6) {
  throw new Error(`Expected exactly 6 fewer uncovered Oslo places: ${before.uncoveredRequiredPlaces} -> ${after.uncoveredRequiredPlaces}`);
}
if (after.logicalPeople !== before.logicalPeople + 7) {
  throw new Error(`Expected exactly 7 new logical People: ${before.logicalPeople} -> ${after.logicalPeople}`);
}

const uncoveredIds = new Set((coverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (uncoveredIds.has(placeId)) throw new Error(`Target place remains uncovered: ${placeId}`);
}

const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of ['claus_tullin', 'alexander_lange_kielland', 'oskar_braaten', 'katie_paterson', 'vebjorn_sand', 'eimund_sand', 'fridtjof_nansen', 'otto_sverdrup', 'roald_amundsen', 'colin_archer']) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication People index`);
}

fs.appendFileSync('reports/people-oslo-zero-gap-batch3-validation.md', `\n## Coverage gate\n\n- Required non-nature Oslo places: ${before.requiredNonNaturePlaces} → ${after.requiredNonNaturePlaces}\n- Covered required Oslo places: ${before.coveredRequiredPlaces} → ${after.coveredRequiredPlaces}\n- Uncovered required Oslo places: ${before.uncoveredRequiredPlaces} → ${after.uncoveredRequiredPlaces}\n- Logical People: ${before.logicalPeople} → ${after.logicalPeople}\n- New logical People: 7\n- Reused canonical People: 3\n`);

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
