#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { readCategoryOverrides } from './lib/placeCategoryOverrides.mjs';

type JsonObject = Record<string, unknown>;
type PlaceRow = JsonObject & {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  tags?: unknown;
  quiz_profile?: unknown;
};
type PlaceManifest = JsonObject & { files?: unknown[] };
type PlaceEntry = { place: PlaceRow; sourceFile: string };
type Candidate = {
  id: string;
  name: string;
  category: string;
  sourceFile: string;
  reasons: string[];
  reviewHints: string[];
};
type CandidateReview = {
  id: string;
  category: string;
  reason: string;
};

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'data');
const MANIFEST_PATH = path.join(DATA_ROOT, 'places/manifest.json');
const REVIEW_PATH = path.join(DATA_ROOT, 'places/religion_candidate_review.json');
const CATEGORY_ID_PATTERN = /^[a-z0-9_]+$/;

const RELIGIOUS_PLACE_TYPES = new Set([
  'kirke',
  'kyrkje',
  'stavkirke',
  'domkirke',
  'katedral',
  'cathedral',
  'church',
  'kapell',
  'chapel',
  'moske',
  'mosque',
  'synagoge',
  'synagogue',
  'tempel',
  'temple',
  'bedehus',
  'kloster',
  'monastery',
  'abbey',
  'basilika',
  'basilica',
  'helligdom',
  'shrine',
  'igreja',
  'catedral',
  'mosteiro',
]);

const RELIGIOUS_NAME_PATTERNS: Array<[string, RegExp]> = [
  ['kirke', /\bkirke\b/i],
  ['kyrkje', /\bkyrkje\b/i],
  ['stavkirke', /\bstavkirke\b/i],
  ['domkirke', /\bdomkirke\b/i],
  ['katedral', /\b(?:katedral|cathedral|catedral)\b/i],
  ['kapell', /\b(?:kapell|chapel)\b/i],
  ['moské', /\b(?:moske|moské|mosque)\b/i],
  ['synagoge', /\b(?:synagoge|synagogue)\b/i],
  ['tempel', /\b(?:tempel|temple)\b/i],
  ['bedehus', /\bbedehus\b/i],
  ['kloster', /\b(?:kloster|monastery|abbey|mosteiro)\b/i],
  ['basilika', /\b(?:basilika|basilica)\b/i],
  ['helligdom', /\b(?:helligdom|shrine)\b/i],
  ['igreja', /\bigreja\b/i],
];

const REVIEW_HINT_PATTERNS: Array<[string, RegExp]> = [
  ['ruin', /\b(?:ruin|ruiner|kirkeruin|klosterruin)\b/i],
  ['tidligere sted/tomt', /\b(?:tomt|tomta|tidligere|former|revet|forsvunnet)\b/i],
  ['museum', /\b(?:museum|museet|museumsområde|museumsomrade)\b/i],
  ['prestegård', /\b(?:prestegård|prestegard|prestebustad)\b/i],
  ['gravsted', /\b(?:gravlund|kirkegård|kirkegard|cemetery|cemiterio)\b/i],
  ['minnested', /\b(?:minne|minnested|minnesmerke|brannminne)\b/i],
  ['sekulær nåfunksjon', /\b(?:kulturhus|kulturscene|kunstneratelier|mausoleum|panteon|pantheon)\b/i],
];

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown;
}

async function readCandidateReviews(): Promise<Map<string, CandidateReview>> {
  let data: unknown;
  try {
    data = await readJson(REVIEW_PATH);
  } catch (error: unknown) {
    const code = isObject(error) ? error.code : undefined;
    if (code === 'ENOENT') return new Map();
    throw error;
  }

  if (!Array.isArray(data)) {
    throw new Error('data/places/religion_candidate_review.json must be a JSON array.');
  }

  const reviews = new Map<string, CandidateReview>();
  for (const [index, raw] of data.entries()) {
    if (!isObject(raw)) {
      throw new Error(`religion_candidate_review.json[${index}] must be an object.`);
    }
    if (typeof raw.id !== 'string' || !raw.id.trim()) {
      throw new Error(`religion_candidate_review.json[${index}] must have a non-empty string id.`);
    }
    if (typeof raw.category !== 'string' || !CATEGORY_ID_PATTERN.test(raw.category.trim())) {
      throw new Error(`religion_candidate_review.json#${raw.id.trim()} has an invalid category.`);
    }
    if (typeof raw.reason !== 'string' || !raw.reason.trim()) {
      throw new Error(`religion_candidate_review.json#${raw.id.trim()} must have a non-empty reason.`);
    }

    const review: CandidateReview = {
      id: raw.id.trim(),
      category: raw.category.trim(),
      reason: raw.reason.trim(),
    };
    if (reviews.has(review.id)) {
      throw new Error(`religion_candidate_review.json contains duplicate id "${review.id}".`);
    }
    reviews.set(review.id, review);
  }

  return reviews;
}

function normalizeToken(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function textValues(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(textValues);
  if (isObject(value)) return Object.values(value).flatMap(textValues);
  return [];
}

function isPlaceRow(value: unknown): value is PlaceRow {
  return isObject(value);
}

function placesFromData(data: unknown): PlaceRow[] {
  if (Array.isArray(data)) return data.filter(isPlaceRow);
  if (isObject(data) && Array.isArray(data.places)) return data.places.filter(isPlaceRow);
  if (isPlaceRow(data) && typeof data.id === 'string') return [data];
  return [];
}

function splitManifestPathFor(sourcePath: string): string {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || '.json'}`);
}

function isSplitManifest(value: unknown): value is JsonObject & { places: JsonObject[] } {
  return isObject(value)
    && Array.isArray(value.places)
    && value.places.some((row) => isObject(row) && typeof row.file === 'string' && row.file.trim());
}

async function tryReadSplitManifest(sourcePath: string): Promise<{ path: string; data: JsonObject & { places: JsonObject[] } } | null> {
  const splitPath = splitManifestPathFor(sourcePath);
  try {
    const data = await readJson(splitPath);
    return isSplitManifest(data) ? { path: splitPath, data } : null;
  } catch (error: unknown) {
    const code = isObject(error) ? error.code : undefined;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

async function loadEntries(sourceFile: string): Promise<PlaceEntry[]> {
  const fullPath = path.join(DATA_ROOT, sourceFile);
  const splitManifest = await tryReadSplitManifest(fullPath);

  if (splitManifest) {
    const splitDir = path.dirname(splitManifest.path);
    const entries: PlaceEntry[] = [];
    for (const row of splitManifest.data.places) {
      if (!isObject(row) || typeof row.file !== 'string' || !row.file.trim()) continue;
      const childPath = path.join(splitDir, row.file.trim());
      const childSourceFile = path.relative(DATA_ROOT, childPath).split(path.sep).join('/');
      const childData = await readJson(childPath);
      for (const place of placesFromData(childData)) entries.push({ place, sourceFile: childSourceFile });
    }
    return entries;
  }

  const data = await readJson(fullPath);
  return placesFromData(data).map((place) => ({ place, sourceFile }));
}

function getQuizProfile(place: PlaceRow): JsonObject {
  return isObject(place.quiz_profile) ? place.quiz_profile : {};
}

function candidateReasons(place: PlaceRow): string[] {
  const reasons = new Set<string>();
  const quiz = getQuizProfile(place);
  const placeType = normalizeToken(quiz.place_type);
  const subtype = normalizeToken(quiz.subtype);

  if (RELIGIOUS_PLACE_TYPES.has(placeType)) reasons.add(`place_type=${placeType}`);
  if (RELIGIOUS_PLACE_TYPES.has(subtype)) reasons.add(`subtype=${subtype}`);

  const name = String(place.name || '');
  for (const [label, pattern] of RELIGIOUS_NAME_PATTERNS) {
    if (pattern.test(name)) reasons.add(`name:${label}`);
  }

  const tags = Array.isArray(place.tags) ? place.tags : [];
  for (const tag of tags) {
    const normalized = normalizeToken(tag);
    if (RELIGIOUS_PLACE_TYPES.has(normalized)) reasons.add(`tag=${normalized}`);
  }

  return [...reasons];
}

function candidateReviewHints(place: PlaceRow): string[] {
  const joined = [
    place.name,
    place.category,
    ...textValues(place.quiz_profile),
  ].join(' ');
  return REVIEW_HINT_PATTERNS.filter(([, pattern]) => pattern.test(joined)).map(([label]) => label);
}

async function main(): Promise<void> {
  const manifest = await readJson(MANIFEST_PATH);
  if (!isObject(manifest) || !Array.isArray((manifest as PlaceManifest).files)) {
    throw new Error('data/places/manifest.json must contain a files array.');
  }

  const categoryOverrides = await readCategoryOverrides(ROOT);
  const reviewed = await readCandidateReviews();
  const seenReviewIds = new Set<string>();
  const candidates = new Map<string, Candidate>();

  for (const rawSourceFile of (manifest as PlaceManifest).files || []) {
    const sourceFile = String(rawSourceFile || '').trim();
    if (!sourceFile) continue;

    for (const { place, sourceFile: actualSourceFile } of await loadEntries(sourceFile)) {
      const id = typeof place.id === 'string' ? place.id.trim() : '';
      if (!id) continue;

      const rawCategory = String(place.category || '').trim();
      const review = reviewed.get(id);
      if (review) {
        seenReviewIds.add(id);
        if (categoryOverrides.has(id) || rawCategory === 'religion') {
          throw new Error(`Reviewed candidate ${id} is now explicitly classified as Religion/override; remove it from religion_candidate_review.json.`);
        }
        if (review.category !== rawCategory) {
          throw new Error(`Reviewed candidate ${id} expects category "${review.category}", but source data now has "${rawCategory}".`);
        }
        continue;
      }

      if (rawCategory === 'religion') continue;
      if (categoryOverrides.has(id)) continue;

      const reasons = candidateReasons(place);
      if (!reasons.length) continue;

      const candidate: Candidate = {
        id,
        name: String(place.name || id).trim(),
        category: rawCategory || '(missing)',
        sourceFile: actualSourceFile,
        reasons,
        reviewHints: candidateReviewHints(place),
      };

      const existing = candidates.get(id);
      if (!existing || candidate.reasons.length > existing.reasons.length) candidates.set(id, candidate);
    }
  }

  const missingReviewedPlaces = [...reviewed.keys()].filter((id) => !seenReviewIds.has(id));
  if (missingReviewedPlaces.length) {
    throw new Error(`Reviewed Religion candidates are missing from canonical place data: ${missingReviewedPlaces.join(', ')}`);
  }

  const sorted = [...candidates.values()].sort((a, b) =>
    a.sourceFile.localeCompare(b.sourceFile, 'nb') || a.id.localeCompare(b.id, 'nb')
  );

  console.log(`Religion candidate audit: ${sorted.length} unreviewed candidate(s); ${reviewed.size} reviewed non-Religion decision(s).`);
  for (const candidate of sorted) {
    const hints = candidate.reviewHints.length ? `; review hints: ${candidate.reviewHints.join(', ')}` : '';
    console.log(`- ${candidate.id} [${candidate.category}] ${candidate.name}`);
    console.log(`  source: ${candidate.sourceFile}`);
    console.log(`  reasons: ${candidate.reasons.join(', ')}${hints}`);
  }
}

main().catch((error: unknown) => {
  console.error('Religion candidate audit failed.');
  console.error(error);
  process.exit(1);
});
