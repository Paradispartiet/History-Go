import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file: string, value: unknown) => {
  fs.mkdirSync(file.substring(0, file.lastIndexOf('/')), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };

const oldHouse = 'people/popkultur/oslo/house_of_nerds/house_of_nerds_miljoet.json';
const oldLatter = 'people/popkultur/oslo/latter/latter_standupmiljoet.json';
const newHouse = 'people/popkultur/oslo/house_of_nerds/andreas_sollund.json';
const newLatter = 'people/popkultur/oslo/latter/elina_krantz.json';

const replaceManifestEntry = (oldPath: string, newPath: string) => {
  const index = manifest.files.indexOf(oldPath);
  if (index === -1) throw new Error(`Expected manifest entry missing: ${oldPath}`);
  if (manifest.files.includes(newPath)) throw new Error(`New manifest entry already exists: ${newPath}`);
  manifest.files[index] = newPath;
};

replaceManifestEntry(oldHouse, newHouse);
replaceManifestEntry(oldLatter, newLatter);
writeJson(manifestPath, manifest);

for (const file of [
  'data/people/popkultur/oslo/house_of_nerds/house_of_nerds_miljoet.json',
  'data/people/popkultur/oslo/latter/latter_standupmiljoet.json'
]) {
  if (!fs.existsSync(file)) throw new Error(`Expected migrated collective file missing: ${file}`);
  fs.unlinkSync(file);
}

writeJson('data/people/popkultur/oslo/house_of_nerds/andreas_sollund.json', [
  {
    id: 'andreas_sollund',
    name: 'Andreas Sollund',
    initials: 'AS',
    desc: 'Gründer og prosjektleder bak House of Nerds, med direkte tilknytning til spillhuset på Vulkan.',
    tags: [
      'populaerkultur',
      'spill',
      'e_sport',
      'nerdkultur',
      'moteplass',
      'grunder',
      'house_of_nerds',
      'vulkan'
    ],
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
    tags: [
      'populaerkultur',
      'standup',
      'humor',
      'scene',
      'produsent',
      'grunder',
      'latter',
      'aker_brygge'
    ],
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

const validation = `# Oslo People zero-gap batch 1\n\n## Mål\n\nLukke seks direkte og dokumenterbare Oslo-hull med relevante personer. Nye navngitte People foretrekkes når stedet har en dokumentert skaper eller grunnlegger; gjenbruk brukes når en eksisterende canonical person allerede har den sterkeste koblingen.\n\n## Resultat\n\n- \`emanuel_vigeland_mausoleum\` → \`emanuel_vigeland\` (canonical reuse; kunstner, byggherre og gravlagt i mausoleet)\n- \`ibsen_quotes\` → \`henrik_ibsen\` (canonical reuse; tekstgrunnlaget for verket)\n- \`ibsen_quotes\` → \`ingrid_falk\` (ny; medskaper av kunstverket)\n- \`ibsen_quotes\` → \`gustavo_aguerre\` (ny; medskaper av kunstverket)\n- \`inger_hagerups_plass\` → \`inger_hagerup\` (canonical reuse; navngitt plass ved boligen hennes)\n- \`bla_skilt_aud_schonemann_vetlandsveien_69d\` → \`aud_schonemann\` (migrert og skjerpet; skiltet står ved hjemstedet)\n- \`house_of_nerds\` → \`andreas_sollund\` (ny; grunnlegger og dokumentert kontaktperson for Vulkan-stedet)\n- \`latter\` → \`elina_krantz\` (ny; grunnlegger av Stand Up Norge og Latter på Aker Brygge)\n\n## Kvalitetsgate\n\n- Ingen person er lagt til på grunnlag av en løs Oslo-, kategori- eller bransjeassosiasjon.\n- Emanuel Vigeland, Henrik Ibsen og Inger Hagerup gjenbrukes fordi de eksisterende canonical identitetene har direkte stedskoblinger.\n- Ingrid Falk, Gustavo Aguerre, Andreas Sollund og Elina Krantz er nye canonical People etter repo-wide ID- og navneaudit.\n- Aud Schønemann migreres fra en ulistet legacy-fil, men hennes tidligere generiske NRK-anker erstattes av det konkrete blå skiltet ved hjemstedet.\n- De kollektive placeholderne \`house_of_nerds_miljoet\` og \`latter_standupmiljoet\` er fjernet til fordel for dokumenterte navngitte grunnleggere.\n- Bård Tufte Johansen, Harald Eia og tilfeldige Latter-komikere importeres ikke fordi de gamle begrunnelsene ikke dokumenterer en presis fysisk stedrolle.\n`;
fs.writeFileSync('reports/people-oslo-zero-gap-batch1-validation.md', validation);

const run = (command: string, args: string[]) => {
  execFileSync(command, args, { stdio: 'inherit' });
};

run('npx', ['tsx', 'scripts/build-civication-history-people-index.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-latent-coverage.mts']);

const coverage = readJson('reports/oslo-people-coverage.json');
if (coverage.summary?.requiredUncovered !== 185) {
  throw new Error(`Expected 185 uncovered Oslo places, got ${coverage.summary?.requiredUncovered}`);
}

const peopleIndex = readJson('data/Civication/historyPeople_index.json');
const indexText = JSON.stringify(peopleIndex);
for (const id of ['andreas_sollund', 'elina_krantz']) {
  if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication index`);
}
for (const id of ['house_of_nerds_miljoet', 'latter_standupmiljoet']) {
  if (indexText.includes(`\"${id}\"`)) throw new Error(`Removed collective ${id} still present in Civication index`);
}

run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
