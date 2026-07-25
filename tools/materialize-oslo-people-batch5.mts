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
  'garmanngarden',
  'gol_stavkirke_bygdoy',
  'centralbanken_kirkegata',
  'kafe_grei',
  'treschowgarden',
  'oslo_ladegard'
];
const baselineUncovered = new Set((baseline.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (!baselineUncovered.has(placeId)) throw new Error(`Target place is not uncovered at baseline: ${placeId}`);
}

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };
const newManifestEntries = [
  'people/historie/oslo/garmanngarden/johan_garmann.json',
  'people/historie/oslo/gol_stavkirke_bygdoy/oscar_ii.json',
  'people/historie/oslo/gol_stavkirke_bygdoy/torolf_prytz.json',
  'people/historie/oslo/gol_stavkirke_bygdoy/waldemar_hansteen.json',
  'people/naeringsliv/oslo/kafe_grei/christian_brinch.json',
  'people/naeringsliv/oslo/kafe_grei/amalie_sofie_bekkevold.json',
  'people/historie/oslo/oslo_ladegard/karen_toller.json',
  'people/historie/oslo/oslo_ladegard/caspar_herman_von_storm.json'
];
for (const entry of newManifestEntries) {
  if (manifest.files.includes(entry)) throw new Error(`Manifest entry already exists: ${entry}`);
  manifest.files.push(entry);
}
writeJson(manifestPath, manifest);

writeJson('data/people/historie/oslo/garmanngarden/johan_garmann.json', [{
  id: 'johan_garmann',
  name: 'Johan Garmann',
  initials: 'JG',
  desc: 'Landkommissarius og eier som ga Garmanngården navn og mye av dens bevarte 1600-tallspreg.',
  tags: ['historie', 'embetsmann', 'eier', 'eponym', 'garmanngarden', 'kvadraturen', '1600_tallet'],
  placeId: 'garmanngarden',
  category: 'historie',
  year: 1647,
  popupDesc: 'Johan Garmann tok gården i Rådhusgata 7 i bruk som privatbolig i 1647. Årstallet står fortsatt i ankerjernene på fasaden og kan vise til utbyggingen som ga huset mye av det preget det senere ble kjent for. Gården fikk navn etter ham, slik at koblingen er både en direkte eier-, bygnings- og eponymforbindelse.',
  places: ['garmanngarden'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://oslobyleksikon.no/side/R%C3%A5dhusgata_7',
    'https://www.oppdagkvadraturen.no/stoppesteder/radhusgata-7-garmanngarden'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/gol_stavkirke_bygdoy/oscar_ii.json', [{
  id: 'oscar_ii',
  name: 'Oscar II',
  initials: 'OII',
  desc: 'Den svensk-norske kongen som mottok Gol stavkirke og finansierte gjenreisningen på Bygdøy.',
  tags: ['historie', 'kongemakt', 'kulturminnevern', 'friluftsmuseum', 'gol_stavkirke_bygdoy', 'bygdoy'],
  placeId: 'gol_stavkirke_bygdoy',
  category: 'historie',
  year: 1884,
  popupDesc: 'Fortidsminneforeningen ga den demonterte Gol stavkirke til kong Oscar II. Kongen bekostet gjenreisningen ved Bygdø Kongsgård i 1884–1885, og kirken ble kronen på verket i samlingen som regnes som et av verdens tidligste friluftsmuseer. Koblingen gjelder derfor hans konkrete eierskap, finansiering og museumsbygging på stedet.',
  places: ['gol_stavkirke_bygdoy'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://norskfolkemuseum.no/stavkirke',
    'https://norskfolkemuseum.no/gjenoppforing'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/gol_stavkirke_bygdoy/torolf_prytz.json', [{
  id: 'torolf_prytz',
  name: 'Torolf Prytz',
  initials: 'TP',
  desc: 'Arkitekten som utarbeidet de første generaltegningene for gjenreisningen av Gol stavkirke på Bygdøy.',
  tags: ['historie', 'arkitektur', 'restaurering', 'kulturminnevern', 'gol_stavkirke_bygdoy', 'bygdoy'],
  placeId: 'gol_stavkirke_bygdoy',
  category: 'historie',
  year: 1882,
  popupDesc: 'Fortidsminneforeningen engasjerte Torolf Prytz til å lage generaltegninger av Gol stavkirke i 1882–1883. Tegningsarbeidet dannet et tidlig grunnlag for flyttingen og den omfattende rekonstruksjonen på Bygdøy. Han er derfor et direkte dokumentasjons- og arkitektanker for den 1800-tallsformen kirken fikk.',
  places: ['gol_stavkirke_bygdoy'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://norskfolkemuseum.no/gjenoppforing',
    'https://nkl.snl.no/Waldemar_Hansteen'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/gol_stavkirke_bygdoy/waldemar_hansteen.json', [{
  id: 'waldemar_hansteen',
  name: 'Waldemar Hansteen',
  initials: 'WH',
  desc: 'Arkitekten som ledet gjenreisningen av Gol stavkirke og senere tegnet Centralbankens bankpalass.',
  tags: ['historie', 'arkitektur', 'restaurering', 'kulturminnevern', 'gol_stavkirke_bygdoy', 'centralbanken_kirkegata', 'finansarkitektur'],
  placeId: 'gol_stavkirke_bygdoy',
  category: 'historie',
  year: 1884,
  popupDesc: 'Waldemar Hansteen overtok arbeidet med å demontere Gol stavkirke og lede den restaurerte gjenreisningen på Bygdøy i 1884–1885. Der kildene manglet, brukte han blant annet Borgund stavkirke som forbilde. Senere ble han også den første arkitekten for Centralbankens monumentale nybygg i Kirkegata, oppført i etapper fra 1915. De to stedene viser ulike sider av hans virke: rekonstruksjon av middelalderarkitektur og moderne bankarkitektur.',
  places: ['gol_stavkirke_bygdoy', 'centralbanken_kirkegata'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://norskfolkemuseum.no/gjenoppforing',
    'https://nkl.snl.no/Waldemar_Hansteen',
    'https://www.oppdagkvadraturen.no/stoppesteder/kirkegata-14-16-18-banpalass-stil-og-arkitektur'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/kafe_grei/christian_brinch.json', [{
  id: 'christian_brinch',
  name: 'Christian Brinch',
  initials: 'CB',
  desc: 'Skipperen og rederen som oppførte gården i Skippergata 3, der Kafé Grei åpnet i 1837.',
  tags: ['naeringsliv', 'sjoefart', 'reder', 'byggherre', 'kafe_grei', 'skippergata', 'havnehistorie'],
  placeId: 'kafe_grei',
  category: 'naeringsliv',
  year: 1837,
  popupDesc: 'Christian Brinch oppførte den bevarte empiregården i Skippergata 3 i 1837 på utfylt havnegrunn. Kafé Grei startet skjenking i den høye kjelleren samme år. Som byggherre, skipper og reder er Brinch det direkte personankeret for både gårdens fysiske form og dens tilknytning til Christianias havneøkonomi.',
  places: ['kafe_grei'],
  image: '',
  cardImage: '',
  source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/kafe-grei-skippergata-3'],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/naeringsliv/oslo/kafe_grei/amalie_sofie_bekkevold.json', [{
  id: 'amalie_sofie_bekkevold',
  name: 'Amalie Sofie Bekkevold',
  initials: 'ASB',
  desc: 'Datteren i vertshusfamilien som møtte Henrik Wergeland i skjenkestedet i Skippergata 3.',
  tags: ['naeringsliv', 'litteraturhistorie', 'kafe_grei', 'henrik_wergeland', 'skippergata', '1838'],
  placeId: 'kafe_grei',
  category: 'naeringsliv',
  year: 1838,
  popupDesc: 'Amalie Sofie Bekkevolds far drev skjenkestue i Skippergata, og det var her hun møtte Henrik Wergeland i 1838. Møtet førte til forlovelse og ekteskap og ble et viktig biografisk og litteraturhistorisk lag ved Kafé Grei. Koblingen gjelder hennes dokumenterte tilstedeværelse i familiens vertshus, ikke bare hennes senere rolle som Wergelands ektefelle.',
  places: ['kafe_grei'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://www.oppdagkvadraturen.no/stoppesteder/kafe-grei-skippergata-3',
    'https://snl.no/Amalie_Sofie_Bekkevold'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/oslo_ladegard/karen_toller.json', [{
  id: 'karen_toller',
  name: 'Karen Toller',
  initials: 'KT',
  desc: 'Skipsrederen og godseieren som lot dagens Oslo ladegård oppføre i 1725.',
  tags: ['historie', 'naeringsliv', 'skipsreder', 'godseier', 'byggherre', 'oslo_ladegard', 'barokk'],
  placeId: 'oslo_ladegard',
  category: 'historie',
  year: 1725,
  popupDesc: 'Karen Toller kjøpte ladegårdsgodset og lot den nåværende barokkbygningen reise på murene etter den gamle bispegården i 1725. Som en av Christianias rikeste eiendomsbesittere gjorde hun hovedbygningen til et synlig uttrykk for økonomisk makt, eierskap og barokk representasjon. Hun er det direkte byggherre- og eierankeret for Oslo ladegård.',
  places: ['oslo_ladegard'],
  image: '',
  cardImage: '',
  source_urls: [
    'https://snl.no/Karen_Toller',
    'https://oslobyleksikon.no/side/Oslo_Ladeg%C3%A5rd'
  ],
  verifiedAt: '2026-07-25'
}]);

writeJson('data/people/historie/oslo/oslo_ladegard/caspar_herman_von_storm.json', [{
  id: 'caspar_herman_von_storm',
  name: 'Caspar Herman von Storm',
  initials: 'CHS',
  desc: 'Eieren som arvet Oslo ladegård og oppførte den lavere sidefløyen omkring 1770.',
  tags: ['historie', 'eier', 'byggherre', 'oslo_ladegard', 'barokk', '1700_tallet'],
  placeId: 'oslo_ladegard',
  category: 'historie',
  year: 1770,
  popupDesc: 'Caspar Herman von Storm arvet Oslo ladegård i 1764 etter sin mor Helene Margrethe. Omkring 1770 lot han oppføre den lavere fløyen ved siden av den symmetriske hovedbygningen. Koblingen gjelder dermed en konkret, fortsatt lesbar utvidelse av anlegget og et dokumentert eierskap til stedet.',
  places: ['oslo_ladegard'],
  image: '',
  cardImage: '',
  source_urls: ['https://oslobyleksikon.no/side/Oslo_Ladeg%C3%A5rd'],
  verifiedAt: '2026-07-25'
}]);

const haugePath = 'data/people/historie/oslo/hauges_minde/hans_nielsen_hauge.json';
const haugeRecords = readJson(haugePath) as Array<Record<string, unknown>>;
const hauge = haugeRecords.find(record => record.id === 'hans_nielsen_hauge');
if (!hauge) throw new Error('Missing canonical Hans Nielsen Hauge record');
hauge.tags = unique([...(Array.isArray(hauge.tags) ? hauge.tags : []), 'garmanngarden', 'fengsel', 'politihistorie']);
hauge.places = unique([...(Array.isArray(hauge.places) ? hauge.places : []), 'garmanngarden']);
hauge.popupDesc = `${String(hauge.popupDesc)} Garmanngården legges til som et direkte fengselsanker: Hauge satt fengslet i en bakbygning ved gården fra 1804 til 1807 under den langvarige rettsforfølgelsen av virksomheten hans.`;
hauge.source_urls = unique([...(Array.isArray(hauge.source_urls) ? hauge.source_urls : []), 'https://www.oppdagkvadraturen.no/stoppesteder/radhusgata-7-garmanngarden']);
hauge.verifiedAt = '2026-07-25';
writeJson(haugePath, haugeRecords);

const bullPath = 'data/people/by/oslo/people_by_oslo.json';
const bullRecords = readJson(bullPath) as Array<Record<string, unknown>>;
const bull = bullRecords.find(record => record.id === 'henrik_bull');
if (!bull) throw new Error('Missing canonical Henrik Bull record');
bull.tags = unique([...(Array.isArray(bull.tags) ? bull.tags : []), 'centralbanken_kirkegata', 'bankarkitektur', 'nybarokk']);
bull.places = unique([...(Array.isArray(bull.places) ? bull.places : []), 'centralbanken_kirkegata']);
bull.popupDesc = `${String(bull.popupDesc)} Centralbanken i Kirkegata legges til som et direkte arkitektanker: Bull fullførte bankpalasset etter Waldemar Hansteen, og bygningen ble reist i to etapper mellom 1915 og 1921.`;
bull.source_urls = unique([...(Array.isArray(bull.source_urls) ? bull.source_urls : []), 'https://www.oppdagkvadraturen.no/stoppesteder/kirkegata-14-16-18-banpalass-stil-og-arkitektur']);
bull.verifiedAt = '2026-07-25';
writeJson(bullPath, bullRecords);

const wergelandPath = 'data/people/litteratur/oslo/people_litteratur_oslo.json';
const wergelandRecords = readJson(wergelandPath) as Array<Record<string, unknown>>;
const wergeland = wergelandRecords.find(record => record.id === 'henrik_wergeland');
if (!wergeland) throw new Error('Missing canonical Henrik Wergeland record');
wergeland.tags = unique([...(Array.isArray(wergeland.tags) ? wergeland.tags : []), 'kafe_grei', 'skippergata', 'amalie_sofie_bekkevold']);
wergeland.places = unique([...(Array.isArray(wergeland.places) ? wergeland.places : []), 'kafe_grei']);
wergeland.popupDesc = `${String(wergeland.popupDesc)} Kafé Grei i Skippergata 3 legges til som et direkte biografisk anker: Wergeland oppbevarte årer og seil ved vertshuset og møtte Amalie Sofie Bekkevold der i 1838.`;
wergeland.source_urls = unique([...(Array.isArray(wergeland.source_urls) ? wergeland.source_urls : []), 'https://www.oppdagkvadraturen.no/stoppesteder/kafe-grei-skippergata-3']);
wergeland.verifiedAt = '2026-07-25';
writeJson(wergelandPath, wergelandRecords);

const treschowPath = 'data/people/natur/oslo/people_natur_oslo.json';
const treschowRecords = readJson(treschowPath) as Array<Record<string, unknown>>;
const treschow = treschowRecords.find(record => record.id === 'gerhard_treschow_bjoelsen');
if (!treschow) throw new Error('Missing canonical Gerhard Treschow record');
treschow.tags = unique([...(Array.isArray(treschow.tags) ? treschow.tags : []), 'treschowgarden', 'kvadraturen', 'handel', 'barokk']);
treschow.places = unique([...(Array.isArray(treschow.places) ? treschow.places : []), 'treschowgarden']);
treschow.popupDesc = `${String(treschow.popupDesc)} Treschowgården legges til som hans direkte bolig- og byggherreanker: Gerhard Treschow fikk den representative barokkgården ved Bjørvika oppført i 1710 som kjøpmanns- og forretningseiendom.`;
treschow.source_urls = unique([...(Array.isArray(treschow.source_urls) ? treschow.source_urls : []), 'https://www.oppdagkvadraturen.no/stoppesteder/treschowgarden-fred-olsens-gate-2']);
treschow.verifiedAt = '2026-07-25';
writeJson(treschowPath, treschowRecords);

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
if (after.logicalPeople !== before.logicalPeople + 8) {
  throw new Error(`Unexpected logical People delta: ${before.logicalPeople} -> ${after.logicalPeople}`);
}

const uncoveredIds = new Set((coverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (uncoveredIds.has(placeId)) throw new Error(`Target place remains uncovered: ${placeId}`);
}

const expectedIds = [
  'johan_garmann', 'hans_nielsen_hauge', 'oscar_ii', 'torolf_prytz', 'waldemar_hansteen',
  'henrik_bull', 'christian_brinch', 'henrik_wergeland', 'amalie_sofie_bekkevold',
  'gerhard_treschow_bjoelsen', 'karen_toller', 'caspar_herman_von_storm'
];
const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of expectedIds) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication People index`);
}

fs.writeFileSync('reports/people-oslo-zero-gap-batch5-validation.md', `# Oslo People zero-gap batch 5 – validation\n\n## Target places\n\n- \`garmanngarden\` → new \`johan_garmann\`; reused \`hans_nielsen_hauge\`\n- \`gol_stavkirke_bygdoy\` → new \`oscar_ii\`, \`torolf_prytz\` and \`waldemar_hansteen\`\n- \`centralbanken_kirkegata\` → new \`waldemar_hansteen\`; reused \`henrik_bull\`\n- \`kafe_grei\` → new \`christian_brinch\` and \`amalie_sofie_bekkevold\`; reused \`henrik_wergeland\`\n- \`treschowgarden\` → reused \`gerhard_treschow_bjoelsen\`\n- \`oslo_ladegard\` → new \`karen_toller\` and \`caspar_herman_von_storm\`\n\n## Repository audit\n\nThe candidate audit scanned 702 People JSON files and 1,370 id/name records. Hans Nielsen Hauge, Henrik Wergeland and Gerhard Treschow had one existing record each and are reused. Henrik Bull had two pre-existing records; this batch reuses the established \`henrik_bull\` record and creates no third duplicate. The other eight candidates had no canonical or legacy id/name matches. None of the six target place IDs had an existing People link.\n\n## Research gate\n\n- Johan Garmann took Rådhusgata 7 into use in 1647 and gave Garmanngården its name; Hans Nielsen Hauge was imprisoned in a rear building there from 1804 to 1807.\n- Oscar II financed the re-erection of Gol stave church; Torolf Prytz prepared the initial general drawings, and Waldemar Hansteen led dismantling and reconstruction on Bygdøy.\n- Waldemar Hansteen and Henrik Bull were the two architects of Centralbanken's 1915–1921 bank palace.\n- Christian Brinch built Skippergata 3; Henrik Wergeland met Amalie Sofie Bekkevold in the family's tavern there in 1838.\n- Gerhard Treschow commissioned Treschowgården in 1710 as a representative merchant property.\n- Karen Toller built the present Oslo Ladegård in 1725; Caspar Herman von Storm added the lower side wing around 1770.\n\n## Coverage gate\n\n- Required non-nature Oslo places: ${before.requiredNonNaturePlaces} → ${after.requiredNonNaturePlaces}\n- Covered required Oslo places: ${before.coveredRequiredPlaces} → ${after.coveredRequiredPlaces}\n- Uncovered required Oslo places: ${before.uncoveredRequiredPlaces} → ${after.uncoveredRequiredPlaces}\n- Logical People: ${before.logicalPeople} → ${after.logicalPeople}\n- New logical People: 8\n- Reused canonical People: 4\n`);

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
