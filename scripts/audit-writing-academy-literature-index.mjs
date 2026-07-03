import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const asArray = (value, label) => { assert(Array.isArray(value), `${label} must be an array`); return value; };
const normalizeName = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const registry = readJson('data/historygo/shared/game_registry.json');
assert(registry.games?.some((game) => game.gameId === 'hgWritingAcademy'), 'hgWritingAcademy missing from game_registry');

const index = readJson('games/writing-academy/data/literature_source_index.json');
assert(index.gameId === 'hgWritingAcademy', 'literature_source_index must belong to hgWritingAcademy');
for (const sourcePath of [
  index.sourceRefs?.historyGoLiteraturePeople,
  index.sourceRefs?.historyGoLiteraturePlaces,
  index.sourceRefs?.historyGoLiteratureQuizDir,
  index.sourceRefs?.historyGoStoriesDir,
  index.sourceRefs?.personalGoodreadsSeed,
]) assert(sourcePath && fs.existsSync(path.join(root, sourcePath)), `missing sourceRef: ${sourcePath}`);

const people = asArray(readJson(index.sourceRefs.historyGoLiteraturePeople), 'literature people');
const places = asArray(readJson(index.sourceRefs.historyGoLiteraturePlaces), 'literature places');
assert(people.length > 0, 'literature people must be indexable');
assert(places.length > 0, 'literature places must be indexable');
assert(index.collections.historyGoLiteraturePeople.referenceOnly === true, 'people cards must be reference-only');
assert(index.collections.historyGoLiteraturePlaces.assignmentTypes.includes('litterær analyse'), 'places must unlock literary analysis');

const seedText = fs.readFileSync(path.join(root, index.sourceRefs.personalGoodreadsSeed), 'utf8');
for (const forbidden of ['My Rating', 'Date Added', 'Date Read', 'Private Notes']) {
  assert(!seedText.includes(forbidden), `Goodreads seed contains forbidden Goodreads field label ${forbidden}`);
}
const seed = JSON.parse(seedText);
const canon = asArray(seed.personalGoodreadsCanon, 'personalGoodreadsCanon');
const excluded = asArray(seed.excludedForWritingAcademy, 'excludedForWritingAcademy');
for (const item of canon) {
  const serialized = JSON.stringify(item).toLowerCase();
  assert(!serialized.includes('young adult') && !serialized.includes('barnebok') && !serialized.includes('children_or_young_adult'), 'children/YA item found in personalGoodreadsCanon');
}
for (const item of excluded) {
  assert(item.routeTo === 'hgChildrenLiteratureGame', 'excluded children/YA items must route to hgChildrenLiteratureGame');
}

const peopleByName = new Map(people.map((person) => [normalizeName(person.name), person.id]));
const matches = [];
const pending = [];
for (const author of canon) {
  const personId = peopleByName.get(normalizeName(author.name));
  if (personId) matches.push({ authorId: author.authorId, personId });
  else pending.push({ authorId: author.authorId, name: author.name, reason: 'no_normalized_name_match' });
}
assert(matches.length > 0, 'matcher must find at least one existing History Go person');
assert(pending.length > 0, 'matcher must report pending candidates instead of creating people automatically');

const storyFiles = new Set(fs.readdirSync(path.join(root, index.sourceRefs.historyGoStoriesDir)).filter((file) => file.endsWith('.json')));
const quizFiles = new Set(fs.readdirSync(path.join(root, index.sourceRefs.historyGoLiteratureQuizDir)).filter((file) => file.endsWith('.json')));
const prioritizedPlaces = places.filter((place) => storyFiles.has(`stories_${place.id}.json`) || [...quizFiles].some((file) => file.startsWith(`${place.id}_`) || file.includes(place.id)));
assert(prioritizedPlaces.length > 0, 'at least one literature place should be prioritized by existing stories/quiz');

console.log(JSON.stringify({
  ok: true,
  game: 'hgWritingAcademy',
  peopleIndexed: people.length,
  placesIndexed: places.length,
  goodreadsCanon: canon.length,
  excludedForWritingAcademy: excluded.length,
  matchedAuthors: matches.length,
  pendingPersonCandidates: pending.length,
  prioritizedPlaces: prioritizedPlaces.length,
}, null, 2));
