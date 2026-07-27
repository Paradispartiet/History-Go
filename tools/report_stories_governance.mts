#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const STORIES_MANIFEST = 'data/stories/stories_manifest.json';
const EPISODE_MANIFEST = 'data/stories/stories_episode_v1_manifest.json';
const PLACES_MANIFEST = 'data/places/manifest.json';

type Obj = Record<string, unknown>;
type Story = Obj & {
  id?: unknown;
  place_id?: unknown;
  quality_profile?: unknown;
};

type GovernanceMetrics = {
  totalPlaceRecords: number;
  activeStoryFiles: number;
  totalStories: number;
  legacyStories: number;
  episodeFiles: number;
  episodeStories: number;
  episodeStorySharePercent: number;
  storyCoveredPlaces: number;
  storyPlaceCoveragePercent: number;
  episodeReadyPlaces: number;
  episodeReadyPlaceCoveragePercent: number;
};

function isObj(value: unknown): value is Obj {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function percent(part: number, total: number): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

async function readJson(file: string): Promise<unknown> {
  const absolute = path.join(ROOT, file);
  try {
    return JSON.parse(await readFile(absolute, 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Kan ikke lese JSON: ${file} (${message})`);
  }
}

function entityRows(data: unknown, file: string, keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  if (isObj(data)) {
    if (text(data.id)) return [data];
    const matches = keys.filter((key) => Array.isArray(data[key]));
    if (matches.length === 1) return data[matches[0]] as unknown[];
  }
  throw new Error(`Sourcefil mangler entydig entity-array: ${file}`);
}

function normalizeDataPath(value: unknown): string {
  const file = text(value);
  if (!file) throw new Error(`Ugyldig tom filsti: ${JSON.stringify(value)}`);
  return file.startsWith('data/') ? file : `data/${file}`;
}

async function activeStoryFiles(): Promise<string[]> {
  const data = await readJson(STORIES_MANIFEST);
  if (!isObj(data) || !Array.isArray(data.files)) {
    throw new Error(`Stories-manifest må ha files-array: ${STORIES_MANIFEST}`);
  }

  const files = new Set<string>();
  for (const [index, entry] of data.files.entries()) {
    if (!isObj(entry) || !text(entry.path)) {
      throw new Error(`Stories-manifest-entry mangler path: index=${index}`);
    }
    files.add(normalizeDataPath(entry.path));
  }
  return [...files].sort();
}

async function episodeFiles(): Promise<Set<string>> {
  const data = await readJson(EPISODE_MANIFEST);
  if (!isObj(data) || data.version !== 'episode_v1' || !Array.isArray(data.files)) {
    throw new Error(`Episode-manifest må ha version=episode_v1 og files-array: ${EPISODE_MANIFEST}`);
  }
  return new Set(data.files.map(normalizeDataPath));
}

async function totalPlaceRecords(): Promise<number> {
  const data = await readJson(PLACES_MANIFEST);
  if (!isObj(data) || !Array.isArray(data.files)) {
    throw new Error(`Place-manifest må ha files-array: ${PLACES_MANIFEST}`);
  }

  const seen = new Set<string>();
  for (const item of data.files) {
    const file = normalizeDataPath(item);
    const rows = entityRows(await readJson(file), file, ['places']);
    for (const [index, row] of rows.entries()) {
      if (!isObj(row) || !text(row.id)) {
        throw new Error(`Place-entry mangler id: file=${file} index=${index}`);
      }
      const id = text(row.id);
      if (seen.has(id)) throw new Error(`Duplikat canonical place-id: ${id}`);
      seen.add(id);
    }
  }
  return seen.size;
}

async function collectMetrics(): Promise<GovernanceMetrics> {
  const storyFiles = await activeStoryFiles();
  const strictFiles = await episodeFiles();
  const placeTotal = await totalPlaceRecords();

  const storyIds = new Set<string>();
  const storyPlaces = new Set<string>();
  const episodePlaces = new Set<string>();
  let totalStories = 0;
  let episodeStories = 0;

  for (const file of storyFiles) {
    const rows = entityRows(await readJson(file), file, ['stories']);
    const strictFile = strictFiles.has(file);

    for (const [index, row] of rows.entries()) {
      if (!isObj(row)) throw new Error(`Story må være objekt: file=${file} index=${index}`);
      const story: Story = row;
      const id = text(story.id);
      if (!id) throw new Error(`Story mangler id: file=${file} index=${index}`);
      if (storyIds.has(id)) throw new Error(`Duplikat story-id: ${id}`);
      storyIds.add(id);
      totalStories += 1;

      const placeId = text(story.place_id);
      if (placeId) storyPlaces.add(placeId);

      const isEpisode = strictFile || story.quality_profile === 'episode_v1';
      if (isEpisode) {
        episodeStories += 1;
        if (placeId) episodePlaces.add(placeId);
      }
    }
  }

  for (const file of strictFiles) {
    if (!storyFiles.includes(file)) {
      throw new Error(`Episode-v1-fil er ikke aktivert i stories-manifestet: ${file}`);
    }
  }

  return {
    totalPlaceRecords: placeTotal,
    activeStoryFiles: storyFiles.length,
    totalStories,
    legacyStories: totalStories - episodeStories,
    episodeFiles: strictFiles.size,
    episodeStories,
    episodeStorySharePercent: percent(episodeStories, totalStories),
    storyCoveredPlaces: storyPlaces.size,
    storyPlaceCoveragePercent: percent(storyPlaces.size, placeTotal),
    episodeReadyPlaces: episodePlaces.size,
    episodeReadyPlaceCoveragePercent: percent(episodePlaces.size, placeTotal),
  };
}

function printText(metrics: GovernanceMetrics): void {
  console.log('Stories governance');
  console.log(`- Canonical places: ${metrics.totalPlaceRecords}`);
  console.log(`- Active story files: ${metrics.activeStoryFiles}`);
  console.log(`- Total stories: ${metrics.totalStories}`);
  console.log(`- Episode-v1 files: ${metrics.episodeFiles}`);
  console.log(`- Episode-v1 stories: ${metrics.episodeStories}`);
  console.log(`- Legacy stories: ${metrics.legacyStories}`);
  console.log(`- Episode story share: ${metrics.episodeStorySharePercent.toFixed(1)} %`);
  console.log(`- Story-covered places: ${metrics.storyCoveredPlaces}`);
  console.log(`- Story place coverage: ${metrics.storyPlaceCoveragePercent.toFixed(1)} %`);
  console.log(`- Episode-ready places: ${metrics.episodeReadyPlaces}`);
  console.log(`- Episode-ready place coverage: ${metrics.episodeReadyPlaceCoveragePercent.toFixed(1)} %`);
}

try {
  const metrics = await collectMetrics();
  if (process.argv.includes('--json')) console.log(JSON.stringify(metrics, null, 2));
  else printText(metrics);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Stories governance FAILED: ${message}`);
  process.exitCode = 1;
}
