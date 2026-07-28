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
  assert.match(runtime, /class="hg-relation-card-main"/);
  assert.match(runtime, /data-person/);
  assert.match(runtime, /data-place/);
  assert.match(runtime, /class="hg-rel-source-link"/);
  assert.match(runtime, /target="_blank"/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('alle stedspopuper får inngang til egen fagverkside', () => {
  assert.match(runtime, /fagverk-sted\.html\?place=/);
  assert.match(runtime, /Åpne stedets fagverkside/);
  assert.match(runtime, /Stedet har sin egen fagverkside/);
  assert.match(runtime, /insertAdjacentHTML\('afterend'/);
});

test('registrerte steder får begreper, emner og fagsider i tillegg', () => {
  assert.match(runtime, /Fag og begreper/);
  assert.match(runtime, /fagverk\.html\?/);
  assert.match(runtime, /concept/);
  assert.match(runtime, /emne/);
});

test('fagverk page exposes pedagogical layers and independent place links', () => {
  for (const id of [
    'fagverkDiagnostic',
    'fagverkExamples',
    'fagverkMisconceptions',
    'fagverkConceptGrid',
    'fagverkApplication',
    'fagverkSelfCheck',
    'fagverkCases',
    'fagverkSources'
  ]) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
  assert.match(page, /Stedene har egne fagverksider/);
  assert.match(page, /js\/fagverk\.js/);
});
