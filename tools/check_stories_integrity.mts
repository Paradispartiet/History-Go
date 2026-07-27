#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const STORIES_MANIFEST = 'data/stories/stories_manifest.json';
const EPISODE_MANIFEST = 'data/stories/stories_episode_v1_manifest.json';
const STORY_TYPES = 'data/stories/story_types.json';
const PEOPLE_MANIFEST = 'data/people/manifest.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const LEGACY_CATEGORIES = new Set<unknown>(['populaerkultur']);

type Obj = Record<string, unknown>;
type Story = Obj & {
  id?: unknown; type?: unknown; title?: unknown; year?: unknown;
  place_id?: unknown; person_id?: unknown; summary?: unknown; story?: unknown;
  sources?: unknown; score?: unknown; quality_profile?: unknown; episode?: unknown;
  related_people?: unknown; related_places?: unknown; next_scenes?: unknown;
};

const errors: string[] = [];
const todos: string[] = [];

function isObj(v: unknown): v is Obj {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}
function present(v: unknown): boolean {
  return v !== undefined && v !== null && v !== '';
}
function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
async function json(file: string, label: string, report = true): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(path.join(ROOT, file), 'utf8'));
  } catch (error) {
    if (report) errors.push(`${label} kan ikke leses som JSON: ${file} (${errorText(error)})`);
    return undefined;
  }
}

async function validCategories(): Promise<Set<unknown>> {
  const out = new Set<unknown>(LEGACY_CATEGORIES);
  const data = await json(CATEGORY_CONTRACT, 'Kategori-kontrakt');
  if (!isObj(data) || !Array.isArray(data.runtimeCategories)) {
    errors.push(`Kategori-kontrakten må ha runtimeCategories-array: ${CATEGORY_CONTRACT}`);
    return out;
  }
  for (const value of data.runtimeCategories) {
    if (typeof value === 'string' && value.trim()) out.add(value);
    else errors.push(`Ugyldig runtimekategori: ${JSON.stringify(value)}`);
  }
  return out;
}

async function validTypes(): Promise<Set<string>> {
  const out = new Set<string>();
  const data = await json(STORY_TYPES, 'Story-type-register');
  if (!isObj(data) || !Array.isArray(data.types)) {
    errors.push(`Story-type-registeret må ha types-array: ${STORY_TYPES}`);
    return out;
  }
  for (const row of data.types) {
    if (isObj(row) && text(row.id)) out.add(text(row.id));
    else errors.push(`Ugyldig story-type: ${JSON.stringify(row)}`);
  }
  return out;
}

async function episodePaths(): Promise<Set<string>> {
  const out = new Set<string>();
  const data = await json(EPISODE_MANIFEST, 'Episode-v1-manifest');
  if (!isObj(data) || data.version !== 'episode_v1' || !Array.isArray(data.files)) {
    errors.push(`Episode-v1-manifestet må ha version=episode_v1 og files-array: ${EPISODE_MANIFEST}`);
    return out;
  }
  for (const file of data.files) {
    const value = text(file);
    if (!value) errors.push(`Ugyldig episode-v1-filsti: ${JSON.stringify(file)}`);
    else if (out.has(value)) errors.push(`Duplikat episode-v1-filsti: ${value}`);
    else out.add(value);
  }
  return out;
}

function entityRows(data: unknown, file: string, label: string, keys: string[], report = true): unknown[] | undefined {
  if (Array.isArray(data)) return data;
  if (isObj(data)) {
    if (text(data.id)) return [data];
    const matches = keys.filter((key) => Array.isArray(data[key]));
    if (matches.length === 1) return data[matches[0]] as unknown[];
  }
  if (report) errors.push(`${label}-sourcefil mangler entydig entity-array: ${file}`);
  return undefined;
}

function idsFrom(data: unknown, file: string, label: string, keys: string[], report = true): string[] | undefined {
  const rows = entityRows(data, file, label, keys, report);
  if (!rows) return undefined;
  const ids: string[] = [];
  for (const [index, row] of rows.entries()) {
    if (!isObj(row) || !text(row.id)) {
      if (report) errors.push(`${label}-entry mangler id: file=${file} index=${index}`);
      return undefined;
    }
    ids.push(text(row.id));
  }
  return ids;
}

async function placeIds(): Promise<{ ids: Set<unknown>; files: number }> {
  const out = new Set<unknown>();
  const manifest = await json('data/places/manifest.json', 'Place-manifest');
  if (!isObj(manifest) || !Array.isArray(manifest.files)) {
    errors.push('Place-manifest må ha files-array: data/places/manifest.json');
    return { ids: out, files: 0 };
  }
  const files = (manifest.files as unknown[]).map(text).filter(Boolean)
    .map((file) => file.startsWith('data/') ? file : `data/${file}`);
  for (const file of files) {
    const data = await json(file, 'Place-sourcefil');
    for (const id of idsFrom(data, file, 'Place', ['places']) ?? []) out.add(id);
  }
  return { ids: out, files: files.length };
}

async function peopleIds(): Promise<Set<unknown> | undefined> {
  const manifest = await json(PEOPLE_MANIFEST, 'People-manifest', false);
  if (!isObj(manifest) || !Array.isArray(manifest.files)) {
    todos.push('personreferanser er ikke validert: people-manifest har ikke enkel files-array.');
    return undefined;
  }
  const out = new Set<unknown>();
  for (const item of manifest.files) {
    const raw = text(item);
    if (!raw) return undefined;
    const file = raw.startsWith('data/') ? raw : `data/${raw}`;
    const data = await json(file, 'People-sourcefil', false);
    const ids = idsFrom(data, file, 'People', ['people', 'persons'], false);
    if (!ids) {
      todos.push(`personreferanser er ikke fullstendig validert: ${file}`);
      return undefined;
    }
    for (const id of ids) out.add(id);
  }
  return out;
}

function matches(pattern: RegExp, value: string): number {
  return value.match(pattern)?.length ?? 0;
}
function runtimeScore(story: Story): Record<string, number> {
  const value = `${text(story.summary)} ${text(story.story)}`.trim().toLowerCase();
  const narrative = Math.min(3 + matches(/\bkonflikt|strid|debatt|drama\b/g, value), 5);
  const historical = Math.min(
    2 + matches(/\bkrig|valg|regjering|okkupasjon\b/g, value)
      + matches(/\bbyutvikling|industri|arbeider\b/g, value),
    5,
  );
  const n = Array.isArray(story.sources) ? story.sources.length : 0;
  const source = n >= 3 ? 5 : n === 2 ? 4 : n === 1 ? 3 : 1;
  const play_value = Math.min(
    3 + matches(/\bmorsom|absurd|merkelig|underlig\b/g, value)
      + matches(/\bkonflikt|skandale|drama|vendepunkt\b/g, value),
    5,
  );
  const originality = Math.min(
    3 + matches(/\buvanlig|unik|første gang|sjelden\b/g, value)
      + matches(/\bmerkelig|underlig|absurd\b/g, value),
    5,
  );
  return {
    narrative, historical, source, play_value, originality,
    total: narrative + historical + source + play_value + originality,
  };
}

function checkPlace(id: unknown, storyId: unknown, field: string, file: string, places: Set<unknown>): void {
  if (!places.has(id)) errors.push(`Ugyldig place_id: story=${String(storyId)} field=${field} place_id=${String(id)} file=${file}`);
}

function validateEpisode(story: Story, label: unknown, file: string, types: Set<string>, people: Set<unknown> | undefined): void {
  if (story.quality_profile !== 'episode_v1') {
    errors.push(`Episode-v1-fil krever quality_profile=episode_v1: story=${String(label)} file=${file}`);
  }
  if (!types.has(text(story.type))) {
    errors.push(`Ugyldig canonical story-type: story=${String(label)} type=${String(story.type)} file=${file}`);
  }
  if (!text(story.summary)) errors.push(`Episode-v1-story mangler summary: story=${String(label)} file=${file}`);
  if (typeof story.year !== 'number' || !Number.isInteger(story.year)) {
    errors.push(`Episode-v1-story krever heltallsår: story=${String(label)} year=${String(story.year)} file=${file}`);
  }
  if (!Array.isArray(story.sources) || story.sources.length < 2) {
    errors.push(`Episode-v1-story krever minst to kilder: story=${String(label)} file=${file}`);
  } else {
    story.sources.forEach((source, index) => {
      if (!isObj(source) || !text(source.title) || !text(source.url).startsWith('https://')) {
        errors.push(`Episode-v1-kilde må ha title og HTTPS-url: story=${String(label)} source[${index}] file=${file}`);
      }
    });
  }
  if (!isObj(story.episode)) {
    errors.push(`Episode-v1-story mangler episode-objekt: story=${String(label)} file=${file}`);
  } else {
    const actors = story.episode.actors;
    if (!Array.isArray(actors) || !actors.length || actors.some((actor) => !text(actor))) {
      errors.push(`episode.actors må være en ikke-tom navnearray: story=${String(label)} file=${file}`);
    }
    for (const field of ['date', 'action', 'consequence']) {
      if (!text(story.episode[field])) errors.push(`episode.${field} mangler: story=${String(label)} file=${file}`);
    }
  }
  if (!Array.isArray(story.related_people)) {
    errors.push(`Episode-v1-story krever related_people-array: story=${String(label)} file=${file}`);
  } else {
    story.related_people.forEach((id, index) => {
      if (!text(id)) errors.push(`related_people[${index}] må være canonical person_id: story=${String(label)} file=${file}`);
      else if (people && !people.has(id)) errors.push(`Ugyldig related_people person_id: story=${String(label)} person_id=${String(id)} file=${file}`);
    });
  }
  const expected = runtimeScore(story);
  if (!isObj(story.score)) {
    errors.push(`Episode-v1-story krever maskinberegnet score: story=${String(label)} file=${file}`);
  } else {
    for (const [field, value] of Object.entries(expected)) {
      if (story.score[field] !== value) {
        errors.push(`Scoreavvik: story=${String(label)} field=score.${field} expected=${value} actual=${String(story.score[field])} file=${file}`);
      }
    }
  }
}

type Stats = {
  files: number; stories: number; placeLinked: number; personLinked: number;
  nextScenes: number; episodeFiles: number; episodeStories: number;
};

function validateStory(
  row: unknown, index: number, file: string, strict: boolean,
  places: Set<unknown>, people: Set<unknown> | undefined, types: Set<string>,
  seen: Map<unknown, string>, stats: Stats,
): void {
  if (!isObj(row)) {
    errors.push(`Story må være objekt: file=${file} index=${index}`);
    return;
  }
  const story: Story = row;
  const label = present(story.id) ? story.id : `<index ${index}>`;
  for (const field of ['id', 'type', 'title', 'story', 'sources']) {
    if (!present(story[field])) errors.push(`Mangler required field: story=${String(label)} field=${field} file=${file}`);
  }
  if (!present(story.place_id) && !present(story.person_id)) {
    errors.push(`Story må ha place_id eller person_id: story=${String(label)} file=${file}`);
  }
  if (present(story.id)) {
    if (seen.has(story.id)) errors.push(`Duplikat story.id: ${String(story.id)} i ${seen.get(story.id)} og ${file}`);
    else seen.set(story.id, file);
  }
  if (!Array.isArray(story.sources) || !story.sources.length) {
    errors.push(`sources må være en ikke-tom array: story=${String(label)} file=${file}`);
  }
  if (story.score !== undefined && (!isObj(story.score) || !Object.hasOwn(story.score, 'total'))) {
    errors.push(`score.total mangler: story=${String(label)} file=${file}`);
  }
  if (present(story.place_id)) {
    stats.placeLinked += 1;
    checkPlace(story.place_id, label, 'place_id', file, places);
  }
  if (Array.isArray(story.related_places)) {
    story.related_places.forEach((id, i) => {
      if (!text(id)) errors.push(`related_places[${i}] må være place_id: story=${String(label)} file=${file}`);
      else checkPlace(id, label, `related_places[${i}]`, file, places);
    });
  } else if (story.related_places !== undefined) {
    errors.push(`related_places må være array: story=${String(label)} file=${file}`);
  }
  if (story.next_scenes !== undefined && !Array.isArray(story.next_scenes)) {
    errors.push(`next_scenes må være array: story=${String(label)} file=${file}`);
  } else if (Array.isArray(story.next_scenes)) {
    stats.nextScenes += story.next_scenes.length;
    story.next_scenes.forEach((scene, i) => {
      if (isObj(scene) && present(scene.place_id)) checkPlace(scene.place_id, label, `next_scenes[${i}].place_id`, file, places);
    });
  }
  if (present(story.person_id)) {
    stats.personLinked += 1;
    if (people && !people.has(story.person_id)) {
      errors.push(`Ugyldig person_id: story=${String(label)} person_id=${String(story.person_id)} file=${file}`);
    }
  }
  if (strict || story.quality_profile === 'episode_v1') {
    stats.episodeStories += 1;
    validateEpisode(story, label, file, types, people);
  } else if (present(story.quality_profile)) {
    errors.push(`Ukjent quality_profile: story=${String(label)} profile=${String(story.quality_profile)} file=${file}`);
  }
}

async function main(): Promise<void> {
  const manifest = await json(STORIES_MANIFEST, 'Stories-manifest');
  const placeData = await placeIds();
  const people = await peopleIds();
  const categories = await validCategories();
  const types = await validTypes();
  const strictPaths = await episodePaths();
  const seen = new Map<unknown, string>();
  const loaded = new Set<string>();
  const active = new Set<string>();
  const stats: Stats = {
    files: 0, stories: 0, placeLinked: 0, personLinked: 0,
    nextScenes: 0, episodeFiles: 0, episodeStories: 0,
  };

  if (!isObj(manifest) || !Array.isArray(manifest.files)) {
    errors.push(`Stories-manifest må ha files-array: ${STORIES_MANIFEST}`);
  } else {
    for (const [index, entry] of manifest.files.entries()) {
      if (!isObj(entry) || !text(entry.path)) {
        errors.push(`Manifest-entry mangler path: index=${index}`);
        continue;
      }
      const file = text(entry.path);
      active.add(file);
      if (!categories.has(entry.category)) errors.push(`Ugyldig manifest category: category=${String(entry.category)} path=${file}`);
      if (loaded.has(file)) continue;
      loaded.add(file);
      const stories = await json(file, 'Story-fil');
      if (!Array.isArray(stories)) {
        errors.push(`Story-filens rotverdi må være array: file=${file}`);
        continue;
      }
      stats.files += 1;
      stats.stories += stories.length;
      const strict = strictPaths.has(file);
      if (strict) stats.episodeFiles += 1;
      stories.forEach((story, storyIndex) => {
        validateStory(story, storyIndex, file, strict, placeData.ids, people, types, seen, stats);
      });
    }
  }

  for (const file of strictPaths) {
    if (!active.has(file)) errors.push(`Episode-v1-fil er ikke aktivert i stories-manifestet: ${file}`);
  }

  console.log('Stories integrity summary');
  console.log(`- Story-filer: ${stats.files}`);
  console.log(`- Stories: ${stats.stories}`);
  console.log(`- Place-koblede stories: ${stats.placeLinked}`);
  console.log(`- Person-koblede stories: ${stats.personLinked}`);
  console.log(`- Next scenes: ${stats.nextScenes}`);
  console.log(`- Episode-v1-filer: ${stats.episodeFiles}`);
  console.log(`- Episode-v1-stories: ${stats.episodeStories}`);
  console.log(`- Place-sourcefiler lest: ${placeData.files}`);
  for (const todo of todos) console.log(`TODO: ${todo}`);

  if (errors.length) {
    console.log('\nStories integrity FAILED');
    for (const issue of errors) console.log(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log('Stories integrity OK');
  }
}

await main();
