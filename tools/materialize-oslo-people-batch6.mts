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
const targetPlaceIds = [
  'den_gamle_krigsskolen',
  'kirkeristen_basarene_brannvakten',
  'palehaven_paleet',
  'mustadgarden_kongens_gate_3',
  'radmannsgarden_og_anatomibygget',
  'magistratgarden'
];
const baselineUncovered = new Set((baseline.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (!baselineUncovered.has(placeId)) throw new Error(`Target place is not uncovered at baseline: ${placeId}`);
}

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };
const newManifestEntries = [
  'people/historie/oslo/palehaven_paleet/christian_ancher.json',
  'people/kunst/oslo/mustadgarden_kongens_gate_3/otto_kunzli.json',
  'people/historie/oslo/magistratgarden/helge_berntsen.json',
  'people/historie/oslo/magistratgarden/morten_leuch_eliesen.json',
  'people/historie/oslo/magistratgarden/dorthea_monsen.json'
];
for (const entry of newManifestEntries) {
  if (manifest.files.includes(entry)) throw new Error(`Manifest entry already exists: ${entry}`);
  manifest.files.push(entry);
}
writeJson(manifestPath, manifest);

writeJson('data/people/historie/oslo/palehaven_paleet/christian_ancher.json', [{
  id: 'christian_ancher',
  name: 'Christian Ancher',
  initials: 'CA',
  desc: 'Trelasthandleren som oppførte Det Ankerske palé ved Bjørvika midt på 1700-tallet.',
  tags: ['historie', 'naeringsliv', 'trelasthandel', 'byggherre', 'palehaven_paleet', 'ankerfamilien', 'kvadraturen'],
  placeId: 'palehaven_paleet',
  category: 'historie',
  year: 1760,
  popupDesc: 'Christian Ancher kjøpte og slo sammen flere tomter ved Bjørvika og oppførte Det Ankerske palé midt på 1700-tallet. Det store firefløyede anlegget ble familiens representative bygård og utgangspunktet for Paléhaven. Koblingen gjelder hans konkrete byggherre- og eierrolle for den forsvunne palébygningen som dette historiske områdeankeret formidler.',
  places: ['palehaven_paleet'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/palehaven-og-paleet'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/kunst/oslo/mustadgarden_kongens_gate_3/otto_kunzli.json', [{
  id: 'otto_kunzli',
  name: 'Otto Künzli',
  initials: 'OK',
  desc: 'Smykkekunstneren bak Den røde prikk på fasaden i Kongens gate 3.',
  tags: ['kunst', 'smykkekunst', 'konseptkunst', 'den_rode_prikk', 'mustadgarden_kongens_gate_3', 'ram_galleri'],
  placeId: 'mustadgarden_kongens_gate_3',
  category: 'kunst',
  year: 1996,
  popupDesc: 'Otto Künzli monterte Den røde prikk høyt på fasaden i Kongens gate 3 i forbindelse med sin første norske utstilling på Ram Galleri i 1996. Prikken viser til gallerienes merke for solgte kunstverk og gjør selve bygningen til del av et konseptuelt arbeid om kunst, verdi og marked. Koblingen er fysisk synlig på Mustadgårdens fasade.',
  places: ['mustadgarden_kongens_gate_3'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/den-rode-prikk-otto-kunzli'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/magistratgarden/helge_berntsen.json', [{
  id: 'helge_berntsen',
  name: 'Helge Berntsen',
  initials: 'HB',
  desc: 'Rådmannen og kjøpmannen som oppførte Magistratgården i 1647.',
  tags: ['historie', 'raadmann', 'kjopmann', 'byggherre', 'magistratgarden', 'kvadraturen', '1600_tallet'],
  placeId: 'magistratgarden',
  category: 'historie',
  year: 1647,
  popupDesc: 'Helge Berntsen lot Magistratgården i Dronningens gate 11 oppføre i 1647 som en stor privat bygård over hvelvede gråsteinskjellere. Som rådmann, kjøpmann og byggherre er han det direkte personankeret for den eldste hovedformen som fortsatt kan leses i huset.',
  places: ['magistratgarden'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/magistratgarden'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/magistratgarden/morten_leuch_eliesen.json', [{
  id: 'morten_leuch_eliesen',
  name: 'Morten Leuch Eliesen',
  initials: 'MLE',
  desc: 'Eieren hvis våpenskjold og monogram ble satt over Magistratgårdens port i 1754.',
  tags: ['historie', 'eier', 'monogram', 'vaapenskjold', 'magistratgarden', 'kvadraturen', '1700_tallet'],
  placeId: 'magistratgarden',
  category: 'historie',
  year: 1754,
  popupDesc: 'Morten Leuch Eliesen eide Magistratgården sammen med sin hustru Dorthea Monsen. I 1754 ble ekteparets våpenskjold og monogram satt inn over porten. Koblingen er dermed ikke bare juridisk eierskap, men et fortsatt fysisk synlig personspor i fasaden.',
  places: ['magistratgarden'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/magistratgarden'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/magistratgarden/dorthea_monsen.json', [{
  id: 'dorthea_monsen',
  name: 'Dorthea Monsen',
  initials: 'DM',
  desc: 'Eieren som sammen med Morten Leuch Eliesen satte sitt monogram på Magistratgården i 1754.',
  tags: ['historie', 'eier', 'monogram', 'vaapenskjold', 'magistratgarden', 'kvadraturen', '1700_tallet'],
  placeId: 'magistratgarden',
  category: 'historie',
  year: 1754,
  popupDesc: 'Dorthea Monsen eide Magistratgården sammen med sin ektemann Morten Leuch Eliesen. Ekteparets våpenskjold og monogram ble satt over porten i 1754. Hun får en egen record fordi hennes dokumenterte eierskap og synlige monogram er et selvstendig fysisk personspor, ikke bare en avledet ektefellekobling.',
  places: ['magistratgarden'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/magistratgarden'],
  verifiedAt: '2026-07-25'
}]);

const updatePerson = (file: string, id: string, placeIds: string[], tags: string[], addition: string, sources: string[]) => {
  const records = readJson(file) as Array<Record<string, unknown>>;
  const person = records.find(record => record.id === id);
  if (!person) throw new Error(`Missing canonical ${id} in ${file}`);
  person.tags = unique([...(Array.isArray(person.tags) ? person.tags : []), ...tags]);
  person.places = unique([...(Array.isArray(person.places) ? person.places : []), ...placeIds]);
  const popup = String(person.popupDesc ?? '').trim();
  if (!popup.includes(addition)) person.popupDesc = `${popup}${popup ? ' ' : ''}${addition}`;
  person.source_urls = unique([...(Array.isArray(person.source_urls) ? person.source_urls : []), ...sources]);
  person.verifiedAt = '2026-07-25';
  writeJson(file, records);
};

updatePerson(
  'data/people/historie/oslo/people_historie_oslo.json',
  'jens_bjelke',
  ['den_gamle_krigsskolen'],
  ['den_gamle_krigsskolen', 'bypale', 'kvadraturen'],
  'Den gamle Krigsskolen legges til som et direkte byggherreanker: Jens Bjelke fikk den første gården i Tollbugata 10 reist som bypalé på 1630-tallet.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen']
);

updatePerson(
  'data/people/historie/oslo/oslo_ladegard/caspar_herman_von_storm.json',
  'caspar_herman_von_storm',
  ['den_gamle_krigsskolen'],
  ['den_gamle_krigsskolen', 'rokokko', 'bypale'],
  'Den gamle Krigsskolen legges til som et direkte byggherreanker: Caspar Herman von Storm lot anlegget omforme til rokokkopalé i 1761–1765.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen']
);

updatePerson(
  'data/people/historie/oslo/people_historie_oslo.json',
  'bernt_anker',
  ['den_gamle_krigsskolen', 'palehaven_paleet'],
  ['den_gamle_krigsskolen', 'palehaven_paleet', 'paléhaven', 'krigsskolen'],
  'Den gamle Krigsskolen og Paléhaven/Paleet legges til som direkte ankre: Bernt Anker skjenket Tollbugata 10 til Krigsskolen i 1802, mens han arvet Paleet, utviklet Paléhaven og åpnet hagen for byens befolkning.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen', 'https://www.oppdagkvadraturen.no/stoppesteder/palehaven-og-paleet']
);

updatePerson(
  'data/people/politikk/akershus/eidsvollsbygningen/diderik_hegermann.json',
  'diderik_hegermann',
  ['den_gamle_krigsskolen'],
  ['den_gamle_krigsskolen', 'militaerutdanning', 'kommandor'],
  'Den gamle Krigsskolen legges til som hans direkte arbeids- og boliganker: Hegermann var skolens kommandør, tok bolig i Tollbugata 10 i 1802 og minnes fortsatt med obelisken i forhagen.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/den-gamle-krigsskolen']
);

updatePerson(
  'data/people/by/oslo/people_by_oslo.json',
  'christian_heinrich_grosch',
  ['kirkeristen_basarene_brannvakten'],
  ['kirkeristen_basarene_brannvakten', 'nygotikk', 'basarer', 'brannvakt'],
  'Kirkeristen, Basarene og Brannvakten legges til som et direkte hovedverk: Grosch tegnet det halvsirkelformede anlegget som ble oppført i etapper mellom 1840 og 1856.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/kirkeristen-og-basarene']
);

updatePerson(
  'data/people/historie/oslo/people_historie_oslo.json',
  'christian_frederik',
  ['palehaven_paleet'],
  ['palehaven_paleet', 'kongebolig', '1814'],
  'Paléhaven og Paleet legges til som et direkte bolig- og regjeringsanker: Christian Frederik bodde i Paleet og brukte bygningen som politisk sentrum under selvstendighetsprosessen i 1814.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/paleet-den-forste-kongeboligen']
);

updatePerson(
  'data/people/historie/oslo/people_historie_oslo.json',
  'kong_karl_johan',
  ['palehaven_paleet'],
  ['palehaven_paleet', 'kongebolig', 'unionstiden'],
  'Paléhaven og Paleet legges til som et direkte kongelig boliganker: Karl Johan tok Paleet i bruk ved ankomsten til Christiania i november 1814 og brukte det som kongebolig fram til sin død i 1844.',
  ['https://www.oppdagkvadraturen.no/stoppesteder/paleet-den-forste-kongeboligen']
);

updatePerson(
  'data/people/politikk/oslo/people_politikk_oslo.json',
  'jacob_wilhelm_nordan',
  ['mustadgarden_kongens_gate_3'],
  ['mustadgarden_kongens_gate_3', 'forretningsgard', 'ombygging'],
  'Mustadgården i Kongens gate 3 legges til som et direkte arkitektanker: Nordan bygde den eldre gården om og på til tre etasjer for Ole Mustad i 1883.',
  ['https://lokalhistoriewiki.no/Jacob_Wilhelm_Nordan', 'https://oslobyleksikon.no/side/Kongens_gate']
);

updatePerson(
  'data/people/historie/oslo/gamle_radhus/lauritz_hansen.json',
  'lauritz_hansen',
  ['radmannsgarden_og_anatomibygget'],
  ['radmannsgarden_og_anatomibygget', 'raadmannsgarden', 'privatbolig'],
  'Rådmannsgården og Anatomibygget legges til som et direkte bolig- og byggherreanker: Lauritz Hansen fikk gården oppført som privatbolig, med bygningsdeler fra 1626 og hovedvolum fra 1640-årene.',
  ['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/radmannsgarden-og-anatomibygget/']
);

updatePerson(
  'data/people/kunst/oslo/people_kunst_oslo_politics_places_batch_03.json',
  'brynjulf_bergslien',
  ['radmannsgarden_og_anatomibygget'],
  ['radmannsgarden_og_anatomibygget', 'anatomibygget', 'atelier'],
  'Rådmannsgården og Anatomibygget legges til som et direkte atelieranker: Brynjulf Bergslien arbeidet i Anatomibygget fra omkring 1860 i rundt førti år og skapte blant annet Karl Johan-monumentet og Wergeland-statuen der.',
  ['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/radmannsgarden-og-anatomibygget/']
);

run('npx', ['tsx', 'scripts/build-civication-history-people-index.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-latent-people-coverage.mts']);

const coverage = readJson('reports/oslo-people-coverage.json');
const before = baseline.totals;
const after = coverage.totals;
if (after.requiredNonNaturePlaces !== before.requiredNonNaturePlaces) {
  throw new Error(`Required Oslo place count changed inside batch: ${before.requiredNonNaturePlaces} -> ${after.requiredNonNaturePlaces}`);
}
if (after.coveredRequiredPlaces !== before.coveredRequiredPlaces + 6 || after.uncoveredRequiredPlaces !== before.uncoveredRequiredPlaces - 6) {
  throw new Error(`Unexpected Oslo coverage delta: ${JSON.stringify({ before, after })}`);
}
if (after.logicalPeople !== before.logicalPeople + 5) {
  throw new Error(`Unexpected logical People delta: ${before.logicalPeople} -> ${after.logicalPeople}`);
}
const uncoveredIds = new Set((coverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (uncoveredIds.has(placeId)) throw new Error(`Target place remains uncovered: ${placeId}`);
}

const expectedIds = [
  'jens_bjelke', 'caspar_herman_von_storm', 'bernt_anker', 'diderik_hegermann',
  'christian_heinrich_grosch', 'christian_ancher', 'christian_frederik', 'kong_karl_johan',
  'jacob_wilhelm_nordan', 'otto_kunzli', 'lauritz_hansen', 'brynjulf_bergslien',
  'helge_berntsen', 'morten_leuch_eliesen', 'dorthea_monsen'
];
const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of expectedIds) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication People index`);
}

fs.writeFileSync('reports/people-oslo-zero-gap-batch6-validation.md', `# Oslo People zero-gap batch 6 – validation\n\n## Target places\n\n- \`den_gamle_krigsskolen\` → reused \`jens_bjelke\`, \`caspar_herman_von_storm\`, \`bernt_anker\` and \`diderik_hegermann\`\n- \`kirkeristen_basarene_brannvakten\` → reused \`christian_heinrich_grosch\`\n- \`palehaven_paleet\` → new \`christian_ancher\`; reused \`bernt_anker\`, \`christian_frederik\` and \`kong_karl_johan\`\n- \`mustadgarden_kongens_gate_3\` → new \`otto_kunzli\`; reused \`jacob_wilhelm_nordan\`\n- \`radmannsgarden_og_anatomibygget\` → reused \`lauritz_hansen\` and \`brynjulf_bergslien\`\n- \`magistratgarden\` → new \`helge_berntsen\`, \`morten_leuch_eliesen\` and \`dorthea_monsen\`\n\n## Repository audit\n\nThe candidate audit scanned 710 People JSON files and 1,378 id/name records. Ten candidates had existing canonical records and are reused. Christian Ancher, Otto Künzli, Helge Berntsen, Morten Leuch Eliesen and Dorthea Monsen had no canonical or legacy id/name matches and are added as new People. None of the six target place IDs had an existing People link.\n\n## Research gate\n\n- Jens Bjelke commissioned the first palatial house at Tollbugata 10; Caspar Herman von Storm rebuilt it as a rococo palace; Bernt Anker donated it to the Military Academy; Diderik Hegermann commanded the school and lived there.\n- Christian Heinrich Grosch designed Kirkeristen's bazaar and fire-watch complex, erected between 1840 and 1856.\n- Christian Ancher built Paleet; Bernt Anker inherited it and opened Paléhaven; Christian Frederik and Karl Johan used Paleet as a royal residence.\n- Jacob Wilhelm Nordan rebuilt Kongens gate 3 for Ole Mustad in 1883; Otto Künzli mounted Den røde prikk on the facade in 1996.\n- Lauritz Hansen commissioned Rådmannsgården; Brynjulf Bergslien maintained his atelier in Anatomibygget for about forty years.\n- Helge Berntsen built Magistratgården; the 1754 portal preserves the arms and monograms of owners Morten Leuch Eliesen and Dorthea Monsen.\n\n## Coverage gate\n\n- Required non-nature Oslo places: ${before.requiredNonNaturePlaces} → ${after.requiredNonNaturePlaces}\n- Covered required Oslo places: ${before.coveredRequiredPlaces} → ${after.coveredRequiredPlaces}\n- Uncovered required Oslo places: ${before.uncoveredRequiredPlaces} → ${after.uncoveredRequiredPlaces}\n- Logical People: ${before.logicalPeople} → ${after.logicalPeople}\n- New logical People: 5\n- Reused canonical People: 10\n`);

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
