#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const STORIES_MANIFEST_PATH = 'data/stories/stories_manifest.json';
const PLACES_ROOT = 'data/places';
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
const warnings = [];

function repoPath(...segments) {
  return path.join(REPO_ROOT, ...segments);
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
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

async function listJsonFiles(relativeDir) {
  const absoluteDir = repoPath(relativeDir);
  const found = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      errors.push(`Kan ikke lese mappe ${toPosixPath(path.relative(REPO_ROOT, dir))}: ${error.message}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        found.push(toPosixPath(path.relative(REPO_ROOT, fullPath)));
      }
    }
  }

  await walk(absoluteDir);
  return found.sort();
}

function collectObjectIds(value, ids) {
  if (Array.isArray(value)) {
    for (const item of value) collectObjectIds(item, ids);
    return;
  }

  if (value && typeof value === 'object') {
    if (typeof value.id === 'string' && value.id.trim()) {
      ids.add(value.id);
    }

    for (const nestedValue of Object.values(value)) {
      if (nestedValue && typeof nestedValue === 'object') {
        collectObjectIds(nestedValue, ids);
      }
    }
  }
}

async function loadPlaceIds() {
  const placeIds = new Set();
  const placeManifest = await readJson('data/places/manifest.json', 'Place-manifest', { reportError: false });
  let placeFiles;

  if (placeManifest && Array.isArray(placeManifest.files)) {
    placeFiles = placeManifest.files.map((file) => (file.startsWith('data/') ? file : `data/${file}`));
  } else {
    warnings.push('Fant ikke lesbar data/places/manifest.json med files-array; scanner JSON-sourcefiler under data/places/ direkte.');
    placeFiles = (await listJsonFiles(PLACES_ROOT)).filter((file) => {
      const basename = path.posix.basename(file);
      return ![
        'manifest.json',
        'places_index.json',
        'places_nature_aliases.json',
        'place_image_candidates.json',
        'place_image_seeds.json',
      ].includes(basename);
    });
  }

  for (const file of placeFiles) {
    const json = await readJson(file, 'Place-sourcefil');
    if (json !== undefined) {
      collectObjectIds(json, placeIds);
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
    collectObjectIds(json, peopleIds);
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

  for (const warning of warnings) {
    console.log(`WARNING: ${warning}`);
  }
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
