import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const html = read('fagverk.html');
const ia = read('js/fagverk-ia-v3.js');
const css = read('css/fagverk-ia-v3.css');
const model = read('js/fagverk-subject-model.js');

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
  }
  assert.match(html, /aria-label="I dette faget"/);
});

test('emnekatalogen viser normaliserte canonicale emner uavhengig av progresjon', () => {
  assert.match(ia, /model\.domains\.map/);
  assert.match(ia, /domain\.emneIds\.map/);
  assert.match(ia, /model\.emnersById\.get/);
  assert.match(ia, /MODEL\.emneUrl/);
  assert.match(ia, /MODEL\.domainUrl/);
  assert.doesNotMatch(ia, /filter\([^\n]*percent/);
  assert.doesNotMatch(ia, /filter\([^\n]*coverage/);
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

test('IA v3 reduserer subject-root sidebar uten å endre dypkoblingssidene', () => {
  assert.match(css, /body\.fagverk-ia-v3-root \.fagverk-sidebar #fagverkSubjectProgress/);
  assert.match(css, /body\.fagverk-ia-v3-root \.fagverk-sidebar #fagverkDomainNav/);
  assert.match(css, /body\.fagverk-ia-v3-root \.fagverk-sidebar #fagverkChapterNav/);
  assert.match(ia, /document\.body\.classList\.add\('fagverk-ia-v3-root'\)/);
});
