const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'))[0];
const files = {
  amj: 'data/people/litteratur/oslo/nationaltheatret/anne_marit_jacobsen.json',
  avl: 'data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json',
  ar: 'data/people/litteratur/oslo/nationaltheatret/anton_ronneberg.json',
  ab: 'data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json',
};

test('education contains documented education rather than work experience filler', () => {
  assert.deepEqual(read(files.amj).education, ['Statens teaterhøgskole']);
  assert.deepEqual(read(files.avl).education, ['Statens teaterhøgskole']);
  assert.equal(read(files.ar).education.length, 3);
  assert.equal(read(files.ab).education.length, 4);
});

test('corrected factual claims remain locked', () => {
  const amj = read(files.amj);
  const avl = read(files.avl);
  const ar = read(files.ar);
  const ab = read(files.ab);
  assert.match(amj.works.find((work) => work.title === 'Morgon og kveld').summary, /initiativtaker og medvirkende/);
  assert.doesNotMatch(amj.works.find((work) => work.title === 'Morgon og kveld').summary, /dramatiserte/);
  assert.equal(avl.works.some((work) => work.title === 'TanGhost'), false);
  assert.doesNotMatch(avl.popupDesc, /dempet og eksplosiv|psykologisk presisjon/i);
  assert.match(ar.works.find((work) => work.title === 'Kritikk i Aftenposten').summary, /1937–1942.*1951–1972/);
  assert.doesNotMatch(ar.popupDesc, /omstridt/);
  const pugg = ab.works.find((work) => work.title === 'Et spill om pugg');
  assert.match(pugg.summary, /Janken Varden var produksjonens regissør/);
  assert.doesNotMatch(pugg.material, /sceneregi/);
  assert.equal(ab.works.find((work) => work.title === 'Fruen fra havet').year, 1977);
});

test('audited profiles retain inspectable sources, place grounding and image fallback', () => {
  for (const relative of Object.values(files)) {
    const person = read(relative);
    assert.equal(person.placeId, 'nationaltheatret');
    assert.ok(person.places.includes('nationaltheatret'));
    assert.ok(person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((entry) => entry.type === 'source' && entry.url.startsWith('https://') && entry.verifiedAt === '2026-07-27'));
    assert.equal(person.image, '');
    assert.equal(person.cardImage, '');
    assert.equal(person.verifiedAt, '2026-07-27');
  }
});

test('audit report documents corrections, conflicts and rejected completeness incentives', () => {
  const report = fs.readFileSync(path.join(ROOT, 'reports/people-factuality-audit-nationaltheatret-batch-1.md'), 'utf8');
  assert.match(report, /påstand-for-påstand-kontrollert/);
  assert.match(report, /Janken Varden/);
  assert.match(report, /26\. desember 1977/);
  assert.match(report, /Ingen felt er fylt for å beholde tre utdanningspunkter/);
  assert.match(report, /ikke en påstand om at hele History GO-databasen/);
});
