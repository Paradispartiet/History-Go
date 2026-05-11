import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const peoplePath = path.join(root, 'data/people.json');
const worklistPath = path.join(root, 'reports/place-data-worklist.json');
const reportJsonPath = path.join(root, 'reports/people-place-coverage.json');
const reportMdPath = path.join(root, 'reports/people-place-coverage.md');

const priorityRank = { critical: 0, high: 1, medium: 2, low: 3, unknown: 4 };

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function isMissing(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function uniq(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()))];
}

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

function collectPersonPlaceRefs(person) {
  const raw = [];
  for (const key of ['placeId', 'place_id', 'place']) {
    if (typeof person?.[key] === 'string' && person[key].trim()) raw.push(person[key].trim());
  }
  for (const key of ['places', 'placeIds', 'place_ids', 'related_places']) {
    for (const value of safeArray(person?.[key])) {
      if (typeof value === 'string' && value.trim()) raw.push(value.trim());
    }
  }
  return {
    all: raw,
    unique: uniq(raw),
    duplicates: raw.filter((value, index) => raw.indexOf(value) !== index),
  };
}

function loadPlaces() {
  const manifest = readJson(manifestPath);
  const rows = [];

  for (const relPath of manifest.files || []) {
    const filePath = path.join(root, 'data', relPath);
    const sourceFile = path.relative(root, filePath).replace(/\\/g, '/');
    const data = readJson(filePath);
    for (const place of toArray(data)) {
      if (!isMissing(place?.id)) {
        rows.push({
          id: place.id,
          name: place.name || place.id,
          category: place.category || '(mangler category)',
          sourceFile,
        });
      }
    }
  }

  return rows;
}

function loadWorklist() {
  if (!fs.existsSync(worklistPath)) return new Map();
  const data = readJson(worklistPath);
  const rows = Array.isArray(data?.items) ? data.items : [];
  return new Map(rows.map((item) => [item.placeId, item]));
}

function sortPlaceRows(a, b) {
  const aPriority = priorityRank[a.worklistPriority || 'unknown'] ?? priorityRank.unknown;
  const bPriority = priorityRank[b.worklistPriority || 'unknown'] ?? priorityRank.unknown;
  if (aPriority !== bPriority) return aPriority - bPriority;
  if ((a.readyForWonderkammer || false) !== (b.readyForWonderkammer || false)) return a.readyForWonderkammer ? -1 : 1;
  if ((a.readyForSprakleksikon || false) !== (b.readyForSprakleksikon || false)) return a.readyForSprakleksikon ? -1 : 1;
  const category = String(a.category).localeCompare(String(b.category), 'nb');
  if (category !== 0) return category;
  return String(a.placeId).localeCompare(String(b.placeId), 'nb');
}

const generatedAt = new Date().toISOString();
const places = loadPlaces();
const placeById = new Map(places.map((place) => [place.id, place]));
const worklistByPlace = loadWorklist();
const people = toArray(readJson(peoplePath));

const peopleByPlace = new Map();
const peopleRows = [];
const invalidPlaceRefs = [];
const duplicatePlaceRefs = [];
const peopleByTag = new Map();
const peopleByCategoryField = new Map();

for (const person of people) {
  const refs = collectPersonPlaceRefs(person);
  const validPlaces = refs.unique.filter((placeId) => placeById.has(placeId));
  const invalidPlaces = refs.unique.filter((placeId) => !placeById.has(placeId));
  const tags = safeArray(person?.tags).filter((tag) => typeof tag === 'string' && tag.trim());
  const category = typeof person?.category === 'string' && person.category.trim() ? person.category.trim() : '';

  for (const tag of tags) peopleByTag.set(tag, (peopleByTag.get(tag) || 0) + 1);
  if (category) peopleByCategoryField.set(category, (peopleByCategoryField.get(category) || 0) + 1);

  for (const placeId of validPlaces) {
    const row = {
      id: person?.id || '(mangler id)',
      name: person?.name || '(mangler name)',
      tags,
      category: category || null,
      year: person?.year ?? null,
    };
    if (!peopleByPlace.has(placeId)) peopleByPlace.set(placeId, []);
    peopleByPlace.get(placeId).push(row);
  }

  for (const placeId of invalidPlaces) {
    invalidPlaceRefs.push({
      personId: person?.id || '(mangler id)',
      name: person?.name || '(mangler name)',
      placeId,
    });
  }

  for (const placeId of uniq(refs.duplicates)) {
    duplicatePlaceRefs.push({
      personId: person?.id || '(mangler id)',
      name: person?.name || '(mangler name)',
      placeId,
    });
  }

  peopleRows.push({
    id: person?.id || '(mangler id)',
    name: person?.name || '(mangler name)',
    tags,
    category: category || null,
    primaryPlaceId: person?.placeId || person?.place_id || person?.place || null,
    places: refs.unique,
    validPlaces,
    invalidPlaces,
    missing: {
      id: isMissing(person?.id),
      name: isMissing(person?.name),
      desc: isMissing(person?.desc),
      popupDesc: isMissing(person?.popupDesc),
      tags: tags.length === 0,
      placeRefs: refs.unique.length === 0,
      image: isMissing(person?.image),
      cardImage: isMissing(person?.cardImage),
    },
  });
}

const placeRows = places.map((place) => {
  const worklist = worklistByPlace.get(place.id);
  const personRows = peopleByPlace.get(place.id) || [];
  return {
    placeId: place.id,
    name: place.name,
    category: place.category,
    sourceFile: place.sourceFile,
    peopleCount: personRows.length,
    hasPeople: personRows.length > 0,
    worklistPriority: worklist?.priority || null,
    readyForWonderkammer: worklist?.readyForWonderkammer || false,
    readyForSprakleksikon: worklist?.readyForSprakleksikon || false,
    people: personRows.sort((a, b) => String(a.name).localeCompare(String(b.name), 'nb')),
  };
});

const categoriesMap = new Map();
for (const place of placeRows) {
  const key = place.category || '(mangler category)';
  if (!categoriesMap.has(key)) {
    categoriesMap.set(key, {
      category: key,
      placesTotal: 0,
      placesWithPeople: 0,
      placesWithoutPeople: 0,
      peopleLinks: 0,
      uniquePeople: new Set(),
    });
  }
  const row = categoriesMap.get(key);
  row.placesTotal++;
  if (place.hasPeople) row.placesWithPeople++;
  else row.placesWithoutPeople++;
  row.peopleLinks += place.peopleCount;
  for (const person of place.people) row.uniquePeople.add(person.id);
}

const categories = [...categoriesMap.values()]
  .map((row) => ({
    category: row.category,
    placesTotal: row.placesTotal,
    placesWithPeople: row.placesWithPeople,
    placesWithoutPeople: row.placesWithoutPeople,
    peopleLinks: row.peopleLinks,
    uniquePeople: row.uniquePeople.size,
  }))
  .sort((a, b) => String(a.category).localeCompare(String(b.category), 'nb'));

const placesWithPeople = placeRows.filter((row) => row.hasPeople);
const placesWithoutPeople = placeRows.filter((row) => !row.hasPeople).sort(sortPlaceRows);
const topPlacesByPeople = [...placesWithPeople]
  .sort((a, b) => b.peopleCount - a.peopleCount || String(a.placeId).localeCompare(String(b.placeId), 'nb'))
  .slice(0, 50);

const peopleMissingImage = peopleRows.filter((person) => person.missing.image);
const peopleMissingCardImage = peopleRows.filter((person) => person.missing.cardImage);
const peopleMissingPopupDesc = peopleRows.filter((person) => person.missing.popupDesc);
const peopleWithNoValidPlace = peopleRows.filter((person) => person.validPlaces.length === 0);
const peopleWithMultiplePlaces = peopleRows.filter((person) => person.validPlaces.length > 1);

const recommendedNextPlaces = placesWithoutPeople.slice(0, 100).map((place) => ({
  placeId: place.placeId,
  name: place.name,
  category: place.category,
  sourceFile: place.sourceFile,
  worklistPriority: place.worklistPriority,
  readyForWonderkammer: place.readyForWonderkammer,
  readyForSprakleksikon: place.readyForSprakleksikon,
  recommendedNextAction: 'Legg til people knyttet til stedet',
}));

const report = {
  generatedAt,
  totals: {
    places: placeRows.length,
    people: peopleRows.length,
    placesWithPeople: placesWithPeople.length,
    placesWithoutPeople: placesWithoutPeople.length,
    peopleLinks: placeRows.reduce((sum, place) => sum + place.peopleCount, 0),
    peopleWithMultiplePlaces: peopleWithMultiplePlaces.length,
    peopleWithNoValidPlace: peopleWithNoValidPlace.length,
    invalidPlaceRefs: invalidPlaceRefs.length,
    duplicatePlaceRefs: duplicatePlaceRefs.length,
    peopleMissingImage: peopleMissingImage.length,
    peopleMissingCardImage: peopleMissingCardImage.length,
    peopleMissingPopupDesc: peopleMissingPopupDesc.length,
    tagCount: peopleByTag.size,
    categoryFieldCount: peopleByCategoryField.size,
  },
  categories,
  peopleByTag: [...peopleByTag.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || String(a.tag).localeCompare(String(b.tag), 'nb')),
  peopleByCategoryField: [...peopleByCategoryField.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || String(a.category).localeCompare(String(b.category), 'nb')),
  topPlacesByPeople,
  placesWithoutPeople,
  recommendedNextPlaces,
  people: peopleRows.sort((a, b) => String(a.id).localeCompare(String(b.id), 'nb')),
  invalidPlaceRefs,
  duplicatePlaceRefs,
};

function mdEscape(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

let md = '# People-place coverage audit\n\n';
md += `Generert: ${generatedAt}\n\n`;
md += '## Sammendrag\n\n';
md += `- People totalt: **${report.totals.people}**\n`;
md += `- Places totalt: **${report.totals.places}**\n`;
md += `- Places med people: **${report.totals.placesWithPeople}**\n`;
md += `- Places uten people: **${report.totals.placesWithoutPeople}**\n`;
md += `- People-place-lenker: **${report.totals.peopleLinks}**\n`;
md += `- People koblet til flere gyldige steder: **${report.totals.peopleWithMultiplePlaces}**\n`;
md += `- People uten gyldig sted: **${report.totals.peopleWithNoValidPlace}**\n`;
md += `- Ugyldige place-referanser: **${report.totals.invalidPlaceRefs}**\n`;
md += `- Duplikate place-referanser inne på people: **${report.totals.duplicatePlaceRefs}**\n`;
md += `- People uten image: **${report.totals.peopleMissingImage}**\n`;
md += `- People uten cardImage: **${report.totals.peopleMissingCardImage}**\n`;
md += `- People uten popupDesc: **${report.totals.peopleMissingPopupDesc}**\n\n`;

md += '## Dekning per place-kategori\n\n';
md += '| Kategori | Places | Med people | Uten people | People-lenker | Unike people |\n';
md += '|---|---:|---:|---:|---:|---:|\n';
for (const row of categories) {
  md += `| ${mdEscape(row.category)} | ${row.placesTotal} | ${row.placesWithPeople} | ${row.placesWithoutPeople} | ${row.peopleLinks} | ${row.uniquePeople} |\n`;
}
md += '\n';

md += '## People tags\n\n';
for (const row of report.peopleByTag.slice(0, 50)) {
  md += `- ${row.tag}: ${row.count}\n`;
}
md += '\n';

md += '## Steder med flest people\n\n';
for (const place of topPlacesByPeople.slice(0, 25)) {
  md += `- ${place.placeId} (${place.name}) – ${place.peopleCount}\n`;
}
md += '\n';

md += '## Ugyldige place-referanser\n\n';
if (!invalidPlaceRefs.length) md += '- Ingen ugyldige place-referanser funnet.\n\n';
else {
  for (const ref of invalidPlaceRefs.slice(0, 100)) {
    md += `- ${ref.personId} (${ref.name}) -> ${ref.placeId}\n`;
  }
  if (invalidPlaceRefs.length > 100) md += `- ... ${invalidPlaceRefs.length - 100} flere\n`;
  md += '\n';
}

md += '## Duplikate place-referanser inne på people\n\n';
if (!duplicatePlaceRefs.length) md += '- Ingen duplikate place-referanser funnet.\n\n';
else {
  for (const ref of duplicatePlaceRefs.slice(0, 100)) {
    md += `- ${ref.personId} (${ref.name}) -> ${ref.placeId}\n`;
  }
  if (duplicatePlaceRefs.length > 100) md += `- ... ${duplicatePlaceRefs.length - 100} flere\n`;
  md += '\n';
}

md += '## Anbefalt første people-batch\n\n';
md += 'Første 50 steder uten people, sortert etter worklist-prioritet og videre innholdsklarhet.\n\n';
for (const place of recommendedNextPlaces.slice(0, 50)) {
  md += `- ${place.placeId} | ${place.name} | ${place.category} | ${place.worklistPriority || 'unknown'}\n`;
}
md += '\n';

fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(reportMdPath, md, 'utf8');

console.log(`People-place audit complete: ${path.relative(root, reportJsonPath)}`);
console.log(`People-place report complete: ${path.relative(root, reportMdPath)}`);
