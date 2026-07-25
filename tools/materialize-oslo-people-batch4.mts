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

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };
const newManifestEntries = [
  'people/historie/oslo/kon_tiki_museet/thor_heyerdahl.json',
  'people/historie/oslo/kon_tiki_museet/knut_haugland.json',
  'people/historie/oslo/hauges_minde/hans_nielsen_hauge.json',
  'people/historie/oslo/hauges_minde/johan_cordt_harmens_storjohann.json',
  'people/historie/oslo/stattholdergarden/peter_gruner.json',
  'people/naeringsliv/oslo/borsen_oslo/thor_olsen.json',
  'people/naeringsliv/oslo/steen_og_strom/samuel_strom.json',
  'people/naeringsliv/oslo/steen_og_strom/elise_marie_strom.json',
  'people/naeringsliv/oslo/steen_og_strom/peter_emil_steen.json',
  'people/naeringsliv/oslo/steen_og_strom/samuel_strom_jr.json',
  'people/naeringsliv/oslo/steen_og_strom/ole_sverre.json',
  'people/naeringsliv/oslo/cafe_engebret/engebret_christophersen.json'
];
for (const entry of newManifestEntries) {
  if (manifest.files.includes(entry)) throw new Error(`Manifest entry already exists: ${entry}`);
  manifest.files.push(entry);
}
writeJson(manifestPath, manifest);

writeJson('data/people/historie/oslo/kon_tiki_museet/thor_heyerdahl.json', [{
  id: 'thor_heyerdahl',
  name: 'Thor Heyerdahl',
  initials: 'TH',
  desc: 'Ekspedisjonslederen hvis livsverk og originale fartøyer er kjernen i Kon-Tiki Museet.',
  tags: ['historie', 'ekspedisjon', 'kon_tiki', 'eksperimentell_arkeologi', 'stillehavet', 'bygdoy'],
  placeId: 'kon_tiki_museet',
  category: 'historie',
  year: 1950,
  popupDesc: 'Thor Heyerdahl er museets sentrale personanker. Etter Kon-Tiki-ekspedisjonen i 1947 donerte han den originale flåten til museet ved åpningen i 1950, og utstillingene på Bygdøy bevarer Kon-Tiki, Ra II og dokumentasjon fra ekspedisjonene og forskningsarbeidet hans. Koblingen gjelder derfor både hans konkrete fartøyer, arkiv og livsverk i den fysiske museumsinstitusjonen.',
  places: ['kon_tiki_museet'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://www.kon-tiki.no/no/about-thor-heyerdahl',
    'https://www.kon-tiki.no/no/research-foundation'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/kon_tiki_museet/knut_haugland.json', [{
  id: 'knut_haugland',
  name: 'Knut Magne Haugland',
  initials: 'KMH',
  desc: 'Kon-Tiki-deltakeren som grunnla museet og ledet det gjennom de første fire tiårene.',
  tags: ['historie', 'museum', 'kon_tiki', 'grunnlegger', 'museumsdirektor', 'bygdoy'],
  placeId: 'kon_tiki_museet',
  category: 'historie',
  year: 1950,
  popupDesc: 'Knut Magne Haugland grunnla Kon-Tiki Museet i 1950 etter selv å ha deltatt på Kon-Tiki-ekspedisjonen som radiotelegrafist. Han var museumsdirektør fra 1950 til 1990 og bygget institusjonen fra et midlertidig hus rundt flåten til et varig museum, arkiv og forskningsmiljø. Dette er en direkte grunnlegger- og lederkobling til stedet.',
  places: ['kon_tiki_museet'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://www.kon-tiki.no/no/archives-and-collections',
    'https://www.kon-tiki.no/en/news/the-kon-tiki-museum-75-years'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/hauges_minde/hans_nielsen_hauge.json', [{
  id: 'hans_nielsen_hauge',
  name: 'Hans Nielsen Hauge',
  initials: 'HNH',
  desc: 'Lekpredikanten og samfunnsentreprenøren som Hauges Minde fikk navn etter.',
  tags: ['historie', 'religionshistorie', 'haugianisme', 'eponym', 'hauges_minde', 'grunerlokka'],
  placeId: 'hauges_minde',
  category: 'historie',
  year: 1875,
  popupDesc: 'Hans Nielsen Hauge var ikke byggets initiativtaker, men er det direkte navne- og idéhistoriske personankeret. Bedehuset som ble oppført ved Olaf Ryes plass i 1875 fikk navnet Hauges Minde etter ham, og navnet bandt den nye indremisjonsbygningen til den haugianske vekkelses-, arbeids- og organisasjonshistorien.',
  places: ['hauges_minde'],
  image: '',
  cardImage: '',
  source_urls: ['https://oslobyleksikon.no/side/Hauges_Minde'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/hauges_minde/johan_cordt_harmens_storjohann.json', [{
  id: 'johan_cordt_harmens_storjohann',
  name: 'Johan Cordt Harmens Storjohann',
  initials: 'JCHS',
  desc: 'Pastoren og indremisjonsmannen som tok initiativ til å reise Hauges Minde.',
  tags: ['historie', 'religionshistorie', 'indremisjon', 'grunnlegger', 'hauges_minde', 'grunerlokka'],
  placeId: 'hauges_minde',
  category: 'historie',
  year: 1875,
  popupDesc: 'Johan Cordt Harmens Storjohann tok det konkrete initiativet til Hauges Minde som bedehus for Kristiania indremisjon. Han mobiliserte støtte fra både bedriftseiere, arbeidere og teglverk på Grünerløkka, og bygningen ble reist i 1875. Koblingen skiller bevisst hans rolle som initiativtaker fra Hans Nielsen Hauges rolle som navne- og idéhistorisk forbilde.',
  places: ['hauges_minde'],
  image: '',
  cardImage: '',
  source_urls: ['https://oslobyleksikon.no/side/Hauges_Minde'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/stattholdergarden/peter_gruner.json', [{
  id: 'peter_gruner',
  name: 'Peter Grüner',
  initials: 'PG',
  desc: 'Myntmesteren som oppførte Stattholdergården på 1640-tallet.',
  tags: ['historie', 'myntmester', 'byggherre', 'stattholdergarden', 'kvadraturen', '1600_tallet'],
  placeId: 'stattholdergarden',
  category: 'historie',
  year: 1640,
  popupDesc: 'Peter Grüner var myntmester og byggherre for gården i Rådhusgata 11 på 1640-tallet. Navnet hans kan fortsatt leses i ankerjernene på fasaden, slik at koblingen er fysisk synlig i selve bygningen. Han er derfor det opprinnelige eier- og byggherreankeret for Stattholdergården.',
  places: ['stattholdergarden'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://oslobyleksikon.no/side/Calmeyerg%C3%A5rden',
    'https://www.oppdagkvadraturen.no/stoppesteder/stattholdergarden'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/borsen_oslo/thor_olsen.json', [{
  id: 'thor_olsen',
  name: 'Thor Olsen',
  initials: 'TO',
  desc: 'Kjøpmannen som tok initiativ til den første egne børsbygningen i Christiania.',
  tags: ['naeringsliv', 'finanshistorie', 'handel', 'byggherreinitiativ', 'borsen_oslo', 'kvadraturen'],
  placeId: 'borsen_oslo',
  category: 'naeringsliv',
  year: 1826,
  popupDesc: 'Thor Olsen tok initiativ til at Christiania Børs skulle få en egen bygning i den tidligere byparken Grønningen. Byggeprosjektet ble gjennomført i 1826–1828 og ga den nye børsinstitusjonen et permanent fysisk sentrum for handel og kapitalmarked. Koblingen gjelder hans dokumenterte initiativ til akkurat denne bygningen.',
  places: ['borsen_oslo'],
  image: '',
  cardImage: '',
  source_urls: ['https://oslobyleksikon.no/side/B%C3%B8rsen'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/steen_og_strom/samuel_strom.json', [{
  id: 'samuel_strom',
  name: 'Samuel Strøm',
  initials: 'SS',
  desc: 'Kjøpmannen som grunnla virksomheten som senere ble Steen & Strøm.',
  tags: ['naeringsliv', 'handel', 'grunnlegger', 'steen_og_strom', 'stormagasin', 'kvadraturen'],
  placeId: 'steen_og_strom',
  category: 'naeringsliv',
  year: 1797,
  popupDesc: 'Samuel Strøm etablerte i 1797 forretningen på hjørnet av Prinsens gate og Kongens gate som ble grunnlaget for Steen & Strøm. Virksomheten begynte med kolonialvarer, vin, tekstiler og isenkram og utviklet seg på samme sted til Norges eldste stormagasin. Han er dermed det opprinnelige grunnleggerankeret for stedet.',
  places: ['steen_og_strom'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://steenogstromoslo.no/225-ar',
    'https://oslobyleksikon.no/side/Steen_%26_Str%C3%B8m_Magasin'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/steen_og_strom/elise_marie_strom.json', [{
  id: 'elise_marie_strom',
  name: 'Elise Marie Strøm',
  initials: 'EMS',
  desc: 'Forretningskvinnen som videreførte Strøm-handelen og gjorde manufakturvarer til en hovedgren.',
  tags: ['naeringsliv', 'handel', 'forretningskvinne', 'steen_og_strom', 'manufaktur', 'kvadraturen'],
  placeId: 'steen_og_strom',
  category: 'naeringsliv',
  year: 1818,
  popupDesc: 'Etter Samuel Strøms død overtok enken Elise Marie Strøm virksomheten. Hun introduserte manufakturvarer som senere ble en hoveddel av stormagasinets varegrunnlag. Rollen hennes var derfor ikke bare forvaltning av en arv, men en dokumentert utvikling av forretningen på stedet mot det moderne varemagasinet.',
  places: ['steen_og_strom'],
  image: '',
  cardImage: '',
  source_urls: ['https://oslobyleksikon.no/side/Steen_%26_Str%C3%B8m_Magasin'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/steen_og_strom/peter_emil_steen.json', [{
  id: 'peter_emil_steen',
  name: 'Peter Emil Steen',
  initials: 'PES',
  desc: 'Kjøpmannen som sammen med Samuel Strøm junior ga firmaet navnet Steen & Strøm.',
  tags: ['naeringsliv', 'handel', 'partner', 'eponym', 'steen_og_strom', 'stormagasin'],
  placeId: 'steen_og_strom',
  category: 'naeringsliv',
  year: 1856,
  popupDesc: 'Peter Emil Steen trådte inn i virksomheten i 1856 og slo sin forretning sammen med Samuel Strøm juniors. Partnerskapet førte til navnet Steen & Strøm og markerer overgangen fra familiehandel til det firmaet og stormagasinet som fortsatt identifiserer stedet i Kongens gate.',
  places: ['steen_og_strom'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://steenogstromoslo.no/history',
    'https://oslobyleksikon.no/side/Steen_%26_Str%C3%B8m_Magasin'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/steen_og_strom/samuel_strom_jr.json', [{
  id: 'samuel_strom_jr',
  name: 'Samuel Strøm jr.',
  initials: 'SSJ',
  desc: 'Kjøpmannen som videreførte Strøm-familien og dannet Steen & Strøm sammen med Emil Steen.',
  tags: ['naeringsliv', 'handel', 'partner', 'eponym', 'steen_og_strom', 'stormagasin'],
  placeId: 'steen_og_strom',
  category: 'naeringsliv',
  year: 1856,
  popupDesc: 'Samuel Strøm jr. videreførte familieforretningen og gikk i 1856 sammen med Peter Emil Steen. Sammenslåingen ga firmaet navnet Steen & Strøm og la grunnlaget for den videre utviklingen til moderne stormagasin. Han skilles fra grunnleggeren Samuel Strøm som en egen generasjon og rolle.',
  places: ['steen_og_strom'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://steenogstromoslo.no/225-ar',
    'https://oslobyleksikon.no/side/Steen_%26_Str%C3%B8m_Magasin'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/steen_og_strom/ole_sverre.json', [{
  id: 'ole_sverre',
  name: 'Ole Sverre',
  initials: 'OS',
  desc: 'Arkitekten bak Steen & Strøms art deco-varehus fra 1930.',
  tags: ['naeringsliv', 'arkitektur', 'art_deco', 'stormagasin', 'steen_og_strom', '1930_tallet'],
  placeId: 'steen_og_strom',
  category: 'naeringsliv',
  year: 1930,
  popupDesc: 'Ole Sverre tegnet dagens Steen & Strøm-bygning etter brannen i 1929. Varehuset sto ferdig i 1930 med ni etasjer, en stor overlyshall og Norges første elektriske rulletrapp, og er et sentralt norsk eksempel på art deco og tidlig moderne varehusarkitektur. Koblingen gjelder den konkrete canonical bygningen.',
  places: ['steen_og_strom'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://steenogstromoslo.no/history',
    'https://snl.no/Ole_Sverre'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/cafe_engebret/engebret_christophersen.json', [{
  id: 'engebret_christophersen',
  name: 'Engebret Christophersen',
  initials: 'EC',
  desc: 'Grunnleggeren som ga Engebret Café navn og etablerte restauranten ved Bankplassen.',
  tags: ['naeringsliv', 'serveringshistorie', 'grunnlegger', 'eponym', 'cafe_engebret', 'bankplassen'],
  placeId: 'cafe_engebret',
  category: 'naeringsliv',
  year: 1862,
  popupDesc: 'Engebret Christophersen grunnla kafeen i 1857 og kjøpte Bankplassen 1 i 1862, der han etablerte restauranten som ble Engebret Café slik stedet er kjent i dag. Han bygget på gården og skapte møteplassen for teaterfolk, kunstnere, forfattere og politikere. Dette er både en direkte grunnlegger-, eier- og eponymkobling.',
  places: ['cafe_engebret'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.engebret-cafe.no/historien'],
  verifiedAt: '2026-07-25'
}]);

const gyldenlovePath = 'data/people/historie/oslo/akershus_festning/ulrik_frederik_gyldenlove.json';
const gyldenloveRecords = readJson(gyldenlovePath) as Array<Record<string, unknown>>;
const gyldenlove = gyldenloveRecords.find(record => record.id === 'ulrik_frederik_gyldenlove');
if (!gyldenlove) throw new Error('Missing canonical Ulrik Frederik Gyldenløve record');
gyldenlove.tags = unique([...(Array.isArray(gyldenlove.tags) ? gyldenlove.tags : []), 'stattholdergarden', 'kvadraturen', 'bolig']);
gyldenlove.places = unique([...(Array.isArray(gyldenlove.places) ? gyldenlove.places : []), 'stattholdergarden']);
gyldenlove.popupDesc = `${String(gyldenlove.popupDesc)} Stattholdergården legges til som et direkte boliganker: fra 1680 brukte Gyldenløve gården i Rådhusgata 11 når han oppholdt seg i Christiania, og denne bruken ga bygningen navnet den fortsatt bærer.`;
gyldenlove.source_urls = unique([...(Array.isArray(gyldenlove.source_urls) ? gyldenlove.source_urls : []), 'https://oslobyleksikon.no/side/Calmeyerg%C3%A5rden', 'https://www.oppdagkvadraturen.no/stoppesteder/stattholdergarden']);
gyldenlove.verifiedAt = '2026-07-25';
writeJson(gyldenlovePath, gyldenloveRecords);

const groschPath = 'data/people/by/oslo/people_by_oslo.json';
const groschRecords = readJson(groschPath) as Array<Record<string, unknown>>;
const grosch = groschRecords.find(record => record.id === 'christian_heinrich_grosch');
if (!grosch) throw new Error('Missing canonical Christian Heinrich Grosch record');
grosch.tags = unique([...(Array.isArray(grosch.tags) ? grosch.tags : []), 'borsen_oslo', 'finansarkitektur', 'empire']);
grosch.places = unique([...(Array.isArray(grosch.places) ? grosch.places : []), 'borsen_oslo']);
grosch.popupDesc = `${String(grosch.popupDesc)} Oslo Børs legges til som et direkte hovedverk: Grosch tegnet den klassisistiske børsbygningen som ble oppført i 1826–1828, og bygget gjorde den nye finansinstitusjonen fysisk synlig i Christianias handelsområde.`;
grosch.source_urls = unique([...(Array.isArray(grosch.source_urls) ? grosch.source_urls : []), 'https://oslobyleksikon.no/side/B%C3%B8rsen']);
grosch.verifiedAt = '2026-07-25';
writeJson(groschPath, groschRecords);

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
if (after.logicalPeople !== before.logicalPeople + 12) {
  throw new Error(`Unexpected logical People delta: ${before.logicalPeople} -> ${after.logicalPeople}`);
}

const targetPlaceIds = ['kon_tiki_museet', 'hauges_minde', 'stattholdergarden', 'borsen_oslo', 'steen_og_strom', 'cafe_engebret'];
const uncoveredIds = new Set((coverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (uncoveredIds.has(placeId)) throw new Error(`Target place remains uncovered: ${placeId}`);
}

const expectedIds = [
  'thor_heyerdahl', 'knut_haugland', 'hans_nielsen_hauge', 'johan_cordt_harmens_storjohann',
  'peter_gruner', 'ulrik_frederik_gyldenlove', 'christian_heinrich_grosch', 'thor_olsen',
  'samuel_strom', 'elise_marie_strom', 'peter_emil_steen', 'samuel_strom_jr', 'ole_sverre',
  'engebret_christophersen'
];
const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of expectedIds) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication People index`);
}

fs.writeFileSync('reports/people-oslo-zero-gap-batch4-validation.md', `# Oslo People zero-gap batch 4 – validation\n\n## Target places\n\n- \`kon_tiki_museet\` → new \`thor_heyerdahl\` and \`knut_haugland\`\n- \`hauges_minde\` → new \`hans_nielsen_hauge\` and \`johan_cordt_harmens_storjohann\`\n- \`stattholdergarden\` → new \`peter_gruner\`; reused \`ulrik_frederik_gyldenlove\`\n- \`borsen_oslo\` → new \`thor_olsen\`; reused \`christian_heinrich_grosch\`\n- \`steen_og_strom\` → new \`samuel_strom\`, \`elise_marie_strom\`, \`peter_emil_steen\`, \`samuel_strom_jr\` and \`ole_sverre\`\n- \`cafe_engebret\` → new \`engebret_christophersen\`\n\n## Repository audit\n\nThe candidate audit scanned 690 People JSON files and 1,358 id/name records. Ulrik Frederik Gyldenløve and Christian Heinrich Grosch had unique canonical records and are reused. The other twelve candidates had no canonical or legacy id/name matches and are added as new People. None of the six target place IDs had an existing People link.\n\n## Research gate\n\n- Thor Heyerdahl donated the Kon-Tiki raft to the museum; Knut Haugland founded the museum in 1950 and directed it until 1990.\n- Hauges Minde was named after Hans Nielsen Hauge but was concretely initiated and financed through Johan Cordt Harmens Storjohann's work.\n- Peter Grüner built Stattholdergården; Ulrik Frederik Gyldenløve used it as his Christiania residence from 1680.\n- Thor Olsen initiated the dedicated exchange building, while Christian Heinrich Grosch designed the 1826–1828 building.\n- Steen & Strøm receives distinct founder, business-development, naming-partnership and building-architect roles; these are not generic merchant associations.\n- Engebret Christophersen founded the café, purchased Bankplassen 1 and gave the institution its name.\n\n## Coverage gate\n\n- Required non-nature Oslo places: ${before.requiredNonNaturePlaces} → ${after.requiredNonNaturePlaces}\n- Covered required Oslo places: ${before.coveredRequiredPlaces} → ${after.coveredRequiredPlaces}\n- Uncovered required Oslo places: ${before.uncoveredRequiredPlaces} → ${after.uncoveredRequiredPlaces}\n- Logical People: ${before.logicalPeople} → ${after.logicalPeople}\n- New logical People: 12\n- Reused canonical People: 2\n`);

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
