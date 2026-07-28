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
      { id: 'p1', places: ['curated', 'fallback', 'empty_curated'] },
      { id: 'p2', placeId: 'curated' },
      { id: 'p3' }
    ],
    PLACES: [
      { id: 'curated', people_ids: ['p2', 'p1', 'p2', 'missing'] },
      { id: 'fallback' },
      { id: 'empty_curated', people_ids: [] }
    ],
    RELATIONS: [
      { placeId: 'curated', personId: 'p3' },
      { placeId: 'fallback', personId: 'p3' },
      { placeId: 'empty_curated', personId: 'p3' }
    ]
  },
  document: {
    addEventListener() {},
    createElement() { return {}; },
    body: { appendChild() {} },
    getElementById() { return null; }
  },
  requestAnimationFrame() {},
  setTimeout,
  clearTimeout
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'popup-utils.js' });
const ids = placeId => Array.from(context.getPeopleForPlace(placeId), person => person.id);

assert.deepStrictEqual(ids('curated'), ['p2', 'p1'], 'explicit people_ids must win, preserve order, dedupe, and ignore missing IDs');
assert.deepStrictEqual(ids('fallback'), ['p3', 'p1'], 'places without people_ids must preserve relation-first legacy fallback');
assert.deepStrictEqual(ids('empty_curated'), [], 'explicit empty people_ids must suppress legacy fallback');
console.log('place people_ids runtime precedence OK');
