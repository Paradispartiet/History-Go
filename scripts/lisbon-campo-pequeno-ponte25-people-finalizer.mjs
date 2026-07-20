#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SELF = path.join(ROOT, 'scripts/lisbon-campo-pequeno-ponte25-people-finalizer.mjs');
const MANIFEST_FILE = path.join(ROOT, 'data/people/manifest.json');
const SALAZAR_FILE = path.join(ROOT, 'data/people/politikk/europe/portugal/lisbon/people_politikk_lisbon.json');
const REPORT_FILE = path.join(ROOT, 'reports/people-lisbon-campo-pequeno-ponte25-batch1-validation.md');
const NEW_REL = 'people/by/europe/portugal/lisbon/campo_pequeno/antonio_jose_dias_da_silva.json';
const NEW_FILE = path.join(ROOT, 'data', NEW_REL);
const NEW_ID = 'antonio_jose_dias_da_silva';
const SALAZAR_ID = 'antonio_de_oliveira_salazar';
const CAMPO_PLACE = 'lisbon_campo_pequeno';
const BRIDGE_PLACE = 'lisbon_ponte_25_de_abril';

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

function topLevelPeople(parsed) {
  if (Array.isArray(parsed)) return parsed.filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string') return [parsed];
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.people)) return parsed.people;
  return [];
}

const peopleJsonFiles = walk(path.join(ROOT, 'data/people')).filter((file) => file.endsWith('.json'));
const matches = new Map();
for (const file of peopleJsonFiles) {
  let parsed;
  try {
    parsed = readJson(file);
  } catch {
    continue;
  }
  for (const person of topLevelPeople(parsed)) {
    if (!matches.has(person.id)) matches.set(person.id, []);
    matches.get(person.id).push(path.relative(ROOT, file));
  }
}

if ((matches.get(NEW_ID) ?? []).length !== 0) {
  throw new Error(`Refusing duplicate ${NEW_ID}: ${(matches.get(NEW_ID) ?? []).join(', ')}`);
}
if ((matches.get(SALAZAR_ID) ?? []).length !== 1) {
  throw new Error(`Expected exactly one ${SALAZAR_ID}, found ${(matches.get(SALAZAR_ID) ?? []).length}: ${(matches.get(SALAZAR_ID) ?? []).join(', ')}`);
}
if (fs.existsSync(NEW_FILE)) throw new Error(`${NEW_REL} already exists`);

const architect = [
  {
    id: NEW_ID,
    name: 'António José Dias da Silva',
    initials: 'AJDS',
    desc: 'Arkitekten bak Praça de Touros do Campo Pequeno, den nymauriske arenaen som åpnet i 1892.',
    tags: [
      'by',
      'arkitektur',
      'nymaurisk_stil',
      'campo_pequeno',
      'arena',
      '1800_tallet'
    ],
    placeId: CAMPO_PLACE,
    category: 'by',
    year: 1892,
    popupDesc: 'António José Dias da Silva er et direkte personanker for Campo Pequeno fordi han tegnet den nåværende arenaen som ble innviet i 1892. Koblingen gjelder selve bygningen og dens nymauriske arkitektur, ikke en generell tilknytning til Lisboa eller tyrefekting. I History Go brukes han derfor som arkitektur- og byhistorisk inngang til hvordan et stort publikumsbygg fra slutten av 1800-tallet senere er blitt restaurert og ombrukt som flerbruksarena.',
    places: [CAMPO_PLACE],
    image: '',
    cardImage: '',
    source_urls: [
      'https://campopequeno.com/tauromaquia/noticia/campo-pequeno-124-anos-de-historia-cultura-e-tradicao',
      'https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=74571'
    ]
  }
];
writeJson(NEW_FILE, architect);

const manifest = readJson(MANIFEST_FILE);
if (!Array.isArray(manifest.files)) throw new Error('data/people/manifest.json must contain files[]');
if (manifest.files.includes(NEW_REL)) throw new Error(`${NEW_REL} already registered`);
manifest.files.push(NEW_REL);
writeJson(MANIFEST_FILE, manifest);

const politicsRows = readJson(SALAZAR_FILE);
if (!Array.isArray(politicsRows)) throw new Error('Expected Lisbon politics people file to be an array');
const salazar = politicsRows.find((row) => row?.id === SALAZAR_ID);
if (!salazar) throw new Error(`Missing ${SALAZAR_ID} in canonical aggregate`);

salazar.tags = Array.from(new Set([...(salazar.tags ?? []), 'ponte_25_de_abril', 'infrastrukturhistorie']));
salazar.places = Array.from(new Set([...(salazar.places ?? []), BRIDGE_PLACE]));
salazar.popupDesc = 'António de Oliveira Salazar var hovedfiguren bak Estado Novo, det autoritære regimet som styrte Portugal i store deler av 1900-tallet. Assembleia da República er riktig institusjonelt hovedanker fordi Portugals parlamentariske historie må forstås i kontrast til diktaturet. Museu do Aljube brukes som sekundært anker for undertrykkelse, politisk fengsling og demokratisk minnearbeid. Ponte 25 de Abril legges til som en kritisk sekundær stedstilknytning fordi broen ved innvielsen i 1966 bar navnet Ponte Salazar til hans ære, og Salazar selv deltok ved åpningsseremonien. Koblingen skal leses som regimesymbolikk og politisk infrastrukturhistorie, ikke som hedersmarkering.';
salazar.source_urls = Array.from(new Set([
  ...(salazar.source_urls ?? []),
  'https://servicos.infraestruturasdeportugal.pt/pt-pt/a-descobrir/obras-de-arte/ponte-25-de-abril/inauguracao'
]));
writeJson(SALAZAR_FILE, politicsRows);

const report = `# Lisbon Campo Pequeno + Ponte 25 de Abril people batch 1\n\nDato: 2026-07-20\n\n## Opprettet\n\n- \`${NEW_ID}\` → \`${CAMPO_PLACE}\`\n\n## Gjenbrukt canonical person\n\n- \`${SALAZAR_ID}\` beholder \`lisbon_assembleia_da_republica\` som primæranker og får \`${BRIDGE_PLACE}\` som kritisk sekundærrelasjon.\n\n## Streng stedsgate\n\nAntónio José Dias da Silva inkluderes fordi han er dokumentert som arkitekten bak selve Campo Pequeno-bygningen. Salazar opprettes ikke på nytt; eksisterende canonical record oppdateres fordi broen bar navnet Ponte Salazar ved innvielsen i 1966 og han deltok fysisk ved åpningsseremonien. Ingen tilfeldig broingeniør er opprettet: hovedprosjekteringen krediteres et ingeniørfirma/team snarere enn én entydig individuell hoveddesigner i kildene som ble kontrollert.\n\n## Kilder\n\n- Campo Pequeno: historikkside og Património Cultural I.P.\n- Ponte 25 de Abril: Infraestruturas de Portugal, «A Inauguração».\n\n## Validering\n\nMaterializer kjører repo-wide duplicate-ID-gate før skriving. Deretter skal CI kjøre \`bash scripts/check-people.sh\` og ordinær Places-gate.\n`;
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, report, 'utf8');

fs.unlinkSync(SELF);
console.log('Created Campo Pequeno architect record, updated Salazar bridge relation, registered manifest entry, wrote report, and removed one-shot script.');
