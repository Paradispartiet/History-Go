#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  getPlaceCategoryPolicyStatus,
  REQUIRED_PLACE_FIELDS,
  RECOMMENDED_PLACE_FIELDS
} from './placeSchemaPolicy.mjs';

type JsonObject = { [key: string]: unknown };

type DataHealthError = JsonObject & {
  type: string;
  message: string;
};

type DataHealthWarning = JsonObject & {
  type: string;
  message: string;
};

type PlaceRow = JsonObject & {
  id: string;
  _file: string;
};

type PlaceManifest = JsonObject & {
  files?: unknown;
};

type OptionalManifest = {
  path: string;
  data: unknown;
  files: unknown[];
};

type PlaceHealthRow = {
  id: string;
  file: string;
  missing: string[];
  warnings: string[];
  errors: string[];
  coverageScore: number;
};

type DataHealthSummary = {
  totalPlaces: number;
  filesChecked: number;
  hardErrors: number;
  warnings: number;
  notConfigured: string[];
  topMissingPlaces: {
    id: string;
    issues: number;
    warnings: number;
    errors: number;
  }[];
};

type DataHealthState = {
  generatedAt: string;
  sourceManifests: string[];
  filesChecked: Set<string>;
  errors: DataHealthError[];
  warnings: DataHealthWarning[];
  places: PlaceHealthRow[];
  missingByType: Map<string, string[]>;
  notConfigured: Set<string>;
};

type PlaceIssueOptions = {
  alreadyReportedGlobally?: boolean;
};

const ROOT = process.cwd();
const REPORT_MD = path.join(ROOT, 'reports', 'data-health-summary.md');
const REPORT_JSON = path.join(ROOT, 'reports', 'data-health-full.json');

const state: DataHealthState = {
  generatedAt: new Date().toISOString(),
  sourceManifests: [],
  filesChecked: new Set(),
  errors: [],
  warnings: [],
  places: [],
  missingByType: new Map(),
  notConfigured: new Set()
};

const rel = (p: string): string => path.relative(ROOT, p).replaceAll(path.sep, '/');
const isObj = (v: unknown): v is JsonObject => !!v && typeof v === 'object' && !Array.isArray(v);
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const pushMissing = (type: string, placeId: string): void => {
  if (!state.missingByType.has(type)) state.missingByType.set(type, []);
  state.missingByType.get(type)?.push(placeId);
};
const addError = (type: string, message: string, context: JsonObject = {}): number => state.errors.push({ type, message, ...context });
const addWarning = (type: string, message: string, context: JsonObject = {}): number => state.warnings.push({ type, message, ...context });
const asJsonObject = (value: unknown): JsonObject => value as JsonObject;

function readJson(absPath: string, sourceLabel: string): unknown {
  state.filesChecked.add(rel(absPath));
  try {
    return JSON.parse(fs.readFileSync(absPath, 'utf8')) as unknown;
  } catch (error) {
    addError('invalid_json', `Could not parse JSON: ${rel(absPath)}`, { file: rel(absPath), detail: String(error instanceof Error ? (error.message || error) : error), source: sourceLabel });
    return null;
  }
}

function resolveManifestPath(entry: unknown, base = 'data/places'): string | null {
  const clean = String(entry || '').trim();
  if (!clean) return null;
  if (clean.startsWith('data/')) return path.join(ROOT, clean);
  return path.join(ROOT, base, clean.replace(/^\//, ''));
}

function extractPlaceIdsFromUnknown(data: unknown, acc = new Set<string>()): Set<string> {
  if (Array.isArray(data)) {
    for (const x of data) extractPlaceIdsFromUnknown(x, acc);
    return acc;
  }
  if (!isObj(data)) return acc;
  const candidates = ['place_id', 'placeId', 'place', 'placeRef', 'targetId', 'id'];
  for (const k of candidates) {
    if (nonEmpty(data[k])) acc.add(String(data[k]).trim());
  }
  for (const v of Object.values(data)) extractPlaceIdsFromUnknown(v, acc);
  return acc;
}

function checkAsset(assetPath: unknown, ctx: JsonObject): boolean {
  if (!nonEmpty(assetPath)) return false;
  const p = path.join(ROOT, assetPath.trim());
  if (!fs.existsSync(p)) {
    addWarning('missing_asset', `Asset path does not exist: ${assetPath}`, ctx);
    return false;
  }
  state.filesChecked.add(rel(p));
  return true;
}

function collectPlaces(): Map<string, PlaceRow> {
  const manifestPath = path.join(ROOT, 'data/places/manifest.json');
  state.sourceManifests.push('data/places/manifest.json');
  const manifest = readJson(manifestPath, 'places_manifest') as PlaceManifest | null;
  if (!manifest || !Array.isArray(manifest.files)) return new Map();

  const byId = new Map<string, PlaceRow>();
  for (const entry of manifest.files) {
    const abs = resolveManifestPath(entry, 'data');
    if (!abs || !fs.existsSync(abs)) {
      addError('missing_manifest_file', `Manifest points to missing file: ${entry}`, { manifest: 'data/places/manifest.json' });
      continue;
    }
    const fileData = readJson(abs, 'place_file');
    const rows = Array.isArray(fileData) ? fileData : isObj(fileData) && Array.isArray(fileData.places) ? fileData.places : null;
    if (!rows) {
      addError('invalid_place_file_shape', `Expected array or {places[]} in ${rel(abs)}`, { file: rel(abs) });
      continue;
    }
    for (const place of rows) {
      if (!isObj(place)) {
        addError('invalid_place_row', `Non-object place row in ${rel(abs)}`, { file: rel(abs) });
        continue;
      }
      const id = String(place.id || '').trim();
      if (!id) {
        addError('missing_id', `Place missing id in ${rel(abs)}`, { file: rel(abs) });
        continue;
      }
      if (byId.has(id)) {
        addError('duplicate_place_id', `Duplicate place id: ${id}`, { id, firstFile: byId.get(id)?._file, secondFile: rel(abs) });
        continue;
      }
      byId.set(id, { ...place, id, _file: rel(abs) });
    }
  }
  return byId;
}

function loadOptionalManifest(file: string, key = 'files'): OptionalManifest | null {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) {
    state.notConfigured.add(file);
    return null;
  }
  state.sourceManifests.push(file);
  const data = readJson(p, file);
  if (!data) return null;
  const dataObject = asJsonObject(data);
  return { path: file, data, files: Array.isArray(dataObject[key]) ? dataObject[key] as unknown[] : [] };
}

function run(): void {
  const placesById = collectPlaces();
  const placeIds = new Set(placesById.keys());

  const peopleManifest = loadOptionalManifest('data/people/manifest.json');
  const leksikonManifest = loadOptionalManifest('data/leksikon/manifest.json');
  const sprakManifest = loadOptionalManifest('data/leksikon/sprak/manifest.json');
  const wonderManifest = loadOptionalManifest('data/wonderkammer/index.json');
  const quizManifest = loadOptionalManifest('data/quiz/manifest.json');

  const i18n: Record<string, unknown> = {};
  for (const lang of ['en', 'pt', 'es']) {
    const p = path.join(ROOT, `data/i18n/content/places/${lang}.json`);
    if (fs.existsSync(p)) {
      i18n[lang] = readJson(p, `i18n_${lang}`) || {};
      state.filesChecked.add(rel(p));
    } else {
      state.notConfigured.add(`data/i18n/content/places/${lang}.json`);
      i18n[lang] = null;
    }
  }

  const peopleRefs = new Set<string>();
  if (peopleManifest) {
    for (const file of peopleManifest.files) {
      const abs = resolveManifestPath(file, 'data');
      if (!abs || !fs.existsSync(abs)) { addError('missing_manifest_file', `Missing people file ${file}`, { manifest: peopleManifest.path }); continue; }
      const rows = readJson(abs, 'people_file');
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (!isObj(row)) continue;
        for (const k of ['place_id', 'placeId']) if (nonEmpty(row[k])) peopleRefs.add(String(row[k]).trim());
      }
    }
  }

  const leksikonRefs = new Set<string>();
  if (leksikonManifest) {
    for (const file of leksikonManifest.files) {
      const abs = path.join(ROOT, file as string);
      if (!fs.existsSync(abs)) { addError('missing_manifest_file', `Missing leksikon file ${file}`, { manifest: leksikonManifest.path }); continue; }
      const rows = readJson(abs, 'leksikon_file');
      if (!Array.isArray(rows)) continue;
      for (const row of rows) if (isObj(row) && nonEmpty(row.place_id)) leksikonRefs.add(String(row.place_id).trim());
    }
  }

  const wonderRefs = new Set<string>();
  if (wonderManifest) {
    for (const file of wonderManifest.files) {
      const abs = path.join(ROOT, file as string);
      if (!fs.existsSync(abs)) { addError('missing_manifest_file', `Missing wonderkammer file ${file}`, { manifest: wonderManifest.path }); continue; }
      const data = readJson(abs, 'wonderkammer_file');
      extractPlaceIdsFromUnknown(data, wonderRefs);
    }
  }

  for (const ref of peopleRefs) if (!placeIds.has(ref)) addError('invalid_people_place_ref', `People references unknown place id ${ref}`, { id: ref });
  for (const ref of leksikonRefs) if (!placeIds.has(ref)) addError('invalid_leksikon_place_ref', `Leksikon references unknown place id ${ref}`, { id: ref });

  for (const [id, place] of placesById) {
    const missing: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const warningsAlreadyReportedGlobally = new Set<string>();
    const errorsAlreadyReportedGlobally = new Set<string>();
    const addPlaceWarning = (type: string, options: PlaceIssueOptions = {}): void => {
      warnings.push(type);
      if (options.alreadyReportedGlobally) warningsAlreadyReportedGlobally.add(type);
    };
    const addPlaceError = (type: string, options: PlaceIssueOptions = {}): void => {
      errors.push(type);
      if (options.alreadyReportedGlobally) errorsAlreadyReportedGlobally.add(type);
    };
    const req = [...REQUIRED_PLACE_FIELDS.filter((field: string) => field !== 'id'), ...RECOMMENDED_PLACE_FIELDS, 'popupDesc','image','cardImage','emne_ids','quiz_profile'];
    for (const field of req) if (place[field] == null || (typeof place[field] === 'string' && !place[field].trim())) missing.push(field);
    for (const field of missing) warnings.push(`missing_${field}`);

    const categoryStatus = getPlaceCategoryPolicyStatus(place.category);
    if (categoryStatus === 'unknown') addPlaceError('invalid_category');
    else if (categoryStatus === 'legacy_or_secondary') warnings.push('legacy_secondary_category');
    if (!(typeof place.lat === 'number' && Number.isFinite(place.lat) && place.lat >= -90 && place.lat <= 90)) addPlaceError('invalid_lat');
    if (!(typeof place.lon === 'number' && Number.isFinite(place.lon) && place.lon >= -180 && place.lon <= 180)) addPlaceError('invalid_lon');

    const checkPlaceAsset = (field: string): void => {
      if (!nonEmpty(place[field])) return;
      if (!checkAsset(place[field], { id, field, file: place._file })) {
        addPlaceWarning(`missing_asset_${field}`, { alreadyReportedGlobally: true });
      }
    };

    checkPlaceAsset('image');
    checkPlaceAsset('cardImage');
    if (place.popupImage != null) {
      if (!nonEmpty(place.popupImage)) warnings.push('missing_popupImage');
      else checkPlaceAsset('popupImage');
    }

    const hasLinks = nonEmpty(place.officialUrl) || nonEmpty(place.wikipedia) || nonEmpty(place.statsUrl) || nonEmpty(place.link);
    if (!hasLinks) warnings.push('missing_links');
    if (!Array.isArray(place.relations) && place.relations != null) warnings.push('invalid_relations_shape');

    if (!peopleRefs.has(id)) warnings.push('missing_people_linkage');
    if (!leksikonRefs.has(id)) warnings.push('missing_leksikon');

    const sprakPlaceFiles = sprakManifest ? asJsonObject(sprakManifest.data).place_files : undefined;
    if (sprakManifest && isObj(sprakPlaceFiles)) {
      if (!sprakPlaceFiles[id]) warnings.push('missing_spraakleksikon');
    } else {
      warnings.push('spraakleksikon_not_configured');
    }

    for (const lang of ['en','pt','es']) {
      if (i18n[lang] === null) warnings.push(`i18n_${lang}_not_configured`);
      else if (!asJsonObject(i18n[lang])[id]) warnings.push(`missing_i18n_${lang}`);
    }

    if (!wonderRefs.has(id) && !place.wonderkammer) warnings.push('missing_wonderkammer');

    if (place.groundhopper == null) warnings.push('missing_groundhopper');

    for (const w of warnings) {
      if (!warningsAlreadyReportedGlobally.has(w)) addWarning(w, `${id}: ${w}`, { id, file: place._file });
      pushMissing(w, id);
    }
    for (const e of errors) {
      if (!errorsAlreadyReportedGlobally.has(e)) addError(e, `${id}: ${e}`, { id, file: place._file });
    }

    state.places.push({ id, file: place._file, missing, warnings, errors, coverageScore: Math.max(0, 100 - (warnings.length * 4 + errors.length * 12)) });
  }

  const summary: DataHealthSummary = {
    totalPlaces: state.places.length,
    filesChecked: state.filesChecked.size,
    hardErrors: state.errors.length,
    warnings: state.warnings.length,
    notConfigured: Array.from(state.notConfigured).sort(),
    topMissingPlaces: state.places.slice().sort((a,b)=>(b.warnings.length+b.errors.length)-(a.warnings.length+a.errors.length)).slice(0,20).map(p=>({id:p.id, issues:p.warnings.length+p.errors.length, warnings:p.warnings.length, errors:p.errors.length}))
  };

  const missingByType: Record<string, string[]> = Object.fromEntries(Array.from(state.missingByType.entries()).map(([k,v])=>[k, Array.from(new Set(v)).sort()]));

  const recommendedNextBatches = summary.topMissingPlaces.slice(0,20).map(x=>x.id);

  const full = { summary, places: state.places, missingByType, errors: state.errors, warnings: state.warnings, generatedAt: state.generatedAt, sourceManifests: Array.from(new Set(state.sourceManifests)).sort() };

  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(full, null, 2) + '\n');

  const md = `# Data Health Summary\n\nGenerated: ${state.generatedAt}\n\n## Total summary\n- Places: **${summary.totalPlaces}**\n- Files checked: **${summary.filesChecked}**\n- Hard errors: **${summary.hardErrors}**\n- Warnings: **${summary.warnings}**\n\n## Not configured\n${summary.notConfigured.length ? summary.notConfigured.map(x=>`- \`${x}\``).join('\n') : '- none'}\n\n## Top 20 most incomplete places\n| Place ID | Total issues | Warnings | Errors |\n|---|---:|---:|---:|\n${summary.topMissingPlaces.map(r=>`| ${r.id} | ${r.issues} | ${r.warnings} | ${r.errors} |`).join('\n')}\n\n## Missing grouped by type\n${Object.keys(missingByType).sort().map(k=>`### ${k}\nCount: ${missingByType[k].length}\n\n${missingByType[k].slice(0,50).map(id=>`- \`${id}\``).join('\n')}\n`).join('\n')}\n\n## Recommended next batch order\n${recommendedNextBatches.map((id, i)=>`${i+1}. \`${id}\``).join('\n')}\n`;
  fs.writeFileSync(REPORT_MD, md);

  console.log(`[data-health] wrote ${rel(REPORT_MD)} and ${rel(REPORT_JSON)}`);
  console.log(`[data-health] places=${summary.totalPlaces} files=${summary.filesChecked} errors=${summary.hardErrors} warnings=${summary.warnings}`);
}

run();
