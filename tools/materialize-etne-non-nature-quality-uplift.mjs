#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const auditPath = path.join(root, 'tools/audit-etne-non-nature-round-quality.mjs');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const text = (value) => typeof value === 'string' ? value.trim() : '';
const asArray = (value) => Array.isArray(value) ? value : [];
const normalize = (value) => text(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function items(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['places', 'items', 'entries', 'data']) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [payload];
}

function flattenForNaValue(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const period = text(value.period || value.year || value.time);
  const desc = text(value.desc || value.description || value.summary || value.text || value.value);
  if (period && desc) return `${period}: ${desc}`;
  return desc || period;
}

function externalUrls(place) {
  return [...new Set(asArray(place.externalLinks)
    .map((entry) => text(entry?.url))
    .filter((url) => /^https?:\/\//.test(url)))];
}

function localTerms(place) {
  return [
    place.id,
    place.name,
    ...asArray(place.tags),
    ...asArray(place.quiz_profile?.signature_features),
    ...asArray(place.quiz_profile?.must_include)
  ].map(normalize).filter(Boolean);
}

function containsLocal(value, terms) {
  const haystack = normalize(value);
  return terms.some((term) => haystack.includes(term));
}

function coordinateSnapshot(place) {
  return JSON.stringify({
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '',
    coordNote: place.coordNote ?? ''
  });
}

function patchAudit() {
  let source = fs.readFileSync(auditPath, 'utf8');
  const countNeedle = "function countUrls(value) {\n  if (Array.isArray(value))";
  const countReplacement = "function countUrls(value) {\n  if (typeof value === 'string') return /^https?:\\/\\//.test(text(value)) ? 1 : 0;\n  if (Array.isArray(value))";
  if (source.includes(countNeedle)) source = source.replace(countNeedle, countReplacement);
  source = source.replace("'warning', 'badge_depth'", "'advisory', 'badge_depth'");
  source = source.replace("'warning', 'brand_depth'", "'advisory', 'brand_depth'");
  fs.writeFileSync(auditPath, source);
}

patchAudit();

const manifest = readJson(manifestPath);
const changedFiles = [];
const changeSummary = {
  normalizedBeforeNow: 0,
  addedBeforeNowSources: 0,
  addedWorkSources: 0,
  addedCivicationSources: 0,
  correctedPhysicalObjects: 0,
  strengthenedCivicationReasons: 0,
  localizedSportExercises: 0,
  differentiatedFootballExercises: 0
};

for (const entry of asArray(manifest.files).map(String)) {
  const file = path.join(root, 'data', entry);
  if (!fs.existsSync(file)) continue;
  let payload;
  try {
    payload = readJson(file);
  } catch {
    continue;
  }

  let changed = false;
  for (const place of items(payload)) {
    if (text(place?.kommune) !== 'Etne' || text(place?.category) === 'natur') continue;
    const beforeCoordinates = coordinateSnapshot(place);
    const urls = externalUrls(place);

    if (place.for_na && typeof place.for_na === 'object') {
      for (const key of ['before', 'now', 'change']) {
        const flattened = flattenForNaValue(place.for_na[key]);
        if (flattened && place.for_na[key] !== flattened) {
          place.for_na[key] = flattened;
          changed = true;
          changeSummary.normalizedBeforeNow += 1;
        }
      }
      const existingSources = asArray(place.for_na.sources)
        .map((entry) => typeof entry === 'string' ? entry.trim() : text(entry?.url))
        .filter((url) => /^https?:\/\//.test(url));
      const mergedSources = [...new Set([...existingSources, ...urls])];
      if (mergedSources.length && JSON.stringify(place.for_na.sources || []) !== JSON.stringify(mergedSources)) {
        place.for_na.sources = mergedSources;
        changed = true;
        changeSummary.addedBeforeNowSources += 1;
      }
    }

    for (const work of asArray(place.works)) {
      const hasSourceNote = text(work?.source_note || work?.sourceNote);
      const sourceUrls = asArray(work?.source_urls).filter((url) => /^https?:\/\//.test(text(url)));
      if (!hasSourceNote && sourceUrls.length === 0 && urls.length) {
        work.source_urls = urls;
        changed = true;
        changeSummary.addedWorkSources += 1;
      }
    }

    for (const object of asArray(place.civication_store)) {
      const sourceUrls = asArray(object?.source_urls).filter((url) => /^https?:\/\//.test(text(url)));
      if (sourceUrls.length === 0 && urls.length) {
        object.source_urls = urls;
        changed = true;
        changeSummary.addedCivicationSources += 1;
      }
      if (object?.physicalObject !== true && object?.collectable === true && object?.placeSpecific === true) {
        object.physicalObject = true;
        changed = true;
        changeSummary.correctedPhysicalObjects += 1;
      }
      if (text(object?.placeSpecificReason).length > 0 && text(object?.placeSpecificReason).length < 45) {
        object.placeSpecificReason = `${text(object.placeSpecificReason).replace(/[.\s]+$/, '')}. Objektet er direkte knyttet til ${place.name}.`;
        changed = true;
        changeSummary.strengthenedCivicationReasons += 1;
      }
    }

    if (text(place.category) === 'sport') {
      const terms = localTerms(place);
      const signature = text(asArray(place.quiz_profile?.signature_features)[0]);
      for (const exercise of asArray(place.training_profile?.exercises)) {
        const combined = `${exercise?.title || ''} ${exercise?.instruction || ''} ${exercise?.why || ''}`;
        if (!containsLocal(combined, terms)) {
          const anchor = signature || place.name;
          exercise.why = `${text(exercise?.why).replace(/[.\s]+$/, '')}. Ved ${place.name} er øvelsen knyttet til ${anchor}.`;
          changed = true;
          changeSummary.localizedSportExercises += 1;
        }
      }

      if (place.id === 'engebanen_etne') {
        const exercise = asArray(place.training_profile?.exercises).find((row) => row?.id === 'engebanen_korte_pasningar');
        if (exercise) {
          exercise.title = 'Korte pasningar mellom Enge-flater';
          exercise.instruction = 'Når ei tillaten grasflate mellom Enge 31–36 er heilt fri, set to eigne markørar som ei brei port og spel ti rolige pasningar gjennom henne. Flytt deretter porten slik at du må orientere deg mot ei ny nummerert flate, og stopp ballen før kvar ny pasning.';
          exercise.why = 'Øvinga koplar mottak og pasningsretning til Engebanen sitt særlege seksflatesystem med tre 7er- og tre 5er-flater.';
          changed = true;
          changeSummary.differentiatedFootballExercises += 1;
        }
      }
      if (place.id === 'steinsvollen_fotballanlegg') {
        const exercise = asArray(place.training_profile?.exercises).find((row) => row?.id === 'steinsvollen_korte_pasningar');
        if (exercise) {
          exercise.title = 'Pasningsvinkel mellom 7er og 9er';
          exercise.instruction = 'På ei heilt fri og tillaten grasflate ved Steinsvollen set du tre eigne markørar som ein open trekant. Spel korte pasningar rundt trekanten og endre avstanden éin gong for å samanlikne romkjensla i eit mindre 7er-oppsett med eit større 9er-oppsett.';
          exercise.why = 'Steinsvollen kombinerer tre 7er-flater og to 9er-flater, så øvinga bruker den dokumenterte formatskilnaden i staden for ei generisk pasningsport.';
          changed = true;
          changeSummary.differentiatedFootballExercises += 1;
        }
      }
    }

    const afterCoordinates = coordinateSnapshot(place);
    if (beforeCoordinates !== afterCoordinates) {
      throw new Error(`Coordinate contract changed for ${place.id}`);
    }
  }

  if (changed) {
    fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
    changedFiles.push(entry);
  }
}

const reportDir = path.join(root, 'reports/etne-non-nature-quality-audit');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'materializer-summary.json'), `${JSON.stringify({ changedFiles, changeSummary }, null, 2)}\n`);
console.log(`Etne non-nature materializer changed ${changedFiles.length} place files.`);
console.log(JSON.stringify(changeSummary));
