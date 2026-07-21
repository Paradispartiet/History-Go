const test = require("node:test");
const assert = require("node:assert/strict");

function createStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

function loadRuntime() {
  global.localStorage = createStorage();
  global.addEventListener = () => {};
  global.dispatchEvent = () => true;
  global.PLACES = [];
  global.PEOPLE = [];
  delete global.DataHub;
  delete global.Emner;
  delete global.HGCourses;
  delete global.HGKnowledgeV2;
  delete global.HGQuizKnowledgeMemory;
  delete global.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__;
  delete global.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__;
  const runtimePath = require.resolve("../dist/web/knowledgeV2.js");
  delete require.cache[runtimePath];
  require(runtimePath);
  return global.HGKnowledgeV2;
}

test("legacy import migrerer til V2 uten å gjeninnføre legacy-lageret", () => {
  const api = loadRuntime();
  assert.equal(api.KEYS.LEGACY, undefined);

  const result = api.importLegacyUniverse({
    historie: {
      historisk: [{
        id: "legacy_contract_test",
        topic: "Historisk bygning",
        text: "Bygningen ble reist som en offentlig institusjon."
      }]
    }
  });

  assert.equal(result.migrated, 1);
  assert.equal(global.localStorage.getItem("knowledge_universe"), null);
  const entries = api.getEntries();
  assert.equal(entries.length, 1);
  assert.match(entries[0].knowledge_unit_id, /^ku_historie_/);
  assert.equal(entries[0].id, entries[0].knowledge_unit_id);

  const projection = api.getLegacyProjection();
  assert.equal(projection.historie.historisk.length, 1);
  assert.equal(projection.historie.historisk[0].knowledge_unit_id, entries[0].knowledge_unit_id);
});
