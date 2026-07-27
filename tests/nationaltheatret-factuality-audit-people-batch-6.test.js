const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const profilePath = (file) => path.join(ROOT, 'data', 'people', 'litteratur', 'oslo', 'nationaltheatret', file);
const readProfile = (file) => {
  const data = JSON.parse(fs.readFileSync(profilePath(file), 'utf8'));
  assert.equal(Array.isArray(data), true);
  assert.equal(data.length, 1);
  return data[0];
};

const profiles = {
  axel: readProfile('axel_otto_normann.json'),
  bab: readProfile('bab_christensen.json'),
  bente: readProfile('bente_borsum.json'),
  bjarte: readProfile('bjarte_hjelmeland.json'),
};

const serialized = (person) => JSON.stringify(person).toLowerCase();

test('batch 6 materializes four unique canonical profiles without completeness quotas', () => {
  const people = Object.values(profiles);
  assert.deepEqual(
    people.map((person) => person.id).sort(),
    ['axel_otto_normann', 'bab_christensen', 'bente_borsum', 'bjarte_hjelmeland'].sort(),
  );
  assert.equal(new Set(people.map((person) => person.id)).size, 4);

  for (const person of people) {
    assert.equal(person.placeId, 'nationaltheatret');
    assert.equal(person.category, 'litteratur');
    assert.ok(person.desc.trim().length > 0);
    assert.ok(person.popupDesc.split(/\n\s*\n/).length >= 3);
    assert.ok(Array.isArray(person.education));
    assert.ok(Array.isArray(person.materials) && person.materials.length > 0);
    assert.ok(Array.isArray(person.themes) && person.themes.length > 0);
    assert.ok(Array.isArray(person.works) && person.works.length > 0);
    assert.ok(person.works.every((work) => work.id && work.title && work.year && work.material && work.place && work.summary));
    assert.ok(Array.isArray(person.externalLinks) && person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((source) => (
      source.type === 'source'
      && source.url.startsWith('https://')
      && source.verifiedAt === '2026-07-27'
    )));
    assert.ok(Array.isArray(person.places) && person.places.includes('nationaltheatret'));
    assert.equal(person.image, '');
    assert.equal(person.cardImage, '');
    assert.equal(person.verifiedAt, '2026-07-27');
    assert.doesNotMatch(serialized(person), /sterkt nationaltheatret-anker|presist nationaltheatret-anker|tydelig nationaltheatret-anker/);
  }
});

test('education contains only documented education', () => {
  assert.deepEqual(profiles.axel.education, [
    'Examen artium, 1901',
    'Filologistudier ved universitetet i Kristiania uten avsluttende eksamen',
    'Halvt års studieopphold ved Sorbonne i Paris, 1904',
  ]);
  assert.deepEqual(profiles.bab.education, []);
  assert.deepEqual(profiles.bente.education, ['Skuespillerlinjen ved Statens Teaterhøgskole, 1958']);
  assert.deepEqual(profiles.bjarte.education, ['Statens Teaterhøgskole, 1988–1991']);

  assert.doesNotMatch(JSON.stringify(profiles.bab.education), /debut|Nationaltheatret|Den Nationale Scene/);
  assert.doesNotMatch(JSON.stringify(profiles.bjarte.education), /Hærmennene|Nationaltheatret|Torshov/);
});

test('Axel Otto Normann keeps both Nationaltheatret periods and later theatre leadership', () => {
  assert.ok(profiles.axel.works.some((work) => (
    work.title === 'Første sjefsperiode ved Nationaltheatret'
    && work.year === '1935–1941'
  )));
  assert.ok(profiles.axel.works.some((work) => (
    work.title === 'Andre sjefsperiode ved Nationaltheatret'
    && work.year === '1945–1946'
  )));
  assert.ok(profiles.axel.works.some((work) => (
    work.title === 'Det Nye Teater og Oslo Nye Teater'
    && work.year === '1947–1962'
  )));
  assert.match(profiles.axel.popupDesc, /NS-innsatte styret/);
  assert.doesNotMatch(serialized(profiles.axel), /mest fremtredende|kunstnerisk mot|målbevissthet/);
});

test('Bab Christensen keeps career history out of education', () => {
  assert.equal(profiles.bab.education.length, 0);
  assert.match(profiles.bab.popupDesc, /Nationaltheatret 1952–1963/);
  assert.match(profiles.bab.popupDesc, /Fjernsynsteatret 1964–1970/);
  assert.ok(profiles.bab.works.some((work) => work.title === 'Smeltedigelen' && /Abigail Williams/.test(work.summary)));
  assert.ok(profiles.bab.works.some((work) => work.title === 'Ei natt lenger enn livet' && /Carlotta O’Neill/.test(work.summary)));
});

test('Bente Børsum publishes the 1958 and 1959 source conflict', () => {
  const finn = profiles.bente.works.find((work) => work.title === 'Finn veien, engel');
  assert.ok(finn);
  assert.equal(finn.year, 1958);
  assert.match(finn.summary, /4\. desember 1958/);
  assert.match(finn.summary, /SNL daterer.*1959/);
  assert.match(profiles.bente.popupDesc, /datokonflikt/);
  assert.match(profiles.bente.popupDesc, /Tornerose 26\. desember 1958/);
  assert.ok(profiles.bente.works.some((work) => work.title === 'Don Juan' && /Donna Louise/.test(work.summary)));
});

test('Bjarte Hjelmeland keeps the theatre-chief period conflict visible', () => {
  assert.match(profiles.bjarte.desc, /1991 til 2020/);
  assert.ok(profiles.bjarte.works.some((work) => work.title === 'Hærmennene på Helgeland' && work.year === 1991));
  const dns = profiles.bjarte.works.find((work) => work.title === 'Teatersjef ved Den Nationale Scene');
  assert.ok(dns);
  assert.equal(dns.year, '2008–2011');
  assert.match(dns.summary, /januar 2008 til januar 2012/);
  assert.match(profiles.bjarte.popupDesc, /samstemte perioden/);
  assert.ok(profiles.bjarte.works.some((work) => work.title === 'Cyrano' && /24\. november 2018/.test(work.summary)));
});

test('audit report documents sources, conflicts and verification limits', () => {
  const report = fs.readFileSync(
    path.join(ROOT, 'reports', 'people-factuality-audit-nationaltheatret-batch-6.md'),
    'utf8',
  );
  assert.match(report, /påstand-for-påstand-kontrollert 2026-07-27/);
  assert.match(report, /Bab Christensen.*`education` er derfor tom/s);
  assert.match(report, /4\. desember 1958.*1959/s);
  assert.match(report, /januar 2008.*januar 2012/s);
  assert.match(report, /Ingen språkmodell velger en detaljert dato/);
  assert.match(report, /ikke en påstand om at hele History GO-databasen/);
});
