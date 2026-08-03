const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'js/ui/popup-utils.js'), 'utf8');
const context = {
  console,
  window: {
    PEOPLE: [
      { id: 'p1', places: ['place_a'] },
      { id: 'p2', placeId: 'place_a' },
      { id: 'p3' },
      { id: 'p4', places: ['place_a'], roundHoldbacks: ['place_a'] }
    ],
    PLACES: [{ id: 'place_a', people_ids: ['p2'] }],
    RELATIONS: [{ placeId: 'place_a', personId: 'p3' }]
  },
  document: { addEventListener() {}, createElement() { return {}; }, body: { appendChild() {} }, getElementById() { return null; } },
  requestAnimationFrame() {}, setTimeout, clearTimeout
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'popup-utils.js' });
const ids = Array.from(context.getPeopleForPlace('place_a'), person => person.id);
assert.deepStrictEqual(ids, ['p3', 'p1', 'p2'], 'people_ids must not filter relation/place-derived People');
assert(!ids.includes('p4'), 'an explicit place-scoped round holdback must hide only that preview');
assert(!source.includes('Canonical explicit curation wins'), 'People runtime must not contain the old curation override');
console.log('People popup ignores round-preview curation fields OK');
