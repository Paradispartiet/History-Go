const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bridgeSource = fs.readFileSync('js/aha.js', 'utf8');
const schema = JSON.parse(fs.readFileSync('AHA/contracts/aha_import_payload_v1.schema.json', 'utf8'));

function makeStorage(seed = {}) {
  const values = new Map(Object.entries(seed).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function validateContract(payload) {
  const errors = [];
  const properties = schema.properties;
  for (const key of schema.required) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) errors.push(`missing:${key}`);
  }
  for (const key of Object.keys(payload)) {
    if (!Object.prototype.hasOwnProperty.call(properties, key)) errors.push(`unknown:${key}`);
  }
  if (payload.schema_version !== properties.schema_version.const) errors.push('schema_version');
  if (payload.contract_version !== properties.contract_version.const) errors.push('contract_version');
  if (payload.source !== properties.source.const) errors.push('source');
  if (Number.isNaN(Date.parse(payload.exported_at))) errors.push('exported_at');
  for (const key of ['hg_knowledge_entries_v2', 'hg_learning_log_v1', 'hg_insights_events_v1', 'notes', 'dialogs']) {
    if (!Array.isArray(payload[key]) || payload[key].some((item) => !item || typeof item !== 'object' || Array.isArray(item))) errors.push(key);
  }
  const visitedPlacesTypes = Array.isArray(properties.visited_places.type)
    ? properties.visited_places.type
    : [properties.visited_places.type];
  const visitedPlacesType = Array.isArray(payload.visited_places) ? 'array' : typeof payload.visited_places;
  if (!visitedPlacesTypes.includes(visitedPlacesType)) errors.push('visited_places');
  const privacy = payload.privacy || {};
  if (privacy.scope !== 'private_user') errors.push('privacy.scope');
  if (privacy.public_sharing !== false) errors.push('privacy.public_sharing');
  if (privacy.model_training_allowed !== false) errors.push('privacy.model_training_allowed');
  return errors;
}

const localStorage = makeStorage({
  hg_knowledge_entries_v2: [{ id: 'knowledge-1', subject_id: 'historie', topic: 'Kildekritikk', text: 'Kontekst er viktig.' }],
  hg_learning_log_v1: [{ type: 'quiz', name: 'Kildequiz' }],
  hg_insights_events_v1: [{ concepts: ['kildekritikk'] }],
  visited_places: ['akershus_festning', 'stortinget'],
  hg_user_notes_v1: [{ title: 'Notat', text: 'Tekst' }],
  hg_person_dialogs_v1: [{ title: 'Dialog', text: 'Tekst' }]
});
const document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  createElement() { return { addEventListener() {}, dataset: {} }; },
  head: { appendChild() {} }
};
const context = {
  console,
  localStorage,
  document,
  location: { href: 'https://paradispartiet.github.io/History-Go/' },
  URL,
  Date,
  JSON,
  Object,
  Array,
  Number,
  String,
  Promise,
  Event: function Event(type) { this.type = type; },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  dispatchEvent() {}
};
context.window = context;
vm.runInNewContext(bridgeSource, context, { filename: 'js/aha.js' });
context.HistoryGoAHAAuth.syncHistoryGoPayload = null;

const payload = JSON.parse(context.exportHistoryGoData());
assert.deepEqual(validateContract(payload), []);
assert.equal(payload.schema_version, 'aha_import_payload_v1');
assert.equal(payload.contract_version, 1);
assert.equal(payload.hg_knowledge_entries_v2.length, 1);
assert.equal(payload.notes.length, 1);
assert.equal(payload.dialogs.length, 1);
assert.deepEqual(Array.from(payload.visited_places), ['akershus_festning', 'stortinget']);
assert.deepEqual(schema.properties.visited_places.type, ['object', 'array']);
assert.equal(payload.privacy.public_sharing, false);
assert.equal(payload.privacy.model_training_allowed, false);
assert.deepEqual(JSON.parse(localStorage.getItem('aha_import_payload_v1')), payload);

const enriched = {
  ...payload,
  user_id: 'user-1',
  profile_id: 'user-1',
  aha_display_name: 'Testbruker',
  auth_source: 'supabase',
  synced_from_historygo_at: '2026-08-13T10:00:00.000Z'
};
assert.deepEqual(validateContract(enriched), [], 'Supabase enrichment must remain inside the same v1 contract');

console.log('aha-import-payload-v1-contract.test.js passed');
