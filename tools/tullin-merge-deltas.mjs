import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const unique = (values) => [...new Set(values)];

const brandsByPlacePath = 'data/brands/brands_by_place.json';
const brandsByPlace = read(brandsByPlacePath);
brandsByPlace.tullin = ['statsbygg'];
write(brandsByPlacePath, brandsByPlace);

const relationsPath = 'data/relations.json';
const relationIds = new Set(['rel_tullin_claus', 'rel_tullin_bjornson', 'rel_tullin_statsbygg']);
const relations = read(relationsPath).filter((relation) => !relationIds.has(relation.id));
relations.push(
  {
    id: 'rel_tullin_claus',
    type: 'eponym',
    place: 'tullin',
    person: 'claus_tullin',
    why: 'Tullinløkka har navn etter Claus Tullin, som kjøpte Ruseløkken i 1807.',
    source: 'https://oslobyleksikon.no/side/Tullinl%C3%B8kka'
  },
  {
    id: 'rel_tullin_bjornson',
    type: 'documented_speaker',
    place: 'tullin',
    person: 'bjornstjerne_bjornson',
    why: 'Bjørnson var blant talerne ved store demonstrasjoner på Tullinløkka i 1890-årene.',
    source: 'https://oslobyleksikon.no/side/Tullinl%C3%B8kka'
  },
  {
    id: 'rel_tullin_statsbygg',
    type: 'public_space_builder',
    place: 'tullin',
    brand: 'statsbygg',
    why: 'Statsbygg anla parken over Tullinløkka i 2011.',
    source: 'https://dok.statsbygg.no/wp-content/uploads/2020/05/stedsanalyseNationaltheatret.pdf'
  }
);
write(relationsPath, relations);

const leksikonManifestPath = 'data/leksikon/manifest.json';
const leksikonManifest = read(leksikonManifestPath);
leksikonManifest.files = unique([
  ...(leksikonManifest.files || []),
  'data/leksikon/places/oslo/by/leksikon_tullin.json'
]);
write(leksikonManifestPath, leksikonManifest);

const languageManifestPath = 'data/leksikon/sprak/manifest.json';
const languageManifest = read(languageManifestPath);
languageManifest.place_files ||= {};
languageManifest.place_files.tullin = 'data/leksikon/sprak/places/europe/norway/oslo/tullin.json';
write(languageManifestPath, languageManifest);

const storiesManifestPath = 'data/stories/stories_manifest.json';
const storiesManifest = read(storiesManifestPath);
storiesManifest.files = (storiesManifest.files || []).filter((entry) => entry?.entity_id !== 'tullin');
storiesManifest.files.push({ category: 'by', entity_id: 'tullin', path: 'data/stories/stories_tullin.json' });
write(storiesManifestPath, storiesManifest);

const episodeManifestPath = 'data/stories/stories_episode_v1_manifest.json';
const episodeManifest = read(episodeManifestPath);
episodeManifest.files = unique([
  ...(episodeManifest.files || []).filter((file) => file !== 'stories_tullin.json'),
  'data/stories/stories_tullin.json'
]);
write(episodeManifestPath, episodeManifest);

console.log(JSON.stringify({
  status: 'tullin-merge-deltas-reapplied',
  brands: brandsByPlace.tullin,
  relations: relations.filter((relation) => relationIds.has(relation.id)).map((relation) => relation.id),
  leksikon: leksikonManifest.files.includes('data/leksikon/places/oslo/by/leksikon_tullin.json'),
  language: languageManifest.place_files.tullin,
  stories: storiesManifest.files.some((entry) => entry?.entity_id === 'tullin'),
  episode: episodeManifest.files.includes('data/stories/stories_tullin.json')
}, null, 2));
