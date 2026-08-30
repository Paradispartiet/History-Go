import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(file)=>fs.readFileSync(path.join(repoRoot,file),'utf8');
const json=(file)=>JSON.parse(read(file));
const exists=(file)=>fs.existsSync(path.join(repoRoot,file));
const clean=(value)=>String(value||'').split('#')[0].split('?')[0];

const contract=json('data/categories/category_contract.json');
const portal=json('data/fagverk/fagverk_portal.json');

test('fagverkforsiden følger canonical fagrekkefølge',()=>{
  assert.deepEqual(portal.categories.map((item)=>item.id),contract.fagSubjects);
});

test('alle merkesidemål finnes',()=>{
  for(const item of portal.categories){
    assert.ok(item.badgePage,`${item.id}: badgePage`);
    assert.ok(exists(clean(item.badgePage)),`${item.id}: ${item.badgePage}`);
  }
});

test('materialiserte fagsider har gyldige mål',()=>{
  const materialized=portal.categories.filter((item)=>item.subjectStatus==='materialized');
  assert.ok(materialized.length>=1);
  for(const item of materialized){
    assert.ok(item.subjectPage,`${item.id}: subjectPage`);
    assert.ok(exists(clean(item.subjectPage)),`${item.id}: ${item.subjectPage}`);
    assert.notEqual(item.subjectPage,item.badgePage,`${item.id}: merke og fag må være forskjellige sider`);
  }
});

test('politikkmerket er integrert i Progresjon og gammel URL er compatibility-only',()=>{
  const politics=portal.categories.find((item)=>item.id==='politikk');
  assert.equal(politics.badgePage,'fagverk.html?subject=politikk#fagverkIaProgresjon');
  assert.equal(politics.subjectPage,'fagverk.html?subject=politikk');
  const badgeHtml=read('data/fag/politikk/merke_politikk.html');
  const subjectHtml=read('fagverk.html');
  assert.match(badgeHtml,/location\.replace/);
  assert.match(badgeHtml,/subject=politikk#fagverkIaProgresjon/);
  assert.doesNotMatch(badgeHtml,/politikk-fagportal\.js|politikkEmneProgress/);
  assert.match(subjectHtml,/id="fagverkBadgeLink"/);
  assert.match(subjectHtml,/Fagverkforsiden/);
  assert.match(subjectHtml,/js\/fagverk-subject-model\.js/);
  assert.doesNotMatch(subjectHtml,/Politikkmerket/);
  assert.doesNotMatch(subjectHtml,/js\/politikk-fag-model\.js/);
});
