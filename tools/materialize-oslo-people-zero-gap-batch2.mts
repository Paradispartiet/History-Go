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

const targetPlaceIds = ['wessels_plass', 'egertorget', 'grev_wedels_plass', 'kampen_kirke', 'sofienberg_kirke', 'ostbanestasjonen'];

run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
const baselineCoverage = readJson('reports/oslo-people-coverage.json');
const baselineTotals = baselineCoverage.totals;
const baselineUncoveredIds = new Set((baselineCoverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (!baselineUncoveredIds.has(placeId)) throw new Error(`Target place was not uncovered at baseline: ${placeId}`);
}

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };
const newManifestEntries = [
  'people/by/oslo/wessels_plass/johan_herman_wessel.json',
  'people/by/oslo/egertorget/herman_eger.json',
  'people/by/oslo/egertorget/thorvald_eger.json',
  'people/by/oslo/ostbanestasjonen/georg_bull.json'
];
for (const entry of newManifestEntries) {
  if (manifest.files.includes(entry)) throw new Error(`Manifest entry already exists: ${entry}`);
  manifest.files.push(entry);
}
writeJson(manifestPath, manifest);

writeJson('data/people/by/oslo/wessels_plass/johan_herman_wessel.json', [
  {
    id: 'johan_herman_wessel',
    name: 'Johan Herman Wessel',
    initials: 'JHW',
    desc: 'Dikteren som Wessels plass fikk navn etter i 1891.',
    tags: ['by', 'litteratur', 'dikter', 'eponym', 'wessels_plass', 'kvadraturen'],
    placeId: 'wessels_plass',
    category: 'by',
    year: 1891,
    popupDesc: 'Johan Herman Wessel er det direkte personankeret for Wessels plass. Plassen het tidligere Stortingspladsen, men fikk i 1891 navn etter den dansk-norske dikteren. Navngivningen gjør plassen til et fysisk minnespor etter Wessel ved Stortinget og knytter byrommet til 1700-tallets dansk-norske litteratur.',
    places: ['wessels_plass'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.oppdagkvadraturen.no/stoppesteder/wessels-plass',
      'https://snl.no/Johan_Herman_Wessel'
    ],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/by/oslo/egertorget/herman_eger.json', [
  {
    id: 'herman_eger',
    name: 'Herman Eger',
    initials: 'HE',
    desc: 'En av bryggerbrødrene som Egertorget er oppkalt etter.',
    tags: ['by', 'naeringsliv', 'bryggeri', 'eponym', 'egertorget', 'karl_johan'],
    placeId: 'egertorget',
    category: 'by',
    year: 1846,
    popupDesc: 'Herman Eger er sammen med broren Thorvald et direkte personanker for Egertorget. Brødrene holdt til i Karl Johans gate 20 og drev Egers bryggeri fram til 1870. Plassen som oppsto da Østre gate og Slottsveien ble knyttet sammen, fikk navn etter dem og Egergården som tidligere lå i gateløpet.',
    places: ['egertorget'],
    image: '',
    cardImage: '',
    source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/egertorget'],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/by/oslo/egertorget/thorvald_eger.json', [
  {
    id: 'thorvald_eger',
    name: 'Thorvald Eger',
    initials: 'TE',
    desc: 'En av bryggerbrødrene som Egertorget er oppkalt etter.',
    tags: ['by', 'naeringsliv', 'bryggeri', 'eponym', 'egertorget', 'karl_johan'],
    placeId: 'egertorget',
    category: 'by',
    year: 1846,
    popupDesc: 'Thorvald Eger er sammen med broren Herman et direkte personanker for Egertorget. Brødrene holdt til i Karl Johans gate 20 og drev Egers bryggeri fram til 1870. Plassen som oppsto da Østre gate og Slottsveien ble knyttet sammen, fikk navn etter dem og Egergården som tidligere lå i gateløpet.',
    places: ['egertorget'],
    image: '',
    cardImage: '',
    source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/egertorget'],
    verifiedAt: '2026-07-25'
  }
]);

writeJson('data/people/by/oslo/ostbanestasjonen/georg_bull.json', [
  {
    id: 'georg_bull',
    name: 'Georg Andreas Bull',
    initials: 'GAB',
    desc: 'Arkitekten bak den bevarte Østbanestasjonen fra 1882.',
    tags: ['by', 'arkitektur', 'jernbane', 'stasjon', 'ostbanestasjonen', 'jernbanetorget', '1800_tallet'],
    placeId: 'ostbanestasjonen',
    category: 'by',
    year: 1882,
    popupDesc: 'Georg Andreas Bull tegnet dagens Østbanestasjon, ferdigstilt i 1882 da anlegget måtte utvides for Østfoldbanen. Han la hovedinngangen i forlengelsen av Karl Johans gates midtlinje og gjorde stasjonen til en monumental avslutning på hovedstadens paradeakse. Koblingen gjelder den konkrete, fredede 1882-bygningen som i dag er Østbanehallen.',
    places: ['ostbanestasjonen'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://www.oppdagkvadraturen.no/stoppesteder/ostbanehallen',
      'https://snl.no/Georg_Andreas_Bull'
    ],
    verifiedAt: '2026-07-25'
  }
]);

const wedelPath = 'data/people/politikk/akershus/eidsvollsbygningen/herman_wedel_jarlsberg.json';
const wedelRecords = readJson(wedelPath) as Array<Record<string, unknown>>;
const wedel = wedelRecords.find(record => record.id === 'herman_wedel_jarlsberg');
if (!wedel) throw new Error('Missing canonical Herman Wedel Jarlsberg record');
wedel.tags = unique([...(Array.isArray(wedel.tags) ? wedel.tags : []), 'grev_wedels_plass', 'eponym', 'oslo']);
wedel.places = unique([...(Array.isArray(wedel.places) ? wedel.places : []), 'grev_wedels_plass']);
wedel.popupDesc = `${String(wedel.popupDesc)} Grev Wedels plass i Oslo legges til som et direkte eponymanker: parken har navn etter Herman Wedel Jarlsberg og gjør hans rolle som stortingspresident, jernverkseier, amtmann, finansminister og stattholder synlig i hovedstadens byrom.`;
wedel.source_urls = unique([...(Array.isArray(wedel.source_urls) ? wedel.source_urls : []), 'https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass', 'https://snl.no/Herman_Wedel_Jarlsberg']);
wedel.verifiedAt = '2026-07-25';
writeJson(wedelPath, wedelRecords);

const nordanPath = 'data/people/politikk/oslo/people_politikk_oslo.json';
const nordanRecords = readJson(nordanPath) as Array<Record<string, unknown>>;
const nordan = nordanRecords.find(record => record.id === 'jacob_wilhelm_nordan');
if (!nordan) throw new Error('Missing canonical Jacob Wilhelm Nordan record');
nordan.desc = 'Arkitekt bak Youngstorgets basar, Kampen kirke, Sofienberg kirke og flere sentrale offentlige bygg.';
nordan.tags = unique([...(Array.isArray(nordan.tags) ? nordan.tags : []), 'kampen_kirke', 'sofienberg_kirke']);
nordan.places = unique([...(Array.isArray(nordan.places) ? nordan.places : []), 'kampen_kirke', 'sofienberg_kirke']);
nordan.popupDesc = `${String(nordan.popupDesc)} Kampen kirke og Sofienberg kirke legges til som to direkte hovedverk innen kirkearkitekturen: begge ble oppført etter Nordans tegninger, henholdsvis i 1882 og 1877.`;
nordan.source_urls = unique([...(Array.isArray(nordan.source_urls) ? nordan.source_urls : []), 'https://oslobyleksikon.no/side/Kampen_kirke', 'https://oslobyleksikon.no/side/Sofienberg_kirke']);
nordan.verifiedAt = '2026-07-25';
writeJson(nordanPath, nordanRecords);

run('npx', ['tsx', 'scripts/build-civication-history-people-index.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-latent-people-coverage.mts']);

const coverage = readJson('reports/oslo-people-coverage.json');
const totals = coverage.totals;
if (totals?.requiredNonNaturePlaces !== baselineTotals?.requiredNonNaturePlaces) {
  throw new Error(`Required Oslo place total changed during batch: ${JSON.stringify({ baseline: baselineTotals, after: totals })}`);
}
if (totals?.coveredRequiredPlaces !== baselineTotals?.coveredRequiredPlaces + 6) {
  throw new Error(`Expected exactly six newly covered Oslo places: ${JSON.stringify({ baseline: baselineTotals, after: totals })}`);
}
if (totals?.uncoveredRequiredPlaces !== baselineTotals?.uncoveredRequiredPlaces - 6) {
  throw new Error(`Expected exactly six fewer uncovered Oslo places: ${JSON.stringify({ baseline: baselineTotals, after: totals })}`);
}
if (totals?.logicalPeople !== baselineTotals?.logicalPeople + 4) {
  throw new Error(`Expected exactly four new logical People: ${JSON.stringify({ baseline: baselineTotals, after: totals })}`);
}

const uncoveredIds = new Set((coverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) {
  if (uncoveredIds.has(placeId)) throw new Error(`Target place remains uncovered: ${placeId}`);
}

const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of ['johan_herman_wessel', 'herman_eger', 'thorvald_eger', 'herman_wedel_jarlsberg', 'jacob_wilhelm_nordan', 'georg_bull']) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication People index`);
}

fs.writeFileSync('reports/people-oslo-zero-gap-batch2-validation.md', `# Oslo People zero-gap batch 2 – validation\n\n## Target places\n\n- \`wessels_plass\` → new \`johan_herman_wessel\`\n- \`egertorget\` → new \`herman_eger\` and \`thorvald_eger\`\n- \`grev_wedels_plass\` → reused \`herman_wedel_jarlsberg\`\n- \`kampen_kirke\` → reused \`jacob_wilhelm_nordan\`\n- \`sofienberg_kirke\` → reused \`jacob_wilhelm_nordan\`\n- \`ostbanestasjonen\` → new \`georg_bull\` (display name Georg Andreas Bull)\n\n## Repository audit\n\nThe candidate audit scanned 680 People JSON files and 1,321 id/name records. Herman Wedel Jarlsberg and Jacob Wilhelm Nordan had unique canonical records and are reused. Johan Herman Wessel, Herman Eger, Thorvald Eger and Georg Bull had no canonical or legacy id/name matches and are added as new People. None of the six target place IDs had an existing People link.\n\n## Research gate\n\n- Wessels plass received its current name in 1891 after Johan Herman Wessel.\n- Egertorget is named after brothers Herman and Thorvald Eger, who operated Egers brewery from Karl Johans gate 20.\n- Grev Wedels plass is named after Herman Wedel Jarlsberg.\n- Kampen kirke and Sofienberg kirke were both built from Jacob Wilhelm Nordan's designs.\n- The canonical Østbanestasjonen place represents Georg Bull's preserved 1882 building. Heinrich Schirmer and Wilhelm von Hanno are not added because they designed the smaller 1854 predecessor, not the canonical 1882 station building.\n\n## Coverage gate\n\n- Required non-nature Oslo places: ${baselineTotals.requiredNonNaturePlaces} → ${totals.requiredNonNaturePlaces}\n- Covered required Oslo places: ${baselineTotals.coveredRequiredPlaces} → ${totals.coveredRequiredPlaces}\n- Uncovered required Oslo places: ${baselineTotals.uncoveredRequiredPlaces} → ${totals.uncoveredRequiredPlaces}\n- Logical People: ${baselineTotals.logicalPeople} → ${totals.logicalPeople}\n- New logical People: 4\n- Reused canonical People: 2\n`);

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
