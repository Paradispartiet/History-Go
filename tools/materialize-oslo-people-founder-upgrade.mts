import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file: string, value: unknown) => {
  const slash = file.lastIndexOf('/');
  if (slash !== -1) fs.mkdirSync(file.slice(0, slash), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const run = (command: string, args: string[]) => execFileSync(command, args, { stdio: 'inherit' });

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };

const replacements = [
  {
    oldManifest: 'people/popkultur/oslo/house_of_nerds/house_of_nerds_miljoet.json',
    oldFile: 'data/people/popkultur/oslo/house_of_nerds/house_of_nerds_miljoet.json',
    newManifest: 'people/popkultur/oslo/house_of_nerds/andreas_sollund.json',
    newFile: 'data/people/popkultur/oslo/house_of_nerds/andreas_sollund.json'
  },
  {
    oldManifest: 'people/popkultur/oslo/latter/latter_standupmiljoet.json',
    oldFile: 'data/people/popkultur/oslo/latter/latter_standupmiljoet.json',
    newManifest: 'people/popkultur/oslo/latter/elina_krantz.json',
    newFile: 'data/people/popkultur/oslo/latter/elina_krantz.json'
  }
];

for (const replacement of replacements) {
  const index = manifest.files.indexOf(replacement.oldManifest);
  if (index === -1) throw new Error(`Missing manifest entry: ${replacement.oldManifest}`);
  if (manifest.files.includes(replacement.newManifest)) throw new Error(`Duplicate target manifest entry: ${replacement.newManifest}`);
  if (!fs.existsSync(replacement.oldFile)) throw new Error(`Missing old record: ${replacement.oldFile}`);
  manifest.files[index] = replacement.newManifest;
  fs.unlinkSync(replacement.oldFile);
}
writeJson(manifestPath, manifest);

writeJson('data/people/popkultur/oslo/house_of_nerds/andreas_sollund.json', [
  {
    id: 'andreas_sollund',
    name: 'Andreas Sollund',
    initials: 'AS',
    desc: 'Gründer og prosjektleder bak House of Nerds, med direkte tilknytning til spillhuset på Vulkan.',
    tags: ['populaerkultur', 'spill', 'e_sport', 'nerdkultur', 'moteplass', 'grunder', 'house_of_nerds', 'vulkan'],
    placeId: 'house_of_nerds',
    category: 'populaerkultur',
    year: 2019,
    popupDesc: 'Andreas Sollund er en av grunnleggerne bak House of Nerds og ledet prosjektet da konseptet ble utviklet som en fysisk møteplass for spill- og teknologimiljøer. House of Nerds oppgir ham som kontaktperson for Vulkan-stedet, som åpnet i desember 2019. Koblingen gjelder dermed både etableringen av konseptet og den konkrete Oslo-arenaen på Vulkan.',
    places: ['house_of_nerds'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://houseofnerds.no/about-us',
      'https://houseofnerds.no/house-of-nerds-oslo-vulkan',
      'https://www.gamer.no/artikler/vil-starte-samlingssted-for-spillinteresserte-i-oslo/137236'
    ],
    verifiedAt: '2026-07-24'
  }
]);

writeJson('data/people/popkultur/oslo/latter/elina_krantz.json', [
  {
    id: 'elina_krantz',
    name: 'Elina Krantz',
    initials: 'EK',
    desc: 'Grunnleggeren av Stand Up Norge og underholdningshuset Latter på Aker Brygge.',
    tags: ['populaerkultur', 'standup', 'humor', 'scene', 'produsent', 'grunder', 'latter', 'aker_brygge'],
    placeId: 'latter',
    category: 'populaerkultur',
    year: 2004,
    popupDesc: 'Elina Krantz er det direkte personankeret for Latter. Etter å ha grunnlagt Stand Up Norge i 1997 åpnet hun Latter på Aker Brygge i august 2004 som hovedstadens første rendyrkede underholdningshus for standup og humor. Latter omtaler henne selv som personen bak ideen og grunnleggeren av huset.',
    places: ['latter'],
    image: '',
    cardImage: '',
    source_urls: [
      'https://latter.no/historien-v%C3%A5r',
      'https://latter.no/restaurant-aker-brygge',
      'https://latter.no/om-oss'
    ],
    verifiedAt: '2026-07-24'
  }
]);

fs.writeFileSync('reports/people-oslo-zero-gap-batch1-founder-upgrade.md', `# Oslo People zero-gap batch 1 – named-founder upgrade\n\n## Endring\n\nTo kollektive placeholder-records fra batch 1 er erstattet med dokumenterte, navngitte grunnleggere:\n\n- \`house_of_nerds_miljoet\` → \`andreas_sollund\`\n- \`latter_standupmiljoet\` → \`elina_krantz\`\n\n## Begrunnelse\n\n- Andreas Sollund er dokumentert som grunnlegger og prosjektleder bak House of Nerds, og House of Nerds oppgir ham som kontaktperson for Vulkan-stedet.\n- Elina Krantz grunnla Stand Up Norge i 1997 og Latter på Aker Brygge i 2004; Latter omtaler henne selv som personen bak ideen og grunnleggeren av huset.\n- Begge personene er nye canonical People-ID-er etter repo-wide ID- og navnesøk.\n- Dekningen beholdes på seks lukkede Oslo-hull i batch 1, men personkvaliteten økes fra generiske miljøankre til direkte navngitte aktører.\n\n## Gate\n\n- Ingen løs bransjeassosiasjon.\n- Ingen tilfeldig utøver valgt fordi vedkommende har opptrådt eller besøkt stedet.\n- Grunnlegger-/etablererrollen må være dokumentert.\n- Primærankeret er den konkrete Oslo-arenaen.\n`);

run('npx', ['tsx', 'scripts/build-civication-history-people-index.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-latent-people-coverage.mts']);

const coverage = readJson('reports/oslo-people-coverage.json');
if (coverage.totals?.coveredRequiredPlaces !== 148 || coverage.totals?.uncoveredRequiredPlaces !== 185) {
  throw new Error(`Unexpected coverage: ${JSON.stringify(coverage.totals)}`);
}

const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of ['andreas_sollund', 'elina_krantz']) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication index`);
}
for (const id of ['house_of_nerds_miljoet', 'latter_standupmiljoet']) {
  if (indexText.includes(`\"${id}\"`)) throw new Error(`Removed collective ${id} still present in Civication index`);
}

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
