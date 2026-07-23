import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const LEGACY_ID = 'alnaelva_hovedsteder';
const CANONICAL_ID = 'alnaelva';
const exclusionsPath = path.join(ROOT, 'data/places/place_exclusions.json');
const mappingPath = path.join(ROOT, 'data/Civication/map/historyGoPlaceMapping.natur_hovedsteder.json');
const leksikonPath = path.join(ROOT, 'data/leksikon/places/oslo/natur/leksikon_oslo_alnaelva_hovedsteder.json');
const canonicalPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_alna/alnaelva.json');
const reportDir = path.join(ROOT, 'reports/alnaelva-duplicate-retirement-20260723');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

fs.mkdirSync(reportDir, { recursive: true });
const canonical = readJson(canonicalPath);
if (canonical.id !== CANONICAL_ID || canonical.coordStatus !== 'verified_geometry') {
  throw new Error('Canonical alnaelva må være verified_geometry før duplikatet kan pensjoneres');
}
if (canonical.sourceObjectId !== 'osm-way:22698275') {
  throw new Error(`Uventet canonical Alna-displaykilde: ${canonical.sourceObjectId}`);
}

const exclusions = readJson(exclusionsPath);
if (!Array.isArray(exclusions.disabledPlaceIds)) throw new Error('place_exclusions.json mangler disabledPlaceIds');
const disabledBefore = [...exclusions.disabledPlaceIds];
if (!exclusions.disabledPlaceIds.includes(LEGACY_ID)) exclusions.disabledPlaceIds.push(LEGACY_ID);
exclusions.reason = 'Hybrid-/akse-/vegg-/undergang-/passasje-objekter og pensjonerte duplikatposter skal ikke være aktive History Go-steder. Kildedata kan beholdes for historikk eller migrering, men ID-ene filtreres ut av aktiv place-index og runtime.';
writeJson(exclusionsPath, exclusions);

const mapping = readJson(mappingPath);
const mappingKey = 'map_alnaelva_hovedsteder';
const legacyMapping = mapping.mappings?.[mappingKey];
if (!legacyMapping) throw new Error(`Mangler Civication-mapping ${mappingKey}`);
const mappingBefore = JSON.parse(JSON.stringify(legacyMapping));
Object.assign(legacyMapping, {
  historyGoPlaceId: CANONICAL_ID,
  historyGoSourceFile: 'places/natur/oslo/places_oslo_alna.json',
  name: canonical.name,
  category: canonical.category,
  lat: canonical.lat,
  lon: canonical.lon,
  emne_ids: Array.isArray(canonical.emne_ids) ? canonical.emne_ids : [],
  needsVerification: false,
});
writeJson(mappingPath, mapping);

const leksikon = readJson(leksikonPath);
if (!Array.isArray(leksikon)) throw new Error('Alna-leksikonfilen må være en array');
let migratedPlaceIds = 0;
const updateText = (value) => {
  if (typeof value === 'string') {
    return value
      .replaceAll('med kilde i Alnsjøen i Lillomarka og utløp i Bjørvika', 'fra Alungsjøen i Lillomarka til dagens utløp ved Kongshavn, med det historiske utløpslandskapet markert ved Vannspeilet i Middelalderparken')
      .replaceAll('strekker seg fra Alnsjøen i Lillomarka, gjennom Groruddalen og indre by, og ned til utløpet i Bjørvika.', 'strekker seg fra Alungsjøen i Lillomarka, gjennom Groruddalen og indre by, til dagens utløp ved Kongshavn. Vannspeilet i Middelalderparken markerer det historiske utløpslandskapet mot Sørenga og Bjørvika.')
      .replaceAll('fra Alnsjøen til Bjørvika', 'fra Alungsjøen til dagens utløp ved Kongshavn')
      .replaceAll('ned til Bjørvika', 'ned til dagens utløp ved Kongshavn')
      .replaceAll('Alnsjøen', 'Alungsjøen');
  }
  if (Array.isArray(value)) return value.map(updateText);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = updateText(child);
    return out;
  }
  return value;
};
const migratedLeksikon = leksikon.map((entry) => {
  const updated = updateText(entry);
  if (updated.place_id === LEGACY_ID) {
    updated.place_id = CANONICAL_ID;
    migratedPlaceIds += 1;
  }
  return updated;
});
if (migratedPlaceIds === 0) throw new Error('Ingen leksikonartikler ble migrert fra legacy place_id');
writeJson(leksikonPath, migratedLeksikon);

let remainingDataReferences = '';
try {
  remainingDataReferences = execFileSync('git', ['grep', '-n', LEGACY_ID, '--', 'data'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
} catch (error) {
  if (error?.status !== 1) throw error;
}
fs.writeFileSync(path.join(reportDir, 'remaining-data-references.txt'), remainingDataReferences);

writeJson(path.join(reportDir, 'result.json'), {
  generatedAt: new Date().toISOString(),
  legacyPlaceId: LEGACY_ID,
  canonicalPlaceId: CANONICAL_ID,
  canonicalCoordinate: {
    lat: canonical.lat,
    lon: canonical.lon,
    coordStatus: canonical.coordStatus,
    sourceObjectId: canonical.sourceObjectId,
  },
  exclusion: {
    alreadyDisabledBefore: disabledBefore.includes(LEGACY_ID),
    disabledNow: exclusions.disabledPlaceIds.includes(LEGACY_ID),
  },
  civicationMapping: {
    mappingKey,
    before: mappingBefore,
    after: legacyMapping,
    stableMappingIdPreserved: mappingBefore.id === legacyMapping.id,
    stableCivicationPlaceIdPreserved: mappingBefore.civicationPlaceId === legacyMapping.civicationPlaceId,
  },
  leksikon: {
    file: path.relative(ROOT, leksikonPath),
    migratedPlaceIdEntries: migratedPlaceIds,
    articleIdsPreserved: true,
  },
  remainingDataReferencesReport: path.relative(ROOT, path.join(reportDir, 'remaining-data-references.txt')),
  method: 'disable duplicate History Go place ID at runtime, repoint active Civication and leksikon references to canonical alnaelva, preserve stable external mapping/article IDs and keep old source/evidence references only as migration history',
});

console.log(JSON.stringify({
  status: 'duplicate_retired',
  legacyPlaceId: LEGACY_ID,
  canonicalPlaceId: CANONICAL_ID,
  migratedLeksikonEntries: migratedPlaceIds,
  civicationMappingHistoryGoPlaceId: legacyMapping.historyGoPlaceId,
  disabledPlaceIdsCount: exclusions.disabledPlaceIds.length,
}, null, 2));
