const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const runtime = fs.readFileSync('js/ui/place-learning-surface.js', 'utf8');
const loader = fs.readFileSync('js/ui/place-card-status-surface.js', 'utf8');
const page = fs.readFileSync('fagverk.html', 'utf8');

test('place-card loader requests the learning surface', () => {
  assert.match(loader, /js\/ui\/place-learning-surface\.js/);
  assert.match(loader, /loadPlaceLearningSurface\(\)/);
});

test('relation cards expose whole-card targets and inspectable source links', () => {
  assert.match(runtime, /class=\"hg-relation-card-main\"/);
  assert.match(runtime, /data-person/);
  assert.match(runtime, /data-place/);
  assert.match(runtime, /class=\"hg-rel-source-link\"/);
  assert.match(runtime, /target=\"_blank\"/);
  assert.match(runtime, /rel=\"noopener noreferrer\"/);
});

test('place popup receives Fag og begreper with deep links', () => {
  assert.match(runtime, /Fag og begreper/);
  assert.match(runtime, /fagverk\.html\?/);
  assert.match(runtime, /concept/);
  assert.match(runtime, /emne/);
  assert.match(runtime, /insertAdjacentHTML\('afterend'/);
});

test('fagverk page exposes chapters, concepts, self-check and sources', () => {
  assert.match(page, /id=\"fagverkChapterNav\"/);
  assert.match(page, /id=\"fagverkConceptGrid\"/);
  assert.match(page, /id=\"fagverkSelfCheck\"/);
  assert.match(page, /id=\"fagverkSources\"/);
  assert.match(page, /js\/fagverk\.js/);
});
