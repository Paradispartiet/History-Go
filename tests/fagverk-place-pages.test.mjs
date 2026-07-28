import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('fagverk-sted.html', 'utf8');
const runtime = fs.readFileSync('js/fagverk-sted.js', 'utf8');
const registry = JSON.parse(fs.readFileSync('data/fagverk/fagverk_registry.json', 'utf8'));

test('stedssiden har en stabil place-parameter og canonical DataHub-lasting', () => {
  assert.match(runtime, /params\.get\('place'\)/);
  assert.match(runtime, /DataHub\.loadFullPlace/);
  assert.match(runtime, /DataHub\.loadPlacesBase/);
  assert.match(page, /js\/dataHub\.js/);
  assert.match(page, /js\/fagverk-sted\.js/);
});

test('stedssiden viser artikkel, linser, spørsmål, fag, begreper og kilder', () => {
  for (const id of [
    'fagverkPlaceArticle',
    'fagverkPlaceLenses',
    'fagverkPlaceQuestions',
    'fagverkPlaceChapters',
    'fagverkPlaceConcepts',
    'fagverkPlaceSources'
  ]) {
    assert.match(page, new RegExp(`id="${id}"`));
  }
});

test('alle steder får fallback-linser og spørsmål uten kuratert registry-post', () => {
  assert.match(runtime, /defaultLenses/);
  assert.match(runtime, /defaultQuestions/);
  assert.equal(registry.placePage.genericForAllCanonicalPlaces, true);
});

test('fagsider peker til stedets egen side', () => {
  const chapterRuntime = fs.readFileSync('js/fagverk.js', 'utf8');
  assert.match(chapterRuntime, /fagverk-sted\.html\?place=/);
  assert.match(chapterRuntime, /Åpne stedets fagverkside/);
});
