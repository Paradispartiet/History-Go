import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const verifiedAt = '2026-07-25';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function writeText(relPath, content) {
  const filePath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.endsWith('\n') ? content : `${content}\n`);
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function writeJson(relPath, data) {
  writeText(relPath, `${JSON.stringify(data, null, 2)}\n`);
}

function replaceOnce(relPath, before, after) {
  const current = readText(relPath);
  const first = current.indexOf(before);
  if (first < 0 || current.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one replacement target in ${relPath}`);
  }
  writeText(relPath, current.slice(0, first) + after + current.slice(first + before.length));
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function peopleFromJson(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.people)) return data.people;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];
  return [];
}

function walkJson(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function patchCoverageAudits() {
  const coveragePath = 'tools/audit-oslo-people-coverage.mts';
  const oldCoverageParser = `function toArray(data: any): any[] {\n  if (Array.isArray(data)) return data;\n  if (data && Array.isArray(data.places)) return data.places;\n  if (data && Array.isArray(data.people)) return data.people;\n  if (data && Array.isArray(data.items)) return data.items;\n  return [];\n}`;
  const newCoverageParsers = `function toPlaceArray(data: any): any[] {\n  if (Array.isArray(data)) return data;\n  if (data && Array.isArray(data.places)) return data.places;\n  if (data && Array.isArray(data.items)) return data.items;\n  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];\n  return [];\n}\n\nfunction toPersonArray(data: any): any[] {\n  if (Array.isArray(data)) return data;\n  if (data && Array.isArray(data.people)) return data.people;\n  if (data && Array.isArray(data.items)) return data.items;\n  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];\n  return [];\n}`;
  replaceOnce(coveragePath, oldCoverageParser, newCoverageParsers);
  replaceOnce(
    coveragePath,
    'for (const place of toArray(readJson(filePath))) {',
    'for (const place of toPlaceArray(readJson(filePath))) {',
  );
  replaceOnce(
    coveragePath,
    'for (const person of toArray(readJson(filePath))) {',
    'for (const person of toPersonArray(readJson(filePath))) {',
  );

  const latentPath = 'tools/audit-oslo-latent-people-coverage.mts';
  const oldLatentParser = `function toArray(data: any): any[] {\n  if (Array.isArray(data)) return data;\n  if (data && Array.isArray(data.people)) return data.people;\n  if (data && Array.isArray(data.items)) return data.items;\n  return [];\n}`;
  const newLatentParser = `function toPersonArray(data: any): any[] {\n  if (Array.isArray(data)) return data;\n  if (data && Array.isArray(data.people)) return data.people;\n  if (data && Array.isArray(data.items)) return data.items;\n  if (data && typeof data === 'object' && typeof data.id === 'string' && data.id.trim()) return [data];\n  return [];\n}`;
  replaceOnce(latentPath, oldLatentParser, newLatentParser);
  const latentText = readText(latentPath).replace(/\btoArray\(/g, 'toPersonArray(');
  writeText(latentPath, latentText);
}

function auditCandidateUniqueness(candidates) {
  const candidateIds = new Set(candidates.map((candidate) => candidate.person.id));
  const candidateNames = new Map(candidates.map((candidate) => [normalize(candidate.person.name), candidate.person.name]));
  const collisions = [];
  const peopleRoot = path.join(root, 'data/people');
  for (const filePath of walkJson(peopleRoot)) {
    if (filePath.endsWith(`${path.sep}manifest.json`)) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      continue;
    }
    for (const person of peopleFromJson(data)) {
      if (!person || typeof person.id !== 'string') continue;
      const rel = path.relative(root, filePath).replace(/\\/g, '/');
      if (candidateIds.has(person.id)) collisions.push(`${person.id} already exists in ${rel}`);
      const normalizedName = normalize(person.name);
      if (candidateNames.has(normalizedName)) collisions.push(`${candidateNames.get(normalizedName)} name already exists in ${rel}`);
    }
  }
  if (collisions.length > 0) {
    throw new Error(`Candidate uniqueness gate failed:\n${collisions.join('\n')}`);
  }
}

function updateExistingPerson(relPath, personId, mutate) {
  const data = readJson(relPath);
  const people = peopleFromJson(data);
  const person = people.find((entry) => entry?.id === personId);
  if (!person) throw new Error(`Could not find ${personId} in ${relPath}`);
  mutate(person);
  writeJson(relPath, data);
}

function addUnique(array, value) {
  if (!Array.isArray(array)) return [value];
  if (!array.includes(value)) array.push(value);
  return array;
}

patchCoverageAudits();

run('node', ['--experimental-strip-types', 'tools/audit-oslo-people-coverage.mts']);
run('node', ['--experimental-strip-types', 'tools/audit-oslo-latent-people-coverage.mts']);

const baseline = readJson('reports/oslo-people-coverage.json');
const expectedScenekunstQueue = [
  'black_box_teater',
  'dansens_hus_oslo',
  'det_andre_teatret_intimscenen',
  'kloden_teater_pilotscenen',
  'oslo_nye_teater_hovedscenen',
  'riksscenen',
  'rommen_scene',
  'salt_oslo',
  'vega_scene',
].sort();
const actualScenekunstQueue = baseline.uncoveredRequired
  .filter((entry) => entry.category === 'scenekunst')
  .map((entry) => entry.placeId)
  .sort();
if (JSON.stringify(actualScenekunstQueue) !== JSON.stringify(expectedScenekunstQueue)) {
  throw new Error(
    `Fresh scenekunst queue differs from the bounded batch.\nExpected: ${expectedScenekunstQueue.join(', ')}\nActual: ${actualScenekunstQueue.join(', ')}`,
  );
}
if (baseline.totals.invalidPeopleRefs !== 0) {
  throw new Error(`Corrected Oslo baseline still has ${baseline.totals.invalidPeopleRefs} invalid People refs`);
}

const candidates = [
  {
    relPath: 'data/people/scenekunst/oslo/black_box_teater/inger_buresund.json',
    person: {
      id: 'inger_buresund',
      name: 'Inger Buresund',
      initials: 'IB',
      desc: 'Kunstnerisk leder som utviklet Black Box teater fra utleiescene til et tydelig programmeringsteater.',
      tags: ['scenekunst', 'samtidsscenekunst', 'programmeringsteater', 'kunstnerisk_leder', 'teatersjef', 'black_box_teater'],
      placeId: 'black_box_teater',
      category: 'scenekunst',
      year: 1991,
      popupDesc: 'Inger Buresund ble kunstnerisk leder for Black Box teater i 1991 og teatrets første teatersjef i 1994. Hun la grunnlaget for overgangen fra et rent utleieteater til et programmerende teater med en tydelig kunstnerisk profil. Koblingen gjelder institusjonsbygging og utviklingen av Black Box teaters stedsspesifikke rolle i det frie scenekunstfeltet.',
      places: ['black_box_teater'],
      image: '',
      cardImage: '',
      source_urls: ['https://blackbox.no/nb/historie/', 'https://blackbox.no/nb/black-box-teater-fyller-40-ar-og-det-skal-vi-feire/'],
      verifiedAt,
    },
  },
  {
    relPath: 'data/people/scenekunst/oslo/dansens_hus_oslo/randi_urdal.json',
    person: {
      id: 'randi_urdal',
      name: 'Randi Urdal',
      initials: 'RU',
      desc: 'Dansefeltets institusjonsbygger som ledet det langvarige arbeidet med å realisere Dansens Hus.',
      tags: ['scenekunst', 'dans', 'institusjonsbygger', 'danseinformasjonen', 'dansens_hus'],
      placeId: 'dansens_hus_oslo',
      category: 'scenekunst',
      year: 2004,
      popupDesc: 'Randi Urdal ledet arbeidet i Senter for Dansekunst og Danseinformasjonen med å realisere en nasjonal scene for dans. Prosessen førte til at Dansens Hus ble etablert i 2004 og fikk permanent hus på Vulkan i 2008. Koblingen gjelder den konkrete institusjonsbyggingen, organiseringen og realiseringen av Dansens Hus.',
      places: ['dansens_hus_oslo'],
      image: '',
      cardImage: '',
      source_urls: ['https://danseinfo.no/intervjuer/dans-og-mye-mer-enn-det-intervju-med-randi-urdal-2/', 'https://danseinfo.no/nyheter/dansens-hus-20-ar-med-dansekunst-pa-programmet/'],
      verifiedAt,
    },
  },
  {
    relPath: 'data/people/scenekunst/oslo/kloden_teater_pilotscenen/aadne_sekkelsten.json',
    person: {
      id: 'aadne_sekkelsten',
      name: 'Ådne Sekkelsten',
      initials: 'ÅS',
      desc: 'Teatersjef og sentral prosjektbygger bak Kloden teater og Pilotscenen på Økern.',
      tags: ['scenekunst', 'barn_og_unge', 'teatersjef', 'institusjonsbygger', 'kloden_teater', 'pilotscenen'],
      placeId: 'kloden_teater_pilotscenen',
      category: 'scenekunst',
      year: 2021,
      popupDesc: 'Ådne Sekkelsten har ledet utviklingen av Kloden teater som nasjonal scene for scenekunst for barn og unge. Pilotscenen åpnet i Kabelgata i 2021 som første del av teaterprosjektet, og Sekkelsten har representert både den kunstneriske visjonen og byggingen av den permanente institusjonen på Økern.',
      places: ['kloden_teater_pilotscenen'],
      image: '',
      cardImage: '',
      source_urls: ['https://www.kloden.no/om-kloden/om-organisasjonen/', 'https://www.kloden.no/arkiv/teater-og-byutvikling-kloden-teater-pa-okern/', 'https://www.kloden.no/en-prat-om-teaterhuset-kloden-teater/'],
      verifiedAt,
    },
  },
  {
    relPath: 'data/people/scenekunst/oslo/riksscenen/jan_lothe_eriksen.json',
    person: {
      id: 'jan_lothe_eriksen',
      name: 'Jan Lothe Eriksen',
      initials: 'JLE',
      desc: 'Initiativtaker og første leder for Riksscenen, den nasjonale scenen for folkemusikk, joik og folkedans.',
      tags: ['scenekunst', 'folkemusikk', 'folkedans', 'joik', 'initiativtaker', 'teatersjef', 'riksscenen'],
      placeId: 'riksscenen',
      category: 'scenekunst',
      year: 2010,
      popupDesc: 'Jan Lothe Eriksen var initiativtaker og første leder for Riksscenen. Han deltok i planleggings- og byggeprosessen og formulerte institusjonens kunstneriske oppdrag for folkemusikk, joik og folkedans. Koblingen gjelder opprettelsen og den første institusjonelle fasen ved Riksscenen på Schous kulturbryggeri.',
      places: ['riksscenen'],
      image: '',
      cardImage: '',
      source_urls: ['https://www.riksscenen.no/fri-kunst-2021-urfolks-rettigheter-og-kunstnerisk-ytringsfrihet.6351890-322125.html', 'https://www.riksscenen.no/riksscenen-mangfold-i-praksis.4641544-95416.html'],
      verifiedAt,
    },
  },
  {
    relPath: 'data/people/scenekunst/oslo/rommen_scene/erik_aldner.json',
    person: {
      id: 'erik_aldner',
      name: 'Erik Aldner',
      initials: 'EA',
      desc: 'Daglig leder i oppstartsfasen for Rommen Scene, den nye scenen ved Rommen skole og kultursenter.',
      tags: ['scenekunst', 'groruddalen', 'daglig_leder', 'institusjonsbygger', 'rommen_scene'],
      placeId: 'rommen_scene',
      category: 'scenekunst',
      year: 2019,
      popupDesc: 'Erik Aldner var daglig leder ved Rommen Scene da scenen åpnet i januar 2019 som et samarbeid mellom Det Norske Teatret og Bydel Stovner. Koblingen gjelder den konkrete oppstarts- og driftsfasen ved den nye scenen på Rommen, ikke en løs tilknytning til kulturlivet i Groruddalen.',
      places: ['rommen_scene'],
      image: '',
      cardImage: '',
      source_urls: ['https://www.detnorsketeatret.no/bakgrunnsartiklar/historia-om-rommen-scene'],
      verifiedAt,
    },
  },
  {
    relPath: 'data/people/scenekunst/oslo/salt_oslo/erlend_mogard_larsen.json',
    person: {
      id: 'erlend_mogard_larsen',
      name: 'Erlend Mogård-Larsen',
      initials: 'EML',
      desc: 'Medgrunnlegger og daglig leder for SALT, fra det nomadiske kunstprosjektet til kulturarenaen på Langkaia.',
      tags: ['scenekunst', 'tverrkunstnerisk', 'kulturarena', 'medgrunnlegger', 'daglig_leder', 'salt'],
      placeId: 'salt_oslo',
      category: 'scenekunst',
      year: 2016,
      popupDesc: 'Erlend Mogård-Larsen var medgrunnlegger av SALT-prosjektet og er daglig leder for kulturarenaen. SALT startet på Sandhornøy og flyttet til Langkaia i Oslo i 2016, der prosjektet ble utviklet til en fast, tverrkunstnerisk scene- og publikumsarena. Koblingen gjelder både etableringen og den løpende institusjonsbyggingen på stedet.',
      places: ['salt_oslo'],
      image: '',
      cardImage: '',
      source_urls: ['https://www.salted.no/kontakt', 'https://norwegianarts.org.uk/event/salt/'],
      verifiedAt,
    },
  },
  {
    relPath: 'data/people/scenekunst/oslo/vega_scene/katinka_rydin_berge.json',
    person: {
      id: 'katinka_rydin_berge',
      name: 'Katinka Rydin Berge',
      initials: 'KRB',
      desc: 'Regissør, dramaturg og en av grunnleggerne av teatret på Vega Scene.',
      tags: ['scenekunst', 'ny_dramatikk', 'regissor', 'dramaturg', 'grunnlegger', 'kunstnerisk_ledelse', 'vega_scene'],
      placeId: 'vega_scene',
      category: 'scenekunst',
      year: 2018,
      popupDesc: 'Katinka Rydin Berge er en av grunnleggerne av teatret på Vega Scene og inngår i den kunstneriske ledelsen. Hun har vært med på å bygge scenens profil for ny og aktuell nordisk dramatikk gjennom prosjektutvikling, regi, dramaturgi og programmering. Koblingen gjelder etableringen og den kunstneriske institusjonsbyggingen ved Vega Scene.',
      places: ['vega_scene'],
      image: '',
      cardImage: '',
      source_urls: ['https://www.vegascene.no/nyheter/laereren-digitalt-teaterprogram', 'https://www.vegascene.no/nyheter/bli-gjestespill-pa-vega-scene'],
      verifiedAt,
    },
  },
];

auditCandidateUniqueness(candidates);
for (const candidate of candidates) {
  if (fs.existsSync(path.join(root, candidate.relPath))) {
    throw new Error(`Refusing to overwrite existing candidate file ${candidate.relPath}`);
  }
  writeJson(candidate.relPath, [candidate.person]);
}

updateExistingPerson(
  'data/people/scenekunst/oslo/det_andre_teatret/nils_petter_morland.json',
  'nils_petter_morland',
  (person) => {
    person.places = addUnique(person.places, 'det_andre_teatret_intimscenen');
    person.tags = addUnique(person.tags, 'intimscene');
    person.popupDesc = 'Nils Petter Mørland var med på å etablere Det Andre Teatret da improscenen åpnet på Lilleborg i 2011, og var teatersjef fra 2011 til 2016. Rollen hans gjelder oppbyggingen av den faste institusjonen – repertoar, ensemble, frivillighet og publikumsarena – og forankrer både hovedscenen og den tilhørende Intimscenen.';
  },
);

updateExistingPerson(
  'data/people/litteratur/oslo/nationaltheatret/toralv_maurstad.json',
  'toralv_maurstad',
  (person) => {
    person.desc = 'Skuespiller og teatersjef ved Oslo Nye Teater 1967–1978 og Nationaltheatret 1978–1986.';
    person.places = addUnique(person.places, 'oslo_nye_teater_hovedscenen');
    person.tags = addUnique(person.tags, 'oslo_nye_teater');
    person.popupDesc = 'Toralv Maurstad er et sterkt institusjonsanker for både Oslo Nye Teater og Nationaltheatret. Som teatersjef ved Oslo Nye fra 1967 til 1978 gjorde han Hovedscenen til et rendyrket komedieteater; deretter ledet han Nationaltheatret fra 1978 til 1986. Koblingen til Oslo Nye Hovedscenen gjelder en dokumentert sjefsperiode og en tydelig repertoaromforming.';
    person.source_urls = addUnique(person.source_urls, 'https://oslonye.no/historikk/');
    person.source_urls = addUnique(person.source_urls, 'https://oslonye.no/toralv-maurstad/');
  },
);

const manifest = readJson('data/people/manifest.json');
if (!Array.isArray(manifest.files)) throw new Error('data/people/manifest.json lacks files array');
for (const candidate of candidates) {
  const manifestPath = candidate.relPath.replace(/^data\//, '');
  if (manifest.files.includes(manifestPath)) throw new Error(`Manifest already contains ${manifestPath}`);
  manifest.files.push(manifestPath);
}
writeJson('data/people/manifest.json', manifest);

run('npm', ['run', 'civication:history-people:build']);
run('npm', ['run', 'audit:people-of-places']);
run('node', ['--experimental-strip-types', 'tools/audit-oslo-people-coverage.mts']);
run('node', ['--experimental-strip-types', 'tools/audit-oslo-latent-people-coverage.mts']);

const finalCoverage = readJson('reports/oslo-people-coverage.json');
const remainingScenekunst = finalCoverage.uncoveredRequired.filter((entry) => entry.category === 'scenekunst');
if (remainingScenekunst.length !== 0) {
  throw new Error(`Scenekunst still has uncovered places: ${remainingScenekunst.map((entry) => entry.placeId).join(', ')}`);
}
for (const placeId of expectedScenekunstQueue) {
  const row = finalCoverage.coveredRequired.find((entry) => entry.placeId === placeId);
  if (!row || row.peopleCount < 1) throw new Error(`${placeId} is not covered after batch 8`);
}
if (finalCoverage.totals.invalidPeopleRefs !== 0) {
  throw new Error(`Final Oslo coverage has ${finalCoverage.totals.invalidPeopleRefs} invalid People refs`);
}

const testContent = `import assert from 'node:assert/strict';\nimport fs from 'node:fs';\nimport { execFileSync } from 'node:child_process';\nimport test from 'node:test';\n\ntest('Oslo People audit materializes single-record person files before places arrays', () => {\n  execFileSync(process.execPath, ['--experimental-strip-types', 'tools/audit-oslo-people-coverage.mts'], { stdio: 'pipe' });\n  const report = JSON.parse(fs.readFileSync('reports/oslo-people-coverage.json', 'utf8'));\n  const covered = new Map(report.coveredRequired.map((row) => [row.placeId, row]));\n  const ids = (placeId) => new Set((covered.get(placeId)?.people ?? []).map((person) => person.id));\n  assert.ok(ids('latter').has('elina_krantz'));\n  assert.ok(ids('bla_skilt_aud_schonemann_vetlandsveien_69d').has('aud_schonemann'));\n  assert.ok(ids('chateau_neuf').has('harald_eia'));\n  assert.equal(report.totals.invalidPeopleRefs, 0);\n});\n`;
writeText('tests/oslo-people-coverage-single-records.test.mjs', testContent);

const mappingLines = [
  '- `black_box_teater` → new `inger_buresund`',
  '- `dansens_hus_oslo` → new `randi_urdal`',
  '- `det_andre_teatret_intimscenen` → existing `nils_petter_morland` extended',
  '- `kloden_teater_pilotscenen` → new `aadne_sekkelsten`',
  '- `oslo_nye_teater_hovedscenen` → existing `toralv_maurstad` extended',
  '- `riksscenen` → new `jan_lothe_eriksen`',
  '- `rommen_scene` → new `erik_aldner`',
  '- `salt_oslo` → new `erlend_mogard_larsen`',
  '- `vega_scene` → new `katinka_rydin_berge`',
];
const validation = [
  '# Oslo People zero-gap batch 8 – validation',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Audit correction',
  '',
  '- Place JSON and People JSON now use separate shape parsers.',
  '- Single-record People objects are resolved as people before their `places` relation array is inspected.',
  '- Regression coverage explicitly verifies Elina Krantz, Aud Schønemann and Harald Eia from manifest-listed single-record files.',
  '',
  '## Fresh bounded baseline',
  '',
  `- Required non-nature Oslo places: **${baseline.totals.requiredNonNaturePlaces}**`,
  `- Covered required places: **${baseline.totals.coveredRequiredPlaces}**`,
  `- Uncovered required places: **${baseline.totals.uncoveredRequiredPlaces}**`,
  `- Logical People: **${baseline.totals.logicalPeople}**`,
  `- Uncovered scenekunst places: **${actualScenekunstQueue.length}**`,
  '',
  '## Target mapping',
  '',
  ...mappingLines,
  '',
  '## Final state',
  '',
  `- Required non-nature Oslo places: **${finalCoverage.totals.requiredNonNaturePlaces}**`,
  `- Covered required places: **${finalCoverage.totals.coveredRequiredPlaces}**`,
  `- Uncovered required places: **${finalCoverage.totals.uncoveredRequiredPlaces}**`,
  `- Logical People: **${finalCoverage.totals.logicalPeople}**`,
  '- Scenekunst coverage: **complete (0 uncovered)**',
  '- New canonical People: **7**',
  '- Reused canonical People: **2**',
  '- Duplicate candidate IDs/names before materialization: **0**',
  '- Invalid People refs: **0**',
  '',
  '## Research gate',
  '',
  '- Inger Buresund developed Black Box teater into a programming theatre and became its first theatre director.',
  '- Randi Urdal led the long institutional process that realized Dansens Hus.',
  '- Ådne Sekkelsten led the Kloden theatre project and its Pilotscenen phase.',
  '- Jan Lothe Eriksen was the initiator and first director of Riksscenen.',
  '- Erik Aldner was the general manager at Rommen Scene during its opening phase.',
  '- Erlend Mogård-Larsen co-founded SALT and leads the Langkaia culture arena.',
  '- Katinka Rydin Berge co-founded the theatre at Vega Scene and serves in its artistic leadership.',
  '- Nils Petter Mørland and Toralv Maurstad are reused only for explicitly documented institutional subscene relations.',
  '',
];
writeText('reports/people-oslo-zero-gap-batch8-validation.md', validation.join('\n'));
