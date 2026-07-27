const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const readSingleProfile = (relative) => readJson(relative)[0];

const osloPeople = readJson('data/people/by/oslo/people_by_oslo.json');
const profiles = {
  henrik: osloPeople.find((person) => person?.id === 'henrik_bull'),
  bjorn: readSingleProfile('data/people/litteratur/oslo/nationaltheatret/bjorn_bjornson.json'),
  johanne: readSingleProfile('data/people/litteratur/oslo/nationaltheatret/johanne_dybwad.json'),
  halfdan: readSingleProfile('data/people/litteratur/oslo/nationaltheatret/halfdan_christensen.json'),
};

const serialized = (person) => JSON.stringify(person).toLowerCase();

test('batch 4 keeps exactly one canonical Henrik Bull object', () => {
  const matches = osloPeople.filter((person) => person?.id === 'henrik_bull');
  assert.equal(matches.length, 1);
  assert.ok(profiles.henrik);
  assert.equal(profiles.henrik.placeId, 'nationaltheatret');
  assert.equal(profiles.henrik.verifiedAt, '2026-07-27');
});

test('batch 4 preserves documented education without career padding', () => {
  assert.deepEqual(profiles.henrik.education, [
    'Hospitant ved Kristiania tekniske skole og elev ved Den kongelige Tegneskole, 1883–1884',
    'Arkitektutdannelse ved Königlich Technische Hochschule i Berlin, 1884–1887',
    'Studier ved Akademie der Künste i Berlin under Johannes Otzen, 1888',
  ]);
  assert.deepEqual(profiles.bjorn.education, ['Scenisk utdannelse i Wien']);
  assert.deepEqual(profiles.johanne.education, []);
  assert.deepEqual(profiles.halfdan.education, [
    'Middelskoleeksamen ved Aars og Voss skole',
    'Skolegang ved Kristiania Handelsgymnasium',
    'Studiereise til Danmark og Tyskland, 1894',
  ]);

  assert.equal(profiles.bjorn.education.some((entry) => /Sachsen|Christiania Theater/.test(entry)), false);
  assert.equal(profiles.johanne.education.some((entry) => /debut|Christiania Theater|selvstud/i.test(entry)), false);
  assert.equal(profiles.halfdan.education.some((entry) => /debut|Den Nationale Scene/.test(entry)), false);
});

test('Henrik Bull profile handles disputed Historical Museum start year conservatively', () => {
  const museum = profiles.henrik.works.find((work) => work.title === 'Historisk museum');
  assert.ok(museum);
  assert.equal(museum.year, 1902);
  assert.match(museum.summary, /ferdig i 1902/);
  assert.match(museum.summary, /åpnet for publikum i 1904/);
  assert.doesNotMatch(JSON.stringify(museum), /1897[–-]1902|1898[–-]1902/);

  assert.deepEqual(profiles.henrik.places, [
    'nationaltheatret',
    'historisk_museum',
    'regjeringskvartalet',
    'paulus_kirke',
  ]);
  assert.equal(profiles.henrik.places.includes('universitetsplassen'), false);
  assert.equal(profiles.henrik.places.includes('centralbanken_kirkegata'), false);

  const government = profiles.henrik.works.find((work) => /regjeringsbygningen/.test(work.title));
  assert.ok(government);
  assert.equal(government.year, 1906);
  assert.match(government.summary, /Fullførte regjeringsbygningen/);
});

test('Bjørn Bjørnson profile keeps both documented Nationaltheatret chief periods', () => {
  assert.ok(profiles.bjorn.works.some((work) => work.title === 'Nationaltheatrets åpning' && work.year === 1899));
  assert.ok(profiles.bjorn.works.some((work) => work.title === 'Første sjefsperiode ved Nationaltheatret' && work.year === '1899–1907'));
  assert.ok(profiles.bjorn.works.some((work) => work.title === 'Andre sjefsperiode ved Nationaltheatret' && work.year === '1923–1927'));
  assert.match(profiles.bjorn.popupDesc, /innvielsen 1\. september 1899/);
  assert.doesNotMatch(serialized(profiles.bjorn), /norsk teaters gullalder|en hovedkraft/);
});

test('Johanne Dybwad profile uses concrete roles, productions and 1947 dates', () => {
  const medea = profiles.johanne.works.find((work) => work.title === 'Medea');
  const ghosts = profiles.johanne.works.find((work) => work.title === 'Gengangere');
  const barrabas = profiles.johanne.works.find((work) => work.title === 'Barrabas');
  const morAase = profiles.johanne.works.find((work) => work.title === 'Mor Aase i Peer Gynt');

  assert.equal(medea.year, 1918);
  assert.match(medea.material, /skuespillerarbeid og sceneregi/);
  assert.equal(ghosts.year, 1925);
  assert.match(ghosts.summary, /fru Helene Alving/);
  assert.equal(barrabas.year, 1927);
  assert.match(barrabas.summary, /26\. oktober 1927/);
  assert.equal(morAase.year, 1947);
  assert.match(morAase.summary, /7\. november 1947/);
  assert.match(morAase.summary, /8\. desember samme år/);
  assert.doesNotMatch(serialized(profiles.johanne), /akrobatisk teknikk|psykologiske intensiteten/);
});

test('Halfdan Christensen profile corrects Agilulf and restores his second chief period', () => {
  const agilulf = profiles.halfdan.works.find((work) => work.title === 'Agilulf den vise');
  assert.ok(agilulf);
  assert.equal(agilulf.year, 1910);
  assert.match(agilulf.summary, /6\. april 1910/);
  assert.match(agilulf.summary, /regisserte/i);
  assert.match(agilulf.summary, /Guido/);
  assert.doesNotMatch(JSON.stringify(agilulf), /1909/);

  assert.ok(profiles.halfdan.works.some((work) => work.title === 'Første sjefsperiode ved Nationaltheatret' && work.year === '1911–1923'));
  assert.ok(profiles.halfdan.works.some((work) => work.title === 'Andre sjefsperiode ved Nationaltheatret' && work.year === '1930–1933'));
  assert.ok(profiles.halfdan.works.some((work) => work.title === 'Fri Norsk Scene' && work.year === '1944–1945'));
  assert.match(profiles.halfdan.popupDesc, /Den andre perioden var utelatt/);
});

test('batch 4 audit report records source conflict and limits its verification claim', () => {
  const report = fs.readFileSync(
    path.join(root, 'reports', 'people-factuality-audit-nationaltheatret-batch-4.md'),
    'utf8',
  );

  assert.match(report, /påstand-for-påstand-kontrollert 2026-07-27/);
  assert.match(report, /Tidligere History GO-tekst, readiness-score, eksisterende tester/);
  assert.match(report, /Riksantikvaren oppgir `1897–1902`, mens Store norske leksikon oppgir `1898–1902`/);
  assert.match(report, /profilen publiserer derfor bare det felles, sikre ferdigåret `1902`/i);
  assert.match(report, /Stener Lenschow vant konkurransen, mens Henrik Bull fullførte bygningen/);
  assert.match(report, /Ingen profil må ha tre utdanningspunkter/);
  assert.match(report, /Ingen kildekonflikt skal løses ved at en språkmodell/);
  assert.match(report, /ikke en påstand om at hele History GO-databasen/);
});
