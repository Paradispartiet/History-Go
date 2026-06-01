#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const STORIES_MANIFEST_PATH = 'data/stories/stories_manifest.json';
const PEOPLE_MANIFEST_PATH = 'data/people/manifest.json';

const VALID_STORY_CATEGORIES = new Set([
  'historie',
  'vitenskap',
  'kunst',
  'musikk',
  'natur',
  'sport',
  'by',
  'politikk',
  'populaerkultur',
  'subkultur',
]);

const errors = [];
const todos = [];

function repoPath(...segments) {
  return path.join(REPO_ROOT, ...segments);
}

function isNonEmptyValue(value) {
  return value !== undefined && value !== null && value !== '';
}

async function readJson(relativePath, label, { reportError = true } = {}) {
  const absolutePath = repoPath(relativePath);
  let raw;

  try {
    raw = await readFile(absolutePath, 'utf8');
  } catch (error) {
    if (reportError) {
      errors.push(`${label} mangler eller kan ikke leses: ${relativePath} (${error.message})`);
    }
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    if (reportError) {
      errors.push(`${label} er ikke gyldig JSON: ${relativePath} (${error.message})`);
    }
    return undefined;
  }
}

function getEntityArrayFromSource(json, file, entityName, arrayKeys, { reportErrors = true } = {}) {
  if (Array.isArray(json)) {
    return json;
  }

  if (json && typeof json === 'object') {
    const matchingKeys = arrayKeys.filter((key) => Array.isArray(json[key]));
    if (matchingKeys.length === 1) {
      return json[matchingKeys[0]];
    }

    if (matchingKeys.length > 1) {
      if (reportErrors) {
        errors.push(`${entityName}-sourcefil har flere mulige entity-arrays (${matchingKeys.join(', ')}): ${file}`);
      }
      return undefined;
    }
  }

  if (reportErrors) {
    errors.push(`${entityName}-sourcefil må ha root-array eller tydelig ${entityName}-array: ${file}`);
  }
  return undefined;
}

function collectTopLevelEntityIds(json, file, entityName, arrayKeys, { reportErrors = true } = {}) {
  const entities = getEntityArrayFromSource(json, file, entityName, arrayKeys, { reportErrors });
  const ids = [];
  let isSimpleEntityArray = true;

  if (!entities) {
    return undefined;
  }

  entities.forEach((entity, index) => {
    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      isSimpleEntityArray = false;
      if (reportErrors) {
        errors.push(`${entityName}-entry må være objekt: file=${file} index=${index}`);
      }
      return;
    }

    if (typeof entity.id !== 'string' || !entity.id.trim()) {
      isSimpleEntityArray = false;
      if (reportErrors) {
        errors.push(`${entityName}-entry mangler id: file=${file} index=${index}`);
      }
      return;
    }

    ids.push(entity.id);
  });

  return isSimpleEntityArray ? ids : undefined;
}

async function loadPlaceIds() {
  const placeIds = new Set();
  const placeManifest = await readJson('data/places/manifest.json', 'Place-manifest');

  if (!placeManifest || !Array.isArray(placeManifest.files)) {
    errors.push('Place-manifest må ha files-array: data/places/manifest.json');
    return { placeIds, placeFileCount: 0 };
  }

  const placeFiles = placeManifest.files.map((file) => (file.startsWith('data/') ? file : `data/${file}`));

  for (const file of placeFiles) {
    const json = await readJson(file, 'Place-sourcefil');
    if (json !== undefined) {
      const ids = collectTopLevelEntityIds(json, file, 'Place', ['places']);
      for (const placeId of ids ?? []) {
        placeIds.add(placeId);
      }
    }
  }

  return { placeIds, placeFileCount: placeFiles.length };
}

async function loadPeopleIdsIfAvailable() {
  const manifest = await readJson(PEOPLE_MANIFEST_PATH, 'People-manifest', { reportError: false });
  if (manifest === undefined || !Array.isArray(manifest.files)) {
    todos.push('person_id-sjekk TODO: fant ikke en enkel, lesbar people-manifeststruktur med files-array; person_id-er er derfor ikke validert.');
    return undefined;
  }

  const peopleIds = new Set();
  for (const manifestFile of manifest.files) {
    if (typeof manifestFile !== 'string' || !manifestFile.trim()) {
      todos.push(`person_id-sjekk TODO: people-manifest inneholder ugyldig filsti ${JSON.stringify(manifestFile)}; person_id-er er ikke fullstendig validert.`);
      return undefined;
    }

    const peopleFile = manifestFile.startsWith('data/') ? manifestFile : `data/${manifestFile}`;
    const json = await readJson(peopleFile, 'People-sourcefil', { reportError: false });
    if (json === undefined) {
      todos.push(`person_id-sjekk TODO: people-sourcefil kan ikke leses som JSON (${peopleFile}); person_id-er er ikke fullstendig validert.`);
      return undefined;
    }
    const ids = collectTopLevelEntityIds(json, peopleFile, 'People', ['people', 'persons'], { reportErrors: false });
    if (!ids) {
      todos.push(`person_id-sjekk TODO: people-sourcefil har ikke en enkel person-array med id-felt (${peopleFile}); person_id-er er ikke fullstendig validert.`);
      return undefined;
    }
    for (const personId of ids) {
      peopleIds.add(personId);
    }
  }

  return peopleIds;
}

function validatePlaceReference({ storyId, field, value, file, placeIds }) {
  if (!placeIds.has(value)) {
    errors.push(`Ugyldig place_id: story=${storyId} field=${field} place_id=${value} file=${file}`);
  }
}

function validateStory(story, storyIndex, file, placeIds, peopleIds, seenStoryIds, stats) {
  const storyLabel = isNonEmptyValue(story?.id) ? story.id : `<index ${storyIndex}>`;

  if (!story || typeof story !== 'object' || Array.isArray(story)) {
    errors.push(`Story må være et objekt: file=${file} index=${storyIndex}`);
    return;
  }

  for (const field of ['id', 'type', 'title', 'story', 'sources']) {
    if (!isNonEmptyValue(story[field])) {
      errors.push(`Mangler required field: story=${storyLabel} field=${field} file=${file}`);
    }
  }

  if (!isNonEmptyValue(story.place_id) && !isNonEmptyValue(story.person_id)) {
    errors.push(`Story må ha place_id eller person_id: story=${storyLabel} file=${file}`);
  }

  if (isNonEmptyValue(story.id)) {
    if (seenStoryIds.has(story.id)) {
      errors.push(`Duplikat story.id: ${story.id} finnes i både ${seenStoryIds.get(story.id)} og ${file}`);
    } else {
      seenStoryIds.set(story.id, file);
    }
  }

  if (!Array.isArray(story.sources) || story.sources.length === 0) {
    errors.push(`sources må være en ikke-tom array: story=${storyLabel} file=${file}`);
  }

  if (story.score !== undefined && (!story.score || typeof story.score !== 'object' || !Object.hasOwn(story.score, 'total'))) {
    errors.push(`score.total mangler: story=${storyLabel} file=${file}`);
  }

  if (story.next_scenes !== undefined && !Array.isArray(story.next_scenes)) {
    errors.push(`next_scenes må være array når feltet finnes: story=${storyLabel} file=${file}`);
  }

  if (isNonEmptyValue(story.place_id)) {
    stats.placeLinkedStories += 1;
    validatePlaceReference({ storyId: storyLabel, field: 'place_id', value: story.place_id, file, placeIds });
  }

  if (Array.isArray(story.related_places)) {
    story.related_places.forEach((placeId, index) => {
      if (typeof placeId !== 'string' || !placeId.trim()) {
        errors.push(`related_places[] må inneholde place_id-strenger: story=${storyLabel} field=related_places[${index}] file=${file}`);
        return;
      }
      validatePlaceReference({ storyId: storyLabel, field: `related_places[${index}]`, value: placeId, file, placeIds });
    });
  } else if (story.related_places !== undefined) {
    errors.push(`related_places må være array når feltet finnes: story=${storyLabel} file=${file}`);
  }

  if (Array.isArray(story.next_scenes)) {
    stats.nextScenes += story.next_scenes.length;
    story.next_scenes.forEach((scene, index) => {
      if (scene && typeof scene === 'object' && isNonEmptyValue(scene.place_id)) {
        validatePlaceReference({
          storyId: storyLabel,
          field: `next_scenes[${index}].place_id`,
          value: scene.place_id,
          file,
          placeIds,
        });
      }
    });
  }

  if (isNonEmptyValue(story.person_id)) {
    stats.personLinkedStories += 1;
    if (peopleIds && !peopleIds.has(story.person_id)) {
      errors.push(`Ugyldig person_id: story=${storyLabel} field=person_id person_id=${story.person_id} file=${file}`);
    }
  }
}

async function main() {
  const manifest = await readJson(STORIES_MANIFEST_PATH, 'Stories-manifest');
  const { placeIds, placeFileCount } = await loadPlaceIds();
  const peopleIds = await loadPeopleIdsIfAvailable();

  const seenStoryIds = new Map();
  const stats = {
    storyFiles: 0,
    stories: 0,
    placeLinkedStories: 0,
    personLinkedStories: 0,
    nextScenes: 0,
  };

  if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    if (!Array.isArray(manifest.files)) {
      errors.push(`manifest.files må være en array: ${STORIES_MANIFEST_PATH}`);
    } else {
      for (const [manifestIndex, entry] of manifest.files.entries()) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          errors.push(`Manifest-entry må være objekt: index=${manifestIndex}`);
          continue;
        }

        if (typeof entry.path !== 'string' || !entry.path.trim()) {
          errors.push(`Manifest-entry mangler path: index=${manifestIndex}`);
          continue;
        }

        if (!VALID_STORY_CATEGORIES.has(entry.category)) {
          errors.push(`Ugyldig manifest category: category=${entry.category} path=${entry.path}`);
        }

        const stories = await readJson(entry.path, 'Story-fil');
        if (stories === undefined) continue;

        stats.storyFiles += 1;

        if (!Array.isArray(stories)) {
          errors.push(`Story-filens rotverdi må være array: file=${entry.path}`);
          continue;
        }

        stats.stories += stories.length;
        stories.forEach((story, storyIndex) => {
          validateStory(story, storyIndex, entry.path, placeIds, peopleIds, seenStoryIds, stats);
        });
      }
    }
  } else if (manifest !== undefined) {
    errors.push(`Stories-manifest må være et JSON-objekt: ${STORIES_MANIFEST_PATH}`);
  }

  console.log('Stories integrity summary');
  console.log(`- Story-filer: ${stats.storyFiles}`);
  console.log(`- Stories: ${stats.stories}`);
  console.log(`- Place-koblede stories: ${stats.placeLinkedStories}`);
  console.log(`- Person-koblede stories: ${stats.personLinkedStories}`);
  console.log(`- Next scenes: ${stats.nextScenes}`);
  console.log(`- Place-sourcefiler lest: ${placeFileCount}`);

  for (const todo of todos) {
    console.log(`TODO: ${todo}`);
  }

  if (errors.length > 0) {
    console.log('\nStories integrity FAILED');
    for (const error of errors) {
      console.log(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Stories integrity OK');
}

await main();
