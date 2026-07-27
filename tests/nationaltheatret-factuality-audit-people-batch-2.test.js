const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const profilePath = (file) => path.join(root, 'data', 'people', 'litteratur', 'oslo', 'nationaltheatret', file);
const readProfile = (file) => JSON.parse(fs.readFileSync(profilePath(file), 'utf8'))[0];

const profiles = {
  anders: readProfile('anders_mordal.json'),
  andrine: readProfile('andrine_saether.json'),
  krigsvoll: readProfile('anne_krigsvoll.json'),
  ottersen: readProfile('anne_marie_ottersen.json'),
};

const allText = (person) => JSON.stringify(person).toLowerCase();

test('batch 2 keeps documented education separate from employment and practice', () => {
  assert.deepEqual(profiles.anders.education, ['Statens teaterhøgskole, 1988–1991']);
  assert.deepEqual(profiles.andrine.education, ['Statens Teaterhøgskole, 1992–1995']);
  assert.deepEqual(profiles.krigsvoll.education, ['Statens teaterskole, 1979–1982']);
  assert.deepEqual(profiles.ottersen.education, ['Statens teaterskole, 1966–1970']);

  for (const person of Object.values(profiles)) {
    assert.equal(person.education.length, 1);
    assert.ok(person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((link) => link.type === 'source' && /^https:\/\//.test(link.url)));
  }
});

test('Anders Mordal profile removes generic birthplace and unsupported evaluations', () => {
  assert.equal(Object.hasOwn(profiles.anders, 'birth_place'), false);
  assert.equal(profiles.anders.kindLabel, 'Skuespiller / regissør');
  assert.match(profiles.anders.popupDesc, /fast ansatt ved Nationaltheatret i 1997/);
  assert.doesNotMatch(allText(profiles.anders), /sterkt grep|gjorde ham kjent|ensemblelaboratorier|egen kunstnerisk metode/);
});

test('Andrine Sæther profile keeps leadership as work history, not education', () => {
  assert.match(profiles.andrine.popupDesc, /1998 til 2000[\s\S]*Torshovgruppas kunstneriske ledelse/);
  assert.ok(profiles.andrine.works.some((work) => work.title === 'Lille Eyolf & co'));
  assert.ok(profiles.andrine.works.some((work) => work.title === 'Dødsvariasjonar' && /Den unge kvinna/.test(work.summary)));
  assert.doesNotMatch(allText(profiles.andrine), /særlig viktig|virker foran kamera|lytting, rytme og presisjon/);
});

test('Anne Krigsvoll profile preserves verified Amanda claims and omits disputed Lykkedager prize wording', () => {
  assert.match(profiles.krigsvoll.popupDesc, /Amandapris for begge produksjonene/);
  const lykkedager = profiles.krigsvoll.works.find((work) => work.title === 'Lykkedager');
  assert.ok(lykkedager);
  assert.equal(lykkedager.summary, 'Spilte Winnie i Samuel Becketts skuespill.');
  assert.doesNotMatch(`${lykkedager.summary} ${profiles.krigsvoll.popupDesc}`, /Lykkedager[^.]*Heddapris|Heddapris[^.]*Lykkedager/i);
  assert.doesNotMatch(allText(profiles.krigsvoll), /presis psykologisk observasjon|vilje til å stå i roller|særpreget oppsetning/);
});

test('Anne Marie Ottersen profile documents Jenteloven and direct secondary stages', () => {
  const jenteloven = profiles.ottersen.works.find((work) => work.title === 'Jenteloven');
  assert.ok(jenteloven);
  assert.match(jenteloven.summary, /Spilte Ella/);
  assert.match(jenteloven.summary, /medlem av gruppen/);
  assert.ok(profiles.ottersen.places.includes('oslo_nye_teater_hovedscenen'));
  assert.ok(profiles.ottersen.places.includes('det_norske_teatret'));
  assert.ok(profiles.ottersen.works.some((work) => work.title === 'KLAAR....EN...TOO....KJØØØØR'));
  assert.doesNotMatch(allText(profiles.ottersen), /stort stemmeregister|improvisasjonsevne|sans for både det absurde/);
});

test('batch 2 has a traceable audit report and does not claim global verification', () => {
  const reportPath = path.join(root, 'reports', 'people-factuality-audit-nationaltheatret-batch-2.md');
  const report = fs.readFileSync(reportPath, 'utf8');
  assert.match(report, /påstand-for-påstand-kontrollert 2026-07-27/);
  assert.match(report, /Tidligere History GO-tekst, readiness-score, eksisterende tester/);
  assert.match(report, /Kildene beskriver prisstatusen for `Lykkedager` ulikt/);
  assert.match(report, /foreløpig mistanke.*ble avvist etter kryssjekk/i);
  assert.match(report, /ikke en påstand om at hele History GO-databasen/);
});
