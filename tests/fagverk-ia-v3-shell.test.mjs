import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const html = read('fagverk.html');
const ia = read('js/fagverk-ia-v3.js');
const css = read('css/fagverk-ia-v3.css');
const model = read('js/fagverk-subject-model.js');
const portalHtml = read('fagverk-forside.html');
const portalJs = read('js/fagverk-forside.js');
const portalCss = read('css/fagverk-forside.css');
const learningHtml = read('emner.html');

function functionSource(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  assert.ok(start >= 0, `Mangler ${startToken}`);
  assert.ok(end > start, `Mangler sluttmarkør ${endToken}`);
  return source.slice(start, end);
}

test('Fagverk IA v3 er et tillegg til den canonicale subject/domain/emne/chapter-rutingen', () => {
  assert.match(html, /src="js\/fagverk\.js"[\s\S]*src="js\/fagverk-ia-v3\.js"/);
  assert.doesNotMatch(html, /[?&]view=/);
  assert.doesNotMatch(ia, /params\.get\(['"]view['"]\)/);
  for (const param of ['subject', 'domain', 'emne', 'chapter']) {
    assert.match(ia, new RegExp(`params\\.get\\(['"]${param}['"]\\)`));
  }
  assert.match(ia, /if \(!subjectId \|\| domainId \|\| emneId \|\| chapterId\) return;/);
});

test('subject-roten har fem tydelige hovedinnganger uten å lage fem nye routes', () => {
  for (const id of ['fagverkIaOversikt', 'fagverkIaEmner', 'fagverkIaLaerestoff', 'fagverkIaUtforsk', 'fagverkIaProgresjon']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`href="#${id}"`));
    assert.match(ia, new RegExp(`['"]${id}['"]`));
  }
  assert.match(html, /aria-label="I dette faget"/);
});

test('subject-roten viser én hovedflate om gangen med hash-state og bevarer nested curriculum-ankere', () => {
  assert.match(ia, /section\.hidden = section\.id !== activeViewId/);
  assert.match(ia, /link\.setAttribute\('aria-current', 'page'\)/);
  assert.match(ia, /global\.history\.pushState\(null, '', `#\$\{targetId\}`\)/);
  assert.match(ia, /global\.addEventListener\('hashchange'/);
  assert.match(ia, /target\?\.closest\?\.\('\.fagverk-ia-section'\)/);
  assert.match(ia, /scrollNestedTarget/);
  assert.doesNotMatch(ia, /params\.set\(['"]view['"]/);
});

test('emnekatalogen viser normaliserte canonicale emner uavhengig av progresjon', () => {
  const renderEmner = functionSource(ia, 'function renderEmner(', 'function renderLaerestoff(');
  assert.match(renderEmner, /model\.domains\.map/);
  assert.match(renderEmner, /domain\.emneIds\.map/);
  assert.match(renderEmner, /model\.emnersById\.get/);
  assert.match(renderEmner, /MODEL\.emneUrl/);
  assert.match(renderEmner, /MODEL\.domainUrl/);
  assert.doesNotMatch(renderEmner, /progress\.coverage\.filter/);
  assert.doesNotMatch(renderEmner, /model\.emners\.filter\([^\n]*(?:percent|coverage)/);
  assert.doesNotMatch(renderEmner, /domain\.emneIds\.filter\([^\n]*(?:percent|coverage)/);
});

test('emnekatalogen bruker progressive disclosure per fagområde og åpner treff ved søk', () => {
  const renderEmner = functionSource(ia, 'function renderEmner(', 'function renderLaerestoff(');
  assert.match(renderEmner, /<details class="fagverk-ia-emne-group"/);
  assert.match(renderEmner, /group\.open = true/);
  assert.match(renderEmner, /group\.dataset\.searchOpened = 'true'/);
  assert.match(renderEmner, /delete group\.dataset\.searchOpened/);
  assert.match(css, /\.fagverk-ia-emne-group>summary/);
});

test('lærestoffet bruker eksisterende chapter-ruter og bare source-eid curriculum', () => {
  assert.match(ia, /model\.chapters\.map/);
  assert.match(ia, /MODEL\.chapterUrl/);
  assert.match(ia, /model\.source\.curriculum\?\.status === 'active_curriculum_navigation'/);
  assert.doesNotMatch(ia, /subject\.id === ['"]historie['"]/);
  assert.doesNotMatch(ia, /subject\.id === ['"]politikk['"]/);
});

test('progresjonsflaten gjenbruker read-model og oppretter ingen ny storage', () => {
  assert.match(ia, /MODEL\.readProgress\(model\)/);
  assert.match(model, /function readProgress\(model\)/);
  assert.doesNotMatch(ia, /localStorage\.setItem/);
  assert.doesNotMatch(ia, /sessionStorage\.setItem/);
  assert.doesNotMatch(ia, /indexedDB/);
});

test('Utforsk bruker canonicale stedskoblinger fra den normaliserte modellen', () => {
  assert.match(ia, /model\.places/);
  assert.match(ia, /place\.route/);
  assert.doesNotMatch(ia, /fagverk-sted\.html\?place=.*\+/);
});

test('Career Knowledge Bridge kan ikke åpne en sjette løs subject-root seksjon', () => {
  const renderUtforsk = functionSource(ia, 'function renderUtforsk(', 'function renderProgresjon(');
  assert.match(renderUtforsk, /id="fagverkIaCareerSlot"/);
  assert.match(renderUtforsk, /document\.getElementById\('fagverkCareerUses'\)/);
  assert.match(renderUtforsk, /careerSlot\.appendChild\(careerSection\)/);
  assert.match(html, /id="fagverkCareerUses"/);
});

test('Fagverkforsiden har faget som primær vei og merkesiden kun som compatibility', () => {
  assert.doesNotMatch(portalHtml, /Én inngang · to tydelige veier/);
  assert.doesNotMatch(portalHtml, /href="merker\/merker\.html"/);
  assert.match(portalHtml, /Merke, poeng og nivå er en del av progresjonen i faget/);
  assert.match(portalJs, /text\(item\.subjectStatus\) === 'materialized'/);
  assert.match(portalJs, /class="fagverk-portal-action is-primary"/);
  assert.match(portalJs, /<strong>Åpne faget →<\/strong>/);
  assert.match(portalJs, /class="fagverk-portal-compat"/);
  assert.match(portalJs, /Åpne eksisterende merkevisning/);
  assert.match(portalCss, /\.fagverk-portal-action\.is-primary/);
  assert.match(portalCss, /\.fagverk-portal-compat/);
});

test('emner.html er eksplisitt Min læring og ikke canonical emnekatalog', () => {
  assert.match(learningHtml, /<title>History Go – Min læring<\/title>/);
  assert.match(learningHtml, /<h1>Min læring<\/h1>/);
  assert.match(learningHtml, /personlige, tverrfaglige progresjon/i);
  assert.match(learningHtml, /href="fagverk-forside\.html">Åpne Fagverket/);
  assert.match(learningHtml, /contract\.fagSubjects/);
  assert.match(learningHtml, /computeEmneDekningV2\(concepts, emner, \{ emneHits \}\)/);
  assert.match(learningHtml, /availableSubjects = subjects\.filter\(\(subject\) => coverageBySubject\[subject\.id\]\)/);
  assert.doesNotMatch(learningHtml, /<h1>Dine emner &amp; pensum<\/h1>|<h1>Dine emner & pensum<\/h1>/);
  assert.doesNotMatch(learningHtml, /localStorage\.setItem|sessionStorage\.setItem|indexedDB/);
});

test('IA v3 reduserer subject-root sidebar uten å endre dypkoblingssidene', () => {
  assert.match(css, /body\.fagverk-ia-v3-root \.fagverk-sidebar #fagverkSubjectProgress/);
  assert.match(css, /body\.fagverk-ia-v3-root \.fagverk-sidebar #fagverkDomainNav/);
  assert.match(css, /body\.fagverk-ia-v3-root \.fagverk-sidebar #fagverkChapterNav/);
  assert.match(ia, /document\.body\.classList\.add\('fagverk-ia-v3-root'\)/);
});
