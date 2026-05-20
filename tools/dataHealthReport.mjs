#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const REPORT_MD = path.join(ROOT, 'reports', 'data-health-summary.md');
const REPORT_JSON = path.join(ROOT, 'reports', 'data-health-full.json');

const VALID_CATEGORIES = new Set([
  'historie','vitenskap','kunst','musikk','natur','sport','by','politikk','populaerkultur','subkultur','litteratur','naeringsliv','film','film_tv','media','psykologi'
]);

const state = {
  generatedAt: new Date().toISOString(),
  sourceManifests: [],
  filesChecked: new Set(),
  errors: [],
  warnings: [],
  places: [],
  missingByType: new Map(),
  notConfigured: new Set()
};

const rel = (p) => path.relative(ROOT, p).replaceAll(path.sep, '/');
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const pushMissing = (type, placeId) => {
  if (!state.missingByType.has(type)) state.missingByType.set(type, []);
  state.missingByType.get(type).push(placeId);
};
const addError = (type, message, context = {}) => state.errors.push({ type, message, ...context });
const addWarning = (type, message, context = {}) => state.warnings.push({ type, message, ...context });

function readJson(absPath, sourceLabel) {
  state.filesChecked.add(rel(absPath));
  try {
    return JSON.parse(fs.readFileSync(absPath, 'utf8'));
  } catch (error) {
    addError('invalid_json', `Could not parse JSON: ${rel(absPath)}`, { file: rel(absPath), detail: String(error.message || error), source: sourceLabel });
    return null;
  }
}

function resolveManifestPath(entry, base = 'data/places') {
  const clean = String(entry || '').trim();
  if (!clean) return null;
  if (clean.startsWith('data/')) return path.join(ROOT, clean);
  return path.join(ROOT, base, clean.replace(/^\//, ''));
}

function extractPlaceIdsFromUnknown(data, acc = new Set()) {
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

function checkAsset(assetPath, ctx) {
  if (!nonEmpty(assetPath)) return false;
  const p = path.join(ROOT, assetPath.trim());
  if (!fs.existsSync(p)) {
    addError('missing_asset', `Asset path does not exist: ${assetPath}`, ctx);
    return false;
  }
  state.filesChecked.add(rel(p));
  return true;
}

function collectPlaces() {
  const manifestPath = path.join(ROOT, 'data/places/manifest.json');
  state.sourceManifests.push('data/places/manifest.json');
  const manifest = readJson(manifestPath, 'places_manifest');
  if (!manifest || !Array.isArray(manifest.files)) return new Map();

  const byId = new Map();
  for (const entry of manifest.files) {
    const abs = resolveManifestPath(entry, 'data');
    if (!abs || !fs.existsSync(abs)) {
      addError('missing_manifest_file', `Manifest points to missing file: ${entry}`, { manifest: 'data/places/manifest.json' });
      continue;
    }
    const fileData = readJson(abs, 'place_file');
    const rows = Array.isArray(fileData) ? fileData : Array.isArray(fileData?.places) ? fileData.places : null;
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
        addError('duplicate_place_id', `Duplicate place id: ${id}`, { id, firstFile: byId.get(id)._file, secondFile: rel(abs) });
        continue;
      }
      byId.set(id, { ...place, _file: rel(abs) });
    }
  }
  return byId;
}

function loadOptionalManifest(file, key = 'files') {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) {
    state.notConfigured.add(file);
    return null;
  }
  state.sourceManifests.push(file);
  const data = readJson(p, file);
  if (!data) return null;
  return { path: file, data, files: Array.isArray(data[key]) ? data[key] : [] };
}

function run() {
  const placesById = collectPlaces();
  const placeIds = new Set(placesById.keys());

  const peopleManifest = loadOptionalManifest('data/people/manifest.json');
  const leksikonManifest = loadOptionalManifest('data/leksikon/manifest.json');
  const sprakManifest = loadOptionalManifest('data/leksikon/sprak/manifest.json');
  const wonderManifest = loadOptionalManifest('data/wonderkammer/index.json');
  const quizManifest = loadOptionalManifest('data/quiz/manifest.json');

  const i18n = {};
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

  const peopleRefs = new Set();
  if (peopleManifest) {
    for (const file of peopleManifest.files) {
      const abs = resolveManifestPath(file, 'data');
      if (!abs || !fs.existsSync(abs)) { addError('missing_manifest_file', `Missing people file ${file}`, { manifest: peopleManifest.path }); continue; }
      const rows = readJson(abs, 'people_file');
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        for (const k of ['place_id', 'placeId']) if (nonEmpty(row?.[k])) peopleRefs.add(String(row[k]).trim());
      }
    }
  }

  const leksikonRefs = new Set();
  if (leksikonManifest) {
    for (const file of leksikonManifest.files) {
      const abs = path.join(ROOT, file);
      if (!fs.existsSync(abs)) { addError('missing_manifest_file', `Missing leksikon file ${file}`, { manifest: leksikonManifest.path }); continue; }
      const rows = readJson(abs, 'leksikon_file');
      if (!Array.isArray(rows)) continue;
      for (const row of rows) if (nonEmpty(row?.place_id)) leksikonRefs.add(String(row.place_id).trim());
    }
  }

  const wonderRefs = new Set();
  if (wonderManifest) {
    for (const file of wonderManifest.files) {
      const abs = path.join(ROOT, file);
      if (!fs.existsSync(abs)) { addError('missing_manifest_file', `Missing wonderkammer file ${file}`, { manifest: wonderManifest.path }); continue; }
      const data = readJson(abs, 'wonderkammer_file');
      extractPlaceIdsFromUnknown(data, wonderRefs);
    }
  }

  for (const ref of peopleRefs) if (!placeIds.has(ref)) addError('invalid_people_place_ref', `People references unknown place id ${ref}`, { id: ref });
  for (const ref of leksikonRefs) if (!placeIds.has(ref)) addError('invalid_leksikon_place_ref', `Leksikon references unknown place id ${ref}`, { id: ref });

  for (const [id, place] of placesById) {
    const missing = [];
    const warnings = [];
    const errors = [];
    const req = ['name','category','lat','lon','r','year','desc','popupDesc','image','cardImage','emne_ids','quiz_profile'];
    for (const field of req) if (place[field] == null || (typeof place[field] === 'string' && !place[field].trim())) missing.push(field);
    if (missing.includes('desc')) warnings.push('missing_desc');
    if (missing.includes('popupDesc')) warnings.push('missing_popupDesc');
    if (missing.includes('image')) warnings.push('missing_image');
    if (missing.includes('cardImage')) warnings.push('missing_cardImage');
    if (missing.includes('emne_ids')) warnings.push('missing_emne_ids');
    if (missing.includes('quiz_profile')) warnings.push('missing_quiz_profile');

    if (!VALID_CATEGORIES.has(String(place.category || '').trim())) errors.push('invalid_category');
    if (!(typeof place.lat === 'number' && Number.isFinite(place.lat) && place.lat >= -90 && place.lat <= 90)) errors.push('invalid_lat');
    if (!(typeof place.lon === 'number' && Number.isFinite(place.lon) && place.lon >= -180 && place.lon <= 180)) errors.push('invalid_lon');

    if (nonEmpty(place.image)) checkAsset(place.image, { id, field: 'image', file: place._file });
    if (nonEmpty(place.cardImage)) checkAsset(place.cardImage, { id, field: 'cardImage', file: place._file });
    if (place.popupImage != null) {
      if (!nonEmpty(place.popupImage)) warnings.push('missing_popupImage');
      else checkAsset(place.popupImage, { id, field: 'popupImage', file: place._file });
    }

    const hasLinks = nonEmpty(place.officialUrl) || nonEmpty(place.wikipedia) || nonEmpty(place.statsUrl) || nonEmpty(place.link);
    if (!hasLinks) warnings.push('missing_links');
    if (!Array.isArray(place.relations) && place.relations != null) warnings.push('invalid_relations_shape');

    if (!peopleRefs.has(id)) warnings.push('missing_people_linkage');
    if (!leksikonRefs.has(id)) warnings.push('missing_leksikon');

    if (sprakManifest && isObj(sprakManifest.data.place_files)) {
      if (!sprakManifest.data.place_files[id]) warnings.push('missing_spraakleksikon');
    } else {
      warnings.push('spraakleksikon_not_configured');
    }

    for (const lang of ['en','pt','es']) {
      if (i18n[lang] === null) warnings.push(`i18n_${lang}_not_configured`);
      else if (!i18n[lang][id]) warnings.push(`missing_i18n_${lang}`);
    }

    if (!wonderRefs.has(id) && !place.wonderkammer) warnings.push('missing_wonderkammer');

    if (place.groundhopper == null) warnings.push('missing_groundhopper');

    for (const w of warnings) { addWarning(w, `${id}: ${w}`, { id, file: place._file }); pushMissing(w, id); }
    for (const e of errors) addError(e, `${id}: ${e}`, { id, file: place._file });

    state.places.push({ id, file: place._file, missing, warnings, errors, coverageScore: Math.max(0, 100 - (warnings.length * 4 + errors.length * 12)) });
  }

  const summary = {
    totalPlaces: state.places.length,
    filesChecked: state.filesChecked.size,
    hardErrors: state.errors.length,
    warnings: state.warnings.length,
    notConfigured: Array.from(state.notConfigured).sort(),
    topMissingPlaces: state.places.slice().sort((a,b)=>(b.warnings.length+b.errors.length)-(a.warnings.length+a.errors.length)).slice(0,20).map(p=>({id:p.id, issues:p.warnings.length+p.errors.length, warnings:p.warnings.length, errors:p.errors.length}))
  };

  const missingByType = Object.fromEntries(Array.from(state.missingByType.entries()).map(([k,v])=>[k, Array.from(new Set(v)).sort()]));

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
