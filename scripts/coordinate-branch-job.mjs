import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const branch = process.env.JOB_BRANCH || 'agent/etne-religion-skate-final';

const payloadPaths = [
  'data/places/religion/vestland/etne/etne_kyrkje.json',
  'data/places/religion/vestland/etne/skanevik_kyrkje.json',
  'data/places/religion/vestland/etne/frette_kapell.json',
  'reports/etne-religion-skate-final/geonorge/etne_kyrkje.json',
  'reports/etne-religion-skate-final/geonorge/skanevik_kyrkje.json',
  'reports/etne-religion-skate-final/osm/frette_kapell.json',
];

const payload = new Map();
for (const relativePath of payloadPaths) {
  payload.set(relativePath, await fs.readFile(path.join(root, relativePath), 'utf8'));
}

execFileSync('git', ['fetch', 'origin', 'main'], { stdio: 'inherit' });
execFileSync('git', ['reset', '--hard', 'origin/main'], { stdio: 'inherit' });
execFileSync('git', ['push', '--force', 'origin', `HEAD:${branch}`], { stdio: 'inherit' });

if (process.env.RUNNER_REPORT_DIR) await fs.mkdir(process.env.RUNNER_REPORT_DIR, { recursive: true });

for (const [relativePath, content] of payload) {
  const file = path.join(root, relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

const unique = (values) => [...new Set(values)];

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
}

async function writeJson(relativePath, value) {
  const file = path.join(root, relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function records(doc) {
  if (Array.isArray(doc)) return doc;
  if (Array.isArray(doc?.places)) return doc.places;
  return [doc];
}

async function addSubcultureLayer(relativePath, kind) {
  const doc = await readJson(relativePath);
  const list = records(doc);
  if (list.length !== 1) throw new Error(`${relativePath}: expected exactly one place record`);
  const place = list[0];
  place.secondaryBadgeIds = unique([...(place.secondaryBadgeIds || []), 'subkultur']);
  place.tags = unique([...(place.tags || []), 'subkultur', 'skatekultur', 'scene_og_fellesskap']);
  place.emne_ids = unique([
    ...(place.emne_ids || []),
    'em_sub_ungdomskultur_identitet',
    'em_sub_tilhorighet_miljo',
    'em_sub_scene_fellesskap',
  ]);
  const paragraph = kind === 'bmx'
    ? 'I History Go er Sport framleis hovudkategorien fordi dette fysisk er eit BMX- og skateanlegg. Samstundes får staden eit sekundært Subkultur-lag: ei eiga BMX-/skateforeining, eigenorganisert bruk og ungdomskultur dokumenterer eit sjølvstendig miljø rundt arenaen.'
    : 'I History Go er Sport framleis hovudkategorien fordi dette fysisk er eit skateanlegg. Samstundes får parken eit sekundært Subkultur-lag fordi den permanente streetprega parken er bygd spesifikt rundt skating og eigenorganisert skatepraksis.';
  if (!String(place.popupDesc || '').includes('sekundært Subkultur-lag')) place.popupDesc = `${String(place.popupDesc || '').trim()} ${paragraph}`.trim();
  place.quiz_profile = place.quiz_profile || {};
  place.quiz_profile.primary_angles = unique([...(place.quiz_profile.primary_angles || []), 'skatekultur', 'scene_og_fellesskap']);
  place.quiz_profile.must_include = unique([...(place.quiz_profile.must_include || []), 'at Sport er hovudkategori og Subkultur eit dokumentert sekundært lag']);
  place.quiz_profile.avoid_angles = unique([...(place.quiz_profile.avoid_angles || []), 'a_kalle_all_bruk_eller_alle_brukarar_subkultur']);
  place.quiz_profile.notes = `${place.quiz_profile.notes ? `${place.quiz_profile.notes} ` : ''}Subkultur-laget gjeld den dokumenterte skate/BMX-praksisen, scena og fellesskapet rundt eigenorganisert bruk; det er ikkje ein påstand om at alle brukarar er marginaliserte.`;
  await writeJson(relativePath, doc);
}

const index = await readJson('data/places/places_index.json');
for (const id of ['etne_kyrkje', 'skanevik_kyrkje', 'frette_kapell']) {
  if (index.some((place) => place?.id === id)) throw new Error(`Latest main already contains ${id}; aborting duplicate activation`);
}

await addSubcultureLayer('data/places/sport/vestland/etne/etne_bmx_og_skatepark.json', 'bmx');
await addSubcultureLayer('data/places/sport/vestland/etne/skanevik_skatepark.json', 'skate');

const manifest = await readJson('data/places/manifest.json');
for (const relativePath of [
  'places/religion/vestland/etne/etne_kyrkje.json',
  'places/religion/vestland/etne/skanevik_kyrkje.json',
  'places/religion/vestland/etne/frette_kapell.json',
]) {
  if (!manifest.files.includes(relativePath)) manifest.files.push(relativePath);
}
await writeJson('data/places/manifest.json', manifest);

await fs.mkdir(path.join(root, 'reports/etne-religion-skate-final'), { recursive: true });
await fs.writeFile(path.join(root, 'reports/etne-religion-skate-final/README.md'), `# Etne religion og skatekultur – sluttbatch\n\nDato: 2026-07-23\n\n## Nye Religion-steder\n\n- Etne kyrkje\n- Skånevik kyrkje\n- Frette kapell\n\n## Utsett stad\n\nSkånevik bedehus er ikkje aktivert. Tilgjengeleg adressegrunnlag dokumenterer ikkje sikkert den fysiske bedehusbygningen, så ingen kartmarkør blir gjetta.\n\n## Subkultur-vurdering\n\n- Etne BMX- og skatepark: Sport primært, Subkultur sekundært.\n- Skånevik skatepark: Sport primært, Subkultur sekundært.\n- Etne pumptrack: Sport berre; kjeldegrunnlaget dokumenterer ikkje eit like tydeleg sjølvstendig skate-/subkulturmiljø.\n\n## Prinsipp\n\nSkate-/BMX-anlegga får ikkje Subkultur fordi dei er ulovlege eller fordi alle brukarar står utanfor samfunnet. Sekundærlaget gjeld dokumentert eigenorganisert praksis, scene, identitet og fellesskap.\n`);

console.log(JSON.stringify({
  replayBase: 'origin/main',
  addedReligionPlaces: ['etne_kyrkje', 'skanevik_kyrkje', 'frette_kapell'],
  secondarySubculturePlaces: ['etne_bmx_og_skatepark', 'skanevik_skatepark'],
  unchangedSportOnly: ['etne_pumptrack'],
  deferred: ['skanevik_bedehus'],
}, null, 2));
