#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const modulePath = path.join(ROOT, 'js/Civication/map/CivicationCityMap.js');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

function loadApi() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(modulePath, 'utf8'), { window, console: { warn() {} } }, { filename: modulePath });
  return window.CivicationCityMap;
}

const api = loadApi();
assert.ok(api, 'CivicationCityMap skal eksponeres uten auto-load');
for (const fn of ['load','isLoaded','get','getByCivicationId','all','isGroundhopperPlace','diagnostics','mergeCityMap','indexBuildingTypes','perPlaceMappingFilesFromOverview','normalizeEntry']) {
  assert.strictEqual(typeof api[fn], 'function', `mangler API ${fn}`);
}
assert.strictEqual(api.isLoaded(), false);
assert.strictEqual(api.get('ukjent'), null);

const fixture = (civ, role) => ({ mappings: { ['m_' + civ]: {
  id: 'm_' + civ, historyGoPlaceId: 'samme_sted', civicationPlaceId: civ,
  name: 'Samme sted', category: 'by', lat: 1, lon: 1, emne_ids: [],
  buildingTypeId: 'building_public_office_block', mapRole: role, visibleAs: 'building',
  socialFunctions: [role], phaseTypes: ['day'], groundhopperRelevant: false, needsVerification: false
} } });
const dedupeFixture = api.mergeCityMap({
  mappingFiles: [fixture('civi_first', 'first'), fixture('civi_second', 'second')],
  buildingTypesData: readJson('data/Civication/map/buildingTypes.json')
});
assert.strictEqual(dedupeFixture.entries.length, 1);
assert.deepStrictEqual(Array.from(dedupeFixture.diagnostics.skippedDuplicateHistoryGoPlaceId), ['samme_sted']);
assert.strictEqual(dedupeFixture.byHistoryGoPlaceId.get('samme_sted').civicationPlaceId, 'civi_first');

const overview = readJson('data/Civication/map/historyGoPlaceMapping.json');
const buildingTypesData = readJson('data/Civication/map/buildingTypes.json');
const files = api.perPlaceMappingFilesFromOverview(overview);
assert.ok(files.length >= 20, `forventet mange mappingfiler, fikk ${files.length}`);
const mappingFiles = files.map(readJson);

const occurrences = new Map();
for (let i = 0; i < mappingFiles.length; i += 1) {
  for (const raw of Object.values(mappingFiles[i].mappings || {})) {
    if (!raw?.historyGoPlaceId || !raw?.civicationPlaceId) continue;
    const id = String(raw.historyGoPlaceId);
    const list = occurrences.get(id) || [];
    list.push({ file: files[i], civicationPlaceId: String(raw.civicationPlaceId) });
    occurrences.set(id, list);
  }
}

const expectedAliases = ['akerselva', 'alnaelva', 'nrk_huset_marienlyst', 'nydalen'].sort();
const sourceAliases = Array.from(occurrences.entries())
  .filter(([, list]) => list.length > 1)
  .map(([id]) => id)
  .sort();
assert.deepStrictEqual(sourceAliases, expectedAliases,
  'nye eller bortfalte tverrfaglige historyGoPlaceId-aliaser må vurderes eksplisitt');

const model = api.mergeCityMap({ mappingFiles, buildingTypesData });
assert.strictEqual(model.diagnostics.skippedInvalid, 0, 'ingen ugyldige mappings');
assert.deepStrictEqual(Array.from(model.diagnostics.skippedDuplicateHistoryGoPlaceId).sort(), expectedAliases,
  'runtime-deduplisering skal samsvare med eksplisitt alias-sett');
assert.strictEqual(model.diagnostics.skippedDuplicateCivicationPlaceId.length, 0, 'civicationPlaceId skal være globalt unik');
assert.strictEqual(model.diagnostics.unknownBuildingTypeCount, 0, 'alle buildingTypeId skal være registrert');

for (const id of expectedAliases) {
  const winner = model.byHistoryGoPlaceId.get(id);
  assert.ok(winner, `${id}: canonical runtime-node mangler`);
  assert.strictEqual(winner.civicationPlaceId, occurrences.get(id)[0].civicationPlaceId,
    `${id}: første mapping i overview-rekkefølge skal vinne deterministisk`);
}

// 297 er dagens canonical, dedupliserte kartgrunnlag. En romslig nedre port beskytter
// mot store regresjoner uten å gjøre naturlige små datamigreringer røde.
assert.ok(model.entries.length >= 295, `forventet minst 295 entries, fikk ${model.entries.length}`);
assert.strictEqual(model.entries.length, model.byHistoryGoPlaceId.size);
assert.ok(model.diagnostics.groundhopperCount > 0);

console.log(`civication city map read model ok (${model.entries.length} entries, ${expectedAliases.length} eksplisitte tverrfaglige aliaser)`);