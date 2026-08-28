import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const html = read('fagverk.html');
const detail = read('js/fagverk-ia-v3-detail.js');
const css = read('css/fagverk-ia-v3-detail.css');

function functionSource(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  assert.ok(start >= 0, `Mangler ${startToken}`);
  assert.ok(end > start, `Mangler sluttmarkør ${endToken}`);
  return source.slice(start, end);
}

test('detail-IA lastes etter base- og root-rendererne uten å endre canonical routes', () => {
  assert.match(html, /src="js\/fagverk\.js"[\s\S]*src="js\/fagverk-ia-v3\.js"[\s\S]*src="js\/fagverk-ia-v3-detail\.js"/);
  assert.match(html, /href="css\/fagverk-ia-v3-detail\.css"/);
  assert.doesNotMatch(detail, /params\.get\(['"]view['"]\)/);
  for (const param of ['subject', 'domain', 'emne', 'chapter', 'place']) {
    assert.match(detail, new RegExp(`params\\.get\\(['"]${param}['"]\\)`));
  }
});

test('domain, emne og chapter får kontekstuell navigasjon tilbake til subject-rooten', () => {
  assert.match(detail, /id="fagverkIaDetailNav"/);
  assert.match(detail, /fagverkIaOversikt/);
  assert.match(detail, /fagverkIaEmner/);
  assert.match(detail, /fagverkIaLaerestoff/);
  assert.match(detail, /MODEL\.domainUrl/);
  assert.match(detail, /MODEL\.placePageUrl/);
});

test('emnedetaljen viser avledet dekning uten ny storage og prioriterer direkte chapter-binding', () => {
  const source = functionSource(detail, 'function enhanceEmne(', 'function enhanceDomain(');
  assert.match(source, /progress\.coverageById\.get\(emne\.id\)/);
  assert.match(source, /chapter\.emneIds\.includes\(emne\.id\)/);
  assert.match(source, /MODEL\.chapterUrl/);
  assert.match(source, /fagverk-ia-emne-primary-learning/);
  assert.match(source, /beregnet læringsdekning/);
  assert.doesNotMatch(detail, /localStorage\.setItem/);
  assert.doesNotMatch(detail, /sessionStorage\.setItem/);
});

test('chapter viser canonicale emner som sammenfoldbar kontekst, ikke kopiert emneinnhold', () => {
  const source = functionSource(detail, 'function enhanceChapter(', 'async function init(');
  assert.match(source, /chapter\.emneIds\.map/);
  assert.match(source, /model\.emnersById\.get/);
  assert.match(source, /MODEL\.emneUrl/);
  assert.match(source, /<details class="fagverk-ia-chapter-emner"/);
  assert.doesNotMatch(source, /emne\.definition/);
  assert.doesNotMatch(source, /emne\.concepts/);
});

test('detailvisninger skjuler den gamle fulle sidebarinventeringen', () => {
  assert.match(detail, /document\.body\.classList\.add\('fagverk-ia-v3-detail'\)/);
  assert.match(css, /body\.fagverk-ia-v3-detail \.fagverk-sidebar #fagverkSubjectProgress/);
  assert.match(css, /body\.fagverk-ia-v3-detail \.fagverk-sidebar #fagverkDomainNav/);
  assert.match(css, /body\.fagverk-ia-v3-detail \.fagverk-sidebar #fagverkChapterNav/);
  assert.match(css, /@media\(max-width:900px\)/);
});

test('topplinjen bruker IA-v3-rollene for personlig læring og legacy badge', () => {
  assert.match(html, /id="fagverkBadgeLink"[^>]*>Merkevisning<\/a>/);
  assert.match(html, /href="emner\.html">Min læring<\/a>/);
  assert.doesNotMatch(html, />Åpne merket<\/a>/);
  assert.doesNotMatch(html, />Min progresjon<\/a>/);
});
